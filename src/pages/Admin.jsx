import React, { useState, useEffect } from "react";
import { productService, storageService } from "../api/api";
import { nanoid } from "nanoid";

const Admin = () => {
  const [authorized, setAuthorized] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // Login check
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken === import.meta.env.VITE_ADMIN_TOKEN) {
      setAuthorized(true);
    }
  }, []);

  // Fetch products
  useEffect(() => {
    if (authorized) fetchProducts();
  }, [authorized]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (tokenInput === import.meta.env.VITE_ADMIN_TOKEN) {
      localStorage.setItem("adminToken", tokenInput);
      setAuthorized(true);
    } else {
      setMessage("Invalid token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAuthorized(false);
    setTokenInput("");
  };

  const handleDelete = async (id, imageUrl) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      // Delete image from storage if exists
      if (imageUrl) {
        await storageService.deleteImage(imageUrl);
      }
      // Delete product from database
      await productService.delete(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  if (!authorized)
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        {message && <p className="mb-2 text-red-600">{message}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="Enter admin token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-2">
            Login
          </button>
        </form>
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded mb-4"
      >
        Logout
      </button>

      <h2 className="text-xl font-bold mb-2">Add Product</h2>
      <AddProductForm refreshProducts={fetchProducts} />

      <h2 className="text-xl font-bold mt-6 mb-2">Existing Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-2 rounded shadow relative">
            {p.image && (
              <img src={p.image} alt={p.title} className="w-full h-32 object-cover mb-2 rounded" />
            )}
            <h3 className="font-bold">{p.title}</h3>
            <p>${p.price}</p>
            <div className="flex justify-between mt-2">
              <EditProductForm product={p} refreshProducts={fetchProducts} />
              <button
                onClick={() => handleDelete(p.id, p.image)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;

// ---------------- AddProductForm & EditProductForm ----------------
const AddProductForm = ({ refreshProducts }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = null;
      
      // Upload image to Supabase Storage if provided
      if (image) {
        imageUrl = await storageService.uploadImage(image);
      }

      // Create product in database
      await productService.create({
        id: nanoid(10),
        title,
        description,
        price: parseFloat(price),
        image: imageUrl,
      });

      setMessage("Product added!");
      setTitle(""); 
      setDescription(""); 
      setPrice(""); 
      setImage(null);
      refreshProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Error adding product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      {message && <p className="text-green-600">{message}</p>}
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="border p-2 rounded" />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
      <input type="number" step="0.01" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required className="border p-2 rounded" />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="border p-2 rounded" />
      <button type="submit" disabled={uploading} className="bg-blue-600 text-white p-2 rounded mt-2 disabled:bg-gray-400">
        {uploading ? "Uploading..." : "Add Product"}
      </button>
    </form>
  );
};

const EditProductForm = ({ product, refreshProducts }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const updates = {
        title,
        description,
        price: parseFloat(price),
      };

      // Upload new image if provided
      if (image) {
        // Delete old image if exists
        if (product.image) {
          await storageService.deleteImage(product.image);
        }
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
    return <button onClick={() => setEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>;
  }

  return (
    <form onSubmit={handleEdit} className="flex flex-col gap-1">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="border p-1 rounded" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-1 rounded" />
      <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="border p-1 rounded" />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="border p-1 rounded" />
      <div className="flex gap-1 mt-1">
        <button type="submit" disabled={uploading} className="bg-green-600 text-white px-2 py-1 rounded disabled:bg-gray-400">
          {uploading ? "..." : "Save"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="bg-gray-600 text-white px-2 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};
