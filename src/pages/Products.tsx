
import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import ProductCard from '@/components/Products/ProductCard';
import CategoryCard from '@/components/Products/CategoryCard';
import { mockCategories, mockProducts } from '@/data/mockData';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.categoryId === selectedCategory);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair font-semibold mb-8">Produtos</h1>
        
        {/* Categories */}
        <div className="mb-10">
          <h2 className="text-xl font-playfair font-medium mb-4">Categorias</h2>
          <div className="flex flex-nowrap overflow-x-auto pb-4 md:grid md:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full border ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {mockCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full border ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.images[0].url}
            />
          ))}
        </div>
        
        {/* No products message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
      
      <ProductAddedNotification />
    </Layout>
  );
};

export default Products;
