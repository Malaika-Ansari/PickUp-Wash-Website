import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  Search, 
  Package, 
  Truck, 
  Sparkles, 
  Flame, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code') || '';

  const [trackingNumber, setTrackingNumber] = useState(queryCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (queryCode) {
      handleSearch(queryCode);
    }
  }, [queryCode]);

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || trackingNumber).trim();
    if (!code) return;

    setIsSearching(true);
    setSearched(true);
    try {
      const found = await orderService.getOrderByTracking(code);
      setOrder(found);
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const steps = [
    { key: 'pending_pickup', label: 'Pickup Scheduled', icon: Calendar },
    { key: 'picked_up', label: 'Collected from Doorstep', icon: Truck },
    { key: 'processing', label: 'Hygienic Wash Cycle', icon: Sparkles },
    { key: 'ironing', label: 'Steam Pressing & QC', icon: Flame },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const currentMeta = ORDER_STATUS_LABELS[order.status];
    return currentMeta ? currentMeta.step : 1;
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent">Live Laundry Tracking</Badge>
          <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-navy-500 tracking-tight">
            Track Your Pickup & Delivery
          </h1>
          <p className="text-xs sm:text-sm text-navy-600/80">
            Enter your tracking code (e.g. <span className="font-mono font-medium text-navy-900">PW-KSR-XXXXX</span>) to view real-time status in Kasur.
          </p>
        </div>

        {/* Search Input Box */}
        <Card className="p-4 sm:p-6 border-ice-200 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-navy-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Enter tracking number (e.g. PW-KSR-12345)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 uppercase font-mono bg-ice-50/40"
              />
            </div>
            <Button type="submit" isLoading={isSearching} className="font-semibold">
              Track Order
            </Button>
          </form>
        </Card>

        {/* Search Results Display */}
        {order ? (
          <Card className="p-6 sm:p-8 border-ice-200 space-y-8 animate-fadeIn">
            {/* Top Order Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ice-200">
              <div>
                <span className="text-xs text-navy-400 uppercase font-semibold">Tracking Number</span>
                <h2 className="font-mono font-extrabold text-2xl text-navy-500">{order.trackingNumber}</h2>
                <div className="flex items-center gap-2 text-xs text-navy-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-aqua-500" />
                  <span>{order.area}, Kasur</span>
                </div>
              </div>

              <div>
                <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  ORDER_STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {ORDER_STATUS_LABELS[order.status]?.label || order.status}
                </span>
              </div>
            </div>

            {/* Interactive Timeline Progress */}
            <div>
              <h3 className="font-poppins font-semibold text-sm text-navy-500 mb-6 uppercase tracking-wider">
                Order Lifecycle
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {steps.map((st, idx) => {
                  const Icon = st.icon;
                  const stepNum = idx + 1;
                  const activeStep = getCurrentStepIndex();
                  const isComplete = activeStep > stepNum;
                  const isCurrent = activeStep === stepNum;

                  return (
                    <div
                      key={st.key}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-aqua-400 bg-aqua-50/60 ring-2 ring-aqua-400/40'
                          : isComplete
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-ice-200 bg-ice-50/30 opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                        isCurrent
                          ? 'bg-aqua-400 text-white'
                          : isComplete
                          ? 'bg-emerald-500 text-white'
                          : 'bg-ice-200 text-navy-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-navy-900 block leading-tight">
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Specification Details */}
            <div className="p-5 rounded-2xl bg-ice-50 border border-ice-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-navy-400 block font-medium">Customer Name</span>
                <span className="font-semibold text-navy-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-navy-400 block font-medium">Pickup Date & Slot</span>
                <span className="font-semibold text-navy-900">{order.pickupDate} ({order.pickupTimeSlot})</span>
              </div>
              <div>
                <span className="text-navy-400 block font-medium">Payment Mode</span>
                <span className="font-semibold text-navy-900 capitalize">
                  {order.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </Card>
        ) : searched && !isSearching ? (
          <Card className="text-center p-8 sm:p-12 border-ice-200 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-bold text-lg text-navy-500">
              No Order Found for "{trackingNumber}"
            </h3>
            <p className="text-xs text-navy-600/80 leading-relaxed">
              Please double check the code printed on your receipt or SMS confirmation. If you just placed an order, it will appear momentarily.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

