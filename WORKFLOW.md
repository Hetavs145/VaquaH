# VaquaH — Workflow Guide

## Development Setup

### Prerequisites
- Node.js 18+ (20+ recommended for Firebase SDK warnings)
- npm 9+
- Firebase project with Firestore, Auth, Storage enabled
- Groq API key (free tier at console.groq.com)
- Razorpay test/live keys

### Quick Start

```bash
# 1. Clone & install
git clone https://github.com/Hetavs145/VaquaH.git
cd VaquaH-main

# 2. Install all dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Configure environment
# backend/.env  — GROQ_API_KEY, Firebase creds, Razorpay keys
# frontend/.env — VITE_FIREBASE_*, VITE_RAZORPAY_KEY_ID, VITE_API_BASE_URL

# 4. Start backend (port 5001)
cd backend && node server.js

# 5. Start frontend (port 5173)
cd frontend && npm run dev
```

### Startup Sequence

```
server.js boots
  ├── Express app configured (CORS, Helmet, Morgan)
  ├── Routes mounted (/api/chat, /api/voice, /api/payments, /api/admin/*, /api/health)
  ├── initCleanupService()   → daily stale-data cleanup cron
  ├── initHealthMonitor()    → 60s health check loop
  └── app.listen(5001)
       └── initializeRAG()
            ├── Fetch Firestore services (marketingAssets/services)
            ├── Load all-MiniLM-L6-v2 model (~first run downloads ~80MB)
            └── Build vector index (9 chunks)
```

---

## Key Workflows

### 1. Chat / RAG Query

```
Frontend                          Backend
────────                          ───────
User types message
  → POST /api/chat
     { message, history, user }
                                  chatbotRoutes.js
                                    ├── Regex fast-path (greeting/bye/connect)
                                    │   → instant response
                                    └── RAG slow-path
                                         ├── retrieveContext(query)
                                         │   → vectorStore.search(query, topK=5)
                                         │   → embeddingService.embedText(query)
                                         │   → cosine similarity → top 5 chunks
                                         └── generateResponse(query, context, history)
                                              → Groq chat.completions.create()
                                              → llama-3.3-70b-versatile
  ← { response, type }
Display in chat UI
```

### 2. Voice Assistant

```
Frontend                          Backend
────────                          ───────
Wake word detected ("VaquaH")
  → Assistant overlay opens
  → Web Speech API starts listening
  → User speaks

transcript received
  ├── parseIntent(transcript)
  │   ├── navigation command → dispatchAction (client-side)
  │   └── no match → POST /api/chat { message: transcript }
  │                                   → RAG response
  │                  POST /api/voice/tts { text: response }
  │                                   → msedge-tts synthesis
  │                                   → audio/mpeg buffer
  ← Play audio blob
```

### 3. STT (Speech-to-Text via File Upload)

```
Frontend                          Backend
────────                          ───────
Record audio blob
  → POST /api/voice/stt
     (multipart: audio file)
                                  multer saves to /tmp
                                  sttService.transcribeAudio()
                                    → Groq whisper-large-v3-turbo
                                    → cleanup temp file
  ← { transcript: "..." }
```

### 4. Product Order

```
Frontend                          Backend
────────                          ───────
Add to cart (CartContext)
  → /checkout page
  → POST /api/payments/create-order
     { amount, currency }
                                  paymentController.createOrder()
                                    → Razorpay orders.create()
  ← { orderId, amount, currency }

Razorpay checkout popup opens
User pays → Razorpay callback
  → POST /api/payments/verify
     { razorpay_order_id, payment_id, signature }
                                  paymentController.verifyPayment()
                                    → HMAC-SHA256 signature verify
  ← { success: true }

Save order to Firestore (orders/)
```

### 5. Admin Order Management

```
Admin Dashboard
  → GET /api/admin/orders
                                  adminAuth middleware
                                    → verify Firebase ID token
                                    → check isAdmin claim
                                  → Firestore query orders/
  ← [orders]

Update order status
  → PATCH /api/admin/orders/:id
     { status }
                                  State machine validation:
                                    pending → confirmed → shipped → delivered
                                    pending → cancelled
  ← { updated order }
```

### 6. Health Monitoring

```
Every 60 seconds (server-side):
  healthMonitor.runHealthCheck()
    ├── getSystemMetrics()        (CPU, memory, uptime)
    └── checkFirestore()          (write ping, measure latency)
  → Store in rolling 60-entry array (1 hour)

Endpoints:
  GET /api/health/status    → { status: "healthy", timestamp }
  GET /api/health/detailed  → full metrics + Firestore latency
  GET /api/health/history   → last 60 checks array
```

---

## Project Structure

```
VaquaH-main/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── package.json
│   ├── .env                       # Secrets (not committed)
│   ├── controllers/
│   │   └── paymentController.js   # Razorpay logic
│   ├── lib/
│   │   └── firebaseAdmin.js       # Firebase Admin singleton
│   ├── middleware/
│   │   └── adminAuth.js           # Token + isAdmin check
│   ├── routes/
│   │   ├── chatbotRoutes.js       # POST /api/chat
│   │   ├── voiceRoutes.js         # /api/voice/*
│   │   ├── healthRoutes.js        # /api/health/*
│   │   ├── paymentRoutes.js       # /api/payments/*
│   │   ├── adminOrders.js         # /api/admin/orders
│   │   ├── adminUsers.js          # /api/admin/users
│   │   └── offersRoutes.js        # /api/offers
│   └── services/
│       ├── ragService.js          # Groq RAG orchestrator
│       ├── embeddingService.js    # Local MiniLM embeddings
│       ├── vectorStore.js         # In-memory vector search
│       ├── ttsService.js          # Edge TTS synthesis
│       ├── sttService.js          # Groq Whisper transcription
│       ├── healthMonitor.js       # System health checks
│       └── cleanupService.js      # Daily data cleanup
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Router + lazy routes
│   │   ├── main.jsx               # Entry point
│   │   ├── components/            # Reusable UI components
│   │   │   └── assistant/         # Voice assistant UI
│   │   ├── context/               # React contexts
│   │   ├── hooks/                 # Custom hooks
│   │   ├── pages/                 # Route pages
│   │   ├── services/              # API + voice + assistant
│   │   ├── lib/                   # Firebase SDK init
│   │   └── utils/                 # Helpers
│   ├── .env                       # Frontend env vars
│   └── vite.config.js
├── SYSTEM_ARCHITECTURE.md
├── WORKFLOW.md
├── firestore.rules
├── storage.rules
└── firebase.json
```

---

## Deployment Checklist

1. **Environment**: Set all `.env` variables for production
2. **CORS**: Update `corsOrigins` in `server.js` with production domain
3. **Razorpay**: Switch from `rzp_test_*` to `rzp_live_*` keys
4. **Firebase Rules**: Review `firestore.rules` and `storage.rules`
5. **Embedding Model**: First deployment will download ~80MB model on startup
6. **Health Check**: Verify `GET /api/health/status` returns `healthy`
7. **TTS**: No API keys needed — Edge TTS is free and unlimited
