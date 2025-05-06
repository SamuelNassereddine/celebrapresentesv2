
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { X } from 'lucide-react';

const ProductAddedNotification: React.FC = () => {
  const { lastAddedItem, setLastAddedItem, isCartOpen, setIsCartOpen } = useCart();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (lastAddedItem) {
      setShowNotification(true);
      timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setLastAddedItem(null);
        }, 300); // Wait for fade out animation before removing the item
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [lastAddedItem, setLastAddedItem]);

  if (!lastAddedItem || !isCartOpen) {
    return null;
  }

  return (
    <div
      className={`fixed left-0 right-0 top-1/2 transform -translate-y-1/2 z-50 flex justify-center items-center transition-opacity duration-300 ${
        showNotification ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 mx-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Adicionado ao carrinho</h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={lastAddedItem.image}
            alt={lastAddedItem.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <p className="text-gray-900 font-medium line-clamp-2">{lastAddedItem.title}</p>
            <p className="text-gray-600">
              {lastAddedItem.quantity} x{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(lastAddedItem.price)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/cart"
            className="flex-1 py-2 bg-primary text-white rounded text-center font-medium hover:bg-primary-foreground transition-colors"
            onClick={() => setIsCartOpen(false)}
          >
            Ver carrinho
          </Link>
          <button
            onClick={() => setIsCartOpen(false)}
            className="flex-1 py-2 border border-gray-300 rounded text-center font-medium hover:bg-gray-50 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAddedNotification;
