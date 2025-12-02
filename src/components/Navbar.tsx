import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => (
  <nav className="bg-blue-600 p-4 text-white flex justify-between">
    <Link to="/" className="font-bold text-xl">Clothing Store</Link>
    <div className="space-x-4">
      <Link to="/">Products</Link>
      <Link to="/cart">Cart</Link>
    </div>
  </nav>
);

export default Navbar;
