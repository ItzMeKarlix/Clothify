import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between items-center border p-2 rounded">
                <span>{item.title} x {item.qty}</span>
                <span>${item.price * item.qty}</span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p className="text-lg font-bold mt-4">Total: ${total}</p>
          <Link to="/checkout">
            <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </button>
          </Link>
          <button
            onClick={clearCart}
            className="mt-2 bg-gray-600 text-white px-4 py-2 rounded ml-2"
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
