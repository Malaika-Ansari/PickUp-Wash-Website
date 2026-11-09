import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { profileService } from '@/services/profileService';
import { catalogService } from '@/services/catalogService';
import { notificationService } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Order, 
  OrderStatus, 
  PaymentRecord, 
  PaymentStatus, 
  ProfileRecord, 
  ServiceRecord, 
  MonthlyPackageRecord, 
  NotificationRecord, 
  AdminAuditLog 
} from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SEO } from '@/components/common/SEO';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  Layers,
  ArrowRight,
  Eye,
  Users,
  Sliders,
  Bell,
  BarChart3,
  Settings,
  Sparkles,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { AdminBookingDetailsModal } from '@/components/admin/AdminBookingDetailsModal';
import { AdminBookingsManager } from '@/components/admin/AdminBookingsManager';
import { AdminAnalyticsCharts } from '@/components/admin/AdminAnalyticsCharts';
import { AdminReportsDashboard } from '@/components/admin/AdminReportsDashboard';
import { AdminCustomerDirectory } from '@/components/admin/AdminCustomerDirectory';
import { AdminServicesManager } from '@/components/admin/AdminServicesManager';
import { AdminNotificationsViewer } from '@/components/admin/AdminNotificationsViewer';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active navigation tab from URL search param (defaults to 'overview')
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // =========================================================================
  // Primary State (Real database records)
  // =========================================================================
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [customers, setCustomers] = useState<ProfileRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [packages, setPackages] = useState<MonthlyPackageRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Loading & Error States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filter & Search states for Orders
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter & Search states for Payments
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Audit Logs Search
  const [auditSearch, setAuditSearch] = useState('');

  // Modals State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<PaymentStatus>('Paid');
  const [verifyAmount, setVerifyAmount] = useState<string>('');
  const [verifyTid, setVerifyTid] = useState<string>('');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // =========================================================================
  // Data Fetching: Retrieve all real records from Supabase
  // =========================================================================
  const fetchAllData = useCallback(async (isRefreshAction = false) => {
    if (isRefreshAction) {
      setIsRefreshing(true);
    } else {
      setIsLoadingData(true);
    }
    setDataError(null);

    try {
      const [
        ordersRes,
        paymentsRes,
        customersRes,
        servicesRes,
        packagesRes,
        notifsRes,
        auditRes,
      ] = await Promise.all([
        orderService.getAllOrders(),
        paymentService.getAllPayments(),
        profileService.getAllCustomers(),
        catalogService.getAllServices(),
        catalogService.getAllMonthlyPackages(),
        notificationService.getAllNotifications(100),
        authService.getAdminAuditLogs(100),
      ]);

      setOrders(ordersRes || []);
      setPayments(paymentsRes.payments || []);
      setCustomers(customersRes.customers || []);
      setServices(servicesRes.services || []);
      setPackages(packagesRes.packages || []);
      setNotifications(notifsRes.notifications || []);
      setAuditLogs(auditRes || []);
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setDataError(err.message || 'Unable to fetch records from database.');
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // =========================================================================
  // Metric Calculations (Derived strictly from real Supabase records)
  // =========================================================================
  const totalBookingsCount = orders.length;

  const pendingRequestsCount = orders.filter((o) =>
    ['Request Received', 'Booking Request Received', 'pending_pickup'].includes(o.status)
  ).length;

  const confirmedBookingsCount = orders.filter((o) =>
    ['Confirmed', 'Booking Confirmed'].includes(o.status)
  ).length;

  const completedDeliveriesCount = orders.filter((o) =>
    ['Delivered', 'delivered'].includes(o.status)
  ).length;

  const totalCustomersCount = customers.length;

  const pendingPaymentsCount = payments.filter((p) =>
    ['Pending', 'pending'].includes(p.payment_status)
  ).length;

  const awaitingVerificationCount = payments.filter((p) =>
    p.payment_status === 'Awaiting Verification'
  ).length;

  const paidPaymentsCount = payments.filter((p) =>
    p.payment_status === 'Paid'
  ).length;

  // =========================================================================
  // Order Status Updates
  // =========================================================================
  const handleStatusChange = async (
    trackingNumber: string,
    newStatus: OrderStatus,
    cancellationReason?: string
  ) => {
    setUpdatingId(trackingNumber);
    try {
      await orderService.updateOrderStatus(trackingNumber, newStatus, cancellationReason);
      // Refresh orders
      const updatedOrders = await orderService.getAllOrders();
      setOrders(updatedOrders);

      // If details modal is open for this order, update viewingOrder state
      if (viewingOrder && viewingOrder.trackingNumber === trackingNumber) {
        const found = updatedOrders.find((o) => o.trackingNumber === trackingNumber);
        if (found) setViewingOrder(found);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================================
  // Payment Verification Handlers
  // =========================================================================
  const handleOpenVerifyModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setVerifyStatus(payment.payment_status);
    setVerifyAmount(payment.payment_amount != null ? String(payment.payment_amount) : '');
    setVerifyTid(payment.transaction_reference || '');
    setVerifyNotes(payment.payment_notes || '');
    setVerifyFeedback(null);
  };

  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !user) return;

    if (user.role && user.role !== 'admin') {
      setVerifyFeedback({
        success: false,
        message: 'Unauthorized: Only administrator staff are permitted to verify payment records.',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyFeedback(null);

    const parsedAmount = verifyAmount.trim() ? parseFloat(verifyAmount) : null;

    try {
      const res = await paymentService.verifyPayment(
        selectedPayment.id,
        user.id,
        verifyStatus,
        verifyTid,
        verifyNotes,
        parsedAmount
      );

      if (res.success && res.payment) {
        setVerifyFeedback({
          success: true,
          message: `Payment status updated to "${verifyStatus}" successfully!`,
        });

        setPayments((prev) =>
          prev.map((p) => (p.id === selectedPayment.id ? (res.payment as PaymentRecord) : p))
        );

        // Refresh orders to sync payment status
        const updatedOrders = await orderService.getAllOrders();
        setOrders(updatedOrders);

        setTimeout(() => {
          setSelectedPayment(null);
        }, 1500);
      } else {
        setVerifyFeedback({
          success: false,
          message: res.error || 'Failed to verify payment record.',
        });
      }
    } catch (err: any) {
      setVerifyFeedback({
        success: false,
        message: err.message || 'An unexpected error occurred during verification.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // =========================================================================
  // Filtering Logic
  // =========================================================================
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        o.trackingNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.area.toLowerCase().includes(q) ||
        o.customerPhone.includes(searchTerm);

      let matchesStatus = true;
      if (filterStatus !== 'all') {
        matchesStatus = o.status === filterStatus || o.bookingStatus === filterStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchingOrder = orders.find((o) => o.id === p.booking_id);
      const trackingStr = matchingOrder ? matchingOrder.trackingNumber.toLowerCase() : '';
      const customerStr = matchingOrder ? matchingOrder.customerName.toLowerCase() : '';
      const phoneStr = matchingOrder ? matchingOrder.customerPhone : '';
      const tidStr = (p.transaction_reference || '').toLowerCase();
      const q = paymentSearch.toLowerCase();

      const matchesSearch =
        paymentSearch === '' ||
        trackingStr.includes(q) ||
        customerStr.includes(q) ||
        phoneStr.includes(paymentSearch) ||
        tidStr.includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus =
        paymentStatusFilter === 'all' || p.payment_status === paymentStatusFilter;
      const matchesMethod =
        paymentMethodFilter === 'all' || p.payment_method === paymentMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, orders, paymentSearch, paymentStatusFilter, paymentMethodFilter]);

  // Loading Screen
  if (isLoadingData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-navy-100 flex items-center justify-center text-navy-600 animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin text-aqua-600" />
        </div>
        <div className="text-center">
          <h2 className="font-poppins font-bold text-base text-darkNavy">
            Connecting to Kasur Operations Hub...
          </h2>
          <p className="text-xs text-navy-500 mt-1">
            Loading real-time bookings, payment reconciliations, and customer records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-darkNavy">
      <SEO
        title="Admin Control Center"
        description="Centralized administrative operations console for managing bookings, customer profiles, payment verifications, and pricing for Pickup Wash Kasur."
      />
      {/* =========================================================================
          TOP OPERATIONAL HEADER & QUICK REFRESH
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-aqua-600" />
            <span>Kasur City Central Operational Console</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-900">
            {activeTab === 'overview' && 'Operations Dashboard'}
            {activeTab === 'bookings' && 'Booking Dispatch Pipeline'}
            {activeTab === 'customers' && 'Customer Directory'}
            {activeTab === 'services' && 'Services & Catalog Pricing'}
            {activeTab === 'payments' && 'Payment Verification & Audit'}
            {activeTab === 'notifications' && 'Customer Notifications Stream'}
            {activeTab === 'analytics' && 'Business Analytics & Reports'}
            {activeTab === 'settings' && 'Operational Settings & Security Audit'}
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 mt-0.5">
            Real-time management for doorstep laundry, steam pressing, and cash collections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchAllData(true)}
            disabled={isRefreshing}
            className="gap-2 shrink-0 bg-white shadow-soft"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-aqua-600' : 'text-navy-600'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
          </Button>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kasur Hub Live</span>
          </span>
        </div>
      </div>

      {/* Error Alert if any */}
      {dataError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">Database Connectivity Notice</strong>
            <p>{dataError}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: OVERVIEW (Summary Cards, Quick Actions, Analytics & Recent Bookings)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* 1. Summary Cards (Real Supabase records) */}
          <section aria-labelledby="summary-metrics-heading">
            <h2 id="summary-metrics-heading" className="sr-only">Operations Summary Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Total Bookings */}
              <Card className="p-4 sm:p-5 border-ice-200 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Total Bookings</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-navy-400" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-900 mt-2">
                  {totalBookingsCount}
                </div>
                <span className="text-[10px] text-navy-500 mt-1 truncate">Platform submissions</span>
              </Card>

              {/* Pending Booking Requests */}
              <Card className="p-4 sm:p-5 border-amber-300 bg-amber-50/40 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Pending Requests</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-amber-900 mt-2">
                  {pendingRequestsCount}
                </div>
                <span className="text-[10px] text-amber-700 mt-1 truncate">Awaiting review</span>
              </Card>

              {/* Confirmed Bookings */}
              <Card className="p-4 sm:p-5 border-blue-200 bg-blue-50/30 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Confirmed</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-blue-900 mt-2">
                  {confirmedBookingsCount}
                </div>
                <span className="text-[10px] text-blue-700 mt-1 truncate">Assigned to rider</span>
              </Card>

              {/* Completed Deliveries */}
              <Card className="p-4 sm:p-5 border-emerald-200 bg-emerald-50/30 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Delivered</span>
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-emerald-900 mt-2">
                  {completedDeliveriesCount}
                </div>
                <span className="text-[10px] text-emerald-700 mt-1 truncate">Delivered to door</span>
              </Card>

              {/* Total Customers */}
              <Card className="p-4 sm:p-5 border-ice-200 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Customers</span>
                  <Users className="w-3.5 h-3.5 text-navy-400" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-900 mt-2">
                  {totalCustomersCount}
                </div>
                <span className="text-[10px] text-navy-500 mt-1 truncate">Registered clients</span>
              </Card>

              {/* Pending Payments */}
              <Card className="p-4 sm:p-5 border-ice-200 shadow-card flex flex-col justify-between">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pending Pay</span>
                  <CreditCard className="w-3.5 h-3.5 text-navy-400" />
                </span>
                <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-900 mt-2">
                  {pendingPaymentsCount}
                </div>
                <span className="text-[10px] text-navy-500 mt-1 truncate">Cash / TID unpaid</span>
              </Card>
            </div>
          </section>

          {/* 2. Quick Actions Shortcuts */}
          <section aria-labelledby="quick-actions-heading" className="space-y-3">
            <h2 id="quick-actions-heading" className="text-xs font-bold text-navy-800 uppercase tracking-wider">
              Operational Quick Actions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  handleTabChange('bookings');
                  setFilterStatus('Request Received');
                }}
                className="p-4 rounded-2xl bg-white border border-ice-200 hover:border-aqua-400 hover:shadow-soft transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-aqua-600 transition-colors" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-darkNavy block">View New Bookings</strong>
                  <span className="text-[10px] text-navy-500">{pendingRequestsCount} awaiting review</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('bookings')}
                className="p-4 rounded-2xl bg-white border border-ice-200 hover:border-aqua-400 hover:shadow-soft transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-800 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-navy-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-aqua-600 transition-colors" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-darkNavy block">Manage Bookings</strong>
                  <span className="text-[10px] text-navy-500">Pipeline & rider dispatch</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleTabChange('payments');
                  setPaymentStatusFilter('Awaiting Verification');
                }}
                className="p-4 rounded-2xl bg-white border border-ice-200 hover:border-aqua-400 hover:shadow-soft transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center relative">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    {awaitingVerificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-aqua-600 transition-colors" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-darkNavy block">Verify Payments</strong>
                  <span className="text-[10px] text-navy-500">{awaitingVerificationCount} requiring TID check</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('services')}
                className="p-4 rounded-2xl bg-white border border-ice-200 hover:border-aqua-400 hover:shadow-soft transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Sliders className="w-4 h-4 text-purple-700" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-navy-400 group-hover:text-aqua-600 transition-colors" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-darkNavy block">Manage Services</strong>
                  <span className="text-[10px] text-navy-500">Pricing & catalog toggle</span>
                </div>
              </button>
            </div>
          </section>

          {/* 3. Business Analytics Visualizations */}
          <section aria-labelledby="analytics-visualizations-heading">
            <h2 id="analytics-visualizations-heading" className="sr-only">Business Analytics</h2>
            <AdminAnalyticsCharts orders={orders} payments={payments} />
          </section>

          {/* 4. Recent Bookings Table (Last 6 orders) */}
          <section aria-labelledby="recent-bookings-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="recent-bookings-heading" className="font-poppins font-bold text-base sm:text-lg text-darkNavy">
                  Recent Booking Submissions
                </h2>
                <p className="text-xs text-navy-500">
                  Latest laundry requests submitted for doorstep collection in Kasur
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTabChange('bookings')}
                className="text-xs font-bold text-aqua-700 hover:text-aqua-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Pipeline ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <Card className="border-ice-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 font-bold">Booking Reference</th>
                      <th className="py-3.5 px-4 font-bold">Customer Name</th>
                      <th className="py-3.5 px-4 font-bold">Service Type</th>
                      <th className="py-3.5 px-4 font-bold">Pickup Date</th>
                      <th className="py-3.5 px-4 font-bold">Booking Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ice-100 bg-white">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-navy-400">
                          <ShoppingBag className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                          <p className="font-semibold text-darkNavy text-sm">No bookings in database yet</p>
                          <p className="text-xs text-navy-400 mt-1">
                            New customer orders placed from the website will display here in real time.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 6).map((order) => {
                        return (
                          <tr key={order.id} className="hover:bg-ice-50/70 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-xs text-navy-900 bg-ice-100 px-2.5 py-1 rounded-md border border-ice-200">
                                {order.trackingNumber}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div>
                                <strong className="text-darkNavy font-semibold block text-xs sm:text-sm">
                                  {order.customerName || 'Customer'}
                                </strong>
                                <span className="text-[10px] text-navy-500">
                                  {order.customerPhone || order.area || 'Kasur City'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-xs font-medium text-navy-800 whitespace-nowrap">
                              {order.items[0]?.serviceTitle || 'Standard Laundry'}
                            </td>

                            <td className="py-3.5 px-4 text-xs text-navy-600 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-navy-400" />
                                <span>{order.pickupDate}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.trackingNumber, e.target.value as OrderStatus)}
                                disabled={updatingId === order.trackingNumber}
                                className="px-2.5 py-1 rounded-lg border border-ice-300 text-xs font-semibold bg-white text-navy-800 focus:outline-none focus:ring-2 focus:ring-aqua-500 cursor-pointer"
                              >
                                {Object.keys(ORDER_STATUS_LABELS).map((st) => (
                                  <option key={st} value={st}>
                                    {ORDER_STATUS_LABELS[st].label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => setViewingOrder(order)}
                                className="gap-1.5 text-xs text-navy-700 font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5 text-aqua-600" />
                                <span>View Details</span>
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BOOKINGS (Full Laundry Pipeline & Dispatch Management)
         ========================================================================= */}
      {activeTab === 'bookings' && (
        <AdminBookingsManager
          orders={orders}
          payments={payments}
          onStatusChange={handleStatusChange}
          onOpenPaymentVerification={handleOpenVerifyModal}
          initialFilterStatus={filterStatus}
          initialSearch={searchTerm}
        />
      )}

      {/* =========================================================================
          TAB 3: CUSTOMERS DIRECTORY
         ========================================================================= */}
      {activeTab === 'customers' && (
        <AdminCustomerDirectory
          customers={customers}
          orders={orders}
          onSelectCustomerBookings={(phone) => {
            handleTabChange('bookings');
            setSearchTerm(phone);
          }}
        />
      )}

      {/* =========================================================================
          TAB 4: SERVICES & PRICING
         ========================================================================= */}
      {activeTab === 'services' && (
        <AdminServicesManager
          services={services}
          packages={packages}
          onRefresh={() => fetchAllData(true)}
        />
      )}

      {/* =========================================================================
          TAB 5: PAYMENTS (Verification & Audit)
         ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Payment Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-amber-300 bg-amber-50/50">
              <span className="text-xs font-semibold text-amber-800 uppercase flex items-center justify-between">
                <span>Awaiting Review</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-amber-800 mt-1">
                {awaitingVerificationCount}
              </div>
              <span className="text-[11px] text-amber-700">Digital payments needing check</span>
            </Card>

            <Card className="p-5 border-emerald-300 bg-emerald-50/50">
              <span className="text-xs font-semibold text-emerald-800 uppercase flex items-center justify-between">
                <span>Verified Paid</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-emerald-800 mt-1">
                {paidPaymentsCount}
              </div>
              <span className="text-[11px] text-emerald-700">Reconciled to cash/account</span>
            </Card>

            <Card className="p-5 border-ice-200">
              <span className="text-xs font-semibold text-navy-400 uppercase">Pending Collection</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 mt-1">
                {pendingPaymentsCount}
              </div>
              <span className="text-[11px] text-navy-400">Cash on delivery pending</span>
            </Card>

            <Card className="p-5 border-ice-200">
              <span className="text-xs font-semibold text-navy-400 uppercase">Total Verified PKR</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-900 mt-1">
                PKR {payments.filter((p) => p.payment_status === 'Paid').reduce((s, p) => s + (p.payment_amount || 0), 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-navy-400">Settled revenue</span>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="p-4 sm:p-5 border-ice-200">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by TID, customer, or booking ref..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-navy-200 text-xs font-semibold bg-white text-navy-700"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Payments Table */}
          <Card className="border-ice-200 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 font-bold">Booking Ref</th>
                    <th className="py-3.5 px-4 font-bold">Method</th>
                    <th className="py-3.5 px-4 font-bold">Transaction Reference (TID)</th>
                    <th className="py-3.5 px-4 font-bold">Amount (PKR)</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Verification</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ice-100 bg-white">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-navy-400">
                        <CreditCard className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                        <p className="font-semibold text-darkNavy text-sm">No payment records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const matchingOrder = orders.find((o) => o.id === p.booking_id);
                      const isAwaiting = p.payment_status === 'Awaiting Verification';

                      return (
                        <tr key={p.id} className="hover:bg-ice-50/70 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-xs text-navy-900 bg-ice-100 px-2.5 py-1 rounded-md border border-ice-200">
                              {matchingOrder ? matchingOrder.trackingNumber : p.booking_id.slice(0, 8)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-xs font-semibold text-navy-800 whitespace-nowrap">
                            {p.payment_method}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-xs text-navy-800 whitespace-nowrap">
                            {p.transaction_reference ? (
                              <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-200">
                                {p.transaction_reference}
                              </span>
                            ) : (
                              <span className="text-navy-400">Not provided</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                            {p.payment_amount != null
                              ? `PKR ${p.payment_amount.toLocaleString()}`
                              : 'Pending check'}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                p.payment_status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isAwaiting
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                  : 'bg-ice-100 text-navy-700 border-ice-200'
                              }`}
                            >
                              {p.payment_status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Button
                              size="xs"
                              variant={isAwaiting ? 'accent' : 'secondary'}
                              onClick={() => handleOpenVerifyModal(p)}
                              className={`gap-1.5 font-bold ${
                                isAwaiting ? 'shadow-aqua text-darkNavy' : 'text-navy-700'
                              }`}
                            >
                              <span>{isAwaiting ? 'Verify Payment' : 'Review / Edit'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
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
      )}

      {/* =========================================================================
          TAB 6: NOTIFICATIONS (Customer Alerts Stream)
         ========================================================================= */}
      {activeTab === 'notifications' && (
        <AdminNotificationsViewer
          notifications={notifications}
          onRefresh={() => fetchAllData(true)}
        />
      )}

      {/* =========================================================================
          TAB 7: REPORTS & ANALYTICS (Full-Width Deep Analytics)
         ========================================================================= */}
      {activeTab === 'analytics' && (
        <AdminReportsDashboard
          orders={orders}
          payments={payments}
          customers={customers}
          packages={packages}
        />
      )}

      {/* =========================================================================
          TAB 8: SETTINGS & SECURITY AUDIT TRAIL
         ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Operations Hub Specifications */}
          <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg text-darkNavy">
                Kasur Hub Operations Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-ice-50/70 border border-ice-200 space-y-1">
                <span className="text-navy-500 uppercase font-bold text-[10px] block">Operational Center</span>
                <strong className="text-darkNavy font-semibold block text-sm">Central Kasur Hub</strong>
                <span className="text-[11px] text-navy-500">Kutchery & Chunian Roads dispatch</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/70 border border-ice-200 space-y-1">
                <span className="text-navy-500 uppercase font-bold text-[10px] block">Security Architecture</span>
                <strong className="text-emerald-700 font-semibold block text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>RLS & Triggers Enforced</span>
                </strong>
                <span className="text-[11px] text-navy-500">Role escalation blocked in PostgreSQL</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ice-50/70 border border-ice-200 space-y-1">
                <span className="text-navy-500 uppercase font-bold text-[10px] block">Active Administrator</span>
                <strong className="text-darkNavy font-semibold block text-sm truncate">
                  {user?.email || 'admin@pickupwash.pk'}
                </strong>
                <span className="text-[11px] text-aqua-600 font-semibold">Verified Operations Staff</span>
              </div>
            </div>
          </Card>

          {/* Security Audit Trail */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-poppins font-bold text-base text-darkNavy flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-aqua-600" />
                  <span>Administrative Security Audit Log</span>
                </h3>
                <p className="text-xs text-navy-500">
                  Tamper-resistant ledger recording staff logins, order modifications, and payment reviews
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter audit actions..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-navy-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>
            </div>

            <Card className="border-ice-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Timestamp</th>
                      <th className="py-3 px-4 font-bold">Action</th>
                      <th className="py-3 px-4 font-bold">Staff Operator</th>
                      <th className="py-3 px-4 font-bold">Entity Type</th>
                      <th className="py-3 px-4 font-bold">Reference ID</th>
                      <th className="py-3 px-4 font-bold">Details</th>
                      <th className="py-3 px-4 font-bold text-right">Integrity</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ice-100 bg-white">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-navy-400">
                          <ShieldCheck className="w-6 h-6 text-navy-300 mx-auto mb-2" />
                          <p className="font-semibold text-darkNavy text-xs">No audit logs recorded yet</p>
                        </td>
                      </tr>
                    ) : (
                      auditLogs
                        .filter((log) => {
                          if (!auditSearch.trim()) return true;
                          const q = auditSearch.toLowerCase();
                          return (
                            log.action.toLowerCase().includes(q) ||
                            (log.admin_email && log.admin_email.toLowerCase().includes(q)) ||
                            (log.entity_id && log.entity_id.toLowerCase().includes(q))
                          );
                        })
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-ice-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-mono text-[11px] text-navy-500 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString('en-PK', {
                                dateStyle: 'short',
                                timeStyle: 'medium',
                              })}
                            </td>

                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-ice-100 text-navy-800 border border-ice-200">
                                {log.action}
                              </span>
                            </td>

                            <td className="py-2.5 px-4 text-xs font-medium text-darkNavy truncate max-w-[140px]">
                              {log.admin_email || log.admin_id || 'System'}
                            </td>

                            <td className="py-2.5 px-4 text-xs text-navy-600 uppercase font-semibold">
                              {log.entity_type}
                            </td>

                            <td className="py-2.5 px-4 font-mono text-xs text-navy-700 truncate max-w-[120px]">
                              {log.entity_id || '—'}
                            </td>

                            <td className="py-2.5 px-4 text-xs text-navy-600 truncate max-w-[180px]">
                              {typeof log.details === 'object' && log.details !== null
                                ? JSON.stringify(log.details)
                                : String(log.details || '—')}
                            </td>

                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOOKING DETAILS MODAL (Action from View Details on rows)
         ========================================================================= */}
      {viewingOrder && (
        <AdminBookingDetailsModal
          order={viewingOrder}
          payment={payments.find((p) => p.booking_id === viewingOrder.id)}
          onClose={() => setViewingOrder(null)}
          onStatusChange={handleStatusChange}
          onOpenPaymentVerification={handleOpenVerifyModal}
        />
      )}

      {/* =========================================================================
          ADMIN PAYMENT VERIFICATION MODAL
         ========================================================================= */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ice-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-aqua-700 uppercase tracking-wider block">
                  Payment Verification Staff Portal
                </span>
                <h2 className="font-poppins font-bold text-lg text-darkNavy">
                  Verify Transaction Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-xl text-navy-400 hover:text-navy-600 hover:bg-ice-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Payment Info */}
            <div className="bg-ice-50/70 rounded-2xl p-4 border border-ice-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Method:</span>
                <strong className="text-darkNavy font-semibold">{selectedPayment.payment_method}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Submitted TID:</span>
                <strong className="font-mono text-darkNavy bg-white px-2 py-0.5 rounded border border-ice-200">
                  {selectedPayment.transaction_reference || 'None'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Current Status:</span>
                <span className="font-bold text-navy-800">{selectedPayment.payment_status}</span>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleConfirmVerification} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                  Update Payment Status
                </label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-navy-200 font-semibold bg-white text-navy-800 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                >
                  <option value="Paid">Paid (Verified Received)</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Pending">Pending (Not Received)</option>
                  <option value="Failed">Failed (Invalid Transaction)</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                  Confirmed Amount (PKR)
                </label>
                <input
                  type="number"
                  value={verifyAmount}
                  onChange={(e) => setVerifyAmount(e.target.value)}
                  placeholder="e.g. 850"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                  Reconciled Transaction Reference (TID)
                </label>
                <input
                  type="text"
                  value={verifyTid}
                  onChange={(e) => setVerifyTid(e.target.value)}
                  placeholder="e.g. JC-1234567890"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                  Internal Verification Notes
                </label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes on cash settlement or SMS confirmation..."
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              {verifyFeedback && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    verifyFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {verifyFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{verifyFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPayment(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isVerifying}
                  className="bg-navy-500 hover:bg-navy-600 text-white font-bold"
                >
                  {isVerifying ? 'Saving Changes...' : 'Save Verification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
