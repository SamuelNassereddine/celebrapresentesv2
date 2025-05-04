
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const IdentificationStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Verificar se já existe um orderId no localStorage
  useEffect(() => {
    const savedOrderId = localStorage.getItem('currentOrderId');
    if (savedOrderId) {
      setOrderId(savedOrderId);
      
      // Carregar dados do pedido se já existir
      const loadExistingData = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('customer_name, customer_phone, customer_email')
          .eq('id', savedOrderId)
          .single();
        
        if (data && !error) {
          setFormData({
            name: data.customer_name || '',
            phone: data.customer_phone || '',
            email: data.customer_email || ''
          });
        }
      };
      
      loadExistingData();
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Apply phone mask
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length <= 11) {
        if (cleaned.length > 2) {
          formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
        }
        if (cleaned.length > 7) {
          formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        }
      }
      
      setFormData({ ...formData, phone: formatted });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const createOrUpdateOrder = async (): Promise<string | null> => {
    try {
      // Se já tiver um ID de pedido, atualiza o pedido existente
      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email || null
          })
          .eq('id', orderId);
          
        if (error) {
          console.error('Erro ao atualizar pedido:', error);
          toast({
            variant: "destructive",
            title: "Erro ao atualizar seus dados",
            description: "Por favor, tente novamente.",
          });
          return null;
        }
        
        return orderId;
      } else {
        // Caso contrário, cria um novo pedido
        const newOrderId = uuidv4();
        const orderNumber = new Date().getFullYear().toString() + 
                           Math.floor(Math.random() * 900 + 100).toString();
        
        const { error } = await supabase
          .from('orders')
          .insert({
            id: newOrderId,
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email || null,
            status: 'pending',
            total_price: 0, // Será atualizado nas próximas etapas
            order_number: orderNumber
          });
          
        if (error) {
          console.error('Erro ao criar pedido:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar seus dados",
            description: "Por favor, tente novamente.",
          });
          return null;
        }
        
        return newOrderId;
      }
    } catch (error) {
      console.error('Erro não tratado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
      });
      return null;
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar form
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira seu nome.",
      });
      setIsSubmitting(false);
      return;
    }
    
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        variant: "destructive",
        title: "Telefone inválido",
        description: "Por favor, insira um telefone válido no formato (99) 99999-9999.",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Criar ou atualizar pedido no banco
    const newOrderId = await createOrUpdateOrder();
    
    if (newOrderId) {
      // Armazenar o ID do pedido para uso nas próximas etapas
      localStorage.setItem('currentOrderId', newOrderId);
      setOrderId(newOrderId);
      
      // Armazenar dados de identificação para uso nas próximas etapas
      localStorage.setItem('checkoutIdentification', JSON.stringify(formData));
      
      // Notificar sucesso
      toast({
        title: "Dados salvos com sucesso!",
        description: "Vamos para a próxima etapa.",
      });
      
      // Navegar para a próxima etapa
      navigate('/checkout/2');
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={1} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Dados do Comprador</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2 flex items-center">
                  <span className="text-lg mr-2">👤</span> Qual seu nome?
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2 flex items-center">
                  <span className="text-lg mr-2">📱</span> Qual seu celular?
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2 flex items-center">
                  <span className="text-lg mr-2">✉️</span> Qual seu email? (opcional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default IdentificationStep;
