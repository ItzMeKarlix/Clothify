import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-100 mt-auto">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Clothify Logo" className="h-8 w-8" />
            <h3 className="text-lg font-light text-black tracking-wider">CLOTHIFY</h3>
          </div>
          <p className="text-gray-600 text-sm font-light">Your destination for quality clothing and accessories</p>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-black font-light mb-4 text-sm uppercase tracking-wide">Shop</h4>
          <ul className="space-y-3 text-sm text-gray-600 font-light">
            <li><Link to="/products" className="hover:text-black transition-colors">All Products</Link></li>
            <li><Link to="/men" className="hover:text-black transition-colors">Men</Link></li>
            <li><Link to="/women" className="hover:text-black transition-colors">Women</Link></li>
            <li><Link to="/accessories" className="hover:text-black transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-black font-light mb-4 text-sm uppercase tracking-wide">Support</h4>
          <ul className="space-y-3 text-sm text-gray-600 font-light">
            <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Returns</a></li>
          </ul>
        </div>

        {/* Account Links */}
        <div>
          <h4 className="text-black font-light mb-4 text-sm uppercase tracking-wide">Account</h4>
          <ul className="space-y-3 text-sm text-gray-600 font-light">
            <li><Link to="/login" className="hover:text-black transition-colors">Seller Login</Link></li>
            <li><Link to="/cart" className="hover:text-black transition-colors">My Cart</Link></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-8">
        <p className="text-gray-500 text-sm font-light text-center">
          © 2025 CLOTHIFY. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
