const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Production-ready admin management system

// 1. Request admin access (any authenticated user can request)
exports.requestAdminAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid, email } = context.auth;
  
  try {
    // Check if user already has admin role
    const userRecord = await admin.auth().getUser(uid);
    if (userRecord.customClaims?.role === 'admin') {
      return {
        success: true,
        message: 'You already have admin access',
        isAdmin: true
      };
    }

    // Create admin request in Firestore
    const adminRequestsRef = admin.firestore().collection('adminRequests');
    await adminRequestsRef.doc(uid).set({
      uid,
      email,
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      notes: ''
    });

    return {
      success: true,
      message: 'Admin access request submitted successfully. An existing admin will review your request.',
      isAdmin: false
    };
  } catch (error) {
    console.error('Error requesting admin access:', error);
    throw new functions.https.HttpsError('internal', 'Failed to submit admin request');
  }
});

// 2. Check admin status
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = context.auth;
  
  try {
    const userRecord = await admin.auth().getUser(uid);
    const isAdmin = userRecord.customClaims?.role === 'admin';
    
    return {
      isAdmin,
      claims: userRecord.customClaims,
      email: userRecord.email
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check admin status');
  }
});

// 3. Grant admin role (only existing admins can do this)
exports.grantAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if the requesting user is already an admin
  const requestingUser = await admin.auth().getUser(context.auth.uid);
  if (requestingUser.customClaims?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only existing admins can grant admin roles');
  }

  const { targetUid, targetEmail } = data;
  
  if (!targetUid && !targetEmail) {
    throw new functions.https.HttpsError('invalid-argument', 'Target UID or email is required');
  }

  try {
    let targetUser;
    if (targetUid) {
      targetUser = await admin.auth().getUser(targetUid);
    } else {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    }

    // Grant admin role
    await admin.auth().setCustomUserClaims(targetUser.uid, { role: 'admin' });

    // Update user document in Firestore
    const userRef = admin.firestore().collection('users').doc(targetUser.uid);
    await userRef.set({
      uid: targetUser.uid,
      email: targetUser.email,
      name: targetUser.displayName || targetUser.email?.split('@')[0] || 'User',
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      message: `Admin role granted to ${targetUser.email}`,
      targetUid: targetUser.uid
    };
  } catch (error) {
    console.error('Error granting admin role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to grant admin role');
  }
});

// 4. List admin requests (only admins can see)
exports.listAdminRequests = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userRecord = await admin.auth().getUser(context.auth.uid);
  if (userRecord.customClaims?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can view admin requests');
  }

  try {
    const adminRequestsRef = admin.firestore().collection('adminRequests');
    const snapshot = await adminRequestsRef.orderBy('requestedAt', 'desc').get();
    
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { requests };
  } catch (error) {
    console.error('Error listing admin requests:', error);
    throw new functions.https.HttpsError('internal', 'Failed to list admin requests');
  }
});

// 5. Deny admin request
exports.denyAdminRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userRecord = await admin.auth().getUser(context.auth.uid);
  if (userRecord.customClaims?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can deny admin requests');
  }

  const { targetUid, reason } = data;
  
  try {
    // Update admin request status
    const adminRequestsRef = admin.firestore().collection('adminRequests');
    await adminRequestsRef.doc(targetUid).update({
      status: 'denied',
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: reason || 'Denied by admin'
    });

    // Log the action
    await admin.firestore().collection('adminLogs').add({
      action: 'admin_denied',
      deniedTo: targetUid,
      deniedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reason: reason || 'No reason provided'
    });

    return {
      success: true,
      message: 'Admin request denied successfully'
    };
  } catch (error) {
    console.error('Error denying admin request:', error);
    throw new functions.https.HttpsError('internal', 'Failed to deny admin request');
  }
});

// 6. Remove admin role (only super admins or the user themselves)
exports.removeAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUid } = data;
  const requestingUser = await admin.auth().getUser(context.auth.uid);
  
  // Only allow if requesting user is admin or removing their own role
  if (requestingUser.customClaims?.role !== 'admin' && context.auth.uid !== targetUid) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    // Remove admin role
    await admin.auth().setCustomUserClaims(targetUid, { role: null });

    // Log the action
    await admin.firestore().collection('adminLogs').add({
      action: 'admin_removed',
      removedFrom: targetUid,
      removedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      reason: context.auth.uid === targetUid ? 'Self-removal' : 'Removed by admin'
    });

    return {
      success: true,
      message: 'Admin role removed successfully'
    };
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to remove admin role');
  }
});

// 5. Automatic order deletion after 10 minutes of success status
exports.scheduleOrderDeletion = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const orderId = context.params.orderId;

    // Check if status changed to 'success'
    if (newData.status === 'success' && previousData.status !== 'success') {
      console.log(`Order ${orderId} marked as success, scheduling deletion in 10 minutes`);
      
      // Schedule deletion after 10 minutes (600,000 milliseconds)
      const deletionTime = Date.now() + 600000;
      
      try {
        // Create a scheduled task document
        await admin.firestore().collection('scheduledTasks').doc(orderId).set({
          orderId: orderId,
          type: 'orderDeletion',
          scheduledFor: new Date(deletionTime),
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Set up a Cloud Function trigger to run after 10 minutes
        const scheduledFunction = functions.pubsub.schedule('10 minutes').onRun(async (context) => {
          try {
            // Delete the order
            await admin.firestore().collection('orders').doc(orderId).delete();
            
            // Delete the scheduled task
            await admin.firestore().collection('scheduledTasks').doc(orderId).delete();
            
            console.log(`Order ${orderId} automatically deleted after 10 minutes`);
            
            // Also delete the timeline subcollection if it exists
            const timelineRef = admin.firestore().collection('orders').doc(orderId).collection('timeline');
            const timelineDocs = await timelineRef.get();
            const deletePromises = timelineDocs.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
          } catch (error) {
            console.error(`Error deleting order ${orderId}:`, error);
          }
        });

        return { success: true, scheduledFor: new Date(deletionTime) };
      } catch (error) {
        console.error(`Error scheduling order deletion for ${orderId}:`, error);
        throw error;
      }
    }

    return null;
  });

// 6. Alternative approach using Cloud Tasks (more reliable for production)
exports.createOrderDeletionTask = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const orderId = context.params.orderId;

    // Check if status changed to 'success'
    if (newData.status === 'success' && previousData.status !== 'success') {
      console.log(`Order ${orderId} marked as success, creating deletion task`);
      
      try {
        // Create a task document that will be processed by a scheduled function
        await admin.firestore().collection('deletionTasks').doc(orderId).set({
          orderId: orderId,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
          type: 'orderDeletion'
        });

        return { success: true, taskCreated: true };
      } catch (error) {
        console.error(`Error creating deletion task for order ${orderId}:`, error);
        throw error;
      }
    }

    return null;
  });

// 7. Scheduled function to process deletion tasks every minute
exports.processDeletionTasks = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  try {
    const now = admin.firestore.Timestamp.now();
    const tenMinutesAgo = new Date(now.toMillis() - 600000); // 10 minutes ago
    
    // Find all pending deletion tasks that are older than 10 minutes
    const tasksRef = admin.firestore().collection('deletionTasks');
    const query = tasksRef
      .where('status', '==', 'pending')
      .where('createdAt', '<=', tenMinutesAgo);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('No deletion tasks to process');
      return null;
    }
    
    console.log(`Processing ${snapshot.size} deletion tasks`);
    
    const deletionPromises = snapshot.docs.map(async (doc) => {
      const task = doc.data();
      
      try {
        // Delete the order
        await admin.firestore().collection('orders').doc(task.orderId).delete();
        
        // Delete the timeline subcollection
        const timelineRef = admin.firestore().collection('orders').doc(task.orderId).collection('timeline');
        const timelineDocs = await timelineRef.get();
        const timelineDeletePromises = timelineDocs.docs.map(timelineDoc => timelineDoc.ref.delete());
        await Promise.all(timelineDeletePromises);
        
        // Mark task as completed
        await doc.ref.update({
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Order ${task.orderId} deleted successfully`);
        return { success: true, orderId: task.orderId };
      } catch (error) {
        console.error(`Error deleting order ${task.orderId}:`, error);
        
        // Mark task as failed
        await doc.ref.update({
          status: 'failed',
          error: error.message,
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: false, orderId: task.orderId, error: error.message };
      }
    });
    
    const results = await Promise.all(deletionPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Deletion task processing completed: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, total: results.length };
    
  } catch (error) {
    console.error('Error processing deletion tasks:', error);
    throw error;
  }
});

// 8. Initialize required collections for admin services panel
exports.initializeAdminCollections = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if the requesting user is an admin
  const requestingUser = await admin.auth().getUser(context.auth.uid);
  if (requestingUser.customClaims?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can initialize collections');
  }

  try {
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

    return {
      success: true,
      message: 'Admin collections initialized successfully',
      collectionsCreated: ['agents', 'agentApplications', 'serviceRequests'],
      sampleDataAdded: {
        agents: sampleAgents.length,
        applications: sampleApplications.length,
        requests: sampleRequests.length
      }
    };

  } catch (error) {
    console.error('Error initializing admin collections:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize admin collections');
  }
});

