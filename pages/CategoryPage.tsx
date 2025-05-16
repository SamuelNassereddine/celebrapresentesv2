import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// import Layout from '@/components/Layout/Layout';
import ProductCard from '@/components/Products/ProductCard';
import { fetchProductsByCategory } from '@/services/api';
import { Database } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

type Product = Database['public']['Tables']['products']['Row'] & {
  images: Database['public']['Tables']['product_images']['Row'][];
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch category info
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single();
          
        if (categories) {
          setCategoryName(categories.name);
          
          // Fetch products for this category
          const categoryProducts = await fetchProductsByCategory(categories.id);
          setProducts(categoryProducts);
        }
      } catch (error) {
        console.error('Error loading category products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [slug]);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-background-custom pt-20 md:pt-24 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            {/* <div className="w-full rounded-xl shadow-xl overflow-hidden bg-white mb-6">
              <img 
                src="/hero-banner.jpg"
                alt="Banner destaque"
                className="w-full h-48 md:h-80 object-cover object-center"
                style={{ minHeight: "200px" }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
              />
            </div> */}
            <h1 className="text-3xl md:text-5xl font-inter font-semibold mb-2 text-[#a62c47]">
            Enviamos suas flores com um lindo cartão!
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-0 text-gray-700">
              Entregamos na praia grande e toda baixada santista.
            </p>
            {/* <Link 
              to="/products" 
              className="inline-block bg-white text-[#a62c47] font-medium py-3 px-8 rounded-md hover:bg-gray-50 transition duration-200 shadow-md border border-[#f5c6d0]"
            >
              Ver Produtos
            </Link> */}
          </div>
        </div>
      </section>

      {/* Bloco de Avaliações */}
      <div className="w-full flex justify-center">
        <div className="w-80 flex justify-center -mt-8 mb-8 z-10 relative">
          <div className="bg-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-2 border border-gray-100">
            <span className="flex text-yellow-400 mr-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <polygon points="10,1.5 12.4,7.3 18.7,7.6 13.8,11.8 15.6,18 10,14.5 4.4,18 6.2,11.8 1.3,7.6 7.6,7.3" />
                  </svg>
                ))}
            </span>
            <span className="text-[#a62c47] font-bold text-lg mr-1">5,0</span>
            <span className="text-gray-700 font-medium text-base">Mais de 1100 avaliações</span>
          </div>
        </div>
      </div>
  
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-inter font-semibold">
            {loading ? <Skeleton className="h-10 w-48 mx-auto" /> : categoryName}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id} 
                title={product.title} 
                price={product.price} 
                imageUrl={product.images?.[0]?.url || '/placeholder.svg'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;