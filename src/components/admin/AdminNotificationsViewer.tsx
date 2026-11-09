import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ShieldCheck,
  Send
} from 'lucide-react';
import { NotificationRecord, NotificationType } from '@/types';
import { Card } from '@/components/common/Card';

interface AdminNotificationsViewerProps {
  notifications: NotificationRecord[];
  onRefresh: () => Promise<void>;
}

export const AdminNotificationsViewer: React.FC<AdminNotificationsViewerProps> = ({
  notifications,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notifications.filter((n) => {
    const matchesType = filterType === 'all' || n.notification_type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.booking_id && n.booking_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.customer_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
                Customer Notifications Stream
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Automated in-app, SMS, and WhatsApp alerts dispatched to Pickup Wash customers in Kasur
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-aqua-500 w-full sm:w-auto"
            >
              <option value="all">All Types ({notifications.length})</option>
              <option value="booking_status">Booking Status</option>
              <option value="payment_status">Payment Status</option>
              <option value="cancellation">Cancellations</option>
              <option value="reschedule">Rescheduling</option>
              <option value="system">System Alerts</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-navy-200 text-xs focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications Table */}
      <Card className="border-ice-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Dispatched At</th>
                <th className="py-3.5 px-4 font-bold">Alert Title</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Customer ID</th>
                <th className="py-3.5 px-4 font-bold">Message Content</th>
                <th className="py-3.5 px-4 font-bold text-right">Read Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-ice-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-navy-400">
                    <Bell className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                    <p className="font-semibold text-darkNavy text-sm">No notification alerts found</p>
                    <p className="text-xs text-navy-400 mt-1">
                      Customer status updates and alerts will log here in real time.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((n) => {
                  let badgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
                  if (n.notification_type === 'booking_status') {
                    badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                  } else if (n.notification_type === 'payment_status') {
                    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  } else if (n.notification_type === 'cancellation') {
                    badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                  } else if (n.notification_type === 'reschedule') {
                    badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
                  }

                  return (
                    <tr key={n.id} className="hover:bg-ice-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-navy-500 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString('en-PK', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-darkNavy text-xs whitespace-nowrap">
                        {n.title}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {n.notification_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-navy-600 truncate max-w-[120px]">
                        {n.customer_id.slice(0, 10)}...
                      </td>

                      <td className="py-3.5 px-4 text-xs text-navy-700 max-w-sm truncate" title={n.message}>
                        {n.message}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.is_read
                              ? 'bg-ice-100 text-navy-600 border border-ice-200'
                              : 'bg-aqua-100 text-aqua-900 border border-aqua-200 font-bold'
                          }`}
                        >
                          {n.is_read ? 'Read' : 'Unread'}
                        </span>
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

