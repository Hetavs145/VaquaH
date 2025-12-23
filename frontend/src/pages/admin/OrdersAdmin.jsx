import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderDetailsModal from '@/components/OrderDetailsModal';

const statuses = [
  'confirmed', 'shipping', 'success', 'cancelled'
];

const statusColors = {
  paid: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  shipping: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const OrdersAdmin = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [shippingInput, setShippingInput] = useState({});
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  // Countdown timer for orders marked as success
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns = {};

      orders.forEach(order => {
        if ((order.status === 'success' || order.status === 'cancelled') && order.updatedAt) {
          const updatedTime = order.updatedAt.toDate ? order.updatedAt.toDate() : new Date(order.updatedAt);
          const elapsed = now - updatedTime.getTime();
          const remaining = Math.max(0, 864000000 - elapsed); // 10 days in milliseconds (10 * 24 * 60 * 60 * 1000)

          if (remaining > 0) {
            newCountdowns[order.id] = Math.ceil(remaining / 1000);
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
    return () => clearInterval(interval);
  }, [orders]);

  // Removed auto-delete effect as we are now hiding them instead
  useEffect(() => {
    // Optional: You could still keep a cleanup job, but the requirement is to hide after 10 days.
  }, []);

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
      let fetchedOrders = await adminService.getAllOrders(
        statusFilter === 'all' ? null : statusFilter,
        userIdFilter || null,
        deliveryFilter === 'all' ? null : deliveryFilter
      );

      // Filter out 'success' or 'cancelled' orders from the default list view ONLY if they are older than 10 days
      if (statusFilter === 'all') {
        const tenDaysAgo = Date.now() - 864000000; // 10 days in ms
        fetchedOrders = fetchedOrders.filter(order => {
          if (order.status !== 'success' && order.status !== 'cancelled') return true;
          if (!order.updatedAt) return true; // Keep if no date
          const updatedTime = order.updatedAt.toDate ? order.updatedAt.toDate().getTime() : new Date(order.updatedAt).getTime();
          return updatedTime > tenDaysAgo;
        });
      }

      // Sorting Logic: Active (Top) > Success (Middle) > Cancelled (Bottom)
      // Within groups: Express > Standard
      // Then: Latest date first
      fetchedOrders.sort((a, b) => {
        const getStatusPriority = (status) => {
          if (status === 'cancelled') return 2;
          if (status === 'success') return 1;
          return 0; // Active/Pending/etc
        };

        const statusA = getStatusPriority(a.status);
        const statusB = getStatusPriority(b.status);

        if (statusA !== statusB) {
          return statusA - statusB; // Lower priority number = Higher in list
        }

        // Secondary Sort: Delivery Type (Express > Standard)
        const getDeliveryPriority = (method) => (method === 'express' ? 1 : 0);
        const deliveryA = getDeliveryPriority(a.shippingMethod);
        const deliveryB = getDeliveryPriority(b.shippingMethod);

        if (deliveryA !== deliveryB) {
          return deliveryB - deliveryA; // Higher score (1 = express) first
        }

        // Tertiary Sort: Date Descending
        const getTime = (o) => {
          if (o.createdAt?.toDate) return o.createdAt.toDate().getTime();
          if (o.createdAt) return new Date(o.createdAt).getTime();
          return 0;
        };
        return getTime(b) - getTime(a);
      });

      setOrders(fetchedOrders);
      const shipping = {};
      fetchedOrders.forEach(o => { shipping[o.id] = o.shippingId || ''; });
      setShippingInput(shipping);
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

    // Strict Status Flow Validation
    const order = orders.find(o => o.id === orderId);
    const currentStatus = order?.status;

    // Lock Logic: Cannot change status if already success or cancelled
    if (currentStatus === 'success' || currentStatus === 'cancelled') {
      toast({
        title: 'Action Locked',
        description: `Order is already ${currentStatus} and cannot be changed.`,
        variant: 'destructive'
      });
      return;
    }

    if (nextStatus === 'cancelled') {
      // Allow cancellation from any status (except final ones, caught above)
    } else {
      // Define allowed transitions
      const allowed = {
        'paid': ['confirmed'],
        'confirmed': ['shipping'],
        'shipping': ['out_for_delivery'],
        'out_for_delivery': ['success']
      };

      // Check if transition is allowed
      if (allowed[currentStatus] && !allowed[currentStatus].includes(nextStatus)) {
        toast({
          title: 'Invalid Transition',
          description: `Cannot move from ${currentStatus} to ${nextStatus}. Follow the strict flow.`,
          variant: 'destructive'
        });
        return;
      }

      // Specific check for Shipping: Must have AWB
      if (nextStatus === 'shipping') {
        const shippingId = shippingInput[orderId] || order.shippingId;
        if (!shippingId || shippingId.trim() === '') {
          toast({
            title: 'Missing AWB',
            description: 'Please save a Shipping ID / AWB before moving to Shipping status.',
            variant: 'destructive'
          });
          return;
        }
      }
    }

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

  const updateShipping = async (orderId) => {
    try {
      const value = shippingInput[orderId] || '';
      await adminService.updateOrderShipping(orderId, value.trim());
      toast({ title: 'Shipping updated', description: 'AWB/Shipping ID saved.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save shipping ID', variant: 'destructive' });
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
      <div className="container-custom py-4 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">Orders Management</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
        </div>

        {/* Auto-deletion warning */}
        <Alert className="mb-4 sm:mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 text-sm sm:text-base">
            <strong>Note:</strong> Orders marked as "success" or "cancelled" will be hidden from this list after 10 days.
            This helps maintain a clean order history. Statuses "success" and "cancelled" are final and cannot be changed.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-center">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User ID Filter</label>
                <Input
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  placeholder="Filter by User ID"
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Type</label>
                <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadOrders} className="w-full text-sm sm:text-base">
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
            <CardTitle className="text-base sm:text-lg">Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">No orders found</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded-lg p-3 sm:p-4 space-y-3 transition-colors ${order.shippingMethod === 'express'
                      ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base">Order #{order.id}</h3>
                          {order.shippingMethod === 'express' && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span role="img" aria-label="express">⚡</span> Express
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">User: {order.userId}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Created: {(() => {
                            if (!order.createdAt) return 'N/A';
                            const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                            return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
                          })()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-bold">₹{Number(order.totalPrice || 0).toFixed(2)}</div>
                        <div className="flex flex-col items-start sm:items-end gap-1">
                          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                            {order.status || 'created'}
                          </Badge>
                          {['success', 'cancelled'].includes(order.status) && countdowns[order.id] !== undefined && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                              <Clock className="w-3 h-3" />
                              Hides in: {Math.floor(countdowns[order.id] / 86400)}d {Math.floor((countdowns[order.id] % 86400) / 3600)}h
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping ID / AWB */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start sm:items-center">
                      <div className="sm:col-span-2">
                        <Input
                          placeholder="Shipping ID / AWB"
                          value={shippingInput[order.id] || ''}
                          onChange={(e) => setShippingInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                        />
                        {order.shippingId && (
                          <div className="text-xs text-gray-500 mt-1">Current: {order.shippingId}</div>
                        )}
                      </div>
                      <div className="flex sm:justify-end">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => updateShipping(order.id)}>Save Shipping</Button>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-between">
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
                      <Button
                        variant="secondary"
                        onClick={() => setViewingOrder(order)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                      >
                        View Items
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

      <OrderDetailsModal
        order={viewingOrder}
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
};

export default OrdersAdmin;
