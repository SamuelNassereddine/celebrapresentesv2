
import { Link } from 'react-router-dom';

interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, name: 'Identificação' },
  { number: 2, name: 'Entrega' },
  { number: 3, name: 'Personalização' },
  { number: 4, name: 'Pagamento' }
];

const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <Link to="/cart" className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Voltar para o carrinho</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">Checkout</h1>
      </div>
      
      <div className="mt-8 flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center 
                ${step.number === currentStep 
                  ? 'bg-primary text-gray-800 font-medium' 
                  : step.number < currentStep 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-gray-200 text-gray-600'
                }`}
            >
              {step.number}
            </div>
            <span className="mt-2 text-center text-sm">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
