import React, { useState, FormEvent, ChangeEvent } from "react";
import { productService, storageService } from "../../api/api";
import type { Product, Category } from "../../types/database";

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
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        alert("Invalid price");
        return;
      }

      const updates: {
        title: string;
        description: string;
        price: number;
        category_id: string | null;
        image?: string;
      } = {
        title,
        description,
        price: parsedPrice,
        category_id: categoryId === "" ? null : categoryId,
      };

      if (image) {
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
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 uppercase tracking-wide">Description</label>
          <textarea
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-black text-sm file:mr-4 file:py-1 file:px-4 file:border-0 file:text-xs file:bg-gray-100 file:text-black hover:file:bg-gray-200"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors"
          >
            {uploading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-black px-6 py-3 text-sm uppercase tracking-wide transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;