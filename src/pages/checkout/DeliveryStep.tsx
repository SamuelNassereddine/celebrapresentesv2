
import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryTimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

const DeliveryStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [formData, setFormData] = useState({
    recipientSelf: true,
    recipientName: '',
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
  
  useEffect(() => {
    // If identification data exists, pre-populate the recipientName
    const identificationData = localStorage.getItem('checkoutIdentification');
    if (identificationData) {
      const { name } = JSON.parse(identificationData);
      setFormData(prev => ({
        ...prev,
        recipientName: name
      }));
    }
    
    // Check if there's saved delivery data
    const savedDeliveryData = localStorage.getItem('checkoutDelivery');
    if (savedDeliveryData) {
      const parsedData = JSON.parse(savedDeliveryData);
      // Set the date as a Date object
      setFormData({
        ...parsedData,
        deliveryDate: parsedData.deliveryDate ? new Date(parsedData.deliveryDate) : new Date()
      });
    }
    
    fetchDeliveryTimeSlots();
  }, []);
  
  const fetchDeliveryTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_time_slots')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setDeliveryTimeSlots(data || []);
      
      // If there's only one time slot, select it by default
      if (data && data.length === 1 && !formData.deliveryTimeSlot) {
        setFormData(prev => ({
          ...prev,
          deliveryTimeSlot: data[0].id
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
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue.length <= 8 ? formattedCep : prev[name as keyof typeof prev]
      }));
      
      // If we have 8 digits, try to fetch address automatically
      if (cleanedValue.length === 8) {
        fetchAddressByCep(cleanedValue);
      }
      
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
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.recipientSelf && !formData.recipientName.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o nome do destinatário.",
      });
      return;
    }
    
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Por favor, insira um CEP válido.",
      });
      return;
    }
    
    if (!formData.street.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o endereço.",
      });
      return;
    }
    
    if (!formData.number.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o número.",
      });
      return;
    }
    
    if (!formData.neighborhood.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o bairro.",
      });
      return;
    }
    
    if (!formData.city.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira a cidade.",
      });
      return;
    }
    
    if (!formData.state.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, insira o estado.",
      });
      return;
    }
    
    if (!formData.deliveryTimeSlot) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, selecione um horário de entrega.",
      });
      return;
    }
    
    // Store form data in localStorage
    localStorage.setItem('checkoutDelivery', JSON.stringify(formData));
    
    // Navigate to next step
    navigate('/checkout/3');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={2} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Detalhes da Entrega</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Recipient Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Destinatário</h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="recipient-self">Para mim</Label>
                    <Switch
                      id="recipient-self"
                      checked={formData.recipientSelf}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          recipientSelf: checked
                        }))
                      }
                    />
                  </div>
                </div>
                
                {!formData.recipientSelf && (
                  <div>
                    <label htmlFor="recipientName" className="block text-gray-700 mb-2">
                      Nome do Destinatário
                    </label>
                    <input
                      id="recipientName"
                      name="recipientName"
                      type="text"
                      value={formData.recipientName}
                      onChange={handleChange}
                      placeholder="Nome completo de quem vai receber"
                      className="input-field"
                      required={!formData.recipientSelf}
                    />
                  </div>
                )}
              </div>
              
              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Endereço de Entrega</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cep" className="block text-gray-700 mb-2">
                      CEP
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="cep"
                        name="cep"
                        type="text"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                        className="input-field"
                        required
                        maxLength={9}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-gray-700 mb-2">
                        Endereço
                      </label>
                      <input
                        id="street"
                        name="street"
                        type="text"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                        className="input-field"
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
                        className="input-field"
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
                      className="input-field"
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
                      className="input-field"
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
                        className="input-field"
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
                        className="input-field"
                        required
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Date & Time */}
              <div>
                <h3 className="text-lg font-medium mb-4">Data e Horário de Entrega</h3>
                <div className="space-y-4">
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
                    <Card>
                      <CardContent className="pt-6">
                        <RadioGroup value={formData.deliveryTimeSlot} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryTimeSlot: value }))}>
                          <div className="grid grid-cols-1 gap-4">
                            {deliveryTimeSlots.length > 0 ? (
                              deliveryTimeSlots.map((slot) => (
                                <div key={slot.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={slot.id} id={`slot-${slot.id}`} />
                                  <Label htmlFor={`slot-${slot.id}`} className="flex-grow">
                                    {slot.name} ({slot.start_time} - {slot.end_time})
                                  </Label>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-2 text-gray-500">
                                {loading ? "Carregando horários..." : "Nenhum horário disponível"}
                              </div>
                            )}
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
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
              
              <Button type="submit">
                Continuar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryStep;
