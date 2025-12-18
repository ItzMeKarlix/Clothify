import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="FAQ"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-black mb-2">What is your return policy?</h2>
          <p className="text-gray-700 font-light">
            We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. Please see our Returns section for more details.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-black mb-2">How do I track my order?</h2>
          <p className="text-gray-700 font-light">
            Once your order has shipped, you will receive a shipping confirmation email with a tracking number. You can use this number to track your order on the carrier's website.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-black mb-2">Do you ship internationally?</h2>
          <p className="text-gray-700 font-light">
            Currently, we only ship within the United States. We are working on expanding our shipping options in the future.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-black mb-2">How do I use a promo code?</h2>
          <p className="text-gray-700 font-light">
            You can apply a promo code at checkout in the designated field. Only one promo code can be used per order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
