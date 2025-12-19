import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import Carousel from "../components/Carousel";
import { productService } from "../api/api";
import type { Product } from "../types/database";

// Import banner images
import Banner1 from "../assets/Banner/Hero-Banner-1.png";
import Banner2 from "../assets/Banner/Hero-Banner-2.png";
import Banner3 from "../assets/Banner/Hero-Banner-3.png";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Banner images array
  const bannerImages = [Banner1, Banner2, Banner3];

  // Function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative pt-16 lg:pt-6">
        <Carousel
          images={bannerImages}
          autoPlay={true}
          autoPlayInterval={4000}
          className="w-full"
        />
      </section>

      {/* Best Sellers Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-light text-black mb-2 tracking-wide">BEST SELLERS</h2>
          <p className="text-gray-500 font-light text-sm">Our most popular items</p>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600 font-light">No products available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* Products Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-light text-black mb-2 tracking-wide">OUR CATALOG</h2>
          <p className="text-gray-500 font-light text-sm">Discover our latest arrivals</p>
        </div>
        
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600 font-light">No products available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {shuffleArray(products).slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm uppercase tracking-wide font-light transition-colors">
              View All
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
