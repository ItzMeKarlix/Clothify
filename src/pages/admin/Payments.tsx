import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, AlertCircle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { paymentService, supabase } from '../../api/api';
import type { PaymentTransaction } from '../../types/database';
import toast from 'react-hot-toast';

interface PaymentWithOrder extends PaymentTransaction {
  order?: {
    id: string;
    customer_name: string;
    total: number;
    customer_email?: string;
  };
}

const Payments: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentWithOrder[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [failedAmount, setFailedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all transactions
      const allTransactions = await paymentService.getAll();
      
      // Fetch orders for each transaction that has an order_id
      const transactionsWithOrders = await Promise.all(
        allTransactions.map(async (transaction) => {
          let order = undefined;
          if (transaction.order_id) {
            try {
              const { data: orderData } = await supabase
                .from('orders')
                .select('id, customer_name, total, customer_email')
                .eq('id', transaction.order_id)
                .single();
              order = orderData;
            } catch (err) {
              console.warn(`Failed to fetch order ${transaction.order_id}:`, err);
            }
          }
          return { ...transaction, order };
        })
      );

      setTransactions(transactionsWithOrders);

      // Calculate revenue metrics
      const total = await paymentService.getTotalRevenue();
      setTotalRevenue(total);

      const month = await paymentService.getMonthRevenue();
      setMonthRevenue(month);

      // Calculate pending and failed amounts
      const pending = allTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);
      setPendingAmount(pending);

      const failed = allTransactions
        .filter(t => t.status === 'failed')
        .reduce((sum, t) => sum + t.amount, 0);
      setFailedAmount(failed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment data';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'payments-error' });
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
      case 'partially_refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <CreditCard className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center space-x-4 p-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
            <div>
              <h3 className="font-medium text-gray-900">Error Loading Payments</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Payment Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">${monthRevenue.toFixed(2)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Current month revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">${failedAmount.toFixed(2)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Payment failures</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Transaction ID</th>
                  <th className="text-left p-3 text-sm font-medium">Order</th>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Customer</th>
                  <th className="text-left p-3 text-sm font-medium">Amount</th>
                  <th className="text-left p-3 text-sm font-medium">Method</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <span className="font-mono text-sm">{transaction.id.slice(-8)}</span>
                      </td>
                      <td className="p-3">
                        {transaction.order ? (
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-sm">#{transaction.order.id}</div>
                              <div className="text-xs text-gray-500">${transaction.order.total.toFixed(2)}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No order</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(transaction.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-sm">{transaction.customer_email}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600 capitalize">{transaction.payment_method}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Payments;