import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Construct mailto link
    const subject = `Contact Form Submission from ${formData.name}`;
    const body = `${formData.message}\n\n${formData.name}`;
    const mailtoLink = `mailto:contact@vaquah.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mail client
    window.location.href = mailtoLink;

    toast({
      title: "Redirecting to Email",
      description: "Opening your email client to send the message.",
    });

    setFormData({ name: '', email: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Get in Touch</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Fill up the form and our Team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 card-hover">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-vaquah-blue">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <p className="text-gray-600">+91 9999999999 <span className="text-xs text-red-500 block sm:inline">(This number is not an actual number please do not call)</span></p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 card-hover">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-vaquah-blue">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">contact@vaquah.in</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 card-hover">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-vaquah-blue">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Location</h3>
                      <p className="text-gray-600">Vadodara Gujarat -390023, India</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Your Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you?"
                        rows={5}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-vaquah-blue hover:bg-vaquah-dark-blue text-white py-6 text-lg transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : (
                        <span className="flex items-center justify-center gap-2">
                          Send Message <Send size={18} />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
