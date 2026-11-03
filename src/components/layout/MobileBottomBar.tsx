import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, CalendarCheck, MessageSquare, Search } from 'lucide-react';
import { BUSINESS_INFO } from '@/utils/constants';

export const MobileBottomBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-ice-200 shadow-2xl px-3 py-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Call Support */}
        <a
          href={`tel:${BUSINESS_INFO.phone}`}
          className="flex flex-col items-center justify-center min-h-[48px] rounded-xl bg-ice-50 text-darkNavy hover:bg-ice-100 transition-colors py-1.5"
          aria-label="Call Kasur Helpline"
        >
          <Phone className="w-4 h-4 text-navy-500 mb-0.5" />
          <span className="text-[11px] font-semibold">Call Hotline</span>
        </a>

        {/* Track Order */}
        <Link
          to="/track"
          className="flex flex-col items-center justify-center min-h-[48px] rounded-xl bg-ice-50 text-darkNavy hover:bg-ice-100 transition-colors py-1.5"
          aria-label="Track Pickup Wash Order"
        >
          <Search className="w-4 h-4 text-aqua-600 mb-0.5" />
          <span className="text-[11px] font-semibold">Track Order</span>
        </Link>

        {/* Book Pickup Action */}
        <Link
          to="/book"
          className="flex flex-col items-center justify-center min-h-[48px] rounded-xl bg-navy-500 text-white shadow-sm shadow-navy-500/30 hover:bg-navy-600 transition-colors py-1.5"
          aria-label="Schedule Laundry Pickup"
        >
          <CalendarCheck className="w-4 h-4 text-aqua-300 mb-0.5" />
          <span className="text-[11px] font-bold">Book Pickup</span>
        </Link>
      </div>
    </div>
  );
};

