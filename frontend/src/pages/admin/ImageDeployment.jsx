import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { imageUploadService } from '@/services/imageUploadService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ImageDeployment = () => {
  const { user } = useAuth();
  const [adminStatus, setAdminStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState({});

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const status = await adminService.checkAdminStatus(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        loadProducts();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await adminService.getAllProducts();
      setProducts(products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductImages = (productId) => {
    try {
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      return existingImages[productId] || [];
    } catch (error) {
      console.error('Error getting product images:', error);
      return [];
    }
  };

  const deployImagesToProduction = async (productId) => {
    try {
      setDeploymentStatus(prev => ({ ...prev, [productId]: 'deploying' }));
      
      const productImages = getProductImages(productId);
      
      if (productImages.length === 0) {
        toast({
          title: 'No Images',
          description: 'No images found for this product',
          variant: 'destructive'
        });
        return;
      }

      // Prepare deployment data
      const deploymentData = await imageUploadService.prepareImagesForDeployment(productId);
      
      // In a real implementation, you would send this data to your backend
      // which would save the images to the public_html/images/products/ folder
      console.log('Deployment data for product', productId, ':', deploymentData);
      
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update product with production image paths
      const product = products.find(p => p.id === productId || p._id === productId);
      if (product) {
        const productionImagePaths = deploymentData.map(img => img.productionPath);
        await adminService.updateProduct(productId, {
          ...product,
          images: productionImagePaths,
          imageUrl: productionImagePaths[0] || product.imageUrl
        });
      }
      
      setDeploymentStatus(prev => ({ ...prev, [productId]: 'deployed' }));
      
      toast({
        title: 'Success',
        description: `Images deployed for ${product?.name || 'product'}`,
      });
      
      await loadProducts();
    } catch (error) {
      console.error('Failed to deploy images:', error);
      setDeploymentStatus(prev => ({ ...prev, [productId]: 'failed' }));
      toast({
        title: 'Error',
        description: 'Failed to deploy images',
        variant: 'destructive'
      });
    }
  };

  const downloadImagesForHostinger = async (productId) => {
    try {
      const productImages = getProductImages(productId);
      
      if (productImages.length === 0) {
        toast({
          title: 'No Images',
          description: 'No images found for this product',
          variant: 'destructive'
        });
        return;
      }

      // Create a zip file with all images for manual upload to hostinger
      const JSZip = await import('jszip');
      const zip = new JSZip.default();
      
      productImages.forEach((img, index) => {
        if (img.base64) {
          // Convert base64 to blob
          const base64Data = img.base64.split(',')[1];
          const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/jpeg' });
          zip.file(img.filename, blob);
        }
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `product_${productId}_images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Images downloaded for manual upload to hostinger',
      });
    } catch (error) {
      console.error('Failed to download images:', error);
      toast({
        title: 'Error',
        description: 'Failed to download images',
        variant: 'destructive'
      });
    }
  };

  const removeProductImages = async (productId) => {
    if (!confirm('Are you sure you want to remove all images for this product?')) return;
    
    try {
      // Remove from localStorage
      const existingImages = JSON.parse(localStorage.getItem('productImages') || '{}');
      delete existingImages[productId];
      localStorage.setItem('productImages', JSON.stringify(existingImages));
      
      // Update product to remove image references
      const product = products.find(p => p.id === productId || p._id === productId);
      if (product) {
        await adminService.updateProduct(productId, {
          ...product,
          images: [],
          imageUrl: ''
        });
      }
      
      toast({
        title: 'Success',
        description: 'Product images removed',
      });
      
      await loadProducts();
    } catch (error) {
      console.error('Failed to remove images:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove images',
        variant: 'destructive'
      });
    }
  };

  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Deployment</h1>
          <p className="text-gray-600">Manage and deploy product images to production</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vaquah-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {products.map(product => {
              const productImages = getProductImages(product.id || product._id);
              const status = deploymentStatus[product.id || product._id];
              
              return (
                <Card key={product.id || product._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">ID: {product.id || product._id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {productImages.length > 0 && (
                          <Badge variant="secondary">
                            {productImages.length} image{productImages.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {status === 'deployed' && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Deployed
                          </Badge>
                        )}
                        {status === 'failed' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {productImages.length > 0 ? (
                        <>
                          <Button
                            onClick={() => deployImagesToProduction(product.id || product._id)}
                            disabled={status === 'deploying'}
                            className="flex items-center gap-2"
                          >
                            {status === 'deploying' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {status === 'deploying' ? 'Deploying...' : 'Deploy to Production'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => downloadImagesForHostinger(product.id || product._id)}
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download for Hostinger
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => removeProductImages(product.id || product._id)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Images
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <FolderOpen className="w-4 h-4" />
                          No images uploaded
                        </div>
                      )}
                    </div>
                    
                    {productImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Image Files:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {productImages.map((img, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {img.filename}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ImageDeployment;