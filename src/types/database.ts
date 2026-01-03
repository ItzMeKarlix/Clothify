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
      product_inventory: {
        Row: ProductInventory;
        Insert: Omit<ProductInventory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProductInventory, 'id' | 'created_at'>>;
      };
      inventory_movements: {
        Row: InventoryMovement;
        Insert: Omit<InventoryMovement, 'id' | 'created_at'>;
        Update: Partial<Omit<InventoryMovement, 'id' | 'created_at'>>;
      };
      suppliers: {
        Row: Supplier;
        Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Supplier, 'id' | 'created_at'>>;
      };
      low_stock_alerts: {
        Row: LowStockAlert;
        Insert: Omit<LowStockAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<LowStockAlert, 'id' | 'created_at'>>;
      };
      payment_transactions: {
        Row: PaymentTransaction;
        Insert: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentTransaction, 'id' | 'created_at'>>;
      };
      payment_refunds: {
        Row: PaymentRefund;
        Insert: Omit<PaymentRefund, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentRefund, 'id' | 'created_at'>>;
      };
      saved_payment_methods: {
        Row: SavedPaymentMethod;
        Insert: Omit<SavedPaymentMethod, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedPaymentMethod, 'id' | 'created_at'>>;
      };
      payment_disputes: {
        Row: PaymentDispute;
        Insert: Omit<PaymentDispute, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PaymentDispute, 'id' | 'created_at'>>;
      };
      payment_webhooks: {
        Row: PaymentWebhook;
        Insert: Omit<PaymentWebhook, 'id' | 'created_at'>;
        Update: Partial<Omit<PaymentWebhook, 'id' | 'created_at'>>;
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
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  payment_method?: string | null;
  card_last4?: string | null;
  card_expiry?: string | null;
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
  assigned_to_email?: string;
  category_name?: string;
  // Responses added by support staff or the customer
  responses?: TicketResponse[];
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
  responder_name?: string;
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

// =====================================================
// Inventory Types
// =====================================================

export interface ProductInventory {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  sku?: string;
  stock_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  location?: string;
  supplier_id?: string;
  cost_price?: number;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithInventory extends ProductInventory {
  products: Product;
}

export interface InventoryMovement {
  id: string;
  inventory_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  reference_id?: string;
  reference_type?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LowStockAlert {
  id: string;
  inventory_id: string;
  alert_type: 'low_stock' | 'out_of_stock';
  threshold: number;
  current_stock: number;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

// =====================================================
// Payment Types
// =====================================================

export interface PaymentTransaction {
  id: string;
  order_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider?: string;
  provider_transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  failure_reason?: string;
  card_last4?: string;
  card_brand?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
  billing_address?: any;
  customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRefund {
  id: string;
  payment_transaction_id: string;
  order_id?: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider_refund_id?: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedPaymentMethod {
  id: string;
  customer_id: string;
  payment_method_type: string;
  provider_payment_method_id?: string;
  card_last4?: string;
  card_brand?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
  billing_address?: any;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentDispute {
  id: string;
  payment_transaction_id: string;
  order_id?: string;
  dispute_type: string;
  status: 'open' | 'won' | 'lost' | 'closed';
  amount: number;
  currency: string;
  reason?: string;
  provider_dispute_id?: string;
  evidence_due_by?: string;
  evidence_submitted_at?: string;
  resolved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentWebhook {
  id: string;
  provider: string;
  event_type: string;
  event_id: string;
  payment_transaction_id?: string;
  payload: any;
  processed: boolean;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}
