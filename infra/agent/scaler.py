"""
Scaler — executes scaling decisions against Docker Compose or Kubernetes.
"""
import subprocess
import time
import config

_last_scale_time = 0.0


def _cooldown_ok() -> bool:
    global _last_scale_time
    return (time.time() - _last_scale_time) >= config.SCALE_COOLDOWN


def get_current_replicas() -> int:
    """Get current backend replica count from Docker Compose."""
    try:
        result = subprocess.run(
            [
                "docker", "compose",
                "-p", config.COMPOSE_PROJECT,
                "ps", "--format", "json", config.BACKEND_SERVICE,
            ],
            capture_output=True, text=True, timeout=10,
        )
        # Each line is one container
        lines = [l for l in result.stdout.strip().split("\n") if l.strip()]
        return max(len(lines), 1)
    except Exception:
        return 1


def scale_compose(target_replicas: int) -> dict:
    """Scale the backend service via docker compose."""
    global _last_scale_time

    if not _cooldown_ok():
        return {"success": False, "reason": "cooldown active", "replicas": get_current_replicas()}

    target = max(config.MIN_REPLICAS, min(config.MAX_REPLICAS, target_replicas))
    current = get_current_replicas()

    if target == current:
        return {"success": True, "reason": "already at target", "replicas": current}

    try:
        result = subprocess.run(
            [
                "docker", "compose",
                "-p", config.COMPOSE_PROJECT,
                "up", "-d", "--scale", f"{config.BACKEND_SERVICE}={target}",
                "--no-recreate",
            ],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode == 0:
            _last_scale_time = time.time()
            return {
                "success": True,
                "reason": f"scaled {current} → {target}",
                "previous": current,
                "replicas": target,
            }
        return {"success": False, "reason": result.stderr[:500], "replicas": current}
    except Exception as e:
        return {"success": False, "reason": str(e), "replicas": current}


def scale_kubernetes(target_replicas: int) -> dict:
    """Scale via kubectl (for K8s deployments)."""
    global _last_scale_time

    if not _cooldown_ok():
        return {"success": False, "reason": "cooldown active"}

    target = max(config.MIN_REPLICAS, min(config.MAX_REPLICAS, target_replicas))

    try:
        result = subprocess.run(
            [
                "kubectl", "scale", "deployment",
                config.K8S_DEPLOYMENT,
                f"--replicas={target}",
                f"--namespace={config.K8S_NAMESPACE}",
            ],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0:
            _last_scale_time = time.time()
            return {"success": True, "reason": f"scaled to {target}", "replicas": target}
        return {"success": False, "reason": result.stderr[:500]}
    except Exception as e:
        return {"success": False, "reason": str(e)}


def execute_scaling(target_replicas: int) -> dict:
    """Route to the right scaler based on config."""
    if config.DOCKER_MODE == "kubernetes":
        return scale_kubernetes(target_replicas)
    return scale_compose(target_replicas)
