import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarCheck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Search,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Sparkles,
  Info,
  Calendar,
  Layers,
  RotateCcw,
  XCircle,
  MessageCircle,
  CreditCard,
  Receipt,
  Send,
  Check,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/orderService';
import { bookingService } from '@/services/bookingService';
import { paymentService } from '@/services/paymentService';
import { notificationService } from '@/services/notificationService';
import { Order, PaymentRecord } from '@/types';
import { TIME_SLOTS, BUSINESS_INFO } from '@/utils/constants';
import { SEO } from '@/components/common/SEO';

export const CustomerAccountPage: React.FC = () => {
  const { user, isConfigured, updateProfile } = useAuth();
  const location = useLocation();

  const [bookings, setBookings] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    phoneNumber: user?.phone_number || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [profileErrorMessage, setProfileErrorMessage] = useState('');

  // Booking Details Modal & 3-Hour Actions State
  const [selectedBooking, setSelectedBooking] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plan / schedule');
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
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [tidInput, setTidInput] = useState('');
  const [tidNotesInput, setTidNotesInput] = useState('');
  const [isSubmittingTid, setIsSubmittingTid] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Notification State
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = () => {
    if (user?.id) {
      notificationService.getUnreadCount(user.id).then(setUnreadCount).catch(() => {});
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [user?.id, location.pathname]);

  const handleSelectBookingFromNotification = (bookingId: string) => {
    const matched = bookings.find((b) => b.id === bookingId);
    if (matched) {
      handleOpenDetails(matched);
    } else {
      orderService.getAllOrders().then((all) => {
        const found = all.find((o) => o.id === bookingId);
        if (found) handleOpenDetails(found);
      });
    }
  };

  // Update profile data if user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        phoneNumber: user.phone_number || '',
        email: user.email || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Fetch only the logged-in customer's actual bookings
  useEffect(() => {
    let isMounted = true;

    const fetchCustomerBookings = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        if (user) {
          const userOrders = await orderService.getCustomerOrders(
            user.id,
            user.phone_number,
            user.email
          );
          if (isMounted) {
            setBookings(userOrders);

            // If user has a booking with an address and user has no saved address, suggest latest
            if (!user.address && userOrders.length > 0 && userOrders[0].pickupAddress) {
              setProfileData((prev) => ({
                ...prev,
                address: prev.address || userOrders[0].pickupAddress,
              }));
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading customer bookings:', err);
        if (isMounted) {
          setLoadError('Failed to load bookings. Please refresh or try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerBookings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Calculate actual statistics from user's own data (no invented stats)
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'pending_pickup' || b.status === 'picked_up'
  ).length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'delivered').length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'delivered' && b.status !== 'cancelled'
  ).length;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMessage('');
    setProfileSuccessMessage('');
    setIsSavingProfile(true);

    try {
      const res = await updateProfile({
        full_name: profileData.fullName,
        phone: profileData.phoneNumber,
        address: profileData.address,
      });

      if (res.success) {
        setIsEditingProfile(false);
        setProfileSuccessMessage('Account details updated successfully in database.');
        setTimeout(() => setProfileSuccessMessage(''), 4000);
      } else {
        setProfileErrorMessage(res.error || 'Failed to save account changes.');
      }
    } catch (err: any) {
      setProfileErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenDetails = async (booking: Order) => {
    setSelectedBooking(booking);
    setRescheduleDate(booking.pickupDate);
    setRescheduleTime(booking.pickupTimeSlot);
    setCancelFeedback(null);
    setRescheduleFeedback(null);
    setTidInput('');
    setTidNotesInput('');
    setPaymentFeedback(null);
    setIsDetailModalOpen(true);

    // Fetch live payment record
    setIsLoadingPayment(true);
    try {
      const res = await paymentService.getPaymentByBookingId(booking.id);
      if (res.payment) {
        setPaymentRecord(res.payment);
        if (res.payment.transaction_reference) {
          setTidInput(res.payment.transaction_reference);
        }
      } else {
        setPaymentRecord(null);
      }
    } catch (e) {
      console.warn('Could not load payment record:', e);
      setPaymentRecord(null);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleSubmitTid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRecord || !user || !tidInput.trim()) return;

    setIsSubmittingTid(true);
    setPaymentFeedback(null);
    try {
      const res = await paymentService.submitTransactionReference(
        paymentRecord.id,
        user.id,
        tidInput,
        tidNotesInput
      );

      if (res.success && res.payment) {
        setPaymentRecord(res.payment);
        setPaymentFeedback({
          success: true,
          message:
            'Transaction Reference (TID) submitted! Your payment is now awaiting manual verification by our accounts team.',
        });
        // Update local state to reflect awaiting verification
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking?.id ? { ...b, paymentStatus: 'awaiting verification' as any } : b
          )
        );
        if (selectedBooking) {
          setSelectedBooking({ ...selectedBooking, paymentStatus: 'awaiting verification' as any });
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

  const handleConfirmCancel = async () => {
    if (!selectedBooking || !user) return;
    setIsCancelling(true);
    setCancelFeedback(null);
    try {
      const res = await bookingService.requestCancellation(
        selectedBooking.id,
        user.id,
        cancelReason
      );
      setCancelFeedback({ success: res.success, message: res.message });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: 'Cancelled' as const } : b))
        );
        setSelectedBooking((prev) => (prev ? { ...prev, status: 'Cancelled' as const } : null));
        setTimeout(() => setIsCancelModalOpen(false), 2000);
      }
    } catch (err: any) {
      setCancelFeedback({ success: false, message: err.message || 'Failed to cancel.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !user || !rescheduleDate) return;
    setIsRescheduling(true);
    setRescheduleFeedback(null);
    try {
      const res = await bookingService.requestReschedule(
        selectedBooking.id,
        user.id,
        rescheduleDate,
        rescheduleTime,
        rescheduleReason
      );
      setRescheduleFeedback({ success: res.success, message: res.message });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id
              ? { ...b, pickupDate: rescheduleDate, pickupTimeSlot: rescheduleTime }
              : b
          )
        );
        setSelectedBooking((prev) =>
          prev
            ? { ...prev, pickupDate: rescheduleDate, pickupTimeSlot: rescheduleTime }
            : null
        );
        setTimeout(() => setIsRescheduleModalOpen(false), 2000);
      }
    } catch (err: any) {
      setRescheduleFeedback({ success: false, message: err.message || 'Failed to reschedule.' });
    } finally {
      setIsRescheduling(false);
    }
  };

  const isProfileTab = location.pathname.includes('/profile');
  const isHistoryTab = location.pathname.includes('/history');
  const isNotificationsTab = location.pathname.includes('/notifications');

  return (
    <div className="space-y-8">
      <SEO
        title="Customer Account Dashboard"
        description="Manage your bookings, submit payment references, track pickups, and update your delivery address in Kasur."
      />
      {isNotificationsTab ? (
        <NotificationCenter onSelectBooking={handleSelectBookingFromNotification} />
      ) : (
        <>
          {/* =========================================================================
              1. DASHBOARD WELCOME SECTION
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ice-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customer Dashboard</span>
                </div>

                {/* Welcome Back Heading & Customer Name */}
                <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 tracking-tight">
                  Welcome Back, {user?.full_name || 'Customer'}!
                </h1>

                {/* Short Supporting Message */}
                <p className="text-xs sm:text-sm text-darkNavy/75 font-inter">
                  Manage your laundry bookings easily from one place.
                </p>
              </div>

              {/* Action Buttons: Alerts Bell & Prominent "Book a Pickup" Button */}
              <div className="shrink-0 flex items-center gap-3">
                <Link
                  to="/account/notifications"
                  className="relative p-2.5 rounded-2xl bg-ice-100 text-navy-700 hover:bg-ice-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="View all notifications"
                >
                  <Bell className="w-4 h-4 text-aqua-600" />
                  <span className="hidden sm:inline">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-aqua-400 text-darkNavy">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link to="/book">
                  <Button
                    size="md"
                    variant="accent"
                    className="gap-2 font-bold shadow-aqua text-darkNavy hover:text-white"
                    leftIcon={<CalendarCheck className="w-4 h-4 text-darkNavy" />}
                  >
                    Book a Pickup
                  </Button>
                </Link>
              </div>
            </div>

            {/* Unread Notifications Banner (If any unread) */}
            {unreadCount > 0 && (
              <div className="mt-4 p-3.5 rounded-2xl bg-aqua-50/80 border border-aqua-200 text-xs text-darkNavy/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-500"></span>
                  </span>
                  <span className="font-semibold text-navy-900">
                    You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''} regarding your laundry pickups in Kasur.
                  </span>
                </div>
                <Link
                  to="/account/notifications"
                  className="font-bold text-aqua-700 hover:text-aqua-800 flex items-center gap-1 shrink-0 text-xs"
                >
                  <span>Review Alerts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

        {/* Backend Status Clarification (If Supabase is not configured) */}
        {!isConfigured && (
          <div className="mt-4 p-3.5 rounded-2xl bg-ice-50 border border-ice-200 text-xs text-darkNavy/70 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-aqua-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-navy-600">Demonstration Session Notice:</span>{' '}
              Supabase cloud database is in local demonstration mode. New bookings placed during this
              browser session are tracked locally for your account.
            </div>
          </div>
        )}

        {/* =========================================================================
            2. DASHBOARD OVERVIEW CARDS (Actual Customer Data Only)
           ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          
          {/* Total Bookings */}
          <div className="p-5 rounded-2xl bg-ice-50/70 border border-ice-200 transition-all hover:border-ice-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block">
              Total Bookings
            </span>
            <div className="font-poppins font-extrabold text-3xl text-navy-500 mt-1">
              {isLoading ? '...' : totalBookingsCount}
            </div>
            <span className="text-[11px] text-darkNavy/65 mt-0.5 block">
              Lifetime requests in Kasur
            </span>
          </div>

          {/* Pending Bookings */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 transition-all hover:border-amber-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Bookings
            </span>
            <div className="font-poppins font-extrabold text-3xl text-amber-900 mt-1">
              {isLoading ? '...' : pendingBookingsCount}
            </div>
            <span className="text-[11px] text-amber-800/80 mt-0.5 block">
              Awaiting collection / review
            </span>
          </div>

          {/* Active Bookings */}
          <div className="p-5 rounded-2xl bg-aqua-50/50 border border-aqua-200 transition-all hover:border-aqua-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-aqua-800 block">
              Active Bookings
            </span>
            <div className="font-poppins font-extrabold text-3xl text-aqua-900 mt-1">
              {isLoading ? '...' : activeBookingsCount}
            </div>
            <span className="text-[11px] text-aqua-800/80 mt-0.5 block">
              In queue, wash or steam press
            </span>
          </div>

          {/* Completed Bookings */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 transition-all hover:border-emerald-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Completed Bookings
            </span>
            <div className="font-poppins font-extrabold text-3xl text-emerald-900 mt-1">
              {isLoading ? '...' : completedBookingsCount}
            </div>
            <span className="text-[11px] text-emerald-800/80 mt-0.5 block">
              Delivered clean to doorstep
            </span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. RECENT BOOKINGS SECTION (Table / Mobile Cards)
         ========================================================================= */}
      <div id="my-bookings" className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ice-100">
          <div>
            <h2 className="font-poppins font-bold text-xl text-navy-500">
              {isHistoryTab ? 'All My Bookings' : 'Recent Bookings'}
            </h2>
            <p className="text-xs text-darkNavy/70 mt-0.5">
              Review your scheduled doorstep laundry requests in Kasur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/track">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                <Search className="w-3.5 h-3.5 text-aqua-600" />
                Track an Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500 mx-auto" />
            <p className="text-xs text-darkNavy/60">Loading your booking records...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Empty State for New Customers (No Bookings) */}
        {!isLoading && !loadError && bookings.length === 0 && (
          <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-ice-100 text-navy-500 flex items-center justify-center mx-auto border border-ice-200">
              <Package className="w-8 h-8 text-aqua-600" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-poppins font-bold text-lg text-navy-500">
                No Bookings Yet
              </h3>
              <p className="text-xs text-darkNavy/70 leading-relaxed font-inter">
                You haven't scheduled any doorstep laundry pickups in Kasur yet. Ready for your first
                pickup?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 text-xs text-darkNavy/80">
              🎁 <strong>Remember:</strong> Your very first doorstep pickup is completely{' '}
              <span className="text-emerald-700 font-bold">FREE!</span>
            </div>

            <div className="pt-2">
              <Link to="/book">
                <Button
                  size="md"
                  variant="accent"
                  className="font-bold text-darkNavy shadow-aqua"
                  leftIcon={<CalendarCheck className="w-4 h-4 text-darkNavy" />}
                >
                  Schedule Your First Pickup
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Bookings Display (When Customer Has Bookings) */}
        {!isLoading && !loadError && bookings.length > 0 && (
          <div>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-ice-50/70 text-darkNavy/60 font-poppins uppercase tracking-wider text-[11px] border-y border-ice-200">
                  <tr>
                    <th className="py-3 px-4">Booking Reference</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Pickup Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100 text-darkNavy/85">
                  {bookings.map((b) => {
                    const serviceTitle = b.items?.[0]?.serviceTitle || 'Wash & Iron';

                    return (
                      <tr key={b.id || b.trackingNumber} className="hover:bg-ice-50/40 transition-colors">
                        {/* Booking Reference */}
                        <td className="py-3.5 px-4 font-mono font-bold text-navy-600">
                          {b.trackingNumber}
                        </td>

                        {/* Service Type */}
                        <td className="py-3.5 px-4 font-medium">
                          {serviceTitle}
                        </td>

                        {/* Pickup Date */}
                        <td className="py-3.5 px-4 text-darkNavy/75">
                          {b.pickupDate}{' '}
                          {b.pickupTimeSlot && (
                            <span className="text-[11px] text-darkNavy/50 block">
                              {b.pickupTimeSlot}
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={b.status} />
                        </td>

                        {/* View Details Action */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleOpenDetails(b)}
                            className="gap-1 font-semibold text-navy-600 hover:text-aqua-600"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {bookings.map((b) => {
                const serviceTitle = b.items?.[0]?.serviceTitle || 'Wash & Iron';

                return (
                  <div
                    key={b.id || b.trackingNumber}
                    className="p-4 rounded-2xl bg-ice-50/50 border border-ice-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-navy-600 text-xs">
                        {b.trackingNumber}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-navy-700">{serviceTitle}</div>
                      <div className="text-darkNavy/65">
                        Pickup: {b.pickupDate} ({b.pickupTimeSlot})
                      </div>
                      <div className="text-darkNavy/60 text-[11px] truncate">
                        📍 {b.pickupAddress}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-ice-200/80 flex justify-end">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleOpenDetails(b)}
                        className="gap-1 font-semibold text-navy-600"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. ACCOUNT INFORMATION & PROFILE SETTINGS
         ========================================================================= */}
      <div id="my-profile" className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ice-100">
          <div>
            <h2 className="font-poppins font-bold text-xl text-navy-500">
              Account Information
            </h2>
            <p className="text-xs text-darkNavy/70 mt-0.5">
              Personal contact details used for doorstep pickups in Kasur.
            </p>
          </div>

          {!isEditingProfile && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsEditingProfile(true)}
              className="gap-1.5 text-xs text-navy-600"
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-aqua-600" />}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {profileSuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{profileSuccessMessage}</span>
          </div>
        )}

        {profileErrorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{profileErrorMessage}</span>
          </div>
        )}

        {isEditingProfile ? (
          /* Profile Edit Form */
          <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Customer Name" required htmlFor="edit-name">
                <Input
                  id="edit-name"
                  type="text"
                  required
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  leftIcon={<User className="w-4 h-4" />}
                />
              </FormField>

              <FormField label="Phone Number" required htmlFor="edit-phone">
                <Input
                  id="edit-phone"
                  type="tel"
                  required
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </FormField>
            </div>

            <FormField label="Email Address" htmlFor="edit-email" hint="Linked with login">
              <Input
                id="edit-email"
                type="email"
                disabled
                value={profileData.email}
                leftIcon={<Mail className="w-4 h-4" />}
                className="bg-ice-100 text-darkNavy/60"
              />
            </FormField>

            <FormField
              label="Saved Pickup Address"
              htmlFor="edit-address"
              hint="House #, Street, Locality in Kasur"
            >
              <Input
                id="edit-address"
                type="text"
                placeholder="e.g. House #14, Street 2, Model Town, Kasur"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, address: e.target.value }))
                }
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </FormField>

            <div className="pt-2 flex items-center gap-2.5">
              <Button
                type="submit"
                variant="accent"
                size="sm"
                isLoading={isSavingProfile}
                disabled={isSavingProfile}
                className="font-bold text-darkNavy shadow-aqua"
                leftIcon={<Save className="w-4 h-4 text-darkNavy" />}
              >
                Save Changes
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          /* Profile Details Display */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                Customer Name
              </span>
              <span className="font-poppins font-bold text-sm text-navy-700 block">
                {profileData.fullName || 'Not provided'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                Email Address
              </span>
              <span className="font-poppins font-bold text-sm text-navy-700 block">
                {profileData.email || 'Not provided'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                Phone Number
              </span>
              <span className="font-poppins font-bold text-sm text-navy-700 block">
                {profileData.phoneNumber || 'Not provided'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
              <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                Saved Pickup Address
              </span>
              <span className="font-medium text-darkNavy text-xs block leading-relaxed">
                {profileData.address || 'No saved pickup address yet.'}
              </span>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* =========================================================================
          BOOKING DETAILS MODAL
         ========================================================================= */}
      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ice-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                  Booking Details
                </span>
                <h3 className="font-mono font-extrabold text-xl text-navy-600">
                  {selectedBooking.trackingNumber}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedBooking.status} pulse />
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 rounded-full text-darkNavy/50 hover:bg-ice-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Service Type
                </span>
                <span className="font-bold text-aqua-700 block">
                  {selectedBooking.items?.[0]?.serviceTitle || 'Wash & Iron'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Pickup Slot
                </span>
                <span className="font-semibold text-navy-700 block">
                  {selectedBooking.pickupDate} ({selectedBooking.pickupTimeSlot})
                </span>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Pickup Location (Kasur)
                </span>
                <span className="font-medium text-darkNavy block leading-relaxed">
                  {selectedBooking.pickupAddress}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Payment Method
                </span>
                <span className="font-bold text-navy-700 block">
                  {selectedBooking.paymentMethod}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Payment Status
                </span>
                {(() => {
                  const statusLower = (paymentRecord?.payment_status || selectedBooking.paymentStatus || 'Pending').toLowerCase();
                  if (statusLower === 'paid') {
                    return (
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                        Paid & Verified
                      </span>
                    );
                  }
                  if (statusLower === 'awaiting verification') {
                    return (
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-sky-100 text-sky-800">
                        Awaiting Verification
                      </span>
                    );
                  }
                  if (statusLower === 'failed') {
                    return (
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-rose-100 text-rose-800">
                        Failed
                      </span>
                    );
                  }
                  if (statusLower === 'refunded') {
                    return (
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-800">
                        Refunded
                      </span>
                    );
                  }
                  return (
                    <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  );
                })()}
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Billed Amount
                </span>
                <span className="font-bold text-navy-700 block">
                  {paymentRecord?.payment_amount != null
                    ? `PKR ${paymentRecord.payment_amount.toLocaleString()}`
                    : 'Pending Inspection'}
                </span>
              </div>

              {/* Special Promotion Notice */}
              <div className="p-3 rounded-xl bg-aqua-50/60 border border-aqua-200 text-aqua-900 flex items-center justify-between text-xs">
                <span className="font-semibold">Special Offer:</span>
                <span className="font-bold text-aqua-700">1st Pickup FREE</span>
              </div>
            </div>

            {/* =========================================================================
                PAYMENT DETAILS & VERIFICATION SECTION
               ========================================================================= */}
            <div className="p-4 rounded-2xl bg-ice-50/70 border border-ice-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-aqua-600" />
                  Payment Verification & Status
                </span>
                <span className="text-[10px] font-semibold text-darkNavy/60">
                  {selectedBooking.paymentMethod}
                </span>
              </div>

              {/* Cash on Delivery Notice */}
              {selectedBooking.paymentMethod === 'Cash on Delivery' ? (
                <div className="p-3 rounded-xl bg-white border border-ice-200 text-xs text-darkNavy/80 space-y-1">
                  <div className="font-semibold text-navy-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cash on Delivery Selected</span>
                  </div>
                  <p className="leading-relaxed">
                    Payment of your laundry bill will be collected in cash upon doorstep delivery after weighing & steam ironing. No advance deposit is needed.
                  </p>
                </div>
              ) : (
                /* Digital Payment Notice (JazzCash, Easypaisa, Bank Transfer) */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white border border-ice-200 text-xs text-darkNavy/80 space-y-1.5">
                    <div className="font-semibold text-navy-700">
                      Payment Instructions ({selectedBooking.paymentMethod}):
                    </div>
                    <p className="leading-relaxed text-darkNavy/70">
                      Official account details for {selectedBooking.paymentMethod} will be shared with you via verified SMS/WhatsApp confirmation once your pickup is reviewed. You can also contact Pickup Wash directly.
                    </p>
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Security Notice:</strong> All digital payments are verified manually by the Pickup Wash team before confirmation. Never share account PINs or OTP passwords.
                      </span>
                    </div>
                  </div>

                  {/* Payment Status State Display */}
                  {(() => {
                    const statusLower = (paymentRecord?.payment_status || selectedBooking.paymentStatus || 'Pending').toLowerCase();
                    if (statusLower === 'paid') {
                      return (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold block">Payment Confirmed & Verified</span>
                            <span className="text-[11px] text-emerald-700">
                              Ref: {paymentRecord?.transaction_reference || 'Verified by Admin'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    if (statusLower === 'awaiting verification') {
                      return (
                        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold">
                            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>Awaiting Manual Verification</span>
                          </div>
                          <p className="text-[11px] text-sky-800 leading-relaxed">
                            Transaction Reference <strong>{paymentRecord?.transaction_reference || tidInput}</strong> has been received. Our accounts team verifies transfers manually. Your laundry service is progressing normally.
                          </p>
                        </div>
                      );
                    }
                    return (
                      /* Form to submit Transaction Reference (TID) */
                      <form onSubmit={handleSubmitTid} className="p-3.5 rounded-xl bg-white border border-ice-200 space-y-2.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-navy-700 text-xs block">
                            Submit Transaction Reference (TID)
                          </span>
                          <span className="text-[11px] text-darkNavy/60 block">
                            Once you have completed your payment, enter the transaction ID/reference from your app for verification:
                          </span>
                        </div>

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

                        <div className="space-y-2">
                          <Input
                            placeholder="e.g. 12-digit JazzCash/Easypaisa TID or Bank Ref"
                            value={tidInput}
                            onChange={(e) => setTidInput(e.target.value)}
                            required
                            className="text-xs font-mono"
                          />
                          <Input
                            placeholder="Sender Name / Account Title (optional)"
                            value={tidNotesInput}
                            onChange={(e) => setTidNotesInput(e.target.value)}
                            className="text-xs"
                          />
                          <Button
                            type="submit"
                            size="xs"
                            variant="primary"
                            isLoading={isSubmittingTid}
                            disabled={!tidInput.trim()}
                            className="gap-1.5 text-xs font-semibold"
                            leftIcon={<Send className="w-3 h-3" />}
                          >
                            Submit Reference for Verification
                          </Button>
                        </div>
                      </form>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 3-Hour Modification & Cancellation Status Box */}
            {(() => {
              const policy = bookingService.checkModificationPolicy(selectedBooking);
              return (
                <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-600 text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-aqua-600" />
                      3-Hour Modification Policy
                    </span>
                    {policy.canCancel ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Eligible ({policy.timeRemainingFormatted})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full">
                        Window Closed
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-darkNavy/70 font-inter leading-relaxed">
                    {policy.canCancel
                      ? 'You can request rescheduling or cancellation directly within 3 hours of booking.'
                      : policy.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {policy.canCancel ? (
                      <>
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setRescheduleDate(selectedBooking.pickupDate);
                            setRescheduleTime(selectedBooking.pickupTimeSlot);
                            setIsRescheduleModalOpen(true);
                          }}
                          className="gap-1.5 text-xs text-navy-700 font-semibold"
                          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-aqua-600" />}
                        >
                          Reschedule Slot
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
                      </>
                    ) : (
                      <a
                        href={`https://wa.me/923000000000?text=${encodeURIComponent(
                          `Hello Pickup Wash, I have an inquiry about my booking: ${selectedBooking.trackingNumber}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="xs"
                          variant="secondary"
                          className="gap-1.5 text-xs text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 font-semibold"
                          leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        >
                          Support on WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-ice-100">
              <Link to={`/track?code=${selectedBooking.trackingNumber}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2 text-xs font-semibold text-navy-600 hover:text-aqua-600"
                  leftIcon={<Truck className="w-4 h-4 text-aqua-600" />}
                >
                  Live Order Tracker
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-ice-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Confirm Cancellation</span>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-full text-darkNavy/50 hover:bg-ice-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-darkNavy/80">
              Are you sure you want to cancel booking{' '}
              <strong className="font-mono text-navy-700">{selectedBooking.trackingNumber}</strong>?
            </p>

            <FormField label="Reason (optional)" htmlFor="account-cancel-reason">
              <Input
                id="account-cancel-reason"
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule changed, traveling, etc."
              />
            </FormField>

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
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 font-semibold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-ice-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <div className="flex items-center gap-2 text-navy-700 font-bold text-sm">
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

            <div className="space-y-3 text-xs">
              <FormField label="New Pickup Date" required htmlFor="account-reschedule-date">
                <Input
                  id="account-reschedule-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </FormField>

              <FormField label="Preferred Time Slot" required htmlFor="account-reschedule-time">
                <Select
                  id="account-reschedule-time"
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

              <FormField label="Reason (optional)" htmlFor="account-reschedule-reason">
                <Input
                  id="account-reschedule-reason"
                  type="text"
                  placeholder="e.g. Please collect in afternoon"
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
  );
};
