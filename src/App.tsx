import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import SupportLayout from "./layout/SupportLayout";
import AdminLayout from "./layout/AdminLayout";
import EmployeeLayout from "./layout/EmployeeLayout";
import Home from "./pages/Home";
import Products from "./pages/products/Products";
import ProductView from "./pages/products/ProductView";
import Men from "./pages/products/Men";
import Women from "./pages/products/Women";
import Accessories from "./pages/products/Accessories";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Admin from "./pages/admin/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import Customers from "./pages/admin/Customers";
import Payments from "./pages/admin/Payments";
import Members from "./pages/admin/Members";
import Settings from "./pages/admin/Settings";
import Information from "./pages/admin/Information";
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
import EmployeeDashboard from "./pages/employees/EmployeeDashboard";
import EmployeeInventory from "./pages/employees/EmployeeInventory";
import EmployeeProducts from "./pages/employees/EmployeeProducts";
import EmployeeCustomers from "./pages/employees/EmployeeCustomers";
import { Toaster } from "react-hot-toast";


const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductView /></Layout>} />
          <Route path="/men" element={<Layout><Men /></Layout>} />
          <Route path="/women" element={<Layout><Women /></Layout>} />
          <Route path="/accessories" element={<Layout><Accessories /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/employee-dashboard" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/tracking" element={<Layout><Tracking /></Layout>} />
          <Route path="/support" element={<Layout><SupportLayout /></Layout>}>
            <Route index element={<Navigate to="/support/contact" replace />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="shipping" element={<ShippingInfo />} />
            <Route path="returns" element={<Returns />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="warranty" element={<Warranty />} />
          </Route>
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="*" element={<NotFound />} />

          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="products" element={<EmployeeProducts />} />
            <Route path="inventory" element={<EmployeeInventory />} />
            <Route path="customers" element={<EmployeeCustomers />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Admin />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="members" element={<Members />} />
            <Route path="settings" element={<Settings />} />
            <Route path="information" element={<Information />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
