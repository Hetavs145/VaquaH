import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wrench, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  User,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Settings
} from 'lucide-react';
import { agentService } from '@/services/agentService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentProfile, setAgentProfile] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadAgentData();
    }
  }, [user]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const [profile, requests] = await Promise.all([
        agentService.getAgentProfile(user.uid),
        agentService.getAgentServiceRequests(user.uid)
      ]);
      
      setAgentProfile(profile);
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error loading agent data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agent data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await agentService.updateAgentLocation(
              user.uid,
              position.coords.latitude,
              position.coords.longitude
            );
            toast({
              title: 'Success',
              description: 'Location updated successfully'
            });
            await loadAgentData();
          } catch (error) {
            console.error('Error updating location:', error);
            toast({
              title: 'Error',
              description: 'Failed to update location',
              variant: 'destructive'
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Error',
            description: 'Failed to get location. Please enable location services.',
            variant: 'destructive'
          });
        }
      );
    } else {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive'
      });
    }
  };

  const updateServiceStatus = async (serviceId, status) => {
    try {
      await agentService.updateServiceStatus(serviceId, status);
      toast({
        title: 'Success',
        description: `Service status updated to ${status}`
      });
      await loadAgentData();
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive'
      });
    }
  };

  const completeService = async (serviceId, finalPrice) => {
    try {
      const result = await agentService.completeService(serviceId, finalPrice, 'cash');
      toast({
        title: 'Success',
        description: `Service completed! You earned ₹${result.agentAmount.toFixed(2)}`
      });
      await loadAgentData();
    } catch (error) {
      console.error('Error completing service:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete service',
        variant: 'destructive'
      });
    }
  };

  if (!user || user.role !== 'agent') {
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
              <p className="text-center text-gray-600 mb-4">
                You need to be an agent to access this page.
              </p>
              <Button 
                onClick={() => navigate('/apply-agent')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Apply as Agent
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agentProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <CardTitle>Profile Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Your agent profile is not available. Please contact admin support.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingServices = serviceRequests.filter(service => 
    ['assigned', 'in_progress'].includes(service.status)
  );
  const completedServices = serviceRequests.filter(service => 
    service.status === 'completed'
  );
  const totalEarnings = completedServices.reduce((sum, service) => 
    sum + (service.agentAmount || 0), 0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-custom py-4 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold">Agent Dashboard</h1>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 w-fit">Agent</Badge>
        </div>

        {/* Agent Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Agent Profile</CardTitle>
              <Button onClick={updateLocation} variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" />
                Update Location
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">{agentProfile.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {agentProfile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {agentProfile.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {agentProfile.city}, {agentProfile.state}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={agentProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {agentProfile.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Rating: {agentProfile.rating || 0}/5
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Services:</span>
                    <span className="font-semibold">{agentProfile.totalServices || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings:</span>
                    <span className="font-semibold text-green-600">₹{agentProfile.totalEarnings || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Services Offered:</h4>
              <div className="flex flex-wrap gap-2">
                {agentProfile.services?.map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Services</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{pendingServices.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Completed Services</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{completedServices.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{agentProfile.rating || 0}/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Active Services</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
          </TabsList>

          {/* Active Services Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Active Service Requests</CardTitle>
                  <Button onClick={loadAgentData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pendingServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active service requests</p>
                    <p className="text-sm">New assignments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">Service #{service.id}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <User className="w-3 h-3" />
                              {service.userName}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Wrench className="w-3 h-3" />
                              {service.serviceType}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {service.userAddress}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {service.userPhone}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge className={
                                service.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }>
                                {service.status}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Created: {service.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </div>
                              {service.estimatedPrice && (
                                <div className="text-xs text-gray-500">
                                  Est. Price: ₹{service.estimatedPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs sm:text-sm text-gray-600">
                          <strong>Description:</strong> {service.description}
                        </div>

                        <div className="flex gap-2">
                          {service.status === 'assigned' && (
                            <Button 
                              onClick={() => updateServiceStatus(service.id, 'in_progress')}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Service
                            </Button>
                          )}
                          
                          {service.status === 'in_progress' && (
                            <>
                              <Button 
                                onClick={() => updateServiceStatus(service.id, 'completed')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Complete Service
                              </Button>
                              <Button 
                                onClick={() => completeService(service.id, service.estimatedPrice || 1000)}
                                size="sm"
                                variant="outline"
                              >
                                Mark Complete & Pay
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Service History</CardTitle>
                  <Button onClick={loadAgentData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {completedServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No completed services yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">Service #{service.id}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <User className="w-3 h-3" />
                              {service.userName}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Wrench className="w-3 h-3" />
                              {service.serviceType}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {service.userAddress}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Completed: {service.completedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </div>
                              {service.finalPrice && (
                                <div className="text-xs text-green-600 font-medium">
                                  Final Price: ₹{service.finalPrice}
                                </div>
                              )}
                              {service.agentAmount && (
                                <div className="text-xs text-blue-600 font-medium">
                                  Your Earnings: ₹{service.agentAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs sm:text-sm text-gray-600">
                          <strong>Description:</strong> {service.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Location Update Alert */}
        <Alert className="mt-6">
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            <strong>Location Update:</strong> Keep your location updated to receive service requests 
            from customers in your area. Your service radius is 5km from your current location.
          </AlertDescription>
        </Alert>
      </div>
      <Footer />
    </div>
  );
};

export default AgentDashboard;