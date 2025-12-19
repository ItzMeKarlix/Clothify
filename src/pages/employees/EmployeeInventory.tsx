import React, { useState, useEffect } from 'react';
import { productService } from '../../api/api';
import type { Product } from '../../types/database';
import { Package, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EmployeeInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Low Stock</Badge>;
    } else {
      return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />In Stock</Badge>;
    }
  };

  const getStockLevel = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
          <Package className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading inventory...</p>
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
          <Package className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchProducts} className="mt-4">
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
          <Package className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
        </div>
        <Button onClick={fetchProducts} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            Product Stock Levels
          </CardTitle>
          <CardDescription className="text-sm">Monitor inventory status and stock levels across all products</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found in inventory</p>
              <p className="text-sm">Products will appear here once added</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {product.image && (
                      <div className="shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">SKU: {product.sku || `PRD-${product.id}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm sm:text-base">${product.price}</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm sm:text-base ${getStockLevel(product.stock || 0)}`}>
                            {product.stock || 0} units
                          </span>
                          {getStockStatusBadge(product.stock || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-3 text-sm">Stock Status Legend</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>In Stock (10+ units)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span>Low Stock (&lt;10 units)</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Out of Stock (0 units)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeInventory;