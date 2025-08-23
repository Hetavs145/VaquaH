import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Simple button to fix collections - add this temporarily to your admin panel
const FixCollectionsButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fixCollections = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const functions = getFunctions();
      const fixServicesRoute = httpsCallable(functions, 'fixServicesRoute');
      const result = await fixServicesRoute({});

      setMessage(`✅ ${result.data.message}`);
      console.log('Collections created:', result.data.collectionsCreated);
      
      // Refresh the page after a short delay to see the changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error fixing collections:', error);
      setError(error.message || 'Failed to fix collections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        🔧 Fix Collections Issue
      </h3>
      <p className="text-yellow-700 mb-3 text-sm">
        Click this button to create the missing collections and fix your /admin/services route.
      </p>
      
      <button
        onClick={fixCollections}
        disabled={loading}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
      >
        {loading ? 'Fixing...' : 'Fix Collections Now'}
      </button>

      {message && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default FixCollectionsButton;