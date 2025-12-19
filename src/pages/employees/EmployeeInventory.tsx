import React, { useState, useEffect } from 'react';
import { productService } from '../../api/api';
import type { Product } from '../../types/database';

const EmployeeInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { status: 'Out of Stock', className: 'px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm' };
    } else if (stock < 10) {
      return { status: 'Low Stock', className: 'px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm' };
    } else {
      return { status: 'In Stock', className: 'px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm' };
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">Monitor product stock levels and inventory status.</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Inventory
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600">No products found in inventory.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{product.sku || `PRD-${product.id}`}</td>
                      <td className="p-3 font-medium">{product.stock || 0}</td>
                      <td className="p-3">
                        <span className={stockStatus.className}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="p-3">${product.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Stock Status Legend:</h3>
          <div className="flex gap-4 text-sm">
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full">In Stock (10+)</span>
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">Low Stock (&lt;10)</span>
            <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full">Out of Stock (0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInventory;