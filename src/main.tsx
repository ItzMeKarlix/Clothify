import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CartProvider } from "./context/CartContext";
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);
