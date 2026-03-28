"""
Metrics collector — gathers container stats from Docker API
and application health from the backend health endpoint.
"""
import docker
import httpx
import psutil
import time
import config


def get_docker_client():
    try:
        return docker.from_env()
    except Exception:
        return None


def collect_container_metrics() -> dict:
    """Collect CPU/memory metrics from all backend containers via Docker API."""
    client = get_docker_client()
    if not client:
        return {"error": "Docker not available", "containers": []}

    containers = []
    try:
        service_filter = {"label": f"com.docker.compose.service={config.BACKEND_SERVICE}"}
        running = client.containers.list(filters=service_filter)

        for c in running:
            stats = c.stats(stream=False)

            # CPU percentage calculation
            cpu_delta = (
                stats["cpu_stats"]["cpu_usage"]["total_usage"]
                - stats["precpu_stats"]["cpu_usage"]["total_usage"]
            )
            system_delta = (
                stats["cpu_stats"]["system_cpu_usage"]
                - stats["precpu_stats"]["system_cpu_usage"]
            )
            num_cpus = stats["cpu_stats"].get("online_cpus", 1)
            cpu_pct = (cpu_delta / system_delta) * num_cpus * 100.0 if system_delta > 0 else 0.0

            # Memory
            mem_usage = stats["memory_stats"].get("usage", 0)
            mem_limit = stats["memory_stats"].get("limit", 1)
            mem_pct = (mem_usage / mem_limit) * 100.0

            containers.append({
                "id": c.short_id,
                "name": c.name,
                "status": c.status,
                "cpu_percent": round(cpu_pct, 2),
                "memory_usage_mb": round(mem_usage / (1024 * 1024), 1),
                "memory_limit_mb": round(mem_limit / (1024 * 1024), 1),
                "memory_percent": round(mem_pct, 2),
            })
    except Exception as e:
        return {"error": str(e), "containers": []}

    # Aggregate
    if containers:
        avg_cpu = sum(c["cpu_percent"] for c in containers) / len(containers)
        avg_mem = sum(c["memory_percent"] for c in containers) / len(containers)
        max_cpu = max(c["cpu_percent"] for c in containers)
        max_mem = max(c["memory_percent"] for c in containers)
    else:
        avg_cpu = avg_mem = max_cpu = max_mem = 0.0

    return {
        "replica_count": len(containers),
        "containers": containers,
        "aggregate": {
            "avg_cpu_percent": round(avg_cpu, 2),
            "avg_memory_percent": round(avg_mem, 2),
            "max_cpu_percent": round(max_cpu, 2),
            "max_memory_percent": round(max_mem, 2),
        },
    }


def collect_app_health() -> dict:
    """Poll the backend's /api/health/detailed endpoint."""
    try:
        r = httpx.get(config.BACKEND_HEALTH_URL, timeout=5.0)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def collect_host_metrics() -> dict:
    """Host-level metrics (the VPS itself)."""
    return {
        "host_cpu_percent": psutil.cpu_percent(interval=0.5),
        "host_memory_percent": psutil.virtual_memory().percent,
        "host_disk_percent": psutil.disk_usage("/").percent,
        "load_avg_1m": round(psutil.getloadavg()[0], 2),
    }


def collect_all_metrics() -> dict:
    """Single call to gather everything the agent needs."""
    return {
        "timestamp": time.time(),
        "docker": collect_container_metrics(),
        "app_health": collect_app_health(),
        "host": collect_host_metrics(),
    }
