
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-inter font-semibold">
            {loading ? <Skeleton className="h-10 w-48 mx-auto" /> : categoryName}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
  );
};

export default CategoryPage;
