const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Firebase Admin System...\n');

try {
  // 1. Deploy Firebase functions
  console.log('📦 Deploying Firebase functions...');
  execSync('firebase deploy --only functions', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Functions deployed successfully!\n');

  // 2. Deploy Firestore rules
  console.log('📋 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Firestore rules deployed successfully!\n');

  console.log('🎉 Setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Call the initializeFirstAdmin function from your app with admin credentials');
  console.log('2. Or call the quickSetup function to just initialize collections');
  console.log('3. The admin user will have access to all collections');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('- Firebase CLI installed (npm install -g firebase-tools)');
  console.log('- Logged in to Firebase (firebase login)');
  console.log('- Selected the correct project (firebase use <project-id>)');
  process.exit(1);
}