import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Products from "./pages/products/Products";
import ProductView from "./pages/products/ProductView";
import Men from "./pages/products/Men";
import Women from "./pages/products/Women";
import Accessories from "./pages/products/Accessories";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Admin from "./pages/admin/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";


const App: React.FC = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState( true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
    <Toaster 
      position="top-right" 
      reverseOrder={false}
      toastOptions={{
        style: {
          marginTop: isHeaderVisible ? '70px' : '16px',
          transition: 'margin-top 0.3s ease',
        },
      }}
    />
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Women />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
    </>
  );
};

export default App;
