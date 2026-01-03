import React, { useState, useEffect } from "react";
import { productService, categoryService } from "../../api/api";
import EditProductForm from "./EditProductForm";
import type { Product, Category } from "../../types/database";
import toast from "react-hot-toast";
import { Package, TrendingUp, BarChart3, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useOnboarding } from "../../hooks/use-onboarding";
import { OnboardingModal } from "../../components/OnboardingModal";

// Sample data - in a real app, this would come from your API
const inventoryData = [
  { category: 'Men', stock: 450, sold: 125 },
  { category: 'Women', stock: 380, sold: 98 },
  { category: 'Accessories', stock: 290, sold: 67 },
  { category: 'Shoes', stock: 180, sold: 54 },
];

const performanceData = [
  { month: 'Jan', productsManaged: 45, updates: 120 },
  { month: 'Feb', productsManaged: 52, updates: 145 },
  { month: 'Mar', productsManaged: 38, updates: 98 },
  { month: 'Apr', productsManaged: 67, updates: 167 },
  { month: 'May', productsManaged: 58, updates: 142 },
  { month: 'Jun', productsManaged: 71, updates: 189 },
];

const categoryData = [
  { name: 'Men', value: 35, color: '#8884d8' },
  { name: 'Women', value: 28, color: '#82ca9d' },
  { name: 'Accessories', value: 20, color: '#ffc658' },
  { name: 'Shoes', value: 17, color: '#ff7300' },
];

const chartConfig = {
  stock: {
    label: "Stock",
    color: "hsl(var(--chart-1))",
  },
  sold: {
    label: "Sold",
    color: "hsl(var(--chart-2))",
  },
  productsManaged: {
    label: "Products Managed",
    color: "hsl(var(--chart-3))",
  },
  updates: {
    label: "Updates",
    color: "hsl(var(--chart-4))",
  },
};

const EmployeeDashboard: React.FC = () => {
  const { needsOnboarding, loading: onboardingLoading, userEmail } = useOnboarding();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    const data = await productService.getAll();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  if (loading || onboardingLoading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <OnboardingModal isOpen={needsOnboarding} userEmail={userEmail} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Employee Dashboard</h1>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Inventory Overview Chart */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              Inventory Overview
            </CardTitle>
            <CardDescription className="text-sm">Current stock levels vs items sold</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pb-4 sm:pb-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="stock" fill="var(--color-stock)" />
                  <Bar dataKey="sold" fill="var(--color-sold)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription className="text-sm">Products managed and updates made</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pb-4 sm:pb-6">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="productsManaged"
                    stroke="var(--color-productsManaged)"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="updates"
                    stroke="var(--color-updates)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Pie Chart */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Product Category Distribution</CardTitle>
          <CardDescription className="text-sm">Percentage breakdown of products by category</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden pb-4 sm:pb-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Product Management Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
            Product Management
          </CardTitle>
          <CardDescription className="text-sm">Manage and update product information</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {products.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center border p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  {p.image && <img src={p.image} alt={p.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{p.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">${p.price}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{categories.find((c) => c.id === p.category_id)?.name || "No category"}</p>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <EditProductForm product={p} refreshProducts={fetchProducts} categories={categories} />
                </div>
                {/* Employees cannot delete products */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;