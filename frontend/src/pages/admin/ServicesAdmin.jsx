import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Wrench, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';
import { agentService } from '@/services/agentService';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ServicesAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('agents');
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState(null);
  
  // Data states
  const [agents, setAgents] = useState([]);
  const [agentApplications, setAgentApplications] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  
  // Filter states
  const [agentFilter, setAgentFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const status = await adminService.checkAdminStatus(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        await loadAllData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // First check if collections exist and have data
      const collectionsStatus = await adminService.checkCollectionsStatus();
      console.log('Collections status:', collectionsStatus);
      
      // If any collection doesn't exist or has no data, initialize them
      const needsInitialization = Object.values(collectionsStatus).some(
        status => !status.exists || !status.hasData
      );
      
      if (needsInitialization) {
        try {
          toast({
            title: 'Initializing Collections',
            description: 'Setting up required collections for admin services...',
          });
          
          await adminService.initializeAdminCollections();
          
          toast({
            title: 'Collections Initialized',
            description: 'Admin collections have been set up successfully!',
          });
        } catch (error) {
          // Log error for debugging but don't expose to user
          console.warn('Error initializing collections:', error.message);
          toast({
            title: 'Initialization Error',
            description: 'Failed to initialize collections. Please check your permissions and try again.',
            variant: 'destructive'
          });
        }
      }
      
      // Load data with individual error handling
      let agentsData = [];
      let applicationsData = [];
      let requestsData = [];
      
      try {
        agentsData = await agentService.getAllAgents();
      } catch (error) {
        // Log error for debugging but don't expose to user
        console.warn('Error loading agents:', error.message);
        if (error.code === 'permission-denied') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to view agents. Please contact an administrator.',
            variant: 'destructive'
          });
        }
      }
      
      try {
        applicationsData = await agentService.getAllAgentApplications();
      } catch (error) {
        // Log error for debugging but don't expose to user
        console.warn('Error loading agent applications:', error.message);
        if (error.code === 'permission-denied') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to view agent applications. Please contact an administrator.',
            variant: 'destructive'
          });
        }
      }
      
      try {
        requestsData = await agentService.getAllServiceRequests();
      } catch (error) {
        // Log error for debugging but don't expose to user
        console.warn('Error loading service requests:', error.message);
        if (error.code === 'permission-denied') {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to view service requests. Please contact an administrator.',
            variant: 'destructive'
          });
        }
      }
      
      setAgents(agentsData);
      setAgentApplications(applicationsData);
      setServiceRequests(requestsData);
      
      // Show success message if any data was loaded
      if (agentsData.length > 0 || applicationsData.length > 0 || requestsData.length > 0) {
        toast({
          title: 'Data Loaded',
          description: `Loaded ${agentsData.length} agents, ${applicationsData.length} applications, ${requestsData.length} requests`,
        });
      }
    } catch (error) {
      // Log error for debugging but don't expose to user
      console.warn('Error loading data:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAgent = async (applicationId) => {
    try {
      await agentService.approveAgentApplication(applicationId, user.uid);
      toast({
        title: 'Success',
        description: 'Agent application approved successfully'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error approving agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve agent application',
        variant: 'destructive'
      });
    }
  };

  const handleRejectAgent = async (applicationId, reason) => {
    try {
      await agentService.rejectAgentApplication(applicationId, reason, user.uid);
      toast({
        title: 'Success',
        description: 'Agent application rejected successfully'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error rejecting agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject agent application',
        variant: 'destructive'
      });
    }
  };

  const handleAssignAgent = async (serviceId, agentId) => {
    try {
      await agentService.assignAgentToService(serviceId, agentId, user.uid);
      toast({
        title: 'Success',
        description: 'Agent assigned successfully'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign agent',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteService = async (serviceId, finalPrice, paymentMethod) => {
    try {
      const result = await agentService.completeService(serviceId, finalPrice, paymentMethod);
      toast({
        title: 'Success',
        description: `Service completed. Admin cut: ₹${result.adminAmount.toFixed(2)}, Agent cut: ₹${result.agentAmount.toFixed(2)}`
      });
      await loadAllData();
    } catch (error) {
      console.error('Error completing service:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete service',
        variant: 'destructive'
      });
    }
  };

  // Filter functions
  const filteredAgents = agents.filter(agent => {
    const matchesFilter = agentFilter === 'all' || agent.status === agentFilter;
    const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredApplications = agentApplications.filter(app => {
    const matchesFilter = applicationFilter === 'all' || app.status === applicationFilter;
    const matchesSearch = app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredServices = serviceRequests.filter(service => {
    const matchesFilter = serviceFilter === 'all' || service.status === serviceFilter;
    const matchesSearch = service.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

        {/* Stats Overview */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dashboard Overview</h2>
            <div className="flex gap-2">
              <Button onClick={loadAllData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              {(agents.length === 0 && agentApplications.length === 0 && serviceRequests.length === 0) && (
                <Button 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await adminService.initializeAdminCollections();
                      toast({
                        title: 'Success',
                        description: 'Collections initialized successfully! Refreshing data...',
                      });
                      await loadAllData();
                    } catch (error) {
                      console.error('Error initializing collections:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to initialize collections. Please try again.',
                        variant: 'destructive'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Initialize Collections
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{agents.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Pending Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {agentApplications.filter(app => app.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Services</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {serviceRequests.filter(service => ['pending', 'assigned', 'in_progress'].includes(service.status)).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Completed Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {serviceRequests.filter(service => service.status === 'completed').length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>



        {/* Search and Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, city..."
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Agent Status</label>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All agents</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Application Status</label>
                <Select value={applicationFilter} onValueChange={setApplicationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All applications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Status</label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agents ({filteredAgents.length})</TabsTrigger>
            <TabsTrigger value="applications">Applications ({filteredApplications.length})</TabsTrigger>
            <TabsTrigger value="services">Services ({filteredServices.length})</TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Registered Agents</CardTitle>
                  <Button onClick={loadAllData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No agents found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredAgents.map((agent) => (
                      <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{agent.name}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {agent.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {agent.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {agent.city}, {agent.state}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {agent.status}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Rating: {agent.rating || 0}/5
                              </div>
                              <div className="text-xs text-gray-500">
                                Services: {agent.totalServices || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                Earnings: ₹{agent.totalEarnings || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {agent.services?.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Agent Applications</CardTitle>
                  <Button onClick={loadAllData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No applications found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{application.name}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {application.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {application.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {application.city}, {application.state}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-2">
                              <strong>Experience:</strong> {application.experience}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge className={
                                application.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {application.status}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                Applied: {application.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {application.services?.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>

                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleApproveAgent(application.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleRejectAgent(application.id, 'Application rejected')}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Service Requests</CardTitle>
                  <Button onClick={loadAllData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No service requests found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">Service #{service.id}</h3>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Users className="w-3 h-3" />
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
                            {service.assignedAgent && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                                <UserCheck className="w-3 h-3" />
                                Assigned to: {service.assignedAgent}
                              </div>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <Badge className={
                                service.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                service.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                service.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
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
                              {service.finalPrice && (
                                <div className="text-xs text-green-600 font-medium">
                                  Final Price: ₹{service.finalPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs sm:text-sm text-gray-600">
                          <strong>Description:</strong> {service.description}
                        </div>

                        {service.status === 'pending' && (
                          <div className="flex gap-2">
                            <Select onValueChange={(agentId) => handleAssignAgent(service.id, agentId)}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Assign agent..." />
                              </SelectTrigger>
                              <SelectContent>
                                {agents.filter(agent => agent.status === 'active').map(agent => (
                                  <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name} - {agent.city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {service.status === 'assigned' && (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleCompleteService(service.id, service.estimatedPrice || 1000, 'cash')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesAdmin;