import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const statuses = [
  'created', 'payment_pending', 'paid', 'success', 'shipping', 
  'out_for_delivery', 'delivered', 'cod_pending', 'awaiting_advance', 
  'advance_paid', 'cancelled', 'refunded'
];

const statusColors = {
  created: 'bg-gray-100 text-gray-800',
  payment_pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  shipping: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cod_pending: 'bg-orange-100 text-orange-800',
  awaiting_advance: 'bg-red-100 text-red-800',
  advance_paid: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

const OrdersAdmin = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const status = await adminService.checkAdminStatus(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        loadOrders();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orders = await adminService.getAllOrders(statusFilter || null, userIdFilter || null);
      setOrders(orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;
    
    setUpdatingId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, nextStatus, '', user.uid);
      toast({
        title: 'Success',
        description: `Order status updated to ${nextStatus}`
      });
      await loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    } finally {
      setUpdatingId(null);
    }
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
      <div className="container-custom py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200">Admin</Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User ID Filter</label>
                <Input
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="Filter by User ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadOrders} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">User: {order.userId}</p>
                        <p className="text-sm text-gray-600">
                          Created: {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">₹{Number(order.totalPrice || 0).toFixed(2)}</div>
                        <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                          {order.status || 'created'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select onValueChange={(value) => updateStatus(order.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Update status..." />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        disabled={updatingId === order.id}
                        onClick={() => updateStatus(order.id, 'success')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingId === order.id ? 'Updating...' : 'Mark Ready'}
                      </Button>
                    </div>
                  </div>
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

export default OrdersAdmin;


