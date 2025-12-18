import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Users, Package, CreditCard } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <p className="text-gray-600">Manage products</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/inventory" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Inventory</h2>
              <p className="text-gray-600">Track stock levels</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/customers" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Customers</h2>
              <p className="text-gray-600">View customer data</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/payments" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Payments</h2>
              <p className="text-gray-600">Manage transactions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
