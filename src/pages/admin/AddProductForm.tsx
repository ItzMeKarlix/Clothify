import React, { useState, FormEvent, ChangeEvent } from "react";
import { nanoid } from "nanoid";
import { productService, storageService } from "../../api/api";
import type { Category } from "../../types/database";
import toast from "react-hot-toast";

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

export default AddProductForm;