// Script to delete the VaquaH Inverter Split AC 1.5 Ton product
// This can be run in the browser console on the admin products page

async function deleteVaquahProduct() {
  try {
    // Import Firebase functions (if running in browser)
    const { collection, getDocs, doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get the Firebase db instance (you'll need to access this from your app)
    // In browser console, you can access it as: window.db or from your React app
    
    console.log('Searching for VaquaH Inverter Split AC 1.5 Ton product...');
    
    // Get all products
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let foundProduct = null;
    
    snapshot.forEach((doc) => {
      const product = doc.data();
      console.log(`Found product: ${product.name} (ID: ${doc.id})`);
      
      // Check if this is the product we want to delete
      if (product.name && 
          product.name.toLowerCase().includes('vaquah') && 
          product.name.toLowerCase().includes('inverter') && 
          product.name.toLowerCase().includes('split ac') && 
          product.name.toLowerCase().includes('1.5 ton')) {
        foundProduct = { id: doc.id, ...product };
        console.log('✅ Found target product!');
      }
    });
    
    if (foundProduct) {
      console.log(`🗑️ Deleting product: ${foundProduct.name} (ID: ${foundProduct.id})`);
      
      // Delete the product
      const productRef = doc(db, 'products', foundProduct.id);
      await deleteDoc(productRef);
      
      console.log('✅ Product deleted successfully!');
      return true;
    } else {
      console.log('❌ Target product not found. Available products:');
      snapshot.forEach((doc) => {
        const product = doc.data();
        console.log(`- ${product.name} (ID: ${doc.id})`);
      });
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Alternative: If you want to run this from the admin products page
// You can copy and paste this function into the browser console
// Make sure you're logged in as an admin user

// Usage instructions:
// 1. Go to your admin products page (/admin/products)
// 2. Open browser console (F12)
// 3. Copy and paste this entire script
// 4. Run: deleteVaquahProduct()

console.log('Script loaded. Run deleteVaquahProduct() to delete the product.');