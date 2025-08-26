
VaquaH Cooling Service
A modern web app for discovering AC products and booking cooling services. It includes a product catalog, detailed pages, cart and checkout flow, service appointments, orders, contracts, and a user dashboard.

Highlights
Products: Rich catalog with images, specs, and feature highlights
Commerce: Cart, checkout, order history and status
Services: Appointment booking with confirmation and updates
Contracts: Plan selection and contract management
Experience: Fast, responsive, mobile‑first UI with accessible components
Tech Overview
Frontend
React (Vite), React Router
Tailwind CSS + Shadcn UI
TanStack Query for client‑side caching and syncing
Context-based state (Auth, Cart) and modular service layer
Backend (Briefing, high‑level only)
Node.js application that powers product, order, appointment, and contract workflows
Layered architecture (routing/controllers → domain services → data access)
Pluggable integrations for authentication, payments, and data storage
Environment-driven configuration; no secrets stored in the repository
Emphasis on input validation, consistent error handling, and observability hooks
Project Structure
src/components — Reusable UI blocks
src/pages — Route-level pages
src/context — Providers (Auth, Cart)
src/services — Frontend data-access modules
src/lib — App configuration and utilities
src/utils — Non-UI helpers
backend/ — Node.js server (domain services and HTTP handlers)
Local Development
Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
Start concurrent dev servers
npm run dev
Build production assets
npm run build
Output is generated in frontend/dist.

Deployment
Frontend: Serve the static assets from frontend/dist on any static host/CDN. Enable SPA fallback to index.html.
Backend: Deploy the Node.js app to your preferred host (HTTPS recommended). Configure all runtime secrets through the host’s secure settings.
Security & Privacy
No credentials are committed to the repo.
Use environment variables/secrets managers for runtime configuration.
Follow least‑privilege access for external services.
Contributing
Open issues/PRs with focused changes and clear rationale.
Match the existing style and keep edits scoped.
License
See LICENSE for usage terms.

Acknowledgements
Built with React, Tailwind, Shadcn UI, TanStack Query, and a lightweight Node.js service layer.