import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"

const Checkout: React.FC = () => {
  const { cartItems, submitOrder } = useContext(CartContext);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitOrder(name, email, {
        address,
        city,
        state,
        zip,
        country,
        paymentMethod,
        cardNumber,
        expiry,
        cvc,
      });
      setMessage(`Order submitted! ID: ${res.id}`);
      setName(""); setEmail(""); setAddress(""); setCity(""); setState(""); setZip(""); setCountry("");
      setCardNumber(""); setExpiry(""); setCvc("");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Error submitting order");
    }
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-light text-black mb-8 tracking-wide">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100">
            <p className="text-gray-500 font-light">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
            {/* Order Summary */}
            <Card className="bg-white w-full md:w-[400px] h-[600px] flex flex-col">
              <CardHeader>
                <h2 className="text-sm font-bold text-black uppercase tracking-wide">Order Summary</h2>
              </CardHeader>
              <ScrollArea className="flex-1 overflow-y-auto mt-3">
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">{item.title}</span>
                          <span className="text-gray-500 font-light text-sm">
                            Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-black font-normal text-lg">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
              <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
                <span className="text-sm font-light text-black uppercase tracking-wide">Total</span>
                <span className="text-xl font-bold text-black">${total.toFixed(2)}</span>
              </CardFooter>
            </Card>

            {/* Checkout Form */}
            <Card className="bg-white w-full md:w-[500px] h-[700px] flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-6 p-6 flex-1">
                {/* Contact Info */}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} required />
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>City</Label>
                      <Input value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>State</Label>
                      <Input value={state} onChange={e => setState(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>ZIP / Postal Code</Label>
                      <Input value={zip} onChange={e => setZip(e.target.value)} required />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Country</Label>
                      <Input value={country} onChange={e => setCountry(e.target.value)} required />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                      Card
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} />
                      PayPal
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-3">
                      <Label>Card Number</Label>
                      <Input value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-2">
                          <Label>Expiry</Label>
                          <Input value={expiry} onChange={e => setExpiry(e.target.value)} required />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>CVC</Label>
                          <Input value={cvc} onChange={e => setCvc(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full mt-4">Submit Order</Button>
                {message && <p className="mt-4 text-center text-gray-600 font-light text-sm">{message}</p>}
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;