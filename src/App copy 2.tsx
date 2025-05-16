import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '../pages/Index';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import CategoryPage from '../pages/CategoryPage';
import Cart from '../pages/Cart';
import NotFound from '../pages/NotFound';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IdentificationStep from '../pages/checkout/IdentificationStep';
import DeliveryStep from '../pages/checkout/DeliveryStep';
import PersonalizationStep from '../pages/checkout/PersonalizationStep';
import PaymentStep from '../pages/checkout/PaymentStep';
import Confirmation from '../pages/checkout/Confirmation';

// Admin routes
import AdminLayout from '../pages/admin/AdminLayout';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminOrders from '../pages/admin/Orders';
import AdminOrderDetail from '../pages/admin/Orders/OrderDetail';
import AdminProducts from '../pages/admin/Products';
import AdminProductForm from '../pages/admin/Products/ProductForm';
import AdminCategories from '../pages/admin/Categories';
import AdminCategoryForm from '../pages/admin/Categories/CategoryForm';
import AdminSpecialItems from '../pages/admin/SpecialItems';
import AdminSpecialItemForm from '../pages/admin/SpecialItems/SpecialItemForm';
import AdminCalendar from '../pages/admin/Calendar';
import AdminSettings from '../pages/admin/Settings';
import AdminUsers from '../pages/admin/Users';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout/1" element={<IdentificationStep />} />
                <Route path="checkout/2" element={<DeliveryStep />} />
                <Route path="checkout/3" element={<PersonalizationStep />} />
                <Route path="checkout/4" element={<PaymentStep />} />
                <Route path="checkout/confirmation" element={<Confirmation />} />
              </Route>
              
              {/* MODIFICADO: Rota para a tela de login administrativa */}
              {/* O caminho foi alterado de "/admin" para "/admin/login" */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* MODIFICADO: Rotas administrativas protegidas (usando um layout) */}
              {/* O caminho base foi alterado de "/admin/dashboard" para "/admin" */}
              {/* Isso permite que as sub-rotas sejam acessadas como /admin/orders, /admin/settings, etc. */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} /> {/* Rota principal do admin, geralmente o dashboard. Acessível em /admin */}
                <Route path="orders" element={<AdminOrders />} /> {/* Acessível em /admin/orders */}
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="products" element={<AdminProducts />} /> {/* Acessível em /admin/products */}
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} /> {/* Acessível em /admin/categories */}
                <Route path="categories/new" element={<AdminCategoryForm />} />
                <Route path="categories/:id" element={<AdminCategoryForm />} />
                <Route path="special-items" element={<AdminSpecialItems />} /> {/* Acessível em /admin/special-items */}
                <Route path="special-items/new" element={<AdminSpecialItemForm />} />
                <Route path="special-items/:id" element={<AdminSpecialItemForm />} />
                <Route path="calendar" element={<AdminCalendar />} /> {/* Acessível em /admin/calendar */}
                <Route path="settings" element={<AdminSettings />} /> {/* Acessível em /admin/settings */}
                <Route path="users" element={<AdminUsers />} /> {/* Acessível em /admin/users */}
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          <Toaster />
          <SonnerToaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;