
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Import pages
const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Checkout steps
const IdentificationStep = lazy(() => import('@/pages/checkout/IdentificationStep'));
const DeliveryStep = lazy(() => import('@/pages/checkout/DeliveryStep'));
const PersonalizationStep = lazy(() => import('@/pages/checkout/PersonalizationStep'));
const PaymentStep = lazy(() => import('@/pages/checkout/PaymentStep'));
const Confirmation = lazy(() => import('@/pages/checkout/Confirmation'));

// Admin pages
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminProductForm = lazy(() => import('@/pages/admin/Products/ProductForm'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminCategoryForm = lazy(() => import('@/pages/admin/Categories/CategoryForm'));
const AdminSpecialItems = lazy(() => import('@/pages/admin/SpecialItems'));
const AdminSpecialItemForm = lazy(() => import('@/pages/admin/SpecialItems/SpecialItemForm'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/Orders/OrderDetail'));
const AdminCalendar = lazy(() => import('@/pages/admin/Calendar'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:slug" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Checkout Routes */}
              <Route path="/checkout/1" element={<IdentificationStep />} />
              <Route path="/checkout/2" element={<DeliveryStep />} />
              <Route path="/checkout/3" element={<PersonalizationStep />} />
              <Route path="/checkout/4" element={<PaymentStep />} />
              <Route path="/checkout/confirmation" element={<Confirmation />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id" element={<AdminProductForm />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/categories/new" element={<AdminCategoryForm />} />
              <Route path="/admin/categories/:id" element={<AdminCategoryForm />} />
              <Route path="/admin/special-items" element={<AdminSpecialItems />} />
              <Route path="/admin/special-items/new" element={<AdminSpecialItemForm />} />
              <Route path="/admin/special-items/:id" element={<AdminSpecialItemForm />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
