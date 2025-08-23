import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { appointmentService, orderService } from '@/services/firestoreService';
import { Calendar, ShoppingBag, Clock, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

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

  // Real-time listener for orders
  useEffect(() => {
    if (!user) return;

    setOrdersLoading(true);
    
    // Subscribe to real-time updates for user orders
    const unsubscribe = orderService.subscribeToUserOrders(user.uid, (ordersData) => {
      setOrders(ordersData || []);
      setOrdersLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

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
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6 font-sans leading-tight" style={{fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"'}}>
          Dashboard
        </h1>
        
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.name}</div>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentsLoading ? '-' : appointments.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ordersLoading ? '-' : orders.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total orders</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="appointments" className="mt-6">
          <TabsList>
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
                    <Button onClick={() => navigate('/appointments/new')}>Schedule Service</Button>
                  </div>
                ) : (
                  <div>
                    {/* Render appointments list */}
                    <div className="rounded-md border">
                      <div className="grid grid-cols-3 p-4 font-medium">
                        <div>Service</div>
                        <div>Date & Time</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {appointments.map((apt) => (
                          <div key={apt.id || apt._id} className="grid grid-cols-3 p-4">
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
                    <Button onClick={() => navigate('/products')}>Shop Products</Button>
                  </div>
                ) : (
                  <div>
                    {/* Render orders list */}
                    <div className="rounded-md border">
                      {/* Header - hidden on small screens */}
                      <div className="hidden md:grid grid-cols-4 p-4 font-medium">
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
                          
                          // Get the actual order status and format it for display
                          const orderStatus = order.status || 'created';
                          const statusLabel = orderStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          
                          // Status color mapping (same as admin panel)
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
                          
                          const statusClass = statusColors[orderStatus] || 'bg-gray-100 text-gray-800';
                          
                          return (
                            <div key={orderId} className="grid grid-cols-1 md:grid-cols-4 p-4 gap-3 md:gap-0">
                              {/* Order ID */}
                              <div className="min-w-0">
                                <div className="md:hidden text-xs text-gray-500">Order ID</div>
                                <div className="font-mono text-sm truncate">{orderId}</div>
                              </div>
                              {/* Date */}
                              <div>
                                <div className="md:hidden text-xs text-gray-500">Date</div>
                                <div>{orderDate}</div>
                              </div>
                              {/* Total */}
                              <div>
                                <div className="md:hidden text-xs text-gray-500">Total</div>
                                <div className="font-semibold">{totalFormatted}</div>
                              </div>
                              {/* Status */}
                              <div>
                                <div className="md:hidden text-xs text-gray-500">Status</div>
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
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
