import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone, User, Shield, CalendarCheck, Search, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_INFO } from '@/utils/constants';
import { NavLink } from '@/components/ui';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

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
      <div className="bg-navy-500 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400"></span>
            </span>
            <span>Kasur's #1 Doorstep Laundry Service • Free Pickup & Delivery on orders over PKR 500</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ice-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-aqua-400" />
              Kasur City Coverage
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-aqua-400" />
              {BUSINESS_INFO.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-nav">
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
                <NavLink
                  key={link.path}
                  to={link.path}
                  badge={link.badge}
                >
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
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-navy-50 text-navy-600 rounded-xl border border-navy-200/70 hover:bg-navy-100"
                    >
                      <Shield className="w-3.5 h-3.5 text-navy-500" />
                      Admin
                    </Link>
                  )}
                  <div className="flex items-center gap-2 pl-2 border-l border-ice-300">
                    <span className="text-xs font-medium text-darkNavy max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-xs text-navy-400 hover:text-navy-600 hover:underline cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
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

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/book"
                className="sm:hidden px-3.5 py-2 rounded-xl bg-navy-500 text-white font-medium text-xs hover:bg-navy-600"
              >
                Book
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-darkNavy hover:text-navy-900 hover:bg-ice-200/60 focus:outline-none"
                aria-label="Toggle navigation"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-ice-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                isMobile
                badge={link.badge}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-ice-200 space-y-2">
              {user ? (
                <>
                  <div className="px-3.5 py-1 text-xs text-navy-400">
                    Signed in as <span className="font-semibold text-darkNavy">{user.email}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-3.5 py-2 rounded-xl text-sm font-semibold text-navy-600 bg-navy-50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-center text-sm font-semibold text-navy-600 bg-ice-100 hover:bg-ice-200"
                >
                  Customer Login / Register
                </Link>
              )}

              <Link
                to="/book"
                onClick={() => setIsOpen(false)}
                className="block px-3.5 py-3 rounded-xl text-center text-sm font-semibold text-white bg-navy-500 hover:bg-navy-600 shadow-md"
              >
                Schedule Doorstep Pickup Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
