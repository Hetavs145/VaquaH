import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SetupAdmin = () => {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);

  const checkStatus = async () => {
    if (!user) return;
    const status = await adminService.checkAdminStatus(user.uid);
    setAdminStatus(status);
  };

  useEffect(() => { checkStatus(); }, [user]);

  const requestAccess = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const resp = await adminService.requestAdminAccess(user.uid, user.email);
      setResult({ success: resp.success, message: resp.message });
      setTimeout(checkStatus, 800);
    } catch (e) {
      setResult({ success: false, message: e.message || 'Failed to request admin access' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Admin access requires Google sign-in for verification.
                </AlertDescription>
              </Alert>
              <Button onClick={signInWithGoogle} className="w-full bg-blue-600 hover:bg-blue-700">
                Sign in with Google
              </Button>
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
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <CardTitle>Admin Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              {adminStatus && (
                <div className="mt-2">
                  {adminStatus.isAdmin ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">✓ Admin Access Granted</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-200">Pending Admin Approval</Badge>
                  )}
                </div>
              )}
            </div>

            {adminStatus && !adminStatus.isAdmin && (
              <Button onClick={requestAccess} disabled={loading} className="w-full">
                {loading ? 'Requesting...' : 'Request Admin Access'}
              </Button>
            )}

            {result && (
              <div className={`p-3 rounded text-sm ${result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {result.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SetupAdmin;
