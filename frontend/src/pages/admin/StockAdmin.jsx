import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Package, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';

const StockAdmin = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminStatus, setAdminStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

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
            const fetchedProducts = await adminService.getAllProducts();
            setProducts(fetchedProducts);
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

    const handleStockToggle = async (productId, currentStatus) => {
        setUpdatingId(productId);
        try {
            const newStatus = !currentStatus;
            await adminService.updateProductStock(productId, newStatus);

            // Optimistic update
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, inStock: newStatus } : p
            ));

            toast({
                title: 'Stock Updated',
                description: `Product marked as ${newStatus ? 'In Stock' : 'Out of Stock'}`
            });
        } catch (error) {
            console.error('Failed to update stock:', error);
            toast({
                title: 'Error',
                description: 'Failed to update stock status',
                variant: 'destructive'
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Update Stock</h1>
                    <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={loadProducts} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products List ({filteredProducts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No products found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Product Name</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-4 py-3">{product.category}</td>
                                                <td className="px-4 py-3">₹{Number(product.price).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs text-gray-500 hidden sm:inline">
                                                            {product.inStock ? 'Mark Out' : 'Mark In'}
                                                        </span>
                                                        <Switch
                                                            checked={product.inStock}
                                                            onCheckedChange={() => handleStockToggle(product.id, product.inStock)}
                                                            disabled={updatingId === product.id}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default StockAdmin;
