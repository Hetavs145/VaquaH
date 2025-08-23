import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Configure CORS with specific origins for better security
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://vaquah-react.web.app',
    'https://vaquah-react.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const corsHandler = cors(corsOptions);

// Initialize required collections for admin services panel
export const initializeAdminCollections = functions.https.onRequest(async (req, res) => {
  // Handle CORS
  corsHandler(req, res, async () => {
    try {
      // Check if user is authenticated via Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication token required' 
        });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (verifyError) {
        res.status(401).json({ 
          error: 'Invalid token', 
          message: 'Authentication token is invalid' 
        });
        return;
      }

      // Check if the requesting user is an admin
      const requestingUser = await admin.auth().getUser(decodedToken.uid);
      if (requestingUser.customClaims?.role !== 'admin') {
        res.status(403).json({ 
          error: 'Permission denied', 
          message: 'Only admins can initialize collections' 
        });
        return;
      }

      const db = admin.firestore();
      
      // Initialize agents collection with sample data
      const agentsRef = db.collection('agents');
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
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      // Initialize agentApplications collection with sample data
      const applicationsRef = db.collection('agentApplications');
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
          appliedAt: admin.firestore.FieldValue.serverTimestamp(),
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
          appliedAt: admin.firestore.FieldValue.serverTimestamp(),
          reviewedBy: null,
          reviewedAt: null,
          notes: ''
        }
      ];

      // Initialize serviceRequests collection with sample data
      const requestsRef = db.collection('serviceRequests');
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      // Create the collections with sample data
      const batch = db.batch();

      // Add sample agents
      sampleAgents.forEach(agent => {
        const docRef = agentsRef.doc(agent.uid);
        batch.set(docRef, agent);
      });

      // Add sample applications
      sampleApplications.forEach(app => {
        const docRef = applicationsRef.doc(app.uid);
        batch.set(docRef, app);
      });

      // Add sample service requests
      sampleRequests.forEach((request, index) => {
        const docRef = requestsRef.doc(`sample-request-${index + 1}`);
        batch.set(docRef, request);
      });

      // Commit the batch
      await batch.commit();

      res.status(200).json({
        success: true,
        message: 'Admin collections initialized successfully',
        collectionsCreated: ['agents', 'agentApplications', 'serviceRequests'],
        sampleDataAdded: {
          agents: sampleAgents.length,
          applications: sampleApplications.length,
          requests: sampleRequests.length
        }
      });

    } catch (error) {
      console.error('Error initializing admin collections:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to initialize admin collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Health check endpoint for testing
export const healthCheck = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      function: 'healthCheck',
      cors: 'enabled'
    });
  });
});