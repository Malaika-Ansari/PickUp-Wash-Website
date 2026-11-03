import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  MapPin, 
  Phone, 
  User, 
  CalendarCheck, 
  Search, 
  ShieldCheck
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_INFO } from '@/utils/constants';
import { NavigationDrawer } from './NavigationDrawer';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Scroll detection for sticky shadow enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop navigation links as required by the prompt
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavLinkClick = (path: string) => {
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (path.includes('#')) {
      return location.hash === `#${path.split('#')[1]}`;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-200">
      {/* Top Notification / Hotline Strip */}
      <div className="bg-navy-500 text-white text-xs py-1.5 px-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400"></span>
            </span>
            <span className="text-[11px] sm:text-xs">
              Kasur's #1 Doorstep Laundry Service • Free Pickup & Delivery on orders over PKR 500
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

      {/* Main Navigation Bar — Pure White (#FFFFFF) background with subtle shadow */}
      <nav
        className={cn(
          'bg-white border-b border-ice-200/90 transition-shadow duration-200',
          isScrolled ? 'shadow-md shadow-navy-950/5' : 'shadow-card'
        )}
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* 1. Professional Text Logo with Laundry Icon */}
            <Logo size="md" />

            {/* 2. Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => handleNavLinkClick(link.path)}
                    className={cn(
                      'relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                      active
                        ? 'text-navy-500 bg-ice-100 font-semibold'
                        : 'text-darkNavy/80 hover:text-navy-500 hover:bg-ice-50'
                    )}
                  >
                    <span>{link.name}</span>

                    {/* Active Aqua Indicator Underline / Dot */}
                    {active && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-aqua-400"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 3. Right Action Area: Track Order, Customer Account & Prominent "Book Now" Button */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Track Order Utility */}
              <Link
                to="/track"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-darkNavy/80 hover:text-navy-500 rounded-xl hover:bg-ice-50 transition-colors"
                title="Track existing laundry order"
              >
                <Search className="w-3.5 h-3.5 text-aqua-600" />
                <span>Track Order</span>
              </Link>

              {/* Customer Account / Sign In */}
              {user ? (
                <div className="flex items-center gap-2 pl-1 border-l border-ice-200">
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-ice-50 text-darkNavy rounded-xl border border-ice-200 hover:bg-ice-100 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-navy-500" />
                    <span className="truncate max-w-[100px]">{user.full_name?.split(' ')[0]}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 bg-navy-50 text-navy-700 rounded-xl border border-navy-200 hover:bg-navy-100"
                      title="Admin Operations"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-navy-500" />
                      <span>Admin</span>
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-navy-600 hover:text-navy-900 rounded-xl hover:bg-ice-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Prominent "Book Now" Button using Aqua Accent Colour */}
              <Link to="/book" className="ml-1">
                <Button
                  variant="accent"
                  size="md"
                  className="gap-2 font-bold shadow-aqua text-darkNavy active:scale-95 px-5"
                >
                  <CalendarCheck className="w-4 h-4 text-darkNavy" />
                  <span>Book Now</span>
                </Button>
              </Link>
            </div>

            {/* 4. Mobile Controls: Quick Book Button + Hamburger Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Link to="/book" className="sm:hidden">
                <Button
                  variant="accent"
                  size="xs"
                  className="font-bold text-darkNavy px-3 py-2 shadow-sm"
                >
                  Book Now
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-darkNavy hover:text-navy-900 hover:bg-ice-100 focus:outline-none focus:ring-2 focus:ring-aqua-400 transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={isDrawerOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 5. Mobile Slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </header>
  );
};
