import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Shield, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminManagement = () => {
  const { user } = useAuth();
  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) load();
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await adminService.listAdminRequests();
      setAdminRequests(resp.requests || []);
    } catch (e) {
      console.error('Error loading admin requests:', e);
      toast({ title: 'Error', description: 'Failed to load admin requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (req) => {
    setActionLoading(true);
    try {
      await adminService.grantAdminRole(req.uid, req.email, user.uid);
      toast({ title: 'Success', description: `Admin role granted to ${req.email}` });
      load();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to grant admin role', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest || !denyReason.trim()) return;
    setActionLoading(true);
    try {
      await adminService.denyAdminRequest(selectedRequest.uid, denyReason.trim(), user.uid);
      toast({ title: 'Success', description: 'Admin request denied' });
      setDenyReason('');
      setSelectedRequest(null);
      load();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to deny request', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied': return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (!user?.isAdmin) {
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
              <p className="text-center text-gray-600">You need admin access to view this page.</p>
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
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Admin Access Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : adminRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No admin requests found.</div>
            ) : (
              <div className="space-y-4">
                {adminRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{request.email}</h3>
                        <p className="text-sm text-gray-600">UID: {request.uid}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Requested: {formatDate(request.requestedAt)}</p>
                      {request.reviewedAt && <p>Reviewed: {formatDate(request.reviewedAt)}</p>}
                      {request.notes && <p>Notes: {request.notes}</p>}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button onClick={() => handleGrant(request)} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                          {actionLoading ? 'Granting...' : 'Grant Admin'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" disabled={actionLoading} className="border-red-200 text-red-700 hover:bg-red-50">
                              Deny Request
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Deny Admin Request</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-gray-600">Are you sure you want to deny admin access for {request.email}?</p>
                              <div>
                                <label className="block text-sm font-medium mb-2">Reason for denial</label>
                                <Textarea value={denyReason} onChange={(e) => setDenyReason(e.target.value)} placeholder="Enter reason..." rows={3} />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setSelectedRequest(null); setDenyReason(''); }}>Cancel</Button>
                                <Button onClick={() => { setSelectedRequest(request); handleDeny(); }} disabled={!denyReason.trim() || actionLoading} className="bg-red-600 hover:bg-red-700">
                                  {actionLoading ? 'Denying...' : 'Deny Request'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
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

export default AdminManagement;
