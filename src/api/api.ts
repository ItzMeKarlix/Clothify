import { createClient, } from '@supabase/supabase-js';
import type { Product, ProductInsert, ProductUpdate, Order, OrderInsert, Category, Gender, SupportTicket, SupportTicketInsert, SupportTicketUpdate, TicketResponse, TicketResponseInsert, SupportTicketCategory } from '../types/database';

// Initialize Supabase client

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const adminService = {
  async inviteEmployee(email: string) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    return data;
  }
};

export const userService = {
  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle(); // safer than single()

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return data?.role || null;
  },
};

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
  async getByCategory(categorySlug: string): Promise<Product[]> {
    // First get the category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug.toLowerCase())
      .single();
    
    if (categoryError) throw categoryError;
    if (!categoryData) throw new Error(`Category '${categorySlug}' not found`);

    // Then get products with that category_id
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryData.id)
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
  async create(productData: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create product');
    return data;
  },

  // Update product
    async update(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle(); // 👈 important

    if (error) throw error;
    if (!data) throw new Error('Product not updated (check RLS)');
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

// Category service
export const categoryService = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get category by slug
  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Gender service
export const genderService = {
  // Get all genders
  async getAll(): Promise<Gender[]> {
    const { data, error } = await supabase
      .from('genders')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get gender by slug
  async getBySlug(slug: string): Promise<Gender | null> {
    const { data, error } = await supabase
      .from('genders')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
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
    if (!filePath) return;
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) console.error('Error deleting image:', error);
  }
};


// Auth service
export const authService = {
  // Login with email and password
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Send password reset email
  async resetPasswordForEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  // Update password for logged-in user
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },
};

// Support Ticket Services
export const supportTicketService = {
  // Get all support tickets (admin view)
  async getAll(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories!inner(name),
        customer:customer_id(email),
        assigned_user:assigned_to(email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match our interface
    return (data || []).map(ticket => ({
      ...ticket,
      customer_email: ticket.customer?.email,
      assigned_to_email: ticket.assigned_user?.email,
      category_name: ticket.support_ticket_categories?.name
    }));
  },

  // Get support tickets for current user (customer view)
  async getMyTickets(): Promise<SupportTicket[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match our interface
    return (data || []).map(ticket => ({
      ...ticket,
      customer_email: user.email,
      category_name: ticket.support_ticket_categories?.name
    }));
  },

  // Get support tickets by email (for anonymous users)
  async getTicketsByEmail(email: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match our interface
    return (data || []).map(ticket => ({
      ...ticket,
      category_name: ticket.support_ticket_categories?.name
    }));
  },

  // Create a new support ticket
  async create(ticketData: SupportTicketInsert): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticketData])
      .select(`
        *,
        support_ticket_categories(name),
        customer:customer_id(email),
        assigned_user:assigned_to(email)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create support ticket');

    return {
      ...data,
      customer_email: data.customer?.email,
      assigned_to_email: data.assigned_user?.email,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Update a support ticket
  async update(id: number, updates: SupportTicketUpdate): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        support_ticket_categories(name),
        customer:customer_id(email),
        assigned_user:assigned_to(email)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update support ticket');

    return {
      ...data,
      customer_email: data.customer?.email,
      assigned_to_email: data.assigned_user?.email,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Delete a support ticket
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get ticket responses
  async getResponses(ticketId: number): Promise<TicketResponse[]> {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select(`
        *,
        responder:responder_id(email)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(response => ({
      ...response,
      responder_email: response.responder?.email
    }));
  },

  // Add a response to a ticket
  async addResponse(responseData: TicketResponseInsert): Promise<TicketResponse> {
    const { data, error } = await supabase
      .from('ticket_responses')
      .insert([responseData])
      .select(`
        *,
        responder:responder_id(email)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add response');

    return {
      ...data,
      responder_email: data.responder?.email
    };
  }
};

// Support Ticket Category Service
export const supportTicketCategoryService = {
  // Get all ticket categories
  async getAll(): Promise<SupportTicketCategory[]> {
    const { data, error } = await supabase
      .from('support_ticket_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

// Customer Service (for admin use)
export const customerService = {
  // Get all customers with their details
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .order('user_created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Delete a customer (admin only)
  async deleteCustomer(userId: string): Promise<void> {
    // First delete from user_roles (this will cascade if set up)
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) throw roleError;

    // Note: Deleting from auth.users requires admin privileges
    // This would typically be done through Supabase admin API
    // For now, we'll just remove their role which effectively disables them
  }
};

// Support Ticket Attachments Service
export const supportTicketAttachmentService = {
  // Upload attachment for a ticket
  async uploadAttachment(ticketId: number, file: File, responderId: string): Promise<any> {
    try {
      // First upload file to storage
      const fileUrl = await storageService.uploadImage(file, 'support-attachments');

      // Then create attachment record
      const { data, error } = await supabase
        .from('ticket_attachments')
        .insert([{
          ticket_id: ticketId,
          file_name: file.name,
          file_url: fileUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: responderId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Get attachments for a ticket
  async getAttachments(ticketId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Delete attachment
  async deleteAttachment(attachmentId: number): Promise<void> {
    // First get the attachment to get the file URL
    const { data: attachment, error: fetchError } = await supabase
      .from('ticket_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    if (attachment?.file_url) {
      await storageService.deleteImage(attachment.file_url);
    }

    // Delete from database
    const { error } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;
  }
};

export default supabase;
