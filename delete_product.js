const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');

// Firebase configuration - you'll need to add your actual config here
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findAndDeleteProduct() {
  try {
    console.log('Searching for products...');
    
    // Get all products from Firestore
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let foundProduct = null;
    
    snapshot.forEach((doc) => {
      const product = doc.data();
      console.log(`Product: ${product.name} (ID: ${doc.id})`);
      
      // Check if this is the product we want to delete
      if (product.name && product.name.includes('VaquaH Inverter Split AC 1.5 Ton')) {
        foundProduct = { id: doc.id, ...product };
        console.log('Found target product!');
      }
    });
    
    if (foundProduct) {
      console.log(`Deleting product: ${foundProduct.name} (ID: ${foundProduct.id})`);
      
      // Delete the product
      const productRef = doc(db, 'products', foundProduct.id);
      await deleteDoc(productRef);
      
      console.log('Product deleted successfully!');
    } else {
      console.log('Target product not found. Available products:');
      snapshot.forEach((doc) => {
        const product = doc.data();
        console.log(`- ${product.name} (ID: ${doc.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
findAndDeleteProduct();