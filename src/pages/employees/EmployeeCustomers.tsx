import React, { useState, useEffect } from 'react';
import { customerService, supportTicketService } from '../../api/api';
import { Users, RefreshCw, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Customer {
  user_id: string;
  email: string;
  customer_name?: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  role_assigned_at: string | null;
}

interface SupportTicket {
  id: number;
  ticket_number: string;
  customer_id: string;
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

  useEffect(() => {
    fetchCustomers();
    fetchSupportTickets();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching customers from support tickets...');
      const customersData = await customerService.getAll();
      console.log('✅ Customers fetched:', customersData);
      setCustomers(customersData);
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      // For employees, show tickets assigned to them or unassigned tickets
      const assignedTickets = await supportTicketService.getAssignedTickets();
      const allTickets = await supportTicketService.getAll();

      // Combine assigned tickets with unassigned ones for employee view
      const unassignedTickets = allTickets.filter(ticket => !ticket.assigned_to);
      const combinedTickets = [...assignedTickets, ...unassignedTickets];

      // Remove duplicates
      const uniqueTickets = combinedTickets.filter((ticket, index, self) =>
        index === self.findIndex(t => t.id === ticket.id)
      );

      setSupportTickets(uniqueTickets);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    }
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Open</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />In Progress</Badge>;
      case 'waiting-for-customer':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />Waiting</Badge>;
      case 'resolved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">URGENT</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs">HIGH</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">LOW</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const getCustomerStatusBadge = (lastSignIn: string | null, emailConfirmed: string | null) => {
    if (!emailConfirmed) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    if (!lastSignIn) {
      return <Badge variant="outline">Never Signed In</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'employee':
        return <Badge variant="default">Employee</Badge>;
      default:
        return <Badge variant="outline">Customer</Badge>;
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
                        {getRoleBadge(customer.role)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getCustomerStatusBadge(customer.last_sign_in_at, customer.email_confirmed_at)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p>Joined: {new Date(customer.user_created_at).toLocaleDateString()}</p>
                        <p>Last sign in: {customer.last_sign_in_at ? new Date(customer.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Button size="sm" variant="outline" onClick={() => alert(`Contact customer: ${customer.email}`)}>
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => alert(`View customer details for: ${customer.email}`)}>
                        View Details
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
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">{ticket.subject}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        Ticket #{ticket.ticket_number} • {ticket.customer_email}
                      </p>
                      {ticket.category_name && (
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">Category: {ticket.category_name}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getTicketStatusBadge(ticket.status)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{ticket.description}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 mb-3">
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>

                  {ticket.assigned_to_email && (
                    <p className="text-xs text-gray-600 mb-3">Assigned to: {ticket.assigned_to_email}</p>
                  )}

                  <Separator className="my-3" />

                  <div className="flex flex-wrap gap-2">
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <>
                        <Button size="sm" onClick={() => alert(`Respond to ticket: ${ticket.subject}`)}>
                          Respond
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => alert(`Mark ticket as resolved: ${ticket.subject}`)}>
                          Mark Resolved
                        </Button>
                        {!ticket.assigned_to && (
                          <Button size="sm" variant="secondary" onClick={() => alert(`Assign ticket to yourself: ${ticket.subject}`)}>
                            Assign to Me
                          </Button>
                        )}
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => alert(`View full ticket details: ${ticket.subject}`)}>
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-sm">Support Guidelines</h3>
            <p className="text-sm text-muted-foreground mb-3">
              As an employee, you can assist customers with:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Order status inquiries</li>
              <li>Product information and recommendations</li>
              <li>Basic account support</li>
              <li>Return and exchange guidance</li>
              <li>Shipping information</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              For complex issues or account modifications, please escalate to an administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCustomers;