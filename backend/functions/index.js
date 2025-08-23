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

    // Update admin request status
    const adminRequestsRef = admin.firestore().collection('adminRequests');
    await adminRequestsRef.doc(targetUser.uid).update({
      status: 'approved',
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: 'Approved by existing admin'
    });

    // Log the action
    await admin.firestore().collection('adminLogs').add({
      action: 'admin_granted',
      grantedTo: targetUser.uid,
      grantedBy: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      targetEmail: targetUser.email
    });

    return {
      success: true,
      message: `Admin role granted to ${targetUser.email}`,
      uid: targetUser.uid
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

