"""
VaquaH AI Container Scheduling Agent
────────────────────────────────────
Runs a LangGraph-powered loop that monitors Docker containers,
uses an LLM to decide scaling actions, and executes them.

Also exposes a small REST API for monitoring / manual control.
"""
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

import config
from graph import scaler_graph, ScalerState
from scaler import execute_scaling, get_current_replicas
from metrics import collect_all_metrics


# ── Shared state ──
decision_log: list[dict] = []  # rolling log of last 100 decisions
agent_running = False


async def run_scaling_loop():
    """Background loop: invoke the LangGraph every CHECK_INTERVAL seconds."""
    global agent_running
    agent_running = True
    state: ScalerState = {
        "metrics": {},
        "metrics_history": [],
        "current_replicas": 1,
        "decision": "no_action",
        "target_replicas": 1,
        "reason": "",
        "action_result": {},
        "timestamp": "",
    }

    while agent_running:
        try:
            result = scaler_graph.invoke(state)
            # Persist rolling history across invocations
            state["metrics_history"] = result.get("metrics_history", [])

            entry = {
                "timestamp": result.get("timestamp"),
                "decision": result.get("decision"),
                "target_replicas": result.get("target_replicas"),
                "current_replicas": result.get("current_replicas"),
                "reason": result.get("reason"),
                "action_result": result.get("action_result"),
                "metrics_summary": result.get("metrics", {}).get("docker", {}).get("aggregate"),
            }
            decision_log.append(entry)
            if len(decision_log) > 100:
                decision_log.pop(0)
        except Exception as e:
            print(f"[Agent] Error in scaling loop: {e}")

        await asyncio.sleep(config.CHECK_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the background scaling loop on startup."""
    task = asyncio.create_task(run_scaling_loop())
    print(f"🤖 AI Scaler Agent started (interval={config.CHECK_INTERVAL}s, mode={config.DOCKER_MODE})")
    yield
    global agent_running
    agent_running = False
    task.cancel()


app = FastAPI(
    title="VaquaH AI Scaler Agent",
    version="1.0.0",
    lifespan=lifespan,
)


# ── API Models ──

class ScaleRequest(BaseModel):
    target_replicas: int


class AgentStatus(BaseModel):
    running: bool
    mode: str
    current_replicas: int
    min_replicas: int
    max_replicas: int
    check_interval: int
    last_decision: Optional[dict]
    total_decisions: int


# ── Endpoints ──

@app.get("/health")
def health():
    return {"status": "healthy", "agent_running": agent_running, "timestamp": datetime.utcnow().isoformat()}


@app.get("/status", response_model=AgentStatus)
def status():
    return AgentStatus(
        running=agent_running,
        mode=config.DOCKER_MODE,
        current_replicas=get_current_replicas(),
        min_replicas=config.MIN_REPLICAS,
        max_replicas=config.MAX_REPLICAS,
        check_interval=config.CHECK_INTERVAL,
        last_decision=decision_log[-1] if decision_log else None,
        total_decisions=len(decision_log),
    )


@app.get("/decisions")
def get_decisions(limit: int = 20):
    return {"decisions": decision_log[-limit:]}


@app.get("/metrics")
def get_metrics():
    return collect_all_metrics()


@app.post("/scale")
def manual_scale(req: ScaleRequest):
    """Manual override — scale to a specific replica count."""
    result = execute_scaling(req.target_replicas)
    return {"requested": req.target_replicas, "result": result}


@app.get("/graph")
def get_graph_info():
    """Return the LangGraph node/edge structure."""
    return {
        "nodes": ["collect_metrics", "analyze", "decide", "execute", "report"],
        "edges": [
            {"from": "collect_metrics", "to": "analyze"},
            {"from": "analyze", "to": "decide"},
            {"from": "decide", "to": "execute", "condition": "scale_up or scale_down"},
            {"from": "decide", "to": "report", "condition": "no_action"},
            {"from": "execute", "to": "report"},
        ],
        "config": {
            "min_replicas": config.MIN_REPLICAS,
            "max_replicas": config.MAX_REPLICAS,
            "cpu_scale_up_threshold": config.CPU_SCALE_UP,
            "cpu_scale_down_threshold": config.CPU_SCALE_DOWN,
            "memory_scale_up_threshold": config.MEMORY_SCALE_UP,
            "cooldown_seconds": config.SCALE_COOLDOWN,
        },
    }
