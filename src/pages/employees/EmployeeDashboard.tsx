import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService, categoryService, authService, userService } from "../../api/api"; // userService added
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";
import toast from "react-hot-toast";

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to logout");
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (!session?.user?.id) {
          navigate("/login");
          return;
        }

        // ✅ Fetch role from user_roles table
        const role = await userService.getUserRole(session.user.id);
        if (role !== "employee") {
          navigate("/login");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (authorized) {
      fetchProducts();
      fetchCategories();
    }
  }, [authorized]);

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
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-4xl mb-8">Employee Dashboard 
        <button
          onClick={handleLogout}
          className="bg-black mx-[120em] hover:bg-gray-800 text-white px-6 py-2 text-xs uppercase tracking-wide transition-colors"
        >
          Logout
        </button>
      </h1>
      
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