"""
LangGraph AI-Driven Container Scheduling Agent.

Graph flow:
  collect_metrics → analyze → llm_decide → [should_act?] → execute → report
                                               ↓ no
                                             report
"""
from typing import TypedDict, Literal
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

import config
from metrics import collect_all_metrics
from scaler import execute_scaling, get_current_replicas


# ── State ──
class ScalerState(TypedDict):
    metrics: dict
    metrics_history: list            # rolling window
    current_replicas: int
    decision: str                    # scale_up | scale_down | no_action
    target_replicas: int
    reason: str                      # LLM reasoning
    action_result: dict
    timestamp: str


# ── LLM ──
llm = ChatGroq(
    api_key=config.GROQ_API_KEY,
    model=config.GROQ_MODEL,
    temperature=0,
    max_tokens=512,
)


# ── Graph Nodes ──

def collect_metrics_node(state: ScalerState) -> ScalerState:
    """Gather Docker + app + host metrics."""
    m = collect_all_metrics()
    current = get_current_replicas()

    history = list(state.get("metrics_history") or [])
    history.append(m)
    if len(history) > 20:
        history = history[-20:]

    return {
        **state,
        "metrics": m,
        "metrics_history": history,
        "current_replicas": current,
        "timestamp": datetime.utcnow().isoformat(),
    }


def analyze_node(state: ScalerState) -> ScalerState:
    """Nothing to transform — we pass raw metrics to the LLM.
    This node exists for extensibility (add anomaly detection etc.)."""
    return state


def llm_decide_node(state: ScalerState) -> ScalerState:
    """Ask the LLM to analyze metrics and decide on scaling."""
    m = state["metrics"]
    docker_info = m.get("docker", {})
    host_info = m.get("host", {})
    app_info = m.get("app_health", {})
    agg = docker_info.get("aggregate", {})
    replicas = state["current_replicas"]

    # Build a context summary for the LLM
    recent_cpus = []
    for h in (state.get("metrics_history") or [])[-5:]:
        a = h.get("docker", {}).get("aggregate", {})
        recent_cpus.append(a.get("avg_cpu_percent", 0))

    prompt = f"""You are an intelligent container scheduling agent for the VaquaH application.
Analyze the metrics below and decide whether to scale the backend service.

CURRENT STATE:
- Backend replicas: {replicas} (min: {config.MIN_REPLICAS}, max: {config.MAX_REPLICAS})
- Avg CPU across replicas: {agg.get('avg_cpu_percent', 'N/A')}%
- Max CPU any replica: {agg.get('max_cpu_percent', 'N/A')}%
- Avg Memory across replicas: {agg.get('avg_memory_percent', 'N/A')}%
- Max Memory any replica: {agg.get('max_memory_percent', 'N/A')}%
- Recent CPU trend (last 5 checks): {recent_cpus}
- Host CPU: {host_info.get('host_cpu_percent', 'N/A')}%
- Host Memory: {host_info.get('host_memory_percent', 'N/A')}%
- Host Disk: {host_info.get('host_disk_percent', 'N/A')}%
- Host Load Avg 1m: {host_info.get('load_avg_1m', 'N/A')}
- App health status: {app_info.get('status', 'unknown')}
- Firestore latency: {app_info.get('services', {}).get('firestore', {}).get('latencyMs', 'N/A')}ms

SCALING GUIDELINES:
- Scale UP when avg CPU > {config.CPU_SCALE_UP}% sustained, or memory > {config.MEMORY_SCALE_UP}%, or latency > {config.LATENCY_SCALE_UP}ms
- Scale DOWN when avg CPU < {config.CPU_SCALE_DOWN}% sustained for 3+ checks AND replicas > {config.MIN_REPLICAS}
- Consider host resources — don't scale up if host CPU > 90% or host memory > 90%
- Prefer conservative decisions — avoid oscillating

Respond with EXACTLY this JSON format (no markdown, no extra text):
{{"decision": "scale_up" | "scale_down" | "no_action", "target_replicas": <int>, "reason": "<one sentence>"}}
"""

    try:
        response = llm.invoke([
            SystemMessage(content="You are a Kubernetes/Docker scaling agent. Respond only with valid JSON."),
            HumanMessage(content=prompt),
        ])

        import json
        text = response.content.strip()
        # Handle markdown code block wrapping
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(text)
        decision = result.get("decision", "no_action")
        target = result.get("target_replicas", replicas)
        reason = result.get("reason", "No reason provided")

        # Safety clamp
        target = max(config.MIN_REPLICAS, min(config.MAX_REPLICAS, target))

        return {
            **state,
            "decision": decision,
            "target_replicas": target,
            "reason": reason,
        }
    except Exception as e:
        return {
            **state,
            "decision": "no_action",
            "target_replicas": replicas,
            "reason": f"LLM error: {str(e)[:200]}",
        }


def execute_node(state: ScalerState) -> ScalerState:
    """Execute the scaling decision."""
    result = execute_scaling(state["target_replicas"])
    return {**state, "action_result": result}


def report_node(state: ScalerState) -> ScalerState:
    """Log the decision. In the future: Slack/Discord webhook, etc."""
    decision = state.get("decision", "no_action")
    reason = state.get("reason", "")
    action = state.get("action_result", {})
    ts = state.get("timestamp", "")

    icon = {"scale_up": "⬆️", "scale_down": "⬇️", "no_action": "➖"}.get(decision, "❓")
    print(f"[{ts}] {icon} {decision} | replicas={state.get('current_replicas')}→{state.get('target_replicas')} | {reason}")

    if action and action.get("success") is False:
        print(f"  ⚠️  Action failed: {action.get('reason', '')}")

    return state


# ── Conditional Edge ──

def should_execute(state: ScalerState) -> Literal["execute", "report"]:
    if state.get("decision") in ("scale_up", "scale_down"):
        return "execute"
    return "report"


# ── Build Graph ──

def build_scaler_graph():
    builder = StateGraph(ScalerState)

    builder.add_node("collect_metrics", collect_metrics_node)
    builder.add_node("analyze", analyze_node)
    builder.add_node("decide", llm_decide_node)
    builder.add_node("execute", execute_node)
    builder.add_node("report", report_node)

    builder.set_entry_point("collect_metrics")
    builder.add_edge("collect_metrics", "analyze")
    builder.add_edge("analyze", "decide")
    builder.add_conditional_edges("decide", should_execute)
    builder.add_edge("execute", "report")
    builder.add_edge("report", END)

    return builder.compile()


# Singleton
scaler_graph = build_scaler_graph()
