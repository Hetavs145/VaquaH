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
import Wishlist from "./pages/Wishlist.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrdersAdmin from "./pages/admin/OrdersAdmin.jsx";
import ServicesAdmin from "./pages/admin/ServicesAdmin.jsx";
import AppointmentsAdmin from "./pages/admin/AppointmentsAdmin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SetupAdmin from "./pages/admin/SetupAdmin.jsx";
import AdminManagement from "./pages/admin/AdminManagement.jsx";
import ProductsAdmin from "./pages/admin/ProductsAdmin.jsx";
import UsersAdmin from "./pages/admin/UsersAdmin.jsx";

import OffersAdmin from "./pages/admin/OffersAdmin.jsx";
import StockAdmin from "./pages/admin/StockAdmin.jsx";
import ServiceRatesAdmin from "./pages/admin/ServiceRatesAdmin.jsx";

import AppointmentNew from "./pages/AppointmentNew.jsx";
import Services from "./pages/Services.jsx";
import Search from "./pages/Search.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Terms from "./pages/Terms.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQs from "./pages/FAQs.jsx";
import Warranty from "./pages/Warranty.jsx";
import Shipping from "./pages/Shipping.jsx";
import Returns from "./pages/Returns.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Chatbot from "./components/Chatbot.jsx";

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
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
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
          <Route path="/admin/services" element={
            <AdminRoute>
              <ServicesAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/appointments" element={
            <AdminRoute>
              <AppointmentsAdmin />
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
          <Route path="/admin/users" element={
            <AdminRoute>
              <UsersAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/offers" element={
            <AdminRoute>
              <OffersAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/stock" element={
            <AdminRoute>
              <StockAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/service-rates" element={
            <AdminRoute>
              <ServiceRatesAdmin />
            </AdminRoute>
          } />


          <Route path="/appointments/new" element={
            <ProtectedRoute>
              <AppointmentNew />
            </ProtectedRoute>
          } />
          <Route path="/services" element={<Services />} />
          <Route path="/search" element={<Search />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider >
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
