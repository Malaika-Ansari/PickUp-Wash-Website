import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { ProfileRecord, Order } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface AdminCustomerDirectoryProps {
  customers: ProfileRecord[];
  orders: Order[];
  onSelectCustomerBookings?: (customerPhone: string) => void;
}

export const AdminCustomerDirectory: React.FC<AdminCustomerDirectoryProps> = ({
  customers,
  orders,
  onSelectCustomerBookings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner & Search */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
                Customer Directory
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Registered Pickup Wash laundry clients across Kasur City ({customers.length} total)
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Customer Directory Table */}
      <Card className="border-ice-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Customer Name</th>
                <th className="py-3.5 px-4 font-bold">Contact Phone</th>
                <th className="py-3.5 px-4 font-bold">Email</th>
                <th className="py-3.5 px-4 font-bold">Kasur Area</th>
                <th className="py-3.5 px-4 font-bold text-center">Orders Placed</th>
                <th className="py-3.5 px-4 font-bold">Registered On</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-ice-100 bg-white">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-navy-400">
                    <Users className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                    <p className="font-semibold text-darkNavy text-sm">
                      {searchQuery ? 'No customers matched your search query' : 'No customers registered yet'}
                    </p>
                    <p className="text-xs text-navy-400 mt-1">
                      Customer accounts created on the site will automatically populate here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const customerOrders = orders.filter(
                    (o) =>
                      o.userId === cust.id ||
                      (cust.phone && o.customerPhone === cust.phone) ||
                      (cust.email && o.customerEmail === cust.email)
                  );

                  return (
                    <tr key={cust.id} className="hover:bg-ice-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 font-bold text-xs flex items-center justify-center border border-navy-200 shrink-0">
                            {cust.full_name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <strong className="text-darkNavy font-semibold block text-xs sm:text-sm">
                              {cust.full_name || 'Customer'}
                            </strong>
                            <span className="text-[10px] text-navy-400">ID: {cust.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cust.phone ? (
                          <a
                            href={`tel:${cust.phone}`}
                            className="font-mono text-xs font-semibold text-aqua-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{cust.phone}</span>
                          </a>
                        ) : (
                          <span className="text-navy-400 text-xs">Not provided</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-navy-600 truncate max-w-[180px]">
                        {cust.email ? (
                          <a href={`mailto:${cust.email}`} className="hover:underline text-navy-700 truncate block">
                            {cust.email}
                          </a>
                        ) : (
                          <span className="text-navy-400">No email</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-navy-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-aqua-600" />
                          <span>{cust.area || 'Kasur City'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-ice-100 text-navy-800 border border-ice-200">
                          {customerOrders.length}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-navy-500 whitespace-nowrap">
                        {new Date(cust.created_at).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {onSelectCustomerBookings && cust.phone && (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => onSelectCustomerBookings(cust.phone || '')}
                            className="gap-1 text-xs"
                          >
                            <ShoppingBag className="w-3 h-3 text-aqua-600" />
                            <span>View Orders</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

