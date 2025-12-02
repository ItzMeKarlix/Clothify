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
    };
  };
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
  id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total: number;
  created_at?: string;
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
}

export interface CartItem extends Product {
  qty: number;
}
