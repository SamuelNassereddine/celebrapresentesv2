import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];
type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];
type StoreSettings = Database['public']['Tables']['store_settings']['Row'];
type SpecialItem = Database['public']['Tables']['special_items']['Row'];

export const fetchStoreSettings = async (): Promise<StoreSettings | null> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
  
  return data;
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

export const fetchProductById = async (id: string): Promise<(Product & { images: ProductImage[] }) | null> => {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (productError) {
    console.error('Error fetching product:', productError);
    return null;
  }
  
  if (!product) return null;
  
  // Fetch images for the product
  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', id);
  
  if (imagesError) {
    console.error('Error fetching product images:', imagesError);
    return { ...product, images: [] };
  }
  
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
  const { data, error } = await supabase
    .from('delivery_time_slots')
    .select('*')
    .eq('active', true);
  
  if (error) {
    console.error('Error fetching delivery time slots:', error);
    return [];
  }
  
  return data || [];
};

// Função para upload de imagem
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

// New functions for special items
export const fetchSpecialItems = async (): Promise<SpecialItem[]> => {
  const { data, error } = await supabase
    .from('special_items')
    .select('*');
  
  if (error) {
    console.error('Error fetching special items:', error);
    return [];
  }
  
  return data || [];
};

export const createSpecialItem = async (item: Omit<SpecialItem, 'id' | 'created_at' | 'updated_at'>): Promise<SpecialItem | null> => {
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

export const updateSpecialItem = async (id: string, updates: Partial<Omit<SpecialItem, 'id' | 'created_at' | 'updated_at'>>): Promise<SpecialItem | null> => {
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
