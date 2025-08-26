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

  // Upload files to backend (no base64)
  async uploadFiles(files) {
    if (!files || files.length === 0) return [];
    const form = new FormData();
    files.forEach((file) => {
      this.validateImageFile(file);
      form.append('images', file);
    });

    const baseUrl = import.meta?.env?.VITE_API_URL || import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:5001';
    const res = await fetch(`${baseUrl}/api/uploads/products`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Upload failed');
    }
    const data = await res.json();
    return data.urls || [];
  }

  async uploadImage(file) {
    const arr = await this.uploadFiles([file]);
    return arr[0] || null;
  }

  async uploadMultipleImages(files) {
    return this.uploadFiles(files);
  }

  // Compatibility no-ops for previous localStorage behavior
  getImageFromLocal() {
    return null;
  }

  getAllImagesFromLocal() {
    return [];
  }

  removeImageFromLocal() {}

  generateProductionPaths(_productId, _imageCount) {
    return [];
  }

  getImageUrl() {
    return null;
  }

  async prepareImagesForDeployment() {
    return [];
  }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;