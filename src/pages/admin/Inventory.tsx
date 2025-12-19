import React from 'react';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Inventory: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <Package className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">247</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">12</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">3</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Product Inventory
          </CardTitle>
          <CardDescription className="text-sm">Monitor stock levels and manage inventory</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Product</th>
                  <th className="text-left p-3 text-sm font-medium">SKU</th>
                  <th className="text-left p-3 text-sm font-medium">Stock</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium">Classic T-Shirt</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">TS-001</td>
                  <td className="p-3">
                    <span className="font-medium">100</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      In Stock
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      Update Stock
                    </button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium">Premium Jeans</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">JN-001</td>
                  <td className="p-3">
                    <span className="font-medium text-orange-600">5</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Low Stock
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      Restock
                    </button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium">Summer Dress</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">DR-001</td>
                  <td className="p-3">
                    <span className="font-medium text-red-600">0</span>
                  </td>
                  <td className="p-3">
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                      Order More
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

export default Inventory;
