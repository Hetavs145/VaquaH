import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Database, UserPlus } from 'lucide-react';

const AdminSetup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const functions = getFunctions();

  const initializeFirstAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const initializeFirstAdminFunction = httpsCallable(functions, 'initializeFirstAdmin');
      const result = await initializeFirstAdminFunction({
        adminEmail,
        adminPassword
      });

      setMessage(`✅ ${result.data.message}\nAdmin UID: ${result.data.adminUid}`);
      setAdminEmail('');
      setAdminPassword('');
    } catch (error) {
      console.error('Error initializing admin:', error);
      setError(error.message || 'Failed to initialize admin user');
    } finally {
      setLoading(false);
    }
  };

  const quickSetup = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const quickSetupFunction = httpsCallable(functions, 'quickSetup');
      const result = await quickSetupFunction({});

      setMessage(`✅ ${result.data.message}`);
    } catch (error) {
      console.error('Error in quick setup:', error);
      setError(error.message || 'Failed to initialize collections');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertDescription>
            Please log in to access the admin setup.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin System Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Initialize the admin system and create necessary collections
          </p>
        </div>

        {/* Quick Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Quick Setup (Collections Only)
            </CardTitle>
            <CardDescription>
              Initialize Firestore collections with sample data. This doesn't create an admin user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={quickSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up collections...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Collections
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Admin User Creation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create First Admin User
            </CardTitle>
            <CardDescription>
              Create the first admin user and initialize all collections. This will give you full admin access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={initializeFirstAdmin} 
              disabled={loading || !adminEmail || !adminPassword}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating admin user...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Admin User
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {message && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 whitespace-pre-line">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Quick Setup:</strong> Use this if you just want to initialize collections</p>
            <p>2. <strong>Create Admin User:</strong> Use this to create your first admin account</p>
            <p>3. After setup, you can log in with the admin credentials</p>
            <p>4. The admin user will have access to all admin functions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;