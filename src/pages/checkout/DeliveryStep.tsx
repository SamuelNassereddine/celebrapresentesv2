
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';
import { useToast } from '@/hooks/use-toast';

// Mock time slots - would come from API in a real app
const mockTimeSlots = [
  { id: '1', time: '08:00 - 12:00' },
  { id: '2', time: '12:00 - 15:00' },
  { id: '3', time: '15:00 - 18:00' },
  { id: '4', time: '18:00 - 20:00' },
];

const DeliveryStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
    deliveryDate: '',
    deliveryTimeSlot: '',
  });

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutDelivery');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for CEP (zipcode) field
    if (name === 'cep') {
      // Clean up any non-digits
      const cleanedValue = value.replace(/\D/g, '');
      
      // Format as #####-###
      let formattedCep = cleanedValue;
      if (cleanedValue.length > 5) {
        formattedCep = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 8)}`;
      }
      
      setFormData({ ...formData, [name]: formattedCep });
      
      // If we have 8 digits, search for the address
      if (cleanedValue.length === 8) {
        searchCep(cleanedValue);
      }
      
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSelf = e.target.value === 'self';
    setFormData({
      ...formData,
      recipientSelf: isSelf,
      recipientName: isSelf ? '' : formData.recipientName,
    });
  };
  
  const searchCep = async (cep: string) => {
    try {
      setLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o CEP. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.recipientSelf && !formData.recipientName) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do destinatário.",
      });
      return;
    }
    
    if (!formData.cep || !formData.street || !formData.number || !formData.city || !formData.state) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios do endereço.",
      });
      return;
    }
    
    if (!formData.deliveryDate) {
      toast({
        variant: "destructive",
        title: "Data de entrega",
        description: "Por favor, selecione uma data de entrega.",
      });
      return;
    }
    
    if (!formData.deliveryTimeSlot) {
      toast({
        variant: "destructive",
        title: "Horário de entrega",
        description: "Por favor, selecione um horário de entrega.",
      });
      return;
    }
    
    // Store form data in localStorage
    localStorage.setItem('checkoutDelivery', JSON.stringify(formData));
    
    // Navigate to next step
    navigate('/checkout/3');
  };
  
  // Get today's date in YYYY-MM-DD format for the date input min attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={2} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Informações de Entrega</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Recipient Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Quem vai receber?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="self"
                      name="recipient"
                      value="self"
                      checked={formData.recipientSelf}
                      onChange={handleRecipientChange}
                      className="mr-2"
                    />
                    <label htmlFor="self">Eu mesmo vou receber</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="other"
                      name="recipient"
                      value="other"
                      checked={!formData.recipientSelf}
                      onChange={handleRecipientChange}
                      className="mr-2"
                    />
                    <label htmlFor="other">Outra pessoa receberá</label>
                  </div>
                  
                  {!formData.recipientSelf && (
                    <div className="mt-3">
                      <label htmlFor="recipientName" className="block text-gray-700 mb-1">
                        Nome do destinatário
                      </label>
                      <input
                        id="recipientName"
                        name="recipientName"
                        type="text"
                        value={formData.recipientName}
                        onChange={handleChange}
                        placeholder="Nome do destinatário"
                        className="input-field"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Address Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Endereço de entrega</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cep" className="block text-gray-700 mb-1">
                      CEP para entrega
                    </label>
                    <div className="relative">
                      <input
                        id="cep"
                        name="cep"
                        type="text"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="Digite o CEP"
                        className="input-field"
                        maxLength={9}
                        required
                      />
                      {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="street" className="block text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.street}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="number" className="block text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        id="number"
                        name="number"
                        type="text"
                        value={formData.number}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="complement" className="block text-gray-700 mb-1">
                        Complemento (opcional)
                      </label>
                      <input
                        id="complement"
                        name="complement"
                        type="text"
                        value={formData.complement}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="neighborhood" className="block text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      id="neighborhood"
                      name="neighborhood"
                      type="text"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Time Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Data e horário de entrega</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deliveryDate" className="block text-gray-700 mb-1">
                      Data de entrega
                    </label>
                    <input
                      id="deliveryDate"
                      name="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      min={today}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="deliveryTimeSlot" className="block text-gray-700 mb-1">
                      Horário de entrega
                    </label>
                    <select
                      id="deliveryTimeSlot"
                      name="deliveryTimeSlot"
                      value={formData.deliveryTimeSlot}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione um horário</option>
                      {mockTimeSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {slot.time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                type="button" 
                onClick={() => navigate('/checkout/1')}
                className="btn-secondary"
              >
                Voltar
              </button>
              <button type="submit" className="btn-primary">
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
