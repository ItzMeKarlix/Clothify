import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-black mb-8 tracking-wide">SHOPPING CART</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-light mb-6">Your cart is empty</p>
            <Link to="/">
              <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm uppercase tracking-wide font-light transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-100 divide-y divide-gray-100">
              {cartItems.map(item => (
                <div key={item.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    {item.image && (
                      <div className="w-24 h-24 bg-gray-50 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-black font-light text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-xs font-light mt-1">Quantity: {item.qty}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <span className="text-black font-normal">${(item.price * item.qty).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-black font-light text-xs uppercase tracking-wide transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <span className="text-sm font-light text-black uppercase tracking-wide">Total</span>
                <span className="text-2xl font-normal text-black">${total.toFixed(2)}</span>
              </div>
              <div className="flex space-x-4">
                <Link to="/checkout" className="flex-1">
                  <button className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 text-sm uppercase tracking-wide font-light transition-colors">
                    Proceed to Checkout
                  </button>
                </Link>
                <button
                  onClick={clearCart}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-black px-6 py-3 text-sm uppercase tracking-wide font-light transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
