import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc,
  getFirestore
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../lib/firebase';

const functions = getFunctions(app);

class AdminService {
  // Initialize required collections for admin services panel
  async initializeAdminCollections() {
    try {
      // Try to use Firebase function first
      try {
        const initializeCollections = httpsCallable(functions, 'initializeAdminCollections');
        const result = await initializeCollections();
        return result.data;
      } catch (functionError) {
        // Log error for debugging but don't expose to user
        console.warn('Firebase function not available, creating collections directly:', functionError.message);
        
        // Fallback: Create collections directly in frontend
        return await this.createCollectionsDirectly();
      }
    } catch (error) {
      // Log error for debugging but don't expose to user
      console.warn('Error initializing admin collections:', error.message);
      throw new Error('Failed to initialize admin collections. Please try again later.');
    }
  }

  // Fallback method to create collections directly
  async createCollectionsDirectly() {
    try {
      const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore(app);
      
      // Sample data for agents
      const sampleAgents = [
        {
          uid: 'sample-agent-1',
          email: 'agent1@example.com',
          name: 'John Doe',
          phone: '+1234567890',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          services: ['AC Repair', 'AC Installation'],
          experience: '5 years',
          documents: ['license.pdf', 'insurance.pdf'],
          status: 'active',
          rating: 4.5,
          totalServices: 25,
          totalEarnings: 2500,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            lastUpdated: serverTimestamp()
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          uid: 'sample-agent-2',
          email: 'agent2@example.com',
          name: 'Jane Smith',
          phone: '+1234567891',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          pincode: '90210',
          services: ['AC Maintenance', 'AC Cleaning'],
          experience: '3 years',
          documents: ['certification.pdf', 'background-check.pdf'],
          status: 'active',
          rating: 4.8,
          totalServices: 18,
          totalEarnings: 1800,
          location: {
            latitude: 34.0522,
            longitude: -118.2437,
            lastUpdated: serverTimestamp()
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Sample data for agent applications
      const sampleApplications = [
        {
          uid: 'sample-app-1',
          email: 'applicant1@example.com',
          name: 'Mike Johnson',
          phone: '+1234567892',
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          pincode: '60601',
          services: ['AC Repair', 'Heating Repair'],
          experience: '4 years',
          documents: ['resume.pdf', 'references.pdf'],
          status: 'pending',
          appliedAt: serverTimestamp(),
          reviewedBy: null,
          reviewedAt: null,
          notes: ''
        },
        {
          uid: 'sample-app-2',
          email: 'applicant2@example.com',
          name: 'Sarah Wilson',
          phone: '+1234567893',
          address: '321 Elm St',
          city: 'Houston',
          state: 'TX',
          pincode: '77001',
          services: ['AC Installation', 'AC Maintenance'],
          experience: '6 years',
          documents: ['certification.pdf', 'portfolio.pdf'],
          status: 'pending',
          appliedAt: serverTimestamp(),
          reviewedBy: null,
          reviewedAt: null,
          notes: ''
        }
      ];

      // Sample data for service requests
      const sampleRequests = [
        {
          userId: 'sample-user-1',
          userName: 'Customer One',
          userEmail: 'customer1@example.com',
          userPhone: '+1234567894',
          serviceType: 'AC Repair',
          description: 'AC not cooling properly, making strange noises',
          address: '123 Customer St',
          city: 'Miami',
          state: 'FL',
          pincode: '33101',
          preferredDate: '2024-01-15',
          preferredTime: '10:00 AM',
          status: 'pending',
          priority: 'medium',
          estimatedPrice: 150,
          adminCut: 0.15,
          agentCut: 0.85,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          userId: 'sample-user-2',
          userName: 'Customer Two',
          userEmail: 'customer2@example.com',
          userPhone: '+1234567895',
          serviceType: 'AC Installation',
          description: 'Need new AC unit installed in living room',
          address: '456 Customer Ave',
          city: 'Phoenix',
          state: 'AZ',
          pincode: '85001',
          preferredDate: '2024-01-20',
          preferredTime: '2:00 PM',
          status: 'assigned',
          priority: 'high',
          estimatedPrice: 800,
          adminCut: 0.15,
          agentCut: 0.85,
          agentId: 'sample-agent-1',
          assignedAgent: 'John Doe',
          assignedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Create collections with sample data
      const batch = [];
      
      // Add sample agents
      sampleAgents.forEach(agent => {
        batch.push(setDoc(doc(db, 'agents', agent.uid), agent));
      });

      // Add sample applications
      sampleApplications.forEach(app => {
        batch.push(setDoc(doc(db, 'agentApplications', app.uid), app));
      });

      // Add sample service requests
      sampleRequests.forEach((request, index) => {
        batch.push(setDoc(doc(db, 'serviceRequests', `sample-request-${index + 1}`), request));
      });

      // Execute all operations
      await Promise.all(batch);

      return {
        success: true,
        message: 'Admin collections initialized successfully (direct method)',
        collectionsCreated: ['agents', 'agentApplications', 'serviceRequests'],
        sampleDataAdded: {
          agents: sampleAgents.length,
          applications: sampleApplications.length,
          requests: sampleRequests.length
        }
      };

    } catch (error) {
      // Log error for debugging but don't expose to user
      console.warn('Error creating collections directly:', error.message);
      throw new Error('Failed to create collections. Please check your permissions and try again.');
    }
  }

  // Check if collections exist and have data
  async checkCollectionsStatus() {
    try {
      const db = getFirestore(app);
      
      const collections = ['agents', 'agentApplications', 'serviceRequests'];
      const status = {};
      
      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));
          status[collectionName] = {
            exists: true,
            count: querySnapshot.size,
            hasData: querySnapshot.size > 0
          };
        } catch (error) {
          status[collectionName] = {
            exists: false,
            count: 0,
            hasData: false,
            error: error.message
          };
        }
      }
      
      return status;
    } catch (error) {
      // Log error for debugging but don't expose to user
      console.warn('Error checking collections status:', error.message);
      throw new Error('Failed to check collections status. Please try again later.');
    }
  }

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
      // First check custom claims (more secure)
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        try {
          const token = await currentUser.getIdTokenResult();
          if (token.claims && token.claims.role === 'admin') {
            return {
              isAdmin: true,
              role: 'admin',
              email: currentUser.email
            };
          }
        } catch (tokenError) {
          console.log('Token claims check failed, falling back to document check:', tokenError);
        }
      }
      
      // Fallback to document check
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

  // Debug method to troubleshoot admin access issues
  async debugAdminAccess() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return {
          authenticated: false,
          uid: null,
          error: 'No authenticated user'
        };
      }

      // Get user document
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        return {
          authenticated: true,
          uid: currentUser.uid,
          userDocExists: false,
          error: 'User document does not exist'
        };
      }

      const userData = userDoc.data();
      return {
        authenticated: true,
        uid: currentUser.uid,
        userDocExists: true,
        userRole: userData.role,
        isAdmin: userData.role === 'admin',
        userData: userData
      };
    } catch (error) {
      return {
        authenticated: auth.currentUser !== null,
        uid: auth.currentUser?.uid,
        error: error.message,
        errorCode: error.code
      };
    }
  }

  // Get all orders (admin only)
  async getAllOrders(statusFilter = null, userIdFilter = null) {
    try {
      // First verify admin status to ensure we have permission
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status before attempting to fetch orders
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
      
      // Handle specific Firebase permission errors
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to orders collection.');
      }
      
      if (error.message.includes('Insufficient permissions')) {
        throw error; // Re-throw our custom permission errors
      }
      
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }

  // Get all products (admin only)
  async getAllProducts() {
    try {
      // First verify admin status to ensure we have permission
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status before attempting to fetch products
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
      
      // Handle specific Firebase permission errors
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to products collection.');
      }
      
      if (error.message.includes('Insufficient permissions')) {
        throw error; // Re-throw our custom permission errors
      }
      
      throw new Error('Failed to fetch products. Please try again.');
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      // First verify admin status to ensure we have permission
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status before attempting to fetch users
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
      
      // Handle specific Firebase permission errors
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. This usually means the Firestore rules need to be updated.');
        throw new Error('Firebase permission denied. Please ensure Firestore rules allow admin access to users collection.');
      }
      
      if (error.message.includes('Insufficient permissions')) {
        throw error; // Re-throw our custom permission errors
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

      // Add to timeline
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
      await updateDoc(productRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      return { id: productId };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}

export const adminService = new AdminService();
export default adminService;
