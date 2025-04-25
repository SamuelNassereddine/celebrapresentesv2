
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import CheckoutSteps from '@/components/Checkout/CheckoutSteps';

const PersonalizationStep = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  
  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutPersonalization');
    if (savedData) {
      setMessage(JSON.parse(savedData).message || '');
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store form data in localStorage
    localStorage.setItem('checkoutPersonalization', JSON.stringify({ message }));
    
    // Navigate to next step
    navigate('/checkout/4');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <CheckoutSteps currentStep={3} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Personalização</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Mensagem do cartão (opcional)</h3>
                <p className="text-gray-600 mb-4">
                  Adicione uma mensagem especial que acompanhará seu presente.
                </p>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={handleChange}
                  placeholder="Ex: Feliz aniversário! Com carinho, [Seu nome]"
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                type="button" 
                onClick={() => navigate('/checkout/2')}
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

export default PersonalizationStep;
