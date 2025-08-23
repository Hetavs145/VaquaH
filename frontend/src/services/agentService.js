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
  deleteDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

class AgentService {
  // Apply to become an agent
  async applyAsAgent(agentData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check if user already has an agent application
      const existingApplication = await getDoc(doc(db, 'agentApplications', currentUser.uid));
      if (existingApplication.exists()) {
        throw new Error('Agent application already submitted');
      }

      // Check if user is already an agent
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().role === 'agent') {
        throw new Error('User is already an agent');
      }

      const applicationData = {
        uid: currentUser.uid,
        email: currentUser.email,
        name: agentData.name,
        phone: agentData.phone,
        address: agentData.address,
        city: agentData.city,
        state: agentData.state,
        pincode: agentData.pincode,
        services: agentData.services,
        experience: agentData.experience,
        documents: agentData.documents,
        status: 'pending',
        appliedAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
        notes: ''
      };

      await setDoc(doc(db, 'agentApplications', currentUser.uid), applicationData);

      return { success: true, message: 'Agent application submitted successfully' };
    } catch (error) {
      console.error('Error applying as agent:', error);
      throw error;
    }
  }

  // Get agent application status
  async getAgentApplicationStatus(userId) {
    try {
      const applicationDoc = await getDoc(doc(db, 'agentApplications', userId));
      if (applicationDoc.exists()) {
        return { ...applicationDoc.data(), id: applicationDoc.id };
      }
      return null;
    } catch (error) {
      console.error('Error getting agent application status:', error);
      throw error;
    }
  }

  // Admin: Get all agent applications
  async getAllAgentApplications() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        throw new Error('Admin access required');
      }

      const applicationsRef = collection(db, 'agentApplications');
      const q = query(applicationsRef, orderBy('appliedAt', 'desc'));
      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return applications;
    } catch (error) {
      console.error('Error getting agent applications:', error);
      throw error;
    }
  }

  // Admin: Approve agent application
  async approveAgentApplication(applicationId, approvedBy) {
    try {
      const applicationRef = doc(db, 'agentApplications', applicationId);
      const applicationDoc = await getDoc(applicationRef);
      
      if (!applicationDoc.exists()) {
        throw new Error('Application not found');
      }

      const applicationData = applicationDoc.data();

      // Update application status
      await updateDoc(applicationRef, {
        status: 'approved',
        reviewedBy: approvedBy,
        reviewedAt: serverTimestamp(),
        notes: 'Application approved'
      });

      // Update user role to agent
      await updateDoc(doc(db, 'users', applicationId), {
        role: 'agent',
        updatedAt: serverTimestamp()
      });

      // Create agent profile
      await setDoc(doc(db, 'agents', applicationId), {
        uid: applicationId,
        email: applicationData.email,
        name: applicationData.name,
        phone: applicationData.phone,
        address: applicationData.address,
        city: applicationData.city,
        state: applicationData.state,
        pincode: applicationData.pincode,
        services: applicationData.services,
        experience: applicationData.experience,
        documents: applicationData.documents,
        status: 'active',
        rating: 0,
        totalServices: 0,
        totalEarnings: 0,
        location: {
          latitude: 0,
          longitude: 0,
          lastUpdated: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, message: 'Agent application approved successfully' };
    } catch (error) {
      console.error('Error approving agent application:', error);
      throw error;
    }
  }

  // Admin: Reject agent application
  async rejectAgentApplication(applicationId, reason, rejectedBy) {
    try {
      const applicationRef = doc(db, 'agentApplications', applicationId);
      await updateDoc(applicationRef, {
        status: 'rejected',
        reviewedBy: rejectedBy,
        reviewedAt: serverTimestamp(),
        notes: reason || 'Application rejected'
      });

      return { success: true, message: 'Agent application rejected successfully' };
    } catch (error) {
      console.error('Error rejecting agent application:', error);
      throw error;
    }
  }

  // Get all agents (admin only)
  async getAllAgents() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        throw new Error('Admin access required');
      }

      const agentsRef = collection(db, 'agents');
      const q = query(agentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return agents;
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  }

  // Get agent profile
  async getAgentProfile(userId) {
    try {
      const agentDoc = await getDoc(doc(db, 'agents', userId));
      if (agentDoc.exists()) {
        return { id: agentDoc.id, ...agentDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting agent profile:', error);
      throw error;
    }
  }

  // Update agent location
  async updateAgentLocation(userId, latitude, longitude) {
    try {
      const agentRef = doc(db, 'agents', userId);
      await updateDoc(agentRef, {
        'location.latitude': latitude,
        'location.longitude': longitude,
        'location.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating agent location:', error);
      throw error;
    }
  }

  // Find agents by location (within 5km radius)
  async findAgentsByLocation(latitude, longitude, serviceType = null) {
    try {
      const agentsRef = collection(db, 'agents');
      let q = query(
        agentsRef,
        where('status', '==', 'active'),
        orderBy('rating', 'desc')
      );

      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter by distance and service type
      const nearbyAgents = agents.filter(agent => {
        if (!agent.location || !agent.location.latitude || !agent.location.longitude) {
          return false;
        }

        // Calculate distance using Haversine formula
        const distance = this.calculateDistance(
          latitude,
          longitude,
          agent.location.latitude,
          agent.location.longitude
        );

        // Check if within 5km radius
        if (distance > 5) {
          return false;
        }

        // Check service type if specified
        if (serviceType && agent.services && !agent.services.includes(serviceType)) {
          return false;
        }

        return true;
      });

      return nearbyAgents;
    } catch (error) {
      console.error('Error finding agents by location:', error);
      throw error;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Create service request
  async createServiceRequest(serviceData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const serviceRequest = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: serviceData.userName,
        userPhone: serviceData.userPhone,
        userAddress: serviceData.userAddress,
        serviceType: serviceData.serviceType,
        description: serviceData.description,
        preferredDate: serviceData.preferredDate,
        preferredTime: serviceData.preferredTime,
        status: 'pending',
        assignedAgent: null,
        agentId: null,
        estimatedPrice: serviceData.estimatedPrice,
        finalPrice: null,
        paymentStatus: 'pending',
        paymentMethod: serviceData.paymentMethod,
        adminCut: 0.15, // 15% admin cut
        agentCut: 0.85, // 85% agent cut
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'serviceRequests'), serviceRequest);
      return { id: docRef.id, ...serviceRequest };
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  // Get service requests for user
  async getUserServiceRequests(userId) {
    try {
      const requestsRef = collection(db, 'serviceRequests');
      const q = query(
        requestsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return requests;
    } catch (error) {
      console.error('Error getting user service requests:', error);
      throw error;
    }
  }

  // Get service requests for agent
  async getAgentServiceRequests(agentId) {
    try {
      const requestsRef = collection(db, 'serviceRequests');
      const q = query(
        requestsRef,
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return requests;
    } catch (error) {
      console.error('Error getting agent service requests:', error);
      throw error;
    }
  }

  // Admin: Get all service requests
  async getAllServiceRequests() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        throw new Error('Admin access required');
      }

      const requestsRef = collection(db, 'serviceRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return requests;
    } catch (error) {
      console.error('Error getting all service requests:', error);
      throw error;
    }
  }

  // Assign agent to service request
  async assignAgentToService(serviceId, agentId, assignedBy) {
    try {
      const serviceRef = doc(db, 'serviceRequests', serviceId);
      const agentDoc = await getDoc(doc(db, 'agents', agentId));
      
      if (!agentDoc.exists()) {
        throw new Error('Agent not found');
      }

      const agentData = agentDoc.data();

      await updateDoc(serviceRef, {
        agentId: agentId,
        assignedAgent: agentData.name,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        assignedBy: assignedBy,
        updatedAt: serverTimestamp()
      });

      return { success: true, message: 'Agent assigned successfully' };
    } catch (error) {
      console.error('Error assigning agent:', error);
      throw error;
    }
  }

  // Update service request status
  async updateServiceStatus(serviceId, status, notes = '') {
    try {
      const serviceRef = doc(db, 'serviceRequests', serviceId);
      await updateDoc(serviceRef, {
        status: status,
        notes: notes,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating service status:', error);
      throw error;
    }
  }

  // Complete service and handle payment
  async completeService(serviceId, finalPrice, paymentMethod) {
    try {
      const serviceRef = doc(db, 'serviceRequests', serviceId);
      const serviceDoc = await getDoc(serviceRef);
      
      if (!serviceDoc.exists()) {
        throw new Error('Service request not found');
      }

      const serviceData = serviceDoc.data();
      const adminAmount = finalPrice * serviceData.adminCut;
      const agentAmount = finalPrice * serviceData.agentCut;

      await updateDoc(serviceRef, {
        status: 'completed',
        finalPrice: finalPrice,
        paymentStatus: 'completed',
        paymentMethod: paymentMethod,
        adminAmount: adminAmount,
        agentAmount: agentAmount,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update agent stats
      const agentRef = doc(db, 'agents', serviceData.agentId);
      await updateDoc(agentRef, {
        totalServices: serviceData.totalServices + 1,
        totalEarnings: serviceData.totalEarnings + agentAmount,
        updatedAt: serverTimestamp()
      });

      return { success: true, adminAmount, agentAmount };
    } catch (error) {
      console.error('Error completing service:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
export default agentService;