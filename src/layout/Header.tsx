import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { sanitizeString } from "../utils/validation";
import { Search20Regular, ShoppingBag20Regular, BoxRegular } from "@fluentui/react-icons";
import logo from "../assets/logo.svg";

interface HeaderProps {
  isVisible: boolean;
}

const Header: React.FC<HeaderProps> = ({ isVisible }) => {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Overlay open state and mount control for animation
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isSearchOverlayMounted, setIsSearchOverlayMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Manage body scroll and focus when overlay is open (animated open/close)
  useEffect(() => {
    if (isSearchOverlayOpen) {
      document.body.style.overflow = "hidden";
      // focus after mounted
      setTimeout(() => searchInputRef.current?.focus(), 80);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleCloseSearchOverlay();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
        // return focus to search button
        searchButtonRef.current?.focus();
      };
    }
  }, [isSearchOverlayOpen]);

  // Helpers to open/close with animation
  const handleCloseSearchOverlay = () => {
    setIsSearchOverlayOpen(false);
    // leave mounted for animation duration then unmount
    setTimeout(() => setIsSearchOverlayMounted(false), 220);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const sanitizedQuery = sanitizeString(searchQuery.trim());
      navigate(`/products?search=${encodeURIComponent(sanitizedQuery)}`);
      setSearchQuery("");
      setIsSearchOverlayOpen(false);
    }
  };
  
  return (
  <>
  <header aria-hidden={isSearchOverlayOpen} className={`bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
    isSearchOverlayOpen ? '-translate-y-full' : (isVisible ? 'translate-y-0' : '-translate-y-full')
  }`}>
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Clothify Logo" className="h-10 w-10" />
          <span className="text-2xl font-light text-black tracking-wider">CLOTHIFY</span>
        </Link>

        {/* Center Navigation */}
        <nav className="flex items-center space-x-8 flex-1 justify-center">
          <Link 
            to="/" 
            className={`transition-colors font-light text-sm uppercase tracking-wide ${
              isActive("/") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/men" 
            className={`transition-colors font-light text-sm uppercase tracking-wide ${
              isActive("/men") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            Men
          </Link>
          <Link 
            to="/women" 
            className={`transition-colors font-light text-sm uppercase tracking-wide ${
              isActive("/women") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            Women
          </Link>
          <Link 
            to="/accessories" 
            className={`transition-colors font-light text-sm uppercase tracking-wide ${
              isActive("/accessories") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            Accessories
          </Link>
          <Link 
            to="/products" 
            className={`transition-colors font-light text-sm uppercase tracking-wide ${
              isActive("/products") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
          >
            Collection
          </Link>
        </nav>

        {/* Right Side: Cart, Tracking and Search */}
        <div className="flex items-center space-x-6 shrink-0">

          {/* Tracking/Parcels Icon */}
          <Link 
            to="/tracking" 
            className={`transition-colors relative shrink-0 ${
              isActive("/tracking") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
            aria-label="Track Parcels"
          >
            <BoxRegular />
          </Link>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className={`transition-colors relative shrink-0 ${
              isActive("/cart") 
                ? "text-blue-600" 
                : "text-gray-800 hover:text-gray-600"
            }`}
            aria-label="Cart"
          >
            <ShoppingBag20Regular />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-normal rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>


          {/* Search Icon that opens a full-screen search overlay */}
          <div className="relative w-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(e as any); }} className="flex items-center">
              <button
                ref={searchButtonRef}
                type="button"
                className="text-gray-800 hover:text-blue-600 transition-colors absolute left-0"
                aria-label="Open search"
                aria-expanded={isSearchOverlayOpen}
                aria-controls="search-overlay"
                onClick={() => { setIsSearchOverlayMounted(true); requestAnimationFrame(() => setIsSearchOverlayOpen(true)); }}
              >
                <Search20Regular />
              </button>
            </form>
          </div>


        </div>
      </div>
    </div>
  </header>

  {/* Move the overlay outside the header so it's independent of header's transform/visibility */}
  {isSearchOverlayMounted && (
    <div
      id="search-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 transition-colors duration-200`}
        style={{
          backgroundColor: isSearchOverlayOpen ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          pointerEvents: isSearchOverlayOpen ? 'auto' as const : 'none' as const
        }}
        onClick={handleCloseSearchOverlay}
      />

      {/* Overlay header with centered search field - slide/fade animation */}
      <div className={`relative bg-white shadow-md border-b border-gray-200 z-10 transition-transform duration-200 ${isSearchOverlayOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="Clothify Logo" className="h-10 w-10" />
            <span className="text-2xl font-light text-black tracking-wider">CLOTHIFY</span>
          </div>

          <form onSubmit={(e) => handleSearch(e)} className="flex flex-1 justify-center">
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search products"
              placeholder="Search for products, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-2xl px-4 py-3 text-sm text-black bg-gray-50 border border-gray-200 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </form>

          <div className="flex items-center">
            <button
              className="text-gray-600 hover:text-black px-3 py-2"
              onClick={handleCloseSearchOverlay}
              aria-label="Close search"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* The rest of the overlay is blank to gray out the app */}
      <div className="flex-1" aria-hidden="true" />
    </div>
  )}

  </>
  );
};

export default Header;
