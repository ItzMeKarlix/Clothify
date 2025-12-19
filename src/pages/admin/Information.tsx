import React from 'react';
import { Info } from 'lucide-react';

const Information: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Info className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">System Information</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">Access system information, documentation, and helpful resources.</p>

        {/* System Info */}
        <h2 className="text-2xl font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h3 className="font-semibold">Version</h3>
            <p className="text-gray-600">Clothify v1.0.0</p>
          </div>
          <div>
            <h3 className="font-semibold">Last Updated</h3>
            <p className="text-gray-600">December 19, 2025</p>
          </div>
          <div>
            <h3 className="font-semibold">Environment</h3>
            <p className="text-gray-600">Production</p>
          </div>
          <div>
            <h3 className="font-semibold">Database</h3>
            <p className="text-gray-600">Supabase</p>
          </div>
        </div>

        {/* Documentation */}
        <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
        <div className="space-y-2 mb-8">
          <a href="#" className="block text-blue-600 hover:underline">User Guide</a>
          <a href="#" className="block text-blue-600 hover:underline">API Documentation</a>
          <a href="#" className="block text-blue-600 hover:underline">Troubleshooting Guide</a>
          <a href="#" className="block text-blue-600 hover:underline">FAQ</a>
        </div>

        {/* Support */}
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <div className="space-y-2">
          <p className="text-gray-600">Need help? Contact our support team:</p>
          <p className="text-gray-600">Email: support@clothify.com</p>
          <p className="text-gray-600">Phone: 1-800-CLOTHIFY</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Information;