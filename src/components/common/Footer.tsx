import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-700 text-white pt-16 pb-8 border-t border-navy-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-600/60">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-500 flex items-center justify-center border border-aqua-400/40">
                <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="32" stroke="#65B9C5" strokeWidth="8" strokeDasharray="140 30" strokeLinecap="round" />
                  <path d="M50 32C46 38 40 45 40 52C40 57.5 44.5 62 50 62C55.5 62 60 57.5 60 52C60 45 54 38 50 32Z" fill="#65B9C5"/>
                </svg>
              </div>
              <span className="font-poppins font-bold text-xl tracking-tight">
                Pickup<span className="text-aqua-400">Wash</span>
              </span>
            </div>
            <p className="text-sm text-ice-200/80 leading-relaxed">
              Kasur’s premier doorstep laundry solution. We collect your laundry, wash with fabric-safe detergents, precision steam press, and deliver back clean and crisp.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-aqua-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Hygienic Washing • 100% Satisfaction Guarantee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-ice-200/80">
              <li>
                <Link to="/services" className="hover:text-aqua-300 transition-colors">Our Services & Rates</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-aqua-300 transition-colors">Pricing & Plans</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-aqua-300 transition-colors">Schedule a Pickup</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-aqua-300 transition-colors">Track Your Order Status</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-aqua-300 transition-colors">About Pickup Wash</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-aqua-300 transition-colors">Customer Support</Link>
              </li>
            </ul>
          </div>

          {/* Kasur Service Areas */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-4 tracking-wide">
              Service Areas in Kasur
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-ice-200/70">
              {KASUR_SERVICE_AREAS.slice(0, 8).map((area) => (
                <span key={area} className="hover:text-white transition-colors flex items-center gap-1">
                  • {area}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-aqua-300/90">
              Expanding rapidly across all Kasur union councils.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-poppins font-semibold text-white text-base mb-4 tracking-wide">
              Contact & Hours
            </h4>
            <ul className="space-y-3 text-xs text-ice-200/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-aqua-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.location}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-aqua-400 shrink-0" />
                <span>{BUSINESS_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-aqua-400 shrink-0" />
                <span>{BUSINESS_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-aqua-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ice-200/60 gap-4">
          <p>© {new Date().getFullYear()} Pickup Wash (Kasur). All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for Kasur City</span>
            <Heart className="w-3.5 h-3.5 text-aqua-400 fill-aqua-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};

