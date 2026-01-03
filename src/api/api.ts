import { createClient, } from '@supabase/supabase-js';
import type { Product, ProductInsert, ProductUpdate, Order, OrderInsert, Category, Gender, SupportTicket, SupportTicketInsert, SupportTicketUpdate, TicketResponse, TicketResponseInsert, SupportTicketCategory, ProductInventory, Supplier, LowStockAlert, PaymentTransaction, PaymentRefund } from '../types/database';

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
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Order not found');
    return data;
  },

  async getByCustomerEmail(email: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabase
      .from('orders')
      .select('total');
    
    if (error) throw error;
    if (!data) return 0;
    return data.reduce((sum, order) => sum + (order.total || 0), 0);
  },

  async getMonthRevenue(): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', monthStart);
    
    if (error) throw error;
    if (!data) return 0;
    return data.reduce((sum, order) => sum + (order.total || 0), 0);
  },

  async getOrderCount(): Promise<number> {
    const { error, count } = await supabase
      .from('orders')
      .select('id', { count: 'exact' });

    if (error) throw error;
    return count || 0;
  },

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};

// Inventory Service
export const inventoryService = {
  // Get all inventory items
  async getAll(): Promise<ProductInventory[]> {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get inventory by product ID
  async getByProductId(productId: string): Promise<ProductInventory[]> {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get low stock items
  async getLowStockItems(): Promise<ProductInventory[]> {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .lte('stock_quantity', 'low_stock_threshold')
      .order('stock_quantity', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get out of stock items
  async getOutOfStock(): Promise<ProductInventory[]> {
    const { data, error } = await supabase
      .from('product_inventory')
      .select('*')
      .eq('stock_quantity', 0)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Update inventory stock quantity
  async updateStock(inventoryId: string, newQuantity: number): Promise<ProductInventory> {
    const { data, error } = await supabase
      .from('product_inventory')
      .update({ stock_quantity: newQuantity })
      .eq('id', inventoryId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update inventory');
    return data;
  },

  // Create inventory record
  async create(inventoryData: Omit<ProductInventory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductInventory> {
    const { data, error } = await supabase
      .from('product_inventory')
      .insert([inventoryData])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create inventory');
    return data;
  },

  // Get inventory with product information
  async getInventoryWithProducts(): Promise<(ProductInventory & { products: Product })[]> {
    const { data, error } = await supabase
      .from('product_inventory')
      .select(`
        *,
        products (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Supplier Service
export const supplierService = {
  // Get all suppliers
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get active suppliers
  async getActive(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Create supplier
  async create(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create supplier');
    return data;
  }
};

// Low Stock Alerts Service
export const lowStockAlertService = {
  // Get all unresolved alerts
  async getUnresolved(): Promise<LowStockAlert[]> {
    const { data, error } = await supabase
      .from('low_stock_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get all alerts
  async getAll(): Promise<LowStockAlert[]> {
    const { data, error } = await supabase
      .from('low_stock_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Mark alert as resolved
  async resolve(alertId: string, userId?: string): Promise<LowStockAlert> {
    const { data, error } = await supabase
      .from('low_stock_alerts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString(), resolved_by: userId })
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to resolve alert');
    return data;
  }
};

// Payment Service
export const paymentService = {
  // Get all payment transactions
  async getAll(): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get transactions by status
  async getByStatus(status: string): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get completed transactions (successful payments)
  async getCompleted(): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get pending transactions
  async getPending(): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get failed transactions
  async getFailed(): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get refunds
  async getRefunds(): Promise<PaymentRefund[]> {
    const { data, error } = await supabase
      .from('payment_refunds')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create payment transaction
  async create(paymentData: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentTransaction> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create payment transaction');
    return data;
  },

  // Get total revenue
  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed');
    
    if (error) throw error;
    return (data || []).reduce((total, transaction) => total + (transaction.amount || 0), 0);
  },

  // Get this month's revenue
  async getMonthRevenue(): Promise<number> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', monthStart);
    
    if (error) throw error;
    return (data || []).reduce((total, transaction) => total + (transaction.amount || 0), 0);
  }
};

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('Image')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('Image')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Delete image from Supabase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = imageUrl.split('Image');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    if (!filePath) return;
    
    const { error } = await supabase.storage
      .from('Image')
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
    console.log('📨 API: Fetching all support tickets...');

    // First get all tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .order('created_at', { ascending: false });

    if (ticketsError) {
      console.error('❌ API Error fetching tickets:', ticketsError);
      throw ticketsError;
    }

    if (!tickets || tickets.length === 0) {
      console.log('✅ API: No tickets found');
      return [];
    }

    // Get unique assigned user IDs
    const assignedUserIds = [...new Set(tickets.map(t => t.assigned_to).filter(id => id))];

    // Fetch user emails if we have assigned users
    let userEmails: { [key: string]: string } = {};
    if (assignedUserIds.length > 0) {
      // Query user_details view instead of admin API
      const { data: users, error: usersError } = await supabase
        .from('user_details')
        .select('user_id, email')
        .in('user_id', assignedUserIds);

      if (!usersError && users) {
        // Create email map from the view data
        users.forEach((user) => {
          userEmails[user.user_id] = user.email || 'Unknown';
        });
      } else {
        console.warn('⚠️ API: Could not fetch user emails from user_details view:', usersError);
      }
    }

    console.log('✅ API: Raw tickets from DB:', tickets);
    console.log('✅ API: User emails:', userEmails);

    // Transform the data to match our interface
    const transformedTickets = tickets.map(ticket => ({
      ...ticket,
      customer_email: ticket.customer_email,
      assigned_to_email: ticket.assigned_to ? userEmails[ticket.assigned_to] || null : null,
      category_name: ticket.support_ticket_categories?.name
    }));

    console.log('✅ API: Transformed tickets:', transformedTickets);
    return transformedTickets;
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

    const tickets = data || [];
    if (tickets.length === 0) return [];

    const ticketIds = tickets.map(t => t.id);
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select('*, responder:responder_id(email)')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: true });

    const responsesByTicket: { [key: number]: any[] } = {};
    if (!responsesError && responses) {
      responses.forEach((r: any) => {
        const resp = {
          ...r,
          responder_email: r.responder?.email || null
        };
        const key = r.ticket_id as number;
        if (!responsesByTicket[key]) responsesByTicket[key] = [];
        responsesByTicket[key].push(resp);
      });
    }

    // Transform the data to match our interface and attach responses
    return tickets.map(ticket => ({
      ...ticket,
      customer_email: user.email,
      category_name: ticket.support_ticket_categories?.name,
      responses: responsesByTicket[ticket.id] || []
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

    const tickets = data || [];
    if (tickets.length === 0) return [];

    // Gather ticket ids and fetch responses (with responder email) in bulk
    const ticketIds = tickets.map(t => t.id);

    const { data: responses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select('*, responder:responder_id(email)')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: true });

    const responsesByTicket: { [key: number]: any[] } = {};
    if (!responsesError && responses) {
      responses.forEach((r: any) => {
        const resp = {
          ...r,
          responder_email: r.responder?.email || null
        };
        const key = r.ticket_id as number;
        if (!responsesByTicket[key]) responsesByTicket[key] = [];
        responsesByTicket[key].push(resp);
      });
    }

    // Transform the data to match our interface and attach responses
    return tickets.map(ticket => ({
      ...ticket,
      category_name: ticket.support_ticket_categories?.name,
      responses: responsesByTicket[ticket.id] || []
    }));
  },

  // Get tickets assigned to current user (employee view)
  async getAssignedTickets(): Promise<SupportTicket[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get the current user's email from user_details view
    const { data: userInfo, error: userError } = await supabase
      .from('user_details')
      .select('email')
      .eq('user_id', user.id)
      .single();

    const assignedEmail = (!userError && userInfo) ? userInfo.email : null;

    // Transform the data to match our interface
    return (data || []).map(ticket => ({
      ...ticket,
      category_name: ticket.support_ticket_categories?.name,
      assigned_to_email: assignedEmail
    }));
  },

  // Create a new support ticket
  async create(ticketData: SupportTicketInsert): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticketData])
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create support ticket');

    // Get the assigned user's email if assigned_to exists
    let assignedEmail = null;
    if (data.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', data.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    return {
      ...data,
      customer_email: data.customer_email,
      assigned_to_email: assignedEmail,
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
        support_ticket_categories(name)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update support ticket');

    // Get the assigned user's email if assigned_to exists
    let assignedEmail = null;
    if (data.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', data.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    return {
      ...data,
      customer_email: data.customer_email,
      assigned_to_email: assignedEmail,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Assign ticket to user
  async assignTicket(ticketId: number, assignedTo: string): Promise<SupportTicket> {
    console.log('👤 API: Assigning ticket', ticketId, 'to user', assignedTo);

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: assignedTo,
        status: 'in-progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to assign ticket');

    // Get the assigned user's email
    let assignedEmail = null;
    if (data.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', data.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    return {
      ...data,
      customer_email: data.customer_email,
      assigned_to_email: assignedEmail,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Mark ticket as resolved
  async resolveTicket(ticketId: number): Promise<SupportTicket> {
    console.log('✅ API: Resolving ticket', ticketId);

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to resolve ticket');

    // Get the assigned user's email if assigned_to exists
    let assignedEmail = null;
    if (data.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', data.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    return {
      ...data,
      customer_email: data.customer_email,
      assigned_to_email: assignedEmail,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Update ticket status
  async updateStatus(ticketId: number, status: string, priority?: string): Promise<SupportTicket> {
    console.log('🔄 API: Updating ticket', ticketId, 'status to', status);

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (priority) updateData.priority = priority;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();
    if (status === 'closed') updateData.closed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update ticket status');

    // Get the assigned user's email if assigned_to exists
    let assignedEmail = null;
    if (data.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', data.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    return {
      ...data,
      customer_email: data.customer_email,
      assigned_to_email: assignedEmail,
      category_name: data.support_ticket_categories?.name
    };
  },

  // Get ticket responses
  async getResponses(ticketId: number): Promise<TicketResponse[]> {
    // First get the responses
    const { data: responses, error: responsesError } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (responsesError) throw responsesError;

    // Get unique responder IDs
    const responderIds = [...new Set((responses || []).map(r => r.responder_id).filter(id => id))];

    // Fetch responder names from user_roles table
    let responderInfo: { [key: string]: { email: string; name: string } } = {};
    if (responderIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('user_roles')
        .select('user_id, name')
        .in('user_id', responderIds);

      if (!usersError && users) {
        users.forEach(user => {
          responderInfo[user.user_id] = {
            email: user.user_id,
            name: user.name || 'Unknown'
          };
        });
      }
    }

    // Combine the data
    return (responses || []).map(response => ({
      ...response,
      responder_email: responderInfo[response.responder_id]?.email || null,
      responder_name: responderInfo[response.responder_id]?.name || 'Unknown'
    }));
  },

  // Add a response to a ticket
  async addResponse(responseData: TicketResponseInsert): Promise<TicketResponse> {
    console.log('📝 API: Adding response:', responseData);
    
    // Validate data
    if (!responseData.ticket_id) throw new Error('ticket_id is required');
    if (!responseData.responder_id) throw new Error('responder_id is required');
    if (!responseData.response_text) throw new Error('response_text is required');

    // Ensure ticket_id is a number
    const dataToInsert = {
      ticket_id: Number(responseData.ticket_id),
      responder_id: responseData.responder_id,
      response_text: responseData.response_text,
      is_internal: responseData.is_internal || false,
      created_at: new Date().toISOString()
    };

    console.log('📝 API: Inserting data:', dataToInsert);

    // Insert without trying to fetch relationship
    const { data, error } = await supabase
      .from('ticket_responses')
      .insert([dataToInsert])
      .select('*')
      .single();

    if (error) {
      console.error('❌ API Error adding response:', error);
      throw error;
    }
    if (!data) throw new Error('Failed to add response');

    console.log('✅ API: Response added successfully:', data);

    // Fetch responder name from user_roles table
    let responderEmail = null;
    let responderName = null;
    if (data.responder_id) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('user_id', data.responder_id)
        .single();

      if (!userError && userInfo) {
        responderName = userInfo.name || 'Unknown';
      }
    }

    return {
      ...data,
      responder_email: responderEmail,
      responder_name: responderName
    };
  },

  // Get ticket with responses
  async getTicketWithResponses(ticketId: number): Promise<{ ticket: SupportTicket | null; responses: TicketResponse[] }> {
    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_categories(name)
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError) throw ticketError;
    if (!ticket) return { ticket: null, responses: [] };

    // Get the responses
    const responses = await this.getResponses(ticketId);

    // Get assigned user email if needed
    let assignedEmail = null;
    if (ticket.assigned_to) {
      const { data: userInfo, error: userError } = await supabase
        .from('user_details')
        .select('email')
        .eq('user_id', ticket.assigned_to)
        .single();

      assignedEmail = (!userError && userInfo) ? userInfo.email : null;
    }

    const transformedTicket: SupportTicket = {
      ...ticket,
      customer_email: ticket.customer_email,
      assigned_to_email: assignedEmail,
      category_name: ticket.support_ticket_categories?.name
    };

    return {
      ticket: transformedTicket,
      responses
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
  // Helper function to validate UUID
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  // Get all customers from auth.users (admin only)
  async getAll(): Promise<any[]> {
    console.log('👥 API: Fetching all users (customers, employees, admins)...');

    // Skip admin API call since it requires service role permissions
    // Go directly to the method that gets all users
    return await this.getAllUsers();
  },

  // Get customers for employees (from tickets they can access)
  async getAllForEmployees(): Promise<any[]> {
    console.log('👥 API: Getting customers for employees (from accessible tickets)...');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ No authenticated user');
        return [];
      }

      // Get tickets assigned to this employee OR unassigned tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('customer_id, customer_email, customer_name, created_at, assigned_to')
        .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('❌ Error fetching accessible tickets:', ticketsError);
        throw ticketsError;
      }

      // Create a map to get unique customers
      const customerMap = new Map();
      (tickets || []).forEach(ticket => {
        const key = ticket.customer_email || ticket.customer_id;
        if (key && !customerMap.has(key)) {
          customerMap.set(key, {
            user_id: ticket.customer_id || ticket.customer_email,
            email: ticket.customer_email,
            user_created_at: ticket.created_at,
            customer_name: ticket.customer_name,
            last_sign_in_at: null,
            email_confirmed_at: null,
            role: 'customer',
            role_assigned_at: null
          });
        }
      });

      const customers = Array.from(customerMap.values());
      console.log('✅ API: Employee customers from accessible tickets:', customers);
      return customers;
    } catch (error) {
      console.error('❌ API Error in getAllForEmployees:', error);
      throw error;
    }
  },

  // Fallback method - get customers from support tickets (for when admin API fails)
  async getAllFromTickets(): Promise<any[]> {
    console.log('🎫 API: Getting customers from support tickets (fallback)...');

    // Get unique customers from support tickets
    const { data, error } = await supabase
      .from('support_tickets')
      .select('customer_id, customer_email, customer_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log('🎫 API: Found', data?.length || 0, 'support tickets');

    // Get all user roles to assign proper roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at');

    if (rolesError) {
      console.warn('⚠️ API: Could not fetch user roles:', rolesError);
    }
    console.log('🎫 API: Found', rolesData?.length || 0, 'user roles');

    // Create a map of user_id to role
    const roleMap = new Map();
    (rolesData || []).forEach(roleEntry => {
      roleMap.set(roleEntry.user_id, {
        role: roleEntry.role,
        role_assigned_at: roleEntry.created_at
      });
    });
    console.log('🎫 API: Role map created with', roleMap.size, 'entries');

    // Create a map to get unique customers from tickets
    const customerMap = new Map();
    (data || []).forEach(ticket => {
      const key = ticket.customer_email || ticket.customer_id;
      if (key && !customerMap.has(key)) {
        // Use customer_id if it's a valid UUID, otherwise create a placeholder ID
        const userId = ticket.customer_id && this.isValidUUID(ticket.customer_id) ? ticket.customer_id : `email_${ticket.customer_email}`;

        // Get role from roleMap, default to 'customer' if not found
        const roleInfo = roleMap.get(userId) || { role: 'customer', role_assigned_at: null };

        customerMap.set(key, {
          user_id: userId,
          email: ticket.customer_email,
          user_created_at: ticket.created_at,
          customer_name: ticket.customer_name,
          last_sign_in_at: null,
          email_confirmed_at: null,
          role: roleInfo.role,
          role_assigned_at: roleInfo.role_assigned_at,
          // Flag to indicate if this is a real user account or just email-based
          is_placeholder: !ticket.customer_id || !this.isValidUUID(ticket.customer_id)
        });
      }
    });

    const result = Array.from(customerMap.values());
    console.log('🎫 API: Returning', result.length, 'customers');
    console.log('🎫 API: Customers with roles:', result.map(c => ({ email: c.email, role: c.role })));

    return result;
  },

  // Get all users (customers, employees, admins) from user_roles and support tickets
  async getAllUsers(): Promise<any[]> {
    console.log('👥 API: Getting all users (customers, employees, admins)...');

    // Get customers from support tickets
    const customers = await this.getAllFromTickets();

    // Get all user roles to include employees and admins
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at, name');

    if (rolesError) {
      console.warn('⚠️ API: Could not fetch user roles:', rolesError);
      return customers; // Return just customers if roles query fails
    }

    // Create a map of existing customers
    const userMap = new Map();
    customers.forEach(customer => {
      userMap.set(customer.user_id, customer);
    });

    // Add employees and admins from user_roles (even if they don't have tickets)
    (rolesData || []).forEach(roleEntry => {
      // Skip customers since they're already added
      if (roleEntry.role === 'customer') return;

      const userId = roleEntry.user_id;
      if (!userMap.has(userId)) {
        // This is a new user (employee/admin) not found in tickets
        userMap.set(userId, {
          user_id: userId,
          email: null, // We don't have email from user_roles
          user_created_at: roleEntry.created_at,
          customer_name: roleEntry.name || null, // Use name from user_roles
          last_sign_in_at: null,
          email_confirmed_at: null,
          role: roleEntry.role,
          role_assigned_at: roleEntry.created_at,
          is_placeholder: false
        });
      }
    });

    const result = Array.from(userMap.values());
    console.log('👥 API: Returning', result.length, 'total users');
    console.log('👥 API: Users with roles:', result.map(u => ({ id: u.user_id, email: u.email, role: u.role })));

    return result;
  },

  // Get customer by ID
  async getById(userId: string): Promise<any> {
    console.log('👤 API: Fetching customer by ID:', userId);

    // Try to get from auth.users first
    try {
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError) throw userError;

      // Get role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        user_id: user.user.id,
        email: user.user.email,
        user_created_at: user.user.created_at,
        last_sign_in_at: user.user.last_sign_in_at,
        email_confirmed_at: user.user.email_confirmed_at,
        role: roleData?.role || 'customer',
        role_assigned_at: roleData?.assigned_at || null,
        customer_name: user.user.user_metadata?.full_name || user.user.user_metadata?.name || null
      };
    } catch (error) {
      console.error('❌ API Error fetching user by ID:', error);
      throw error;
    }
  },

  // Delete a customer (admin only)
  async deleteCustomer(userId: string): Promise<void> {
    console.log('🗑️ API: Deleting customer:', userId);

    try {
      // Delete from auth.users (admin only)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) console.error('Error deleting user role:', roleError);

      // Delete all tickets for this customer
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .delete()
        .or(`customer_id.eq.${userId}`);

      if (ticketError) console.error('Error deleting user tickets:', ticketError);

      console.log('✅ API: Customer deleted successfully');
    } catch (error) {
      console.error('❌ API Error deleting customer:', error);
      throw error;
    }
  },

  // Update customer role
  async updateRole(userId: string, role: string): Promise<void> {
    console.log('🔄 API: Updating customer role:', userId, role);

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        assigned_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log('✅ API: Customer role updated successfully');
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
