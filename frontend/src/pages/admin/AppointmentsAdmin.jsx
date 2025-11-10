import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const statuses = [
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rescheduled: 'bg-orange-100 text-orange-800'
};

const AppointmentsAdmin = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
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
        loadAppointments();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await adminService.getAllAppointments(
        statusFilter === 'all' ? null : statusFilter, 
        userIdFilter || null
      );
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
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

  // Format Indian phone number
  const formatIndianPhone = (phone) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  // Format Indian date
  const formatIndianDate = (date) => {
    if (!date) return 'N/A';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
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
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">Appointments Management</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">Admin</Badge>
        </div>

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
                  <div key={appointment.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">Appointment #{appointment.id}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">User: {appointment.userId}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Service: {appointment.service || appointment.serviceType || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Date: {formatIndianDate(appointment.date || appointment.createdAt)} at {appointment.time || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Phone: {formatIndianPhone(appointment.contactPhone)}
                        </p>
                        {appointment.address && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Address: {appointment.address}
                          </p>
                        )}
                        {appointment.description && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">
                            {appointment.description}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-600">
                          Created: {formatIndianDate(appointment.createdAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="flex flex-col items-start sm:items-end gap-1">
                          <Badge className={statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}>
                            {appointment.status || 'pending'}
                          </Badge>
                          {appointment.priority && (
                            <Badge variant="outline" className="text-xs">
                              {appointment.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
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
                      <Button 
                        disabled={updatingId === appointment.id}
                        onClick={() => updateStatus(appointment.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingId === appointment.id ? 'Updating...' : 'Mark Completed'}
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

export default AppointmentsAdmin;

