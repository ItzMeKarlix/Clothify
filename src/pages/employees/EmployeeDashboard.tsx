import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../api/api";
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";
import toast from "react-hot-toast";

const EmployeeDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    const data = await productService.getAll();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-4xl mb-8">Employee Dashboard</h1>
      
      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="flex gap-4 items-center border p-4">
            <div>{p.image && <img src={p.image} alt={p.title} className="w-20 h-20 object-cover" />}</div>
            <div className="flex-1">
              <h3>{p.title}</h3>
              <p>${p.price}</p>
              <p>{categories.find((c) => c.id === p.category_id)?.name || "No category"}</p>
              <p>{p.description}</p>
            </div>
            <EditProductForm product={p} refreshProducts={fetchProducts} categories={categories} />
            {/* Employees cannot delete products */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;