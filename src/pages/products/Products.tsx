import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../api/api";
import ProductCard from "../../components/ProductCard";
import ProductGridSkeleton from "../../components/ProductGridSkeleton";
import type { Product } from "../../types/database";
import { CATEGORIES } from "../../constants/categories";

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = selectedCategory === "All" 
          ? await productService.getAll()
          : await productService.getByCategory(selectedCategory);
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  if (loading) return (
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-black mb-2 tracking-wide">OUR COLLECTION</h1>
        <p className="text-gray-500 font-light text-sm">Loading products...</p>
      </div>
      <ProductGridSkeleton />
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-red-500 font-light text-sm">{error}</p>
    </div>
  );

  const displayProducts = searchQuery ? filteredProducts : products;

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-light text-black mb-2 tracking-wide">
          {searchQuery ? `SEARCH RESULTS FOR "${searchQuery}"` : "OUR COLLECTION"}
        </h1>
        <p className="text-gray-500 font-light text-sm">
          {searchQuery ? `${displayProducts.length} product(s) found` : "Discover our latest arrivals"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-6 py-2 text-xs uppercase tracking-wide transition-colors ${
            selectedCategory === "All"
              ? "bg-black text-white"
              : "bg-white text-black border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 text-xs uppercase tracking-wide transition-colors ${
              selectedCategory === category
                ? "bg-black text-white"
                : "bg-white text-black border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {displayProducts.length === 0 ? (
        <p className="text-center text-gray-600 font-light">
          {searchQuery ? "No products found matching your search" : "No products available"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
};

export default Products;
