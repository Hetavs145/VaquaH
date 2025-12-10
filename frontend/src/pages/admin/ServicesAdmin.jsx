import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const statuses = [
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
];

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
};

const ServicesAdmin = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [userIdFilter, setUserIdFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const [adminStatus, setAdminStatus] = useState(null);
    const [countdowns, setCountdowns] = useState({});

    // Countdown timer for appointments marked as completed
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newCountdowns = {};

            appointments.forEach(app => {
                if ((app.status === 'completed' || app.status === 'cancelled') && app.updatedAt) {
                    const updatedTime = app.updatedAt.toDate ? app.updatedAt.toDate() : new Date(app.updatedAt);
                    const elapsed = now - updatedTime.getTime();
                    const remaining = Math.max(0, 864000000 - elapsed); // 10 days in milliseconds

                    if (remaining > 0) {
                        newCountdowns[app.id] = Math.ceil(remaining / 1000);
                    }
                }
            });

            setCountdowns(newCountdowns);
        }, 1000);

        return () => clearInterval(interval);
        return () => clearInterval(interval);
    }, [appointments]);

    // Removed auto-delete effect as we are now hiding them instead
    useEffect(() => {
        // Optional: Keep for cleanup if needed, but UI will hide them.
    }, []);

    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    const checkAdminAccess = async () => {
        if (!user) return;

        try {
            const status = await adminService.checkAdminStatus(user.uid);
            setAdminStatus(status);

            if (status.isAdmin) {
                loadAppointments();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            // Assuming adminService has a method to get all appointments, similar to getAllOrders
            // If not, we might need to add it or use a similar method.
            // For now, I'll assume getAllAppointments exists or I'll need to create it.
            // Since I cannot see adminService, I will assume it needs to be added or use a generic fetch if available.
            // Given the prompt "exact mange orders just the thing is it would be for service", I'll assume a similar structure.
            let appointmentsData = await adminService.getAllAppointments(
                statusFilter === 'all' ? null : statusFilter,
                userIdFilter || null
            );

            // Filter out 'completed' or 'cancelled' appointments from the default list view ONLY if they are older than 10 days
            if (statusFilter === 'all') {
                const tenDaysAgo = Date.now() - 864000000; // 10 days in ms
                appointmentsData = appointmentsData.filter(app => {
                    if (app.status !== 'completed' && app.status !== 'cancelled') return true;
                    if (!app.updatedAt) return true;
                    const updatedTime = app.updatedAt.toDate ? app.updatedAt.toDate().getTime() : new Date(app.updatedAt).getTime();
                    return updatedTime > tenDaysAgo;
                });
            }

            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            // Fallback for now if the service method doesn't exist yet, to avoid crashing
            setAppointments([]);
            toast({
                title: 'Error',
                description: 'Failed to fetch appointments',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appointmentId, nextStatus) => {
        if (!nextStatus) return;

        // Strict Status Flow Validation
        const appointment = appointments.find(a => a.id === appointmentId);
        const currentStatus = appointment?.status;

        // Lock Logic: Cannot change status if already completed or cancelled
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            toast({
                title: 'Action Locked',
                description: `Service is already ${currentStatus} and cannot be changed.`,
                variant: 'destructive'
            });
            return;
        }

        if (nextStatus === 'cancelled') {
            // Allow cancellation from any status
        } else {
            // Define allowed transitions
            const allowed = {
                'pending': ['confirmed'],
                'confirmed': ['in_progress'],
                'in_progress': ['completed']
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
        }

        setUpdatingId(appointmentId);
        try {
            await adminService.updateAppointmentStatus(appointmentId, nextStatus, '', user.uid);
            toast({
                title: 'Success',
                description: `Appointment status updated to ${nextStatus}`
            });
            await loadAppointments();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update appointment status',
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
            <div className="container-custom py-4 sm:py-8 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                    <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Services Management</h1>
                    <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
                </div>

                <Alert className="mb-4 sm:mb-6 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm sm:text-base">
                        <strong>Note:</strong> Appointments marked as "completed" or "cancelled" will be hidden from this list after 10 days.
                        This helps maintain a clean service history. Statuses "completed" and "cancelled" are final.
                    </AlertDescription>
                </Alert>

                {/* Filters */}
                <Card className="mb-4 sm:mb-6">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                <Button onClick={loadAppointments} className="w-full text-sm sm:text-base">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Appointments ({appointments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">No appointments found</div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={`border rounded-lg p-3 sm:p-4 space-y-3 ${appointment.priority === 'urgent' ? 'bg-red-50 border-red-200 shadow-sm' : ''
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm sm:text-base">Service: {appointment.service}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">User: {appointment.userId}</p>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    Date: {appointment.date} | Time: {appointment.time}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    Phone: {appointment.contactPhone} {appointment.alternatePhone && `| Alt: ${appointment.alternatePhone}`}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <div className="flex flex-col items-start sm:items-end gap-1">
                                                    <Badge className={statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}>
                                                        {appointment.status || 'pending'}
                                                    </Badge>
                                                    <Badge variant="outline" className="mt-1">
                                                        Priority: {appointment.priority}
                                                    </Badge>
                                                    {['completed', 'cancelled'].includes(appointment.status) && countdowns[appointment.id] !== undefined && (
                                                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            Hides in: {Math.floor(countdowns[appointment.id] / 86400)}d {Math.floor((countdowns[appointment.id] % 86400) / 3600)}h
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end">
                                            <Select onValueChange={(value) => updateStatus(appointment.id, value)}>
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

export default ServicesAdmin;
