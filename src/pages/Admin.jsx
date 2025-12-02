import React, { useState, useEffect } from "react";
import API from "../api/api";

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
    const res = await API.get("/products");
    setProducts(res.data);
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await API.delete(`/products/${id}`, {
      headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
    });
    fetchProducts();
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
                onClick={() => handleDelete(p.id)}
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    if (image) formData.append("image", image);

    try {
      await API.post("/products", formData, {
        headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
      });
      setMessage("Product added!");
      setTitle(""); setDescription(""); setPrice(""); setImage(null);
      refreshProducts();
    } catch {
      setMessage("Error adding product");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      {message && <p className="text-green-600">{message}</p>}
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="border p-2 rounded" />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required className="border p-2 rounded" />
      <input type="file" onChange={e => setImage(e.target.files[0])} className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-2">Add Product</button>
    </form>
  );
};

const EditProductForm = ({ product, refreshProducts }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [image, setImage] = useState(null);

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    if (image) formData.append("image", image);

    await API.put(`/products/${product.id}`, formData, {
      headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN },
    });
    setEditing(false);
    refreshProducts();
  };

  if (!editing) {
    return <button onClick={() => setEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>;
  }

  return (
    <form onSubmit={handleEdit} className="flex flex-col gap-1">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="border p-1 rounded" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-1 rounded" />
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="border p-1 rounded" />
      <input type="file" onChange={e => setImage(e.target.files[0])} className="border p-1 rounded" />
      <div className="flex gap-1 mt-1">
        <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
        <button type="button" onClick={() => setEditing(false)} className="bg-gray-600 text-white px-2 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
};
