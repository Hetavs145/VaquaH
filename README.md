
# VaquaH Cooling Service

A modern React application for an AC service and product company with Firebase authentication.

## Features

- **Firebase Authentication**: Email/password and Google sign-in
- **Database Options**: 
  - **Firebase Firestore** (Recommended - serverless, real-time)
  - Firebase Firestore with Express backend
- Product catalog with details
- Shopping cart functionality
- Service appointment scheduling
- Order management
- User dashboard
- Contract management
- Payment gateway integration (Razorpay)

## Tech Stack

- **Frontend:**
  - React with JavaScript
  - Vite for fast development and building
  - React Router for navigation
  - React Hook Form for form handling
  - Tailwind CSS for styling
  - Shadcn UI component library
  - TanStack Query for data fetching

- **Authentication & Database:**
  - Firebase Authentication
  - Firebase Firestore (recommended)
  - Google OAuth integration
  - Email/password authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console
4. Go to Authentication > Sign-in method
5. Enable Email/Password and Google sign-in methods
6. For Google sign-in, add your domain to authorized domains
7. **Enable Firestore Database** (recommended for serverless approach)
8. Go to Project Settings > General
9. Scroll down to "Your apps" and click the web icon (</>)
10. Register your app and copy the configuration

## Project Structure

- `/src`: Frontend React application
  - `/components`: UI components
  - `/context`: React context providers (Auth, Cart)
  - `/hooks`: Custom React hooks
  - `/lib`: Firebase configuration and utilities
  - `/pages`: Page components
  - `/services`: API service methods

## Database Options

### Option 1: Firebase Firestore (Recommended)
- **Serverless**: No backend server needed
- **Real-time**: Automatic data synchronization
- **Unified**: Same project as Firebase Authentication
- **Scalable**: Handles traffic automatically
- **Cost-effective**: Generous free tier

See [FIRESTORE_INTEGRATION.md](./FIRESTORE_INTEGRATION.md) for complete setup guide.

### Option 2: Firebase Firestore with Express Backend
- **Traditional**: Full control over backend logic
- **Flexible**: Custom API endpoints and business logic
- **Razorpay**: Direct integration with payment gateway
- **Complex**: Requires server management and deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for backend deployment guide.

## Authentication Features

- **Email/Password Sign Up**: Users can create accounts with email and password
- **Email/Password Sign In**: Existing users can sign in with their credentials
- **Google Sign In**: One-click authentication with Google accounts
- **Protected Routes**: Certain pages require authentication
- **User Profile Management**: Users can update their profile information
- **Automatic Session Management**: Firebase handles user sessions automatically

## Environment Variables

All Firebase configuration variables are prefixed with `VITE_` to make them available in the frontend. Make sure to:

1. Never commit your `.env` file (it's already in `.gitignore`)
2. Use the `.env.example` file as a template
3. Keep your Firebase API keys secure

Also set Razorpay credentials:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for the backend (server/.env)
- `VITE_RAZORPAY_KEY_ID` for the frontend (root .env)

## Deployment

### Hostinger Deployment

The application can be deployed to Hostinger with the following setup:

#### Frontend (Static Hosting)
1. **Build the application:**
   ```bash
   npm run build
   ```
2. **Upload to Hostinger:**
   - Upload the `dist` folder contents to your Hostinger hosting directory
   - Set the document root to point to the uploaded files
3. **Environment Variables:**
   - Set `VITE_FIREBASE_API_KEY` and other Firebase variables in your hosting environment
   - Set `VITE_RAZORPAY_KEY_ID` for Razorpay integration
   - Set `VITE_API_BASE_URL` to your backend API URL

#### Backend (VPS/Cloud Hosting)
1. **Server Requirements:**
   - Node.js 18+ 
   - Firebase Firestore database
   - Environment variables configured
2. **Deploy Steps:**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd VaquaH
   
   # Install dependencies
   npm install
   
   # Set environment variables
   cp .env.example .env
   # Edit .env with production values
   
   # Start the server
   node server/server.js
   ```
3. **Environment Variables for Backend:**
   ```bash
   # Database
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   
   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Server
   PORT=5000
   NODE_ENV=production
   ```

#### Alternative Hosting Options
- **Vercel**: Frontend deployment with serverless functions
- **Netlify**: Frontend hosting with form handling
- **Firebase Hosting**: Frontend + Firebase services
- **Railway/Render**: Backend hosting with Firebase

Make sure to set the environment variables in your hosting platform's dashboard.
