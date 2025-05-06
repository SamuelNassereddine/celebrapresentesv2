
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        <Button 
          variant="ghost"
          asChild
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/10 p-0"
        >
          <Link to="/cart" className="flex items-center space-x-1">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar para o carrinho</span>
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-playfair font-semibold">Checkout</h1>
      </div>
      
      <div className="mt-8 flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm
                ${step.number === currentStep 
                  ? 'bg-primary text-primary-foreground font-medium' 
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
