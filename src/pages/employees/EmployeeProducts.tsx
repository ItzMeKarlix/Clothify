import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../api/api";
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";

const EmployeeProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">Manage and edit product information.</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Products
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex gap-4 items-center border p-4 rounded-lg">
                <div>{product.image && <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded" />}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-sm text-gray-600">${product.price}</p>
                  <p className="text-sm text-gray-500">{categories.find((c) => c.id === product.category_id)?.name || "No category"}</p>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </div>
                <EditProductForm product={product} refreshProducts={fetchProducts} categories={categories} />
                {/* Employees cannot delete products */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProducts;