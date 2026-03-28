import os

# ── Scaling Bounds ──
MIN_REPLICAS = int(os.getenv("MIN_REPLICAS", "1"))
MAX_REPLICAS = int(os.getenv("MAX_REPLICAS", "4"))
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "30"))  # seconds

# ── Docker / K8s ──
DOCKER_MODE = os.getenv("DOCKER_MODE", "compose")  # "compose" or "kubernetes"
COMPOSE_PROJECT = os.getenv("COMPOSE_PROJECT", "vaquah-main")
BACKEND_SERVICE = os.getenv("BACKEND_SERVICE", "backend")
BACKEND_HEALTH_URL = os.getenv("BACKEND_HEALTH_URL", "http://backend:5001/api/health/detailed")

# K8s specifics (only used when DOCKER_MODE=kubernetes)
K8S_NAMESPACE = os.getenv("K8S_NAMESPACE", "vaquah")
K8S_DEPLOYMENT = os.getenv("K8S_DEPLOYMENT", "vaquah-backend")

# ── LLM ──
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# ── Thresholds (used as hints for the LLM) ──
CPU_SCALE_UP = float(os.getenv("CPU_SCALE_UP", "70"))     # percent
CPU_SCALE_DOWN = float(os.getenv("CPU_SCALE_DOWN", "20"))  # percent
MEMORY_SCALE_UP = float(os.getenv("MEMORY_SCALE_UP", "80"))
LATENCY_SCALE_UP = float(os.getenv("LATENCY_SCALE_UP", "2000"))  # ms

# ── Cooldown ──
SCALE_COOLDOWN = int(os.getenv("SCALE_COOLDOWN", "120"))  # seconds between scaling actions
