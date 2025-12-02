import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { Search20Regular } from "@fluentui/react-icons";

const Header: React.FC = () => {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };
  
  return (
  <header className={`bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
    isVisible ? 'translate-y-0' : '-translate-y-full'
  }`}>
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-light text-black tracking-wider">
            CLOTHIFY
          </Link>

          {/* Search Icon with Expandable Input */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsSearchOpen(true)}
            onMouseLeave={() => {
              if (!searchQuery) setIsSearchOpen(false);
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center">
              {/* Search Icon */}
              <button
                type="button"
                className="text-gray-800 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search20Regular />
              </button>

              {/* Expandable Search Input */}
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`ml-2 px-3 py-1 text-sm text-black bg-white border border-gray-300 rounded focus:outline-none focus:border-black transition-all duration-300 ${
                  isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-transparent'
                }`}
                onFocus={() => setIsSearchOpen(true)}
              />
            </form>
          </div>
        </div>

        <nav className="flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Home
          </Link>
          <Link 
            to="/men" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Men
          </Link>
          <Link 
            to="/women" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Women
          </Link>
          <Link 
            to="/products" 
            className="text-gray-800 hover:text-black transition-colors font-light text-sm uppercase tracking-wide"
          >
            Collection
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
