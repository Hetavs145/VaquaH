import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

class ImageUploadService {
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

  // Generate unique filename
  generateFileName(file, prefix = 'product') {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${prefix}_${timestamp}_${randomString}.${extension}`;
  }

  // Upload image to Firebase Storage and return download URL
  async uploadImage(file, folder = 'products') {
    try {
      this.validateImageFile(file);
      
      // Generate unique filename
      const fileName = this.generateFileName(file, folder);
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, folder = 'products') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error('Multiple images upload failed:', error);
      throw new Error(`Multiple images upload failed: ${error.message}`);
    }
  }

  // Compress image if it's too large (optional, for better performance)
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

  // Upload compressed image
  async uploadCompressedImage(file, folder = 'products', maxWidth = 800, quality = 0.8) {
    try {
      this.validateImageFile(file);
      
      // Compress image first
      const compressedBlob = await this.compressImage(file, maxWidth, quality);
      
      // Create a new file from the compressed blob
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Upload the compressed file
      return await this.uploadImage(compressedFile, folder);
    } catch (error) {
      console.error('Compressed image upload failed:', error);
      throw new Error(`Compressed image upload failed: ${error.message}`);
    }
  }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;