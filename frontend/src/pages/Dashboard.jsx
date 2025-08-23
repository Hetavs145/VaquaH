import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { appointmentService, orderService } from '@/services/firestoreService';
import { Calendar, ShoppingBag, Clock, User, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setAppointmentsLoading(true);
          const appointmentsData = await appointmentService.getUserAppointments(user.uid);
          setAppointments(appointmentsData || []);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        } finally {
          setAppointmentsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Add real-time listener for orders
  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for user's orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Check for status changes and create notifications
      const newNotifications = [];
      ordersData.forEach(newOrder => {
        const oldOrder = orders.find(o => o.id === newOrder.id);
        if (oldOrder && oldOrder.status !== newOrder.status) {
          newNotifications.push({
            id: `order-${newOrder.id}-${Date.now()}`,
            type: 'order_status',
            message: `Order #${newOrder.id} status updated to ${newOrder.status.replace(/_/g, ' ')}`,
            orderId: newOrder.id,
            timestamp: new Date()
          });
        }
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
        
        // Auto-remove notifications after 5 seconds
        newNotifications.forEach(notification => {
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 5000);
        });
      }
      
      setOrders(ordersData);
      setOrdersLoading(false);
    }, (error) => {
      console.error('Error listening to orders:', error);
      setOrdersLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, orders]);

  // Countdown timer for orders marked as success
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdowns = {};
      
      orders.forEach(order => {
        if (order.status === 'success' && order.updatedAt) {
          const updatedTime = order.updatedAt.toDate ? order.updatedAt.toDate() : new Date(order.updatedAt);
          const elapsed = now - updatedTime.getTime();
          const remaining = Math.max(0, 600000 - elapsed); // 10 minutes in milliseconds
          
          if (remaining > 0) {
            newCountdowns[order.id] = Math.ceil(remaining / 1000);
          }
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vaquah-blue"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-custom py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
          Dashboard
        </h1>
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 sm:mb-6 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-5 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-blue-800 text-sm sm:text-base">{notification.message}</span>
              </div>
            ))}
          </div>
        )}
        
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold truncate">{user.name}</div>
                <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{appointmentsLoading ? '-' : appointments.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{ordersLoading ? '-' : orders.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total orders</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="appointments" className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vaquah-blue"></div>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No appointments yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Schedule a service appointment to get started</p>
                    <Button onClick={() => navigate('/appointments/new')} className="w-full sm:w-auto">Schedule Service</Button>
                  </div>
                ) : (
                  <div>
                    {/* Responsive appointments list */}
                    <div className="rounded-md border">
                      {/* Header - hidden on small screens, shown on medium+ */}
                      <div className="hidden md:grid grid-cols-3 p-4 font-medium bg-gray-50">
                        <div>Service</div>
                        <div>Date & Time</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {appointments.map((apt) => (
                          <div key={apt.id || apt._id} className="p-4">
                            {/* Mobile view */}
                            <div className="md:hidden space-y-2">
                              <div className="font-medium">{apt.service || apt.serviceType}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(apt.date || apt.appointmentDate || apt.createdAt?.toDate?.() || Date.now()).toLocaleDateString()} at {apt.time}
                              </div>
                              <div>
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold 
                                  ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    apt.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                                    'bg-blue-100 text-blue-800'}`}>
                                  {apt.status}
                                </span>
                              </div>
                            </div>
                            {/* Desktop view */}
                            <div className="hidden md:grid grid-cols-3">
                              <div>{apt.service || apt.serviceType}</div>
                              <div>{new Date(apt.date || apt.appointmentDate || apt.createdAt?.toDate?.() || Date.now()).toLocaleDateString()} at {apt.time}</div>
                              <div>
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold 
                                  ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    apt.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                                    'bg-blue-100 text-blue-800'}`}>
                                  {apt.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vaquah-blue"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Browse our products and make your first purchase</p>
                    <Button onClick={() => navigate('/products')} className="w-full sm:w-auto">Shop Products</Button>
                  </div>
                ) : (
                  <div>
                    {/* Responsive orders list */}
                    <div className="rounded-md border">
                      {/* Header - hidden on small screens, shown on medium+ */}
                      <div className="hidden md:grid grid-cols-4 p-4 font-medium bg-gray-50">
                        <div>Order ID</div>
                        <div>Date</div>
                        <div>Total</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {orders.map((order) => {
                          const orderId = order.id || order._id;
                          const orderDate = new Date((order.createdAt && order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt) || Date.now()).toLocaleDateString();
                          const totalFormatted = `₹${Number(order.totalPrice || 0).toFixed(2)}`;
                          const status = order.status || 'created';
                          const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          const statusClass = 
                            status === 'success' || status === 'delivered' ? 'bg-green-100 text-green-800' :
                            status === 'paid' || status === 'advance_paid' ? 'bg-blue-100 text-blue-800' :
                            status === 'cancelled' || status === 'refunded' ? 'bg-red-100 text-red-800' :
                            status === 'shipping' || status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800';
                          return (
                            <div key={orderId} className="p-4">
                              {/* Mobile view */}
                              <div className="md:hidden space-y-2">
                                <div className="font-medium font-mono text-sm">{orderId}</div>
                                <div className="text-sm text-gray-600">{orderDate}</div>
                                <div className="font-semibold">{totalFormatted}</div>
                                <div className="flex items-center justify-between">
                                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                                  {status === 'success' && countdowns[orderId] !== undefined && (
                                    <div className="text-xs text-orange-600 font-medium">
                                      Deletes in: {Math.floor(countdowns[orderId] / 60)}:{(countdowns[orderId] % 60).toString().padStart(2, '0')}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Desktop view */}
                              <div className="hidden md:grid grid-cols-4 gap-0">
                                <div className="font-mono text-sm truncate">{orderId}</div>
                                <div>{orderDate}</div>
                                <div className="font-semibold">{totalFormatted}</div>
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                                  {status === 'success' && countdowns[orderId] !== undefined && (
                                    <div className="text-xs text-orange-600 font-medium">
                                      Deletes in: {Math.floor(countdowns[orderId] / 60)}:{(countdowns[orderId] % 60).toString().padStart(2, '0')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
