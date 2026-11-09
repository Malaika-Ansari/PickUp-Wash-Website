import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  ShoppingBag, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Truck, 
  ArrowRight,
  ExternalLink,
  Printer,
  Ban,
  RotateCcw,
  History,
  Sparkles
} from 'lucide-react';
import { Order, OrderStatus, BookingStatus, PaymentRecord, BookingStatusHistoryRecord } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { bookingService } from '@/services/bookingService';

interface AdminBookingDetailsModalProps {
  order: Order;
  payment?: PaymentRecord | null;
  onClose: () => void;
  onStatusChange: (trackingNumber: string, newStatus: OrderStatus, cancellationReason?: string) => Promise<void>;
  onOpenPaymentVerification?: (payment: PaymentRecord) => void;
}

export const AdminBookingDetailsModal: React.FC<AdminBookingDetailsModalProps> = ({
  order,
  payment,
  onClose,
  onStatusChange,
  onOpenPaymentVerification,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Status History State
  const [history, setHistory] = useState<BookingStatusHistoryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Cancellation Dialog State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Fetch status history on open
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await bookingService.getBookingStatusHistory(order.id);
        if (isMounted) {
          if (res.history && res.history.length > 0) {
            setHistory(res.history);
          } else {
            // Synthesize initial entry
            setHistory([
              {
                id: 'init-1',
                booking_id: order.id,
                previous_status: null,
                new_status: order.bookingStatus || order.status || 'Request Received',
                changed_at: order.createdAt,
                notes: 'Booking request placed by customer for doorstep collection.',
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('Could not load status history:', err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [order.id, order.status, order.createdAt, order.bookingStatus]);

  const handleUpdate = async (targetStatus: OrderStatus, reason?: string) => {
    setIsUpdating(true);
    setFeedback(null);
    try {
      await onStatusChange(order.trackingNumber, targetStatus, reason);
      setSelectedStatus(targetStatus);
      setFeedback({ success: true, message: `Booking stage successfully updated to "${targetStatus}"` });

      // Refresh history
      const res = await bookingService.getBookingStatusHistory(order.id);
      if (res.history && res.history.length > 0) {
        setHistory(res.history);
      }

      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to update status.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError('');
    if (!cancellationReason.trim()) {
      setCancelError('Please enter a cancellation reason.');
      return;
    }

    await handleUpdate('Cancelled', cancellationReason.trim());
    setIsCancelModalOpen(false);
    setCancellationReason('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-ice-200 space-y-6 max-h-[92vh] overflow-y-auto text-darkNavy"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-ice-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-aqua-700 uppercase tracking-wider">
                Booking Dispatch Record
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ice-100 text-navy-800 border border-ice-200 font-mono">
                {order.trackingNumber}
              </span>
            </div>
            <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
              Order Details & Dispatch Information
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-navy-500 hover:text-navy-800 hover:bg-ice-100 transition-colors"
              title="Print Order Sheet"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-navy-400 hover:text-navy-600 hover:bg-ice-100 transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
              feedback.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Review Customer Reschedule / Cancellation Banner if applicable */}
        {(order.rescheduledDate || order.rescheduleReason || order.cancellationReason) && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Customer Schedule Notice</span>
            </div>

            {order.rescheduledDate && (
              <p className="leading-relaxed">
                <strong>Customer Requested Reschedule:</strong> Preferred slot updated to{' '}
                <span className="font-bold underline">{order.rescheduledDate} ({order.rescheduledTime || 'Standard Slot'})</span>.
                {order.rescheduleReason && ` Reason: "${order.rescheduleReason}"`}
              </p>
            )}

            {order.cancellationReason && (
              <p className="leading-relaxed">
                <strong>Recorded Cancellation Reason:</strong> "{order.cancellationReason}"
                {order.cancelledAt && ` on ${new Date(order.cancelledAt).toLocaleString('en-PK')}`}
              </p>
            )}
          </div>
        )}

        {/* Section 1: Customer Profile Details */}
        <div className="bg-ice-50/60 rounded-2xl p-4 sm:p-5 border border-ice-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-aqua-600" />
              <span>Customer Information</span>
            </span>
            <span className="text-[11px] text-navy-500 font-medium">Kasur Resident</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-navy-500 block">Full Name:</span>
              <strong className="text-darkNavy font-semibold text-sm">
                {order.customerName || 'Customer'}
              </strong>
            </div>

            <div>
              <span className="text-navy-500 block">Phone Number:</span>
              {order.customerPhone ? (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-mono font-semibold text-aqua-700 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{order.customerPhone}</span>
                </a>
              ) : (
                <span className="text-navy-400">Not recorded</span>
              )}
            </div>

            <div>
              <span className="text-navy-500 block">Email Address:</span>
              <span className="text-darkNavy font-medium">
                {order.customerEmail || 'Guest Order (No email registered)'}
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Kasur Operational Area:</span>
              <span className="font-semibold text-navy-800 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-aqua-600" />
                <span>{order.area}</span>
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-navy-500 block">Pickup & Delivery Street Address:</span>
              <p className="font-medium text-darkNavy bg-white p-2.5 rounded-xl border border-ice-200 mt-1">
                {order.pickupAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Laundry Service & Logistics */}
        <div className="border border-ice-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-aqua-600" />
            <span>Service & Schedule Specifications</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-navy-500 block">Selected Laundry Service:</span>
              <span className="text-sm font-bold text-navy-900">
                {order.items[0]?.serviceTitle || 'Standard Laundry'}
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Pickup Date:</span>
              <span className="font-semibold text-darkNavy inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-navy-500" />
                <span>{order.pickupDate}</span>
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Preferred Time Slot:</span>
              <span className="font-semibold text-darkNavy inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-navy-500" />
                <span>{order.pickupTimeSlot}</span>
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Payment Method:</span>
              <span className="font-semibold text-navy-800">
                {order.paymentMethod}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-navy-500 block">Special Laundry Instructions:</span>
              <p className="text-xs text-darkNavy bg-ice-50/50 p-2.5 rounded-xl border border-ice-200 mt-1 italic">
                {order.specialInstructions || 'No special garment handling instructions specified.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: One-Click Lifecycle Stage Progression */}
        <div className="bg-navy-700 text-white rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-aqua-300 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-aqua-400" />
              <span>Operational Stage Management</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-600 text-white border border-navy-500">
              Current: {order.status}
            </span>
          </div>

          <p className="text-xs text-ice-200/80">
            Advance the order lifecycle as our rider collects, sanitizes, presses, and delivers garments.
          </p>

          {/* Quick Advancement Stepper Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {order.status === 'Request Received' && (
              <button
                type="button"
                onClick={() => handleUpdate('Confirmed')}
                disabled={isUpdating}
                className="py-2 px-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Booking Request</span>
              </button>
            )}

            {order.status === 'Confirmed' && (
              <button
                type="button"
                onClick={() => handleUpdate('Picked Up')}
                disabled={isUpdating}
                className="py-2 px-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Clothes Picked Up</span>
              </button>
            )}

            {order.status === 'Picked Up' && (
              <button
                type="button"
                onClick={() => handleUpdate('Washing & Ironing')}
                disabled={isUpdating}
                className="py-2 px-3.5 rounded-xl bg-aqua-500 hover:bg-aqua-400 text-darkNavy font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Washing & Ironing</span>
              </button>
            )}

            {order.status === 'Washing & Ironing' && (
              <button
                type="button"
                onClick={() => handleUpdate('Ready for Delivery')}
                disabled={isUpdating}
                className="py-2 px-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Ready for Delivery</span>
              </button>
            )}

            {order.status === 'Ready for Delivery' && (
              <button
                type="button"
                onClick={() => handleUpdate('Delivered')}
                disabled={isUpdating}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Order Delivered</span>
              </button>
            )}

            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isUpdating}
                className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </button>
            )}
          </div>

          {/* Jump to specific status dropdown */}
          <div className="pt-2 border-t border-navy-600/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-[11px] text-ice-200/60 font-semibold shrink-0">
              Manual Override:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="px-2.5 py-1.5 rounded-xl border border-navy-500 text-xs font-semibold bg-navy-800 text-white focus:outline-none focus:ring-2 focus:ring-aqua-400 flex-1"
            >
              {Object.keys(ORDER_STATUS_LABELS).map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_LABELS[st].label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleUpdate(selectedStatus)}
              disabled={isUpdating || selectedStatus === order.status}
              className="py-1.5 px-3 rounded-xl bg-navy-600 hover:bg-navy-500 text-white text-xs font-bold transition-colors disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Section 4: Booking Status History Timeline */}
        <div className="border border-ice-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-aqua-600" />
              <span>Status Lifecycle Audit History</span>
            </span>
            <span className="text-[11px] text-navy-500 font-mono">
              {history.length} transition(s)
            </span>
          </div>

          {isLoadingHistory ? (
            <div className="py-6 text-center text-xs text-navy-400">
              Loading status history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-4 text-xs text-navy-400 text-center italic">
              No previous status updates recorded.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-aqua-500 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-darkNavy text-xs">
                        {item.new_status}
                      </span>
                      <span className="text-[10px] text-navy-400 font-mono">
                        {new Date(item.changed_at).toLocaleString('en-PK', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-navy-600 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Linked Payment Record */}
        <div className="border border-ice-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-aqua-600" />
              <span>Financial & Payment Status</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                order.paymentStatus === 'Paid' || order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'Awaiting Verification'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-navy-500 block">Selected Method:</span>
              <strong className="text-darkNavy font-semibold">{order.paymentMethod}</strong>
            </div>

            <div>
              <span className="text-navy-500 block">Transaction Reference (TID):</span>
              <span className="font-mono text-xs font-bold text-navy-800">
                {payment?.transaction_reference || 'None submitted yet'}
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Confirmed Amount:</span>
              <span className="text-xs font-bold text-emerald-700">
                {payment?.payment_amount != null
                  ? `PKR ${payment.payment_amount.toLocaleString()}`
                  : 'Pending final weight check'}
              </span>
            </div>

            <div>
              <span className="text-navy-500 block">Verification Action:</span>
              {payment && onOpenPaymentVerification ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaymentVerification(payment);
                  }}
                  className="text-xs font-bold text-aqua-700 hover:text-aqua-800 underline inline-flex items-center gap-1"
                >
                  <span>Verify / Edit Payment Record</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-navy-400">Cash collection on delivery</span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps & Close */}
        <div className="flex items-center justify-between pt-2 border-t border-ice-100 text-[11px] text-navy-400">
          <div>
            <span>Placed: {new Date(order.createdAt).toLocaleString('en-PK')}</span>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Record
          </Button>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>Cancel Booking Confirmation</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-700 leading-relaxed">
              Are you sure you want to cancel booking <strong className="font-mono font-bold text-navy-900">{order.trackingNumber}</strong>?
              Please enter the official cancellation reason to be recorded in the audit trail and customer notification.
            </p>

            {cancelError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{cancelError}</span>
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
                  placeholder="e.g. Customer requested cancellation via helpline, or address unserviceable..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-navy-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Quick Reason Suggestions */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCancellationReason('Customer requested cancellation via helpline.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Customer Phone Request
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationReason('Address outside current operational dispatch zone.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Out of Zone
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationReason('Customer booked a duplicate order.')}
                  className="px-2 py-1 rounded-lg bg-ice-100 text-navy-700 hover:bg-ice-200"
                >
                  Duplicate Order
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ice-100">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-navy-600 hover:text-navy-800"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                >
                  {isUpdating ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
