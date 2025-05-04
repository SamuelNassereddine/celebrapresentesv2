
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductImage = Database['public']['Tables']['product_images']['Row'];
type DeliveryTimeSlot = Database['public']['Tables']['delivery_time_slots']['Row'];
type StoreSettings = Database['public']['Tables']['store_settings']['Row'];

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
