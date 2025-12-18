import React, { useState } from 'react';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setFileError('File size must be less than 50MB');
        setFile(null);
      } else {
        setFileError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) {
      alert(fileError);
      return;
    }
    console.log({ ...formData, file });
    // Here you would typically send the form data and file to your backend
  };

  return (
    <div className="bg-white border border-gray-100 p-8">
      <img
        src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        alt="Contact us"
        className="w-full h-48 object-cover mb-6"
      />
      <h1 className="text-3xl font-light text-black mb-6 tracking-wide">Contact Us</h1>
      <div className="space-y-4 text-gray-700 font-light mb-8">
        <p>
          Have a question or need assistance? Our customer service team is here to help.
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:support@clothify.com" className="text-black hover:underline">
            support@clothify.com
          </a>
        </p>
        <p>
          <strong>Phone:</strong> 1-800-CLOTHIFY
        </p>
        <p>
          Our support hours are Monday to Friday, 9 AM to 5 PM EST.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="orderNumber"
          placeholder="Order Number (if applicable)"
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        <select
          name="subject"
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        >
          <option>General Inquiry</option>
          <option>Order Status</option>
          <option>Return/Exchange</option>
          <option>Product Information</option>
          <option>Feedback</option>
          <option>Other</option>
        </select>
        <textarea
          name="message"
          placeholder="Your Message"
          rows={5}
          onChange={handleInputChange}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        ></textarea>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Attach an image (optional, max 50MB)
          </label>
          <input
            type="file"
            name="file"
            id="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            accept="image/*"
          />
          {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
