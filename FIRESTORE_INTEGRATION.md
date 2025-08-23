# Firebase Firestore Integration Guide

## Overview
This guide shows how to replace MongoDB with Firebase Firestore for a fully serverless application.

## Prerequisites
- Firebase project with Authentication enabled
- Firestore Database created
- Firebase CLI installed

## 1. Enable Firestore

### In Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database" in left sidebar
4. Click "Create Database"
5. Choose "Start in test mode" (we'll add security rules later)
6. Select a location (choose closest to your users)

## 2. Install Firebase Dependencies

```bash
npm install firebase
```

## 3. Update Firebase Configuration

### src/lib/firebase.js
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
```

## 4. Create Firestore Services

### src/services/firestoreService.js
```javascript
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Generic CRUD operations
export const firestoreService = {
  // Create document
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Get document by ID
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Get all documents
  async getAll(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      
      // Apply conditions
      conditions.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Update document
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { id };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get user-specific documents
  async getUserDocuments(collectionName, userId) {
    return this.getAll(collectionName, [
      { field: 'userId', operator: '==', value: userId }
    ]);
  }
};
```

## 5. Update Existing Services

### src/services/orderService.js
```javascript
import { firestoreService } from './firestoreService';

export const orderService = {
  createOrder: async (orderData) => {
    return await firestoreService.create('orders', orderData);
  },

  getOrderById: async (id) => {
    return await firestoreService.getById('orders', id);
  },

  getUserOrders: async (userId) => {
    return await firestoreService.getUserDocuments('orders', userId);
  },

  updateOrderStatus: async (id, status) => {
    return await firestoreService.update('orders', id, { status });
  },

  // Razorpay integration
  createRazorpayOrder: async ({ amount, currency = 'INR', receipt }) => {
    // For Firestore-only approach, you might need to use Razorpay's client-side SDK
    // or integrate with a serverless function (Firebase Functions)
    throw new Error('Razorpay integration requires backend or Firebase Functions');
  },

  verifyRazorpayPayment: async (payload) => {
    // Same as above - requires backend or Firebase Functions
    throw new Error('Razorpay verification requires backend or Firebase Functions');
  }
};
```

### src/services/productService.js
```javascript
import { firestoreService } from './firestoreService';

export const productService = {
  getAllProducts: async () => {
    return await firestoreService.getAll('products');
  },

  getProductById: async (id) => {
    return await firestoreService.getById('products', id);
  },

  createProduct: async (productData) => {
    return await firestoreService.create('products', productData);
  },

  updateProduct: async (id, productData) => {
    return await firestoreService.update('products', id, productData);
  },

  deleteProduct: async (id) => {
    return await firestoreService.delete('products', id);
  }
};
```

### src/services/appointmentService.js
```javascript
import { firestoreService } from './firestoreService';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    return await firestoreService.create('appointments', appointmentData);
  },

  getUserAppointments: async (userId) => {
    return await firestoreService.getUserDocuments('appointments', userId);
  },

  getAppointmentById: async (id) => {
    return await firestoreService.getById('appointments', id);
  },

  updateAppointmentStatus: async (id, status) => {
    return await firestoreService.update('appointments', id, { status });
  }
};
```

## 6. Firestore Data Structure

### Collections and Documents

#### users/{userId}
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  isAdmin: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### products/{productId}
```javascript
{
  name: "VaquaH Pro AC",
  price: 32999,
  description: "Energy efficient AC",
  image: "/images/product1.jpg",
  brand: "VaquaH",
  category: "Air Conditioners",
  countInStock: 15,
  rating: 4.5,
  numReviews: 24,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### orders/{orderId}
```javascript
{
  userId: "user123",
  orderItems: [
    {
      productId: "prod123",
      name: "VaquaH Pro AC",
      price: 32999,
      qty: 1,
      image: "/images/product1.jpg"
    }
  ],
  shippingAddress: {
    address: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001"
  },
  paymentMethod: "razorpay",
  totalPrice: 32999,
  status: "pending", // pending, paid, shipped, delivered
  isPaid: false,
  paidAt: null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### appointments/{appointmentId}
```javascript
{
  userId: "user123",
  service: "AC Maintenance",
  date: "2024-01-15",
  time: "10:00 AM",
  notes: "Annual service required",
  address: "123 Main St, Mumbai",
  status: "pending", // pending, confirmed, completed, cancelled
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 7. Security Rules

### firestore.rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Orders - users can create, read their own
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
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

## 8. Razorpay Integration Options

### Option A: Firebase Functions (Recommended)
Create serverless functions for Razorpay integration:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const Razorpay = require('razorpay');

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const instance = new Razorpay({
    key_id: functions.config().razorpay.key_id,
    key_secret: functions.config().razorpay.key_secret,
  });

  const options = {
    amount: data.amount,
    currency: data.currency || 'INR',
    receipt: data.receipt,
  };

  try {
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Option B: Client-Side Only
Use Razorpay's client-side SDK directly (less secure):

```javascript
// In PaymentGateway.jsx
const handlePayment = async () => {
  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) return;

  // Create order directly with Razorpay (less secure)
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: "INR",
    name: "VaquaH",
    description: "AC Purchase",
    handler: function (response) {
      // Handle success
      onSuccess(response.razorpay_payment_id);
    },
    // ... other options
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
```

## 9. Deployment Steps

### 1. Update Environment Variables
```bash
# .env.production
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Build and Deploy Frontend
```bash
npm run build
# Upload dist folder to Hostinger
```

## 10. Advantages of Firestore Approach

✅ **No Server Management**: Fully serverless
✅ **Real-time Updates**: Automatic data synchronization
✅ **Built-in Security**: Row-level security with rules
✅ **Scalable**: Handles traffic spikes automatically
✅ **Cost-effective**: Generous free tier
✅ **Unified Platform**: Same project as authentication
✅ **Offline Support**: Works without internet connection

## 11. Limitations

❌ **No Custom Server Logic**: Limited to Firestore operations
❌ **Complex Queries**: Some advanced queries might be challenging
❌ **Razorpay Integration**: Requires Firebase Functions or client-side approach
❌ **Learning Curve**: Different from traditional SQL/NoSQL databases

## 12. Migration from MongoDB

If you're migrating from MongoDB:

1. **Export Data**: Use MongoDB export tools
2. **Transform Data**: Convert to Firestore format
3. **Import Data**: Use Firebase Admin SDK or console
4. **Update Frontend**: Replace API calls with Firestore calls
5. **Test Thoroughly**: Ensure all functionality works

---

**Recommendation**: For a small to medium application like VaquaH, Firebase Firestore is an excellent choice that eliminates the need for backend server management while providing real-time capabilities and automatic scaling.










