// Setup Admin User Script
// This script helps set up admin privileges for testing

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "vaquah-react.firebaseapp.com",
  projectId: "vaquah-react",
  storageBucket: "vaquah-react.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminUser(email, password) {
  try {
    console.log('🔐 Signing in user...');
    
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User signed in successfully:', user.email);
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('📄 User document exists, updating role...');
      
      // Update user role to admin
      await setDoc(userDocRef, {
        ...userDoc.data(),
        role: 'admin',
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ User role updated to admin successfully!');
    } else {
      console.log('📄 Creating new user document with admin role...');
      
      // Create user document with admin role
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ User document created with admin role successfully!');
    }
    
    console.log('🎉 Admin user setup completed!');
    console.log('📧 Email:', user.email);
    console.log('🆔 UID:', user.uid);
    console.log('👑 Role: admin');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 User not found. Please create the user first in Firebase Console.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Wrong password. Please check the password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Invalid email format.');
    } else {
      console.log('💡 Please check your Firebase configuration and permissions.');
    }
  }
}

// Usage example:
// setupAdminUser('admin@example.com', 'password123');

module.exports = { setupAdminUser };

// If running directly, show usage instructions
if (require.main === module) {
  console.log('🔧 Admin User Setup Script');
  console.log('');
  console.log('To use this script:');
  console.log('1. Update the firebaseConfig with your actual Firebase config');
  console.log('2. Call setupAdminUser(email, password) with your credentials');
  console.log('3. Or run: node setup-admin-user.js');
  console.log('');
  console.log('Example:');
  console.log('setupAdminUser("admin@example.com", "password123")');
}