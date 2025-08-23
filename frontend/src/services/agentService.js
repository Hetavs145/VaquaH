import { agentService as firestoreAgentService, agentApplicationService as firestoreAgentApplicationService, serviceRequestService as firestoreServiceRequestService } from './firestoreService';
import { auth } from '@/lib/firebase';

export const agentService = {
  // Apply to become an agent
  async applyAsAgent(agentData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check if user already has an agent application
      const existingApplication = await firestoreAgentApplicationService.getAgentApplicationById(currentUser.uid);
      if (existingApplication) {
        throw new Error('Agent application already submitted');
      }

      // Check if user is already an agent
      const userDoc = await firestoreAgentService.getAgentById(currentUser.uid);
      if (userDoc) {
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
        appliedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        notes: ''
      };

      await firestoreAgentApplicationService.createAgentApplication(applicationData);

      return { success: true, message: 'Agent application submitted successfully' };
    } catch (error) {
      console.error('Error applying as agent:', error);
      throw error;
    }
  },

  // Get agent application status
  async getAgentApplicationStatus(userId) {
    try {
      return await firestoreAgentApplicationService.getAgentApplicationById(userId);
    } catch (error) {
      console.error('Error getting agent application status:', error);
      throw error;
    }
  },

  // Admin: Get all agent applications
  async getAllAgentApplications() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status - this will be handled by Firestore rules
      return await firestoreAgentApplicationService.getAllAgentApplications();
    } catch (error) {
      console.error('Error getting agent applications:', error);
      throw error;
    }
  },

  // Admin: Get all agents
  async getAllAgents() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status - this will be handled by Firestore rules
      return await firestoreAgentService.getAllAgents();
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  },

  // Admin: Get all service requests
  async getAllServiceRequests() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check admin status - this will be handled by Firestore rules
      return await firestoreServiceRequestService.getAllServiceRequests();
    } catch (error) {
      console.error('Error getting service requests:', error);
      throw error;
    }
  },

  // Get agent by ID
  async getAgentById(agentId) {
    try {
      return await firestoreAgentService.getAgentById(agentId);
    } catch (error) {
      console.error('Error getting agent:', error);
      throw error;
    }
  },

  // Update agent
  async updateAgent(agentId, agentData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      return await firestoreAgentService.updateAgent(agentId, agentData);
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  // Delete agent
  async deleteAgent(agentId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      return await firestoreAgentService.deleteAgent(agentId);
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  // Update agent application status
  async updateAgentApplicationStatus(applicationId, status, adminNotes = '') {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        status,
        reviewedBy: currentUser.uid,
        reviewedAt: new Date().toISOString(),
        notes: adminNotes
      };

      return await firestoreAgentApplicationService.updateAgentApplication(applicationId, updateData);
    } catch (error) {
      console.error('Error updating agent application status:', error);
      throw error;
    }
  },

  // Update service request status
  async updateServiceRequestStatus(requestId, status, adminNotes = '') {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      return await firestoreServiceRequestService.updateServiceRequestStatus(requestId, status, currentUser.uid, adminNotes);
    } catch (error) {
      console.error('Error updating service request status:', error);
      throw error;
    }
  },

  // Assign agent to service request
  async assignAgentToRequest(requestId, agentId) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get agent details
      const agent = await firestoreAgentService.getAgentById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const updateData = {
        agentId,
        assignedAgent: agent.name,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      };

      return await firestoreServiceRequestService.updateServiceRequest(requestId, updateData);
    } catch (error) {
      console.error('Error assigning agent to request:', error);
      throw error;
    }
  },

  // Approve agent application
  async approveAgentApplication(applicationId, approvedBy) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update application status
      await firestoreAgentApplicationService.updateAgentApplication(applicationId, {
        status: 'approved',
        reviewedBy: approvedBy,
        reviewedAt: new Date().toISOString(),
        notes: 'Application approved'
      });

      // Get application data to create agent profile
      const application = await firestoreAgentApplicationService.getAgentApplicationById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Create agent profile
      const agentData = {
        uid: application.uid,
        email: application.email,
        name: application.name,
        phone: application.phone,
        address: application.address,
        city: application.city,
        state: application.state,
        pincode: application.pincode,
        services: application.services,
        experience: application.experience,
        documents: application.documents,
        status: 'active',
        rating: 0,
        totalServices: 0,
        totalEarnings: 0,
        location: {
          latitude: 0,
          longitude: 0,
          lastUpdated: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await firestoreAgentService.createAgent(agentData);

      return { success: true, message: 'Agent application approved successfully' };
    } catch (error) {
      console.error('Error approving agent application:', error);
      throw error;
    }
  },

  // Reject agent application
  async rejectAgentApplication(applicationId, reason, rejectedBy) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      await firestoreAgentApplicationService.updateAgentApplication(applicationId, {
        status: 'rejected',
        reviewedBy: rejectedBy,
        reviewedAt: new Date().toISOString(),
        notes: reason || 'Application rejected'
      });

      return { success: true, message: 'Agent application rejected successfully' };
    } catch (error) {
      console.error('Error rejecting agent application:', error);
      throw error;
    }
  },

  // Assign agent to service (alias for assignAgentToRequest)
  async assignAgentToService(serviceId, agentId, assignedBy) {
    return await this.assignAgentToRequest(serviceId, agentId);
  },

  // Complete service and handle payment
  async completeService(serviceId, finalPrice, paymentMethod) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get service request
      const serviceRequest = await firestoreServiceRequestService.getServiceRequestById(serviceId);
      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      const adminCut = 0.15; // 15% admin cut
      const agentCut = 0.85; // 85% agent cut
      const adminAmount = finalPrice * adminCut;
      const agentAmount = finalPrice * agentCut;

      // Update service request
      await firestoreServiceRequestService.updateServiceRequest(serviceId, {
        status: 'completed',
        finalPrice: finalPrice,
        paymentStatus: 'completed',
        paymentMethod: paymentMethod,
        adminAmount: adminAmount,
        agentAmount: agentAmount,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update agent stats if agent is assigned
      if (serviceRequest.agentId) {
        const agent = await firestoreAgentService.getAgentById(serviceRequest.agentId);
        if (agent) {
          await firestoreAgentService.updateAgent(serviceRequest.agentId, {
            totalServices: (agent.totalServices || 0) + 1,
            totalEarnings: (agent.totalEarnings || 0) + agentAmount,
            updatedAt: new Date().toISOString()
          });
        }
      }

      return { success: true, adminAmount, agentAmount };
    } catch (error) {
      console.error('Error completing service:', error);
      throw error;
    }
  }
};