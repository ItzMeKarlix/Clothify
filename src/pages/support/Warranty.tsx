import React from 'react';

const Warranty: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.pexels.com/photos/4386433/pexels-photo-4386433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Warranty"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Warranty Information</h1>
      <div className="space-y-4 text-gray-700 font-light">
        <p>
          This product is warranted to be free from defects in material and workmanship for a period of one (1) year from the date of original purchase.
        </p>
        <p>
          This warranty is non-transferable and valid only for the original purchaser.
        </p>
        <h2 className="font-semibold text-black mt-4 mb-2">What is not covered by this warranty:</h2>
        <ul className="list-disc list-inside space-y-2">
            <li>Normal wear and tear.</li>
            <li>Damage caused by misuse, abuse, or accident.</li>
            <li>Damage caused by unauthorized modification or repair.</li>
            <li>Products purchased from unauthorized retailers.</li>
        </ul>
        <h2 className="font-semibold text-black mt-4 mb-2">How to make a warranty claim:</h2>
        <p>
          To make a warranty claim, please contact our customer service team at support@clothify.com with your order number and a description of the issue.
        </p>
      </div>
    </div>
  );
};

export default Warranty;
