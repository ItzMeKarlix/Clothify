import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inventoryService, lowStockAlertService } from '../../api/api';
import type { ProductInventory, LowStockAlert } from '../../types/database';
import toast from 'react-hot-toast';

const Inventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<ProductInventory[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all inventory items
      const items = await inventoryService.getAll();
      setInventoryItems(items);
      setTotalProducts(items.length);

      // Fetch low stock alerts first
      const alerts = await lowStockAlertService.getUnresolved();
      setLowStockAlerts(alerts);

      // Count low stock items - should match unresolved alerts
      setLowStockCount(alerts.length);

      // Count out of stock items
      const outOfStock = items.filter(item => item.stock_quantity === 0);
      setOutOfStockCount(outOfStock.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory data';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'inventory-error' });
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await lowStockAlertService.resolve(alertId);
      setLowStockAlerts(lowStockAlerts.filter(a => a.id !== alertId));
      toast.success('Alert resolved', { id: 'inventory-alert-resolved' });
    } catch (err) {
      toast.error('Failed to resolve alert', { id: 'inventory-resolve-failed' });
      console.error('Error resolving alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
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
              <h3 className="font-medium text-gray-900">Error Loading Inventory</h3>
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
        <Package className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalProducts}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      {lowStockAlerts.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-orange-900">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Low Stock Alerts ({lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {lowStockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-900">
                      {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Alert'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Current stock: {alert.current_stock} | Threshold: {alert.threshold}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Product Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Product ID</th>
                  <th className="text-left p-3 text-sm font-medium">SKU</th>
                  <th className="text-left p-3 text-sm font-medium">Size</th>
                  <th className="text-left p-3 text-sm font-medium">Color</th>
                  <th className="text-left p-3 text-sm font-medium">Stock</th>
                  <th className="text-left p-3 text-sm font-medium">Reserved</th>
                  <th className="text-left p-3 text-sm font-medium">Location</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  inventoryItems
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <span className="font-mono text-sm">{item.product_id.slice(-6)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{item.sku || '-'}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{item.size || '-'}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{item.color || '-'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{item.stock_quantity}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">{item.reserved_quantity}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{item.location || 'Warehouse A'}</span>
                        </td>
                        <td className="p-3">
                          {item.stock_quantity === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : item.stock_quantity <= item.low_stock_threshold ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          {inventoryItems.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, inventoryItems.length)} of {inventoryItems.length} items
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 border rounded bg-gray-50">
                  <span className="text-sm font-medium">{currentPage}</span>
                  <span className="text-sm text-gray-500">/</span>
                  <span className="text-sm text-gray-500">{Math.ceil(inventoryItems.length / itemsPerPage)}</span>
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(inventoryItems.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(inventoryItems.length / itemsPerPage)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
