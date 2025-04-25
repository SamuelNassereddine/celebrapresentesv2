
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Check } from 'lucide-react';

const ProductAddedNotification = () => {
  const { lastAddedItem, setLastAddedItem, setIsCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastAddedItem) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setLastAddedItem(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem, setLastAddedItem]);

  if (!lastAddedItem || !isVisible) return null;

  return (
    <div className="fixed inset-x-4 top-20 md:top-24 md:right-4 md:left-auto md:max-w-md z-50 bg-white p-4 rounded-md shadow-lg animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 p-1 rounded-full">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="font-medium text-lg">Item adicionado ao carrinho</h3>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            setLastAddedItem(null);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <p className="text-gray-600 text-sm mb-3">{lastAddedItem.title} foi adicionado ao seu carrinho</p>
      
      <div className="flex mb-4 items-center space-x-3">
        <img 
          src={lastAddedItem.image} 
          alt={lastAddedItem.title}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h4 className="font-medium">{lastAddedItem.title}</h4>
          <p className="text-primary-foreground font-medium">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
              .format(lastAddedItem.price)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button 
          onClick={() => {
            setIsCartOpen(true);
            setIsVisible(false);
          }}
          className="btn-primary w-full flex justify-center items-center"
        >
          Ver carrinho
        </button>
        <button 
          onClick={() => {
            setIsVisible(false);
            setLastAddedItem(null);
          }}
          className="btn-secondary w-full"
        >
          Continuar comprando
        </button>
      </div>
    </div>
  );
};

export default ProductAddedNotification;
