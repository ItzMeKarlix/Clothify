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
