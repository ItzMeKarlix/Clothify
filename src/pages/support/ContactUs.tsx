import React, { useState, useEffect } from 'react';
import { supportTicketService, supportTicketCategoryService, authService, supportTicketAttachmentService, supabase } from '../../api/api';
import { SupportTicketCategory, SupportTicket } from '../../types/database';
import { MessageSquare, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [emailForTickets, setEmailForTickets] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    fetchCategories();
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'view') {
      fetchMyTickets();
    }
  }, [isAuthenticated, activeTab]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await supportTicketCategoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const session = await authService.getCurrentSession();
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || ''
        }));
        setEmailForTickets(session.user.email || '');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
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
      await supportTicketService.addResponse({ ticket_id: selectedTicket.id, responder_id: '' as any, response_text: newResponseText.trim(), is_internal: false } as any);
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

    setLoading(true);
    setSubmitError(null);

    try {
      // Get user info if authenticated
      let customerId: string | null = null;
      let customerEmail = formData.email;
      let customerName = `${formData.firstName} ${formData.lastName}`.trim();

      if (isAuthenticated) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            customerId = user.id;
            customerEmail = user.email || formData.email;
          }
        } catch (authError) {
          console.warn('Auth check failed, proceeding as anonymous:', authError);
        }
      }

      // Prepare ticket data - keep it simple
      const ticketData = {
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

      // Handle file upload if present
      if (file) {
        try {
          await supportTicketAttachmentService.uploadAttachment(data.id, file, customerId || 'anonymous');
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setSubmitError('Ticket created successfully, but file upload failed.');
          return;
        }
      }

      setSubmitSuccess(true);

      // Populate email for ticket lookup and reset form
      setEmailForTickets(customerEmail || '');
      // Auto-switch to view tab so user can immediately see their ticket(s)
      setActiveTab('view');
      setEmailSubmitted(true);
      if (!isAuthenticated && customerEmail) {
        // fetch tickets for the provided email
        await fetchTicketsByEmail(customerEmail);
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: isAuthenticated ? customerEmail : '',
        phone: '',
        orderNumber: '',
        subject: 'General Inquiry',
        message: '',
      });
      setFile(null);

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitError(`Failed to submit ticket: ${errorMessage}`);
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
          ) : !isAuthenticated && !emailSubmitted ? (
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
            <>
              {ticketsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-red-800">{ticketsError}</p>
                </div>
              )}

              {tickets.length === 0 ? (
                !isAuthenticated ? (
                  <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    {emailSubmitted ? (
                      <>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">No tickets found for "{emailForTickets}"</h2>
                        <p className="text-sm text-gray-600 mb-4">We couldn't find any tickets for this email. Please check the email address and try again or submit a new ticket.</p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">View Your Tickets</h2>
                        <p className="text-blue-700 mb-4">Enter the email address you used to submit your support ticket.</p>
                      </>
                    )}

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={emailForTickets}
                        onChange={(e) => setEmailForTickets(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          View My Tickets
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveTab('submit'); setEmailSubmitted(false); }}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                        >
                          Submit Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">No Support Tickets</h2>
                    <p className="text-gray-500 mb-6">
                      You haven't submitted any support tickets yet.
                    </p>
                    <button
                      onClick={() => setActiveTab('submit')}
                      className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
                    >
                      Submit Your First Ticket
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      You have {tickets.length} support ticket{tickets.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={isAuthenticated ? fetchMyTickets : () => fetchTicketsByEmail(emailForTickets)}
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

                      {ticket.assigned_to_email && (
                        <div className="mt-3 text-sm text-gray-600">
                          Assigned to: {ticket.assigned_to_email}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={closeTicketModal} />
                      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 z-10 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">Ticket #{selectedTicket.ticket_number} - {selectedTicket.subject}</h3>
                            <p className="text-sm text-gray-500">Submitted: {new Date(selectedTicket.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <button onClick={closeTicketModal} className="text-gray-500 hover:text-black">Close</button>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                            <div className="bg-gray-50 rounded p-4">
                              <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Responses</h4>
                            {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                              <div className="space-y-3">
                                {selectedTicket.responses.map((resp) => (
                                  <div key={resp.id} className="border-l-2 pl-3 py-2 bg-white rounded-md">
                                    <div className="text-xs text-gray-500 mb-1">
                                      <span className="font-medium text-gray-700">{resp.responder_email || 'Support Team'}</span>
                                      <span className="mx-2">•</span>
                                      <span>{new Date(resp.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="text-gray-700 text-sm whitespace-pre-line">{resp.response_text}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No responses yet.</p>
                            )}
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Add a response</h4>
                            <textarea value={newResponseText} onChange={(e) => setNewResponseText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" rows={4} />
                            <div className="mt-3 flex justify-end">
                              <button onClick={submitResponse} disabled={responseSubmitting} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                                {responseSubmitting ? 'Sending...' : 'Send Reply'}
                              </button>
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
    </div>
  );
};

export default ContactUs;
