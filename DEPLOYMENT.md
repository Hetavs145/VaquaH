# VaquaH Deployment Guide for Hostinger

## Overview
This guide covers deploying your VaquaH application to Hostinger, including both frontend (static hosting) and backend (VPS) deployment.

## Prerequisites
- Hostinger account with hosting plan
- Domain name (optional but recommended)
- **Database Options:**
  - **Firebase Firestore** (Recommended - same project as auth)
  - Firebase Firestore database (free tier available)
- Firebase project configured
- Razorpay account with API keys

## Frontend Deployment (Static Hosting)

### 1. Build the Application
```bash
# In your local project directory
npm run build
```
This creates a `dist` folder with optimized production files.

### 2. Upload to Hostinger
1. **Access Hostinger Control Panel**
   - Log in to your Hostinger account
   - Go to "Hosting" → "Manage"
   - Click "File Manager"

2. **Upload Files**
   - Navigate to `public_html` folder
   - Upload all contents from the `dist` folder
   - Ensure `index.html` is in the root of `public_html`

3. **Set Document Root**
   - In Hostinger control panel, ensure document root points to `public_html`
   - This is usually the default setting

### 3. Environment Variables
Since static hosting doesn't support server-side environment variables, you'll need to:

1. **Create a `.env.production` file locally:**
   ```bash
   VITE_FIREBASE_API_KEY=your_production_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

2. **Build with production environment:**
   ```bash
   npm run build:prod
   ```

## Backend Deployment (VPS/Cloud Hosting)

### Option 1: Firebase Firestore (Recommended)
**No backend server needed!** This approach uses Firebase's serverless architecture.

1. **Enable Firestore in Firebase Console:**
   - Go to your Firebase project
   - Click "Firestore Database" in the left sidebar
   - Click "Create Database"
   - Choose "Start in test mode" (you can add security rules later)
   - Select a location close to your users

2. **Update Frontend Environment:**
   ```bash
   # .env.production
   VITE_FIREBASE_API_KEY=your_production_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
   # No VITE_API_BASE_URL needed - everything goes through Firebase
   ```

3. **Deploy Frontend Only:**
   ```bash
   npm run build
   # Upload dist folder to Hostinger
   ```

4. **Firestore Security Rules:**
   ```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Orders - users can create, read their own
       match /orders/{orderId} {
         allow create: if request.auth != null;
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
       
       // Products - public read, admin write
       match /products/{productId} {
         allow read: if true;
         allow write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
       }
       
       // Appointments - users can create, read their own
       match /appointments/{appointmentId} {
         allow create: if request.auth != null;
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

5. **Deploy Firestore Rules:**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase project
   firebase init firestore
   
   # Deploy rules
   firebase deploy --only firestore:rules
   ```

**Advantages:**
- ✅ No server management
- ✅ Automatic scaling
- ✅ Real-time updates
- ✅ Built-in security
- ✅ Same project as authentication
- ✅ Generous free tier

**Limitations:**
- ❌ No custom server-side logic
- ❌ Razorpay integration needs to be handled differently
- ❌ Limited to Firestore operations

### Option 2: Hostinger VPS (Traditional Backend)
1. **Provision VPS:**
   - Choose Ubuntu 20.04+ or CentOS 8+
   - Minimum specs: 1GB RAM, 1 vCPU, 20GB SSD
   - Enable SSH access

2. **Server Setup:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Firebase is already configured in your project
   # No additional database installation needed
   ```

3. **Deploy Application:**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd VaquaH
   
   # Install dependencies
   npm install
   
   # Create production environment file
   cp .env.example .env
   nano .env
   ```

4. **Production Environment Variables:**
   ```bash
   # Firebase Configuration
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   
   # Razorpay (use live keys for production)
   RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   
   # Server
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your_very_secure_jwt_secret
   ```

5. **Start with PM2:**
   ```bash
   # Start the application
   pm2 start server/server.js --name "vaquah-backend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   
   # Monitor logs
   pm2 logs vaquah-backend
   ```

### Option 2: Firebase Hosting (Recommended)
1. **Firebase Project Setup:**
   - Your Firebase project is already configured
   - Firestore database is ready to use
   - No additional setup needed

2. **Environment Variables:**
   ```bash
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   ```

## Domain Configuration

### 1. Point Domain to Hostinger
1. **In Hostinger Control Panel:**
   - Go to "Domains" → "Manage"
   - Update nameservers if needed
   - Set up DNS records

2. **DNS Records:**
   ```
   Type: A
   Name: @
   Value: Your VPS IP address (for backend)
   
   Type: CNAME
   Name: www
   Value: your-domain.com
   ```

### 2. SSL Certificate
- Hostinger provides free Let's Encrypt SSL
- Enable in control panel for both frontend and backend
- Update your environment variables to use `https://`

## Testing Deployment

### 1. Frontend
- Visit your domain in browser
- Test Firebase authentication
- Verify Razorpay integration

### 2. Backend
- Test API endpoints: `https://your-domain.com/api/`
- Verify Firebase connection
- Test Razorpay order creation

## Monitoring & Maintenance

### 1. Logs
```bash
# Backend logs
pm2 logs vaquah-backend

# System logs
sudo journalctl -u pm2-root
```

### 2. Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart vaquah-backend
```

### 3. Backup
- Regular Firebase data exports
- Code repository backup
- Environment variables backup

## Troubleshooting

### Common Issues
1. **CORS Errors:**
   - Update CORS origins in `server/server.js`
   - Add your frontend domain to allowed origins

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Port Issues:**
   - Ensure port 5000 is open in firewall
   - Check if port is already in use

4. **Firebase Connection:**
   - Verify connection string
   - Check network access settings
   - Ensure database user has correct permissions

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to git
- Use strong, unique secrets
- Rotate keys regularly

### 2. Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Regular Updates
- Keep Node.js updated
- Update dependencies regularly
- Monitor security advisories

## Performance Optimization

### 1. Frontend
- Enable gzip compression in Hostinger
- Use CDN for static assets
- Optimize images and assets

### 2. Backend
- Use PM2 cluster mode for multiple processes
- Implement caching strategies
- Monitor memory and CPU usage

## Support
- Hostinger Support: Available 24/7
- MongoDB Atlas: Comprehensive documentation
- Firebase: Official support channels
- Razorpay: Technical support available

---

**Note:** This guide assumes basic familiarity with server administration. For production deployments, consider consulting with a DevOps professional or using managed hosting services.
