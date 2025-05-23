import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];
type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];
type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
type SpecialItem = Database['public']['Tables']['special_items']['Row'];

// Helper function to detect if a string is a valid UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const fetchStoreSettings = async (): Promise<StoreSettings | null> => {
  console.log("fetchStoreSettings - Starting fetch");
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }
    
    console.log("fetchStoreSettings - Retrieved data:", data);
    return data;
  } catch (error) {
    console.error('Error in fetchStoreSettings:', error);
    return null;
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
};

export const fetchProducts = async (): Promise<(Product & { images: ProductImage[] })[]> => {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');
  
  if (productsError) {
    console.error('Error fetching products:', productsError);
    return [];
  }
  
  if (!products) return [];
  
  // Fetch images for all products
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*');
  
  if (imagesError) {
    console.error('Error fetching product images:', imagesError);
    return products.map(product => ({ ...product, images: [] }));
  }
  
  // Map images to products
  return products.map(product => ({
    ...product,
    images: images?.filter(img => img.product_id === product.id) || []
  }));
};

/**
 * Fetch a product by ID (UUID) or slug
 * @param idOrSlug - Product ID (UUID format) or product slug
 * @returns Product with images or null if not found
 */
export const fetchProductById = async (idOrSlug: string): Promise<(Product & { images: ProductImage[] }) | null> => {
  console.log('fetchProductById - Input:', idOrSlug);
  
  // Detect if input is UUID or slug
  const searchByUUID = isUUID(idOrSlug);
  const searchField = searchByUUID ? 'id' : 'slug';
  
  console.log('fetchProductById - Searching by:', searchField);
  
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq(searchField, idOrSlug)
    .single();
  
  if (productError) {
    console.error('Error fetching product:', productError);
    return null;
  }
  
  if (!product) {
    console.log('Product not found for:', idOrSlug);
    return null;
  }
  
  console.log('Product found:', product);
  
  // Fetch images for the product
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id);
  
  if (imagesError) {
    console.error('Error fetching product images:', imagesError);
    return { ...product, images: [] };
  }
  
  console.log('Product images found:', images?.length || 0);
  return { ...product, images: images || [] };
};

export const fetchProductsByCategory = async (categoryId: string): Promise<(Product & { images: ProductImage[] })[]> => {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId);
  
  if (productsError) {
    console.error('Error fetching products by category:', productsError);
    return [];
  }
  
  if (!products) return [];
  
  // Fetch images for all products
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', products.map(p => p.id));
  
  if (imagesError) {
    console.error('Error fetching product images:', imagesError);
    return products.map(product => ({ ...product, images: [] }));
  }
  
  // Map images to products
  return products.map(product => ({
    ...product,
    images: images?.filter(img => img.product_id === product.id) || []
  }));
};

export const fetchDeliveryTimeSlots = async (): Promise<DeliveryTimeSlot[]> => {
  console.log('Fetching delivery time slots');
  try {
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching delivery time slots:', error);
      throw error;
    }
    
    console.log('Fetched time slots:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchDeliveryTimeSlots:', error);
    return [];
  }
};

export const createDeliveryTimeSlot = async (timeSlot: {
  name: string;
  start_time: string;
  end_time: string;
  active?: boolean;
  fee?: number;
}): Promise<DeliveryTimeSlot | null> => {
  console.log('Creating delivery time slot:', timeSlot);
  try {
    // Adicionar campo fee se não estiver presente
    const slotWithFee = {
      ...timeSlot,
      fee: timeSlot.fee !== undefined ? timeSlot.fee : 10.00 // Valor padrão se não for fornecido
    };
    
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .insert(slotWithFee)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating delivery time slot:', error);
      throw error;
    }
    
    console.log('Created time slot:', data);
    return data;
  } catch (error) {
    console.error('Error in createDeliveryTimeSlot:', error);
    throw error; // Re-throw the error for better error handling
  }
};

export const updateDeliveryTimeSlot = async (
  id: string, 
  updates: Partial<DeliveryTimeSlot>
): Promise<DeliveryTimeSlot | null> => {
  console.log('Updating delivery time slot:', id, updates);
  try {
    const { data, error } = await supabase
      .from('delivery_time_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating delivery time slot:', error);
      throw error;
    }
    
    console.log('Updated time slot:', data);
    return data;
  } catch (error) {
    console.error('Error in updateDeliveryTimeSlot:', error);
    return null;
  }
};

export const deleteDeliveryTimeSlot = async (id: string): Promise<boolean> => {
  console.log('Deleting delivery time slot:', id);
  try {
    // Primeiro, verificar se o horário está sendo usado em algum pedido
    const { data: orderData, error: orderCheckError } = await supabase
      .from('orders')
      .select('id')
      .eq('delivery_time_slot_id', id)
      .limit(1);
    
    if (orderCheckError) {
      console.error('Error checking if time slot is in use:', orderCheckError);
      throw orderCheckError;
    }
    
    // Se o horário estiver sendo usado em algum pedido, não permitir a exclusão
    if (orderData && orderData.length > 0) {
      console.error('Cannot delete time slot as it is in use by orders');
      throw new Error('Este horário não pode ser excluído porque está sendo usado em pedidos existentes');
    }
    
    // Prosseguir com a exclusão se não houver pedidos usando este horário
    const { error } = await supabase
      .from('delivery_time_slots')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting delivery time slot:', error);
      throw error;
    }
    
    console.log('Deleted time slot:', id);
    return true;
  } catch (error: any) {
    console.error('Error in deleteDeliveryTimeSlot:', error);
    throw error;
  }
};

// Função para upload de imagem de produto
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Erro no upload da imagem:', uploadError);
      return null;
    }
    
    const { data } = supabase.storage
      .from('product_images')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return null;
  }
};

// Função para upload de logo da loja
export const uploadLogoImage = async (file: File): Promise<string | null> => {
  try {
    console.log("uploadLogoImage - Starting upload for file:", file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Fazer upload do arquivo para o bucket 'logos'
    console.log("Uploading to storage bucket 'logos'...");
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('logos')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Erro no upload do logo:', uploadError);
      return null;
    }
    
    console.log("Upload successful, getting public URL...");
    
    // Obter a URL pública da imagem
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);
      
    console.log("Public URL obtained:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    return null;
  }
};

// Função para excluir imagem do storage
export const deleteProductImageFromStorage = async (url: string): Promise<boolean> => {
  try {
    // Extrai o nome do arquivo da URL
    const fileName = url.split('/').pop();
    if (!fileName) return false;
    
    const { error } = await supabase.storage
      .from('product_images')
      .remove([fileName]);
      
    if (error) {
      console.error('Erro ao excluir imagem do storage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return false;
  }
};

// Special items functions
export const fetchSpecialItems = async (): Promise<SpecialItem[]> => {
  console.log('fetchSpecialItems - Starting fetch');
  try {
    const { data, error } = await supabase
      .from('special_items')
      .select('*')
      .order('created_at');
    
    if (error) {
      console.error('Error fetching special items:', error);
      throw error;
    }
    
    console.log('fetchSpecialItems - Fetched items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchSpecialItems:', error);
    return [];
  }
};

export const createSpecialItem = async (item: {
  title: string;
  price: number;
  image_url: string;
  description?: string;
}): Promise<SpecialItem | null> => {
  const { data, error } = await supabase
    .from('special_items')
    .insert(item)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating special item:', error);
    return null;
  }
  
  return data;
};

export const updateSpecialItem = async (id: string, updates: {
  title?: string;
  price?: number;
  image_url?: string;
  description?: string;
}): Promise<SpecialItem | null> => {
  const { data, error } = await supabase
    .from('special_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating special item:', error);
    return null;
  }
  
  return data;
};

export const deleteSpecialItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('special_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting special item:', error);
    return false;
  }
  
  return true;
};

// Nova interface para dados de pedido
export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  presented_name: string | null;
  presented_phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  delivery_date: string | null;
  delivery_time_slot_id: string | null;
  personalization_text: string | null;
  total_price: number;
  status: string;
  order_number: string;
}

// Nova interface para itens do pedido
export interface OrderItemData {
  order_id?: string;
  product_id: string;
  product_title: string;
  unit_price: number;
  quantity: number;
}

// Função melhorada para salvar pedidos usando transação
export const saveOrder = async (
  orderData: OrderData,
  orderItems: Omit<OrderItemData, 'order_id'>[]
): Promise<{ success: boolean; orderId?: string; error?: any }> => {
  console.log('Iniciando salvamento do pedido com transação');

  try {
    // Inserir o pedido
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return { success: false, error: orderError };
    }

    if (!createdOrder) {
      console.error('Pedido criado, mas nenhum dado retornado');
      return { success: false, error: 'Nenhum dado retornado após criação do pedido' };
    }

    console.log('Pedido criado com sucesso:', createdOrder);

    // Preparar os itens do pedido com o ID do pedido criado
    const itemsWithOrderId = orderItems.map(item => {
      // Verificar se o product_id começa com 'special-', indicando um item especial
      const isSpecialItem = item.product_id.startsWith('special-');
      
      return {
        ...item,
        order_id: createdOrder.id,
        // Define product_id como null para itens especiais
        product_id: isSpecialItem ? null : item.product_id
      };
    });

    // Inserir os itens do pedido
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Erro ao inserir itens do pedido:', itemsError);
      
      // Em caso de erro, tenta excluir o pedido criado para manter consistência
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', createdOrder.id);
      
      if (deleteError) {
        console.error('Erro ao excluir pedido após falha:', deleteError);
      }
      
      return { success: false, error: itemsError };
    }

    console.log(`${itemsWithOrderId.length} itens do pedido salvos com sucesso`);
    return { success: true, orderId: createdOrder.id };
  } catch (error) {
    console.error('Erro não tratado ao salvar pedido:', error);
    return { success: false, error };
  }
};

// Função para buscar um pedido por ID com seus itens
export const fetchOrderWithItems = async (id: string) => {
  try {
    // Buscar o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError) throw orderError;
    
    // Buscar os itens do pedido
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    
    if (itemsError) throw itemsError;
    
    return { 
      success: true, 
      data: { 
        order, 
        items: items || [] 
      } 
    };
  } catch (error) {
    console.error('Erro ao buscar pedido com itens:', error);
    return { success: false, error };
  }
};

// Função para atualizar o status de um pedido
export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return { success: false, error };
  }
};
