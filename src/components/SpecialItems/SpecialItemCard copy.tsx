
import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

type SpecialItem = Database['public']['Tables']['special_items']['Row'];

interface SpecialItemCardProps {
  item: SpecialItem;
}

const SpecialItemCard: React.FC<SpecialItemCardProps> = ({ item }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    addItem({
      id: `special-${item.id}`,  // Prefix ID with 'special-' to identify special items
      title: item.title,
      price: Number(item.price),
      quantity: 1,
      image: item.image_url
    });
    
    toast.success(`${item.title} adicionado ao carrinho`);
  };
  
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={item.image_url || '/placeholder.svg'} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="p-3">
        <h3 className="font-medium line-clamp-1">{item.title}</h3>
        <div className="mt-1 flex justify-between items-center">
          <span className="font-semibold">
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(Number(item.price))}
          </span>
          
          <Button 
            onClick={handleAddToCart}
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Adicionar ao carrinho</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SpecialItemCard;
