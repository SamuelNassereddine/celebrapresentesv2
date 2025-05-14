
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

const ProductCard = ({ id, title, price, imageUrl }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      title,
      price,
      quantity: 1,
      image: imageUrl
    });
    
    toast({
      title: "Produto adicionado",
      description: `${title} foi adicionado ao seu carrinho`,
    });
  };

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300 h-full flex flex-col">
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          
          {/* Quick add button */}
          <div className="absolute bottom-3 right-3 opacity-100 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={handleQuickAddToCart}
              size="sm"
              className="rounded-full w-10 h-10 p-0 bg-white text-black shadow-md btnaddtocart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-gray-800 font-medium text-lg mb-1 line-clamp-2 h-14">{title}</h3>
          <p className="text-primary-foreground font-semibold mt-auto">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
              .format(price)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
