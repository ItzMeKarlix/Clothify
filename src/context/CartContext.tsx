import React, { createContext, useState, useEffect, ReactNode } from "react";
import { orderService } from "../api/api";
import { nanoid } from "nanoid";
import type { Product, Order, CartItem } from "../types/database";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  submitOrder: (customer_name: string, customer_email: string) => Promise<Order>;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
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

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  // submit order to Supabase
  const submitOrder = async (customer_name: string, customer_email: string): Promise<Order> => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const orderData = {
      id: nanoid(10),
      customer_name,
      customer_email,
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty,
        image: item.image
      })),
      total: parseFloat(total.toFixed(2))
    };
    
    const order = await orderService.create(orderData);
    clearCart(); // clear after successful submission
    return order;
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, submitOrder }}>
      {children}
    </CartContext.Provider>
  );
};
