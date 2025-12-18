import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Terms and Conditions"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Terms and Conditions</h1>
      <div className="space-y-4 text-gray-700 font-light">
        <p>
          Welcome to Clothify! These terms and conditions outline the rules and regulations for the use of Clothify's Website, located at clothify.com.
        </p>
        <p>
          By accessing this website we assume you accept these terms and conditions. Do not continue to use Clothify if you do not agree to take all of the terms and conditions stated on this page.
        </p>
        <h2 className="font-semibold text-black mt-4 mb-2">Cookies</h2>
        <p>
          We employ the use of cookies. By accessing Clothify, you agreed to use cookies in agreement with the Clothify's Privacy Policy.
        </p>
        <p>
          Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.
        </p>
        <h2 className="font-semibold text-black mt-4 mb-2">License</h2>
        <p>
          Unless otherwise stated, Clothify and/or its licensors own the intellectual property rights for all material on Clothify. All intellectual property rights are reserved. You may access this from Clothify for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc list-inside space-y-2">
            <li>Republish material from Clothify</li>
            <li>Sell, rent or sub-license material from Clothify</li>
            <li>Reproduce, duplicate or copy material from Clothify</li>
            <li>Redistribute content from Clothify</li>
        </ul>
        <p>This Agreement shall begin on the date hereof.</p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
