import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService, storageService, categoryService, authService, userService } from "../../api/api";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area"

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth and role from user_roles table
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (!session || !session.user?.id) {
          navigate("/login");
          return;
        }

        // Fetch role directly from user_roles
        const role = await userService.getUserRole(session.user.id);
        if (role !== "admin") {
          navigate("/login");
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch products and categories once authorized
  useEffect(() => {
    if (authorized) {
      fetchProducts();
      fetchCategories();
    }
  }, [authorized]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      if (imageUrl) await storageService.deleteImage(imageUrl);
      await productService.delete(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 font-light text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl text-black tracking-wide">ADMIN DASHBOARD</h1>
        <button
          onClick={handleLogout}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 text-xs uppercase tracking-wide transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left column: Add Product Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-sm text-black mb-6 uppercase tracking-wide">Add Product</h2>
          <AddProductForm refreshProducts={fetchProducts} categories={categories} />
        </div>

        {/* Right column: Existing Products */}
        <div>
          <h2 className="text-sm text-black mb-6 uppercase tracking-wide">Existing Products</h2>
          <ScrollArea className="h-[600px] overflow-y-auto rounded-xl border border-gray-200">
            <div className="space-y-4 p-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow">
                  <div className="flex gap-4">
                    {p.image && (
                      <div className="w-20 h-20 bg-gray-50 shrink-0 rounded">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-black text-sm">{p.title}</h3>
                      <p className="text-gray-600 text-xs mt-1">${p.price}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {categories.find((c) => c.id === p.category_id)?.name || "No category"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{p.description}</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <EditProductForm product={p} refreshProducts={fetchProducts} categories={categories} />
                      <button
                        onClick={() => handleDelete(p.id, p.image)}
                        className="text-gray-400 hover:text-black text-xs uppercase tracking-wide transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Admin;