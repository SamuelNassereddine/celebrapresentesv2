import { useState, useEffect } from 'react';
// Remova esta linha: import Layout from '@/components/Layout/Layout';
import ProductCard from '@/components/Products/ProductCard';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchCategories, fetchProducts } from '@/services/api';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & {
  images: Database['public']['Tables']['product_images']['Row'][]
};

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await fetchCategories();
      const productsData = await fetchProducts();

      setCategories(categoriesData);
      setProducts(productsData);
    };

    loadData();
  }, []);

  // Filter products based on category, search term, and price range
  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category_id === selectedCategory)
    .filter(product =>
      product.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false)
    )
    .filter(product =>
      Number(product.price) >= priceRange.min && Number(product.price) <= priceRange.max
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-playfair font-semibold">Produtos</h1>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          {/* Filter toggle button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-xl font-playfair font-medium mb-4">Categorias</h2>
        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-2 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
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
          {categories.map(category => (
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

      {/* Price filter (shown conditionally) */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 animate-fade-in">
          <h3 className="font-medium mb-3">Filtrar por preço</h3>
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="min-price" className="block text-sm text-gray-600 mb-1">Preço mínimo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>
            <div>
              <label htmlFor="max-price" className="block text-sm text-gray-600 mb-1">Preço máximo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="mb-4 text-gray-600">
        Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={Number(product.price)}
            imageUrl={product.images[0]?.url || '/placeholder.svg'}
          />
        ))}
      </div>

      {/* No products message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Nenhum produto encontrado.</p>
          <p className="text-gray-500 text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
        </div>
      )}

      <ProductAddedNotification />
    </div>
  );
};

export default Products;