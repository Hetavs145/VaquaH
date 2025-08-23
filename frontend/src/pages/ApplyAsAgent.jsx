import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  MapPin, 
  Wrench, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react';
import { agentService } from '@/services/agentService';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ApplyAsAgent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    services: [],
    experience: '',
    documents: {
      idProof: '',
      addressProof: '',
      experienceCertificate: ''
    }
  });

  const availableServices = [
    'AC Installation',
    'Regular Servicing',
    'Repair & Troubleshooting',
    'Annual Maintenance Contract',
    'Gas Refilling',
    'Relocation Service',
    'Extended Warranty',
    'Emergency Repairs'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        name: user.name || user.displayName || '',
        phone: user.phoneNumber || ''
      }));

      // Check if user already has an application
      checkApplicationStatus();
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    try {
      const status = await agentService.getAgentApplicationStatus(user.uid);
      setApplicationStatus(status);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleDocumentChange = (docType, value) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.services.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one service you can provide',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await agentService.applyAsAgent(formData);
      toast({
        title: 'Success',
        description: 'Agent application submitted successfully! We will review your application and get back to you soon.'
      });
      await checkApplicationStatus();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive'
      });
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
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <CardTitle>Login Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">
                You need to be logged in to apply as an agent.
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If user is already an agent
  if (user.role === 'agent') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <CardTitle>Already an Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">
                You are already registered as an agent.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If application is pending
  if (applicationStatus?.status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <CardTitle>Application Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">
                Your agent application is under review. We will notify you once it's processed.
              </p>
              <div className="text-sm text-gray-500 text-center">
                Applied on: {applicationStatus.appliedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // If application was rejected
  if (applicationStatus?.status === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container-custom py-8 flex-1">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <CardTitle>Application Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-4">
                Your previous application was not approved.
              </p>
              {applicationStatus.notes && (
                <p className="text-center text-sm text-gray-500 mb-4">
                  Reason: {applicationStatus.notes}
                </p>
              )}
              <Button 
                onClick={() => setApplicationStatus(null)} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Apply Again
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Apply as an Agent</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our network of professional AC service technicians. Earn money by providing 
              quality services to customers in your area.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Flexible Work</h3>
                <p className="text-sm text-gray-600">Choose your own hours and service area</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Good Earnings</h3>
                <p className="text-sm text-gray-600">Earn 85% of service charges</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-sm text-gray-600">Get training and technical support</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Agent Application Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      required
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <Label>Services You Can Provide *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {availableServices.map(service => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={formData.services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <Label htmlFor={service} className="text-sm">{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <Label htmlFor="experience">Experience *</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    required
                    placeholder="Describe your experience in AC servicing, certifications, etc."
                    rows={4}
                  />
                </div>

                {/* Documents */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Information
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="idProof">ID Proof Number</Label>
                      <Input
                        id="idProof"
                        value={formData.documents.idProof}
                        onChange={(e) => handleDocumentChange('idProof', e.target.value)}
                        placeholder="Aadhar/PAN number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressProof">Address Proof</Label>
                      <Input
                        id="addressProof"
                        value={formData.documents.addressProof}
                        onChange={(e) => handleDocumentChange('addressProof', e.target.value)}
                        placeholder="Utility bill, rental agreement"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experienceCertificate">Experience Certificate</Label>
                      <Input
                        id="experienceCertificate"
                        value={formData.documents.experienceCertificate}
                        onChange={(e) => handleDocumentChange('experienceCertificate', e.target.value)}
                        placeholder="Previous employer certificate"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Your application will be reviewed by our admin team. 
              You will be notified via email once your application is processed. 
              This usually takes 2-3 business days.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplyAsAgent;