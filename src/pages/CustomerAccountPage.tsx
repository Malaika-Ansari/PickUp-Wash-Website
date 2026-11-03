import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  CalendarCheck, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAuth } from '@/hooks/useAuth';

export const CustomerAccountPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ice-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600 block mb-1">
              Customer Dashboard
            </span>
            <h2 className="font-poppins font-bold text-2xl text-navy-500">
              Welcome, {user?.full_name || 'Customer'}!
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Manage your laundry pickups, track active wash cycles, and review receipts in Kasur.
            </p>
          </div>

          <Link to="/book">
            <Button size="md" variant="primary" className="gap-2 shadow-sm">
              <CalendarCheck className="w-4 h-4 text-aqua-300" />
              Schedule Pickup
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200">
            <span className="text-[11px] font-semibold text-navy-400 uppercase">Active Wash</span>
            <div className="font-poppins font-extrabold text-2xl text-navy-500 mt-0.5">1</div>
            <span className="text-[10px] text-aqua-700 font-medium">In steam press</span>
          </div>
          <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200">
            <span className="text-[11px] font-semibold text-navy-400 uppercase">Completed</span>
            <div className="font-poppins font-extrabold text-2xl text-navy-500 mt-0.5">3</div>
            <span className="text-[10px] text-emerald-700 font-medium">Delivered fresh</span>
          </div>
          <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200">
            <span className="text-[11px] font-semibold text-navy-400 uppercase">Saved Areas</span>
            <div className="font-poppins font-extrabold text-2xl text-navy-500 mt-0.5">Model Town</div>
            <span className="text-[10px] text-darkNavy/60">Primary address</span>
          </div>
          <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200">
            <span className="text-[11px] font-semibold text-navy-400 uppercase">Rewards</span>
            <div className="font-poppins font-extrabold text-2xl text-aqua-600 mt-0.5">Free Delivery</div>
            <span className="text-[10px] text-navy-600">On PKR 500+</span>
          </div>
        </div>
      </div>

      {/* Active Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ice-200">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">Active Pickup Order</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-extrabold text-lg sm:text-xl text-navy-500">PW-KSR-84920</span>
              <StatusBadge status="ironing" pulse />
            </div>
          </div>

          <Link to="/track?code=PW-KSR-84920">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              <Search className="w-3.5 h-3.5 text-aqua-600" />
              Live Order Pipeline
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-darkNavy/80">
          <div>
            <span className="text-navy-400 block font-medium">Service Type:</span>
            <span className="font-semibold text-darkNavy">Wash & Steam Iron (2 Suits)</span>
          </div>
          <div>
            <span className="text-navy-400 block font-medium">Doorstep Location:</span>
            <span className="font-semibold text-darkNavy">Model Town, Kasur</span>
          </div>
          <div>
            <span className="text-navy-400 block font-medium">Estimated Delivery:</span>
            <span className="font-semibold text-emerald-700">Tomorrow by 5:00 PM</span>
          </div>
        </div>
      </div>

      {/* Empty State Showcase */}
      <EmptyState
        title="No other pending laundry requests"
        description="Ready for another batch of clean, fresh clothes? Schedule a doorstep pickup anytime."
        actionText="Schedule New Pickup"
        onAction={() => window.location.href = '/book'}
        secondaryText="View Full Garment Rates"
        onSecondary={() => window.location.href = '/pricing'}
      />
    </div>
  );
};

