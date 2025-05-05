
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStoreSettings, fetchCategories } from '@/services/api';
import { Database } from '@/integrations/supabase/types';
import { Instagram } from 'lucide-react';

type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const Footer = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load store settings
        const storeSettings = await fetchStoreSettings();
        if (storeSettings) {
          console.log("Footer: Loaded store settings:", storeSettings);
          setSettings(storeSettings);
        } else {
          console.error("Footer: Failed to load store settings");
        }
        
        // Load categories
        const categoryData = await fetchCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("Footer: Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <footer className="bg-gray-50 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">
              {settings?.name || 'Flor & Cia'}
            </h3>
            
            {settings?.logo_url && (
              <img 
                src={settings.logo_url} 
                alt={settings?.name || 'Flor & Cia'} 
                className="h-12 object-contain mb-4"
                onError={(e) => {
                  console.error("Failed to load logo:", settings.logo_url);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            
            <p className="text-gray-600 mb-4">
              {settings?.footer_description || 'Entregamos emoções através de flores. Conheça nossos buquês e arranjos especiais.'}
            </p>
            
            {settings?.instagram_url && (
              <a 
                href={settings.instagram_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-600 hover:text-pink-500"
              >
                <Instagram className="h-5 w-5 mr-2" />
                <span>Siga-nos no Instagram</span>
              </a>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-foreground">
                  Início
                </Link>
              </li>
              
              {categories.map(category => (
                <li key={category.id}>
                  <Link 
                    to={`/category/${category.slug}`} 
                    className="text-gray-600 hover:text-primary-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary-foreground">
                  Todos os Produtos
                </Link>
              </li>
              
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-primary-foreground">
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-playfair font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              {settings?.store_email && (
                <li className="text-gray-600">
                  <span className="font-medium">Email:</span> {settings.store_email}
                </li>
              )}
              
              {settings?.whatsapp_number && (
                <li className="text-gray-600">
                  <span className="font-medium">WhatsApp:</span> 
                  <a 
                    href={`https://wa.me/${settings.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-foreground ml-1"
                  >
                    {settings.whatsapp_number.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')}
                  </a>
                </li>
              )}
              
              {settings?.store_address && (
                <li className="text-gray-600">
                  <span className="font-medium">Endereço:</span> {settings.store_address}
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {settings?.name || 'Flor & Cia'}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
