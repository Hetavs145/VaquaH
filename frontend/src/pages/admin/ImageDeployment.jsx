import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Trash2, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { imageDeploymentUtility } from '@/utils/imageDeployment';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ImageDeployment = () => {
  const { user } = useAuth();
  const [adminStatus, setAdminStatus] = useState(null);
  const [deploymentData, setDeploymentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const status = await adminService.checkAdminStatus(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        loadDeploymentData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadDeploymentData = () => {
    try {
      const data = imageDeploymentUtility.generateDeploymentInstructions();
      setDeploymentData(data);
    } catch (error) {
      console.error('Error loading deployment data:', error);
    }
  };

  const handleDownloadImages = async () => {
    try {
      setLoading(true);
      await imageDeploymentUtility.downloadImagesAsZip();
      toast({
        title: 'Success',
        description: 'Images downloaded successfully as ZIP file',
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download images',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      imageDeploymentUtility.exportImagesData();
      toast({
        title: 'Success',
        description: 'Image data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export image data',
        variant: 'destructive'
      });
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    imageDeploymentUtility.importImagesData(file)
      .then((result) => {
        toast({
          title: 'Success',
          description: `Imported ${result.importedProducts} products successfully`,
        });
        loadDeploymentData();
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to import image data',
          variant: 'destructive'
        });
      });
  };

  const handleCleanup = () => {
    try {
      const cleanedCount = imageDeploymentUtility.cleanupOldImages(30);
      toast({
        title: 'Success',
        description: `Cleaned up ${cleanedCount} old images`,
      });
      loadDeploymentData();
    } catch (error) {
      console.error('Error cleaning up images:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup old images',
        variant: 'destructive'
      });
    }
  };

  if (!adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-4 sm:py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                You need admin access to view this page.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-custom py-4 sm:py-8 flex-1">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">Image Deployment</h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 w-fit">Admin</Badge>
          </div>
        </div>

        {/* Deployment Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Deployment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deploymentData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{deploymentData.totalImages}</div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{deploymentData.manifest.totalProducts}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{deploymentData.estimatedSize}</div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No deployment data available</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-2">Download Images</h3>
                <p className="text-sm text-gray-600 mb-4">Download all images as ZIP for hostinger upload</p>
                <Button 
                  onClick={handleDownloadImages} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Downloading...' : 'Download ZIP'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">Export image data as backup</p>
                <Button onClick={handleExportData} className="w-full">
                  Export Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-2">Import Data</h3>
                <p className="text-sm text-gray-600 mb-4">Import image data from backup</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button as="span" className="w-full cursor-pointer">
                    Import Backup
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Trash2 className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold mb-2">Cleanup</h3>
                <p className="text-sm text-gray-600 mb-4">Remove old images (30+ days)</p>
                <Button onClick={handleCleanup} variant="outline" className="w-full">
                  Cleanup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Hostinger Deployment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentData?.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• All images are automatically converted to JPG format</li>
                <li>• Images are optimized for web delivery</li>
                <li>• File naming follows pattern: product_[ID]_[INDEX]_[TIMESTAMP].jpg</li>
                <li>• Ensure your hostinger plan supports the required storage space</li>
                <li>• After upload, verify images are accessible via your domain</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Image Manifest */}
        {deploymentData?.manifest.images.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Image Manifest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product ID</th>
                      <th className="text-left p-2">Image Index</th>
                      <th className="text-left p-2">Filename</th>
                      <th className="text-left p-2">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deploymentData.manifest.images.map((image, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{image.productId}</td>
                        <td className="p-2">{image.imageIndex}</td>
                        <td className="p-2 font-mono text-xs">{image.filename}</td>
                        <td className="p-2">{(image.size / 1024).toFixed(1)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ImageDeployment;