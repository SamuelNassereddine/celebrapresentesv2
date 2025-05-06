
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Confirmation = () => {
  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Clear all checkout related data from localStorage
    console.log('Confirmation - Cleaning up checkout data from localStorage');
    localStorage.removeItem('currentOrderId');
    localStorage.removeItem('checkoutIdentification');
    localStorage.removeItem('checkoutDelivery');
    localStorage.removeItem('checkoutPersonalization');
    localStorage.removeItem('checkoutStep3Complete');
    
    // Note: We don't clear the cart because it's already cleared in the PaymentStep
  }, []);
  
  return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-playfair font-semibold mb-4">
            Pedido Recebido!
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Seu pedido foi enviado com sucesso. Em breve entraremos em contato para confirmar os detalhes.
          </p>
          
          <Link
    to="/"
    className="inline-block bg-[#25D366] text-white py-2 px-4 rounded-md transition duration-200 hover:bg-[#1EAF5B]"
>
    Voltar para a Página Inicial
</Link>
        </div>
      </div>
  );
};

export default Confirmation;
