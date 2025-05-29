import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { saveOrderItems } from '@/utils/orderUtils';

const IdentificationStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Verificar se já existe um orderId no localStorage
  useEffect(() => {
    console.log('IdentificationStep - Component initialized');
    const savedOrderId = localStorage.getItem('currentOrderId');
    console.log('IdentificationStep - orderId from localStorage:', savedOrderId);
    
    if (savedOrderId) {
      setOrderId(savedOrderId);
      
      // Carregar dados do pedido se já existir
      const loadExistingData = async () => {
        console.log('IdentificationStep - Loading existing order data');
        const { data, error } = await supabase
          .from('orders')
          .select('customer_name, customer_phone, customer_email')
          .eq('id', savedOrderId)
          .single();
        
        if (error) {
          console.error('IdentificationStep - Error loading order data:', error);
        }
        
        if (data && !error) {
          console.log('IdentificationStep - Loaded data:', data);
          setFormData({
            name: data.customer_name || '',
            phone: data.customer_phone || '',
            email: data.customer_email || ''
          });
        }
      };
      
      loadExistingData();
    } else {
      console.log('IdentificationStep - No existing order found');
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
      console.log('IdentificationStep - Creating or updating order');
      // Se já tiver um ID de pedido, atualiza o pedido existente
      if (orderId) {
        console.log('IdentificationStep - Updating existing order:', orderId);
        const { error } = await supabase
          .from('orders')
          .update({
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email || null,
            total_price: totalPrice // Atualizar preço total com base no carrinho
          })
          .eq('id', orderId);
          
        if (error) {
          console.error('IdentificationStep - Error updating order:', error);
          toast({
            variant: "destructive",
            title: "Erro ao atualizar seus dados",
            description: "Por favor, tente novamente.",
          });
          return null;
        }
        
        console.log('IdentificationStep - Order updated successfully');
        return orderId;
      } else {
        // Caso contrário, cria um novo pedido
        console.log('IdentificationStep - Creating new order');
        const newOrderId = uuidv4();
        const orderNumber = new Date().getFullYear().toString() + 
                           Math.floor(Math.random() * 900 + 100).toString();
        
        console.log('IdentificationStep - New order ID:', newOrderId);
        console.log('IdentificationStep - Order number:', orderNumber);
        
        const { error } = await supabase
          .from('orders')
          .insert({
            id: newOrderId,
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email || null,
            status: 'pending',
            total_price: totalPrice, // Definir preço total com base no carrinho
            order_number: orderNumber
          });
          
        if (error) {
          console.error('IdentificationStep - Error creating order:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar seus dados",
            description: "Por favor, tente novamente.",
          });
          return null;
        }
        
        console.log('IdentificationStep - Order created successfully');
        return newOrderId;
      }
    } catch (error) {
      console.error('IdentificationStep - Unhandled error:', error);
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
    console.log('IdentificationStep - Form submitted');
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

    // Verificar se há itens no carrinho
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de continuar.",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Criar ou atualizar pedido no banco
    const newOrderId = await createOrUpdateOrder();
    
    if (newOrderId) {
      console.log('IdentificationStep - Saving cart items to database');
      
      // Salvar itens do carrinho no banco de dados
      const itemsSaved = await saveOrderItems(newOrderId, items);
      
      if (!itemsSaved) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar produtos",
          description: "Não foi possível salvar os produtos do carrinho.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Armazenar o ID do pedido para uso nas próximas etapas
      console.log('IdentificationStep - Saving order ID to localStorage:', newOrderId);
      localStorage.setItem('currentOrderId', newOrderId);
      setOrderId(newOrderId);
      
      // Armazenar dados de identificação para uso nas próximas etapas
      console.log('IdentificationStep - Saving identification data to localStorage');
      localStorage.setItem('checkoutIdentification', JSON.stringify(formData));
      
      // Notificar sucesso
      toast({
        title: "Dados salvos com sucesso!",
        description: "Produtos adicionados ao pedido. Vamos para a próxima etapa.",
      });
      
      // Navegar para a próxima etapa
      navigate('/checkout/2');
    }
    
    setIsSubmitting(false);
  };
  
  return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={1} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-inter font-semibold mb-6">Dados do Comprador</h2>
          
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
  );
};

export default IdentificationStep;
