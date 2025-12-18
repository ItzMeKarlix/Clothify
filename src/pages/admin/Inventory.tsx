import React from 'react';

const Inventory: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">This is where you will manage your product inventory and stock levels.</p>
        {/* Placeholder for inventory management table */}
        <div className="mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">SKU</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">T-Shirt</td>
                <td className="p-3">TS-001</td>
                <td className="p-3">100</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">In Stock</span></td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Jeans</td>
                <td className="p-3">JN-001</td>
                <td className="p-3">0</td>
                <td className="p-3"><span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm">Out of Stock</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
