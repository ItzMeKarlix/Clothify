import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import SupportLayout from "./layout/SupportLayout";
import AdminLayout from "./layout/AdminLayout";
import EmployeeLayout from "./layout/EmployeeLayout";
import ProtectedRoute from "./components/ProtectedRoute";
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
import TicketDebug from "./pages/admin/TicketDebug";
import AdminGuide from "./pages/admin/AdminGuide";
import EmployeeGuide from "./pages/employees/EmployeeGuide";
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
import Orders from "./pages/admin/Orders";
import EmployeeOrders from "./pages/employees/EmployeeOrders";
import EmployeeSettings from "./pages/employees/EmployeeSettings";
import EmployeeSupport from "./pages/employees/EmployeeSupport";
import EmployeeInformation from "./pages/employees/EmployeeInformation";


const App: React.FC = () => {
  return (
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
          <Route path="/employee-dashboard" element={
            <ProtectedRoute requiredRole="employee">
              <Navigate to="/employee/dashboard" replace />
            </ProtectedRoute>
          } />
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
            <Route index element={
              <ProtectedRoute requiredRole="employee">
                <Navigate to="/employee/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="products" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeProducts />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeOrders />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeInventory />
              </ProtectedRoute>
            } />
            <Route path="customers" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeCustomers />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <EmployeeSettings />
              </ProtectedRoute>
            } />
            <Route path="information" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeInformation />
              </ProtectedRoute>
            } />
            <Route path="support" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSupport />
              </ProtectedRoute>
            } />
            <Route path="guide" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeGuide />
              </ProtectedRoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={
              <ProtectedRoute requiredRole="admin">
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="products" element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute requiredRole="admin">
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute requiredRole="admin">
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="customers" element={
              <ProtectedRoute requiredRole="admin">
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="ticket-debug" element={
              <ProtectedRoute requiredRole="admin">
                <TicketDebug />
              </ProtectedRoute>
            } />
            <Route path="payments" element={
              <ProtectedRoute requiredRole="admin">
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="members" element={
              <ProtectedRoute requiredRole="admin">
                <Members />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="information" element={
              <ProtectedRoute requiredRole="admin">
                <Information />
              </ProtectedRoute>
            } />
            <Route path="guide" element={
              <ProtectedRoute requiredRole="admin">
                <AdminGuide />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
  );
};

export default App;
