import React, { useState, useEffect } from 'react';
import { customerService, supportTicketService, orderService } from '../../api/api';
import { supabase } from '../../api/api';
import { Users, RefreshCw, MessageSquare, AlertTriangle, CheckCircle, Clock, XCircle, Eye, UserCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from 'react-hot-toast';

interface Customer {
  user_id: string;
  email: string;
  customer_name?: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  role_assigned_at: string | null;
  is_placeholder?: boolean;
}

interface SupportTicket {
  id: number;
  ticket_number: string;
  customer_id: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category_id: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  customer_email?: string;
  assigned_to_email?: string;
  category_name?: string;
}

const EmployeeCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{
    customer: Customer | null;
    orders: any[];
    tickets: any[];
  } | null>(null);

  // Ticket modal states
  const [ticketDetails, setTicketDetails] = useState<{
    ticket: SupportTicket | null;
    responses: any[];
  } | null>(null);
  const [respondModal, setRespondModal] = useState<{
    ticket: SupportTicket | null;
    response: string;
    responses: any[];
  } | null>(null);
  const [confirmResolve, setConfirmResolve] = useState<SupportTicket | null>(null);
  const [newResponse, setNewResponse] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
    fetchSupportTickets();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('🔍 Fetching customers for employees...');

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Auth error:', authError);
        setError('Authentication error. Please log in again.');
        return;
      }
      if (!user) {
        console.error('❌ No authenticated user');
        setError('Not authenticated. Please log in.');
        return;
      }
      console.log('✅ Authenticated user:', user.email);

      const customersData = await customerService.getAllForEmployees();
      console.log('✅ Customers fetched:', customersData);

      setCustomers(customersData || []);
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      setError(`Failed to load customers: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      console.log('🔍 Fetching support tickets for employee...');

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Auth error for tickets:', authError);
        setSupportTickets([]);
        return;
      }

      // For employees, show tickets assigned to them or unassigned tickets
      const assignedTickets = await supportTicketService.getAssignedTickets();
      console.log('✅ Assigned tickets:', assignedTickets);

      // Get unassigned tickets (tickets with no assigned_to)
      const { data: allTickets, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          support_ticket_categories(name)
        `)
        .is('assigned_to', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching unassigned tickets:', error);
        setSupportTickets(assignedTickets);
        return;
      }

      console.log('✅ Unassigned tickets:', allTickets);

      // Transform unassigned tickets (no need to fetch user emails since they're unassigned)
      const unassignedTickets = (allTickets || []).map(ticket => ({
        ...ticket,
        customer_email: ticket.customer_email,
        assigned_to_email: null, // Unassigned tickets have no assigned email
        category_name: ticket.support_ticket_categories?.name
      }));

      // Combine assigned and unassigned tickets
      const combinedTickets = [...assignedTickets, ...unassignedTickets];

      // Remove duplicates
      const uniqueTickets = combinedTickets.filter((ticket, index, self) =>
        index === self.findIndex(t => t.id === ticket.id)
      );

      console.log('✅ Combined tickets:', uniqueTickets);
      setSupportTickets(uniqueTickets);
    } catch (err) {
      console.error('❌ Error fetching support tickets:', err);
      setSupportTickets([]);
    }
  };

  const handleContactCustomer = async (customerEmail: string) => {
    // Open email client or show contact form
    const subject = encodeURIComponent('Support Inquiry');
    const body = encodeURIComponent('Hello,\n\nI\'m reaching out regarding your recent inquiry...\n\nBest regards,\nSupport Team');
    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`);
  };

  const handleViewCustomerDetails = async (customerId: string, customerEmail: string) => {
    try {
      const customerOrders = await orderService.getByCustomerEmail(customerEmail);
      const customerTickets = await supportTicketService.getTicketsByEmail(customerEmail);

      setCustomerDetails({
        customer: {
          user_id: customerId,
          email: customerEmail,
          user_created_at: new Date().toISOString(),
          customer_name: undefined,
          last_sign_in_at: null,
          email_confirmed_at: null,
          role: 'customer',
          role_assigned_at: null
        },
        orders: customerOrders,
        tickets: customerTickets
      });
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details', { id: 'emp-customers-load-failed' });
    }
  };

  const handleViewTicketDetails = async (ticketId: number, ticketSubject: string) => {
    try {
      const responses = await supportTicketService.getResponses(ticketId);
      const ticket = supportTickets.find(t => t.id === ticketId);
      setTicketDetails({
        ticket: ticket || null,
        responses: responses
      });
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('Failed to load ticket details', { id: 'emp-customers-ticket-load-failed' });
    }
  };

  const handleRespondToTicket = async (ticket: SupportTicket) => {
    try {
      // Fetch responses for this ticket to display in the respond modal
      const details = await supportTicketService.getTicketWithResponses(ticket.id);
      setRespondModal({
        ticket,
        response: '',
        responses: details.responses
      });
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
      // Still open the modal even if responses fail to load
      setRespondModal({
        ticket,
        response: '',
        responses: []
      });
    }
  };

  const handleSubmitResponse = async (ticketId?: string | number, responseText?: string) => {
    // Support both old modal style and new integrated style
    const response = responseText || (respondModal ? respondModal.response : '');
    const id = ticketId || (respondModal?.ticket?.id);

    if (!response.trim() || !id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supportTicketService.addResponse({
        ticket_id: Number(id),
        responder_id: user.id,
        response_text: response,
        is_internal: false
      });

      toast.success('Response added successfully!', { id: 'emp-response-added' });
      
      // Refresh ticket responses in the modal
      if (respondModal?.ticket) {
        const details = await supportTicketService.getTicketWithResponses(respondModal.ticket.id);
        setRespondModal(prev => prev ? {
          ...prev,
          response: '',
          responses: details.responses
        } : null);
      }
      fetchSupportTickets(); // Refresh tickets
    } catch (error) {
      console.error('❌ Error adding response:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      toast.error('Failed to add response', { id: 'emp-response-failed' });
    }
  };

  const handleMarkResolved = (ticket: SupportTicket) => {
    setConfirmResolve(ticket);
  };

  const handleConfirmResolve = async () => {
    if (!confirmResolve) return;

    try {
      await supportTicketService.resolveTicket(confirmResolve.id);
      setConfirmResolve(null);
      toast.success('Ticket marked as resolved!', { id: 'emp-ticket-resolved' });
      fetchSupportTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast.error('Failed to resolve ticket', { id: 'emp-resolve-failed' });
    }
  };

  const handleAssignToMe = async (ticketId: number, ticketSubject: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supportTicketService.assignTicket(ticketId, user.id);
      toast.success('Ticket assigned to you successfully!', { id: 'emp-ticket-assigned' });
      fetchSupportTickets(); // Refresh tickets
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket', { id: 'emp-assign-failed' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading customers...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => { fetchCustomers(); fetchSupportTickets(); }} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Customer Support</h1>
        </div>
        <Button onClick={() => { fetchCustomers(); fetchSupportTickets(); }} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Customers Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Customer Directory
          </CardTitle>
          <CardDescription className="text-sm">View customer information and account status</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
              <p className="text-sm">Customer data will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {customers.map((customer) => (
                <div key={customer.user_id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{customer.email}</h3>
                        <Badge variant={customer.role === 'admin' ? 'destructive' : customer.role === 'employee' ? 'default' : 'outline'}>
                          {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={!customer.email_confirmed_at ? 'secondary' : !customer.last_sign_in_at ? 'outline' : 'default'}>
                          {!customer.email_confirmed_at ? 'Unverified' : !customer.last_sign_in_at ? 'Never Signed In' : 'Active'}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p>Joined: {new Date(customer.user_created_at).toLocaleDateString()}</p>
                        <p>Last sign in: {customer.last_sign_in_at ? new Date(customer.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Button size="sm" variant="outline" onClick={() => handleViewCustomerDetails(customer.user_id, customer.email)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Tickets Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Support Tickets
          </CardTitle>
          <CardDescription className="text-sm">Manage customer support requests and inquiries</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {supportTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No support tickets found</p>
              <p className="text-sm">New tickets will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{ticket.subject}</h3>
                        <Badge variant={
                          ticket.status === 'open' ? 'destructive' :
                          ticket.status === 'in-progress' ? 'default' :
                          ticket.status === 'resolved' ? 'secondary' :
                          'outline'
                        }>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p>Ticket #{ticket.ticket_number} • From: {ticket.customer_email}</p>
                        {ticket.category_name && <p>Category: {ticket.category_name}</p>}
                        <p>Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
                      </div>
                      {/* Assignee Information */}
                      {ticket.assigned_to_email ? (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900">
                              Assigned to: {ticket.assigned_to_email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-900">
                              Unassigned - Available for pickup
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleRespondToTicket(ticket)}>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Respond
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleMarkResolved(ticket)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                          {!ticket.assigned_to && (
                            <Button size="sm" variant="outline" onClick={() => handleAssignToMe(ticket.id, ticket.subject)}>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Assign to Me
                            </Button>
                          )}
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewTicketDetails(ticket.id, ticket.subject)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      {customerDetails ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Customer Details</h3>
                </div>
                <button
                  onClick={() => setCustomerDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {customerDetails.customer && (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm font-medium">{customerDetails.customer.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm">{customerDetails.customer.customer_name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">First Seen</label>
                        <p className="text-sm">{new Date(customerDetails.customer.user_created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{customerDetails.orders.length}</div>
                      <div className="text-sm text-gray-500">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{customerDetails.tickets.length}</div>
                      <div className="text-sm text-gray-500">Support Tickets</div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {customerDetails.orders.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recent Orders</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {customerDetails.orders.slice(0, 5).map((order, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">Order #{order.id}</span>
                            <span className="text-sm font-medium">${order.total_amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Tickets */}
                  {customerDetails.tickets.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recent Support Tickets</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {customerDetails.tickets.slice(0, 5).map((ticket, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate">{ticket.subject}</span>
                            <Badge variant={
                              ticket.status === 'open' ? 'destructive' :
                              ticket.status === 'in-progress' ? 'default' :
                              ticket.status === 'resolved' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Ticket Details Modal */}
      {ticketDetails ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Ticket Details</h3>
                </div>
                <button
                  onClick={() => setTicketDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {ticketDetails.ticket && (
                <div className="space-y-6">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subject</label>
                        <p className="text-sm font-medium">{ticketDetails.ticket.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ticket Number</label>
                        <p className="text-sm">#{ticketDetails.ticket.ticket_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer</label>
                        <p className="text-sm">{ticketDetails.ticket.customer_email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge variant={
                          ticketDetails.ticket.status === 'open' ? 'destructive' :
                          ticketDetails.ticket.status === 'in-progress' ? 'default' :
                          ticketDetails.ticket.status === 'resolved' ? 'secondary' :
                          'outline'
                        }>
                          {ticketDetails.ticket.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Priority</label>
                        <Badge variant="outline" className="text-xs">
                          {ticketDetails.ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-sm">{new Date(ticketDetails.ticket.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assignee Information */}
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-3">Assignment Details</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {ticketDetails.ticket.assigned_to ? (
                        <div className="flex items-center gap-3">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Assigned to: {ticketDetails.ticket.assigned_to_email || 'Unknown Employee'}
                            </p>
                            <p className="text-xs text-blue-700">
                              This ticket is currently being handled by a support team member
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">
                              Unassigned Ticket
                            </p>
                            <p className="text-xs text-orange-700">
                              This ticket is available for assignment and needs attention
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{ticketDetails.ticket.description}</p>
                    </div>
                  </div>

                  {/* Responses */}
                  <div>
                    <h4 className="font-medium mb-3">Responses ({ticketDetails.responses.length})</h4>
                    {ticketDetails.responses.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {ticketDetails.responses.map((response, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{response.responder_name || response.responder_email || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No responses yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Respond to Ticket Modal */}
      {respondModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Respond to Ticket</h3>
                </div>
                <button
                  onClick={() => setRespondModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {respondModal.ticket && (
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{respondModal.ticket.subject}</p>
                    <p className="text-xs text-gray-500">#{respondModal.ticket.ticket_number} • {respondModal.ticket.customer_email}</p>
                  </div>
                  {respondModal.ticket.assigned_to_email && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700">{respondModal.ticket.assigned_to_email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body - Two Column Layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side - Conversation History */}
              <div className="flex-1 border-r overflow-y-auto p-6">
                <h4 className="font-semibold text-sm mb-4">Conversation</h4>
                {respondModal?.responses && respondModal.responses.length > 0 ? (
                  <div className="space-y-3">
                    {respondModal.responses.map((response, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{response.responder_name || response.responder_email || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No responses yet</p>
                )}
              </div>

              {/* Right Side - Response Form */}
              <div className="w-150 bg-gray-50 p-6 overflow-y-auto flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Your Response</label>
                  <textarea
                    className="flex-1 p-4 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your response here..."
                    value={respondModal.response}
                    onChange={(e) => setRespondModal({...respondModal, response: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 mt-auto pt-4">
                  <Button onClick={() => handleSubmitResponse(respondModal.ticket?.id, respondModal.response)} disabled={!respondModal.response.trim()} className="flex-1">
                    Send Response
                  </Button>
                  <Button variant="outline" onClick={() => setRespondModal(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm Resolve Modal */}
      {confirmResolve ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-semibold">Confirm Resolution</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to mark this ticket as resolved?
                </p>

                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">{confirmResolve.subject}</p>
                  <p className="text-xs text-gray-500">#{confirmResolve.ticket_number} • {confirmResolve.customer_email}</p>
                  {confirmResolve.assigned_to_email && (
                    <div className="mt-2 flex items-center gap-2">
                      <UserCheck className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-700">
                        Assigned to: {confirmResolve.assigned_to_email}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleConfirmResolve} className="bg-green-600 hover:bg-green-700">
                    Mark as Resolved
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmResolve(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EmployeeCustomers;