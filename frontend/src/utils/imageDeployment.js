// Image Deployment Utility for Hostinger
// This utility helps prepare and deploy images to hostinger's public_html folder

class ImageDeploymentUtility {
  constructor() {
    this.localStorageKey = 'productImages';
    this.productionPath = '/images/products/';
  }

  // Get all stored images from localStorage
  getAllStoredImages() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored images:', error);
      return {};
    }
  }

  // Generate deployment manifest for hostinger
  generateDeploymentManifest() {
    const storedImages = this.getAllStoredImages();
    const manifest = {
      timestamp: new Date().toISOString(),
      totalProducts: Object.keys(storedImages).length,
      images: []
    };

    Object.entries(storedImages).forEach(([productId, images]) => {
      images.forEach((imageData, index) => {
        if (imageData && imageData.base64) {
          manifest.images.push({
            productId,
            imageIndex: index,
            filename: imageData.filename,
            localPath: `${this.productionPath}${imageData.filename}`,
            timestamp: imageData.timestamp,
            size: this.getBase64Size(imageData.base64)
          });
        }
      });
    });

    return manifest;
  }

  // Calculate base64 string size in bytes
  getBase64Size(base64String) {
    const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
    return Math.floor((base64String.length * 3) / 4) - padding;
  }

  // Convert base64 to blob for file download
  base64ToBlob(base64String, mimeType = 'image/jpeg') {
    const byteCharacters = atob(base64String.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Download all images as zip (for manual upload to hostinger)
  async downloadImagesAsZip() {
    try {
      // Dynamic import for JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const storedImages = this.getAllStoredImages();
      let fileCount = 0;

      Object.entries(storedImages).forEach(([productId, images]) => {
        images.forEach((imageData, index) => {
          if (imageData && imageData.base64) {
            const blob = this.base64ToBlob(imageData.base64);
            const filename = imageData.filename;
            zip.file(filename, blob);
            fileCount++;
          }
        });
      });

      if (fileCount === 0) {
        throw new Error('No images found to download');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-images-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, fileCount };
    } catch (error) {
      console.error('Error creating zip file:', error);
      throw error;
    }
  }

  // Generate deployment instructions
  generateDeploymentInstructions() {
    const manifest = this.generateDeploymentManifest();
    
    return {
      instructions: [
        '1. Download the images zip file using the download function',
        '2. Extract the zip file on your local machine',
        '3. Upload all images to your hostinger public_html/images/products/ folder',
        '4. Ensure the folder structure matches: public_html/images/products/',
        '5. Verify all images are accessible via your domain',
        '6. Update your production environment to use the new image paths'
      ],
      manifest,
      totalImages: manifest.images.length,
      estimatedSize: this.calculateTotalSize(manifest.images)
    };
  }

  // Calculate total size of all images
  calculateTotalSize(images) {
    const totalBytes = images.reduce((sum, img) => sum + (img.size || 0), 0);
    const mb = totalBytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  // Clean up old images (remove from localStorage)
  cleanupOldImages(olderThanDays = 30) {
    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const storedImages = this.getAllStoredImages();
    let cleanedCount = 0;

    Object.entries(storedImages).forEach(([productId, images]) => {
      const filteredImages = images.filter(imageData => {
        if (!imageData || !imageData.timestamp) return false;
        return imageData.timestamp > cutoffDate;
      });
      
      if (filteredImages.length !== images.length) {
        storedImages[productId] = filteredImages;
        cleanedCount += images.length - filteredImages.length;
      }
    });

    localStorage.setItem(this.localStorageKey, JSON.stringify(storedImages));
    return cleanedCount;
  }

  // Export images data for backup
  exportImagesData() {
    const storedImages = this.getAllStoredImages();
    const dataStr = JSON.stringify(storedImages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-images-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import images data from backup
  importImagesData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem(this.localStorageKey, JSON.stringify(data));
          resolve({ success: true, importedProducts: Object.keys(data).length });
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export const imageDeploymentUtility = new ImageDeploymentUtility();
export default imageDeploymentUtility;