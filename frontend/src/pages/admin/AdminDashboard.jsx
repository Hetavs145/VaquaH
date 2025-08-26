import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminStatus, setAdminStatus] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const status = await adminService.checkAdminStatus(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        // Load admin stats
        await loadAdminStats();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setError('Failed to verify admin access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      // Use Promise.all to fetch data in parallel for better performance
      const [orders, products, users] = await Promise.all([
        adminService.getAllOrders().catch(err => {
          console.error('Error fetching orders:', err);
          if (err.message.includes('Insufficient permissions')) {
            setError('Admin permissions issue detected. Please contact an administrator to grant you admin access.');
          }
          return [];
        }),
        adminService.getAllProducts().catch(err => {
          console.error('Error fetching products:', err);
          return [];
        }),
        adminService.getAllUsers().catch(err => {
          console.error('Error fetching users:', err);
          if (err.message.includes('Insufficient permissions')) {
            setError('Admin permissions issue detected. Please contact an administrator to grant you admin access.');
          }
          return [];
        })
      ]);
      
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status !== 'success').length,
        totalProducts: products.length,
        totalUsers: users.length
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setError('Failed to load dashboard statistics. Some data may be unavailable.');
      // Set default stats on error to prevent UI issues
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalUsers: 0
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

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
              <p className="text-center text-gray-600 mb-4">
                You need admin access to view this page. Contact an existing admin to request access.
              </p>
              <Button 
                onClick={() => navigate('/admin/setup')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Request Admin Access
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const adminPages = [
    {
      title: 'Orders Management',
      description: 'View and manage customer orders, update statuses',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'Products Management',
      description: 'Add, edit, and manage products and pricing',
      icon: Package,
      path: '/admin/products',
      color: 'bg-green-500'
    },
    {
      title: 'Users Management',
      description: 'Manage customer accounts and admin roles',
      icon: Users,
      path: '/admin/users',
      color: 'bg-purple-500'
    },
    {
      title: 'Offers & Discounts',
      description: 'Manage promotions, discounts, and special offers',
      icon: TrendingUp,
      path: '/admin/offers',
      color: 'bg-orange-500'
    },
    {
      title: 'Admin Management',
      description: 'Manage admin access requests and roles',
      icon: Shield,
      path: '/admin/management',
      color: 'bg-red-500'
    },

  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-custom py-8 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200">Admin</Badge>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Orders</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Pages Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {adminPages.map((page) => (
            <Card key={page.path} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(page.path)}>
              <CardHeader>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${page.color} flex items-center justify-center mb-3 sm:mb-4`}>
                  <page.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg">{page.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">{page.description}</p>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  Access {page.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
