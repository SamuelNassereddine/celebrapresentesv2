
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
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
    if (!savedOrderId) {
      // Se não temos um ID de pedido, voltar para a primeira etapa
      sonnerToast.error('Por favor, complete as etapas anteriores primeiro');
      navigate('/checkout/1');
      return;
    }
    
    setOrderId(savedOrderId);
    
    // Carregar mensagem existente do pedido
    const loadOrderData = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('personalization_text')
        .eq('id', savedOrderId)
        .single();
        
      if (data && !error) {
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
          setMessage(savedMessage);
        }
      } catch (err) {
        console.error('Error parsing saved personalization data:', err);
      }
    }
  }, [navigate]);
  
  const handleSubmit = async () => {
    if (!orderId) {
      sonnerToast.error('Erro: ID do pedido não encontrado');
      navigate('/checkout/1');
      return;
    }
    
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
        console.error('Erro ao salvar mensagem de personalização:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar a mensagem",
          description: "Por favor, tente novamente.",
        });
        setLoading(false);
        return;
      }
      
      // Save to localStorage
      localStorage.setItem('checkoutPersonalization', JSON.stringify({ message }));
      
      // Navigate to next step
      navigate('/checkout/4');
    } catch (error) {
      console.error('Erro não tratado:', error);
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
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <CheckoutSteps currentStep={3} />
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
        <CheckoutSteps currentStep={3} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Personalização</h2>
          
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
                Limite máximo de 200 caracteres.
                {message && <span className="font-medium ml-1">{message.length}/200</span>}
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
              disabled={loading || message.length > 200}
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
      </div>
    </Layout>
  );
};

export default PersonalizationStep;
