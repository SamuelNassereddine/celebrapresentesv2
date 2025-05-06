
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/Products/ProductCard';
import CategoryCard from '@/components/Products/CategoryCard';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { fetchCategories, fetchProducts } from '@/services/api';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & { 
  images: Database['public']['Tables']['product_images']['Row'][] 
};

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const categoriesData = await fetchCategories();
      
      // Filter out the "itens adicionais" category from display
      const displayCategories = categoriesData.filter(cat => 
        cat.slug !== 'itens-adicionais' && cat.name.toLowerCase() !== 'itens adicionais'
      );
      
      const productsData = await fetchProducts();
      
      // Group products by category
      const groupedProducts: Record<string, Product[]> = {};
      
      displayCategories.forEach(category => {
        groupedProducts[category.id] = productsData.filter(
          product => product.category_id === category.id
        ).slice(0, 4); // Show max 4 products per category on home
      });
      
      setCategories(displayCategories);
      setProductsByCategory(groupedProducts);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/70 py-16 px-4 md:py-24 mb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-playfair font-bold mb-4 text-white">
              Flores para Todas as Ocasiões
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-white/90">
              Entregamos emoções através de flores. Conheça nossos buquês e arranjos especiais.
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-primary-foreground font-medium py-3 px-8 rounded-md hover:bg-gray-50 transition duration-200 shadow-md"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-6">
          Categorias
        </h2>
        {loading ? (
          <div className="text-center py-8">Carregando categorias...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                icon={category.icon || ''}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Products by Category Sections */}
      {!loading && categories.length > 0 && categories.map(category => (
        <section key={category.id} className="container mx-auto px-4 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-playfair font-semibold">
              {category.name}
            </h2>
            <Link 
              to={`/category/${category.slug}`}
              className="text-primary-foreground underline hover:text-primary-foreground/80 transition"
            >
              Ver todos
            </Link>
          </div>
          
          {productsByCategory[category.id]?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {productsByCategory[category.id].map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={Number(product.price)}
                  imageUrl={product.images[0]?.url || '/placeholder.svg'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              Nenhum produto disponível nesta categoria
            </div>
          )}
        </section>
      ))}
      
      {/* Testimonial Section */}
      <section className="bg-gray-50 py-16 px-4 mb-12">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-10 text-center">
            O que nossos clientes dizem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 italic mb-4">
                "As flores chegaram lindas e pontuais. O arranjo era exatamente como na foto e fez o maior sucesso na festa!"
              </p>
              <p className="font-medium">— Maria Silva</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 italic mb-4">
                "Serviço impecável! O buquê surpreendeu minha esposa. Com certeza voltarei a comprar!"
              </p>
              <p className="font-medium">— João Santos</p>
            </div>
          </div>
        </div>
      </section>
      
      <ProductAddedNotification />
    </>
  );
};

export default Home;
