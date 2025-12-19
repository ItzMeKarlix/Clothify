import React from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Payments: React.FC = () => {
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
            <div className="text-2xl sm:text-3xl font-bold">$24,580</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">$8,450</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Current month revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">$1,230</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">$89</div>
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
          <CardDescription className="text-sm">View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Transaction ID</th>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                  <th className="text-left p-3 text-sm font-medium">Customer</th>
                  <th className="text-left p-3 text-sm font-medium">Amount</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <span className="font-mono text-sm">txn_12345</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">2024-12-20</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">john.doe@email.com</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">$45.00</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      View Details
                    </button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <span className="font-mono text-sm">txn_12346</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">2024-12-19</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">jane.smith@email.com</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">$89.99</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Pending
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      Process
                    </button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <span className="font-mono text-sm">txn_12347</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">2024-12-18</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">mike.johnson@email.com</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">$67.50</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="destructive">
                      Failed
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
