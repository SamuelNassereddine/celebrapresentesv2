
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash } from 'lucide-react';
import { fetchSpecialItems } from '@/services/api';
import SpecialItemCard from '@/components/SpecialItems/SpecialItemCard';
import { Database } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type SpecialItem = Database['public']['Tables']['special_items']['Row'];

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Cart - Fetching special items');
        // Fetch special items
        const specialItemsData = await fetchSpecialItems();
        console.log('Cart - Special items fetched:', specialItemsData?.length || 0);
        
        if (!specialItemsData || specialItemsData.length === 0) {
          console.log('No special items were returned from the API');
        } else {
          console.log('Special items data:', specialItemsData);
        }
        
        setSpecialItems(specialItemsData);
      } catch (error) {
        console.error('Error fetching special items:', error);
        setError('Não foi possível carregar os itens especiais');
        toast.error('Erro ao carregar itens especiais');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);
  
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };
  
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };
  
  const handleCheckout = () => {
    // When starting a new checkout process, ensure we clear any previous checkout data
    // This will force the creation of a new order ID when the user goes to the first step
    localStorage.removeItem('currentOrderId');
    localStorage.removeItem('checkoutIdentification');
    localStorage.removeItem('checkoutDelivery');
    localStorage.removeItem('checkoutPersonalization');
    localStorage.removeItem('checkoutStep3Complete');
    
    // Navigate to the first checkout step
    navigate('/checkout/1');
  };

  // Special Items Section - Always show regardless of cart state
  const renderSpecialItemsSection = () => {
    return (
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-playfair font-semibold mb-6">
          Adicione itens especiais ao seu pedido
        </h2>
        {loading ? (
          <div className="text-center py-8">
            Carregando itens especiais...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        ) : specialItems.length === 0 ? (
          <div className="text-center py-4">
            Nenhum item especial disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {specialItems.map((item) => (
              <SpecialItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-playfair font-semibold mb-6">Seu Carrinho</h1>
      
      {items.length === 0 ? (
        <div>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-8">Adicione produtos para continuar comprando</p>
            <Button 
              asChild
              className="btn-primary"
            >
              <Link to="/products">
                Ver produtos
              </Link>
            </Button>
          </div>
          
          {/* Special Items - Always show even with empty cart */}
          {renderSpecialItemsSection()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Itens no carrinho</h2>
              <div className="divide-y">
                {items.map(item => (
                  <div key={item.id} className="py-4 flex items-center">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-primary-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                        aria-label="Diminuir quantidade"
                      >
                        -
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 text-gray-400 hover:text-red-500"
                      aria-label="Remover item"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Special Items Section - Now positioned here above the order summary */}
            {renderSpecialItemsSection()}
          </div>
          
          {/* Order Summary - Now positioned after special items */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Resumo do pedido</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(totalPrice)}
                  </span>
                </div>
                
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(totalPrice)}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout}
                variant="default"
                className="w-full bg-[#f5c6d0] text-[#a62c47]"
              >
                Finalizar Compra
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
