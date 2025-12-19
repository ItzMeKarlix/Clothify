// Database types for Clothify application

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      categories: {
        Row: Category;
      };
      genders: {
        Row: Gender;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: SupportTicketInsert;
        Update: SupportTicketUpdate;
      };
      ticket_responses: {
        Row: TicketResponse;
        Insert: TicketResponseInsert;
        Update: TicketResponseUpdate;
      };
      support_ticket_categories: {
        Row: SupportTicketCategory;
      };
    };
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Gender {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  category_id: string | null;
  gender_id: string | null;
  created_at: string;
}

export interface ProductInsert {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category_id?: string | null;
  gender_id?: string | null;
  created_at?: string;
}

export interface ProductUpdate {
  title?: string;
  description?: string | null;
  price?: number;
  image?: string | null;
  category_id?: string | null;
  gender_id?: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total: number;
  created_at: string;
}

export interface OrderInsert {
  customer_name: string;
  customer_email: string;
  items: CartItem[];
  total: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  payment_method?: string;
  card_last4?: string;
  card_expiry?: string;
}

export interface OrderUpdate {
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  total?: number;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string | null;
  size?: string;
}

export interface CartItem extends Product {
  qty: number;
  size?: string;
}

// Support Ticket Types
export interface SupportTicketCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  customer_id: string | null;
  customer_email?: string;
  customer_name?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  customer_email?: string;
  assigned_to_email?: string;
  category_name?: string;
}

export interface SupportTicketInsert {
  ticket_number?: string;
  customer_id?: string | null;
  customer_email?: string;
  customer_name?: string;
  subject: string;
  description: string;
  status?: 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: number | null;
  assigned_to?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
}

export interface SupportTicketUpdate {
  subject?: string;
  description?: string;
  status?: 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category_id?: number | null;
  assigned_to?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  responder_id: string;
  response_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  responder_email?: string;
}

export interface TicketResponseInsert {
  ticket_id: number;
  responder_id: string;
  response_text: string;
  is_internal?: boolean;
}

export interface TicketResponseUpdate {
  response_text?: string;
  is_internal?: boolean;
}
