import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on startup
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
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

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  // submit order to backend
  const submitOrder = async (customer_name, customer_email) => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const orderData = {
      customer_name,
      customer_email,
      items: cartItems,
      total
    };
    const res = await API.post("/orders", orderData);
    clearCart(); // clear after successful submission
    return res.data;
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, submitOrder }}>
      {children}
    </CartContext.Provider>
  );
};
