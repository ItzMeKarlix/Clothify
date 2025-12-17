import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Bell, Home, ShoppingCart, Users, Package, CreditCard, Search, User as UserIcon } from 'lucide-react';

const adminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'Products', path: '/admin/products', icon: ShoppingCart },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <Link to="/admin/dashboard" className="text-2xl font-bold text-black">
            Clothify Admin
          </Link>
        </div>
        <nav className="mt-6">
          <ul>
            {adminLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={cn(
                    'flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-black',
                    location.pathname.startsWith(link.path) && 'bg-gray-100 text-black'
                  )}
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full">3</span>
            </button>
            <button>
              <UserIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
