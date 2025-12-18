import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const supportLinks = [
  { name: 'Contact Us', path: '/support/contact' },
  { name: 'FAQ', path: '/support/faq' },
  { name: 'Shipping Info', path: '/support/shipping' },
  { name: 'Returns', path: '/support/returns' },
  { name: 'Terms & Conditions', path: '/support/terms' },
  { name: 'Privacy Policy', path: '/support/privacy' },
  { name: 'Warranty', path: '/support/warranty' },
];

const SupportLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-4 lg:gap-12">
        <aside className="lg:col-span-1 mb-8 lg:mb-0">
          <h2 className="text-2xl font-light text-black mb-6 tracking-wide">Support</h2>
          <nav>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm font-light transition-colors',
                      location.pathname === link.path
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupportLayout;
