import React from 'react';

const Returns: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        alt="Returns"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Returns & Exchanges</h1>
      <div className="space-y-4 text-gray-700 font-light">
        <p>
          We want you to be completely satisfied with your purchase. If you are not, we will gladly accept returns for a refund or exchange within 30 days of the delivery date.
        </p>
        <div>
          <h2 className="font-semibold text-black mt-4 mb-2">Conditions for Return</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Items must be in new, unworn, and unwashed condition.</li>
            <li>All original tags must still be attached.</li>
            <li>Items must be returned in the original packaging.</li>
            <li>Final sale items are not eligible for return.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-black mt-4 mb-2">How to Initiate a Return</h2>
          <p>
            To initiate a return, please contact our customer service team at{' '}
            <a href="mailto:support@clothify.com" className="text-black hover:underline">
              support@clothify.com
            </a>{' '}
            with your order number and the reason for your return. We will provide you with a return authorization and a prepaid shipping label.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;
