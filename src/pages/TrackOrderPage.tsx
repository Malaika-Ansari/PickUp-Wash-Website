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
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';

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
    title: 'Booking Request Received',
    desc: 'Pickup request received and queued for review.',
    icon: CalendarCheck,
  },
  {
    step: 2,
    title: 'Booking Confirmed',
    desc: 'Customer team confirmed slot and assigned a rider.',
    icon: CheckCircle2,
  },
  {
    step: 3,
    title: 'Clothes Picked Up',
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

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
      const found = await orderService.getOrderByTracking(code);

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

        if (!inputPhone || recordPhone !== inputPhone) {
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
    } catch (err: any) {
      console.error('Error tracking order:', err);
      setSearchError('An error occurred while tracking your order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Map order status to one of the 6 timeline stages
  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending_pickup':
        return 1; // Stage 1: Booking Request Received
      case 'picked_up':
        return 3; // Stage 3: Clothes Picked Up
      case 'processing':
      case 'ironing':
        return 4; // Stage 4: Washing & Ironing
      case 'ready_for_delivery':
      case 'out_for_delivery':
        return 5; // Stage 5: Ready for Delivery
      case 'delivered':
        return 6; // Stage 6: Delivered
      case 'cancelled':
        return 0; // Cancelled
      default:
        return 1;
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

                    {/* Estimated Delivery Information (Only if available) */}
                    <div className="sm:col-span-3 p-4 rounded-2xl bg-ice-50/60 border border-ice-100 flex items-center justify-between gap-4">
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

        </div>
      </Container>
    </div>
  );
};
