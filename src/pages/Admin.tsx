import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { productService, storageService, categoryService, authService } from "../api/api";
import { nanoid } from "nanoid";
import type { Product, Category } from "../types/database";
import toast from "react-hot-toast";



const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setAuthorized(true);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch products
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
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      if (imageUrl) await storageService.deleteImage(imageUrl);
      await productService.delete(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
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
        <div>
          <h2 className="text-sm text-black mb-6 uppercase tracking-wide">Add Product</h2>
          <AddProductForm refreshProducts={fetchProducts} categories={categories} />

          <h2 className="text-sm text-black mt-8 mb-6 uppercase tracking-wide">Existing Products</h2>
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 p-4">
                <div className="flex gap-4">
                  {p.image && (
                    <div className="w-20 h-20 bg-gray-50 shrink-0">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-black text-sm">{p.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">${p.price}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {categories.find(c => c.id === p.category_id)?.name || 'No category'}
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
        </div>
      </div>
    </div>
  );
};

export default Admin;

// ---------------- AddProductForm ----------------
interface AddProductFormProps {
  refreshProducts: () => void;
  categories: Category[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({ refreshProducts, categories }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (uploading) return; // prevent double submit
    setUploading(true);

    try {
      let imageUrl: string | null = null;
      if (image) {
        imageUrl = await storageService.uploadImage(image);
      }

      await productService.create({
        id: nanoid(10),
        title,
        description,
        price: parseFloat(price),
        category_id: categoryId || null,
        image: imageUrl,
      });

      toast.success("Product added successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategoryId(categories[0]?.id || "");
      setImage(null);
      refreshProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Title</label>
        <input
          type="text"
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Description</label>
        <textarea
          placeholder="Product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Price</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full border border-gray-300 px-4 text-black placeholder:text-gray-400 py-3 focus:outline-none focus:border-black text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black text-sm file:mr-4 file:py-1 file:px-4 file:border-0 file:text-xs file:bg-gray-100 file:text-black hover:file:bg-gray-200"
        />
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="mt-2 w-32 h-32 object-cover border border-gray-300 rounded"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors"
      >
        {uploading ? "Uploading..." : "Add Product"}
      </button>
    </form>
  );
};

// ---------------- EditProductForm ----------------
interface EditProductFormProps {
  product: Product;
  refreshProducts: () => void;
  categories: Category[];
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, refreshProducts, categories }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(product.title);
  const [description, setDescription] = useState<string>(product.description || "");
  const [price, setPrice] = useState<string>(product.price.toString());
  const [categoryId, setCategoryId] = useState<string>(product.category_id || "");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const updates: { title: string; description: string; price: number; category_id: string; image?: string } = {
        title,
        description,
        price: parseFloat(price),
        category_id: categoryId,
      };

      if (image) {
        if (product.image) await storageService.deleteImage(product.image);
        updates.image = await storageService.uploadImage(image);
      }

      await productService.update(product.id, updates);
      setEditing(false);
      refreshProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setUploading(false);
    }
  };

  if (!editing) {
    return (
      <button 
        onClick={() => setEditing(true)} 
        className="text-gray-400 hover:text-black text-xs uppercase tracking-wide transition-colors"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleEdit} className="bg-white shadow-lg p-8 max-w-md w-full mx-4 space-y-4">
        <h3 className="text-xl text-black mb-6 tracking-wide uppercase">Edit Product</h3>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm resize-none" 
            rows={3}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Price</label>
          <input 
            type="number" 
            step="0.01" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">New Image (optional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null)} 
            className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black   text-sm file:mr-4 file:py-1 file:px-4 file:border-0 file:text-xs file:  file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={uploading} 
            className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide   transition-colors"
          >
            {uploading ? "Saving..." : "Save"}
          </button>
          <button 
            type="button" 
            onClick={() => setEditing(false)} 
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-black px-6 py-3 text-sm uppercase tracking-wide   transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};