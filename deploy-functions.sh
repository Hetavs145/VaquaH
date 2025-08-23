#!/bin/bash

# Firebase Functions Deployment Script
# This script helps deploy Firebase functions with proper setup

echo "🚀 Starting Firebase Functions Deployment..."

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies in functions directory
echo "📦 Installing dependencies in backend/functions..."
cd backend/functions
npm install

# Check if cors package was installed
if ! npm list cors > /dev/null 2>&1; then
    echo "⚠️  Warning: cors package not found. Installing..."
    npm install cors
fi

# Go back to project root
cd ../..

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase first:"
    firebase login
fi

# Deploy functions
echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "✅ Functions deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check Firebase Console to verify function deployment"
    echo "2. Ensure your user has admin role in Firebase Auth"
    echo "3. Test the application"
    echo ""
    echo "🔧 To set admin role for a user, use Firebase Console or:"
    echo "   - Go to Authentication > Users"
    echo "   - Find your user and set custom claims: { 'role': 'admin' }"
else
    echo "❌ Function deployment failed. Please check the error messages above."
    exit 1
fi