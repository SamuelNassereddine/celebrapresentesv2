
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import IdentificationStep from "./pages/checkout/IdentificationStep";
import DeliveryStep from "./pages/checkout/DeliveryStep";
import PersonalizationStep from "./pages/checkout/PersonalizationStep";
import PaymentStep from "./pages/checkout/PaymentStep";
import Confirmation from "./pages/checkout/Confirmation";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Admin routes
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCalendar from "./pages/admin/Calendar";
import AdminSettings from "./pages/admin/Settings";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/1" element={<IdentificationStep />} />
              <Route path="/checkout/2" element={<DeliveryStep />} />
              <Route path="/checkout/3" element={<PersonalizationStep />} />
              <Route path="/checkout/4" element={<PaymentStep />} />
              <Route path="/checkout/confirmation" element={<Confirmation />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
