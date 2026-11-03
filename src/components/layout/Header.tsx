import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  MapPin, 
  Phone, 
  User, 
  Shield, 
  CalendarCheck, 
  Search, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_INFO } from '@/utils/constants';
import { NavLink } from '@/components/ui';
import { NavigationDrawer } from './NavigationDrawer';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Track Order', path: '/track' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Design System', path: '/design-system', badge: 'UI Kit' },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Notification / Hotline Strip */}
      <div className="bg-navy-500 text-white text-xs py-1.5 px-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400"></span>
            </span>
            <span className="text-[11px] sm:text-xs">
              Kasur's #1 Doorstep Laundry • Free Pickup & Delivery on orders over PKR 500
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-ice-200 text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-aqua-400" />
              Kasur City Coverage
            </span>
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-aqua-400" />
              {BUSINESS_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-nav" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group select-none">
              <div className="w-11 h-11 rounded-2xl bg-navy-500 flex items-center justify-center shadow-md shadow-navy-500/20 group-hover:bg-navy-600 transition-colors">
                <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none">
                  <circle
                    cx="50"
                    cy="50"
                    r="32"
                    stroke="#65B9C5"
                    strokeWidth="7"
                    strokeDasharray="140 30"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50 32C46 38 40 45 40 52C40 57.5 44.5 62 50 62C55.5 62 60 57.5 60 52C60 45 54 38 50 32Z"
                    fill="#65B9C5"
                  />
                  <circle cx="53" cy="48" r="3" fill="#FFFFFF" opacity="0.8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-poppins font-bold text-xl text-navy-500 tracking-tight">Pickup</span>
                  <span className="font-poppins font-bold text-xl text-aqua-400 tracking-tight">Wash</span>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-navy-400">Kasur City</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} badge={link.badge}>
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/track"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-darkNavy hover:text-navy-500 rounded-lg hover:bg-ice-200/40"
              >
                <Search className="w-3.5 h-3.5 text-aqua-500" />
                Track
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-ice-100 text-darkNavy rounded-xl border border-ice-200 hover:bg-ice-200 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-navy-500" />
                    Account
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-navy-50 text-navy-600 rounded-xl border border-navy-200/70 hover:bg-navy-100"
                    >
                      <Shield className="w-3.5 h-3.5 text-navy-500" />
                      Admin
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={logout}
                    className="text-xs text-navy-400 hover:text-navy-600 hover:underline cursor-pointer pl-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-navy-600 hover:text-navy-800 rounded-xl hover:bg-ice-200/40 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-500 text-white font-medium text-sm hover:bg-navy-600 transition-all shadow-sm shadow-navy-500/20 active:scale-95"
              >
                <CalendarCheck className="w-4 h-4 text-aqua-300" />
                Book Pickup
              </Link>
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/book"
                className="sm:hidden px-3.5 py-2 rounded-xl bg-navy-500 text-white font-medium text-xs hover:bg-navy-600"
              >
                Book
              </Link>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-darkNavy hover:text-navy-900 hover:bg-ice-200/60 focus:outline-none focus:ring-2 focus:ring-aqua-400"
                aria-label="Open mobile navigation drawer"
                aria-expanded={isDrawerOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-over Mobile Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </header>
  );
};
