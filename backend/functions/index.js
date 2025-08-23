const functions = require('firebase-functions');
const admin = require('firebase-admin');

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

// 8. Initialize first admin user and collections (run once manually)
exports.initializeFirstAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { adminEmail, adminPassword } = data;
  
  if (!adminEmail || !adminPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'Admin email and password are required');
  }

  try {
    // Create the first admin user
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'System Administrator'
    });

    // Set admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    // Create user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      name: 'System Administrator',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Initialize collections with sample data
    await initializeCollections();

    return {
      success: true,
      message: 'First admin user created and collections initialized successfully',
      adminUid: userRecord.uid,
      adminEmail: adminEmail
    };
  } catch (error) {
    console.error('Error creating first admin:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create first admin user');
  }
});

// Helper function to initialize collections
async function initializeCollections() {
  try {
    // Create sample agents collection
    const agentsRef = admin.firestore().collection('agents');
    await agentsRef.doc('sample-agent-1').set({
      uid: 'sample-agent-1',
      email: 'agent1@example.com',
      name: 'Sample Agent 1',
      phone: '+1234567890',
      services: ['AC Repair', 'AC Maintenance'],
      status: 'active',
      rating: 4.5,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create sample agent applications collection
    const applicationsRef = admin.firestore().collection('agentApplications');
    await applicationsRef.doc('sample-application-1').set({
      uid: 'sample-applicant-1',
      email: 'applicant1@example.com',
      name: 'Sample Applicant 1',
      phone: '+1234567891',
      services: ['AC Installation', 'AC Repair'],
      experience: '5 years in HVAC',
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Sample application for testing'
    });

    // Create sample service requests collection
    const requestsRef = admin.firestore().collection('serviceRequests');
    await requestsRef.doc('sample-request-1').set({
      userId: 'sample-user-1',
      agentId: 'sample-agent-1',
      serviceType: 'AC Repair',
      description: 'AC not cooling properly',
      status: 'pending',
      priority: 'medium',
      location: {
        address: '123 Sample St, Sample City',
        latitude: 40.7128,
        longitude: -74.0060
      },
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      scheduledFor: null,
      completedAt: null,
      notes: 'Sample service request for testing'
    });

    // Create admin logs collection
    const logsRef = admin.firestore().collection('adminLogs');
    await logsRef.doc('initial-setup').set({
      action: 'system_initialization',
      performedBy: 'system',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: 'Collections initialized with sample data'
    });

    console.log('Collections initialized successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
    throw error;
  }
}

// 9. Quick setup function for development (creates collections without admin user)
exports.quickSetup = functions.https.onCall(async (data, context) => {
  try {
    await initializeCollections();
    return {
      success: true,
      message: 'Collections initialized successfully'
    };
  } catch (error) {
    console.error('Error in quick setup:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize collections');
  }
});

// 10. Quick fix for /admin/services route - just initialize collections
exports.fixServicesRoute = functions.https.onCall(async (data, context) => {
  try {
    console.log('🔧 Fixing /admin/services route by initializing collections...');
    
    // Initialize collections with sample data
    await initializeCollections();
    
    return {
      success: true,
      message: 'Collections initialized successfully. Your /admin/services route should now work!',
      collectionsCreated: ['agents', 'agentApplications', 'serviceRequests']
    };
  } catch (error) {
    console.error('Error fixing services route:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize collections');
  }
});

