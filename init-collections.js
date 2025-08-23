const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, this is a template - you can run this from your existing Firebase functions

console.log('🚀 Initializing missing Firestore collections...\n');

// This function should be called from your existing Firebase functions
// or you can run it directly if you have admin SDK access

async function initializeCollections() {
  try {
    const db = admin.firestore();
    
    console.log('📁 Creating agents collection...');
    await db.collection('agents').doc('sample-agent-1').set({
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

    console.log('📁 Creating agentApplications collection...');
    await db.collection('agentApplications').doc('sample-application-1').set({
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

    console.log('📁 Creating serviceRequests collection...');
    await db.collection('serviceRequests').doc('sample-request-1').set({
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

    console.log('✅ All collections created successfully!');
    console.log('\n🎯 Your /admin/services route should now work without permission errors.');
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
  }
}

// Export for use in Firebase functions
module.exports = { initializeCollections };

// If running directly (requires admin SDK setup)
if (require.main === module) {
  console.log('⚠️  This script is designed to be run from Firebase functions.');
  console.log('💡 Add this to your existing Firebase functions and call it once.');
}