import React from 'react';

const Customers: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">This is where you will manage your customers, view their orders, and respond to support requests.</p>

        {/* Placeholder for customer list */}
        <h2 className="text-2xl font-semibold mb-4">Customer List</h2>
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Orders</th>
              <th className="text-left p-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">John Doe</td>
              <td className="p-3">john.doe@example.com</td>
              <td className="p-3">5</td>
              <td className="p-3">2023-10-26</td>
            </tr>
          </tbody>
        </table>

        {/* Placeholder for support tickets */}
        <h2 className="text-2xl font-semibold mb-4">Support Tickets</h2>
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Order #12345 - Return Request</h3>
            <p className="text-sm text-gray-600">From: Jane Smith (jane.smith@example.com)</p>
            <p className="mt-2">"I would like to return my t-shirt..."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
