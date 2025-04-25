
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useCart } from '@/context/CartContext';

// Mock store settings
const storeSettings = {
  pixEnabled: true,
  pixKey: 'store@example.com',
  whatsappNumber: '5500000000000'
};

// In a production app, this would generate a real PIX code with the store's key and the order amount
const generatePixCode = (pixKey: string, amount: number): string => {
  // This is a simplified mock, in a real app you'd implement the actual PIX code generation
  return `00020101021126580014br.gov.bcb.pix0114${pixKey}520400005303986540${amount}5802BR5913Flor e Cia6008Sao Paulo62070503***63041234`;
};

const PaymentStep = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('whatsapp');
  const [pixCode, setPixCode] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNum.toString());
    
    // Generate PIX code
    if (storeSettings.pixEnabled) {
      const code = generatePixCode(storeSettings.pixKey, totalPrice);
      setPixCode(code);
    }
  }, [totalPrice]);
  
  const handlePaymentMethodChange = (method: 'pix' | 'whatsapp') => {
    setPaymentMethod(method);
  };
  
  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado para a área de transferência!');
  };
  
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
    data.items.forEach((item: any) => {
      message += `${item.quantity}x ${item.title} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}\n`;
    });
    message += `\n*Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalPrice)}*`;
    
    return encodeURIComponent(message);
  };
  
  const handleWhatsAppCheckout = () => {
    const message = formatWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${message}`;
    
    // In a production app, you'd save the order to the database here
    
    // Clear the cart and checkout data
    clearCart();
    localStorage.removeItem('checkoutIdentification');
    localStorage.removeItem('checkoutDelivery');
    localStorage.removeItem('checkoutPersonalization');
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Navigate to confirmation page
    navigate('/checkout/confirmation');
  };
  
  const handlePixCheckout = () => {
    // In a production app, you'd save the order to the database here
    
    // Clear the cart and checkout data after a delay to simulate payment confirmation
    setTimeout(() => {
      clearCart();
      localStorage.removeItem('checkoutIdentification');
      localStorage.removeItem('checkoutDelivery');
      localStorage.removeItem('checkoutPersonalization');
      
      // Navigate to confirmation page
      navigate('/checkout/confirmation');
    }, 5000);
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
              <h3 className="text-lg font-medium mb-3">Método de pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeSettings.pixEnabled && (
                  <button 
                    type="button"
                    onClick={() => handlePaymentMethodChange('pix')}
                    className={`p-4 border rounded-md text-center flex flex-col items-center justify-center ${
                      paymentMethod === 'pix' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <span className="font-medium">PIX</span>
                    <span className="text-sm text-gray-500">Pagamento instantâneo</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => handlePaymentMethodChange('whatsapp')}
                  className={`p-4 border rounded-md text-center flex flex-col items-center justify-center ${
                    paymentMethod === 'whatsapp' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">📱</div>
                  <span className="font-medium">WhatsApp</span>
                  <span className="text-sm text-gray-500">Finalizar pedido pelo WhatsApp</span>
                </button>
              </div>
            </div>
            
            {paymentMethod === 'pix' && (
              <div>
                <h3 className="text-lg font-medium mb-3">PIX Copia e Cola</h3>
                <p className="text-gray-600 mb-4">
                  Copie o código abaixo e utilize no aplicativo do seu banco para realizar o pagamento via PIX.
                </p>
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-grow overflow-auto whitespace-nowrap font-mono text-sm p-2">
                      {pixCode}
                    </div>
                    <button 
                      onClick={handleCopyPixCode}
                      className="ml-2 bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 whitespace-nowrap"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <button 
                    onClick={handlePixCheckout}
                    className="btn-primary"
                  >
                    Confirmar Pagamento
                  </button>
                </div>
              </div>
            )}
            
            {paymentMethod === 'whatsapp' && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Ao clicar no botão abaixo, você será redirecionado para o WhatsApp para finalizar seu pedido.
                </p>
                <button 
                  onClick={handleWhatsAppCheckout}
                  className="btn-primary"
                >
                  Finalizar pelo WhatsApp
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-start">
            <button 
              type="button" 
              onClick={() => navigate('/checkout/3')}
              className="btn-secondary"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStep;
