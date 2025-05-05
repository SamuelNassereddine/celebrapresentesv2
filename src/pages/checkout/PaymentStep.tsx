
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useCart } from '@/context/CartContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { fetchStoreSettings } from '@/services/api';
import { AlertCircle, Loader2 } from 'lucide-react';

const PaymentStep = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState({ whatsappNumber: '5511987965672' });
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  
  useEffect(() => {
    console.log('PaymentStep - Initializing component');
    const savedOrderId = localStorage.getItem('currentOrderId');
    console.log('PaymentStep - orderId from localStorage:', savedOrderId);
    
    if (!savedOrderId) {
      console.error('PaymentStep - No order ID found in localStorage');
      toast.error('Por favor, complete as etapas anteriores primeiro');
      navigate('/checkout/1');
      return;
    }
    
    setOrderId(savedOrderId);
    
    // Carregar dados do pedido e configurações da loja
    const loadData = async () => {
      try {
        console.log('PaymentStep - Loading order data for ID:', savedOrderId);
        // Carregar pedido
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', savedOrderId)
          .single();
          
        if (error) {
          console.error('PaymentStep - Error loading order:', error);
          throw error;
        }
        
        console.log('PaymentStep - Order data loaded:', data);
        setOrderData(data);
        setOrderNumber(data.order_number || '');
        
        // Carregar configurações da loja
        const settings = await fetchStoreSettings();
        console.log('PaymentStep - Store settings loaded:', settings);
        if (settings && settings.whatsapp_number) {
          setStoreSettings(prevSettings => ({
            ...prevSettings,
            whatsappNumber: settings.whatsapp_number
          }));
        }
        
        // Atualizar o preço total no pedido
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_price: totalPrice })
          .eq('id', savedOrderId);
          
        if (updateError) {
          console.error('PaymentStep - Error updating total price:', updateError);
        } else {
          console.log('PaymentStep - Total price updated successfully:', totalPrice);
        }
          
      } catch (error) {
        console.error('PaymentStep - Error loading data:', error);
        toast.error('Erro ao carregar dados do pedido');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [navigate, totalPrice]);
  
  // Verificar se há dados de checkout
  const checkoutDataExists = () => {
    const identification = localStorage.getItem('checkoutIdentification');
    const delivery = localStorage.getItem('checkoutDelivery');
    
    console.log('PaymentStep - Checking checkout data:');
    console.log('- identification:', !!identification);
    console.log('- delivery:', !!delivery);
    console.log('- orderId:', !!orderId);
    
    return !!identification && !!delivery && !!orderId;
  };
  
  // Redirecionar se não tiver dados completos
  useEffect(() => {
    const isDataComplete = checkoutDataExists();
    console.log('PaymentStep - Is checkout data complete?', isDataComplete);
    
    if (!isDataComplete) {
      console.log('PaymentStep - Incomplete checkout data, redirecting to step 1');
      toast.error('É necessário preencher os dados de identificação e entrega');
      navigate('/checkout/1');
    }
  }, [navigate]);
  
  const formatWhatsAppMessage = () => {
    if (!orderData) return '';
    
    let message = `*Pedido #${orderNumber}*\n\n`;
    
    // Customer info
    message += `*Informações do Cliente*\n`;
    message += `Nome: ${orderData.customer_name}\n`;
    message += `Telefone: ${orderData.customer_phone}\n`;
    if (orderData.customer_email) message += `Email: ${orderData.customer_email}\n`;
    message += `\n`;
    
    // Delivery info
    message += `*Informações de Entrega*\n`;
    if (orderData.recipient_name !== orderData.customer_name) {
      message += `Destinatário: ${orderData.recipient_name}\n`;
    }
    message += `Endereço: ${orderData.address_street}, ${orderData.address_number}`;
    if (orderData.address_complement) message += `, ${orderData.address_complement}`;
    message += `\n${orderData.address_neighborhood}, ${orderData.address_city} - ${orderData.address_state}\n`;
    message += `CEP: ${orderData.address_zipcode}\n`;
    
    // Delivery time
    message += `Data de entrega: ${new Date(orderData.delivery_date).toLocaleDateString('pt-BR')}\n`;
    
    // Message
    if (orderData.personalization_text) {
      message += `\n*Mensagem*\n"${orderData.personalization_text}"\n\n`;
    }
    
    // Items
    message += `*Itens do Pedido*\n`;
    items.forEach((item) => {
      message += `${item.quantity}x ${item.title} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}\n`;
    });
    message += `\n*Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}*`;
    
    return encodeURIComponent(message);
  };
  
  const addOrderItems = async () => {
    if (!orderId) {
      console.error('PaymentStep - Cannot add items: No order ID');
      return false;
    }
    
    try {
      console.log('PaymentStep - Adding items to order:', items.length, 'items');
      // Remover itens existentes (se houver)
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
        
      if (deleteError) {
        console.error('PaymentStep - Error deleting existing items:', deleteError);
      }
      
      // Adicionar os itens do carrinho ao pedido
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_title: item.title,
        unit_price: item.price,
        quantity: item.quantity,
        product_id: item.id.startsWith('special-') ? null : item.id // Apenas produtos regulares têm product_id
      }));
      
      console.log('PaymentStep - Items to add:', orderItems);
      
      if (orderItems.length > 0) {
        const { error } = await supabase
          .from('order_items')
          .insert(orderItems);
          
        if (error) {
          console.error('PaymentStep - Error adding items to order:', error);
          return false;
        }
        
        console.log('PaymentStep - Items added successfully');
      }
      
      return true;
    } catch (error) {
      console.error('PaymentStep - Unhandled error adding items:', error);
      return false;
    }
  };
  
  const handleWhatsAppCheckout = async () => {
    if (isSubmitting || !orderId) {
      console.log('PaymentStep - Submit prevented: isSubmitting=', isSubmitting, 'orderId=', orderId);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      console.log('PaymentStep - Starting WhatsApp checkout process');
      
      // Atualizar o preço final do pedido e adicionar os itens
      console.log('PaymentStep - Updating final price:', totalPrice);
      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_price: totalPrice })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('PaymentStep - Error updating final price:', updateError);
        setError('Erro ao finalizar o pedido. Tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      // Adicionar os itens do pedido
      console.log('PaymentStep - Adding order items');
      const itemsAdded = await addOrderItems();
      if (!itemsAdded) {
        console.error('PaymentStep - Failed to add items');
        setError('Erro ao adicionar itens ao pedido. Tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      // Preparar a mensagem para o WhatsApp
      const message = formatWhatsAppMessage();
      console.log('PaymentStep - WhatsApp message prepared');
      
      // Clear the cart and checkout data
      console.log('PaymentStep - Clearing cart and checkout data');
      clearCart();
      
      // Manter o ID do pedido para uso na tela de confirmação
      // Mas limpar os outros dados temporários
      localStorage.removeItem('checkoutIdentification');
      localStorage.removeItem('checkoutDelivery');
      localStorage.removeItem('checkoutPersonalization');
      
      // Open WhatsApp in a new tab
      const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${message}`;
      console.log('PaymentStep - Opening WhatsApp URL:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      
      // Navigate to confirmation page
      console.log('PaymentStep - Navigating to confirmation page');
      navigate('/checkout/confirmation');
    } catch (error) {
      console.error('PaymentStep - Error during checkout:', error);
      setError('Erro ao processar o pedido. Tente novamente ou continue via WhatsApp.');
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (initialLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <CheckoutSteps currentStep={4} />
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={4} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Pagamento</h2>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Resumo do pedido</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Número do pedido:</span>
                  <span className="font-medium">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                      .format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Finalizar via WhatsApp</h3>
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Ao clicar no botão abaixo, você será redirecionado para o WhatsApp para finalizar seu pedido.
                    </p>
                    <Button 
                      onClick={handleWhatsAppCheckout}
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : 'Finalizar pelo WhatsApp'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 flex justify-start">
            <Button 
              variant="outline"
              onClick={() => navigate('/checkout/3')}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStep;
