class ImageUploadService {
  // Convert file to base64 string for storage
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Validate image file
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 5MB');
    }

    return true;
  }

  // Convert image to JPG format
  async convertToJPG(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPG blob
        canvas.toBlob((blob) => {
          // Create a new file with JPG extension
          const jpgFile = new File([blob], this.getFileNameWithJpgExtension(file.name), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(jpgFile);
        }, 'image/jpeg', 0.9); // 90% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Get filename with JPG extension
  getFileNameWithJpgExtension(filename) {
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    return `${nameWithoutExt}.jpg`;
  }

  // Upload single image and return base64 string (converted to JPG)
  async uploadImage(file) {
    try {
      this.validateImageFile(file);
      
      // Convert to JPG if not already
      const jpgFile = await this.convertToJPG(file);
      const base64String = await this.fileToBase64(jpgFile);
      return base64String;
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload multiple images and return array of base64 strings
  async uploadMultipleImages(files) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // Save image to local storage (for development)
  async saveImageToLocal(file, productId, imageIndex = 0) {
    try {
      this.validateImageFile(file);
      
      // Convert to JPG first
      const jpgFile = await this.convertToJPG(file);
      
      // Create a unique filename with JPG extension
      const timestamp = Date.now();
      const filename = `product_${productId}_${imageIndex}_${timestamp}.jpg`;
      
      // For now, we'll store as base64 in localStorage for development
      // In production, this would save to the server's public_html folder
      const base64String = await this.fileToBase64(jpgFile);
      
      // Store in localStorage for development
      const imageData = {
        filename,
        base64: base64String,
        timestamp,
        productId,
        imageIndex,
        originalName: file.name
      };
      
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      if (!existingImages[productId]) {
        existingImages[productId] = [];
      }
      existingImages[productId][imageIndex] = imageData;
      localStorage.setItem('productImages', JSON.stringify(existingImages));
      
      return {
        filename,
        url: base64String,
        localPath: `/images/products/${filename}` // Path for production
      };
    } catch (error) {
      throw new Error(`Local image save failed: ${error.message}`);
    }
  }

  // Get image from local storage
  getImageFromLocal(productId, imageIndex = 0) {
    try {
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      const productImages = existingImages[productId] || [];
      return productImages[imageIndex]?.base64 || null;
    } catch (error) {
      console.error('Error getting image from local storage:', error);
      return null;
    }
  }

  // Get all images for a product from local storage
  getAllImagesFromLocal(productId) {
    try {
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      const productImages = existingImages[productId] || [];
      return productImages.map(img => img?.base64).filter(Boolean);
    } catch (error) {
      console.error('Error getting images from local storage:', error);
      return [];
    }
  }

  // Remove image from local storage
  removeImageFromLocal(productId, imageIndex) {
    try {
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      if (existingImages[productId]) {
        existingImages[productId].splice(imageIndex, 1);
        localStorage.setItem('productImages', JSON.stringify(existingImages));
      }
    } catch (error) {
      console.error('Error removing image from local storage:', error);
    }
  }

  // Compress image if it's too large
  async compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        
        // Calculate new dimensions
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (height * maxWidth) / width;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate production-ready image paths for hostinger
  generateProductionPaths(productId, imageCount) {
    const paths = [];
    for (let i = 0; i < imageCount; i++) {
      paths.push(`/images/products/product_${productId}_${i}.jpg`);
    }
    return paths;
  }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;