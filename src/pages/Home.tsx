
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ProductCard from '@/components/Products/ProductCard';
import CategoryCard from '@/components/Products/CategoryCard';
import { mockCategories, mockProducts } from '@/data/mockData';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';

const Home = () => {
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-16 px-4 md:py-24 mb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-playfair font-bold mb-4">
              Flores para Todas as Ocasiões
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Entregamos emoções através de flores. Conheça nossos buquês e arranjos especiais.
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-primary-foreground font-medium py-2.5 px-8 rounded-md hover:bg-gray-50 transition duration-200"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mockCategories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              slug={category.slug}
              icon={category.icon}
            />
          ))}
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-2xl md:text-3xl font-playfair font-semibold mb-6">
          Produtos em Destaque
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.images[0].url}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link 
            to="/products" 
            className="inline-block bg-primary text-primary-foreground font-medium py-2.5 px-8 rounded-md hover:bg-opacity-90 transition duration-200"
          >
            Ver todos os produtos
          </Link>
        </div>
      </section>
      
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
    </Layout>
  );
};

export default Home;
