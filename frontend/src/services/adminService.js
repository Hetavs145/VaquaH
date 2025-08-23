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
  getFirestore,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

class AdminService {
  // Check if user has admin privileges
  async checkAdminStatus(userId) {
    try {
      if (!userId) {
        return { isAdmin: false, reason: 'No user ID provided' };
      }

      // First check custom claims (most secure method)
      try {
        const idTokenResult = await auth.currentUser?.getIdTokenResult();
        if (idTokenResult?.claims?.role === 'admin') {
          return { isAdmin: true, method: 'custom_claims' };
        }
      } catch (error) {
        console.warn('Could not check custom claims:', error.message);
      }

      // Fallback: Check user document
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          return { isAdmin: true, method: 'user_document' };
        }
      } catch (error) {
        console.warn('Could not check user document:', error.message);
      }

      return { isAdmin: false, reason: 'User does not have admin privileges' };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, reason: 'Error checking admin status' };
    }
  }

  // Initialize required collections for admin services panel
  async initializeAdminCollections() {
    try {
      // Get current user's ID token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to initialize admin collections');
      }

      // Check admin status first
      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can initialize admin collections');
      }

      console.log('Admin collections initialization not required - using direct Firestore access');
      return { 
        success: true, 
        message: 'Admin collections will be created automatically when needed',
        method: 'direct_firestore'
      };
    } catch (error) {
      console.error('Error initializing admin collections:', error);
      throw new Error('Failed to initialize admin collections. Please check your permissions and try again.');
    }
  }

  // Create sample data for testing (optional)
  async createSampleData() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to create sample data');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can create sample data');
      }

      const batch = writeBatch(db);

      // Sample agents
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
        }
      ];

      // Sample agent applications
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
        }
      ];

      // Sample service requests
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
        }
      ];

      // Add sample agents
      sampleAgents.forEach(agent => {
        const docRef = doc(db, 'agents', agent.uid);
        batch.set(docRef, agent);
      });

      // Add sample applications
      sampleApplications.forEach(app => {
        const docRef = doc(db, 'agentApplications', app.uid);
        batch.set(docRef, app);
      });

      // Add sample service requests
      sampleRequests.forEach((request, index) => {
        const docRef = doc(db, 'serviceRequests', `sample-request-${index + 1}`);
        batch.set(docRef, request);
      });

      // Commit the batch
      await batch.commit();

      return {
        success: true,
        message: 'Sample data created successfully',
        dataCreated: {
          agents: sampleAgents.length,
          applications: sampleApplications.length,
          requests: sampleRequests.length
        }
      };
    } catch (error) {
      console.error('Error creating sample data:', error);
      throw error;
    }
  }

  // Get admin dashboard statistics
  async getAdminStats() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to get admin stats');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can access admin stats');
      }

      // Get counts from collections
      const [agentsSnapshot, applicationsSnapshot, requestsSnapshot] = await Promise.all([
        getDocs(collection(db, 'agents')),
        getDocs(collection(db, 'agentApplications')),
        getDocs(collection(db, 'serviceRequests'))
      ]);

      const stats = {
        totalAgents: agentsSnapshot.size,
        totalApplications: applicationsSnapshot.size,
        totalServiceRequests: requestsSnapshot.size,
        activeAgents: agentsSnapshot.docs.filter(doc => doc.data().status === 'active').length,
        pendingApplications: applicationsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        pendingRequests: requestsSnapshot.docs.filter(doc => doc.data().status === 'pending').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to update user roles');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can update user roles');
      }

      // Update user document
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });

      return { success: true, message: `User role updated to ${newRole}` };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to get all users');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can view all users');
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to delete users');
      }

      const adminStatus = await this.checkAdminStatus(currentUser.uid);
      if (!adminStatus.isAdmin) {
        throw new Error('Only administrators can delete users');
      }

      // Delete user document
      await deleteDoc(doc(db, 'users', userId));

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
