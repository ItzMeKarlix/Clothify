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
  setCartItems: (items: CartItem[]) => void;
  buyNow: (product: Product, size?: string) => void;
  isBuyNowMode: boolean;
  buyNowItems: CartItem[];
  setIsBuyNowMode: (mode: boolean) => void;
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
  setCartItems: () => {},
  buyNow: () => {},
  isBuyNowMode: false,
  buyNowItems: [],
  setIsBuyNowMode: () => {},
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

  const [isBuyNowMode, setIsBuyNowMode] = useState<boolean>(false);
  const [buyNowItems, setBuyNowItems] = useState<CartItem[]>([]);

  // Reset buy now mode on page refresh
  useEffect(() => {
    setIsBuyNowMode(false);
    setBuyNowItems([]);
    // Clean up any temp cart data
    localStorage.removeItem("temp_cart");
  }, []);

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
      return [...prev, { ...product, qty: 1, ...(size && { size }) }];
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

  // Computed cart items based on mode
  const effectiveCartItems = isBuyNowMode ? buyNowItems : cartItems;

  const setCartItemsDirectly = (items: CartItem[]) => {
    setCartItems(items);
  };

  const setIsBuyNowModeDirectly = (mode: boolean) => {
    setIsBuyNowMode(mode);
    if (!mode) {
      setBuyNowItems([]);
    }
  };

  const buyNow = (product: Product, size?: string) => {
    // Store current cart for restoration
    localStorage.setItem("temp_cart", JSON.stringify(cartItems));
    
    // Set buy now mode with the single item
    const buyNowItem = { ...product, qty: 1, ...(size && { size }) };
    setBuyNowItems([buyNowItem]);
    setIsBuyNowMode(true);
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

  // Check if this was a "Buy Now" checkout
  const tempCart = localStorage.getItem("temp_cart");
  if (tempCart && isBuyNowMode) {
    // Restore the original cart
    const originalCart = JSON.parse(tempCart);
    setCartItems(originalCart);
    setIsBuyNowMode(false);
    setBuyNowItems([]);
    localStorage.removeItem("temp_cart");
  } else {
    // Normal checkout - clear the cart
    clearCart();
  }

  return order;
};

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      incrementQty, 
      decrementQty, 
      setCartItems: setCartItemsDirectly, 
      buyNow, 
      isBuyNowMode,
      buyNowItems,
      setIsBuyNowMode: setIsBuyNowModeDirectly,
      submitOrder 
    }}>
      {children}
    </CartContext.Provider>
  );
};
