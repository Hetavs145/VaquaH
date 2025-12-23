import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query as fsQuery,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generic CRUD operations
export const firestoreService = {
  // Create a new document
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

  // Get a document by ID
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Get all documents from a collection
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Update a document
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

  // Delete a document
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

  // Query documents with filters
  async find(collectionName, conditions = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(db, collectionName);

      // Apply where conditions
      conditions.forEach(condition => {
        q = fsQuery(q, where(condition.field, condition.operator, condition.value));
      });

      // Apply ordering
      if (orderByField) {
        q = fsQuery(q, orderBy(orderByField));
      }

      // Apply limit
      if (limitCount) {
        q = fsQuery(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
};

// Specific service functions for your app
export const userService = {
  async createUser(userData) {
    return await firestoreService.create('users', userData);
  },

  async getUserById(id) {
    return await firestoreService.getById('users', id);
  },

  async getUserByEmail(email) {
    const users = await firestoreService.find('users', [
      { field: 'email', operator: '==', value: email }
    ]);
    return users.length > 0 ? users[0] : null;
  },

  async updateUser(id, userData) {
    return await firestoreService.update('users', id, userData);
  }
};

export const productService = {
  async createProduct(productData) {
    return await firestoreService.create('products', productData);
  },

  async getProductById(id) {
    return await firestoreService.getById('products', id);
  },

  async getAllProducts() {
    return await firestoreService.getAll('products');
  },

  async getFeaturedProducts() {
    try {
      // Avoid orderBy on a different field than where to prevent composite index requirement
      return await firestoreService.find('products', [
        { field: 'featured', operator: '==', value: true }
      ], null, 8);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  async updateProduct(id, productData) {
    return await firestoreService.update('products', id, productData);
  },

  async deleteProduct(id) {
    return await firestoreService.delete('products', id);
  }
};

export const orderService = {
  async createOrder(orderData) {
    return await firestoreService.create('orders', orderData);
  },

  async getOrderById(id) {
    return await firestoreService.getById('orders', id);
  },

  async getUserOrders(userId) {
    return await firestoreService.find('orders', [
      { field: 'userId', operator: '==', value: userId }
    ]);
  },

  async updateOrder(id, orderData) {
    return await firestoreService.update('orders', id, orderData);
  },

  // Admin: list all orders (optionally filter client-side)
  async getAllOrders() {
    return await firestoreService.getAll('orders');
  },

  // Admin: update status and append timeline entry
  async updateOrderStatus(orderId, nextStatus, byUserId, note = null) {
    await firestoreService.update('orders', orderId, { status: nextStatus });
    // Create timeline entry
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await addDoc(collection(db, `orders/${orderId}/timeline`), {
        action: 'status_update',
        toStatus: nextStatus,
        byUserId,
        note: note || null,
        at: serverTimestamp(),
      });
    } catch (err) {
      // Non-blocking
      console.error('Failed to write timeline entry:', err);
    }
  }
};

export const appointmentService = {
  async createAppointment(appointmentData) {
    return await firestoreService.create('appointments', appointmentData);
  },

  async getAppointmentById(id) {
    return await firestoreService.getById('appointments', id);
  },

  async getUserAppointments(userId) {
    // No orderBy here to avoid composite index requirement
    return await firestoreService.find('appointments', [
      { field: 'userId', operator: '==', value: userId }
    ]);
  },

  async updateAppointment(id, appointmentData) {
    return await firestoreService.update('appointments', id, appointmentData);
  },

  async deleteAppointment(id) {
    return await firestoreService.delete('appointments', id);
  }
};

export const servicesService = {
  async getAllServices() {
    return await firestoreService.getAll('services');
  },

  async getServiceById(id) {
    return await firestoreService.getById('services', id);
  }
};

export const reviewService = {
  async getReviews() {
    return await firestoreService.getAll('reviews');
  },

  async getUserReviews(userId) {
    return await firestoreService.find('reviews', [{ field: 'userId', operator: '==', value: userId }]);
  },

  async getLatestReviews() {
    // Get latest 10 reviews for Home page scroller, descending by date
    const q = fsQuery(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addReview(reviewData) {
    // 1. Check if review already exists for this user and item
    const q = fsQuery(
      collection(db, 'reviews'),
      where('userId', '==', reviewData.userId),
      where('itemId', '==', reviewData.itemId)
    );
    const existingSnap = await getDocs(q);
    let reviewId;
    let oldRating = 0;
    let isUpdate = false;

    if (!existingSnap.empty) {
      // Update existing review
      isUpdate = true;
      const existingDoc = existingSnap.docs[0];
      reviewId = existingDoc.id;
      oldRating = existingDoc.data().rating || 0;

      const updatePayload = {
        rating: reviewData.rating,
        updatedAt: serverTimestamp()
      };

      // Only update quote if provided (allows star-only updates without wiping text)
      if (reviewData.quote !== undefined && reviewData.quote !== '') {
        updatePayload.quote = reviewData.quote;
      }

      await updateDoc(doc(db, 'reviews', reviewId), updatePayload);
    } else {
      // Create new review
      const reviewPayload = {
        ...reviewData,
        createdAt: serverTimestamp()
      };
      const reviewRef = await addDoc(collection(db, 'reviews'), reviewPayload);
      reviewId = reviewRef.id;
    }

    // 2. Identify target (Product or Service) and update stats
    const targetCollection = reviewData.type === 'service' ? 'services' : 'products';
    const targetId = reviewData.itemId;

    if (targetCollection && targetId) {
      try {
        const itemRef = doc(db, targetCollection, targetId);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          const item = itemSnap.data();
          const currentRating = Number(item.rating) || 0;
          const currentReviews = Number(item.numReviews) || 0;

          let newRating, newReviews;

          if (isUpdate) {
            // Adjust average: remove old rating, add new rating
            // (avg * count - old + new) / count
            const oldTotal = currentRating * currentReviews;
            newRating = (oldTotal - oldRating + Number(reviewData.rating)) / currentReviews;
            newReviews = currentReviews; // Count doesn't change
          } else {
            // Add new rating: (avg * count + new) / (count + 1)
            const oldTotal = currentRating * currentReviews;
            newRating = (oldTotal + Number(reviewData.rating)) / (currentReviews + 1);
            newReviews = currentReviews + 1;
          }

          await updateDoc(itemRef, {
            rating: Number(newRating.toFixed(1)),
            numReviews: newReviews
          });
        }
      } catch (err) {
        console.error(`Failed to update stats for ${targetCollection} ${targetId}:`, err);
      }
    }

    return { id: reviewId, ...reviewData };
  }
};
