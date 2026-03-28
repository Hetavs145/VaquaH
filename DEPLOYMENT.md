# VaquaH v3.0.0 — Deployment Guide

---

## Table of Contents

1. [Local Development (No Docker)](#1-local-development-no-docker)
2. [Local Docker Deployment](#2-local-docker-deployment)
3. [Hostinger Ubuntu VPS](#3-hostinger-ubuntu-vps)
4. [Vercel + Railway](#4-vercel--railway)
5. [Vercel + Render](#5-vercel--render)
6. [Environment Variables Reference](#6-environment-variables-reference)

---

## 1. Local Development (No Docker)

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18.x+ | `node -v` |
| npm | 9.x+ | `npm -v` |
| Git | any | `git --version` |

### Steps

```bash
# 1. Clone and enter the project
git clone <your-repo-url> VaquaH-main
cd VaquaH-main

# 2. Install all dependencies (root + frontend + backend)
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 3. Set up environment variables
# Backend — create backend/.env
cat > backend/.env << 'EOF'
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
GROQ_API_KEY=gsk_xxxxx
EOF

# Frontend — create frontend/.env
cat > frontend/.env << 'EOF'
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_API_BASE_URL=http://localhost:5001/api
EOF

# 4. Start both servers (concurrent)
npm run dev
```

### What Starts

| Service | URL | Notes |
|---------|-----|-------|
| Frontend (Vite) | `http://localhost:8080` | Hot-reload enabled |
| Backend (Express) | `http://localhost:5001` | nodemon auto-restart |

### Verify

```bash
# Backend health
curl http://localhost:5001/api/health/status
# → {"status":"healthy", ...}

# Chat API
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What services do you offer?"}'

# TTS
curl -X POST http://localhost:5001/api/voice/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}' --output test.mp3

# Frontend
open http://localhost:8080
```

---

## 2. Local Docker Deployment

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Docker | 24.x+ | `docker --version` |
| Docker Compose | v2.x+ | `docker compose version` |

### Steps

```bash
# 1. Create root .env from template
cp docker.env.example .env

# 2. Fill in the .env file
nano .env
# Set: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
# Set: GROQ_API_KEY

# 3. Make sure backend/.env exists (same as local dev)
# The backend container reads from backend/.env via env_file

# 4. Build and start all services
docker compose up --build -d

# 5. Watch logs
docker compose logs -f
```

### Architecture

```
                    :80
                     │
              ┌──────┴──────┐
              │  Nginx Proxy │
              │ (least_conn) │
              └──┬───┬───┬──┘
                 │   │   │
    ┌────────────┘   │   └────────────┐
    ▼                ▼                ▼
┌──────────┐  ┌────────────┐  ┌──────────────┐
│ Frontend │  │ Backend ×2 │  │ Scaler Agent │
│  (Nginx) │  │  (Express) │  │  (FastAPI)   │
└──────────┘  └────────────┘  └──────────────┘
```

| Service | Internal Port | Exposed | Replicas |
|---------|--------------|---------|----------|
| proxy | 80 | `localhost:80` | 1 |
| frontend | 80 | — (via proxy `/`) | 1 |
| backend | 5001 | — (via proxy `/api/`) | 2 |
| scaler-agent | 8090 | — (via proxy `/agent/`) | 1 |

### Verify

```bash
# All services running
docker compose ps

# App
open http://localhost

# Health
curl http://localhost/api/health/status

# AI Scaler dashboard
curl http://localhost/agent/status
```

### Useful Commands

```bash
# Scale backend manually
docker compose up -d --scale backend=3

# Rebuild a single service
docker compose build backend && docker compose up -d backend

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## 3. Hostinger Ubuntu VPS

### Recommended VPS Plan

| Spec | Minimum | Recommended |
|------|---------|-------------|
| **Plan** | KVM 2 | **KVM 4** |
| **vCPU** | 2 cores | **4 cores** |
| **RAM** | 4 GB | **8 GB** |
| **Storage** | 50 GB NVMe | **100 GB NVMe** |
| **Bandwidth** | 4 TB | 8 TB |
| **OS** | Ubuntu 22.04 LTS | **Ubuntu 24.04 LTS** |
| **Cost** | ~$10/mo | **~$16/mo** |

> **Why 4 GB minimum?** The embedding model (`all-MiniLM-L6-v2`) uses ~400MB RAM per backend replica. With 2 replicas + Nginx + Agent + OS overhead, you need ≥3.5 GB.

### Step-by-Step Setup

#### 3.1 Initial Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Create a deploy user (don't run the app as root)
adduser deploy
usermod -aG sudo deploy
su - deploy
```

#### 3.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add deploy user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

#### 3.3 Install Node.js (for building without Docker, optional)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

#### 3.4 Set Up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

#### 3.5 Clone and Configure

```bash
cd ~
git clone <your-repo-url> vaquah
cd vaquah

# Create environment files
cp docker.env.example .env
nano .env          # Fill in Firebase, Groq, Razorpay keys

nano backend/.env  # Fill in backend secrets
```

#### 3.6 Deploy with Docker Compose

```bash
# Build and start (detached)
docker compose up --build -d

# Check all services are healthy
docker compose ps

# Check logs
docker compose logs -f --tail=50
```

#### 3.7 Set Up Nginx + SSL (on the host)

Don't expose Docker's port 80 directly. Use the host's Nginx as the entrypoint with Certbot for HTTPS.

```bash
# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Remove default site
sudo rm /etc/nginx/sites-enabled/default
```

Create `/etc/nginx/sites-available/vaquah`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        client_max_body_size 10m;
    }
}
```

> **Note:** Change Docker Compose to expose port `8080` instead of `80` to avoid conflict with host Nginx. Edit `docker-compose.yml`:
> ```yaml
> proxy:
>   ports:
>     - "8080:80"   # Changed from "80:80"
> ```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vaquah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate (free)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically. Verify:
sudo certbot renew --dry-run
```

#### 3.8 Set Up Auto-Start on Reboot

```bash
# Docker already auto-starts. Ensure compose services restart.
# The docker-compose.yml already has `restart: unless-stopped`

# Enable Docker to start on boot
sudo systemctl enable docker
```

#### 3.9 Set Up Log Rotation

```bash
cat << 'EOF' | sudo tee /etc/logrotate.d/docker-compose
/home/deploy/vaquah/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
}
EOF
```

#### 3.10 Update Deployment (CI/CD)

For manual updates:

```bash
cd ~/vaquah
git pull origin main
docker compose up --build -d
docker compose logs -f --tail=20
```

For GitHub Actions auto-deploy, add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/vaquah
            git pull origin main
            docker compose up --build -d
            docker compose ps
```

#### 3.11 Monitoring on VPS

```bash
# Live resource usage
docker stats

# Application health
curl http://localhost:8080/api/health/detailed

# AI Scaler decisions
curl http://localhost:8080/agent/decisions

# Disk usage
df -h
```

#### Hostinger DNS Setup

1. Go to Hostinger dashboard → **Domains** → your domain → **DNS Zone**
2. Add an **A Record**:
   - Name: `@`
   - Points to: `your-vps-ip`
   - TTL: 3600
3. Add another A Record for `www`:
   - Name: `www`
   - Points to: `your-vps-ip`
   - TTL: 3600
4. Wait 5–30 minutes for propagation

---

## 4. Vercel + Railway

Best for: **Zero-ops, auto-scaling, free tier friendly.**

### Frontend → Vercel

#### Setup

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel dashboard:

   | Variable | Value |
   |----------|-------|
   | `VITE_FIREBASE_API_KEY` | your key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
   | `VITE_FIREBASE_PROJECT_ID` | your-project-id |
   | `VITE_FIREBASE_STORAGE_BUCKET` | your-project.firebasestorage.app |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | your sender id |
   | `VITE_FIREBASE_APP_ID` | your app id |
   | `VITE_RAZORPAY_KEY_ID` | rzp_live_xxxxx |
   | `VITE_API_BASE_URL` | `https://your-backend.up.railway.app/api` |

5. Deploy. Vercel gives you `https://your-app.vercel.app`.

#### Add Custom Domain (optional)

1. Vercel dashboard → **Settings** → **Domains** → add `yourdomain.com`
2. Update DNS:
   - CNAME `www` → `cname.vercel-dns.com`
   - A record `@` → `76.76.21.21`

### Backend → Railway

#### Setup

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repo
3. Configure:
   - **Root Directory**: `/backend`
   - **Start Command**: `node server.js`
4. Add **Environment Variables** in Railway dashboard:

   | Variable | Value |
   |----------|-------|
   | `FIREBASE_PROJECT_ID` | your-project-id |
   | `FIREBASE_CLIENT_EMAIL` | your-service-account@... |
   | `FIREBASE_PRIVATE_KEY` | -----BEGIN PRIVATE KEY----- ... |
   | `RAZORPAY_KEY_ID` | rzp_live_xxxxx |
   | `RAZORPAY_KEY_SECRET` | your secret |
   | `GROQ_API_KEY` | gsk_xxxxx |
   | `PORT` | 5001 |
   | `NODE_ENV` | production |

5. Railway auto-detects Node.js and deploys. It gives you a URL like `https://your-backend.up.railway.app`.

#### Important: CORS

Update `backend/server.js` to include your Vercel domain in `corsOrigins`:

```js
const corsOrigins = [
  'https://your-app.vercel.app',
  'https://yourdomain.com',
  // ... keep existing localhost entries for dev
];
```

### Pricing

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | 100 GB bandwidth, unlimited deploys | Pro $20/mo |
| **Railway** | $5 free credit/mo (~500 hrs) | $5–20/mo (usage-based) |

> **Note:** The embedding model downloads ~80MB on first cold start on Railway. Subsequent starts use the cached version. First cold start takes ~30-45 seconds.

---

## 5. Vercel + Render

Best for: **Generous free tier, always-on backend.**

### Frontend → Vercel

Same as [Section 4 above](#frontend--vercel). Use Render's backend URL for `VITE_API_BASE_URL`.

### Backend → Render

#### Setup

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `vaquah-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Region**: Oregon (or closest to your users — Singapore for India)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Starter** ($7/mo) or **Standard** ($25/mo)

   > ⚠️ **Free tier spins down after 15 min of inactivity** — causes 30-50s cold starts (embedding model re-download). Use **Starter ($7/mo)** minimum for production.

4. Add **Environment Variables** (same as Railway list above).

5. Deploy. Render gives you `https://vaquah-backend.onrender.com`.

6. Set `VITE_API_BASE_URL=https://vaquah-backend.onrender.com/api` in Vercel.

### Pricing

| Service | Free Tier | Recommended |
|---------|-----------|-------------|
| **Vercel** | 100 GB bandwidth | Free is enough |
| **Render** | 750 hrs/mo (spins down) | **Starter $7/mo** (always-on) |

---

## 6. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Service account private key (with `\n` line breaks) |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key (test or live) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay secret |
| `GROQ_API_KEY` | ✅ | Groq API key for LLM + STT |
| `PORT` | ❌ | Server port (default: 5001) |
| `NODE_ENV` | ❌ | `production` or `development` |

### Frontend (`frontend/.env` or Vercel dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_RAZORPAY_KEY_ID` | ✅ | Razorpay public key |
| `VITE_API_BASE_URL` | ✅ | Backend API URL (e.g., `http://localhost:5001/api`) |

### Docker Compose (`.env` at root)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Passed as build arg to frontend |
| `VITE_FIREBASE_AUTH_DOMAIN` | Passed as build arg to frontend |
| `VITE_FIREBASE_PROJECT_ID` | Passed as build arg to frontend |
| `VITE_FIREBASE_STORAGE_BUCKET` | Passed as build arg to frontend |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Passed as build arg to frontend |
| `VITE_FIREBASE_APP_ID` | Passed as build arg to frontend |
| `VITE_RAZORPAY_KEY_ID` | Passed as build arg to frontend |
| `GROQ_API_KEY` | Used by scaler agent |

---

## Quick Decision Matrix

| Criteria | VPS (Hostinger) | Vercel + Railway | Vercel + Render |
|----------|----------------|-----------------|-----------------|
| **Monthly Cost** | $10–16 | $0–25 | $0–7 |
| **Setup Complexity** | Medium | Easy | Easy |
| **Auto-scaling** | Via AI Agent | Railway auto-scale | Manual tier change |
| **SSL** | Certbot (manual) | Automatic | Automatic |
| **Custom Domain** | Full control | Supported | Supported |
| **Cold Starts** | None | Railway: ~5s | Free: ~30-50s |
| **AI Scaler Agent** | ✅ Full support | ❌ Not applicable | ❌ Not applicable |
| **Best For** | Full control, India-based | Quick launch, scalable | Budget-friendly |

---

## Troubleshooting

### Backend won't start — embedding model fails
```bash
# The model needs ~400MB RAM. Check available memory:
free -h
# If low on RAM, add swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Docker Compose — port 80 already in use
```bash
# Check what's using port 80
sudo lsof -i :80
# If it's host Nginx, change docker-compose.yml proxy port to 8080:80
```

### TTS not working — crypto error
The `msedge-tts` v2 requires `crypto.subtle`. On Node 18, the app polyfills this automatically. If you see crypto errors, ensure you're using Node 18.x+ (not 16).

### Railway/Render — slow first request
The embedding model (~80MB) downloads on first boot. Subsequent requests are fast. On Railway, enable **persistent disk** to cache the model across deploys.

### Firebase Private Key — formatting issues
When setting `FIREBASE_PRIVATE_KEY` in Railway/Render/Vercel dashboards, paste the full key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers. Replace literal `\n` with actual newlines if the platform requires it.
