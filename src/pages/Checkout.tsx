import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const Checkout: React.FC = () => {
  const { cartItems, submitOrder } = useContext(CartContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await submitOrder(name, email);
    setMessage(`Order submitted! ID: ${res.id}`);
    setName("");
    setEmail("");
  } catch (err: any) {
    console.error(err);
    setMessage(err.message || "Error submitting order");
  }
};


  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-light text-black mb-8 tracking-wide">CHECKOUT</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100">
            <p className="text-gray-500 font-light">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-sm font-light text-black mb-4 uppercase tracking-wide">Order Summary</h2>
              <div className="bg-white border border-gray-100 p-6 mb-8">
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 font-light">
                        {item.title} x {item.qty}
                      </span>
                      <span className="text-black font-normal">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-sm font-light text-black uppercase tracking-wide">Total</span>
                  <span className="text-xl font-normal text-black">${total.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-4 text-black py-3 focus:outline-none focus:border-black font-light text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-4 text-black py-3 focus:outline-none focus:border-black font-light text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 text-sm uppercase tracking-wide font-light transition-colors mt-6"
                >
                  Submit Order
                </button>
              </form>
              {message && (
                <p className="mt-4 text-center text-gray-600 font-light text-sm">{message}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
