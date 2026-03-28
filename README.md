# VaquaH Cooling Service (v3.0.0)

A comprehensive web application for HVAC/Cooling services, enabling product purchases, service bookings, and annual maintenance contracts — now powered by **Groq AI**, **voice interaction**, **health monitoring**, and **production-ready Docker/Kubernetes infrastructure** with an AI-driven autoscaler.

## 🔄 Updates

All updates from v1.2.0 onwards are documented in `Update.md`. 📝  

Refer to it for the latest changes!😉

## 🚀 Key Features

### 🛒 E-Commerce Experience
- **Product Catalog**: Browse AC units and parts with rich details, images, and specifications.
- **Smart Search & Filtering**: Find products easily by category, price, or name.
- **Shopping Cart**:
  - Real-time total calculation.
  - **Coupon System**: Apply discount codes (public or hidden).
  - **Tiered Shipping**:
    - **Standard**: Free for orders > ₹999 (on net total), else ₹50.
    - **Express**: Flat ₹150 for urgent delivery.
- **Wishlist**: Save favorite items for later.
- **Secure Checkout**:
  - Integrated **Razorpay** payment gateway.
  - **Cash on Delivery (COD)** with partial advance payment logic for high-value orders (> ₹2000).

### 🛠️ Services & Maintenance
- **Appointment Booking**: Schedule installation, repair, or maintenance services.
- **AMC Plans**: View and purchase Annual Maintenance Contracts (Basic, Gold, Platinum).
- **Service Tracking**: Monitor appointment status (Pending, Confirmed, Completed) from the dashboard.

### 👤 User Dashboard
- **Profile Management**: Update personal details and avatars.
- **Order History**: View past purchases and their delivery status.
- **Appointment History**: Track current and past service requests.

### 💬 AI-Powered Support
- **RAG Chatbot**: Groq `llama-3.3-70b-versatile` with local vector embeddings (`all-MiniLM-L6-v2`) for context-aware responses about services, pricing, and policies.
- **Voice Interaction**: Server-side TTS (`msedge-tts`, `en-IN-NeerjaNeural`) and STT (Groq Whisper `whisper-large-v3-turbo`) for conversational AI — speak to the chatbot and hear responses.
- **Contact Center**: Direct click-to-call support and location details.
- **Help Pages**: Comprehensive FAQs, Returns Policy, and Warranty information.

### 🧠 Innovation: Hands-Free Experience
- **Voice Control**: Navigate the site ("Go to Cart"), scroll, or ask questions just by speaking. Say "VaquaH" to wake up the assistant.
- **Gesture Navigation**: Browse without touching your device.
  - **Virtual Cursor**: Use your index finger as a mouse.
  - **Pinch-to-Click**: Select items easily.
  - **Swipe**: Navigate back or forward with a fist swipe.
  - **Scroll**: Use 2 fingers to scroll up, 3 fingers to get down.

### 🏥 Health Monitoring
- **Real-Time System Metrics**: CPU, memory, uptime, and Firestore connectivity monitored every 60 seconds.
- **Rolling History**: 60-entry health check history accessible via REST API.
- **Endpoints**: `/api/health/status`, `/api/health/detailed`, `/api/health/history`.

### 🐳 Docker & Kubernetes Production Infrastructure
- **Multi-Stage Dockerfiles**: Optimized images for frontend (Nginx), backend (Node.js with pre-cached ML models), and AI scaler agent (Python).
- **Docker Compose**: One-command deployment with Nginx reverse proxy, load-balanced backend (2 replicas), and AI scaler agent.
- **Kubernetes Manifests**: Full K8s deployment with HPA (Horizontal Pod Autoscaler), RBAC, and service definitions.
- **AI-Driven Autoscaler**: LangGraph-powered agent that collects real-time container/host metrics and uses Groq LLM to make intelligent scaling decisions with cooldown protection.

## 💻 Tech Stack

**Frontend:**
- React 18.3 (Vite 6.2)
- Tailwind CSS 3.4 & Shadcn UI
- Framer Motion (Animations)
- Lucide React (Icons)
- React Router DOM 6.26
- TanStack React Query v5
- Google MediaPipe (Gesture Tracking via CDN)

**Backend:**
- Node.js 18 & Express 4.22
- Firebase Admin 13.4 (Firestore & Auth)
- Razorpay 2.9 Integration
- Groq SDK (LLM — `llama-3.3-70b-versatile`)
- @xenova/transformers (Local embeddings — `all-MiniLM-L6-v2`)
- msedge-tts (Text-to-Speech)
- Multer (File uploads for STT)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (Reverse Proxy & SPA Hosting)
- Kubernetes (Deployments, Services, HPA, RBAC)
- Python 3.11, FastAPI & LangGraph (AI Scaler Agent)
- langchain-groq (Agent LLM Integration)

## 🛠️ Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up environment variables**
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:5001/api
   VITE_FIREBASE_API_KEY=...
   # (see frontend/.env.example)

   # backend/.env
   GROQ_API_KEY=...
   RAZORPAY_KEY_ID=...
   # (see backend/.env.example)
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   Backend runs on `http://localhost:5001`, Frontend on `http://localhost:5173`.

4. **Build for production**
   ```bash
   npm run build
   ```

## 🐳 Docker Deployment

```bash
# Copy and fill environment variables
cp docker.env.example .env

# Build and start all services
docker compose up --build -d

# Access the app at http://localhost (Nginx proxy)
# AI Scaler dashboard at http://localhost/agent/status
```

## 🚀 Deployment
- **Frontend**: Deploy `frontend/dist` to Vercel, Netlify, or AWS S3.
- **Backend**: Deploy to Render, Railway, or AWS EC2. Ensure environment variables are set.
- **Docker**: Use `docker-compose.yml` for single-server deployment (Hostinger VPS, DigitalOcean, etc.).
- **Kubernetes**: Apply manifests from `infra/k8s/` to any K8s cluster.

## 🔒 Security
- Environment variables used for all sensitive keys.
- No secrets committed to the repository.
- Input validation on Checkout and Cart.
- Firebase Auth token validation with automatic refresh (55-min interval).
- Helmet middleware for HTTP security headers.
- CORS configured for frontend origin.

## 🤝 Contributing
Open issues or PRs with clear descriptions. Please follow the existing code style.

## 📄 License
All rights reserved. This project is proprietary. Unauthorized use, reproduction, or distribution without explicit permission is strictly prohibited.

---
Built with ❤️ by Hetav Shah.
