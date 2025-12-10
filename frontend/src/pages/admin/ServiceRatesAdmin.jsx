import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Wrench, Plus, Edit, Trash2, AlertTriangle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { imageUploadService } from '@/services/imageUploadService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';

const ServiceRatesAdmin = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminStatus, setAdminStatus] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '', // Base price
        category: '',
        imageUrl: '',
        features: []
    });
    const [featuresList, setFeaturesList] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    const checkAdminAccess = async () => {
        if (!user) return;
        try {
            const status = await adminService.checkAdminStatus(user.uid);
            setAdminStatus(status);
            if (status.isAdmin) {
                loadServices();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const loadServices = async () => {
        try {
            setLoading(true);
            const fetchedServices = await adminService.getAllServices();
            setServices(fetchedServices);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch services',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);

            let finalFormData = { ...formData };
            finalFormData.features = featuresList.map(f => (f || '').trim()).filter(Boolean);

            if (imageFile) {
                // Upload to Firebase Storage
                const storageUrls = await imageUploadService.uploadMultipleImages(
                    [imageFile],
                    finalFormData.name || 'service',
                    'services'
                );
                finalFormData.imageUrl = storageUrls[0] || '';
            }

            if (editingService) {
                await adminService.updateService(editingService.id, finalFormData);
                toast({ title: 'Success', description: 'Service updated successfully' });
            } else {
                await adminService.createService(finalFormData);
                toast({ title: 'Success', description: 'Service created successfully' });
            }

            setIsDialogOpen(false);
            setEditingService(null);
            resetForm();
            await loadServices();
        } catch (error) {
            console.error('Failed to save service:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save service', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name || '',
            description: service.description || '',
            price: service.price || '',
            category: service.category || '',
            imageUrl: service.imageUrl || '',
            features: service.features || []
        });
        setFeaturesList([...(service.features || [])]);
        setImagePreview(service.imageUrl || null);
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            await adminService.deleteService(serviceId);
            toast({
                title: 'Success',
                description: 'Service deleted successfully'
            });
            await loadServices();
        } catch (error) {
            console.error('Failed to delete service:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete service',
                variant: 'destructive'
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            imageUrl: '',
            features: []
        });
        setImageFile(null);
        setImagePreview(null);
        setFeaturesList([]);
    };

    if (!adminStatus?.isAdmin) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="container-custom py-8 flex-1">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold">Update Service Rates</h1>
                        <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditingService(null); resetForm(); }} className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingService ? 'Update the details of the service below.' : 'Fill in the details to create a new service.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Service Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., AC Repair"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Base Price (₹)</label>
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
                                        placeholder="e.g., AC, Plumbing"
                                        required
                                    />
                                </div>

                                {/* Features */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Features</label>
                                    <div className="space-y-2">
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

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Image</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">JPEG, PNG, WebP (MAX. 5MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>

                                        {imagePreview && (
                                            <div className="relative w-32 h-32">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Service description"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="w-full sm:w-auto" disabled={uploading}>
                                        {uploading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Services List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Services ({services.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600"></div>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No services found</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.map((service) => (
                                    <Card key={service.id} className="overflow-hidden">
                                        <div className="aspect-video overflow-hidden relative bg-gray-100">
                                            {service.imageUrl ? (
                                                <img
                                                    src={service.imageUrl}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <Wrench className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-lg">{service.name}</h3>
                                                <span className="font-bold text-cyan-600">₹{Number(service.price).toFixed(2)}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">{service.category}</p>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{service.description}</p>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(service)}
                                                    className="flex-1"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(service.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default ServiceRatesAdmin;
