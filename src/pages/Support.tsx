import React from "react";

const Support: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-black mb-8 tracking-wide">Support</h1>

        {/* Contact Us Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-normal text-black mb-4">Contact Us</h2>
          <div className="bg-white border border-gray-100 p-6">
            <p className="text-gray-600 font-light mb-4">
              Have a question or need assistance? Our customer service team is here to help.
            </p>
            <p className="text-gray-600 font-light">
              <strong>Email:</strong> <a href="mailto:support@clothify.com" className="text-black hover:underline">support@clothify.com</a>
            </p>
            <p className="text-gray-600 font-light mt-2">
              <strong>Phone:</strong> 1-800-CLOTHIFY
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-normal text-black mb-4">Frequently Asked Questions</h2>
          <div className="bg-white border border-gray-100 divide-y divide-gray-100">
            <div className="p-6">
              <h3 className="font-semibold text-black mb-2">What is your return policy?</h3>
              <p className="text-gray-600 font-light">
                We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. Please see our Returns section for more details.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-black mb-2">How do I track my order?</h3>
              <p className="text-gray-600 font-light">
                Once your order has shipped, you will receive a shipping confirmation email with a tracking number. You can use this number to track your order on the carrier's website.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-black mb-2">Do you ship internationally?</h3>
              <p className="text-gray-600 font-light">
                Currently, we only ship within the United States. We are working on expanding our shipping options in the future.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Info Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-normal text-black mb-4">Shipping Information</h2>
          <div className="bg-white border border-gray-100 p-6">
            <p className="text-gray-600 font-light mb-4">
              We offer standard shipping on all orders. Please allow 3-5 business days for your order to be processed and shipped.
            </p>
            <p className="text-gray-600 font-light">
              Standard Shipping (5-7 business days): $5.00
            </p>
            <p className="text-gray-600 font-light mt-2">
              Express Shipping (2-3 business days): $15.00
            </p>
          </div>
        </section>

        {/* Returns Section */}
        <section>
          <h2 className="text-2xl font-normal text-black mb-4">Returns</h2>
          <div className="bg-white border border-gray-100 p-6">
            <p className="text-gray-600 font-light mb-4">
              To initiate a return, please contact our customer service team at <a href="mailto:support@clothify.com" className="text-black hover:underline">support@clothify.com</a> with your order number and reason for return.
            </p>
            <p className="text-gray-600 font-light">
              Once your return is approved, you will receive a return shipping label via email.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
