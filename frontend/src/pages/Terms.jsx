import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CreditCard, Truck, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to VaquaH. These Terms of Service ("Terms") govern your use of our website, mobile application, and services related to AC products and cooling solutions. By accessing or using our services, you agree to be bound by these Terms.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
              <div className="space-y-3">
                <p className="text-gray-700"><strong>"Service"</strong> refers to our website, mobile application, and AC-related services.</p>
                <p className="text-gray-700"><strong>"User," "you," and "your"</strong> refers to you as the user of the Service.</p>
                <p className="text-gray-700"><strong>"Company," "we," "us," and "our"</strong> refers to VaquaH.</p>
                <p className="text-gray-700"><strong>"Content"</strong> refers to text, images, videos, and other materials on our Service.</p>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  To access certain features of our Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            {/* Products and Services */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="w-6 h-6 mr-2 text-blue-600" />
                4. Products and Services
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We offer AC products and services including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Split AC units and accessories</li>
                  <li>Installation and maintenance services</li>
                  <li>Repair and troubleshooting services</li>
                  <li>Warranty and extended protection plans</li>
                  <li>Technical support and consultation</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-blue-800">
                    <strong>Note:</strong> Product availability and pricing are subject to change without notice. All specifications and features are subject to manufacturer guidelines.
                  </p>
                </div>
              </div>
            </section>

            {/* Ordering and Payment */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                5. Ordering and Payment
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  When placing orders through our Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                  <li>Payment is processed securely through Razorpay</li>
                  <li>Orders are confirmed upon successful payment</li>
                  <li>We reserve the right to refuse or cancel orders</li>
                  <li>Taxes and shipping charges apply as applicable</li>
                </ul>
              </div>
            </section>

            {/* Delivery and Installation */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-blue-600" />
                6. Delivery and Installation
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Delivery and installation terms:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Delivery timelines are estimates and may vary</li>
                  <li>Installation requires proper site preparation by customer</li>
                  <li>Additional charges may apply for complex installations</li>
                  <li>Installation is subject to site feasibility assessment</li>
                  <li>Customer must be present during delivery and installation</li>
                </ul>
              </div>
            </section>

            {/* Warranty and Returns */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                7. Warranty and Returns
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Warranty and return policies:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Products come with manufacturer warranty</li>
                  <li>Extended warranty options available for purchase</li>
                  <li>Returns accepted within 7 days of delivery (unused products)</li>
                  <li>Installation charges are non-refundable</li>
                  <li>Warranty claims must be reported within warranty period</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                8. Prohibited Uses
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use our Service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our Service</li>
                <li>Use automated systems to access our Service</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on our Service, including text, graphics, logos, and software, is owned by VaquaH or our licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            {/* Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our Service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, VaquaH shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our Service.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless VaquaH and its officers, directors, employees, and agents from any claims, damages, or expenses arising out of your use of our Service or violation of these Terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to our Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of our Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms, please contact us at <a href="mailto:contact@vaquah.in" className="text-vaquah-blue hover:underline">contact@vaquah.in</a>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700"><strong>Phone:</strong> +91 98765 43210</p>
                <p className="text-gray-700"><strong>Address:</strong> 123 Cooling Street, Mumbai, Maharashtra - 400001, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;