import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Sparkles, 
  Ban, 
  ArrowUpDown, 
  X, 
  Eye, 
  RotateCcw,
  Check,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus, PaymentRecord } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AdminBookingDetailsModal } from './AdminBookingDetailsModal';

interface AdminBookingsManagerProps {
  orders: Order[];
  payments: PaymentRecord[];
  onStatusChange: (trackingNumber: string, newStatus: OrderStatus, cancellationReason?: string) => Promise<void>;
  onOpenPaymentVerification?: (payment: PaymentRecord) => void;
  initialFilterStatus?: string;
  initialSearch?: string;
}

export const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = ({
  orders,
  payments,
  onStatusChange,
  onOpenPaymentVerification,
  initialFilterStatus = 'all',
  initialSearch = '',
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Quick Action Updating ID
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Distinct service types from existing orders
  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      const s = o.items[0]?.serviceTitle;
      if (s) set.add(s);
    });
    // Add defaults if missing
    ['Wash & Iron', 'Dry Cleaning', 'Iron Only', 'Express Service', 'Bedding & Household'].forEach((s) => set.add(s));
    return Array.from(set);
  }, [orders]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (serviceFilter !== 'all') count++;
    if (dateFilter) count++;
    return count;
  }, [searchQuery, statusFilter, serviceFilter, dateFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setServiceFilter('all');
    setDateFilter('');
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // 1. Search Query: matches booking reference, customer name, customer phone
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          q === '' ||
          o.trackingNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.area.toLowerCase().includes(q);

        // 2. Status Filter
        const matchesStatus =
          statusFilter === 'all' ||
          o.status === statusFilter ||
          o.bookingStatus === statusFilter;

        // 3. Service Filter
        const currentService = o.items[0]?.serviceTitle || '';
        const matchesService =
          serviceFilter === 'all' ||
          currentService.toLowerCase() === serviceFilter.toLowerCase();

        // 4. Pickup Date Filter
        const matchesDate = dateFilter === '' || o.pickupDate === dateFilter;

        return matchesSearch && matchesStatus && matchesService && matchesDate;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [orders, searchQuery, statusFilter, serviceFilter, dateFilter, sortOrder]);

  // Handle Quick Status Advance from table row
  const handleQuickAdvance = async (order: Order, nextStatus: OrderStatus) => {
    setUpdatingId(order.trackingNumber);
    try {
      await onStatusChange(order.trackingNumber, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Cancellation submission
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    setCancelError('');

    if (!cancellationReason.trim()) {
      setCancelError('Please specify the cancellation reason.');
      return;
    }

    setIsCancelling(true);
    try {
      await onStatusChange(cancellingOrder.trackingNumber, 'Cancelled', cancellationReason.trim());
      setCancellingOrder(null);
      setCancellationReason('');
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in text-darkNavy">
      {/* =========================================================================
          TOP CONTROLS & FILTER BAR
         ========================================================================= */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
        {/* Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
                Booking Dispatch Management
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Filter, search, advance lifecycle stages, and review customer bookings in Kasur
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-navy-600">
              Showing <strong className="text-darkNavy font-bold">{filteredOrders.length}</strong> of{' '}
              <strong className="text-darkNavy font-bold">{orders.length}</strong> bookings
            </span>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* 1. Search by Reference, Name or Phone */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference (PW-KSR-...), customer, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
            />
          </div>

          {/* 2. Filter by Booking Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-aqua-500"
            >
              <option value="all">All Booking Statuses</option>
              <option value="Request Received">Request Received</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Washing & Ironing">Washing & Ironing</option>
              <option value="Ready for Delivery">Ready for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* 3. Filter by Service Type */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-aqua-500"
            >
              <option value="all">All Service Types</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filter by Pickup Date & Sort */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-aqua-500 flex-1"
              title="Filter by Pickup Date"
            />

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-2 rounded-xl border border-navy-200 bg-white hover:bg-ice-50 text-navy-700 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
              title={sortOrder === 'newest' ? 'Sorting Newest First' : 'Sorting Oldest First'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-aqua-600" />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          ALL 9-COLUMN BOOKINGS DATA TABLE
         ========================================================================= */}
      <Card className="border-ice-200 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-bold">Booking Ref</th>
                <th className="py-3.5 px-4 font-bold">Customer Name</th>
                <th className="py-3.5 px-4 font-bold">Customer Phone</th>
                <th className="py-3.5 px-4 font-bold">Service Type</th>
                <th className="py-3.5 px-4 font-bold">Pickup Date</th>
                <th className="py-3.5 px-4 font-bold">Pickup Address</th>
                <th className="py-3.5 px-4 font-bold">Payment Method</th>
                <th className="py-3.5 px-4 font-bold">Booking Status</th>
                <th className="py-3.5 px-4 font-bold">Booking Date</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-ice-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-navy-400">
                    <ShoppingBag className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                    <p className="font-semibold text-darkNavy text-sm">
                      {activeFiltersCount > 0 ? 'No bookings matched your search or filters' : 'No bookings in database'}
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-2 text-xs font-bold text-aqua-700 underline"
                      >
                        Reset all active filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  let statusBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
                  if (order.status === 'Request Received') {
                    statusBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                  } else if (order.status === 'Confirmed') {
                    statusBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
                  } else if (order.status === 'Picked Up') {
                    statusBadgeClass = 'bg-purple-100 text-purple-900 border-purple-300';
                  } else if (order.status === 'Washing & Ironing') {
                    statusBadgeClass = 'bg-aqua-100 text-aqua-900 border-aqua-300';
                  } else if (order.status === 'Ready for Delivery') {
                    statusBadgeClass = 'bg-teal-100 text-teal-900 border-teal-300';
                  } else if (order.status === 'Delivered') {
                    statusBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                  } else if (order.status === 'Cancelled') {
                    statusBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
                  }

                  const isUpdating = updatingId === order.trackingNumber;

                  return (
                    <tr key={order.id} className="hover:bg-ice-50/70 transition-colors">
                      {/* 1. Booking Reference */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-navy-900 bg-ice-100 px-2 py-0.5 rounded border border-ice-200">
                          {order.trackingNumber}
                        </span>
                      </td>

                      {/* 2. Customer Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <strong className="text-darkNavy font-semibold text-xs block">
                          {order.customerName || 'Customer'}
                        </strong>
                      </td>

                      {/* 3. Customer Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.customerPhone ? (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="font-mono text-xs font-semibold text-aqua-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-aqua-600" />
                            <span>{order.customerPhone}</span>
                          </a>
                        ) : (
                          <span className="text-navy-400 text-xs">Not recorded</span>
                        )}
                      </td>

                      {/* 4. Service Type */}
                      <td className="py-3.5 px-4 text-xs font-medium text-navy-800 whitespace-nowrap">
                        {order.items[0]?.serviceTitle || 'Standard Laundry'}
                      </td>

                      {/* 5. Pickup Date */}
                      <td className="py-3.5 px-4 text-xs text-navy-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-navy-400" />
                          <span>{order.pickupDate}</span>
                        </div>
                      </td>

                      {/* 6. Pickup Address */}
                      <td className="py-3.5 px-4 text-xs text-navy-600 max-w-[200px] truncate" title={order.pickupAddress}>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-aqua-600 shrink-0" />
                          <span className="truncate">{order.pickupAddress} ({order.area})</span>
                        </div>
                      </td>

                      {/* 7. Payment Method */}
                      <td className="py-3.5 px-4 text-xs font-medium text-navy-800 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-navy-400" />
                          <span>{order.paymentMethod}</span>
                        </div>
                      </td>

                      {/* 8. Booking Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusBadgeClass}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* 9. Booking Date (created_at) */}
                      <td className="py-3.5 px-4 font-mono text-xs text-navy-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* 10. Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Quick Advancement Action */}
                          {order.status === 'Request Received' && (
                            <Button
                              size="xs"
                              variant="primary"
                              disabled={isUpdating}
                              onClick={() => handleQuickAdvance(order, 'Confirmed')}
                              className="text-[10px] py-1 px-2 font-bold bg-blue-600 hover:bg-blue-700"
                              title="Confirm booking request"
                            >
                              Confirm
                            </Button>
                          )}

                          {order.status === 'Confirmed' && (
                            <Button
                              size="xs"
                              variant="primary"
                              disabled={isUpdating}
                              onClick={() => handleQuickAdvance(order, 'Picked Up')}
                              className="text-[10px] py-1 px-2 font-bold bg-purple-600 hover:bg-purple-700"
                              title="Mark clothes collected"
                            >
                              Picked Up
                            </Button>
                          )}

                          {order.status === 'Picked Up' && (
                            <Button
                              size="xs"
                              variant="accent"
                              disabled={isUpdating}
                              onClick={() => handleQuickAdvance(order, 'Washing & Ironing')}
                              className="text-[10px] py-1 px-2 font-bold text-darkNavy"
                              title="Begin wash & press"
                            >
                              Wash & Press
                            </Button>
                          )}

                          {order.status === 'Washing & Ironing' && (
                            <Button
                              size="xs"
                              variant="primary"
                              disabled={isUpdating}
                              onClick={() => handleQuickAdvance(order, 'Ready for Delivery')}
                              className="text-[10px] py-1 px-2 font-bold bg-teal-600 hover:bg-teal-700"
                              title="Ready for rider delivery"
                            >
                              Ready
                            </Button>
                          )}

                          {order.status === 'Ready for Delivery' && (
                            <Button
                              size="xs"
                              variant="primary"
                              disabled={isUpdating}
                              onClick={() => handleQuickAdvance(order, 'Delivered')}
                              className="text-[10px] py-1 px-2 font-bold bg-emerald-600 hover:bg-emerald-700"
                              title="Mark delivered to doorstep"
                            >
                              Deliver
                            </Button>
                          )}

                          {/* View Details Modal Button */}
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => setViewingOrder(order)}
                            className="gap-1 text-[11px] font-semibold text-navy-700 px-2 py-1"
                            title="View complete booking details"
                          >
                            <Eye className="w-3 h-3 text-aqua-600" />
                            <span>Details</span>
                          </Button>

                          {/* Cancel Action */}
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              className="p-1 rounded-lg text-navy-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Cancel this booking"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =========================================================================
          VIEW BOOKING DETAILS MODAL
         ========================================================================= */}
      {viewingOrder && (
        <AdminBookingDetailsModal
          order={viewingOrder}
          payment={payments.find((p) => p.booking_id === viewingOrder.id)}
          onClose={() => setViewingOrder(null)}
          onStatusChange={onStatusChange}
          onOpenPaymentVerification={onOpenPaymentVerification}
        />
      )}

      {/* =========================================================================
          CANCELLATION REASON CONFIRMATION DIALOG
         ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>Cancel Booking Confirmation</span>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-700 leading-relaxed">
              Cancel order <strong className="font-mono font-bold text-navy-900">{cancellingOrder.trackingNumber}</strong> for customer{' '}
              <strong className="text-navy-900">{cancellingOrder.customerName}</strong>.
              Enter the official cancellation reason to be recorded in the audit trail:
            </p>

            {cancelError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Customer requested via phone, or clothes unavailable..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-navy-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCancellationReason('Customer requested cancellation via telephone.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Customer Call Request
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationReason('Duplicate booking submission.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Duplicate Booking
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationReason('Garment items unserviceable for laundry process.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Unserviceable Garments
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ice-100">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-3 py-2 text-xs font-semibold text-navy-600 hover:text-navy-800"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

