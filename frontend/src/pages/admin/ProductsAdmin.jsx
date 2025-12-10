import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, AlertTriangle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { imageUploadService } from '@/services/imageUploadService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageCarousel from '@/components/ImageCarousel';
import { getPlaceholderImage } from '@/utils/placeholderImage';

const ProductsAdmin = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    images: [], // Array of image URLs for carousel
    featured: false,
    inStock: true,
    features: [],
    specifications: {}
  });
  const [featuresInput, setFeaturesInput] = useState('');
  const [specsInput, setSpecsInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  // Line-by-line inputs state
  const [featuresList, setFeaturesList] = useState([]);
  const [specsList, setSpecsList] = useState([]); // [{ key: '', value: '' }]
  const [fixedSpecs, setFixedSpecs] = useState({
    brand: '',
    capacity: '',
    rating: ''
  });

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

  const parseFeatures = (text) => text.split('\n').map(s => s.trim()).filter(Boolean);
  const parseSpecs = (text) => {
    const result = {};
    text.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key) result[key] = value;
      }
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      let finalFormData = { ...formData };
      // Build from line-by-line UI; fall back to textareas if present
      const builtFeatures = featuresList.length > 0
        ? featuresList.map(f => (f || '').trim()).filter(Boolean)
        : parseFeatures(featuresInput);
      const builtSpecs = specsList.length > 0
        ? specsList.reduce((acc, pair) => {
          const key = (pair.key || '').trim();
          const value = (pair.value || '').trim();
          if (key && value) acc[key] = value;
          return acc;
        }, {})
        : parseSpecs(specsInput);
      finalFormData.features = builtFeatures;
      finalFormData.features = builtFeatures;

      // Merge fixed specs with dynamic specs
      const mergedSpecs = {
        'Brand': fixedSpecs.brand,
        'Capacity': `${fixedSpecs.capacity} Ton`,
        'Energy Rating': `${fixedSpecs.rating} Star`,
        ...builtSpecs
      };
      finalFormData.specifications = mergedSpecs;
      finalFormData.brand = fixedSpecs.brand; // Sync top-level brand

      // Validation
      if (!fixedSpecs.brand || !fixedSpecs.capacity || !fixedSpecs.rating) {
        toast({
          title: 'Missing Required Fields',
          description: 'Please fill in Brand, Capacity, and Rating.',
          variant: 'destructive'
        });
        setUploading(false);
        return;
      }

      if (!editingProduct && imageFiles.length > 0) {
        // Upload to Firebase Storage and store HTTPS URLs
        const storageUrls = await imageUploadService.uploadMultipleImages(imageFiles, finalFormData.name || 'product');
        finalFormData.images = storageUrls;
        finalFormData.imageUrl = storageUrls[0] || '';
      }

      if (editingProduct) {
        let updatedImages = [...(finalFormData.images || [])];
        if (imageFiles.length > 0) {
          const newUrls = await imageUploadService.uploadMultipleImages(imageFiles, editingProduct.id);
          updatedImages = [...updatedImages, ...newUrls];
        }
        finalFormData.images = updatedImages;
        finalFormData.imageUrl = updatedImages[0] || '';

        await adminService.updateProduct(editingProduct.id, finalFormData);
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        const newProduct = await adminService.createProduct(finalFormData);
        toast({ title: 'Success', description: 'Product created successfully' });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save product', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const productImages = (product.images || [product.imageUrl]).filter(Boolean);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      imageUrl: productImages[0] || product.imageUrl || '',
      images: productImages,
      featured: product.featured || false,
      inStock: product.inStock !== false,
      features: product.features || [],
      specifications: product.specifications || {}
    });
    setFeaturesInput((product.features || []).join('\n'));
    setSpecsInput(Object.entries(product.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n'));
    // Populate line-by-line lists
    setFeaturesList([...(product.features || [])]);
    // Extract fixed specs and populate dynamic specs list
    const specs = product.specifications || {};
    const brandKey = Object.keys(specs).find(k => k.toLowerCase().includes('brand'));
    const capKey = Object.keys(specs).find(k => k.toLowerCase().includes('capacity') || k.toLowerCase().includes('tonnage'));
    const rateKey = Object.keys(specs).find(k => k.toLowerCase().includes('energy') || k.toLowerCase().includes('star'));

    setFixedSpecs({
      brand: brandKey ? specs[brandKey] : (product.brand || ''),
      capacity: capKey ? String(specs[capKey]).replace(/ton/i, '').trim() : '',
      rating: rateKey ? String(specs[rateKey]).replace(/star/i, '').trim() : ''
    });

    const dynamicSpecs = Object.entries(specs)
      .filter(([k]) => k !== brandKey && k !== capKey && k !== rateKey)
      .map(([key, value]) => ({ key, value }));

    setSpecsList(dynamicSpecs);
    setImagePreviews(productImages);
    setImageFiles([]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminService.deleteProduct(productId);
      // Remove images from local storage
      imageUploadService.removeImageFromLocal(productId, 0);
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > 10) {
      toast({
        title: 'Error',
        description: 'Maximum 10 images allowed per product',
        variant: 'destructive'
      });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      images: [],
      featured: false,
      inStock: true,
      features: [],
      specifications: {}
    });
    setFeaturesInput('');
    setSpecsInput('');
    setImageFiles([]);
    setImagePreviews([]);
    setFeaturesList([]);
    setSpecsList([]);
    setFixedSpecs({ brand: '', capacity: '', rating: '' });
  };

  const getProductImages = (product) => {
    const images = product.images || [];
    const mainImage = product.imageUrl || product.image;
    if (images.length > 0) return images;
    if (mainImage) return [mainImage];
    return [getPlaceholderImage()];
  };

  const handleViewImages = (product) => {
    const images = getProductImages(product);
    setSelectedProductImages(images);
    setShowImageModal(true);
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
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold">Products Management</h1>
            <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProduct(null); resetForm(); }} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Responsive form grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Split AC, Window AC"
                    required
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <div className="space-y-2">
                    {featuresList.length === 0 && (
                      <div className="text-xs text-gray-500">Add features one by one.</div>
                    )}
                    {featuresList.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const next = [...featuresList];
                            next[index] = e.target.value;
                            setFeaturesList(next);
                          }}
                          placeholder={`Feature ${index + 1}`}
                        />
                        <Button type="button" variant="outline" onClick={() => setFeaturesList(featuresList.filter((_, i) => i !== index))}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => setFeaturesList([...featuresList, ''])} className="w-fit">
                      <Plus className="w-4 h-4 mr-1" /> Add Feature
                    </Button>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium mb-2">Specifications</label>

                  {/* Fixed Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Brand *</label>
                      <Input
                        value={fixedSpecs.brand}
                        onChange={(e) => setFixedSpecs({ ...fixedSpecs, brand: e.target.value })}
                        placeholder="e.g. Voltas"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Capacity (Ton) *</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={fixedSpecs.capacity}
                          onChange={(e) => setFixedSpecs({ ...fixedSpecs, capacity: e.target.value })}
                          placeholder="e.g. 1.5"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">Ton</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Energy Rating (Star) *</label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={fixedSpecs.rating}
                          onChange={(e) => setFixedSpecs({ ...fixedSpecs, rating: e.target.value })}
                          placeholder="e.g. 5"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">Star</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {specsList.length === 0 && (
                      <div className="text-xs text-gray-500">Add other specifications below (e.g. Condenser Coil, Warranty).</div>
                    )}
                    {specsList.map((pair, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                        <Input
                          value={pair.key}
                          onChange={(e) => {
                            const next = [...specsList];
                            next[index] = { ...next[index], key: e.target.value };
                            setSpecsList(next);
                          }}
                          placeholder="Key (e.g., Capacity)"
                          className="sm:col-span-2"
                        />
                        <Input
                          value={pair.value}
                          onChange={(e) => {
                            const next = [...specsList];
                            next[index] = { ...next[index], value: e.target.value };
                            setSpecsList(next);
                          }}
                          placeholder="Value (e.g., 1.5 Ton)"
                          className="sm:col-span-2"
                        />
                        <Button type="button" variant="outline" onClick={() => setSpecsList(specsList.filter((_, i) => i !== index))}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => setSpecsList([...specsList, { key: '', value: '' }])} className="w-fit">
                      <Plus className="w-4 h-4 mr-1" /> Add Specification
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Images (Up to 10)</label>
                  {!editingProduct ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">JPEG, PNG, WebP (MAX. 5MB each)</p>
                            <p className="text-xs text-gray-500">Current: {imagePreviews.length}/10 images</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={imagePreviews.length >= 10}
                          />
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Current images: {imagePreviews.length} |
                        <span className="text-blue-600"> First image is the main product image</span>
                      </p>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Current image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                    required
                  />
                </div>

                {/* Responsive checkbox layout */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured Product
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="mr-2"
                    />
                    In Stock
                  </label>
                </div>

                <div className="text-sm text-gray-600">
                  <p>* All fields are required</p>
                  <p>* First uploaded image will be the main product image</p>
                </div>

                {/* Responsive button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={uploading}>
                    {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No products found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                  const productImages = getProductImages(product);
                  const mainImage = productImages[0] || getPlaceholderImage();

                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getPlaceholderImage();
                          }}
                        />
                        {productImages.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            +{productImages.length - 1} more
                          </div>
                        )}
                        <button
                          onClick={() => handleViewImages(product)}
                          className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-75"
                        >
                          <ImageIcon size={16} />
                        </button>
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{product.name}</h3>
                          <div className="flex flex-wrap gap-1">
                            {product.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                            )}
                            {!product.inStock && (
                              <Badge className="bg-red-100 text-red-800 text-xs">Out of Stock</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                        <p className="text-lg font-bold text-green-600 mb-3">₹{Number(product.price || 0).toFixed(2)}</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                        {/* Responsive button layout */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageCarousel
          images={selectedProductImages}
          productName="Product Images"
          onClose={() => setShowImageModal(false)}
          isModal={true}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProductsAdmin;
