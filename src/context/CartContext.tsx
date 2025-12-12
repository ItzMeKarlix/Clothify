import React, { createContext, useState, useEffect, ReactNode } from "react";
import { orderService } from "../api/api";
import { nanoid } from "nanoid";
import type { Product, Order, CartItem, OrderInsert } from "../types/database";
import toast from "react-hot-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  submitOrder: (
    customer_name: string,
    customer_email: string,
    details?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      paymentMethod?: string;
      cardNumber?: string;
      expiry?: string;
      cvc?: string;
    }
  ) => Promise<Order>;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  incrementQty: () => {},
  decrementQty: () => {},
  submitOrder: async () => ({} as Order),
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on startup
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, size?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, size }];
    });
    // Show toast notification
    toast.success(`${product.title}${size ? ` (${size})` : ''} added to cart`, {
      duration: 3000,
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '300',
      },
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const incrementQty = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decrementQty = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item
      )
    );
  };

  // submit order to Supabase
const submitOrder = async (
  customer_name: string,
  customer_email: string,
  details?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    paymentMethod?: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
  }
): Promise<Order> => {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Build order payload including new checkout fields
  const orderData: OrderInsert = {
    id: nanoid(10),
    customer_name,
    customer_email,
    items: cartItems.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      image: item.image || null,
      size: item.size
    })),
    total: parseFloat(total.toFixed(2)),
    address: details?.address,
    city: details?.city,
    state: details?.state,
    zip: details?.zip,
    country: details?.country,
    payment_method: details?.paymentMethod,
    card_last4: details?.cardNumber?.slice(-4), // only last 4 digits
    card_expiry: details?.expiry,
  };

  const order = await orderService.create(orderData);

  toast.success(`Checkout Successfully`, {
    duration: 3000,
    style: {
      background: '#000',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '300',
    },
  });

  clearCart();

  return order;
};

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, incrementQty, decrementQty, submitOrder }}>
      {children}
    </CartContext.Provider>
  );
};
