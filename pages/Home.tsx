import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/Products/ProductCard';
import CategoryCard from '@/components/Products/CategoryCard';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { fetchCategories, fetchProducts } from '@/services/api';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & { 
  images: Database['public']['Tables']['product_images']['Row'][]; 
  slug: string;
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
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-700">
              Entregamos na praia grande e toda baixada santista.
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-[#a62c47] font-medium py-3 px-8 rounded-md hover:bg-gray-50 transition duration-200 shadow-md border border-[#f5c6d0]"
            >
              Ver Produtos
            </Link>
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
      
      {/* Categories Section estilizada */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-inter font-semibold mb-6 text-[#a62c47]">
          Surpreenda alguém hoje!
        </h2>
        {loading ? (
          <div className="text-center py-8">Carregando categorias...</div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                to={`/category/${category.slug}`}
                key={category.id}
                className="flex flex-col items-center group hover:scale-105 transition-transform duration-200"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#f5c6d0] transition-all duration-200 mb-2 bg-white shadow-lg">
                  {category.image_url
                    ?
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    :
                    (category.icon ?
                      <span className="flex justify-center items-center w-full h-full text-3xl">{category.icon}</span>
                      : <img src="/placeholder.svg" alt={category.name} className="object-cover w-full h-full" />
                    )
                  }
                </div>
                <span className="text-xs md:text-sm text-[#a62c47] text-center font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* Products by Category Sections (reaproveitando ProductCard) */}
{!loading && categories.length > 0 && categories.map(category => (
  <section key={category.id} className="container mx-auto px-4 mb-16">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl md:text-3xl font-inter font-semibold text-[#a62c47]">
        {category.name}
      </h2>
      <Link
        to={`/category/${category.slug}`}
        className="text-[#a62c47] underline hover:text-[#a62c47]/80 transition"
      >
        Ver todos
      </Link>
    </div>

    {productsByCategory[category.id]?.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {productsByCategory[category.id].map((product) => (
          <ProductCard
            key={product.id}
            id={product.id.toString()}
            title={product.title}
            price={Number(product.price)}
            imageUrl={product.images[0]?.url || '/placeholder.svg'}
            slug={product.slug}
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
          <h2 className="text-2xl md:text-3xl font-inter font-semibold mb-10 text-center">
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
