import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Header: React.FC = () => {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return (
  <header className={`bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
    isVisible ? 'translate-y-0' : '-translate-y-full'
  }`}>
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
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide relative"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-xs font-normal rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </div>
  </header>
  );
};

export default Header;
