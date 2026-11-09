import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Layers, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Shirt,
  ShoppingBag
} from 'lucide-react';
import { Order, PaymentRecord } from '@/types';
import { Card } from '@/components/common/Card';

interface AdminAnalyticsChartsProps {
  orders: Order[];
  payments: PaymentRecord[];
}

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({ orders, payments }) => {
  const [trendView, setTrendView] = useState<'daily' | 'monthly'>('daily');

  // =========================================================================
  // 1. Daily & Monthly Booking Trends Calculation (Pure real data)
  // =========================================================================
  const trendData = useMemo(() => {
    if (trendView === 'daily') {
      // Last 7 days
      const days: { label: string; dateStr: string; count: number }[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric' });

        const count = orders.filter((o) => {
          const orderDate = o.pickupDate || (o.createdAt ? o.createdAt.split('T')[0] : '');
          return orderDate === isoDate;
        }).length;

        days.push({ label: dayLabel, dateStr: isoDate, count });
      }
      return days;
    } else {
      // Last 4 months
      const months: { label: string; dateStr: string; count: number }[] = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });

        const count = orders.filter((o) => {
          const rawDate = o.pickupDate || o.createdAt || '';
          return rawDate.startsWith(monthKey);
        }).length;

        months.push({ label: monthLabel, dateStr: monthKey, count });
      }
      return months;
    }
  }, [orders, trendView]);

  const maxTrendCount = useMemo(() => {
    return Math.max(1, ...trendData.map((d) => d.count));
  }, [trendData]);

  const hasTrendData = trendData.some((d) => d.count > 0);

  // =========================================================================
  // 2. Booking Status Distribution Calculation
  // =========================================================================
  const statusDistribution = useMemo(() => {
    const total = orders.length;
    if (total === 0) return [];

    const categories = [
      {
        status: 'Request Received',
        label: 'Request Received',
        color: 'bg-amber-400',
        textColor: 'text-amber-800',
        count: orders.filter((o) =>
          ['Request Received', 'Booking Request Received', 'pending_pickup'].includes(o.status)
        ).length,
      },
      {
        status: 'Confirmed',
        label: 'Confirmed',
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        count: orders.filter((o) => ['Confirmed', 'Booking Confirmed'].includes(o.status)).length,
      },
      {
        status: 'Picked Up',
        label: 'Picked Up',
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        count: orders.filter((o) => ['Picked Up', 'Clothes Picked Up', 'picked_up'].includes(o.status)).length,
      },
      {
        status: 'Washing & Ironing',
        label: 'Washing & Ironing',
        color: 'bg-aqua-500',
        textColor: 'text-aqua-900',
        count: orders.filter((o) =>
          ['Washing & Ironing', 'processing', 'ironing'].includes(o.status)
        ).length,
      },
      {
        status: 'Ready for Delivery',
        label: 'Ready for Delivery',
        color: 'bg-teal-500',
        textColor: 'text-teal-800',
        count: orders.filter((o) =>
          ['Ready for Delivery', 'ready_for_delivery', 'out_for_delivery'].includes(o.status)
        ).length,
      },
      {
        status: 'Delivered',
        label: 'Delivered',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-800',
        count: orders.filter((o) => ['Delivered', 'delivered'].includes(o.status)).length,
      },
      {
        status: 'Cancelled',
        label: 'Cancelled',
        color: 'bg-rose-400',
        textColor: 'text-rose-800',
        count: orders.filter((o) => ['Cancelled', 'cancelled'].includes(o.status)).length,
      },
    ];

    return categories
      .filter((c) => c.count > 0)
      .map((c) => ({
        ...c,
        percentage: Math.round((c.count / total) * 100),
      }));
  }, [orders]);

  // =========================================================================
  // 3. Popular Laundry Services Ranking
  // =========================================================================
  const popularServices = useMemo(() => {
    const total = orders.length;
    if (total === 0) return [];

    const map = new Map<string, number>();
    orders.forEach((o) => {
      const title = o.items[0]?.serviceTitle || 'Standard Laundry';
      map.set(title, (map.get(title) || 0) + 1);
    });

    const list = Array.from(map.entries()).map(([serviceTitle, count]) => ({
      serviceTitle,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    return list.sort((a, b) => b.count - a.count);
  }, [orders]);

  // =========================================================================
  // 4. Payment Status Breakdown
  // =========================================================================
  const paymentBreakdown = useMemo(() => {
    const total = payments.length;
    const paidList = payments.filter((p) => p.payment_status === 'Paid');
    const awaitingList = payments.filter((p) => p.payment_status === 'Awaiting Verification');
    const pendingList = payments.filter((p) => p.payment_status === 'Pending');
    const failedList = payments.filter((p) => p.payment_status === 'Failed' || p.payment_status === 'Refunded');

    const totalPaidPkr = paidList.reduce((sum, p) => sum + (p.payment_amount || 0), 0);

    return {
      total,
      paidCount: paidList.length,
      totalPaidPkr,
      awaitingCount: awaitingList.length,
      pendingCount: pendingList.length,
      failedCount: failedList.length,
    };
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* =======================================================================
          TOP ROW: TRENDS & STATUS DISTRIBUTION
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: BOOKING TRENDS */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aqua-600" />
                <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                  Booking Volume Trends
                </h3>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Real-time booking orders placed across Kasur City
              </p>
            </div>

            <div className="flex items-center gap-1 bg-ice-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTrendView('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendView === 'daily'
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                7-Day Daily
              </button>
              <button
                type="button"
                onClick={() => setTrendView('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendView === 'monthly'
                    ? 'bg-navy-500 text-white shadow-xs'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {!hasTrendData ? (
            <div className="h-52 flex flex-col items-center justify-center bg-ice-50/50 rounded-2xl border border-dashed border-ice-200 text-center p-6 space-y-2">
              <Calendar className="w-8 h-8 text-navy-300" />
              <p className="text-xs font-bold text-darkNavy">No bookings in selected period</p>
              <p className="text-[11px] text-navy-400 max-w-xs">
                Booking trends will populate this chart in real-time as customers schedule doorstep laundry pickups.
              </p>
            </div>
          ) : (
            <div className="h-56 pt-4 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {trendData.map((bar, idx) => {
                const heightPercent = Math.max(8, Math.round((bar.count / maxTrendCount) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-bold text-navy-700 opacity-90 group-hover:scale-110 transition-transform">
                      {bar.count}
                    </span>
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-navy-600 to-aqua-400 rounded-t-xl transition-all duration-300 group-hover:from-navy-700 group-hover:to-aqua-300 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                      title={`${bar.label}: ${bar.count} booking(s)`}
                    />
                    <span className="text-[10px] text-navy-500 font-semibold truncate max-w-[48px] text-center">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* CHART 2: BOOKING STATUS DISTRIBUTION */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-aqua-600" />
              <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                Booking Status Distribution
              </h3>
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">
              Breakdown of {orders.length} active and completed orders in Kasur
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center bg-ice-50/50 rounded-2xl border border-dashed border-ice-200 text-center p-6 space-y-2">
              <Layers className="w-8 h-8 text-navy-300" />
              <p className="text-xs font-bold text-darkNavy">No orders in database</p>
              <p className="text-[11px] text-navy-400 max-w-xs">
                Status percentages will calculate automatically once customer bookings are received.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Stacked Progress Bar */}
              <div className="w-full h-3 rounded-full bg-ice-100 overflow-hidden flex shadow-inner">
                {statusDistribution.map((st, i) => (
                  <div
                    key={i}
                    className={`${st.color} transition-all duration-300`}
                    style={{ width: `${st.percentage}%` }}
                    title={`${st.label}: ${st.count} (${st.percentage}%)`}
                  />
                ))}
              </div>

              {/* Status List */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {statusDistribution.map((st, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-ice-50/60 border border-ice-200/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.color} shrink-0`} />
                      <span className="font-medium text-darkNavy truncate text-[11px]">
                        {st.label}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-navy-800 shrink-0">
                      {st.count} <span className="text-[10px] text-navy-400">({st.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* =======================================================================
          BOTTOM ROW: POPULAR SERVICES & FINANCIAL BREAKDOWN
         ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: POPULAR LAUNDRY SERVICES */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-aqua-600" />
              <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                Popular Laundry Services
              </h3>
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">
              Service demand rankings based on real customer submissions
            </p>
          </div>

          {popularServices.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center bg-ice-50/50 rounded-2xl border border-dashed border-ice-200 text-center p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-navy-300" />
              <p className="text-xs font-bold text-darkNavy">No service records yet</p>
              <p className="text-[11px] text-navy-400 max-w-xs">
                Customer selections for Wash & Iron, Dry Cleaning, and Express Service will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {popularServices.map((srv, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-darkNavy flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-ice-200 text-navy-700 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{srv.serviceTitle}</span>
                    </span>
                    <span className="font-mono text-navy-600">
                      {srv.count} orders ({srv.percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-ice-100 overflow-hidden">
                    <div
                      className="h-full bg-aqua-500 rounded-full transition-all duration-500"
                      style={{ width: `${srv.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CHART 4: PAYMENT STATUS OVERVIEW */}
        <Card className="p-5 sm:p-6 border-ice-200 shadow-card space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-aqua-600" />
              <h3 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                Payment Status Overview
              </h3>
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">
              Reconciled payment transactions across Cash on Delivery, JazzCash & Easypaisa
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center bg-ice-50/50 rounded-2xl border border-dashed border-ice-200 text-center p-6 space-y-2">
              <CreditCard className="w-8 h-8 text-navy-300" />
              <p className="text-xs font-bold text-darkNavy">No payment records initialized</p>
              <p className="text-[11px] text-navy-400 max-w-xs">
                Customer transactions and collection records will display here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Paid Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider flex items-center justify-between">
                  <span>Verified Paid</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div className="font-poppins font-extrabold text-xl text-emerald-900">
                  {paymentBreakdown.paidCount}
                </div>
                <p className="text-[10px] font-bold text-emerald-700">
                  PKR {paymentBreakdown.totalPaidPkr.toLocaleString()} collected
                </p>
              </div>

              {/* Awaiting Review Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider flex items-center justify-between">
                  <span>Awaiting Review</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </span>
                <div className="font-poppins font-extrabold text-xl text-amber-900">
                  {paymentBreakdown.awaitingCount}
                </div>
                <p className="text-[10px] text-amber-700">Requires TID check</p>
              </div>

              {/* Pending Box */}
              <div className="p-3.5 rounded-2xl bg-ice-100/70 border border-ice-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-navy-700 tracking-wider flex items-center justify-between">
                  <span>Pending Collection</span>
                  <Clock className="w-3.5 h-3.5 text-navy-500" />
                </span>
                <div className="font-poppins font-extrabold text-xl text-navy-900">
                  {paymentBreakdown.pendingCount}
                </div>
                <p className="text-[10px] text-navy-500">Cash on delivery</p>
              </div>

              {/* Failed / Refunded Box */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider flex items-center justify-between">
                  <span>Failed / Refunded</span>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                </span>
                <div className="font-poppins font-extrabold text-xl text-rose-900">
                  {paymentBreakdown.failedCount}
                </div>
                <p className="text-[10px] text-rose-700">Disputed or canceled</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

