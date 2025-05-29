
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/context/CartContext';

export const saveOrderItems = async (orderId: string, items: CartItem[]): Promise<boolean> => {
  try {
    console.log('saveOrderItems - Adding items to order:', items.length, 'items');
    
    // Remover itens existentes do pedido (se houver)
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
      
    if (deleteError) {
      console.error('saveOrderItems - Error deleting existing items:', deleteError);
    }
    
    // Adicionar os itens do carrinho ao pedido
    const orderItems = items.map(item => {
      // Verifica se é um produto especial (começando com 'special-')
      const isSpecialItem = item.id.startsWith('special-');
      
      return {
        order_id: orderId,
        product_title: item.title,
        unit_price: item.price,
        quantity: item.quantity,
        // Define product_id como null para itens especiais
        product_id: isSpecialItem ? null : item.id
      };
    });
    
    console.log('saveOrderItems - Items to add:', orderItems);
    
    if (orderItems.length > 0) {
      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (error) {
        console.error('saveOrderItems - Error adding items to order:', error);
        return false;
      }
      
      console.log('saveOrderItems - Items added successfully');
    }
    
    return true;
  } catch (error) {
    console.error('saveOrderItems - Unhandled error adding items:', error);
    return false;
  }
};
