import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const Checkout = () => {
  const { cartItems, submitOrder } = useContext(CartContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setMessage("Cart is empty!");
      return;
    }
    try {
      const res = await submitOrder(name, email);
      setMessage(`Order submitted! Your order ID is ${res.id}`);
      setName("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage("Error submitting order");
    }
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {cartItems.length === 0 && <p>Your cart is empty.</p>}
      {cartItems.length > 0 && (
        <div className="mb-4">
          <ul className="space-y-2">
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between">
                {item.title} x {item.qty} = ${item.price * item.qty}
              </li>
            ))}
          </ul>
          <p className="text-lg font-bold mt-2">Total: ${total}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-2">
          Submit Order
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default Checkout;
