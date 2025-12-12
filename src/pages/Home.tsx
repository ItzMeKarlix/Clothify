import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { productService } from "../api/api";
import type { Product } from "../types/database";
import HeroImg from "../assets/HeroImg.png";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                OUR LATEST<br />OFFERINGS
              </h1>
              <p className="text-gray-600 font-light text-sm lg:text-base max-w-md mb-8">
                Discover our latest offerings, featuring cutting-edge designs and premium quality
              </p>
              <Link to="/products">
                <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm uppercase tracking-wide font-light transition-colors">
                  Shop Now
                </button>
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-1/2">
              <div className="transform rotate-3 lg:rotate-6">
                <img 
                  src={HeroImg} 
                  alt="Featured product" 
                  className="w-full h-[400px] lg:h-[600px] object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-light text-black mb-2 tracking-wide">OUR COLLECTION</h2>
          <p className="text-gray-500 font-light text-sm">Discover our latest arrivals</p>
        </div>
        
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600 font-light">No products available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
