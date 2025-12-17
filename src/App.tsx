import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import SupportLayout from "./layout/SupportLayout";
import AdminLayout from "./layout/AdminLayout";
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
import Dashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import Customers from "./pages/admin/Customers";
import Payments from "./pages/admin/Payments";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";
import ContactUs from "./pages/support/ContactUs";
import FAQ from "./pages/support/FAQ";
import ShippingInfo from "./pages/support/ShippingInfo";
import Returns from "./pages/support/Returns";
import TermsAndConditions from "./pages/support/TermsAndConditions";
import PrivacyPolicy from "./pages/support/PrivacyPolicy";
import Warranty from "./pages/support/Warranty";
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
          
          <Route path="/support" element={<SupportLayout />}>
            <Route index element={<Navigate to="/support/contact" replace />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="shipping" element={<ShippingInfo />} />
            <Route path="returns" element={<Returns />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="warranty" element={<Warranty />} />
          </Route>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      {/* Admin Routes */}
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Admin />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
};

export default App;
