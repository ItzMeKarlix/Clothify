import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Navbar: React.FC = () => {
  const { cartItems } = useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-light tracking-widest text-black hover:text-gray-700 transition-colors">
            CLOTHIFY
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-sm uppercase tracking-wide text-black hover:text-gray-600 transition-colors font-light">
              Home
            </Link>
            <Link to="/men" className="text-sm uppercase tracking-wide text-black hover:text-gray-600 transition-colors font-light">
              Men
            </Link>
            <Link to="/women" className="text-sm uppercase tracking-wide text-black hover:text-gray-600 transition-colors font-light">
              Women
            </Link>
            <Link to="/products" className="text-sm uppercase tracking-wide text-black hover:text-gray-600 transition-colors font-light">
              Collection
            </Link>
            <Link to="/cart" className="relative text-sm uppercase tracking-wide text-black hover:text-gray-600 transition-colors font-light">
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-4 flex">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
