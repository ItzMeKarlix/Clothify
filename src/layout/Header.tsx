import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => (
  <header className="bg-white shadow-sm border-b border-gray-100">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-2xl font-light text-black tracking-wider">
          CLOTHIFY
        </Link>
        <nav className="flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Shop
          </Link>
          <Link 
            to="/cart" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Cart
          </Link>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;
