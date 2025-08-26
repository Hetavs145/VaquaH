import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching contracts
    setTimeout(() => {
      setContracts([
        {
          id: 1,
          contractNumber: 'CTR-2024-001',
          serviceType: 'AC Maintenance',
          startDate: '2024-01-15',
          endDate: '2024-12-15',
          status: 'Active',
          monthlyFee: 99.99,
          description: 'Annual AC maintenance and service contract'
        },
        {
          id: 2,
          contractNumber: 'CTR-2024-002',
          serviceType: 'Heating System',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          status: 'Active',
          monthlyFee: 149.99,
          description: 'Heating system maintenance and emergency service'
        },
        {
          id: 3,
          contractNumber: 'CTR-2023-003',
          serviceType: 'Plumbing',
          startDate: '2023-06-01',
          endDate: '2024-05-31',
          status: 'Expired',
          monthlyFee: 79.99,
          description: 'Plumbing maintenance and repair service'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Expired':
        return 'text-red-600 bg-red-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Loading contracts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Service Contracts</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              New Contract
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Contracts Found</h2>
              <p className="text-gray-600">You don't have any service contracts yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{contract.serviceType}</h3>
                      <p className="text-gray-600">Contract #{contract.contractNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-sm">{new Date(contract.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="text-sm">{new Date(contract.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Monthly Fee</label>
                      <p className="text-sm font-semibold">₹{contract.monthlyFee}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-sm">12 months</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{contract.description}</p>

                  <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                      Download
                    </button>
                    {contract.status === 'Active' && (
                      <button className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contract Benefits */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Priority Service</h3>
                <p className="text-sm text-gray-600">Get priority scheduling for all service calls</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Regular Maintenance</h3>
                <p className="text-sm text-gray-600">Scheduled maintenance to prevent breakdowns</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Cost Savings</h3>
                <p className="text-sm text-gray-600">Discounted rates on parts and labor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contracts; 