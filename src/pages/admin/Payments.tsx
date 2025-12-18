import React from 'react';

const Payments: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">This is where you will manage your payments and view transaction history.</p>
        {/* Placeholder for payments table */}
        <div className="mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Transaction ID</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">txn_12345</td>
                <td className="p-3">2023-10-27</td>
                <td className="p-3">John Doe</td>
                <td className="p-3">$45.00</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
