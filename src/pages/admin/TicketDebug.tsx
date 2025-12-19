import React, { useState, useEffect } from 'react';
import { supabase, supportTicketService } from '../../api/api';
import { Bug } from 'lucide-react';

const TicketDebug: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{
    rls_enabled: boolean;
    ticket_count: number;
    tickets: any[];
    error: string | null;
    policies: any[];
  }>({
    rls_enabled: false,
    ticket_count: 0,
    tickets: [],
    error: null,
    policies: []
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    try {
      // 1. Test direct database query
      console.log('🔍 Running diagnostics...');
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Direct query error:', error);
        setDiagnostics(prev => ({
          ...prev,
          error: error.message
        }));
        return;
      }

      console.log('✅ Direct query result:', data);

      // 2. Test API service
      const apiTickets = await supportTicketService.getAll();
      console.log('✅ API service result:', apiTickets);

      setDiagnostics(prev => ({
        ...prev,
        ticket_count: data?.length || 0,
        tickets: data || [],
        error: null
      }));

    } catch (err: any) {
      console.error('❌ Diagnostic error:', err);
      setDiagnostics(prev => ({
        ...prev,
        error: err.message
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Bug className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Support Ticket Diagnostics</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        
        <div className="space-y-2 font-mono text-sm">
          <p>
            <strong>Ticket Count:</strong> {diagnostics.ticket_count}
          </p>
          <p>
            <strong>Error:</strong> {diagnostics.error || 'None'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Raw Tickets ({diagnostics.tickets.length})</h2>
        
        {diagnostics.tickets.length === 0 ? (
          <p className="text-gray-600">No tickets in database</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Ticket #</th>
                  <th className="border p-2 text-left">Subject</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{ticket.id}</td>
                    <td className="border p-2">{ticket.ticket_number}</td>
                    <td className="border p-2">{ticket.subject}</td>
                    <td className="border p-2">{ticket.customer_email}</td>
                    <td className="border p-2">{ticket.status}</td>
                    <td className="border p-2">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={runDiagnostics}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Diagnostics
      </button>
    </div>
  );
};

export default TicketDebug;