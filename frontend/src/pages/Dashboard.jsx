import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { appointmentService, orderService } from '@/services/firestoreService';
import { Calendar, ShoppingBag, Clock, User, AlertCircle, Phone } from 'lucide-react';
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
            <div className="min-h-screen bg-gray-50/50">
                <div className="container-custom py-8 sm:py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
                            <Clock className="w-4 h-4" />
                            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                    </div>

                    {/* Notifications */}
                    {notifications.length > 0 && (
                        <div className="mb-8 space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="bg-white border-l-4 border-blue-500 shadow-sm rounded-r-lg p-4 flex items-center gap-4 animate-in slide-in-from-top-2 duration-300"
                                >
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order Update</p>
                                        <p className="text-gray-600 text-sm">{notification.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {user && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                    <CardTitle className="text-blue-100 font-medium text-sm uppercase tracking-wider">Profile</CardTitle>
                                    <User className="h-5 w-5 text-blue-100" />
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold truncate">{user.name}</div>
                                    <p className="text-blue-100 text-sm mt-1 truncate opacity-90">{user.email}</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-gray-500 font-medium text-sm uppercase tracking-wider">Appointments</CardTitle>
                                    <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900">{appointmentsLoading ? '-' : appointments.length}</div>
                                    <p className="text-xs text-gray-500 mt-1">Scheduled services</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-gray-500 font-medium text-sm uppercase tracking-wider">Orders</CardTitle>
                                    <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                                        <ShoppingBag className="h-5 w-5 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900">{ordersLoading ? '-' : orders.length}</div>
                                    <p className="text-xs text-gray-500 mt-1">Purchased items</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Tabs defaultValue="appointments" className="space-y-6">
                        <TabsList className="bg-white p-1 shadow-sm border rounded-xl w-full sm:w-auto inline-flex">
                            <TabsTrigger
                                value="appointments"
                                className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                            >
                                Appointments
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                            >
                                Orders
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="appointments" className="animate-in fade-in-50 duration-300">
                            <Card className="border-none shadow-md bg-white overflow-hidden">
                                <CardHeader className="border-b bg-gray-50/50">
                                    <CardTitle className="text-xl font-heading text-gray-800">Your Appointments</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {appointmentsLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : appointments.length === 0 ? (
                                        <div className="text-center py-16 px-4">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">No appointments scheduled</h3>
                                            <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Book a service with our expert technicians to ensure your AC runs perfectly.</p>
                                            <Button onClick={() => navigate('/appointments/new')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-200">
                                                Schedule Service
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {/* Desktop Header */}
                                            <div className="hidden md:grid grid-cols-5 p-4 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <div>Service Details</div>
                                                <div>Date & Time</div>
                                                <div>Contact</div>
                                                <div>Status</div>
                                                <div className="text-right">Actions</div>
                                            </div>

                                            {/* Sorting logic: Pending/Active first, then Completed/Cancelled. Within groups, sort by date desc */}
                                            {(() => {
                                                const getStatusPriority = (status) => {
                                                    const s = (status || '').toLowerCase();
                                                    if (['completed', 'cancelled', 'rejected'].includes(s)) return 1;
                                                    return 0;
                                                };

                                                const getDate = (apt) => {
                                                    if (apt.date) {
                                                        return apt.date.toDate ? apt.date.toDate() : new Date(apt.date);
                                                    }
                                                    if (apt.createdAt) {
                                                        return apt.createdAt.toDate ? apt.createdAt.toDate() : new Date(apt.createdAt);
                                                    }
                                                    return new Date(0);
                                                };

                                                const sortedAppointments = [...appointments].sort((a, b) => {
                                                    // Primary sort: Status Priority (0 comes before 1)
                                                    const priorityA = getStatusPriority(a.status);
                                                    const priorityB = getStatusPriority(b.status);
                                                    if (priorityA !== priorityB) return priorityA - priorityB;

                                                    // Secondary sort: Date (Latest first)
                                                    return getDate(b) - getDate(a);
                                                });

                                                return sortedAppointments.map((apt) => {
                                                    const aptId = apt.id || apt._id;
                                                    const aptDate = apt.date ? (apt.date?.toDate ? apt.date.toDate() : new Date(apt.date)) : (apt.createdAt?.toDate ? apt.createdAt.toDate() : new Date(apt.createdAt || Date.now()));
                                                    const formattedDate = aptDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                    const status = apt.status || 'pending';


                                                    const statusStyles = {
                                                        completed: 'bg-green-100 text-green-700 border-green-200',
                                                        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
                                                        in_progress: 'bg-purple-100 text-purple-700 border-purple-200',
                                                        cancelled: 'bg-red-100 text-red-700 border-red-200',
                                                        rescheduled: 'bg-orange-100 text-orange-700 border-orange-200',
                                                        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                    };

                                                    return (
                                                        <div key={aptId} className="group p-4 hover:bg-gray-50 transition-colors grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 items-center">
                                                            {/* Service */}
                                                            <div className="col-span-1">
                                                                <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Service</p>
                                                                <div className="font-semibold text-gray-900">{apt.service || apt.serviceType || 'General Service'}</div>
                                                                <p className="text-xs text-gray-500 mt-0.5">ID: {aptId.slice(-6).toUpperCase()}</p>
                                                            </div>

                                                            {/* Date */}
                                                            <div className="col-span-1">
                                                                <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Date</p>
                                                                <div className="flex items-center gap-2 text-gray-700">
                                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                                    <span>{formattedDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                    <span>{apt.time || 'Time Not Set'}</span>
                                                                </div>
                                                            </div>

                                                            {/* Contact */}
                                                            <div className="col-span-1">
                                                                <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Contact</p>
                                                                <div className="text-gray-700 font-medium">{apt.contactPhone || 'N/A'}</div>
                                                            </div>

                                                            {/* Status */}
                                                            <div className="col-span-1">
                                                                <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.pending}`}>
                                                                    {status.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="col-span-1 text-right">
                                                                <a href="tel:+919999999999" className="inline-block">
                                                                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 gap-2">
                                                                        <Phone className="w-3 h-3" /> Contact
                                                                    </Button>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="animate-in fade-in-50 duration-300">
                            <Card className="border-none shadow-md bg-white overflow-hidden">
                                <CardHeader className="border-b bg-gray-50/50">
                                    <CardTitle className="text-xl font-heading text-gray-800">Order History</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {ordersLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-16 px-4">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
                                            <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Explore our range of premium AC products and accessories.</p>
                                            <Button onClick={() => navigate('/products')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-200">
                                                Start Shopping
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {/* Desktop Header */}
                                            <div className="hidden md:grid grid-cols-5 p-4 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <div>Order Info</div>
                                                <div>Date</div>
                                                <div>Amount</div>
                                                <div>Status</div>
                                                <div className="text-right">Shipping</div>
                                            </div>

                                            {orders.map((order) => {
                                                const orderId = order.id || order._id;
                                                const orderDate = new Date((order.createdAt && order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt) || Date.now()).toLocaleDateString();
                                                const status = order.status || 'created';

                                                const statusStyles = {
                                                    success: 'bg-green-100 text-green-700 border-green-200',
                                                    delivered: 'bg-green-100 text-green-700 border-green-200',
                                                    paid: 'bg-blue-100 text-blue-700 border-blue-200',
                                                    shipping: 'bg-purple-100 text-purple-700 border-purple-200',
                                                    out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
                                                    cancelled: 'bg-red-100 text-red-700 border-red-200',
                                                    created: 'bg-gray-100 text-gray-700 border-gray-200'
                                                };

                                                return (
                                                    <div key={orderId} className="group p-4 hover:bg-gray-50 transition-colors grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 items-center">
                                                        {/* Order Info */}
                                                        <div className="col-span-1">
                                                            <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Order</p>
                                                            <div className="font-semibold text-gray-900">#{orderId.slice(-8).toUpperCase()}</div>
                                                            <p className="text-xs text-gray-500 mt-0.5">{order.items?.length || 1} Item(s)</p>
                                                        </div>

                                                        {/* Date */}
                                                        <div className="col-span-1">
                                                            <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Date</p>
                                                            <div className="text-gray-700">{orderDate}</div>
                                                        </div>

                                                        {/* Amount */}
                                                        <div className="col-span-1">
                                                            <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Amount</p>
                                                            <div className="font-bold text-gray-900">₹{Number(order.totalPrice || 0).toLocaleString()}</div>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="col-span-1">
                                                            <p className="md:hidden text-xs text-gray-400 uppercase font-semibold mb-1">Status</p>
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.created}`}>
                                                                    {status.replace(/_/g, ' ')}
                                                                </span>
                                                                {status === 'success' && countdowns[orderId] !== undefined && (
                                                                    <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                                                        Clears in {Math.floor(countdowns[orderId] / 60)}m
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Shipping/Actions */}
                                                        <div className="col-span-1 text-right">
                                                            {order.shippingId ? (
                                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                                    {order.shippingId}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Processing</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Dashboard;
