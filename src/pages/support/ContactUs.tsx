import React, { useState, useEffect } from 'react';
import { supportTicketService, supportTicketCategoryService, authService, supportTicketAttachmentService, supabase } from '../../api/api';
import { SupportTicketCategory, SupportTicket } from '../../types/database';
import { MessageSquare, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

declare global {
  interface Window {
    turnstile: any;
  }
}

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
  const [categories, setCategories] = useState<SupportTicketCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [emailForTickets, setEmailForTickets] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Load Turnstile script only when modal opens
  useEffect(() => {
    if (!captchaModalOpen) return;

    let mounted = true;
    (async () => {
      try {
        const { loadTurnstileScript, initializeTurnstile } = await import('../../utils/auth');
        await loadTurnstileScript();
        if (!mounted) return;
        await initializeTurnstile('captcha-modal-container');
      } catch (err) {
        console.warn('Turnstile setup error:', err);
        if (mounted) setCaptchaError('Failed to load CAPTCHA. Please try again.');
      }
    })();
    return () => { mounted = false; };
  }, [captchaModalOpen]);

  useEffect(() => {
    if (activeTab === 'view') {
      // Reset email submission when switching to view tab
      setEmailSubmitted(false);
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await supportTicketCategoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };



  const fetchMyTickets = async () => {
    try {
      setTicketsLoading(true);
      const myTickets = await supportTicketService.getMyTickets();
      setTickets(myTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTicketsError('Failed to load your support tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchTicketsByEmail = async (userEmail: string) => {
    try {
      setTicketsLoading(true);
      const userTickets = await supportTicketService.getTicketsByEmail(userEmail);
      setTickets(userTickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setTicketsError('Failed to load support tickets. Please check your email address and try again.');
    } finally {
      setTicketsLoading(false);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newResponseText, setNewResponseText] = useState('');
  const [responseSubmitting, setResponseSubmitting] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailForTickets.trim()) {
      setEmailSubmitted(true);
      fetchTicketsByEmail(emailForTickets.trim());
    }
  };

  const openTicketModal = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
    // fetch fresh responses
    try {
      const responses = await supportTicketService.getResponses(ticket.id);
      setSelectedTicket((prev) => prev ? { ...prev, responses } : { ...ticket, responses });
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    }
  };

  const closeTicketModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
    setNewResponseText('');
  };

  const submitResponse = async () => {
    if (!selectedTicket || !newResponseText.trim()) return;
    setResponseSubmitting(true);
    try {
      // For anonymous customers, we don't have a responder_id - allow null in DB
      await supportTicketService.addResponse({ ticket_id: selectedTicket.id, responder_id: null, response_text: newResponseText.trim(), is_internal: false } as any);
      // refresh responses
      const responses = await supportTicketService.getResponses(selectedTicket.id);
      setSelectedTicket((prev) => prev ? { ...prev, responses } : prev);
      // Also update the tickets list if needed
      setTickets((prev) => prev.map(t => t.id === selectedTicket.id ? { ...t, responses } : t));
      setNewResponseText('');
    } catch (err) {
      console.error('Error adding response:', err);
      setTicketsError('Failed to add response. Please try again.');
    } finally {
      setResponseSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'waiting-for-customer':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting-for-customer':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fileError) {
      alert(fileError);
      return;
    }

    // Open CAPTCHA modal - don't submit yet
    setCaptchaModalOpen(true);
    setCaptchaError(null);
  };

  // Handle CAPTCHA verification and ticket submission
  const handleCaptchaSubmit = async () => {
    try {
      // Verify CAPTCHA
      if (!window.turnstile) {
        setCaptchaError('CAPTCHA not loaded. Please refresh and try again.');
        return;
      }
      const token = window.turnstile.getResponse();
      if (!token) {
        setCaptchaError('Please complete the CAPTCHA verification');
        return;
      }

      setCaptchaToken(token);
      setLoading(true);
      setSubmitError(null);

      // Customer info (always derived from the submitted form for public contact page)
      let customerId: string | null = null;
      let customerEmail = formData.email;
      let customerName = `${formData.firstName} ${formData.lastName}`.trim();

      // Generate ticket number: TICK-YYYYMMDD-XXXXX (e.g., TICK-20240114-12345)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      const ticketNumber = `TICK-${dateStr}-${randomNum}`;

      // Prepare ticket data
      const ticketData = {
        ticket_number: ticketNumber,
        customer_id: customerId,
        customer_email: customerEmail,
        customer_name: customerName,
        subject: formData.subject + (formData.orderNumber ? ` - Order ${formData.orderNumber}` : ''),
        description: formData.message,
        category_id: null, // Start with null, we'll handle categories later
        priority: 'medium' as const,
        status: 'open' as const
      };

      console.log('Submitting ticket data:', ticketData);

      // Try direct Supabase call first (bypass our API service)
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      console.log('Ticket created successfully:', data);

      // Handle file upload if present and user is authenticated
      if (file && customerId) {
        try {
          await supportTicketAttachmentService.uploadAttachment(data.id, file, customerId);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setSubmitError('Ticket created successfully, but file upload failed.');
          return;
        }
      } else if (file && !customerId) {
        console.warn('File not uploaded: Anonymous users cannot upload files to support tickets');
      }

      setSubmitSuccess(true);

      // Populate email for ticket lookup and reset form
      setEmailForTickets(customerEmail || '');
      // Auto-switch to view tab so user can immediately see their ticket(s)
      setActiveTab('view');
      setEmailSubmitted(true);
      if (customerEmail) {
        // fetch tickets for the provided email
        await fetchTicketsByEmail(customerEmail);
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        orderNumber: '',
        subject: 'General Inquiry',
        message: '',
      });
      setFile(null);
      setCaptchaToken(null);
      window.turnstile?.reset();
      setCaptchaModalOpen(false);

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(`Failed to submit ticket: ${errorMessage}`);
      setCaptchaToken(null);
      window.turnstile?.reset();
    } finally {
      setLoading(false);
    }
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

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'submit'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Submit Ticket
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'view'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          View Tickets
        </button>
      </div>

      {/* Submit Ticket Tab */}
      {activeTab === 'submit' && (
        <>
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-green-800">
                <strong>Success!</strong> Your support ticket has been submitted successfully.
                You can view its progress in the "View Tickets" tab above.
              </p>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">
                <strong>Error:</strong> {submitError}
              </p>
            </div>
          )}

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
          value={formData.subject}
        >
          {categories.length > 0 ? (
            categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))
          ) : (
            <>
              <option>General Inquiry</option>
              <option>Order Issue</option>
              <option>Product Question</option>
              <option>Return/Exchange</option>
              <option>Account Issue</option>
              <option>Technical Support</option>
              <option>Billing/Payment</option>
              <option>Other</option>
            </>
          )}
        </select>
        <textarea
          name="message"
          placeholder="Your Message"
          rows={5}
          maxLength={2000}
          onChange={handleInputChange}
          value={formData.message}
          className="w-full p-3 border border-gray-300 rounded-md"
          required
        ></textarea>
        <div className="flex justify-between items-center mt-2 mb-4">
          <label htmlFor="file" className="text-sm font-medium text-gray-700">
            Attach an image (optional, max 50MB)
          </label>
          <p className="text-sm text-gray-500">{formData.message.length}/2000</p>
        </div>
        <div>
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
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Support Ticket'}
        </button>
      </form>
        </>
      )}

      {/* View Tickets Tab */}
      {activeTab === 'view' && (
        <>
          {ticketsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading your support tickets...</p>
            </div>
          ) : !emailSubmitted ? (
            // Show email entry form if email hasn't been submitted yet (for all users)
            <div className="text-center py-8">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-6 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-blue-800 mb-2">View Your Tickets</h2>
                <p className="text-blue-700 mb-4">
                  Enter the email address you used to submit your support ticket.
                </p>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={emailForTickets}
                    onChange={(e) => setEmailForTickets(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    View My Tickets
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Show tickets or no tickets message after email is submitted
            <>
              {ticketsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-red-800">{ticketsError}</p>
                </div>
              )}

              {tickets.length === 0 ? (
                <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">No Support Tickets</h2>
                  {emailSubmitted ? (
                    <p className="text-sm text-gray-600 mb-4">We couldn't find any tickets for "{emailForTickets}". Please check the email address and try again or submit a new ticket.</p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-4">You haven't submitted any support tickets yet.</p>
                  )}
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Submit Your First Ticket
                  </button>
                  {emailSubmitted && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4 border-t pt-4">
                      <input
                        type="email"
                        value={emailForTickets}
                        onChange={(e) => setEmailForTickets(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Try Another Email
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      You have {tickets.length} support ticket{tickets.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => fetchTicketsByEmail(emailForTickets)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>

                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(ticket.status)}
                            <h3 className="text-xl font-semibold text-black">
                              Ticket #{ticket.ticket_number}
                            </h3>
                          </div>
                          <h4 className="text-lg font-medium text-gray-800 mb-2">
                            {ticket.subject}
                          </h4>
                              {ticket.category_name && (
                            <p className="text-sm text-gray-600 mb-2">
                              Category: {ticket.category_name}
                            </p>
                          )}

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => openTicketModal(ticket)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-4 mb-4">
                        <p className="text-gray-700 whitespace-pre-line">
                          {ticket.description}
                        </p>
                      </div>



                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Created: {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                          {new Date(ticket.created_at).toLocaleTimeString()}
                        </span>
                        <span>
                          Last updated: {new Date(ticket.updated_at).toLocaleDateString()} at{' '}
                          {new Date(ticket.updated_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {ticket.assigned_to && (
                        <div className="mt-3 text-sm text-gray-600">
                          Assigned to: {ticket.assigned_to_email || 'Support Team'}
                        </div>
                      )}

                      {ticket.status === 'resolved' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 text-sm">
                            This ticket has been resolved. If you need further assistance, please create a new support ticket.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Ticket detail modal */}
                  {modalOpen && selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/40" onClick={closeTicketModal} />
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[85vh] z-10 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
                          <div>
                            <h3 className="text-xl font-semibold">Ticket #{selectedTicket.ticket_number} - {selectedTicket.subject}</h3>
                            <p className="text-sm text-gray-500">Submitted: {new Date(selectedTicket.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <button onClick={closeTicketModal} className="text-gray-500 hover:text-black">Close</button>
                          </div>
                        </div>

                        <div className="p-6 flex-1 overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Left Column - Conversation */}
                            <div className="flex flex-col h-full min-h-0">
                              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">Details</h4>
                                <ScrollArea className="flex-1 rounded bg-gradient-to-b from-white to-gray-50 min-h-0">
                                  <div className="p-4">
                                    <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description}</p>
                                  </div>
                                </ScrollArea>
                              </div>

                              <div className="flex-1 overflow-hidden flex flex-col min-h-0 mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">Responses</h4>
                                <ScrollArea className="flex-1 rounded bg-gradient-to-b from-white to-gray-50 min-h-0">
                                  <div className="p-4 h-full">
                                    {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                                      <div className="space-y-3">
                                        {selectedTicket.responses.map((resp) => {
                                          const isYou = resp.responder_id === null;
                                          return (
                                            <div key={resp.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                                              <div className={`border rounded-lg p-4 max-w-xs ${isYou ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                  <span className={`font-medium text-sm ${isYou ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {isYou ? 'You' : (resp.responder_name || resp.responder_email || 'Support Team')}
                                                  </span>
                                                  <span className="text-xs text-gray-500 flex-shrink-0">{new Date(resp.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{resp.response_text}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No responses yet.</p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>

                            {/* Right Column - Reply Box */}
                            <div className="md:border-l md:border-gray-200 md:pl-6 flex flex-col h-full">
                              {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ticket Closed</h4>
                                    <p className="text-sm text-gray-600">
                                      This ticket has been {selectedTicket.status}. 
                                      {selectedTicket.status === 'resolved' ? ' If you need further assistance, please create a new support ticket.' : ''}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">Add a response</h4>
                                  <div className="flex flex-col flex-1">
                                    <textarea 
                                      value={newResponseText} 
                                      onChange={(e) => setNewResponseText(e.target.value)} 
                                      className="w-full p-3 border border-gray-300 rounded-md flex-1 resize-none" 
                                      placeholder="Type your message here..."
                                    />
                                    <div className="mt-4 flex justify-end flex-shrink-0">
                                      <button 
                                        onClick={submitResponse} 
                                        disabled={responseSubmitting || !newResponseText.trim()} 
                                        className="bg-black text-white px-6 py-2.5 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                      >
                                        {responseSubmitting ? 'Sending...' : 'Send Reply'}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* CAPTCHA Modal */}
      {captchaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify You're Human</h2>
            <p className="text-sm text-gray-600 mb-6">Please complete the CAPTCHA verification to proceed with submitting your support ticket.</p>
            
            {captchaError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {captchaError}
              </div>
            )}

            {/* Turnstile CAPTCHA Container */}
            <div id="captcha-modal-container" className="flex justify-center mb-6"></div>

            {/* Modal Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setCaptchaModalOpen(false);
                  setCaptchaError(null);
                  window.turnstile?.reset();
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCaptchaSubmit}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Verify & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
