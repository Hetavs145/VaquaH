import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-vaquah-blue text-white py-20 animate-fade-in">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Privacy Policy</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Last updated: January 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12 flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-vaquah-blue" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              VaquaH ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or engage with our AC services and products.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-vaquah-blue" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through Razorpay)</li>
                  <li>Service appointment details and preferences</li>
                  <li>AC specifications and installation requirements</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-vaquah-blue" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Process and fulfill your orders for AC products and services</li>
              <li>Schedule and manage service appointments</li>
              <li>Provide customer support and technical assistance</li>
              <li>Send order confirmations, updates, and service reminders</li>
              <li>Improve our website, products, and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-vaquah-blue" />
              Information Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With trusted partners who assist in operating our website, processing payments, and delivering services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-vaquah-blue" />
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection practices</li>
              <li>Secure payment processing through Razorpay</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Object to processing of your personal information</li>
              <li>Request data portability</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-vaquah-blue" />
                <span><strong>Email:</strong> <a href="mailto:contact@vaquah.in" className="text-vaquah-blue hover:underline">contact@vaquah.in</a></span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-vaquah-blue" />
                <span><strong>Phone:</strong> +91 9999999999</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock size={18} className="text-vaquah-blue" />
                <span><strong>Hours:</strong> Mon-Sat: 10AM - 7PM IST</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin size={18} className="text-vaquah-blue mt-1" />
                <span><strong>Address:</strong> Vadodara Gujarat -390023, India</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div >
  );
};

export default PrivacyPolicy;