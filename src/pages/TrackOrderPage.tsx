import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Phone,
  FileText,
  ArrowRight,
  PackageCheck,
  CalendarCheck,
  Home,
  User,
  Info,
  RotateCcw,
  CalendarCheck2,
  XCircle,
  HelpCircle,
  MessageCircle,
  CreditCard,
  Send,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { bookingService } from '@/services/bookingService';
import { paymentService } from '@/services/paymentService';
import { Order, OrderStatus, BookingStatusHistoryRecord, PaymentRecord } from '@/types';
import { TIME_SLOTS, BUSINESS_INFO } from '@/utils/constants';

// The 6 Order Status Stages required by the prompt
interface TimelineStage {
  step: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    step: 1,
    title: 'Request Received',
    desc: 'Pickup request received & queued for processing.',
    icon: CalendarCheck,
  },
  {
    step: 2,
    title: 'Confirmed',
    desc: 'Customer team confirmed slot & rider assigned.',
    icon: CheckCircle2,
  },
  {
    step: 3,
    title: 'Picked Up',
    desc: 'Rider collected laundry from your gate in Kasur.',
    icon: Truck,
  },
  {
    step: 4,
    title: 'Washing & Ironing',
    desc: 'Hygienic separated wash & commercial steam press.',
    icon: Sparkles,
  },
  {
    step: 5,
    title: 'Ready for Delivery',
    desc: 'Garments inspected, packed, and out for delivery.',
    icon: PackageCheck,
  },
  {
    step: 6,
    title: 'Delivered',
    desc: 'Clean, fresh clothes handed to your doorstep.',
    icon: Home,
  },
];

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code') || '';
  const { user, isConfigured } = useAuth();

  const [bookingRef, setBookingRef] = useState(queryCode.toUpperCase());
  const [phoneVerification, setPhoneVerification] = useState(user?.phone_number || '');
  const [customerBookings, setCustomerBookings] = useState<Order[]>([]);

  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<BookingStatusHistoryRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // 3-Hour Cancellation & Rescheduling Modals State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of schedule / plan');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState(TIME_SLOTS[0]);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleFeedback, setRescheduleFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Payment Verification State
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [tidInput, setTidInput] = useState('');
  const [tidNotesInput, setTidNotesInput] = useState('');
  const [isSubmittingTid, setIsSubmittingTid] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load authenticated customer's own bookings for quick 1-click tracking
  useEffect(() => {
    let isMounted = true;
    if (user) {
      orderService
        .getCustomerOrders(user.id, user.phone_number, user.email)
        .then((orders) => {
          if (isMounted) {
            setCustomerBookings(orders);
          }
        })
        .catch((err) => console.warn('Could not load user bookings:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  // If query param 'code' is provided and user is authenticated or phone is present, trigger lookup
  useEffect(() => {
    if (queryCode) {
      setBookingRef(queryCode.toUpperCase());
      handleTrackOrder(queryCode.toUpperCase());
    }
  }, [queryCode, user]);

  // Clean phone string for comparison
  const normalizePhone = (phoneStr: string): string => {
    return phoneStr.replace(/[\s\-\(\)\+]/g, '').slice(-10); // match last 10 digits
  };

  const handleTrackOrder = async (refCodeToSearch?: string) => {
    const code = (refCodeToSearch || bookingRef).trim().toUpperCase();
    setSearchError('');
    setIsUnauthorized(false);
    setVerifiedOrder(null);

    if (!code) {
      setSearchError('Please enter your Booking Reference code.');
      return;
    }

    // If guest user, require phone number verification to prevent guessing other customers' bookings
    if (!user && !phoneVerification.trim()) {
      setSearchError(
        'Please enter the phone number used during booking to verify your ownership of this order.'
      );
      return;
    }

    setIsSearching(true);

    try {
      const found = await orderService.getOrderByTracking(code, phoneVerification);

      if (!found) {
        setSearchError(`No booking record found for reference "${code}". Please check your code.`);
        setIsSearching(false);
        return;
      }

      // Security Verification: Ensure caller is authorized to view this booking
      if (user) {
        // Authenticated customer verification
        const isOwner =
          (found.userId && found.userId === user.id) ||
          (found.customerPhone &&
            user.phone_number &&
            normalizePhone(found.customerPhone) === normalizePhone(user.phone_number)) ||
          (user.email && found.customerPhone.includes(user.email));

        // Admin users can inspect orders
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
          setIsUnauthorized(true);
          setSearchError(
            'Access Restricted: This booking reference belongs to another customer account. For security, you can only track orders placed by your own account.'
          );
          setIsSearching(false);
          return;
        }
      } else {
        // Guest user verification: compare phone number with record's phone number
        const recordPhone = normalizePhone(found.customerPhone);
        const inputPhone = normalizePhone(phoneVerification);

        // If backend RPC already matched phone, allow; otherwise verify
        if (recordPhone && (!inputPhone || recordPhone !== inputPhone)) {
          setIsUnauthorized(true);
          setSearchError(
            'Verification Failed: The phone number provided does not match the contact number registered on this booking reference.'
          );
          setIsSearching(false);
          return;
        }
      }

      // Customer ownership verified
      setVerifiedOrder(found);
      setTidInput('');
      setTidNotesInput('');
      setPaymentFeedback(null);

      // Fetch live payment record
      try {
        const payRes = await paymentService.getPaymentByBookingId(found.id);
        if (payRes.payment) {
          setPaymentRecord(payRes.payment);
          if (payRes.payment.transaction_reference) {
            setTidInput(payRes.payment.transaction_reference);
          }
        } else {
          setPaymentRecord(null);
        }
      } catch (e) {
        console.warn('Could not load payment record in tracking:', e);
        setPaymentRecord(null);
      }

      // Load lifecycle status audit trail from public.booking_status_history
      try {
        const historyRes = await bookingService.getBookingStatusHistory(found.id);
        setStatusHistory(historyRes.history || []);
      } catch (err) {
        console.warn('Could not load status audit trail:', err);
      }
    } catch (err: any) {
      console.error('Error tracking order:', err);
      setSearchError('An error occurred while tracking your order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitTid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRecord || !tidInput.trim()) return;

    setIsSubmittingTid(true);
    setPaymentFeedback(null);
    try {
      const res = await paymentService.submitTransactionReference(
        paymentRecord.id,
        user?.id || paymentRecord.customer_id,
        tidInput,
        tidNotesInput
      );

      if (res.success && res.payment) {
        setPaymentRecord(res.payment);
        setPaymentFeedback({
          success: true,
          message:
            'Transaction reference submitted! Your payment is now awaiting manual verification by our accounts team.',
        });
        if (verifiedOrder) {
          setVerifiedOrder({
            ...verifiedOrder,
            paymentStatus: 'awaiting verification' as any,
          });
        }
      } else {
        setPaymentFeedback({
          success: false,
          message: res.error || 'Failed to submit transaction reference. Please try again.',
        });
      }
    } catch (err: any) {
      setPaymentFeedback({
        success: false,
        message: err.message || 'An error occurred while submitting transaction reference.',
      });
    } finally {
      setIsSubmittingTid(false);
    }
  };

  // Map order status to one of the 6 timeline stages
  const getStageIndex = (status: OrderStatus | string): number => {
    switch (status) {
      case 'Request Received':
      case 'Booking Request Received':
      case 'pending_pickup':
        return 1; // Stage 1: Request Received
      case 'Confirmed':
      case 'Booking Confirmed':
        return 2; // Stage 2: Confirmed
      case 'Picked Up':
      case 'Clothes Picked Up':
      case 'picked_up':
        return 3; // Stage 3: Picked Up
      case 'Washing & Ironing':
      case 'processing':
      case 'ironing':
        return 4; // Stage 4: Washing & Ironing
      case 'Ready for Delivery':
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return 5; // Stage 5: Ready for Delivery
      case 'Delivered':
      case 'delivered':
        return 6; // Stage 6: Delivered
      case 'Cancelled':
      case 'cancelled':
        return 0; // Cancelled
      default:
        return 1;
    }
  };

  // Check 3-hour policy for the currently verified order
  const policy = verifiedOrder
    ? bookingService.checkModificationPolicy(verifiedOrder)
    : null;

  const handleConfirmCancel = async () => {
    if (!verifiedOrder) return;
    setIsCancelling(true);
    setCancelFeedback(null);
    try {
      const res = await bookingService.requestCancellation(
        verifiedOrder.id,
        user?.id || 'guest',
        cancelReason
      );
      setCancelFeedback({ success: res.success, message: res.message });
      if (res.success) {
        setVerifiedOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
        const historyRes = await bookingService.getBookingStatusHistory(verifiedOrder.id);
        setStatusHistory(historyRes.history || []);
        setTimeout(() => setIsCancelModalOpen(false), 2000);
      }
    } catch (err: any) {
      setCancelFeedback({ success: false, message: err.message || 'Failed to cancel booking.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!verifiedOrder || !rescheduleDate) return;
    setIsRescheduling(true);
    setRescheduleFeedback(null);
    try {
      const res = await bookingService.requestReschedule(
        verifiedOrder.id,
        user?.id || 'guest',
        rescheduleDate,
        rescheduleTime,
        rescheduleReason
      );
      setRescheduleFeedback({ success: res.success, message: res.message });
      if (res.success) {
        setVerifiedOrder((prev) =>
          prev
            ? {
                ...prev,
                pickupDate: rescheduleDate,
                pickupTimeSlot: rescheduleTime,
              }
            : null
        );
        const historyRes = await bookingService.getBookingStatusHistory(verifiedOrder.id);
        setStatusHistory(historyRes.history || []);
        setTimeout(() => setIsRescheduleModalOpen(false), 2000);
      }
    } catch (err: any) {
      setRescheduleFeedback({ success: false, message: err.message || 'Failed to reschedule pickup.' });
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 pt-8 sm:pt-12">
      <Container size="lg">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* =========================================================================
              1. HEADER & INTRO
             ========================================================================= */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" />
              <span>Doorstep Order Pipeline</span>
            </div>

            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Track Your Order Status
            </h1>

            <p className="text-xs sm:text-sm text-darkNavy/75 font-inter">
              Check real-time progress of your laundry pickup, washing, steam pressing, and delivery
              in Kasur City.
            </p>
          </div>

          {/* =========================================================================
              2. TRACKING SEARCH SECTION (WITH SECURITY VERIFICATION)
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
            
            {/* Quick Chips for Logged-In Customers */}
            {user && customerBookings.length > 0 && (
              <div className="p-4 rounded-2xl bg-ice-50/70 border border-ice-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-500 block">
                  Your Recent Bookings:
                </span>
                <div className="flex flex-wrap gap-2">
                  {customerBookings.map((b) => (
                    <button
                      key={b.trackingNumber}
                      type="button"
                      onClick={() => {
                        setBookingRef(b.trackingNumber);
                        handleTrackOrder(b.trackingNumber);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        bookingRef === b.trackingNumber
                          ? 'bg-navy-500 text-white border-navy-500 shadow-xs'
                          : 'bg-white text-navy-600 border-ice-200 hover:border-aqua-300'
                      }`}
                    >
                      {b.trackingNumber} ({b.pickupDate})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackOrder();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* 1. Booking Reference Input */}
                <div className={user ? 'sm:col-span-8' : 'sm:col-span-6'}>
                  <FormField
                    label="Booking Reference"
                    required
                    htmlFor="tracking-ref"
                    hint="e.g. PW-KSR-12345"
                  >
                    <Input
                      id="tracking-ref"
                      type="text"
                      required
                      placeholder="PW-KSR-XXXXX"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                      leftIcon={<FileText className="w-4 h-4 text-navy-400" />}
                      className="font-mono uppercase font-bold"
                    />
                  </FormField>
                </div>

                {/* 2. Verification Phone (Required for guest users to prevent guessing) */}
                {!user && (
                  <div className="sm:col-span-6">
                    <FormField
                      label="Contact Phone Number"
                      required
                      htmlFor="tracking-phone"
                      hint="Security Verification"
                    >
                      <Input
                        id="tracking-phone"
                        type="tel"
                        required
                        placeholder="0300 1234567"
                        value={phoneVerification}
                        onChange={(e) => setPhoneVerification(e.target.value)}
                        leftIcon={<Phone className="w-4 h-4 text-navy-400" />}
                      />
                    </FormField>
                  </div>
                )}

                {/* 3. Track My Order Button */}
                <div className={user ? 'sm:col-span-4 flex items-end' : 'sm:col-span-12'}>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    fullWidth
                    isLoading={isSearching}
                    className="font-bold text-darkNavy shadow-aqua py-3"
                    leftIcon={<Search className="w-4 h-4 text-darkNavy" />}
                  >
                    Track My Order
                  </Button>
                </div>

              </div>

              {/* Privacy Notice */}
              <div className="text-[11px] text-darkNavy/60 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Customer Security: Bookings are verified before displaying details to protect your
                  privacy.
                </span>
              </div>
            </form>

            {/* Error / Unauthorized Alert */}
            {searchError && (
              <div
                role="alert"
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  isUnauthorized
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isUnauthorized ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">
                    {isUnauthorized ? 'Customer Verification Notice' : 'Search Notice'}
                  </div>
                  <p className="leading-relaxed font-inter">{searchError}</p>
                </div>
              </div>
            )}

          </div>

          {/* =========================================================================
              3. VERIFIED ORDER RESULT & 6-STAGE TIMELINE
             ========================================================================= */}
          {verifiedOrder && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Main Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-ice-200 shadow-soft space-y-8">
                
                {/* Verified Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ice-200">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block">
                      Verified Booking Record
                    </span>
                    <h2 className="font-mono font-extrabold text-2xl sm:text-3xl text-navy-500">
                      {verifiedOrder.trackingNumber}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-darkNavy/70">
                      <MapPin className="w-3.5 h-3.5 text-aqua-600" />
                      <span>{verifiedOrder.area}, Kasur City</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                      Current Stage Status
                    </span>
                    <StatusBadge status={verifiedOrder.status} pulse />
                  </div>
                </div>

                {/* =====================================================================
                    6-STAGE ORDER STATUS TIMELINE
                   ===================================================================== */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-bold text-base sm:text-lg text-navy-500">
                      Order Status Timeline
                    </h3>
                    <span className="text-xs font-semibold text-aqua-600">
                      Stage {getStageIndex(verifiedOrder.status)} of 6
                    </span>
                  </div>

                  {/* Desktop / Tablet Horizontal Timeline */}
                  <div className="hidden lg:grid grid-cols-6 gap-3 relative">
                    {TIMELINE_STAGES.map((st) => {
                      const Icon = st.icon;
                      const currentStage = getStageIndex(verifiedOrder.status);
                      const isComplete = currentStage > st.step;
                      const isCurrent = currentStage === st.step;
                      const isPending = currentStage < st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-4 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                            isCurrent
                              ? 'border-aqua-400 bg-aqua-50/60 ring-2 ring-aqua-400/40 shadow-sm'
                              : isComplete
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : 'border-ice-200 bg-ice-50/40 opacity-60'
                          }`}
                        >
                          <div>
                            {/* Step Node */}
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-2xs ${
                                isCurrent
                                  ? 'bg-aqua-400 text-darkNavy ring-4 ring-aqua-100'
                                  : isComplete
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-ice-200 text-darkNavy/50'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                                isCurrent
                                  ? 'text-aqua-800'
                                  : isComplete
                                  ? 'text-emerald-700'
                                  : 'text-darkNavy/40'
                              }`}
                            >
                              Step {st.step}
                            </span>

                            <h4 className="font-poppins font-bold text-xs text-navy-500 leading-tight mb-1">
                              {st.title}
                            </h4>
                          </div>

                          <span
                            className={`text-[10px] font-semibold mt-2 pt-2 border-t border-ice-200/60 block ${
                              isCurrent
                                ? 'text-aqua-700'
                                : isComplete
                                ? 'text-emerald-700'
                                : 'text-darkNavy/40'
                            }`}
                          >
                            {isCurrent ? 'Current' : isComplete ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile & Tablet Vertical Timeline (< lg) */}
                  <div className="lg:hidden space-y-3">
                    {TIMELINE_STAGES.map((st) => {
                      const Icon = st.icon;
                      const currentStage = getStageIndex(verifiedOrder.status);
                      const isComplete = currentStage > st.step;
                      const isCurrent = currentStage === st.step;
                      const isPending = currentStage < st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                            isCurrent
                              ? 'border-aqua-400 bg-aqua-50/50 ring-1 ring-aqua-400'
                              : isComplete
                              ? 'border-emerald-200 bg-emerald-50/40'
                              : 'border-ice-200 bg-ice-50/30 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-aqua-400 text-darkNavy'
                                : isComplete
                                ? 'bg-emerald-600 text-white'
                                : 'bg-ice-200 text-darkNavy/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isCurrent
                                    ? 'text-aqua-800'
                                    : isComplete
                                    ? 'text-emerald-700'
                                    : 'text-darkNavy/50'
                                }`}
                              >
                                Step {st.step} •{' '}
                                {isCurrent ? 'In Progress' : isComplete ? 'Completed' : 'Pending'}
                              </span>
                            </div>

                            <h4 className="font-poppins font-bold text-sm text-navy-500 mt-0.5">
                              {st.title}
                            </h4>
                            <p className="text-xs text-darkNavy/70 mt-0.5 font-inter">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* =====================================================================
                    BOOKING DETAILS DISPLAY (Verified Information)
                   ===================================================================== */}
                <div className="space-y-4 pt-4 border-t border-ice-100">
                  <h3 className="font-poppins font-bold text-base text-navy-500">
                    Verified Booking Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    
                    {/* Booking Reference */}
                    <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Booking Reference
                      </span>
                      <span className="font-mono font-bold text-navy-700 text-sm block">
                        {verifiedOrder.trackingNumber}
                      </span>
                    </div>

                    {/* Service Type */}
                    <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Service Type
                      </span>
                      <span className="font-poppins font-bold text-aqua-700 text-sm block">
                        {verifiedOrder.items?.[0]?.serviceTitle || 'Wash & Iron'}
                      </span>
                    </div>

                    {/* Current Status */}
                    <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Current Status
                      </span>
                      <span className="font-bold text-navy-700 text-sm capitalize block">
                        {verifiedOrder.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Pickup Date & Slot */}
                    <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Scheduled Pickup Date
                      </span>
                      <span className="font-medium text-darkNavy text-xs block">
                        {verifiedOrder.pickupDate} ({verifiedOrder.pickupTimeSlot})
                      </span>
                    </div>

                    {/* Pickup Address */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Pickup Address
                      </span>
                      <span className="font-medium text-darkNavy text-xs block leading-relaxed">
                        {verifiedOrder.pickupAddress}
                      </span>
                    </div>

                    {/* Payment Method & Status (Kept distinct from Booking Status) */}
                    <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                      <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Payment Method & Status
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-700 text-xs block">
                          {verifiedOrder.paymentMethod}
                        </span>
                        {(() => {
                          const statusLower = (paymentRecord?.payment_status || verifiedOrder.paymentStatus || 'Pending').toLowerCase();
                          if (statusLower === 'paid') {
                            return (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                                Paid & Verified
                              </span>
                            );
                          }
                          if (statusLower === 'awaiting verification') {
                            return (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-sky-100 text-sky-800">
                                Awaiting Verification
                              </span>
                            );
                          }
                          if (statusLower === 'failed') {
                            return (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-rose-100 text-rose-800">
                                Failed
                              </span>
                            );
                          }
                          if (statusLower === 'refunded') {
                            return (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-800">
                                Refunded
                              </span>
                            );
                          }
                          return (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Estimated Delivery Information (Only if available) */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-ice-50/60 border border-ice-100 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                          Estimated Delivery Information
                        </span>
                        <p className="text-xs text-darkNavy/80 font-medium">
                          {verifiedOrder.status === 'delivered'
                            ? 'Delivered successfully to customer doorstep.'
                            : 'Standard turnaround: Same Day or Next Day upon doorstep collection.'}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                        Doorstep Service
                      </span>
                    </div>

                    {/* Dedicated Payment Verification & TID Card */}
                    <div className="sm:col-span-3 p-4 sm:p-5 rounded-2xl border border-ice-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-600 text-xs flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-aqua-600" />
                          Payment Details & Manual Verification
                        </span>
                        <span className="text-[11px] font-bold text-navy-500">
                          {paymentRecord?.payment_amount != null
                            ? `Amount: PKR ${paymentRecord.payment_amount.toLocaleString()}`
                            : 'Amount: Pending Laundry Weighing'}
                        </span>
                      </div>

                      {verifiedOrder.paymentMethod === 'Cash on Delivery' ? (
                        <p className="text-xs text-darkNavy/70 font-inter leading-relaxed">
                          Cash on Delivery: Payment will be collected in cash at your doorstep upon delivery. No advance transfer is needed.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-ice-50 border border-ice-200 text-xs text-darkNavy/80 space-y-1.5">
                            <p className="font-semibold text-navy-700">
                              Payment Instructions for {verifiedOrder.paymentMethod}:
                            </p>
                            <p className="text-darkNavy/70">
                              Official account details for {verifiedOrder.paymentMethod} are provided directly via SMS/WhatsApp confirmation once your pickup is reviewed. Do not transfer to unverified accounts.
                            </p>
                            <p className="text-[11px] text-amber-800">
                              * Payments are verified manually by the Pickup Wash accounts team before confirmation.
                            </p>
                          </div>

                          {(() => {
                            const statusLower = (paymentRecord?.payment_status || verifiedOrder.paymentStatus || 'Pending').toLowerCase();
                            if (statusLower === 'paid') {
                              return (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>
                                    Payment Confirmed & Verified. (Reference: {paymentRecord?.transaction_reference || 'Verified by Staff'})
                                  </span>
                                </div>
                              );
                            }
                            if (statusLower === 'awaiting verification') {
                              return (
                                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                                  <span>
                                    Transaction Reference <strong>{paymentRecord?.transaction_reference || tidInput}</strong> has been received and is awaiting manual verification by our staff.
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <form onSubmit={handleSubmitTid} className="space-y-2 pt-1">
                                <span className="text-xs font-semibold text-navy-700 block">
                                  Submit Transaction Reference (TID):
                                </span>
                                {paymentFeedback && (
                                  <div
                                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                                      paymentFeedback.success
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                                    }`}
                                  >
                                    {paymentFeedback.success ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                    )}
                                    <span>{paymentFeedback.message}</span>
                                  </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    placeholder="Enter Transaction Reference (TID)"
                                    value={tidInput}
                                    onChange={(e) => setTidInput(e.target.value)}
                                    required
                                    className="text-xs font-mono"
                                  />
                                  <Input
                                    placeholder="Sender Name (Optional)"
                                    value={tidNotesInput}
                                    onChange={(e) => setTidNotesInput(e.target.value)}
                                    className="text-xs"
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="primary"
                                    isLoading={isSubmittingTid}
                                    disabled={!tidInput.trim()}
                                    className="shrink-0 text-xs font-semibold gap-1.5"
                                    leftIcon={<Send className="w-3 h-3" />}
                                  >
                                    Submit TID
                                  </Button>
                                </div>
                              </form>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* 3-Hour Cancellation & Rescheduling Management Card */}
                    {policy && (
                      <div className="sm:col-span-3 p-4 sm:p-5 rounded-2xl border border-ice-200 bg-white space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">
                                3-Hour Modification & Cancellation Policy
                              </span>
                              {policy.canCancel ? (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Eligible ({policy.timeRemainingFormatted})
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full">
                                  Window Closed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-darkNavy/70 font-inter leading-relaxed">
                              {policy.canCancel
                                ? 'Need to change your pickup date or cancel this request? You can submit changes free of charge within the 3-hour window.'
                                : policy.reason}
                            </p>
                          </div>

                          {policy.canCancel ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => {
                                  setRescheduleDate(verifiedOrder.pickupDate);
                                  setRescheduleTime(verifiedOrder.pickupTimeSlot);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="gap-1.5 text-xs text-navy-700 font-semibold"
                                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-aqua-600" />}
                              >
                                Reschedule
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setIsCancelModalOpen(true)}
                                className="gap-1.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800 font-semibold"
                                leftIcon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                              >
                                Cancel Booking
                              </Button>
                            </div>
                          ) : (
                            <a
                              href={`https://wa.me/923000000000?text=${encodeURIComponent(
                                `Hello Pickup Wash, I have an inquiry about my booking: ${verifiedOrder.trackingNumber}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button
                                size="xs"
                                variant="secondary"
                                className="gap-1.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 font-semibold"
                                leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                              >
                                Contact Support
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status History Audit Log (Supabase public.booking_status_history) */}
                    {statusHistory.length > 0 && (
                      <div className="sm:col-span-3 p-4 rounded-2xl bg-white border border-ice-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-navy-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-aqua-600" />
                            Status History & Audit Trail
                          </span>
                          <span className="text-[10px] text-darkNavy/60">
                            {statusHistory.length} event{statusHistory.length > 1 ? 's' : ''} recorded
                          </span>
                        </div>

                        <div className="space-y-2 border-l-2 border-aqua-300 ml-2 pl-3">
                          {statusHistory.map((item, idx) => (
                            <div key={item.id || idx} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-navy-600">{item.new_status}</span>
                                <span className="text-[10px] text-darkNavy/50">
                                  {new Date(item.changed_at).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="text-[11px] text-darkNavy/70 font-inter">{item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Back to Dashboard / My Bookings Navigation */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-ice-100">
                  <div className="flex items-center gap-3">
                    <Link to="/account/history">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 text-xs text-navy-600"
                        leftIcon={<ArrowRight className="w-3.5 h-3.5 rotate-180" />}
                      >
                        Back to My Bookings
                      </Button>
                    </Link>

                    <Link to="/book">
                      <Button
                        variant="accent"
                        size="sm"
                        className="gap-2 text-xs font-bold text-darkNavy shadow-aqua"
                        leftIcon={<CalendarCheck className="w-3.5 h-3.5 text-darkNavy" />}
                      >
                        Book Another Pickup
                      </Button>
                    </Link>
                  </div>

                  <a
                    href="tel:+923000000000"
                    className="text-xs text-darkNavy/70 hover:text-navy-600 font-medium flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-aqua-600" />
                    <span>Need help? Contact Kasur Helpline</span>
                  </a>
                </div>

              </div>

            </div>
          )}

          {/* Demonstration Notice */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 text-xs text-darkNavy/75 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-aqua-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-navy-600">
                  Demonstration Tracking Pipeline:
                </span>{' '}
                This tracking engine demonstrates real-time stage progression across Kasur City.
                Configure Supabase keys in <code>.env</code> to connect live cloud order webhooks.
              </div>
            </div>
          )}

          {/* Cancellation Modal */}
          {isCancelModalOpen && verifiedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-ice-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-ice-100">
                  <div className="flex items-center gap-2 text-red-600 font-bold">
                    <XCircle className="w-5 h-5" />
                    <span>Cancel Booking Request</span>
                  </div>
                  <button
                    onClick={() => setIsCancelModalOpen(false)}
                    className="p-1 rounded-full text-darkNavy/50 hover:bg-ice-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs text-darkNavy/80">
                  <p>
                    Are you sure you want to cancel booking{' '}
                    <strong className="font-mono text-navy-700">{verifiedOrder.trackingNumber}</strong>?
                  </p>
                  <p className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    ℹ️ Cancellation is processed immediately in accordance with our 3-hour policy.
                  </p>

                  <FormField label="Reason for cancellation (optional)" htmlFor="cancel-reason">
                    <Input
                      id="cancel-reason"
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Change of schedule, traveling, etc."
                    />
                  </FormField>
                </div>

                {cancelFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      cancelFeedback.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {cancelFeedback.message}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCancelModalOpen(false)}
                    disabled={isCancelling}
                  >
                    Keep Booking
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleConfirmCancel}
                    isLoading={isCancelling}
                    disabled={isCancelling}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
          {isRescheduleModalOpen && verifiedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-ice-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-ice-100">
                  <div className="flex items-center gap-2 text-navy-700 font-bold">
                    <RotateCcw className="w-5 h-5 text-aqua-600" />
                    <span>Reschedule Pickup Slot</span>
                  </div>
                  <button
                    onClick={() => setIsRescheduleModalOpen(false)}
                    className="p-1 rounded-full text-darkNavy/50 hover:bg-ice-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <FormField label="New Pickup Date" required htmlFor="reschedule-date">
                    <Input
                      id="reschedule-date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Preferred Time Slot" required htmlFor="reschedule-time">
                    <Select
                      id="reschedule-time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    >
                      {TIME_SLOTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Reason / Instructions (optional)" htmlFor="reschedule-reason">
                    <Input
                      id="reschedule-reason"
                      type="text"
                      placeholder="e.g. Please collect after 3 PM"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                    />
                  </FormField>
                </div>

                {rescheduleFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      rescheduleFeedback.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {rescheduleFeedback.message}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRescheduleModalOpen(false)}
                    disabled={isRescheduling}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleConfirmReschedule}
                    isLoading={isRescheduling}
                    disabled={isRescheduling || !rescheduleDate}
                    className="text-darkNavy font-bold shadow-aqua"
                  >
                    Save New Slot
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </Container>
    </div>
  );
};
