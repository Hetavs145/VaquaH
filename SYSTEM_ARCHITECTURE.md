# VaquaH — System Architecture

## Overview

VaquaH is an AC e-commerce, service booking, and AMC (Annual Maintenance Contract) platform. The stack runs a React SPA frontend with an Express.js API backend, Firebase (Auth + Firestore + Storage) as the data layer, and Razorpay for payments.

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                       │
│                                                                 │
│  React 18 + Vite ─── Tailwind / shadcn/ui ─── React Router 6  │
│  Axios API layer ─── React Query v5 ─── Firebase SDK           │
│  Voice Assistant (Web Speech API + TTS playback)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS API (port 5001)                   │
│                                                                  │
│  Routes:                                                         │
│   /api/chat          → Chatbot (Groq RAG)                       │
│   /api/voice/tts     → Text-to-Speech (Edge TTS)                │
│   /api/voice/stt     → Speech-to-Text (Groq Whisper)            │
│   /api/payments      → Razorpay Orders & Verification           │
│   /api/offers        → Promotional Offers CRUD                  │
│   /api/admin/orders  → Admin Order Management                   │
│   /api/admin/users   → Admin User Management                    │
│   /api/health/*      → Health Monitoring                        │
│                                                                  │
│  Services:                                                       │
│   ragService        → Groq llama-3.3-70b + vector retrieval     │
│   embeddingService  → Xenova/all-MiniLM-L6-v2 (local)          │
│   vectorStore       → In-memory cosine-similarity search        │
│   ttsService        → msedge-tts (free, unlimited)              │
│   sttService        → Groq Whisper large-v3-turbo               │
│   healthMonitor     → 60s system + Firestore checks             │
│   cleanupService    → Daily stale-data cleanup                  │
└──────┬────────────────────┬──────────────────┬───────────────────┘
       │                    │                  │
       ▼                    ▼                  ▼
┌──────────────┐  ┌─────────────────┐  ┌───────────────┐
│   Firebase   │  │   Groq Cloud    │  │   Razorpay    │
│  Admin SDK   │  │                 │  │               │
│              │  │  Chat: llama-   │  │  Orders API   │
│  Firestore   │  │  3.3-70b        │  │  Payments     │
│  Auth        │  │                 │  │  Verification │
│  Storage     │  │  Audio: whisper │  │               │
│              │  │  -large-v3      │  │               │
└──────────────┘  └─────────────────┘  └───────────────┘
```

---

## Component Breakdown

### Frontend (`frontend/`)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18.3 + Vite 6.2 | SPA with HMR |
| Styling | Tailwind CSS 3.4 + shadcn/ui | Design system with Radix primitives |
| Routing | React Router 6 | Lazy-loaded pages with Suspense |
| State | React Context (Auth, Cart, Assistant) | Global state management |
| Data Fetching | Axios + TanStack React Query v5 | API calls with caching |
| Auth | Firebase Auth SDK | Google + Email/Password sign-in |
| Voice | Web Speech API + API-backed TTS | Wake-word activation, conversational assistant |

**Key Pages** (25 total):
- Public: Home, Products, ProductDetail, Services, About, Contact, FAQs
- Auth: SignIn, SignUp, ForgotPassword
- User: Dashboard, Orders, Profile, Checkout, Cart
- Admin: AdminDashboard, AdminOrders, AdminUsers, AdminProducts, AdminServices, AdminReview, AdminOffers

### Backend (`backend/`)

| Service | File | Description |
|---------|------|-------------|
| RAG Chatbot | `services/ragService.js` | Groq `llama-3.3-70b-versatile` with vector-retrieved context |
| Embeddings | `services/embeddingService.js` | Local `all-MiniLM-L6-v2` via `@xenova/transformers` (384-dim) |
| Vector Store | `services/vectorStore.js` | In-memory store, 512-char chunks, cosine similarity |
| TTS | `services/ttsService.js` | `msedge-tts` — free unlimited neural TTS (Indian English) |
| STT | `services/sttService.js` | Groq Whisper `whisper-large-v3-turbo` |
| Health | `services/healthMonitor.js` | 60s interval system + Firestore health checks |
| Cleanup | `services/cleanupService.js` | Daily cron for stale data |
| Payments | `controllers/paymentController.js` | Razorpay order creation + verification |
| Firebase | `lib/firebaseAdmin.js` | Firebase Admin SDK singleton |

### Data Layer (Firebase)

```
Firestore Collections:
├── users/               → User profiles, roles (isAdmin flag)
├── products/            → AC product catalog
├── services/            → Service offerings
├── orders/              → Order records with state machine
├── offers/              → Promotional offers
├── contracts/           → AMC contracts
├── marketingAssets/     → Dynamic service descriptions for RAG
└── _health/             → Health monitor ping document
```

---

## RAG Pipeline

```
User Query
    │
    ▼
┌─────────────────────────┐
│  chatbotRoutes.js       │
│  Fast-path regex:       │
│  greeting/bye/connect   │
│  ↓ (miss)               │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  vectorStore.search()   │
│  1. Embed query (384d)  │
│  2. Cosine similarity   │
│  3. Return top-5 chunks │
└─────────┬───────────────┘
          │ context string
          ▼
┌─────────────────────────┐
│  ragService.generate()  │
│  System prompt + context│
│  + chat history          │
│  → Groq llama-3.3-70b  │
│  → max 500 tokens       │
└─────────────────────────┘
```

---

## Voice Assistant Flow

```
[Wake Word "VaquaH"] → Open Overlay → [Web Speech API listens]
                                            │
                                      ┌─────┴──────┐
                                      │ transcript  │
                                      └─────┬──────┘
                                            │
                              ┌─────────────┴──────────────┐
                              │ parseIntent()              │
                              │ nav/scroll commands?       │
                              └──────┬───────────┬─────────┘
                                yes  │           │  no
                                     ▼           ▼
                              dispatchAction  POST /api/chat
                              (navigate/      (RAG response)
                               scroll)              │
                                                     ▼
                                              POST /api/voice/tts
                                              (Edge TTS audio)
                                                     │
                                                     ▼
                                              Play audio blob
                                              in browser
```

---

## Security

- **Auth**: Firebase ID tokens validated via Admin SDK middleware
- **Admin**: `isAdmin` flag checked on both frontend route guard and backend middleware
- **CORS**: Whitelist-based origin check (dev-friendly fallback)
- **Helmet**: Standard security headers
- **Input Validation**: Message length limits, file type/size checks on uploads
- **Secrets**: All API keys in `.env` (not committed)

---

## Container Orchestration & AI Scaler

### Docker Compose (VPS deployment)

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Proxy (:80)                     │
│            ┌──────────────┬──────────────┐              │
│            │ /  → frontend│ /api → pool  │              │
│            │              │ /agent → 8090│              │
│            └──────┬───────┴──────┬───────┘              │
│                   │              │ (least_conn)         │
│                   ▼              ▼                       │
│            ┌──────────┐  ┌──────────────────────┐       │
│            │ Frontend │  │   Backend Replicas   │       │
│            │ (Nginx)  │  │  ┌──────┐ ┌──────┐  │       │
│            │ :80      │  │  │ :5001│ │ :5001│  │       │
│            └──────────┘  │  └──────┘ └──────┘  │       │
│                          └──────────┬──────────┘       │
│                                     │ scaled by        │
│                          ┌──────────▼──────────┐       │
│                          │  AI Scaler Agent    │       │
│                          │  (LangGraph + Groq) │       │
│                          │  :8090              │       │
│                          └─────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### AI Scaler Agent — LangGraph Workflow

```
┌───────────────┐     ┌─────────┐     ┌────────────┐
│ collect_      │────▶│ analyze │────▶│ llm_decide │
│ metrics       │     │         │     │ (Groq LLM) │
│               │     │         │     │            │
│ Docker stats  │     │ Trend   │     │ JSON:      │
│ App health    │     │ detect  │     │ decision + │
│ Host CPU/mem  │     │         │     │ target +   │
└───────────────┘     └─────────┘     │ reason     │
                                      └─────┬──────┘
                                            │
                              ┌─────────────┴──────────────┐
                              │ should_execute?            │
                              └──────┬───────────┬─────────┘
                                yes  │           │  no
                                     ▼           ▼
                              ┌──────────┐  ┌──────────┐
                              │ execute  │  │ report   │
                              │ scale    │  │ log      │
                              │ compose  │  │ decision │
                              │ or k8s   │  └──────────┘
                              └────┬─────┘
                                   ▼
                              ┌──────────┐
                              │ report   │
                              └──────────┘

Runs every 30s. Cooldown: 120s between scaling actions.
```

**Agent API Endpoints** (port 8090):
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Agent health status |
| `/status` | GET | Current replicas, config, last decision |
| `/decisions` | GET | Last 100 scaling decisions log |
| `/metrics` | GET | Live Docker + host + app metrics |
| `/scale` | POST | Manual override `{target_replicas: N}` |
| `/graph` | GET | LangGraph node/edge structure |

### Kubernetes (future graduation)

Full K8s manifests in `infra/k8s/`:
- **HPA**: Reactive autoscaler (CPU 70%, Memory 80%) with stabilization windows
- **AI Agent**: Runs as a pod with RBAC permissions to scale deployments
- **Dual strategy**: HPA handles reactive scaling, AI agent handles predictive scaling
- **RBAC**: Scoped ServiceAccount with minimal permissions (get/list/patch deployments)

---

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | Backend | Groq API for LLM + Whisper STT |
| `GEMINI_API_KEY` | Backend | (Legacy — no longer used) |
| `RAZORPAY_KEY_ID` | Backend | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay secret |
| `FIREBASE_PROJECT_ID` | Backend | Firebase project |
| `FIREBASE_CLIENT_EMAIL` | Backend | Service account email |
| `FIREBASE_PRIVATE_KEY` | Backend | Service account private key |
| `VITE_FIREBASE_*` | Frontend | Firebase client SDK config |
| `VITE_RAZORPAY_KEY_ID` | Frontend | Client-side Razorpay key |
| `VITE_API_BASE_URL` | Frontend | Backend API base URL |
