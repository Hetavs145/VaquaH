import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Contracts from "./pages/Contracts.jsx";
import Checkout from "./pages/Checkout.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrdersAdmin from "./pages/admin/OrdersAdmin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SetupAdmin from "./pages/admin/SetupAdmin.jsx";
import AdminManagement from "./pages/admin/AdminManagement.jsx";
import ProductsAdmin from "./pages/admin/ProductsAdmin.jsx";

import AppointmentNew from "./pages/AppointmentNew.jsx";
import Services from "./pages/Services.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Terms from "./pages/Terms.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  // Check if user is admin (this will be checked in the component itself)
  return <>{children}</>;
};

// Main App Component
const AppContent = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <OrdersAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/setup" element={
            <ProtectedRoute>
              <SetupAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/management" element={
            <AdminRoute>
              <AdminManagement />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <ProductsAdmin />
            </AdminRoute>
          } />

          
          <Route path="/appointments/new" element={
            <ProtectedRoute>
              <AppointmentNew />
            </ProtectedRoute>
          } />
          <Route path="/services" element={<Services />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
