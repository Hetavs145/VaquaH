import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { adminService } from '@/services/adminService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AdminVerification = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const checkCurrentStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const status = await adminService.checkAdminStatus(user.uid);
      setCurrentStatus(status);
    } catch (error) {
      console.error('Error checking status:', error);
      setCurrentStatus({ isAdmin: false, role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminAccess = async () => {
    if (!user || !email) return;
    setLoading(true);
    try {
      const result = await adminService.verifyAndSetAdminStatus(user.uid, email, true);
      setResult(result);
      if (result.success) {
        // Refresh status after a short delay
        setTimeout(checkCurrentStatus, 1000);
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const removeAdminAccess = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await adminService.verifyAndSetAdminStatus(user.uid, user.email, false);
      setResult(result);
      if (result.success) {
        // Refresh status after a short delay
        setTimeout(checkCurrentStatus, 1000);
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
      checkCurrentStatus();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Admin Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please sign in to access admin verification.
                </AlertDescription>
              </Alert>
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
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>Admin Status Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="space-y-2">
              <Label>Current User</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                {currentStatus && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentStatus.isAdmin 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {currentStatus.isAdmin ? 'Admin' : 'User'} ({currentStatus.role})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Verification */}
            <div className="space-y-4">
              <Label htmlFor="email">Email for Admin Verification</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for admin verification"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={verifyAdminAccess} 
                  disabled={loading || !email}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Verifying...' : 'Grant Admin Access'}
                </Button>
                
                {currentStatus?.isAdmin && (
                  <Button 
                    onClick={removeAdminAccess} 
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    Remove Admin Access
                  </Button>
                )}
              </div>
            </div>

            {/* Result */}
            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.success ? 'Admin status updated successfully!' : (result.error || 'Failed to update admin status')}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This page can be used to fix admin permission issues. After granting admin access, 
                you may need to refresh the page or sign out and sign back in for changes to take effect.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AdminVerification;