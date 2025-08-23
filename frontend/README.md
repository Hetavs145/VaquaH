# VaquaH Frontend

React-based frontend application for VaquaH Cooling Service.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `context/` - React context providers
  - `services/` - API services
  - `lib/` - Utility libraries (Firebase, etc.)
  - `hooks/` - Custom React hooks

## 🔧 Configuration

- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - UI component configuration

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
VITE_API_BASE_URL=http://localhost:5001/api
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Firebase** - Authentication and database
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

