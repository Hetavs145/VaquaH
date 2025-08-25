// Image deployment utility for hostinger production environment
import { imageUploadService } from '@/services/imageUploadService';

class ImageDeploymentUtility {
  // Generate deployment instructions for hostinger
  generateDeploymentInstructions() {
    return {
      steps: [
        "1. Download the ZIP file containing all product images",
        "2. Extract the ZIP file to your local computer",
        "3. Connect to your hostinger hosting via FTP or File Manager",
        "4. Navigate to the public_html folder",
        "5. Create a folder named 'images' if it doesn't exist",
        "6. Inside 'images', create a folder named 'products'",
        "7. Upload all extracted image files to the 'public_html/images/products/' folder",
        "8. Ensure all images have .jpg extension",
        "9. Verify images are accessible via your domain (e.g., yourdomain.com/images/products/filename.jpg)",
        "10. Update your product database with the new image URLs"
      ],
      folderStructure: {
        public_html: {
          images: {
            products: "All product images go here"
          }
        }
      },
      urlFormat: "https://yourdomain.com/images/products/filename.jpg"
    };
  }

  // Prepare all images for deployment
  async prepareAllImagesForDeployment() {
    try {
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      const deploymentData = [];
      
      for (const [productId, productImages] of Object.entries(existingImages)) {
        if (productImages && productImages.length > 0) {
          const productDeploymentData = await imageUploadService.prepareImagesForDeployment(productId);
          deploymentData.push({
            productId,
            images: productDeploymentData
          });
        }
      }
      
      return deploymentData;
    } catch (error) {
      console.error('Error preparing images for deployment:', error);
      throw new Error('Failed to prepare images for deployment');
    }
  }

  // Generate deployment manifest
  async generateDeploymentManifest() {
    try {
      const deploymentData = await this.prepareAllImagesForDeployment();
      const manifest = {
        totalProducts: deploymentData.length,
        totalImages: deploymentData.reduce((sum, product) => sum + product.images.length, 0),
        products: deploymentData.map(product => ({
          productId: product.productId,
          imageCount: product.images.length,
          images: product.images.map(img => ({
            filename: img.filename,
            productionPath: img.productionPath,
            size: this.estimateImageSize(img.base64)
          }))
        })),
        generatedAt: new Date().toISOString()
      };
      
      return manifest;
    } catch (error) {
      console.error('Error generating deployment manifest:', error);
      throw new Error('Failed to generate deployment manifest');
    }
  }

  // Estimate image size from base64
  estimateImageSize(base64String) {
    if (!base64String) return 0;
    // Remove data URL prefix and calculate size
    const base64Data = base64String.split(',')[1];
    return Math.ceil((base64Data.length * 3) / 4); // Approximate size in bytes
  }

  // Validate deployment readiness
  async validateDeploymentReadiness() {
    try {
      const deploymentData = await this.prepareAllImagesForDeployment();
      const issues = [];
      
      deploymentData.forEach(product => {
        product.images.forEach(img => {
          if (!img.filename) {
            issues.push(`Missing filename for product ${product.productId}`);
          }
          if (!img.base64) {
            issues.push(`Missing image data for ${img.filename}`);
          }
          if (!img.productionPath) {
            issues.push(`Missing production path for ${img.filename}`);
          }
        });
      });
      
      return {
        ready: issues.length === 0,
        issues,
        totalProducts: deploymentData.length,
        totalImages: deploymentData.reduce((sum, product) => sum + product.images.length, 0)
      };
    } catch (error) {
      console.error('Error validating deployment readiness:', error);
      return {
        ready: false,
        issues: [error.message],
        totalProducts: 0,
        totalImages: 0
      };
    }
  }

  // Generate deployment script for automation
  generateDeploymentScript() {
    return `
# Hostinger Image Deployment Script
# This script should be run on your hostinger server

#!/bin/bash

# Configuration
IMAGES_DIR="/home/username/public_html/images/products"
BACKUP_DIR="/home/username/backups/images/$(date +%Y%m%d_%H%M%S)"

# Create backup
echo "Creating backup..."
mkdir -p $BACKUP_DIR
cp -r $IMAGES_DIR/* $BACKUP_DIR/ 2>/dev/null || true

# Create directories if they don't exist
echo "Creating directories..."
mkdir -p $IMAGES_DIR

# Upload images (this would be done via FTP or file upload)
echo "Uploading images..."
# Add your upload commands here

# Set permissions
echo "Setting permissions..."
chmod 644 $IMAGES_DIR/*.jpg
chmod 755 $IMAGES_DIR

echo "Deployment completed!"
echo "Backup saved to: $BACKUP_DIR"
    `;
  }

  // Generate .htaccess rules for image optimization
  generateHtaccessRules() {
    return `
# Image optimization rules for hostinger
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
    # Cache control for images
    <FilesMatch "\.(jpg|jpeg|png|webp|gif)$">
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE image/jpeg
    AddOutputFilterByType DEFLATE image/jpg
    AddOutputFilterByType DEFLATE image/png
    AddOutputFilterByType DEFLATE image/webp
</IfModule>
    `;
  }

  // Generate deployment checklist
  generateDeploymentChecklist() {
    return [
      "Download all product images as ZIP file",
      "Extract ZIP file to local computer",
      "Connect to hostinger hosting (FTP/File Manager)",
      "Navigate to public_html folder",
      "Create images/products folder structure",
      "Upload all .jpg files to public_html/images/products/",
      "Verify file permissions (644 for images, 755 for folders)",
      "Test image accessibility via browser",
      "Update product database with new image URLs",
      "Clear any CDN cache if applicable",
      "Test product pages to ensure images load correctly",
      "Monitor website performance after deployment"
    ];
  }
}

export const imageDeploymentUtility = new ImageDeploymentUtility();
export default imageDeploymentUtility;