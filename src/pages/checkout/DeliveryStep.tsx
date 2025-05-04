
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useToast } from '@/hooks/use-toast';
import { fetchDeliveryTimeSlots } from '@/services/api';
import { Database } from '@/integrations/supabase/types';

type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];

const DeliveryStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recipient: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    deliveryDate: '',
    deliveryTimeSlotId: ''
  });
  
  useEffect(() => {
    // Check if identification step was completed
    const identificationData = localStorage.getItem('checkoutIdentification');
    if (!identificationData) {
      navigate('/checkout/1');
      return;
    }
    
    // Load delivery time slots from Supabase
    const loadDeliveryTimeSlots = async () => {
      setLoading(true);
      const slots = await fetchDeliveryTimeSlots();
      setDeliveryTimeSlots(slots);
      setLoading(false);
    };
    
    loadDeliveryTimeSlots();
  }, [navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const searchCEP = async () => {
    const cep = formData.zipcode.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      toast({
        variant: "destructive",
        title: "CEP inválido",
        description: "Por favor, insira um CEP válido com 8 dígitos.",
      });
      return;
    }
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Não foi possível encontrar o endereço para o CEP informado.",
        });
        return;
      }
      
      setFormData({
        ...formData,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o CEP. Tente novamente mais tarde.",
      });
    }
  };
  
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Apply CEP mask: 00000-000
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 5) {
      formatted = `${cleaned.substring(0, 5)}-${cleaned.substring(5, 8)}`;
    }
    
    setFormData({ ...formData, zipcode: formatted });
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.recipient ||
        !formData.street ||
        !formData.number ||
        !formData.neighborhood ||
        !formData.city ||
        !formData.state ||
        !formData.zipcode ||
        !formData.deliveryDate ||
        !formData.deliveryTimeSlotId
    ) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
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
      <div className="container mx-auto px-4 py-8 max-w-3xl mb-16">
        <CheckoutSteps currentStep={2} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Entrega</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="recipient" className="block text-gray-700 mb-2">
                  Nome de quem vai receber
                </label>
                <input
                  id="recipient"
                  name="recipient"
                  type="text"
                  value={formData.recipient}
                  onChange={handleChange}
                  placeholder="Quem vai receber a entrega"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-1">
                  <label htmlFor="zipcode" className="block text-gray-700 mb-2">
                    CEP
                  </label>
                  <div className="flex">
                    <input
                      id="zipcode"
                      name="zipcode"
                      type="text"
                      value={formData.zipcode}
                      onChange={handleCEPChange}
                      placeholder="00000-000"
                      className="input-field rounded-r-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={searchCEP}
                      className="bg-gray-200 px-3 rounded-r-md hover:bg-gray-300 border border-gray-300"
                    >
                      Buscar
                    </button>
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
                    placeholder="Rua, Avenida, etc"
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
                    placeholder="Nº"
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
                  placeholder="Apartamento, bloco, etc"
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
              </div>
              
              <div>
                <label htmlFor="deliveryDate" className="block text-gray-700 mb-2">
                  Data de entrega
                </label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="deliveryTimeSlotId" className="block text-gray-700 mb-2">
                  Horário de entrega
                </label>
                {loading ? (
                  <p>Carregando horários disponíveis...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deliveryTimeSlots.map((slot) => (
                      <label 
                        key={slot.id} 
                        className={`border p-4 rounded-md cursor-pointer hover:bg-gray-50 ${
                          formData.deliveryTimeSlotId === slot.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryTimeSlotId"
                          value={slot.id}
                          checked={formData.deliveryTimeSlotId === slot.id}
                          onChange={handleChange}
                          className="sr-only"
                          required
                        />
                        <div className="text-center">
                          <p className="font-medium">{slot.name}</p>
                          <p className="text-sm text-gray-600">{slot.start_time} - {slot.end_time}</p>
                          <p className="text-sm font-medium text-primary-foreground mt-1">
                            + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(slot.fee))}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row gap-4 md:gap-6">
              <button 
                type="button"
                onClick={() => navigate('/checkout/1')}
                className="btn-outline md:flex-1"
              >
                Voltar
              </button>
              <button type="submit" className="btn-primary md:flex-1">
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryStep;
