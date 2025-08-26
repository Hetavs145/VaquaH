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
  async uploadImage(file, productId = 'misc', imageIndex = 0) {
    try {
      this.validateImageFile(file);
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const path = `products/${productId}/${Date.now()}_${imageIndex}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      return { url, path };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload multiple images; returns array of HTTPS URLs
  async uploadMultipleImages(files, productId = 'misc') {
    try {
      const tasks = files.map((file, idx) => this.uploadImage(file, productId, idx));
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
  removeImageFromLocal() {}
  convertToJPG(file) { return Promise.resolve(file); }
  fileToBase64() { return Promise.resolve(null); }
  compressImage(file) { return Promise.resolve(file); }
  generateProductionPaths(productId, imageCount) { return Array.from({ length: imageCount }).map((_, i) => `products/${productId}/${i}.jpg`); }
  getImageUrl() { return null; }
  async prepareImagesForDeployment() { return []; }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;