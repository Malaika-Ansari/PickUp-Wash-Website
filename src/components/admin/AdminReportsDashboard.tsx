import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  Filter, 
  Sparkles, 
  Users, 
  ShoppingBag, 
  Layers, 
  FileText, 
  ArrowUpRight, 
  Info,
  CalendarRange,
  RotateCcw
} from 'lucide-react';
import { Order, PaymentRecord, UserProfile, ProfileRecord, MonthlyPackageRecord } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { 
  exportBookingsToCsv, 
  exportPaymentsToCsv, 
  exportExecutiveSummaryToCsv, 
  ExecutiveSummaryData 
} from '@/utils/exportUtils';

interface AdminReportsDashboardProps {
  orders: Order[];
  payments: PaymentRecord[];
  customers?: (ProfileRecord | UserProfile)[];
  packages?: MonthlyPackageRecord[];
}

type DateRangeFilter = 'today' | '7days' | '30days' | 'this_month' | 'custom';
type TrendInterval = 'daily' | 'weekly' | 'monthly';

export const AdminReportsDashboard: React.FC<AdminReportsDashboardProps> = ({
  orders,
  payments,
  customers = [],
  packages = [],
}) => {
  // Date Filters
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('30days');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [trendInterval, setTrendInterval] = useState<TrendInterval>('daily');

  // Export Feedback
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // =========================================================================
  // Date Range Filtering Logic
  // =========================================================================
  const { filteredOrders, filteredPayments, periodLabel, rangeStartStr, rangeEndStr } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let label = 'Last 30 Days';

    if (dateFilter === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      label = 'Today';
    } else if (dateFilter === '7days') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      label = 'Last 7 Days';
    } else if (dateFilter === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      label = 'This Month';
    } else if (dateFilter === 'custom' && customStart && customEnd) {
      start = new Date(customStart + 'T00:00:00');
      end = new Date(customEnd + 'T23:59:59');
      label = `Custom (${customStart} to ${customEnd})`;
    } else {
      // Default: Last 30 Days
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      label = 'Last 30 Days';
    }

    const startMs = start.getTime();
    const endMs = end.getTime();

    const fOrders = orders.filter((o) => {
      const orderDate = o.pickupDate ? new Date(o.pickupDate).getTime() : new Date(o.createdAt).getTime();
      return orderDate >= startMs && orderDate <= endMs;
    });

    const fPayments = payments.filter((p) => {
      const pDate = new Date(p.created_at).getTime();
      return pDate >= startMs && pDate <= endMs;
    });

    return {
      filteredOrders: fOrders,
      filteredPayments: fPayments,
      periodLabel: label,
      rangeStartStr: start.toISOString().split('T')[0],
      rangeEndStr: end.toISOString().split('T')[0],
    };
  }, [orders, payments, dateFilter, customStart, customEnd]);

  // =========================================================================
  // 1. Business Overview Metrics (Strictly Real Data)
  // =========================================================================
  const metrics = useMemo(() => {
    const totalBookings = filteredOrders.length;
    const completedOrders = filteredOrders.filter((o) => o.status === 'Delivered').length;
    const cancelledOrders = filteredOrders.filter((o) => o.status === 'Cancelled').length;
    const pendingOrders = filteredOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

    // Verified payments only
    const verifiedPayments = filteredPayments.filter((p) => p.payment_status === 'Paid');
    const totalPaymentsReceivedPkr = verifiedPayments.reduce(
      (sum, p) => sum + (p.payment_amount != null ? p.payment_amount : 0),
      0
    );

    // Total Registered Customers
    const totalCustomersCount = customers.length > 0 ? customers.length : new Set(orders.map((o) => o.customerPhone || o.customerName)).size;

    return {
      totalBookings,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalCustomersCount,
      totalPaymentsReceivedPkr,
      verifiedPaymentsCount: verifiedPayments.length,
    };
  }, [filteredOrders, filteredPayments, customers, orders]);

  // =========================================================================
  // 2. Booking Analytics: Trends (Daily, Weekly, Monthly)
  // =========================================================================
  const trendData = useMemo(() => {
    if (trendInterval === 'daily') {
      // 7 days daily intervals
      const days: { label: string; dateStr: string; count: number }[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric' });

        const count = filteredOrders.filter((o) => {
          const orderDate = o.pickupDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
          return orderDate === isoDate;
        }).length;

        days.push({ label: dayLabel, dateStr: isoDate, count });
      }
      return days;
    } else if (trendInterval === 'weekly') {
      // 4 rolling weeks
      const weeks: { label: string; dateStr: string; count: number }[] = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
        const label = `${weekStart.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-PK', { day: 'numeric' })}`;

        const count = filteredOrders.filter((o) => {
          const oMs = new Date(o.pickupDate || o.createdAt).getTime();
          return oMs >= weekStart.getTime() && oMs <= weekEnd.getTime();
        }).length;

        weeks.push({ label, dateStr: weekStart.toISOString().split('T')[0], count });
      }
      return weeks;
    } else {
      // Monthly: Last 4 months
      const months: { label: string; dateStr: string; count: number }[] = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });

        const count = filteredOrders.filter((o) => {
          const rawDate = o.pickupDate || o.createdAt || '';
          return rawDate.startsWith(monthKey);
        }).length;

        months.push({ label: monthLabel, dateStr: monthKey, count });
      }
      return months;
    }
  }, [filteredOrders, trendInterval]);

  const maxTrendCount = useMemo(() => {
    return Math.max(1, ...trendData.map((d) => d.count));
  }, [trendData]);

  // =========================================================================
  // 3. Booking Status Distribution & Completed vs Cancelled
  // =========================================================================
  const statusDistribution = useMemo(() => {
    const total = filteredOrders.length;
    if (total === 0) return [];

    const categories = [
      {
        status: 'Request Received',
        label: 'Request Received',
        color: 'bg-amber-400',
        textColor: 'text-amber-800',
        count: filteredOrders.filter((o) =>
          ['Request Received', 'Booking Request Received', 'pending_pickup'].includes(o.status)
        ).length,
      },
      {
        status: 'Confirmed',
        label: 'Confirmed',
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        count: filteredOrders.filter((o) => ['Confirmed', 'Booking Confirmed'].includes(o.status)).length,
      },
      {
        status: 'Picked Up',
        label: 'Picked Up',
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        count: filteredOrders.filter((o) => ['Picked Up', 'Clothes Picked Up', 'picked_up'].includes(o.status)).length,
      },
      {
        status: 'Washing & Ironing',
        label: 'Washing & Ironing',
        color: 'bg-aqua-500',
        textColor: 'text-aqua-900',
        count: filteredOrders.filter((o) =>
          ['Washing & Ironing', 'processing', 'ironing'].includes(o.status)
        ).length,
      },
      {
        status: 'Ready for Delivery',
        label: 'Ready for Delivery',
        color: 'bg-teal-500',
        textColor: 'text-teal-800',
        count: filteredOrders.filter((o) =>
          ['Ready for Delivery', 'ready_for_delivery', 'out_for_delivery'].includes(o.status)
        ).length,
      },
      {
        status: 'Delivered',
        label: 'Delivered',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-800',
        count: filteredOrders.filter((o) => ['Delivered', 'delivered'].includes(o.status)).length,
      },
      {
        status: 'Cancelled',
        label: 'Cancelled',
        color: 'bg-rose-400',
        textColor: 'text-rose-800',
        count: filteredOrders.filter((o) => ['Cancelled', 'cancelled'].includes(o.status)).length,
      },
    ];

    return categories
      .filter((c) => c.count > 0)
      .map((c) => ({
        ...c,
        percentage: Math.round((c.count / total) * 100),
      }));
  }, [filteredOrders]);

  const completionVsCancelled = useMemo(() => {
    const total = filteredOrders.length;
    if (total === 0) {
      return { completionRate: 0, cancellationRate: 0, pendingRate: 0 };
    }
    const completed = filteredOrders.filter((o) => o.status === 'Delivered').length;
    const cancelled = filteredOrders.filter((o) => o.status === 'Cancelled').length;
    const pending = total - completed - cancelled;

    return {
      completionRate: Math.round((completed / total) * 100),
      cancellationRate: Math.round((cancelled / total) * 100),
      pendingRate: Math.round((pending / total) * 100),
    };
  }, [filteredOrders]);

  // =========================================================================
  // 4. Service Analytics (Most Requested Services & Package Usage)
  // =========================================================================
  const serviceAnalytics = useMemo(() => {
    const total = filteredOrders.length;
    if (total === 0) return { servicesList: [], packageUsageCount: 0, topService: 'None' };

    const map = new Map<string, number>();
    let packageUsageCount = 0;

    filteredOrders.forEach((o) => {
      const title = o.items[0]?.serviceTitle || 'Standard Laundry';
      map.set(title, (map.get(title) || 0) + 1);

      if (
        title.toLowerCase().includes('package') ||
        (o.specialInstructions && o.specialInstructions.toLowerCase().includes('package'))
      ) {
        packageUsageCount++;
      }
    });

    const servicesList = Array.from(map.entries())
      .map(([serviceTitle, count]) => ({
        serviceTitle,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      servicesList,
      packageUsageCount,
      topService: servicesList[0]?.serviceTitle || 'Standard Laundry',
    };
  }, [filteredOrders]);

  // =========================================================================
  // 5. Payment Analytics (Verified, Pending, Failed & Payment Methods)
  // =========================================================================
  const paymentAnalytics = useMemo(() => {
    const total = filteredPayments.length;
    const paidList = filteredPayments.filter((p) => p.payment_status === 'Paid');
    const awaitingList = filteredPayments.filter((p) => p.payment_status === 'Awaiting Verification');
    const pendingList = filteredPayments.filter((p) => p.payment_status === 'Pending');
    const failedList = filteredPayments.filter((p) => p.payment_status === 'Failed' || p.payment_status === 'Refunded');

    const totalPaidPkr = paidList.reduce((sum, p) => sum + (p.payment_amount || 0), 0);
    const totalPendingPkr = awaitingList.reduce((sum, p) => sum + (p.payment_amount || 0), 0);

    // Payment methods breakdown
    const methodsMap = new Map<string, number>();
    filteredPayments.forEach((p) => {
      const method = p.payment_method || 'Cash on Delivery';
      methodsMap.set(method, (methodsMap.get(method) || 0) + 1);
    });

    const methodsBreakdown = Array.from(methodsMap.entries()).map(([method, count]) => ({
      method,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    return {
      total,
      paidCount: paidList.length,
      totalPaidPkr,
      awaitingCount: awaitingList.length,
      totalPendingPkr,
      pendingCount: pendingList.length,
      failedCount: failedList.length,
      methodsBreakdown,
    };
  }, [filteredPayments]);

  // =========================================================================
  // Export Action Handlers
  // =========================================================================
  const handleExportBookings = () => {
    const filename = `pickupwash-bookings-${rangeStartStr}_to_${rangeEndStr}.csv`;
    exportBookingsToCsv(filteredOrders, filename);
    setExportNotice(`Exported ${filteredOrders.length} booking records to ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPayments = () => {
    const filename = `pickupwash-payments-${rangeStartStr}_to_${rangeEndStr}.csv`;
    exportPaymentsToCsv(filteredPayments, orders, filename);
    setExportNotice(`Exported ${filteredPayments.length} payment records to ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportExecutiveSummary = () => {
    const filename = `pickupwash-summary-${rangeStartStr}_to_${rangeEndStr}.csv`;
    const summaryData: ExecutiveSummaryData = {
      periodLabel,
      startDate: rangeStartStr,
      endDate: rangeEndStr,
      totalBookings: metrics.totalBookings,
      completedBookings: metrics.completedOrders,
      pendingBookings: metrics.pendingOrders,
      cancelledBookings: metrics.cancelledOrders,
      completionRate: `${completionVsCancelled.completionRate}%`,
      totalRevenuePkr: metrics.totalPaymentsReceivedPkr,
      pendingRevenuePkr: paymentAnalytics.totalPendingPkr,
      verifiedPaymentsCount: metrics.verifiedPaymentsCount,
      pendingPaymentsCount: paymentAnalytics.awaitingCount,
      topService: serviceAnalytics.topService,
      topArea: filteredOrders[0]?.area || 'Kasur City',
    };
    exportExecutiveSummaryToCsv(summaryData, filename);
    setExportNotice(`Executive summary downloaded as ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* =======================================================================
          TOP BAR: DATE RANGE CONTROLS & CSV EXPORT ACTIONS
         ======================================================================= */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
                Reports & Business Analytics
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Active reporting window: <strong className="text-darkNavy">{periodLabel}</strong> ({rangeStartStr} to {rangeEndStr})
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportBookings}
              className="gap-1.5 text-xs font-semibold shadow-xs"
              leftIcon={<Download className="w-3.5 h-3.5 text-navy-600" />}
            >
              Export Bookings (CSV)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportPayments}
              className="gap-1.5 text-xs font-semibold shadow-xs"
              leftIcon={<Download className="w-3.5 h-3.5 text-navy-600" />}
            >
              Export Payments (CSV)
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleExportExecutiveSummary}
              className="gap-1.5 text-xs font-bold shadow-soft bg-navy-500 text-white"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Summary Report
            </Button>
          </div>
        </div>

        {/* Date Filter Quick Pills & Custom Picker */}
        <div className="mt-5 pt-4 border-t border-ice-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-ice-50 p-1.5 rounded-2xl">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'custom', label: 'Custom Range' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setDateFilter(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateFilter === btn.id
                    ? 'bg-navy-500 text-white shadow-soft'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Inputs */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 text-xs bg-white"
              />
              <span className="text-navy-400 font-semibold">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 text-xs bg-white"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Export Feedback Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-navy-400 hover:text-navy-700"
          >
            ×
          </button>
        </div>
      )}

      {/* =======================================================================
          1. BUSINESS OVERVIEW STATISTIC CARDS
         ======================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Bookings */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500">Total Bookings</span>
            <ShoppingBag className="w-4 h-4 text-aqua-600" />
          </div>
          <p className="font-poppins font-extrabold text-2xl text-darkNavy">{metrics.totalBookings}</p>
          <span className="text-[10px] text-navy-400 block">Orders scheduled</span>
        </Card>

        {/* Completed Orders */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-poppins font-extrabold text-2xl text-emerald-800">{metrics.completedOrders}</p>
          <span className="text-[10px] text-navy-400 block">Safely delivered</span>
        </Card>

        {/* Pending Orders */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">In Pipeline</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-poppins font-extrabold text-2xl text-amber-800">{metrics.pendingOrders}</p>
          <span className="text-[10px] text-navy-400 block">Active laundry</span>
        </Card>

        {/* Cancelled Orders */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-poppins font-extrabold text-2xl text-rose-800">{metrics.cancelledOrders}</p>
          <span className="text-[10px] text-navy-400 block">With audit reasons</span>
        </Card>

        {/* Registered Customers */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-poppins font-extrabold text-2xl text-blue-900">{metrics.totalCustomersCount}</p>
          <span className="text-[10px] text-navy-400 block">Registered in Kasur</span>
        </Card>

        {/* Total Payments Received (Strictly Verified Paid only) */}
        <Card className="p-4 border-ice-200 shadow-card space-y-1 bg-gradient-to-br from-white to-ice-50">
          <div className="flex items-center justify-between text-navy-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-darkNavy">Verified Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-poppins font-extrabold text-xl text-darkNavy">
            PKR {metrics.totalPaymentsReceivedPkr.toLocaleString()}
          </p>
          <span className="text-[9px] text-emerald-700 font-semibold block">
            {metrics.verifiedPaymentsCount} verified payments
          </span>
        </Card>
      </div>

      {/* =======================================================================
          2. BOOKING ANALYTICS: TRENDS & STATUS DISTRIBUTION
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <Card className="lg:col-span-8 p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aqua-600" />
                <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                  Booking Volume Trends ({trendInterval.toUpperCase()})
                </h3>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Aggregated booking demand recorded in database
              </p>
            </div>

            <div className="flex items-center gap-1 bg-ice-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTrendInterval('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendInterval === 'daily'
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setTrendInterval('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendInterval === 'weekly'
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setTrendInterval('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendInterval === 'monthly'
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center bg-ice-50/50 rounded-2xl border border-dashed border-ice-200 text-center p-6 space-y-2">
              <Calendar className="w-8 h-8 text-navy-300" />
              <p className="text-xs font-bold text-darkNavy">No bookings in selected period</p>
              <p className="text-[11px] text-navy-400 max-w-xs">
                Adjust the date filter above to view historical laundry activity.
              </p>
            </div>
          ) : (
            <div className="h-60 pt-4 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {trendData.map((bar, idx) => {
                const heightPercent = Math.max(8, Math.round((bar.count / maxTrendCount) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-bold text-navy-700 opacity-90 group-hover:scale-110 transition-transform">
                      {bar.count}
                    </span>
                    <div
                      className="w-full max-w-[42px] bg-gradient-to-t from-navy-600 to-aqua-400 rounded-t-xl transition-all duration-300 group-hover:from-navy-700 group-hover:to-aqua-300 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                      title={`${bar.label}: ${bar.count} booking(s)`}
                    />
                    <span className="text-[10px] text-navy-500 font-semibold truncate max-w-[65px] text-center">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Completed vs Cancelled Ratio Widget */}
        <Card className="lg:col-span-4 p-5 sm:p-6 border-ice-200 shadow-card flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                Order Fulfillment Health
              </h3>
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">
              Completed deliveries versus cancellations in this period
            </p>
          </div>

          <div className="space-y-4">
            {/* Visual ratio bar */}
            <div className="h-4 w-full bg-ice-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${completionVsCancelled.completionRate}%` }}
                title={`Completed: ${completionVsCancelled.completionRate}%`}
              />
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${completionVsCancelled.pendingRate}%` }}
                title={`In-Flight: ${completionVsCancelled.pendingRate}%`}
              />
              <div
                className="bg-rose-400 transition-all duration-500"
                style={{ width: `${completionVsCancelled.cancellationRate}%` }}
                title={`Cancelled: ${completionVsCancelled.cancellationRate}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Completed</span>
                <span className="font-poppins font-bold text-sm text-emerald-900">
                  {completionVsCancelled.completionRate}%
                </span>
                <span className="text-[9px] text-emerald-600 block">({metrics.completedOrders} orders)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">In-Flight</span>
                <span className="font-poppins font-bold text-sm text-amber-900">
                  {completionVsCancelled.pendingRate}%
                </span>
                <span className="text-[9px] text-amber-600 block">({metrics.pendingOrders} orders)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Cancelled</span>
                <span className="font-poppins font-bold text-sm text-rose-900">
                  {completionVsCancelled.cancellationRate}%
                </span>
                <span className="text-[9px] text-rose-600 block">({metrics.cancelledOrders} orders)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ice-50 border border-ice-200 text-xs text-navy-600">
            <span className="font-semibold text-darkNavy block">Reliability Insight:</span>
            {completionVsCancelled.completionRate >= 50
              ? 'Healthy fulfillment rate across Kasur doorstep dispatches.'
              : 'Review operational queues to accelerate in-flight orders toward delivery.'}
          </div>
        </Card>
      </div>

      {/* =======================================================================
          3. SERVICE ANALYTICS & STATUS DISTRIBUTION
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested Services */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-aqua-600" />
                <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                  Laundry Service Demand
                </h3>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Breakdown of customer orders across offerings in Kasur
              </p>
            </div>
            {serviceAnalytics.packageUsageCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-ice-100 text-navy-700 border border-ice-200 flex items-center gap-1">
                <Layers className="w-3 h-3 text-aqua-600" />
                <span>{serviceAnalytics.packageUsageCount} Package Orders</span>
              </span>
            )}
          </div>

          {serviceAnalytics.servicesList.length === 0 ? (
            <div className="py-8 text-center text-navy-400 text-xs">
              No service demand records found for this period.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceAnalytics.servicesList.map((srv, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-darkNavy">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 text-[11px] text-navy-400 font-mono">#{idx + 1}</span>
                      <span>{srv.serviceTitle}</span>
                    </span>
                    <span className="font-mono text-navy-600">
                      {srv.count} orders ({srv.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ice-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-navy-500 to-aqua-500 rounded-full transition-all duration-300"
                      style={{ width: `${srv.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-aqua-600" />
              <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                Lifecycle Stage Distribution
              </h3>
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">
              Current status allocation across all active booking submissions
            </p>
          </div>

          {statusDistribution.length === 0 ? (
            <div className="py-8 text-center text-navy-400 text-xs">
              No active bookings found for this period.
            </div>
          ) : (
            <div className="space-y-3">
              {statusDistribution.map((st, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-darkNavy flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                      <span>{st.label}</span>
                    </span>
                    <span className="font-mono text-navy-600">
                      {st.count} ({st.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-ice-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-300`}
                      style={{ width: `${st.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* =======================================================================
          4. PAYMENT & REVENUE ANALYTICS (Decoupled Financial Tracking)
         ======================================================================= */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-poppins font-bold text-base text-darkNavy">
                Payment Verification & Revenue Analytics
              </h3>
            </div>
            <p className="text-xs text-navy-500 mt-0.5">
              Financial reconciliation based strictly on verified payment records
            </p>
          </div>

          {/* Decoupled Callout Pill */}
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Strictly Audited • No Unverified Revenue
          </span>
        </div>

        {/* 4 Financial Highlight Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Verified Revenue
            </span>
            <p className="font-poppins font-extrabold text-xl sm:text-2xl text-emerald-900">
              PKR {paymentAnalytics.totalPaidPkr.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-700 font-medium block">
              {paymentAnalytics.paidCount} verified transaction(s)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Awaiting Verification
            </span>
            <p className="font-poppins font-extrabold text-xl sm:text-2xl text-amber-900">
              PKR {paymentAnalytics.totalPendingPkr.toLocaleString()}
            </p>
            <span className="text-[11px] text-amber-700 font-medium block">
              {paymentAnalytics.awaitingCount} submitted customer TID(s)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-600 block">
              Pending Cash on Delivery
            </span>
            <p className="font-poppins font-extrabold text-xl sm:text-2xl text-darkNavy">
              {paymentAnalytics.pendingCount}
            </p>
            <span className="text-[11px] text-navy-500 block">
              Collected upon safe doorstep delivery
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
              Failed / Refunded
            </span>
            <p className="font-poppins font-extrabold text-xl sm:text-2xl text-rose-900">
              {paymentAnalytics.failedCount}
            </p>
            <span className="text-[11px] text-rose-700 block">
              Voided or customer cancelled
            </span>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="pt-2 border-t border-ice-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block">
            Payment Channels Utilized
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentAnalytics.methodsBreakdown.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-ice-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-darkNavy block truncate">{m.method}</span>
                <div className="flex items-center justify-between text-xs text-navy-600">
                  <span className="font-mono">{m.count} txns</span>
                  <span className="font-bold text-aqua-700">{m.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
