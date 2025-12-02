import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-100 mt-auto">
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-light text-black mb-3 tracking-wider">CLOTHIFY</h3>
          <p className="text-gray-600 text-sm font-light">Your destination for quality clothing</p>
        </div>
        <div className="flex space-x-12">
          <div>
            <h4 className="text-black font-light mb-3 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-light">
              <li><Link to="/" className="hover:text-black transition-colors">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-black font-light mb-3 text-sm uppercase tracking-wide">Help</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-light">
              <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
              <li><Link to="/admin" className="hover:text-black transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 mt-8 pt-8 text-center">
        <p className="text-gray-500 text-sm font-light">
          © 2024 CLOTHIFY. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
