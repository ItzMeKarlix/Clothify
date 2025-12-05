import { createClient, } from '@supabase/supabase-js';
import type { Product, ProductInsert, ProductUpdate, Order, OrderInsert } from '../types/database';


// Initialize Supabase client

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const productService = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get products by category
  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get products by gender
  async getByGender(genderSlug: string): Promise<Product[]> {
    // First get the gender ID
    const { data: genderData, error: genderError } = await supabase
      .from('genders')
      .select('id')
      .eq('slug', genderSlug)
      .single();
    
    if (genderError) throw genderError;
    if (!genderData) throw new Error(`Gender '${genderSlug}' not found`);

    // Then get products with that gender_id
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('gender_id', (genderData as any).id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create product
  async create(orderData: OrderInsert): Promise<Order> {
  console.log('Inserting order:', JSON.stringify(orderData, null, 2));

  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();

  console.log('Supabase insert response:', { data, error });

  if (error) throw error;
  if (!data) throw new Error('Failed to create order');
  return data;
},

  // Update product
  async update(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update product');
    return data;
  },

  // Delete product
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Order service
export const orderService = {
  async create(orderData: OrderInsert): Promise<Order> {

    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create order');

    return data;
  }
};

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Delete image from Supabase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = imageUrl.split('/product-images/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) console.error('Error deleting image:', error);
  }
};

export default supabase;
