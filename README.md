# VaquaH Cooling Service (v2.0.2)

A comprehensive web application for HVAC/Cooling services, enabling product purchases, service bookings, and annual maintenance contracts.

## 🔄 Updates

All updates from v1.2.0 onwards are documented in `UPDATE.md`. 📝  

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

### 💬 Smart Support
- **AI Chatbot**: RAG-powered assistant to answer queries about services, pricing, and policies.
- **Contact Center**: Direct click-to-call support and location details.
- **Help Pages**: Comprehensive FAQs, Returns Policy, and Warranty information.

### 🧠 Innovation: Hands-Free Experience
- **Voice Control**: Navigate the site ("Go to Cart"), scroll, or ask questions just by speaking. Say "VaquaH" to wake up the assistant.
- **Gesture Navigation**: Browse without touching your device.
  - **Virtual Cursor**: Use your index finger as a mouse.
  - **Pinch-to-Click**: Select items easily.
  - **Swipe**: Navigate back or forward with a fist swipe.
  - **Scroll**: Use 2 fingers to scroll up, 3 fingers to get down.

## 💻 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS & Shadcn UI
- Framer Motion (Animations)
- Lucide React (Icons)
- React Router DOM
- TanStack Query (State Management)
- Google MediaPipe (Gesture Tracking via CDN)

**Backend:**
- Node.js & Express
- Firebase (Firestore & Auth)
- Razorpay Integration
- Google Generative AI (LLM Chatbot)

## 🛠️ Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment
- **Frontend**: Deploy `frontend/dist` to Vercel, Netlify, or AWS S3.
- **Backend**: Deploy to Render, Railway, or AWS EC2. Ensure environment variables are set.

## 🔒 Security
- Environment variables used for all sensitive keys.
- No secrets committed to the repository.
- Input validation on Checkout and Cart.

## 🤝 Contributing
Open issues or PRs with clear descriptions. Please follow the existing code style.

## 📄 License
All rights reserved. This project is proprietary. Unauthorized use, reproduction, or distribution without explicit permission is strictly prohibited.

---
Built with ❤️ by Hetav Shah.
