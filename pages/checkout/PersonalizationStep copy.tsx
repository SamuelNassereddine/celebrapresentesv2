
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

const PersonalizationStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    const savedOrderId = localStorage.getItem('currentOrderId');
    console.log('PersonalizationStep - Initial orderId from localStorage:', savedOrderId);
    
    if (!savedOrderId) {
      // Se não temos um ID de pedido, voltar para a primeira etapa
      console.log('PersonalizationStep - No orderId found, redirecting to step 1');
      sonnerToast.error('Por favor, complete as etapas anteriores primeiro');
      navigate('/checkout/1');
      return;
    }
    
    setOrderId(savedOrderId);
    
    // Check if we have all needed checkout data
    const identificationData = localStorage.getItem('checkoutIdentification');
    const deliveryData = localStorage.getItem('checkoutDelivery');
    
    console.log('PersonalizationStep - Checking previous steps data:');
    console.log('- identificationData:', !!identificationData);
    console.log('- deliveryData:', !!deliveryData);
    
    if (!identificationData || !deliveryData) {
      console.log('PersonalizationStep - Missing previous steps data, redirecting');
      sonnerToast.error('Por favor, complete as etapas anteriores primeiro');
      navigate('/checkout/1');
      return;
    }
    
    // Carregar mensagem existente do pedido
    const loadOrderData = async () => {
      console.log('PersonalizationStep - Loading order data for ID:', savedOrderId);
      const { data, error } = await supabase
        .from('orders')
        .select('personalization_text')
        .eq('id', savedOrderId)
        .single();
        
      if (error) {
        console.error('PersonalizationStep - Error loading order data:', error);
      }
        
      if (data && !error) {
        console.log('PersonalizationStep - Loaded data:', data);
        setMessage(data.personalization_text || '');
      }
      
      setInitialLoading(false);
    };
    
    loadOrderData();
    
    // Check for saved personalization data in localStorage as fallback
    const savedData = localStorage.getItem('checkoutPersonalization');
    if (savedData) {
      try {
        const { message: savedMessage } = JSON.parse(savedData);
        if (savedMessage) {
          console.log('PersonalizationStep - Loading message from localStorage:', savedMessage);
          setMessage(savedMessage);
        }
      } catch (err) {
        console.error('Error parsing saved personalization data:', err);
      }
    }
  }, [navigate]);
  
  const handleSubmit = async () => {
    if (!orderId) {
      console.error('PersonalizationStep - Submit attempted without orderId');
      sonnerToast.error('Erro: ID do pedido não encontrado');
      navigate('/checkout/1');
      return;
    }
    
    console.log('PersonalizationStep - Submitting with orderId:', orderId);
    console.log('PersonalizationStep - Message:', message);
    
    setLoading(true);
    
    try {
      // Atualizar o pedido no banco de dados
      const { error } = await supabase
        .from('orders')
        .update({
          personalization_text: message || null
        })
        .eq('id', orderId);
        
      if (error) {
        console.error('PersonalizationStep - Error saving message:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar a mensagem",
          description: "Por favor, tente novamente.",
        });
        setLoading(false);
        return;
      }
      
      console.log('PersonalizationStep - Message saved successfully');
      
      // Save to localStorage with more detailed information
      localStorage.setItem('checkoutPersonalization', JSON.stringify({ 
        message,
        savedAt: new Date().toISOString() 
      }));
      
      // Add a flag to indicate completion of this step
      localStorage.setItem('checkoutStep3Complete', 'true');
      
      console.log('PersonalizationStep - Data saved to localStorage');
      console.log('PersonalizationStep - Navigating to step 4');
      
      // Navigate to next step
      navigate('/checkout/4');
    } catch (error) {
      console.error('PersonalizationStep - Unhandled error:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <CheckoutSteps currentStep={3} />
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>

    );
  }
  
  return (

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={3} />
        
        {initialLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-inter font-semibold mb-6">Personalização</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2 flex items-center">
                  <span className="text-lg mr-2">📝</span> Mensagem para o cartão (opcional)
                </label>
                <Textarea 
                  id="message"
                  placeholder="Escreva uma mensagem especial que será incluída no cartão..."
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-gray-500 text-sm mt-2">
                  Limite máximo de 2000 caracteres.
                  {message && <span className="font-medium ml-1">{message.length}/2000</span>}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate('/checkout/2')}
                disabled={loading}
              >
                Voltar
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={loading || message.length > 2000}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

  );
};

export default PersonalizationStep;
