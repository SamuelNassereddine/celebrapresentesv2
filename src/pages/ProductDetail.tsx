
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useCart } from '@/context/CartContext';
import { getProductById } from '@/data/mockData';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const product = getProductById(id || '');
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Produto não encontrado</h1>
          <p className="mb-6">Desculpe, não conseguimos encontrar o produto que você está procurando.</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Voltar para produtos
          </button>
        </div>
      </Layout>
    );
  }
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      image: product.images[0].url
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.title} foi adicionado ao seu carrinho`,
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img 
                src={product.images[0].url} 
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-playfair font-semibold mb-3">{product.title}</h1>
              <p className="text-2xl text-primary-foreground font-semibold mb-6">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(product.price)}
              </p>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Descrição</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Quantidade</h3>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="btn-primary w-full md:w-auto md:px-16"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ProductAddedNotification />
    </Layout>
  );
};

export default ProductDetail;
