
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { useCart } from '@/context/CartContext';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { useToast } from '@/hooks/use-toast';
import { fetchProductById } from '@/services/api';
import { Database } from '@/integrations/supabase/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ProductWithImages = Database['public']['Tables']['products']['Row'] & { 
  images: Database['public']['Tables']['product_images']['Row'][] 
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      const productData = await fetchProductById(id);
      setProduct(productData);
      setLoading(false);
    };
    
    loadProduct();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Carregando produto...</p>
        </div>
      </Layout>
    );
  }
  
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
      price: Number(product.price),
      quantity: quantity,
      image: product.images[0]?.url || '/placeholder.svg'
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.title} foi adicionado ao seu carrinho`,
    });
  };

  // Determine if we should show a carousel or single image
  const hasMultipleImages = product.images.length > 1;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image - Carousel or Single Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              {hasMultipleImages ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.images.map((image, index) => (
                      <CarouselItem key={image.id}>
                        <div className="p-1">
                          <img 
                            src={image.url || '/placeholder.svg'} 
                            alt={`${product.title} - Imagem ${index + 1}`}
                            className="w-full h-96 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <img 
                  src={product.images[0]?.url || '/placeholder.svg'} 
                  alt={product.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-playfair font-semibold mb-3">{product.title}</h1>
              <p className="text-2xl text-primary-foreground font-semibold mb-6">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(Number(product.price))}
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
