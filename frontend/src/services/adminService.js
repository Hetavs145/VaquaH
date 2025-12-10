import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc
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
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          isAdmin: userData.role === 'admin',
          role: userData.role || 'user',
          email: userData.email
        };
      }
      return { isAdmin: false, role: 'user' };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, role: 'user' };
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
      throw new Error('Failed to list admin requests');
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Insufficient permissions. Admin access required.');
      }

      let ordersRef = collection(db, 'orders');
      let q = ordersRef;

      if (statusFilter) {
        q = query(q, where('status', '==', statusFilter));
      }
      if (userIdFilter) {
        q = query(q, where('userId', '==', userIdFilter));
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Insufficient permissions. Admin access required.');
      }

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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Insufficient permissions. Admin access required.');
      }

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
  async updateOrderStatus(orderId, nextStatus, note = '', byUserId = 'admin') {
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
        by: byUserId,
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
        timestamp: serverTimestamp()
      });
      return { id: orderId, shippingId };
    } catch (error) {
      console.error('Error updating order shipping:', error);
      throw new Error('Failed to update order shipping');
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
        updatedAt: serverTimestamp()
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

  // Get all appointments (admin only)
  async getAllAppointments(statusFilter = null, userIdFilter = null) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Insufficient permissions. Admin access required.');
      }

      let appointmentsRef = collection(db, 'appointments');
      let q = appointmentsRef;

      if (statusFilter) {
        q = query(q, where('status', '==', statusFilter));
      }
      if (userIdFilter) {
        q = query(q, where('userId', '==', userIdFilter));
      }

      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return appointments;
    } catch (error) {
      console.error('Error fetching admin appointments:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to appointments collection.');
      }
      if (error.message.includes('Insufficient permissions')) {
        throw error;
      }
      throw new Error('Failed to fetch appointments. Please try again.');
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, nextStatus, note = '', byUserId = 'admin') {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'appointments', appointmentId, 'timeline'), {
        action: `Status updated to ${nextStatus}`,
        status: nextStatus,
        note,
        by: byUserId,
        timestamp: serverTimestamp()
      });

      return { id: appointmentId, status: nextStatus };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }
  // Delete order
  async deleteOrder(orderId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      return { id: orderId };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  // Delete appointment
  async deleteAppointment(appointmentId) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
      return { id: appointmentId };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw new Error('Failed to delete appointment');
    }
  }

  // Update product stock
  async updateProductStock(productId, inStock) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        inStock: inStock,
        updatedAt: serverTimestamp()
      });
      return { id: productId, inStock };
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw new Error('Failed to update product stock');
    }
  }

  // Get all services
  async getAllServices() {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  // Create service
  async createService(serviceData) {
    try {
      const servicesRef = collection(db, 'services');
      const newService = {
        ...serviceData,
        price: Number(serviceData.price),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(servicesRef, newService);
      return { id: docRef.id, ...newService };
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  // Update service
  async updateService(serviceId, serviceData) {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      const updateData = {
        ...serviceData,
        price: Number(serviceData.price),
        updatedAt: serverTimestamp()
      };
      await updateDoc(serviceRef, updateData);
      return { id: serviceId, ...updateData };
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  // Delete service
  async deleteService(serviceId) {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await deleteDoc(serviceRef);
      return { id: serviceId };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }
}

export const adminService = new AdminService();
export default adminService;
