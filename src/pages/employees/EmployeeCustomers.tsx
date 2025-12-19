import React, { useState, useEffect } from 'react';
import { customerService, supportTicketService } from '../../api/api';

interface Customer {
  user_id: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  role_assigned_at: string;
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
      const customersData = await customerService.getAll();
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
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

  const getTicketStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm';
      case 'in-progress':
        return 'px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm';
      case 'waiting-for-customer':
        return 'px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-sm';
      case 'resolved':
        return 'px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm';
      case 'closed':
        return 'px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-sm';
      default:
        return 'px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-sm';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium';
      case 'high':
        return 'px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium';
      case 'medium':
        return 'px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium';
      case 'low':
        return 'px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium';
      default:
        return 'px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium';
    }
  };

  const getCustomerStatus = (lastSignIn: string | null, emailConfirmed: string | null) => {
    if (!emailConfirmed) {
      return { status: 'Unverified', className: 'px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm' };
    }
    if (!lastSignIn) {
      return { status: 'Never Signed In', className: 'px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-sm' };
    }
    return { status: 'Active', className: 'px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm' };
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Customers</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Customers</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">View customer information and provide support assistance.</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              fetchCustomers();
              fetchSupportTickets();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>

        {customers.length === 0 ? (
          <p className="text-gray-600">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Joined</th>
                  <th className="text-left p-3">Last Sign In</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const statusInfo = getCustomerStatus(customer.last_sign_in_at, customer.email_confirmed_at);
                  return (
                    <tr key={customer.user_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{customer.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          customer.role === 'admin' ? 'bg-purple-200 text-purple-800' :
                          customer.role === 'employee' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {customer.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={statusInfo.className}>
                          {statusInfo.status}
                        </span>
                      </td>
                      <td className="p-3">{new Date(customer.user_created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        {customer.last_sign_in_at
                          ? new Date(customer.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => alert(`Contact customer: ${customer.email}`)}
                          >
                            Contact
                          </button>
                          <button
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                            onClick={() => alert(`View customer details for: ${customer.email}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Support Tickets Section */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Support Tickets</h2>

          {supportTickets.length === 0 ? (
            <p className="text-gray-600">No support tickets found.</p>
          ) : (
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">
                        Ticket #{ticket.ticket_number} • From: {ticket.customer_email}
                      </p>
                      {ticket.category_name && (
                        <p className="text-sm text-gray-500">Category: {ticket.category_name}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={getPriorityClass(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className={getTicketStatusClass(ticket.status)}>
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{ticket.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span>Last updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>

                  {ticket.assigned_to_email && (
                    <div className="text-sm text-gray-600 mb-3">
                      Assigned to: {ticket.assigned_to_email}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <>
                        <button
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => alert(`Respond to ticket: ${ticket.subject}`)}
                        >
                          Respond
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={() => alert(`Mark ticket as resolved: ${ticket.subject}`)}
                        >
                          Mark Resolved
                        </button>
                        {!ticket.assigned_to && (
                          <button
                            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                            onClick={() => alert(`Assign ticket to yourself: ${ticket.subject}`)}
                          >
                            Assign to Me
                          </button>
                        )}
                      </>
                    )}
                    <button
                      className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={() => alert(`View full ticket details: ${ticket.subject}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h3 className="font-medium mb-2">Support Guidelines</h3>
            <p className="text-gray-600 mb-4">
              As an employee, you can assist customers with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Order status inquiries</li>
              <li>Product information and recommendations</li>
              <li>Basic account support</li>
              <li>Return and exchange guidance</li>
              <li>Shipping information</li>
            </ul>
            <p className="text-gray-600 mt-4">
              For complex issues or account modifications, please escalate to an administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCustomers;