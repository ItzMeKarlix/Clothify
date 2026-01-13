import React, { useState, useEffect } from "react";
import { productService, storageService, categoryService } from "../../api/api";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";
import toast from "react-hot-toast";
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logger } from "@/utils/logger";

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      logger.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      logger.error("Error fetching categories:", err);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      if (imageUrl) await storageService.deleteImage(imageUrl);
      await productService.delete(id);
      toast.success("Product deleted successfully", { id: 'admin-product-deleted' });
      fetchProducts();
    } catch (err) {
      logger.error("Delete error:", err);
      toast.error("Failed to delete product", { id: 'admin-product-delete-failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Package className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Add Product Form */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add New Product
            </CardTitle>
            <CardDescription className="text-sm">Create a new product in your catalog</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <AddProductForm refreshProducts={fetchProducts} categories={categories} />
          </CardContent>
        </Card>

        {/* Existing Products */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              Existing Products
            </CardTitle>
            <CardDescription className="text-sm">Manage and edit your current products</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ScrollArea className="h-125 sm:h-150">
              <div className="space-y-3 sm:space-y-4">
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No products found</p>
                    <p className="text-sm">Add your first product to get started</p>
                  </div>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {p.image && (
                          <div className="shrink-0">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{p.title}</h3>
                          <p className="text-gray-600 text-sm sm:text-base font-medium">${p.price}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {categories.find((c) => c.id === p.category_id)?.name || "No category"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2">{p.description}</p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 items-start sm:items-end">
                          <EditProductForm product={p} refreshProducts={fetchProducts} categories={categories} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(p.id, p.image)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;