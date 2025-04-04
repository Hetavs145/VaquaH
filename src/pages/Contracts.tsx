
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Contracts = () => {
  const { toast } = useToast();
  
  const contractTypes = [
    {
      id: 1,
      title: 'Standard Installation Contract',
      description: 'Basic contract covering the installation of split AC units, warranty terms, and service standards.',
      icon: <FileText size={40} className="text-vaquah-blue" />,
    },
    {
      id: 2,
      title: 'Annual Maintenance Contract (AMC)',
      description: 'Comprehensive yearly maintenance plan with regular servicing, priority support, and discounted repairs.',
      icon: <FileText size={40} className="text-vaquah-blue" />,
    },
    {
      id: 3,
      title: 'Extended Warranty Agreement',
      description: 'Extends manufacturer warranty with additional coverage for parts and service beyond the standard period.',
      icon: <FileText size={40} className="text-vaquah-blue" />,
    }
  ];
  
  const handleGetQuote = (contractType) => {
    // Create mailto link with pre-filled subject
    const subject = `Quote Request for ${contractType.title}`;
    const body = `Hello VaquaH Team,\n\nI'm interested in getting a quote for your ${contractType.title}.\n\nPlease send me more information.\n\nRegards,\n[Your Name]`;
    
    window.location.href = `mailto:vaquah.contact@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Email client opened",
      description: "Your default email client has been opened with a pre-filled message.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-vaquah-light-blue py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Service Contracts</h1>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              Our transparent and customer-friendly contracts ensure peace of mind with your AC installation and maintenance.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contractTypes.map((contract) => (
                <div 
                  key={contract.id} 
                  className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-5">{contract.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{contract.title}</h3>
                  <p className="text-gray-600 mb-4">{contract.description}</p>
                  <Button 
                    className="bg-vaquah-blue hover:bg-vaquah-dark-blue w-full mb-3"
                    onClick={() => handleGetQuote(contract)}
                  >
                    <Mail size={16} className="mr-2" />
                    Get Quote
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Need a Custom Contract?</h2>
              <p className="mb-6">
                We understand that each customer's needs may be different. Contact our contract specialists 
                to discuss custom terms tailored to your specific requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-vaquah-blue hover:bg-vaquah-dark-blue"
                  onClick={() => {
                    window.location.href = "mailto:vaquah.contact@gmail.com";
                  }}
                >
                  <Mail size={16} className="mr-2" />
                  Email Us
                </Button>
                <Link to="/appointments/new">
                  <Button variant="outline">Schedule a Consultation</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">What is covered under the Annual Maintenance Contract?</h3>
                <p className="text-gray-600">
                  Our AMC includes bi-annual servicing, unlimited emergency support calls, priority scheduling, 
                  free labor for repairs, and discounted parts replacement throughout the contract period.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Can I cancel a contract after signing?</h3>
                <p className="text-gray-600">
                  Yes, most contracts can be canceled with 30 days' notice. Refunds are prorated based on the 
                  services already provided. Some restrictions may apply to promotional contracts.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">How is payment handled for the contracts?</h3>
                <p className="text-gray-600">
                  Contracts can be paid in full or through our flexible monthly installment plans. We accept 
                  all major payment methods, including UPI, credit/debit cards and bank transfers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contracts;
