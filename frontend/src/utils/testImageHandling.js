// Test utility for image handling
import { imageUploadService } from '@/services/imageUploadService';

export const testImageHandling = {
  // Test if images are properly stored and retrieved
  testImageStorage() {
    console.log('Testing image storage...');
    
    const testProductId = 'test-product-123';
    const testImages = [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A'
    ];
    
    // Store test images
    testImages.forEach((base64, index) => {
      const imageData = {
        filename: `test_product_${testProductId}_${index}_${Date.now()}.jpg`,
        base64: base64,
        timestamp: Date.now(),
        productId: testProductId,
        imageIndex: index,
        originalName: `test-image-${index}.jpg`,
        productionPath: `/images/products/test_product_${testProductId}_${index}_${Date.now()}.jpg`,
        localPath: `/images/products/test_product_${testProductId}_${index}_${Date.now()}.jpg`
      };
      
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      if (!existingImages[testProductId]) {
        existingImages[testProductId] = [];
      }
      existingImages[testProductId][index] = imageData;
      localStorage.setItem('productImages', JSON.stringify(existingImages));
    });
    
    console.log('Test images stored successfully');
    
    // Retrieve test images
    const retrievedImages = imageUploadService.getAllImagesFromLocal(testProductId);
    console.log('Retrieved images:', retrievedImages.length);
    
    // Clean up test data
    localStorage.removeItem('productImages');
    
    return retrievedImages.length === testImages.length;
  },
  
  // Test featured products image loading
  testFeaturedProductsImages() {
    console.log('Testing featured products image loading...');
    
    // Simulate featured products data
    const mockFeaturedProducts = [
      {
        id: 'product-1',
        name: 'Test Product 1',
        price: 1000,
        image: null,
        imageUrl: null
      },
      {
        id: 'product-2', 
        name: 'Test Product 2',
        price: 2000,
        image: null,
        imageUrl: null
      }
    ];
    
    // Add some test images
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
    
    const imageData = {
      filename: `test_product_product-1_0_${Date.now()}.jpg`,
      base64: testImage,
      timestamp: Date.now(),
      productId: 'product-1',
      imageIndex: 0,
      originalName: 'test-image.jpg',
      productionPath: `/images/products/test_product_product-1_0_${Date.now()}.jpg`,
      localPath: `/images/products/test_product_product-1_0_${Date.now()}.jpg`
    };
    
    const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
    existingImages['product-1'] = [imageData];
    localStorage.setItem('productImages', JSON.stringify(existingImages));
    
    // Process products like FeaturedProducts component does
    const processedProducts = mockFeaturedProducts.map(product => {
      const localImages = imageUploadService.getAllImagesFromLocal(product.id);
      
      return {
        ...product,
        image: localImages[0] || product.image || product.imageUrl,
        images: localImages.length > 0 ? localImages : (product.images || [product.image || product.imageUrl]).filter(Boolean)
      };
    });
    
    console.log('Processed products:', processedProducts);
    
    // Clean up
    localStorage.removeItem('productImages');
    
    return processedProducts[0].image && processedProducts[0].image.startsWith('data:image');
  },
  
  // Run all tests
  runAllTests() {
    console.log('Running image handling tests...');
    
    const test1 = this.testImageStorage();
    const test2 = this.testFeaturedProductsImages();
    
    console.log('Test 1 (Image Storage):', test1 ? 'PASS' : 'FAIL');
    console.log('Test 2 (Featured Products):', test2 ? 'PASS' : 'FAIL');
    
    return test1 && test2;
  }
};

export default testImageHandling;