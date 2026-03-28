# VaquaH Updates Log

## v3.0.0 - AI & Infrastructure Overhaul (Current)
**Released: June 2025**

### 🤖 Groq RAG Chatbot (Replaced Google Generative AI)
- **LLM Migration**: Replaced Google Generative AI with **Groq `llama-3.3-70b-versatile`** for faster, free-tier inference.
- **Local Embeddings**: Added `@xenova/transformers` with `all-MiniLM-L6-v2` model for 384-dimensional vector embeddings — runs entirely on the server, no external API calls.
- **Vector Store**: Built an in-memory vector store with cosine similarity search, 512-char chunking with 50-char overlap, returning top-5 relevant context per query.
- **Async RAG Pipeline**: `retrieveContext()` is now async with real semantic search instead of dumping all context into the prompt.

### 🎙️ Voice Services (TTS & STT)
- **Text-to-Speech**: Server-side TTS using `msedge-tts` with `en-IN-NeerjaNeural` voice — returns audio buffer over API, with browser `speechSynthesis` fallback.
- **Speech-to-Text**: Groq Whisper `whisper-large-v3-turbo` for server-side transcription via file upload.
- **Voice Routes**: New `/api/voice/tts`, `/api/voice/stt`, `/api/voice/voices` endpoints.
- **Frontend Integration**: AssistantOverlay now supports mic input, mute toggle, transcript display, and auto-speaks chatbot responses.

### 🏥 Health Monitoring
- **Health Monitor Service**: Automated 60-second checks collecting CPU usage, memory stats, uptime, and Firestore connectivity.
- **Rolling History**: Maintains 60-entry check history in memory for trend analysis.
- **REST API**: `/api/health/status` (quick), `/api/health/detailed` (full metrics), `/api/health/history` (trend data).

### 🐳 Docker & Kubernetes Infrastructure
- **Multi-Stage Dockerfiles**: Frontend (Vite build → Nginx 1.27 alpine), Backend (Node 18 alpine with pre-cached embedding model + healthcheck), AI Agent (Python 3.11 slim).
- **Docker Compose**: Full orchestration — Nginx reverse proxy with `least_conn` load balancing, backend with 2 replicas, AI scaler agent with Docker socket access.
- **Nginx Configuration**: SPA fallback routing, gzip compression, 30-day static asset caching, reverse proxy for API/agent routes.
- **Kubernetes Manifests**: Namespace, ConfigMap, Deployments (backend 2 replicas, frontend, agent), ClusterIP + NodePort services, HPA (CPU 70%, Memory 80%), RBAC (ServiceAccount, Role, RoleBinding).

### 🧠 AI-Driven Autoscaler Agent
- **LangGraph Workflow**: StateGraph with 5 nodes — collect_metrics → analyze → llm_decide (Groq) → conditional execute → report.
- **Metrics Collection**: Docker container stats, app health endpoints, host CPU/memory via psutil.
- **Intelligent Scaling**: Groq LLM analyzes metrics and decides scale up/down/none with reasoning.
- **Cooldown Protection**: 120-second cooldown between scaling events to prevent oscillation.
- **REST Dashboard**: `/agent/status`, `/agent/decisions`, `/agent/metrics`, `/agent/scale` (manual), `/agent/graph` (workflow visualization).
- **Background Loop**: Runs every 30 seconds, collecting metrics and making autonomous scaling decisions.

### 🐛 Bug Fixes
- **Chatbot API URL**: Fixed hardcoded `localhost` in `Chatbot.jsx` — now uses `api.post('/chat')` with configured base URL.
- **CartContext Duplicate**: Removed duplicate payment method localStorage block in `CartContext.jsx`.
- **AdminRoute Guard**: Fixed `AdminRoute` to properly check `user.isAdmin` before granting access.
- **Suspense Fallback**: Added proper loading fallback to `Suspense` wrapper in `App.jsx`.
- **Firebase Config Validation**: Added environment variable validation in `firebase.js` to catch missing config early.
- **Token Refresh**: Implemented 55-minute automatic Firebase Auth token refresh in `AuthContext.jsx` to prevent session expiry.

---

## v2.0.2 - Performance & Stability Update
**Released: February 23, 2026**

### ⚡ Performance & Optimizations
- **Frontend Optimization**: Excluded heavy Machine Learning WebAssembly files from Vite's `optimizeDeps`, preventing extreme memory spikes (190MB/s) and reducing local startup time to ~200ms.
- **Backend Stability**: Fixed critical dependency corruptions (`natural`, `node-cron`) ensuring 100% server uptime and instant boot times.

### 🐛 Bug Fixes
- **Port Conflicts**: Implemented stricter port management for the backend and frontend development servers to prevent ghost processes.
- **MediaPipe CommonJS Crash**: Fixed a `Hands is not a constructor` runtime error by migrating away from the NPM package to dynamic CDN script injection through the `window` object.
- **Tailwind ESM Crash**: Fixed a silent frontend crash caused by an invalid `require()` call in `tailwind.config.js` by migrating the config to standard ES Module `import` syntax.

---

## v2.0.1 - The "Hands-Free" Update
**Released: February 16, 2026**

### 🧠 Innovation: Voice & Gesture Control
- **Voice Assistant**: Say "VaquaH" to wake up the assistant. Navigate pages ("Go to Cart"), scroll, or ask questions hands-free.
- **Gesture Navigation**: Control the interface using hand gestures via webcam.
    - **Virtual Cursor**: Index finger tracking.
    - **Pinch-to-Click**: Select items without a mouse.
    - **Swipe Navigation**: Fist swipe left/right to navigate back or forward.
    - **Scroll Control**: Use 2 fingers to scroll up, 3 fingers to scroll down.
- **Privacy First**: Camera and Microphone are only active when explicitly enabled. Processing is done locally (gestures) or securely (voice).

### ⚡ Refactors & Improvements
- **Unified Services Interface**: Refactored `Services.jsx` and `AppointmentNew.jsx` to use a shared `ServiceListing` component.
    - Ensures identical design and booking data across the entire site.
- **Performance**: Implemented Lazy Loading for AI models (MediaPipe) to keep initial load times fast.

### 🐛 Bug Fixes
- **Syntax Errors**: Resolved build-breaking syntax errors in `AppointmentNew.jsx`.

---

## v1.3.1 - Experience & Stability Improvements
**Released: January 1, 2026**

### 📐 UI/UX Improvements
- **Banner Optimization**: Updated the main Hero Banner to better direct users to products.
    - Changed "Book Service" call-to-action on product-focused slides to "View Products".
    - Redirects users directly to the products catalog for a seamless shopping experience.

### 🐛 Bug Fixes
- **Product Filter Stability**: Fixed a crash on the Products page that occurred when a filter selection (e.g., Tonnage) returned no results.
    - Added missing component imports to correctly display the "Coming Soon" styling.
- **Review Visibility**: Corrected an issue where review stars were displaying for "Pending" appointments and "Processing" orders.
    - Stars are now strictly hidden until the service is completed or the order is delivered to prevent confusion.

---

## v1.3.0 - UI Standardization & Service Enhancements
**Released: December 25, 2025**

### 🚀 New Features
- **Service Detail Page**: Added a dedicated page (`/services/:id`) for each service, featuring:
    - Detailed descriptions, features list, and verified guarantees.
    - Integrated "Book Now" dialog with visiting charge payment.
    - Customer reviews specific to the service.
- **Unified Review Design**: Introduced a standardized `ReviewCard` component.
    - Consistent look for customer testimonials on Home, Product, and Service pages.
    - Displays user avatar, verified badge, simple star rating, and relative/formatted timestamps.
- **Cart Redirection**: Clicking a service in the cart now correctly redirects to the new Service Detail page instead of a broken product link.

### 🧹 UI/UX Improvements
- **Empty States**: "No reviews yet" sections are now hidden to keep the UI clean.
- **Timestamps**: Added date and time to all customer reviews for better context.
- **Service Cards**: Updated Service Cards on the booking page to match the "Green Badge" rating style of Product Cards.

### 🐛 Bug Fixes
- **Service Review Aggregation**: Fixed a critical issue where reviews submitted via the Dashboard were not updating the Service's average rating.
    - Added logic to link reviews to Service IDs.
    - Implemented a "Legacy Support" mapper to ensure past appointments can still be rated correctly.
- **Product Detail Crash**: Fixed a crash caused by a missing review fetching function (`getProductReviews`).

---

## v1.2.0 - Core Functionality
- Initial release of Booking System.
- Dashboard with Order and Appointment history.
- Cart and Checkout flow integration.
