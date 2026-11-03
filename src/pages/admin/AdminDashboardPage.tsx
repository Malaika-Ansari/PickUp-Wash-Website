import React, { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { Order, OrderStatus, PaymentRecord, PaymentStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Navigation tab: 'orders' | 'payments'
  const [activeTab, setActiveTab] = useState<'orders' | 'payments'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Payments State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Payment Verification Modal State
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<PaymentStatus>('Paid');
  const [verifyAmount, setVerifyAmount] = useState<string>('');
  const [verifyTid, setVerifyTid] = useState<string>('');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load orders
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load payments
  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await paymentService.getAllPayments();
      setPayments(res.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPayments();
  }, []);

  // Update booking order status
  const handleStatusChange = async (trackingNumber: string, newStatus: OrderStatus) => {
    setUpdatingId(trackingNumber);
    try {
      await orderService.updateOrderStatus(trackingNumber, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Payment Verification Modal
  const handleOpenVerifyModal = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setVerifyStatus(payment.payment_status);
    setVerifyAmount(payment.payment_amount != null ? String(payment.payment_amount) : '');
    setVerifyTid(payment.transaction_reference || '');
    setVerifyNotes(payment.payment_notes || '');
    setVerifyFeedback(null);
  };

  // Submit Payment Verification
  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !user) return;

    // Security check: only admins can verify payments
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
          message: `Payment status updated to ${verifyStatus} successfully!`,
        });

        // Update local list
        setPayments((prev) =>
          prev.map((p) => (p.id === selectedPayment.id ? (res.payment as PaymentRecord) : p))
        );

        // Also refresh orders to reflect synced payment status
        fetchOrders();

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

  // Order Metrics
  const totalOrdersCount = orders.length;
  const pendingPickupCount = orders.filter((o) => o.status === 'pending_pickup').length;
  const inProgressCount = orders.filter((o) => ['picked_up', 'processing', 'ironing'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Payment Metrics
  const awaitingVerificationCount = payments.filter((p) => p.payment_status === 'Awaiting Verification').length;
  const paidPaymentsCount = payments.filter((p) => p.payment_status === 'Paid').length;
  const pendingPaymentsCount = payments.filter((p) => p.payment_status === 'Pending').length;
  const verifiedPaymentsTotalPkr = payments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((sum, p) => sum + (p.payment_amount || 0), 0);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    // Find matching booking for customer info lookup
    const matchingOrder = orders.find((o) => o.id === p.booking_id);
    const trackingStr = matchingOrder ? matchingOrder.trackingNumber.toLowerCase() : '';
    const customerStr = matchingOrder ? matchingOrder.customerName.toLowerCase() : '';
    const phoneStr = matchingOrder ? matchingOrder.customerPhone : '';
    const tidStr = (p.transaction_reference || '').toLowerCase();

    const matchesSearch =
      paymentSearch === '' ||
      trackingStr.includes(paymentSearch.toLowerCase()) ||
      customerStr.includes(paymentSearch.toLowerCase()) ||
      phoneStr.includes(paymentSearch) ||
      tidStr.includes(paymentSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(paymentSearch.toLowerCase());

    const matchesStatus = paymentStatusFilter === 'all' || p.payment_status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === 'all' || p.payment_method === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-aqua-600" />
            <span>Kasur City Operations Hub</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-900">
            Operations & Payment Center
          </h1>
          <p className="text-xs sm:text-sm text-navy-600">
            Real-time Doorstep Pickups, Laundry Tracking & Payment Verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              fetchOrders();
              fetchPayments();
            }}
            isLoading={isLoadingOrders || isLoadingPayments}
            className="gap-2 self-start sm:self-auto"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-ice-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-navy-500 text-white shadow-soft'
              : 'text-navy-600 hover:bg-ice-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Laundry Pipeline</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-navy-700 text-aqua-300">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === 'payments'
              ? 'bg-navy-500 text-white shadow-soft'
              : 'text-navy-600 hover:bg-ice-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Verification & Audit</span>
          {awaitingVerificationCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-darkNavy animate-pulse">
              {awaitingVerificationCount} Review
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ice-200 text-navy-700">
              {payments.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ORDERS & OPERATIONS
         ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Order Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-ice-200">
              <span className="text-xs font-semibold text-navy-400 uppercase">Total Orders</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 mt-1">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-navy-500 font-medium">All registered bookings</span>
            </Card>

            <Card className="p-5 border-amber-200 bg-amber-50/40">
              <span className="text-xs font-semibold text-amber-700 uppercase">Pending Pickup</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-amber-700 mt-1">
                {pendingPickupCount}
              </div>
              <span className="text-[11px] text-amber-600">Waiting for rider collection</span>
            </Card>

            <Card className="p-5 border-aqua-300 bg-aqua-50/40">
              <span className="text-xs font-semibold text-navy-700 uppercase">Active In Laundry</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-700 mt-1">
                {inProgressCount}
              </div>
              <span className="text-[11px] text-navy-600">In washing or steam ironing</span>
            </Card>

            <Card className="p-5 border-emerald-200 bg-emerald-50/40">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Delivered Orders</span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-emerald-800 mt-1">
                {deliveredCount}
              </div>
              <span className="text-[11px] text-emerald-700">Doorstep delivered in Kasur</span>
            </Card>
          </div>

          {/* Search & Filter Controls */}
          <Card className="p-4 border-ice-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by tracking code, customer name, area, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-navy-400 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
              >
                <option value="all">All Statuses</option>
                {Object.keys(ORDER_STATUS_LABELS).map((k) => (
                  <option key={k} value={k}>
                    {ORDER_STATUS_LABELS[k].label}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Orders Table */}
          <Card className="p-0 border-ice-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-navy-500 text-white font-poppins text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tracking Code</th>
                    <th className="py-3.5 px-4">Customer & Location</th>
                    <th className="py-3.5 px-4">Pickup Schedule</th>
                    <th className="py-3.5 px-4">Booking Status</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-200 text-navy-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-navy-400">
                        No orders matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-ice-50/60 transition-colors">
                        {/* Tracking Code */}
                        <td className="py-4 px-4 font-mono font-bold text-navy-700 whitespace-nowrap">
                          {ord.trackingNumber}
                        </td>

                        {/* Customer & Location */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-navy-900">{ord.customerName}</div>
                          <div className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-aqua-600" />
                            {ord.customerPhone}
                          </div>
                          <div className="text-xs text-navy-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-aqua-600" />
                            <span className="truncate max-w-[200px]">{ord.area} - {ord.pickupAddress}</span>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs">
                          <div className="font-medium text-navy-800 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-navy-400" />
                            {ord.pickupDate}
                          </div>
                          <div className="text-navy-500 text-[11px] mt-0.5">
                            {ord.pickupTimeSlot}
                          </div>
                        </td>

                        {/* Current Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            ORDER_STATUS_LABELS[ord.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {ORDER_STATUS_LABELS[ord.status]?.label || ord.status}
                          </span>
                        </td>

                        {/* Payment Method & Status */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs">
                          <div className="font-semibold text-navy-800">{ord.paymentMethod}</div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${
                            (ord.paymentStatus || '').toLowerCase() === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (ord.paymentStatus || '').toLowerCase() === 'awaiting verification'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus || 'Pending'}
                          </span>
                        </td>

                        {/* Update Status Dropdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            disabled={updatingId === ord.trackingNumber}
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.trackingNumber, e.target.value as OrderStatus)}
                            className="px-2.5 py-1.5 rounded-lg border border-ice-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-400"
                          >
                            {Object.keys(ORDER_STATUS_LABELS).map((st) => (
                              <option key={st} value={st}>
                                {ORDER_STATUS_LABELS[st].label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PAYMENT VERIFICATION & MANAGEMENT
         ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Payment Metrics Row */}
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
              <span className="text-[11px] text-emerald-700">Approved cash & digital</span>
            </Card>

            <Card className="p-5 border-sky-200 bg-sky-50/40">
              <span className="text-xs font-semibold text-navy-600 uppercase flex items-center justify-between">
                <span>Pending / COD</span>
                <CreditCard className="w-3.5 h-3.5 text-navy-500" />
              </span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-700 mt-1">
                {pendingPaymentsCount}
              </div>
              <span className="text-[11px] text-navy-600">Pending delivery or transfer</span>
            </Card>

            <Card className="p-5 border-ice-200">
              <span className="text-xs font-semibold text-navy-400 uppercase flex items-center justify-between">
                <span>Total Collected</span>
                <DollarSign className="w-3.5 h-3.5 text-aqua-600" />
              </span>
              <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 mt-1">
                PKR {verifiedPaymentsTotalPkr.toLocaleString()}
              </div>
              <span className="text-[11px] text-navy-500 font-medium">From verified transactions</span>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="p-4 border-ice-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Booking Ref, TID, customer name, phone..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Payment Method Filter */}
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
              >
                <option value="all">All Methods</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Awaiting Verification">Awaiting Verification</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </Card>

          {/* Payments Table */}
          <Card className="p-0 border-ice-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-navy-500 text-white font-poppins text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Amount (PKR)</th>
                    <th className="py-3.5 px-4">Transaction TID</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-200 text-navy-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-navy-400">
                        No payment records matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const matchedOrder = orders.find((o) => o.id === p.booking_id);
                      const isAwaiting = p.payment_status === 'Awaiting Verification';

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isAwaiting ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-ice-50/60'
                          }`}
                        >
                          {/* Booking Ref */}
                          <td className="py-4 px-4 font-mono font-bold text-navy-700 whitespace-nowrap">
                            {matchedOrder ? matchedOrder.trackingNumber : 'PW-KSR-BK'}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-navy-900">
                              {matchedOrder ? matchedOrder.customerName : 'Registered Customer'}
                            </div>
                            <div className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-aqua-600" />
                              {matchedOrder ? matchedOrder.customerPhone : 'N/A'}
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-semibold text-navy-800">{p.payment_method}</span>
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {p.payment_amount != null ? (
                              <span className="font-bold text-navy-700">
                                PKR {p.payment_amount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[11px] text-darkNavy/50 italic">
                                Pending Weighing
                              </span>
                            )}
                          </td>

                          {/* Transaction Reference (TID) */}
                          <td className="py-4 px-4 font-mono text-xs whitespace-nowrap">
                            {p.transaction_reference ? (
                              <span className="bg-ice-100 text-navy-700 px-2 py-0.5 rounded-lg border border-ice-300 font-bold">
                                {p.transaction_reference}
                              </span>
                            ) : (
                              <span className="text-darkNavy/40 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Payment Status Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {p.payment_status === 'Paid' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Paid & Verified
                              </span>
                            )}
                            {p.payment_status === 'Awaiting Verification' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
                                Awaiting Verification
                              </span>
                            )}
                            {p.payment_status === 'Pending' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Pending
                              </span>
                            )}
                            {p.payment_status === 'Failed' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                Failed
                              </span>
                            )}
                            {p.payment_status === 'Refunded' && (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                Refunded
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
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
                <h3 className="font-poppins font-extrabold text-xl text-navy-800">
                  Verify Laundry Payment
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-full text-darkNavy/50 hover:bg-ice-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Booking Info Card */}
            {(() => {
              const matchedOrder = orders.find((o) => o.id === selectedPayment.booking_id);
              return (
                <div className="p-4 rounded-2xl bg-ice-50/80 border border-ice-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-navy-700">
                      {matchedOrder ? matchedOrder.trackingNumber : 'Booking Record'}
                    </span>
                    <span className="font-semibold text-aqua-700">
                      Method: {selectedPayment.payment_method}
                    </span>
                  </div>
                  {matchedOrder && (
                    <div className="space-y-0.5 text-darkNavy/70">
                      <div>Customer: <strong>{matchedOrder.customerName}</strong> ({matchedOrder.customerPhone})</div>
                      <div>Area: {matchedOrder.area} • Service: {matchedOrder.items?.[0]?.serviceTitle || 'Wash & Iron'}</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Verification Form */}
            <form onSubmit={handleConfirmVerification} className="space-y-4 text-xs">
              {verifyFeedback && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                    verifyFeedback.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {verifyFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{verifyFeedback.message}</span>
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy-700 block">
                  Updated Payment Status:
                </label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ice-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                >
                  <option value="Paid">Paid (Confirmed & Verified)</option>
                  <option value="Awaiting Verification">Awaiting Verification (Needs Follow-up)</option>
                  <option value="Pending">Pending (Not Yet Received)</option>
                  <option value="Failed">Failed (Invalid Reference / Transfer Failed)</option>
                  <option value="Refunded">Refunded (Amount Returned to Customer)</option>
                </select>
              </div>

              {/* Verified Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy-700 block">
                  Confirmed Amount (PKR):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 850 (Leave blank if pending weighing)"
                  value={verifyAmount}
                  onChange={(e) => setVerifyAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ice-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                />
                <span className="text-[11px] text-darkNavy/50 block">
                  Confirmed service charges calculated after weighing laundry clothes.
                </span>
              </div>

              {/* Transaction Reference / TID */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy-700 block">
                  Transaction Reference / TID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-digit JazzCash/Easypaisa TID, Bank Ref, or Rider Receipt"
                  value={verifyTid}
                  onChange={(e) => setVerifyTid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ice-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                />
              </div>

              {/* Internal Staff Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy-700 block">
                  Staff Verification Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified against official JazzCash business SMS notification or cash received at doorstep by rider."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ice-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
                />
              </div>

              {/* Audit history */}
              {selectedPayment.verified_at && (
                <div className="p-3 rounded-xl bg-ice-50 border border-ice-200 text-[11px] text-darkNavy/70 space-y-1">
                  <div className="font-semibold text-navy-700">Previous Audit Record:</div>
                  <div>Verified At: {new Date(selectedPayment.verified_at).toLocaleString()}</div>
                  {selectedPayment.verified_by && <div>Verified By Staff ID: {selectedPayment.verified_by}</div>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ice-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPayment(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isVerifying}
                  className="gap-2 font-bold"
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Save Verification Status
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
