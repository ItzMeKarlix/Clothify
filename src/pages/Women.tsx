import React, { useEffect, useState } from "react";
import { productService } from "../api/api";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/database";

const Women: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWomenProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getByGender("female");
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchWomenProducts();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-600 font-light text-sm">Loading products...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-red-500 font-light text-sm">{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-black mb-2 tracking-wide">WOMEN'S COLLECTION</h1>
        <p className="text-gray-500 font-light text-sm">Discover our latest women's fashion</p>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 font-light">No products available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
};

export default Women;
