
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu } from 'lucide-react';
import { fetchStoreSettings, fetchCategories } from '@/services/api';
import { Database } from '@/integrations/supabase/types';

type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const Header = () => {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load store settings
        const settings = await fetchStoreSettings();
        if (settings) {
          console.log("Header: Loaded store settings:", settings);
          setStoreSettings(settings);
          
          // Update CSS variables with store colors
          if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary', settings.primary_color);
          }
          if (settings.primary_text_color) {
            document.documentElement.style.setProperty('--primary-foreground', settings.primary_text_color);
          }
          if (settings.secondary_color) {
            document.documentElement.style.setProperty('--secondary', settings.secondary_color);
          }
          if (settings.secondary_text_color) {
            document.documentElement.style.setProperty('--secondary-foreground', settings.secondary_text_color);
          }
        } else {
          console.error("Header: Failed to load store settings");
        }
        
        // Load categories
        const categoryData = await fetchCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("Header: Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            {storeSettings?.logo_url ? (
              <img 
                src={storeSettings.logo_url} 
                alt={storeSettings.name} 
                className="h-10 object-contain"
                onError={(e) => {
                  console.error("Failed to load logo:", storeSettings.logo_url);
                  (e.target as HTMLImageElement).style.display = 'none';
                  const nameElement = e.currentTarget.parentElement;
                  if (nameElement) {
                    nameElement.innerHTML = `<span class="font-inter text-2xl font-bold">${storeSettings.name || 'Flor & Cia'}</span>`;
                  }
                }}
              />
            ) : (
              <span className="font-inter text-2xl font-bold">
                {storeSettings?.name || 'Flor & Cia'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-foreground">
              Início
            </Link>
            
            {/* Desktop Category Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary-foreground flex items-center gap-1">
                Categorias
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-1">
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/products" className="text-gray-700 hover:text-primary-foreground">
              Produtos
            </Link>
            
            {storeSettings?.whatsapp_number && (
              <a 
                href={`https://wa.me/${storeSettings.whatsapp_number}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-primary-foreground"
              >
                WhatsApp
              </a>
            )}
            
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-foreground text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-foreground text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t mt-2 animate-fade-in">
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/"
                  onClick={() => setIsMenuOpen(false)} 
                  className="block text-gray-700 hover:text-primary-foreground"
                >
                  Início
                </Link>
              </li>
              <li>
                <span className="block text-gray-700 font-medium mb-1">Categorias</span>
                <ul className="pl-4 space-y-1">
                  {categories.map(category => (
                    <li key={category.id}>
                      <Link 
                        to={`/category/${category.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-gray-600 hover:text-primary-foreground text-sm py-1"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link 
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary-foreground"
                >
                  Produtos
                </Link>
              </li>
              <li>
                {storeSettings?.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${storeSettings.whatsapp_number}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-gray-700 hover:text-primary-foreground"
                  >
                    WhatsApp
                  </a>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className="flex flex-col items-center">
            <span className="text-gray-500">🏠</span>
            <span className="text-xs text-gray-500">Início</span>
          </Link>
          
          <Link to="/products" className="flex flex-col items-center">
            <span className="text-gray-500">🌸</span>
            <span className="text-xs text-gray-500">Produtos</span>
          </Link>
          
          {storeSettings?.whatsapp_number ? (
            <a 
              href={`https://wa.me/${storeSettings.whatsapp_number}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center"
            >
              <span className="text-gray-500">💬</span>
              <span className="text-xs text-gray-500">WhatsApp</span>
            </a>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-gray-500">💬</span>
              <span className="text-xs text-gray-500">WhatsApp</span>
            </div>
          )}
          
          <Link to="/cart" className="flex flex-col items-center relative">
            <span className="text-gray-500">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-foreground text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className="text-xs text-gray-500">Carrinho</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
