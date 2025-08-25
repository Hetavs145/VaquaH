import { adminService } from '@/services/adminService';

export async function deleteVaquahProduct() {
  try {
    console.log('Searching for VaquaH Inverter Split AC 1.5 Ton product...');
    
    // Get all products using admin service
    const products = await adminService.getAllProducts();
    
    let foundProduct = null;
    
    products.forEach((product) => {
      console.log(`Found product: ${product.name} (ID: ${product.id})`);
      
      // Check if this is the product we want to delete
      if (product.name && 
          product.name.toLowerCase().includes('vaquah') && 
          product.name.toLowerCase().includes('inverter') && 
          product.name.toLowerCase().includes('split ac') && 
          product.name.toLowerCase().includes('1.5 ton')) {
        foundProduct = product;
        console.log('✅ Found target product!');
      }
    });
    
    if (foundProduct) {
      console.log(`🗑️ Deleting product: ${foundProduct.name} (ID: ${foundProduct.id})`);
      
      // Delete the product using admin service
      await adminService.deleteProduct(foundProduct.id);
      
      console.log('✅ Product deleted successfully!');
      return { success: true, product: foundProduct };
    } else {
      console.log('❌ Target product not found. Available products:');
      products.forEach((product) => {
        console.log(`- ${product.name} (ID: ${product.id})`);
      });
      return { success: false, message: 'Product not found', products };
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Function to list all products (for debugging)
export async function listAllProducts() {
  try {
    const products = await adminService.getAllProducts();
    console.log('All products:');
    products.forEach((product) => {
      console.log(`- ${product.name} (ID: ${product.id})`);
    });
    return products;
  } catch (error) {
    console.error('Error listing products:', error);
    return [];
  }
}