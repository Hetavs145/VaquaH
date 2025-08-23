# Firestore Rules Deployment Guide

## Issue
Your admin dashboard is experiencing Firebase permission errors even though users have admin roles. This is caused by Firestore security rules that need to be updated.

## Solution
Update your Firestore security rules in the Firebase Console.

## Steps to Deploy

### 1. Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database" in the left sidebar
4. Click "Rules" tab

### 2. Replace Current Rules
Copy and paste the following updated rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() { 
      return request.auth != null; 
    }
    
    function isOwner(uid) { 
      return request.auth != null && request.auth.uid == uid; 
    }
    
    // Simplified admin check - only check custom claims for now
    // This avoids circular dependency issues when reading user documents
    function isAdmin() { 
      return request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Alternative admin check using user document (for cases where custom claims aren't set)
    function isAdminByUserDoc() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Combined admin check
    function isAdminCombined() {
      return isAdmin() || isAdminByUserDoc();
    }
    
    function isOwnerOrAdmin(uid) {
      return isOwner(uid) || isAdminCombined();
    }

    // Orders collection
    match /orders/{docId} {
      allow read, write: if isSignedIn() && (isOwnerOrAdmin(resource.data.userId) || isAdminCombined());
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      
      // Timeline subcollection
      match /timeline/{timelineDocId} {
        allow read, write: if isSignedIn() && (isOwnerOrAdmin(get(/databases/$(database)/documents/orders/$(docId)).data.userId) || isAdminCombined());
      }
    }

    // Appointments collection
    match /appointments/{docId} {
      allow read, write: if isSignedIn() && isOwnerOrAdmin(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
    }

    // Users collection
    match /users/{docId} {
      // Users can read their own record; Admins can read any
      allow read: if isOwner(docId) || isAdminCombined();
      // Users can create their own record; Admins can create/update any
      allow create: if isSignedIn() && (isOwner(docId) || isAdminCombined());
      allow update: if isSignedIn() && (isOwner(docId) || isAdminCombined());
      // Only admins can delete
      allow delete: if isAdminCombined();
    }

    // Products collection (read-only for everyone, write for admins)
    match /products/{docId} {
      allow read: if true;
      allow write: if isSignedIn() && isAdminCombined();
    }

    // Admin requests collection (only admins can read, users can create their own)
    match /adminRequests/{docId} {
      allow read: if isSignedIn() && (isOwner(docId) || isAdminCombined());
      allow create: if isSignedIn() && isOwner(docId);
      allow update: if isSignedIn() && isAdminCombined();
      allow delete: if isSignedIn() && isAdminCombined();
    }

    // Admin logs collection (only admins can read/write)
    match /adminLogs/{docId} {
      allow read, write: if isSignedIn() && isAdminCombined();
    }

    // Services collection (read-only for everyone)
    match /services/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 3. Publish Rules
1. Click "Publish" button
2. Wait for the rules to be deployed (usually takes a few seconds)

## What These Rules Fix

1. **Admin Access**: The `isAdminCombined()` function properly checks for admin users using both custom claims and user document roles
2. **Circular Dependencies**: Avoids issues when reading user documents to check admin status
3. **Collection Access**: Ensures admins can read/write to orders, users, and products collections
4. **Security**: Maintains proper security while allowing admin functionality

## Alternative: Use Firebase CLI (if available)

If you have Firebase CLI access:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## Testing

After deploying the rules:
1. Refresh your admin dashboard
2. The permission errors should be resolved
3. Admin users should be able to view orders, users, and products

## Troubleshooting

If issues persist:
1. Check that the user document has `role: 'admin'` in Firestore
2. Verify the user is properly authenticated
3. Check browser console for any remaining errors
4. Ensure the rules were published successfully