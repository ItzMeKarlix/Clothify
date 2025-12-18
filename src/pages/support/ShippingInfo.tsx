import React from 'react';

const ShippingInfo: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.pexels.com/photos/5025669/pexels-photo-5025669.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Shipping"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Shipping Information</h1>
      <div className="space-y-4 text-gray-700 font-light">
        <p>
          We offer standard and express shipping options for all orders within the United States.
        </p>
        <div>
          <h2 className="font-semibold text-black mt-4 mb-2">Processing Time</h2>
          <p>
            Please allow 1-2 business days for your order to be processed and prepared for shipping. You will receive a notification once your order has shipped.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-black mt-4 mb-2">Shipping Rates & Times</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Standard Shipping:</strong> 5-7 business days - $5.00
            </li>
            <li>
              <strong>Express Shipping:</strong> 2-3 business days - $15.00
            </li>
          </ul>
          <p className="mt-2">
            Orders over $100 qualify for free standard shipping.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
