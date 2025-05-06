import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { fetchDeliveryTimeSlots } from '@/services/api';

interface DeliveryTimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

const DeliveryStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipientSelf: true,
    recipientName: '',
    recipientPhone: '',
    presentedName: '',
    presentedPhone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    deliveryDate: new Date(),
    deliveryTimeSlot: ''
  });
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  
  useEffect(() => {
    // Verificar se temos um ID de pedido
    const savedOrderId = localStorage.getItem('currentOrderId');
    if (!savedOrderId) {
      // Se não temos um ID de pedido, voltar para a primeira etapa
      sonnerToast.error('Por favor, complete a etapa de identificação primeiro');
      navigate('/checkout/1');
      return;
    }
    
    setOrderId(savedOrderId);
    
    // Carregar dados do pedido existente
    const loadOrderData = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', savedOrderId)
        .single();
        
      if (orderError || !orderData) {
        console.error('Erro ao carregar dados do pedido:', orderError);
        sonnerToast.error('Erro ao carregar dados do pedido');
        navigate('/checkout/1');
        return;
      }
      
      // Preencher dados do cliente
      setBuyerName(orderData.customer_name);
      setBuyerPhone(orderData.customer_phone);
      
      // Preencher dados de entrega se existirem
      if (orderData.recipient_name || orderData.address_street) {
        setFormData(prev => ({
          ...prev,
          recipientSelf: orderData.recipient_name === orderData.customer_name,
          recipientName: orderData.recipient_name || '',
          recipientPhone: orderData.recipient_phone || '',
          presentedName: orderData.presented_name || '',
          presentedPhone: orderData.presented_phone || '',
          street: orderData.address_street || '',
          number: orderData.address_number || '',
          complement: orderData.address_complement || '',
          neighborhood: orderData.address_neighborhood || '',
          city: orderData.address_city || '',
          state: orderData.address_state || '',
          cep: orderData.address_zipcode || '',
          deliveryTimeSlot: orderData.delivery_time_slot_id || '',
          deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : new Date()
        }));
      } else {
        // Se a opção "recipientSelf" está marcada como verdadeira, preencher com dados do comprador
        // Caso contrário, deixar em branco para o usuário preencher manualmente
        setFormData(prev => ({
          ...prev,
          recipientName: prev.recipientSelf ? buyerName : '',
          recipientPhone: prev.recipientSelf ? buyerPhone : '',
        }));
        
        // Check if there's saved delivery data
        const savedDeliveryData = localStorage.getItem('checkoutDelivery');
        if (savedDeliveryData) {
          const parsedData = JSON.parse(savedDeliveryData);
          // Set the date as a Date object
          setFormData(prevData => ({
            ...prevData,
            ...parsedData,
            recipientName: parsedData.recipientSelf ? buyerName : parsedData.recipientName,
            recipientPhone: parsedData.recipientSelf ? buyerPhone : parsedData.recipientPhone,
            deliveryDate: parsedData.deliveryDate ? new Date(parsedData.deliveryDate) : new Date()
          }));
        }
      }
    };
    
    loadOrderData();
    loadDeliveryTimeSlots();
  }, [navigate, buyerName, buyerPhone]);
  
  // Efeito para atualizar os dados de destinatário quando recipientSelf muda
  useEffect(() => {
    if (formData.recipientSelf) {
      setFormData(prev => ({
        ...prev,
        recipientName: buyerName,
        recipientPhone: buyerPhone,
        // Limpar campos do presenteado quando a opção "Eu mesmo vou receber" é selecionada
        presentedName: '',
        presentedPhone: '',
      }));
    } else {
      // Limpar os campos quando selecionar "Presente para outra pessoa"
      setFormData(prev => ({
        ...prev,
        recipientName: '',
        recipientPhone: '',
      }));
    }
  }, [formData.recipientSelf, buyerName, buyerPhone]);
  
  const loadDeliveryTimeSlots = async () => {
    try {
      const timeSlots = await fetchDeliveryTimeSlots();
      setDeliveryTimeSlots(timeSlots);
      
      // If there's only one time slot, select it by default
      if (timeSlots.length === 1 && !formData.deliveryTimeSlot) {
        setFormData(prev => ({
          ...prev,
          deliveryTimeSlot: timeSlots[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching delivery time slots:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os horários de entrega.",
      });
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For CEP field, apply the mask and try to fetch address
    if (name === 'cep') {
      // Remove non-digits and apply mask
      const cleanedValue = value.replace(/\D/g, '');
      const formattedCep = cleanedValue.replace(/^(\d{5})(\d{3})$/, '$1-$2');
      
      // Fixed: Ensure we're only updating with a string value
      setFormData(prev => ({
        ...prev,
        cep: cleanedValue.length <= 8 ? formattedCep : prev.cep
      }));
      
      // If we have 8 digits, try to fetch address automatically
      if (cleanedValue.length === 8) {
        fetchAddressByCep(cleanedValue);
      }
      
      return;
    }
    
    // For phone field, apply mask
    if (name === 'recipientPhone' || name === 'presentedPhone') {
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
      
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const fetchAddressByCep = async (cep: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP informado.",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state
      }));
    } catch (error) {
      console.error('Error fetching address by CEP:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível buscar o endereço pelo CEP.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderWithDeliveryData = async () => {
    if (!orderId) return false;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          recipient_name: formData.recipientSelf ? buyerName : formData.recipientName,
          recipient_phone: formData.recipientSelf ? buyerPhone : formData.recipientPhone,
          presented_name: formData.recipientSelf ? null : formData.presentedName,
          presented_phone: formData.recipientSelf ? null : formData.presentedPhone,
          address_street: formData.street,
          address_number: formData.number,
          address_complement: formData.complement || null,
          address_neighborhood: formData.neighborhood,
          address_city: formData.city,
          address_state: formData.state,
          address_zipcode: formData.cep,
          delivery_date: formData.deliveryDate.toISOString(),
          delivery_time_slot_id: formData.deliveryTimeSlot
        })
        .eq('id', orderId);
        
      if (error) {
        console.error('Erro ao atualizar dados de entrega:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar dados de entrega",
          description: "Por favor, tente novamente.",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro não tratado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
      });
      return false;
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!formData.recipientSelf && !formData.presentedName.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o nome do presenteado.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.recipientSelf && !formData.presentedPhone) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o telefone do presenteado.",
      });
      setLoading(false);
      return;
    }
    
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!formData.recipientSelf && formData.presentedPhone && !phoneRegex.test(formData.presentedPhone)) {
      toast({
        variant: "destructive",
        title: "Telefone do presenteado inválido",
        description: "Por favor, insira um telefone válido no formato (99) 99999-9999.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Por favor, insira um CEP válido.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.street.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o endereço.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.number.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o número.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.neighborhood.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o bairro.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.city.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira a cidade.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.state.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o estado.",
      });
      setLoading(false);
      return;
    }
    
    if (!formData.deliveryTimeSlot) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, selecione um horário de entrega.",
      });
      setLoading(false);
      return;
    }
    
    // Atualizar o pedido com os dados de entrega
    const success = await updateOrderWithDeliveryData();
    
    if (success) {
      // Store form data in localStorage
      localStorage.setItem('checkoutDelivery', JSON.stringify(formData));
      
      // Navigate to next step
      navigate('/checkout/3');
    }
    
    setLoading(false);
  };
  
  // Função para selecionar um horário de entrega
  const handleTimeSlotSelect = (slotId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryTimeSlot: slotId
    }));
  };
  
  // Find the selected time slot
  const selectedTimeSlot = deliveryTimeSlots.find(
    slot => slot.id === formData.deliveryTimeSlot
  );
  
  return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep={2} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-playfair font-semibold mb-6">Dados de Entrega</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Recipient Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Quem receberá o presente?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, recipientSelf: true }))}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          formData.recipientSelf 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Eu mesmo vou receber
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, recipientSelf: false }))}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          !formData.recipientSelf 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Presente para outra pessoa
                      </button>
                    </div>
                    
                    {!formData.recipientSelf && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="presentedName" className="block text-gray-700 mb-2">
                            Nome do Presenteado
                          </label>
                          <input
                            id="presentedName"
                            name="presentedName"
                            type="text"
                            value={formData.presentedName}
                            onChange={handleChange}
                            placeholder="Nome completo de quem está sendo presenteado"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required={!formData.recipientSelf}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="presentedPhone" className="block text-gray-700 mb-2">
                            Telefone do Presenteado
                          </label>
                          <input
                            id="presentedPhone"
                            name="presentedPhone"
                            type="tel"
                            value={formData.presentedPhone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required={!formData.recipientSelf}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Endereço de Entrega</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cep" className="block text-gray-700 mb-2">
                          CEP para entrega
                        </label>
                        <div className="flex space-x-2">
                          <div className="relative w-full">
                            <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                            <input
                              id="cep"
                              name="cep"
                              type="text"
                              value={formData.cep}
                              onChange={handleChange}
                              placeholder="Digite o CEP"
                              className="w-full border pl-10 border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                              maxLength={9}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="street" className="block text-gray-700 mb-2">
                            Rua
                          </label>
                          <input
                            id="street"
                            name="street"
                            type="text"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="Rua, Avenida, etc."
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="number" className="block text-gray-700 mb-2">
                            Número
                          </label>
                          <input
                            id="number"
                            name="number"
                            type="text"
                            value={formData.number}
                            onChange={handleChange}
                            placeholder="Número"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="complement" className="block text-gray-700 mb-2">
                          Complemento (opcional)
                        </label>
                        <input
                          id="complement"
                          name="complement"
                          type="text"
                          value={formData.complement}
                          onChange={handleChange}
                          placeholder="Apartamento, bloco, etc."
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="neighborhood" className="block text-gray-700 mb-2">
                          Bairro
                        </label>
                        <input
                          id="neighborhood"
                          name="neighborhood"
                          type="text"
                          value={formData.neighborhood}
                          onChange={handleChange}
                          placeholder="Bairro"
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-gray-700 mb-2">
                            Cidade
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Cidade"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="state" className="block text-gray-700 mb-2">
                            Estado
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Estado"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Date & Time */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Data e Hora da Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Data de Entrega
                        </label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.deliveryDate ? (
                                format(formData.deliveryDate, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.deliveryDate}
                              onSelect={(date) => {
                                if (date) {
                                  setFormData(prev => ({ ...prev, deliveryDate: date }));
                                  setCalendarOpen(false);
                                }
                              }}
                              initialFocus
                              disabled={(date) => 
                                date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                                date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Horário de Entrega
                        </label>
                        <div className="space-y-3">
                          {deliveryTimeSlots.length > 0 ? (
                            deliveryTimeSlots.map(slot => (
                              <Card 
                                key={slot.id} 
                                className={`cursor-pointer border transition-all ${
                                  formData.deliveryTimeSlot === slot.id 
                                    ? 'border-primary ring-1 ring-primary'
                                    : 'hover:border-gray-300'
                                }`}
                                onClick={() => handleTimeSlotSelect(slot.id)}
                              >
                                <CardContent className="flex items-center justify-between p-4">
                                  <div className="flex items-center space-x-2">
                                    <input 
                                      type="radio" 
                                      id={`slot-${slot.id}`}
                                      name="deliveryTimeSlot"
                                      value={slot.id}
                                      checked={formData.deliveryTimeSlot === slot.id}
                                      onChange={() => handleTimeSlotSelect(slot.id)}
                                      className="h-4 w-4 text-primary"
                                    />
                                    <div>
                                      <p className="font-medium">{slot.name}</p>
                                      <p className="text-sm text-gray-500 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {slot.start_time} - {slot.end_time}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">Nenhum horário disponível</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={() => navigate('/checkout/1')}
                  >
                    Voltar
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Continuar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary Section - Right column */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-playfair font-semibold mb-4">Resumo do Pedido</h2>
              <p className="text-gray-500 text-sm mb-4">{items.length} itens no seu carrinho</p>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex space-x-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(Number(item.price))}
                        </p>
                      </div>
                      
                      {/* Display "Adicional" tag for special items */}
                      {item.id.includes('special-') && (
                        <span className="text-xs text-red-500">Adicional</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(totalPrice)}
                  </p>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-semibold">
                  <p>Total</p>
                  <p>
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(totalPrice)}
                  </p>
                </div>
              </div>
              
              {/* Information about the buyer */}
              {buyerName && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700">Informações do pedido:</p>
                  <p className="text-sm font-medium">Comprador: {buyerName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default DeliveryStep;
