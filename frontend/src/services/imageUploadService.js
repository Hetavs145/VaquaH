import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

  // Upload a single file to Firebase Storage and return its HTTPS URL
  async uploadImage(file, id = 'misc', imageIndex = 0, folder = 'products') {
    try {
      this.validateImageFile(file);
      // Sanitize id to remove spaces and special characters
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/\s+/g, '_');
      // Sanitize filename more aggressively
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/\s+/g, '_');
      const path = `${folder}/${safeId}/${Date.now()}_${imageIndex}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });
      const url = await getDownloadURL(storageRef);
      return { url, path };
    } catch (error) {
      console.error('Upload error details:', error);

      // Provide more helpful error messages
      if (error.code === 'storage/unauthorized' || error.code === 'storage/canceled') {
        throw new Error('Upload failed: Please make sure you are logged in and have permission to upload images.');
      } else if (error.message?.includes('CORS') || error.message?.includes('network')) {
        throw new Error('Upload failed: Firebase Storage is not set up. Please enable Storage in Firebase Console and deploy storage rules.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Upload failed: Storage quota exceeded. Please check your Firebase Storage usage.');
      } else {
        throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Upload multiple images; returns array of HTTPS URLs
  async uploadMultipleImages(files, id = 'misc', folder = 'products') {
    try {
      const tasks = files.map((file, idx) => this.uploadImage(file, id, idx, folder));
      const results = await Promise.all(tasks);
      return results.map(r => r.url);
    } catch (error) {
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // Delete a file from Storage via its path
  async deleteImageByPath(path) {
    try {
      if (!path) return;
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      // Swallow not-found errors
      if (!(error && error.code === 'storage/object-not-found')) {
        console.error('Failed deleting image from storage:', error);
      }
    }
  }

  // Compatibility helpers used previously; now return empty or noop to avoid base64/localStorage usage
  getAllImagesFromLocal() {
    return [];
  }
  getImageFromLocal() {
    return null;
  }
  saveImageToLocal() {
    return Promise.resolve(null);
  }
  removeImageFromLocal() { }
  convertToJPG(file) { return Promise.resolve(file); }
  fileToBase64() { return Promise.resolve(null); }
  compressImage(file) { return Promise.resolve(file); }
  generateProductionPaths(productId, imageCount) { return Array.from({ length: imageCount }).map((_, i) => `products/${productId}/${i}.jpg`); }
  getImageUrl() { return null; }
  async prepareImagesForDeployment() { return []; }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;