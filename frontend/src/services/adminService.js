import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  addDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase'; // Added missing import for auth

class AdminService {
  // Ensure user document exists and has correct role
  async ensureUserDocument(userId, userEmail, userName) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          uid: userId,
          email: userEmail,
          name: userName || userEmail?.split('@')[0] || 'User',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { role: 'user', isAdmin: false };
      }
      
      const userData = userDoc.data();
      return {
        role: userData.role || 'user',
        isAdmin: userData.role === 'admin'
      };
    } catch (error) {
      console.error('Error ensuring user document:', error);
      return { role: 'user', isAdmin: false };
    }
  }

  async checkAdminStatus(userId) {
    try {
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const isAdmin = !snapshot.empty && snapshot.docs[0].data().active !== false;
      return { isAdmin };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false };
    }
  }

  async requestAdminAccess(userId, userEmail) {
    try {
      const existingRequest = await getDoc(doc(db, 'adminRequests', userId));
      if (existingRequest.exists()) {
        return { success: false, message: 'Admin request already submitted' };
      }

      await setDoc(doc(db, 'adminRequests', userId), {
        uid: userId,
        email: userEmail,
        requestedAt: serverTimestamp(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        notes: ''
      });

      return { success: true, message: 'Admin access request submitted successfully. An existing admin will review your request.' };
    } catch (error) {
      console.error('Error requesting admin access:', error);
      throw new Error('Failed to submit admin request');
    }
  }

  async listAdminRequests() {
    try {
      const requestsRef = collection(db, 'adminRequests');
      const q = query(requestsRef, orderBy('requestedAt', 'desc'));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { requests };
    } catch (error) {
      console.error('Error listing admin requests:', error);
      return { requests: [] };
    }
  }

  async grantAdminAccess(targetUserId) {
    try {
      await addDoc(collection(db, 'admins'), {
        userId: targetUserId,
        grantedAt: serverTimestamp(),
        grantedBy: auth?.currentUser?.uid || 'system',
        active: true
      });

      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_granted',
        grantedTo: targetUserId,
        by: auth?.currentUser?.uid || 'system',
        at: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error granting admin access:', error);
      return { success: false, error: error.message };
    }
  }

  async denyAdminAccess(targetUserId) {
    try {
      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_denied',
        deniedTo: targetUserId,
        by: auth?.currentUser?.uid || 'system',
        at: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error denying admin access:', error);
      return { success: false, error: error.message };
    }
  }

  async removeAdminAccess(targetUserId) {
    try {
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('userId', '==', targetUserId));
      const snapshot = await getDocs(q);

      for (const d of snapshot.docs) {
        await updateDoc(doc(db, 'admins', d.id), { active: false, updatedAt: serverTimestamp() });
      }

      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_removed',
        removedFrom: targetUserId,
        by: auth?.currentUser?.uid || 'system',
        at: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing admin access:', error);
      return { success: false, error: error.message };
    }
  }

  async grantAdminRole(targetUserId, targetEmail, grantedByUserId) {
    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        role: 'admin',
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'adminRequests', targetUserId), {
        status: 'approved',
        reviewedBy: grantedByUserId,
        reviewedAt: serverTimestamp(),
        notes: 'Approved by existing admin'
      });

      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_granted',
        grantedTo: targetUserId,
        grantedBy: grantedByUserId,
        timestamp: serverTimestamp(),
        targetEmail: targetEmail
      });

      return { success: true, message: `Admin role granted to ${targetEmail}` };
    } catch (error) {
      console.error('Error granting admin role:', error);
      throw new Error('Failed to grant admin role');
    }
  }

  async denyAdminRequest(targetUserId, reason, deniedByUserId) {
    try {
      await updateDoc(doc(db, 'adminRequests', targetUserId), {
        status: 'denied',
        reviewedBy: deniedByUserId,
        reviewedAt: serverTimestamp(),
        notes: reason || 'Denied by admin'
      });

      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_denied',
        deniedTo: targetUserId,
        deniedBy: deniedByUserId,
        timestamp: serverTimestamp(),
        reason: reason || 'No reason provided'
      });

      return { success: true, message: 'Admin request denied successfully' };
    } catch (error) {
      console.error('Error denying admin request:', error);
      throw new Error('Failed to deny admin request');
    }
  }

  async removeAdminRole(targetUserId, removedByUserId, reason) {
    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        role: 'user',
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'adminLogs'), {
        action: 'admin_removed',
        removedFrom: targetUserId,
        removedBy: removedByUserId,
        timestamp: serverTimestamp(),
        reason: reason || 'Removed by admin'
      });

      return { success: true, message: 'Admin role removed successfully' };
    } catch (error) {
      console.error('Error removing admin role:', error);
      throw new Error('Failed to remove admin role');
    }
  }

  // Get all orders (admin only)
  async getAllOrders(statusFilter = null, userIdFilter = null) {
    try {
      let ordersRef = collection(db, 'orders');
      let q = ordersRef;

      // Apply filters only if provided
      const clauses = [];
      if (statusFilter) clauses.push(where('status', '==', statusFilter));
      if (userIdFilter) clauses.push(where('userId', '==', userIdFilter));
      if (clauses.length === 1) {
        const [c] = clauses;
        q = query(ordersRef, c);
      } else if (clauses.length === 2) {
        const [a, b] = clauses;
        q = query(ordersRef, a, b);
      }

      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return orders;
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to orders collection.');
      }
      if (error.message.includes('Insufficient permissions')) {
        throw error;
      }
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }

  // Get all products (admin only)
  async getAllProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return products;
    } catch (error) {
      console.error('Error fetching admin products:', error);
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to products collection.');
      }
      if (error.message.includes('Insufficient permissions')) {
        throw error;
      }
      throw new Error('Failed to fetch products. Please try again.');
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return users;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to users collection.');
      }
      if (error.message.includes('Insufficient permissions')) {
        throw error;
      }
      throw new Error('Failed to fetch users. Please try again.');
    }
  }

  // Update order status
  async updateOrderStatus(orderId, nextStatus, note = '', byUserId = '') {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'orders', orderId, 'timeline'), {
        action: `Status updated to ${nextStatus}`,
        status: nextStatus,
        note,
        by: byUserId || auth?.currentUser?.uid || 'system',
        timestamp: serverTimestamp()
      });

      return { id: orderId, status: nextStatus };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Update order shipping ID/AWB
  async updateOrderShipping(orderId, shippingId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        shippingId: shippingId || '',
        updatedAt: serverTimestamp()
      });
      await addDoc(collection(db, 'orders', orderId, 'timeline'), {
        action: 'shipping_updated',
        shippingId: shippingId || '',
        by: auth?.currentUser?.uid || 'system',
        timestamp: serverTimestamp()
      });
      return { id: orderId, shippingId };
    } catch (error) {
      console.error('Error updating order shipping:', error);
      throw new Error('Failed to update order shipping');
    }
  }

  // Offers
  async getOffers() {
    try {
      const offersRef = collection(db, 'offers');
      const snapshot = await getDocs(offersRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching offers:', e);
      return [];
    }
  }

  async createOffer(offer) {
    try {
      const ref = await addDoc(collection(db, 'offers'), {
        ...offer,
        createdAt: serverTimestamp(),
        createdBy: auth?.currentUser?.uid || 'system'
      });
      return { id: ref.id, ...offer };
    } catch (e) {
      console.error('Error creating offer:', e);
      return null;
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      const productRef = collection(db, 'products');
      const newProduct = {
        ...productData,
        price: Number(productData.price),
        featured: Boolean(productData.featured),
        inStock: Boolean(productData.inStock),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth?.currentUser?.uid || 'system'
      };
      
      const docRef = await addDoc(productRef, newProduct);
      return { id: docRef.id, ...newProduct };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Update existing product
  async updateProduct(productId, productData) {
    try {
      const productRef = doc(db, 'products', productId);
      const updateData = {
        ...productData,
        price: Number(productData.price),
        featured: Boolean(productData.featured),
        inStock: Boolean(productData.inStock),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(productRef, updateData);
      return { id: productId, ...updateData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      return { id: productId };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}

export const adminService = new AdminService();
export default adminService;
