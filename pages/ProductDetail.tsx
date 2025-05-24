import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import ProductAddedNotification from '@/components/Cart/ProductAddedNotification';
import { useToast } from '@/hooks/use-toast';
import { fetchProductById } from '@/services/api';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from 'react';
import FixedActionBarProduct from '@/components/Common/FixedActionBarProduct';

type ProductWithImages = Database['public']['Tables']['products']['Row'] & { 
  images: Database['public']['Tables']['product_images']['Row'][] 
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Novo: Buscar o produto pelo slug (você pode usar ou criar fetchProductBySlug no api)
        const productData = await fetchProductById(slug);
        setProduct(productData);
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [slug, toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Carregando produto...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Produto não encontrado</h1>
        <p className="mb-6">Desculpe, não conseguimos encontrar o produto que você está procurando.</p>
        <Button 
          onClick={() => navigate('/products')}
          variant="default"
        >
          Voltar para produtos
        </Button>
      </div>
    );
  }
  
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

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
  const hasMultipleImages = product.images && product.images.length > 1;
  
  // Cálculo do carrinho atual (poderia vir do contexto/cart, mas ilustramos localmente)
  // Ajuste se quiser fetch atual do Cart.
  const total = Number(product.price) * quantity;

  // Exibe botão fixo apenas no mobile
  return (
    <div className="container mx-auto px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image - Carousel or Single Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            {hasMultipleImages ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={image.id || index}>
                      <div className="p-1">
                        <img 
                          src={image.url || '/placeholder.svg'} 
                          alt={`${product.title} - Imagem ${index + 1}`}
                          className="w-full h-96 object-cover rounded-md "
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
                src={(product.images && product.images[0]?.url) || '/placeholder.svg'} 
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
            <h1 className="text-2xl md:text-3xl font-inter font-semibold mb-3">{product.title}</h1>
            <p className="text-2xl text-primary-foreground font-semibold mb-6">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                .format(Number(product.price))}
            </p>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Descrição</h3>
              <p className="text-gray-600">
  {product.description?.split('\n').map((paragraph, index) => (
    <React.Fragment key={index}>
      {paragraph}
      {index < (product.description?.split('\n').length || 0) - 1 && <br />}
    </React.Fragment>
  ))}
</p>
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
            
            <Button 
              onClick={handleAddToCart}
              variant="default"
              className="hidden md:block w-full md:w-auto md:px-16 btn-primary"
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
      
      {/* Botão fixo mobile */}
      <FixedActionBarProduct
        total={total}
        quantity={quantity}
        buttonLabel="Adicionar ao Carrinho"
        onButtonClick={handleAddToCart}
      />
      <ProductAddedNotification />
    </div>
  );
};

export default ProductDetail;
