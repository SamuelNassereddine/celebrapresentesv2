
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useCart } from '@/context/CartContext';
import { QrCodePix } from 'qrcode-pix';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Store settings - ideally this would come from the database
const storeSettings = {
  pixKey: '11987965672',
  pixKeyType: 'phone',
  pixReceiverName: 'Samuel Nassereddine Junior',
  pixCity: 'São Bernardo do Campo',
  whatsappNumber: '5511987965672'
};

const PaymentStep = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('pix');
  const [pixCode, setPixCode] = useState('');
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  
  useEffect(() => {
    // Generate a random order number
    const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomOrderNum.toString());
    
    // Generate PIX code and QR code
    if (totalPrice > 0) {
      generatePixCode(randomOrderNum.toString());
    }
  }, [totalPrice]);
  
  const generatePixCode = async (txid: string) => {
    try {
      setIsGeneratingPix(true);
      
      // Format the amount properly for the PIX code
      const amount = Number(totalPrice.toFixed(2));
      
      if (amount <= 0) {
        throw new Error("O valor do pagamento deve ser maior que zero");
      }
      
      console.log("Generating PIX code with parameters:", {
        version: '01',
        key: storeSettings.pixKey,
        name: storeSettings.pixReceiverName,
        city: storeSettings.pixCity,
        value: amount,
        transactionId: txid,
        message: `Pedido #${txid}`
      });
      
      // Create the QrCodePix instance based on the documentation
      const qrCodePix = QrCodePix({
        version: '01',
        key: storeSettings.pixKey,
        name: storeSettings.pixReceiverName,
        city: storeSettings.pixCity,
        value: amount,
        transactionId: txid,
        message: `Pedido #${txid}`
      });
      
      // Get the payload (PIX code for copying)
      const brCode = qrCodePix.payload();
      console.log("PIX Payload:", brCode);
      setPixCode(brCode);
      
      // Get the QR code as a base64 string
      const qrCodeBase64 = await qrCodePix.base64();
      console.log("QR Code generated successfully");
      setPixQRCode(qrCodeBase64);
    } catch (error) {
      console.error('Erro ao gerar código PIX:', error);
      toast.error('Erro ao gerar código PIX. Tente novamente.');
    } finally {
      setIsGeneratingPix(false);
    }
  };
  
  const handlePaymentMethodChange = (method: 'pix' | 'whatsapp') => {
    setPaymentMethod(method);
  };
  
  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success('Código PIX copiado para a área de transferência!');
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
    
    toast.success('Pedido confirmado! Aguardando confirmação do pagamento...');
    
    // Clear the cart and checkout data after a delay to simulate payment confirmation
    setTimeout(() => {
      clearCart();
      localStorage.removeItem('checkoutIdentification');
      localStorage.removeItem('checkoutDelivery');
      localStorage.removeItem('checkoutPersonalization');
      
      // Navigate to confirmation page
      navigate('/checkout/confirmation');
    }, 2000);
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
                <h3 className="text-lg font-medium mb-3">Pagamento via PIX</h3>
                <p className="text-gray-600 mb-4">
                  Escaneie o QR Code abaixo com o app do seu banco ou copie o código PIX para realizar o pagamento.
                </p>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    {isGeneratingPix ? (
                      <div className="flex justify-center p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : totalPrice <= 0 ? (
                      <div className="text-center p-6 text-gray-600">
                        O valor do pedido deve ser maior que zero para gerar um código PIX.
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* QR Code */}
                        {pixQRCode && (
                          <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <img 
                                src={pixQRCode} 
                                alt="QR Code PIX" 
                                className="w-40 h-40"
                                onError={(e) => {
                                  console.error("Failed to load QR Code image");
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'%3EErro ao carregar QR Code%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                            <p className="text-sm text-gray-500">Escaneie com o app do seu banco</p>
                          </div>
                        )}
                        
                        {/* PIX Copia e Cola */}
                        <div className="flex-grow w-full">
                          <h4 className="font-medium mb-2">PIX Copia e Cola</h4>
                          <div className="bg-white p-3 rounded-md mb-4 border flex">
                            <div className="flex-grow overflow-auto whitespace-nowrap font-mono text-sm p-2 text-gray-700">
                              {pixCode || 'Código PIX não disponível'}
                            </div>
                            <Button 
                              onClick={handleCopyPixCode}
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0 ml-2"
                              disabled={!pixCode}
                            >
                              Copiar
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500">
                            Copie o código e cole no app do seu banco para realizar o pagamento via PIX.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="mt-4 text-center">
                  <Button 
                    onClick={handlePixCheckout}
                    className="w-full md:w-auto"
                    disabled={isGeneratingPix || totalPrice <= 0 || !pixCode}
                  >
                    Confirmar Pagamento
                  </Button>
                </div>
              </div>
            )}
            
            {paymentMethod === 'whatsapp' && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Ao clicar no botão abaixo, você será redirecionado para o WhatsApp para finalizar seu pedido.
                </p>
                <Button 
                  onClick={handleWhatsAppCheckout}
                  className="w-full md:w-auto"
                >
                  Finalizar pelo WhatsApp
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-start">
            <Button 
              variant="outline"
              onClick={() => navigate('/checkout/3')}
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
