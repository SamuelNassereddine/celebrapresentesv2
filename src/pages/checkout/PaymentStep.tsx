
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

// Store settings - ideally this would come from the database
const storeSettings = {
  whatsappNumber: '5511987965672'
};

const PaymentStep = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNum.toString());
  }, []);
  
  // Get all checkout data
  const getCheckoutData = () => {
    const identification = localStorage.getItem('checkoutIdentification');
    const delivery = localStorage.getItem('checkoutDelivery');
    const personalization = localStorage.getItem('checkoutPersonalization');
    
    return {
      identification: identification ? JSON.parse(identification) : {},
      delivery: delivery ? JSON.parse(delivery) : {},
      personalization: personalization ? JSON.parse(personalization) : {},
      items,
      totalPrice,
      orderNumber
    };
  };
  
  const formatWhatsAppMessage = () => {
    const data = getCheckoutData();
    let message = `*Pedido #${data.orderNumber}*\n\n`;
    
    // Customer info
    message += `*Informações do Cliente*\n`;
    message += `Nome: ${data.identification.name}\n`;
    message += `Telefone: ${data.identification.phone}\n`;
    if (data.identification.email) message += `Email: ${data.identification.email}\n`;
    message += `\n`;
    
    // Delivery info
    message += `*Informações de Entrega*\n`;
    if (!data.delivery.recipientSelf) {
      message += `Destinatário: ${data.delivery.recipientName}\n`;
    }
    message += `Endereço: ${data.delivery.street}, ${data.delivery.number}`;
    if (data.delivery.complement) message += `, ${data.delivery.complement}`;
    message += `\n${data.delivery.neighborhood}, ${data.delivery.city} - ${data.delivery.state}\n`;
    message += `CEP: ${data.delivery.cep}\n`;
    
    // Delivery time
    message += `Data de entrega: ${new Date(data.delivery.deliveryDate).toLocaleDateString('pt-BR')}\n`;
    const timeSlot = data.delivery.deliveryTimeSlot === '1' ? '08:00 - 12:00' :
                      data.delivery.deliveryTimeSlot === '2' ? '12:00 - 15:00' :
                      data.delivery.deliveryTimeSlot === '3' ? '15:00 - 18:00' : '18:00 - 20:00';
    message += `Horário: ${timeSlot}\n\n`;
    
    // Message
    if (data.personalization.message) {
      message += `*Mensagem*\n"${data.personalization.message}"\n\n`;
    }
    
    // Items
    message += `*Itens do Pedido*\n`;
    data.items.forEach((item) => {
      message += `${item.quantity}x ${item.title} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}\n`;
    });
    message += `\n*Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalPrice)}*`;
    
    return encodeURIComponent(message);
  };
  
  const saveOrderToDatabase = async () => {
    try {
      const data = getCheckoutData();
      
      // Como estamos usando RLS para permitir inserções anônimas,
      // vamos garantir que o objeto de dados esteja correto e completo
      const orderData = {
        customer_name: data.identification.name,
        customer_phone: data.identification.phone,
        customer_email: data.identification.email || null,
        recipient_name: !data.delivery.recipientSelf ? data.delivery.recipientName : data.identification.name,
        address_street: data.delivery.street,
        address_number: data.delivery.number,
        address_complement: data.delivery.complement || null,
        address_neighborhood: data.delivery.neighborhood,
        address_city: data.delivery.city,
        address_state: data.delivery.state,
        address_zipcode: data.delivery.cep,
        delivery_date: data.delivery.deliveryDate,
        delivery_time_slot_id: data.delivery.deliveryTimeSlot,
        personalization_text: data.personalization.message || null,
        total_price: data.totalPrice,
        status: 'pending'
      };
      
      // Inserir o pedido
      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) {
        console.error('Error saving order to database:', orderError);
        throw orderError;
      }
      
      if (!createdOrder) {
        throw new Error('Não foi possível criar o pedido');
      }
      
      // Inserir os itens do pedido
      const orderItems = data.items.map(item => ({
        order_id: createdOrder.id,
        product_id: item.id,
        product_title: item.title,
        unit_price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error saving order items:', itemsError);
        throw itemsError;
      }
      
      return createdOrder;
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  };
  
  const handleWhatsAppCheckout = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Preparar a mensagem antes de salvar para que se houver erro no banco,
      // pelo menos o cliente possa enviar a mensagem via WhatsApp
      const message = formatWhatsAppMessage();
      
      try {
        // Tenta salvar no banco
        await saveOrderToDatabase();
        toast.success('Pedido registrado com sucesso!');
      } catch (dbError) {
        // Se falhar em salvar no banco, apenas mostra um aviso mas continua para WhatsApp
        console.error('Não foi possível salvar o pedido no banco de dados:', dbError);
        toast.error('Não foi possível salvar o pedido, mas você pode continuar via WhatsApp');
      }
      
      // Independente do resultado do banco, permite continuar para o WhatsApp
      const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${message}`;
      
      // Clear the cart and checkout data
      clearCart();
      localStorage.removeItem('checkoutIdentification');
      localStorage.removeItem('checkoutDelivery');
      localStorage.removeItem('checkoutPersonalization');
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Navigate to confirmation page
      navigate('/checkout/confirmation');
    } catch (error) {
      toast.error('Erro ao finalizar pedido. Tente novamente.');
      console.error('Error during checkout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={4} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Pagamento</h2>
          
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
                      {isSubmitting ? 'Processando...' : 'Finalizar pelo WhatsApp'}
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
