import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Users, Package, CreditCard, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useOnboarding } from "../../hooks/use-onboarding";
import { OnboardingModal } from "../../components/OnboardingModal";

// Sample data - in a real app, this would come from your API
const salesData = [
  { month: 'Jan', revenue: 45000, orders: 120 },
  { month: 'Feb', revenue: 52000, orders: 145 },
  { month: 'Mar', revenue: 48000, orders: 132 },
  { month: 'Apr', revenue: 61000, orders: 168 },
  { month: 'May', revenue: 55000, orders: 152 },
  { month: 'Jun', revenue: 67000, orders: 185 },
];

const customerData = [
  { month: 'Jan', newCustomers: 45, totalCustomers: 245 },
  { month: 'Feb', newCustomers: 52, totalCustomers: 297 },
  { month: 'Mar', newCustomers: 38, totalCustomers: 335 },
  { month: 'Apr', newCustomers: 67, totalCustomers: 402 },
  { month: 'May', newCustomers: 58, totalCustomers: 460 },
  { month: 'Jun', newCustomers: 71, totalCustomers: 531 },
];

const productData = [
  { category: 'Men', sales: 125000, inventory: 450 },
  { category: 'Women', sales: 98000, inventory: 380 },
  { category: 'Accessories', sales: 67000, inventory: 290 },
  { category: 'Shoes', sales: 54000, inventory: 180 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
  newCustomers: {
    label: "New Customers",
    color: "hsl(var(--chart-3))",
  },
  totalCustomers: {
    label: "Total Customers",
    color: "hsl(var(--chart-4))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-5))",
  },
  inventory: {
    label: "Inventory",
    color: "hsl(var(--chart-6))",
  },
};

const Dashboard: React.FC = () => {
  const { needsOnboarding, loading: onboardingLoading, userEmail } = useOnboarding();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <OnboardingModal isOpen={needsOnboarding} userEmail={userEmail} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link to="/admin/products" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <h2 className="text-lg sm:text-xl font-semibold">Products</h2>
              <p className="text-sm sm:text-base text-gray-600">Manage products</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/inventory" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <h2 className="text-lg sm:text-xl font-semibold">Inventory</h2>
              <p className="text-sm sm:text-base text-gray-600">Track stock levels</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/customers" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <h2 className="text-lg sm:text-xl font-semibold">Customers</h2>
              <p className="text-sm sm:text-base text-gray-600">View customer data</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/payments" className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <h2 className="text-lg sm:text-xl font-semibold">Payments</h2>
              <p className="text-sm sm:text-base text-gray-600">Manage transactions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Revenue & Orders Chart */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Revenue & Orders Overview
            </CardTitle>
            <CardDescription className="text-sm">Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pb-4 sm:pb-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="var(--color-revenue)"
                    fill="var(--color-revenue)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stackId="2"
                    stroke="var(--color-orders)"
                    fill="var(--color-orders)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Customer Growth Chart */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Customer Growth
            </CardTitle>
            <CardDescription className="text-sm">New and total customer acquisition</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pb-4 sm:pb-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="totalCustomers"
                    stroke="var(--color-totalCustomers)"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="newCustomers"
                    stroke="var(--color-newCustomers)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance Chart */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            Product Category Performance
          </CardTitle>
          <CardDescription className="text-sm">Sales and inventory by product category</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden pb-4 sm:pb-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" />
                <Bar dataKey="inventory" fill="var(--color-inventory)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
