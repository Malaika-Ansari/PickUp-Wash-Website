import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Phone, 
  CalendarCheck, 
  Search, 
  Home, 
  Layers, 
  HelpCircle, 
  Tag, 
  Info, 
  ChevronRight, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_INFO } from '@/utils/constants';
import { cn } from '@/utils/cn';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activePath,
}) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Navigation Items required by prompt
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services', path: '/services', icon: Layers },
    { label: 'How It Works', path: '/#how-it-works', icon: Sparkles },
    { label: 'Pricing', path: '/pricing', icon: Tag },
    { label: 'About Us', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: HelpCircle },
  ];

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, location.hash]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = (path: string) => {
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    onClose();
  };

  const isItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (path.includes('#')) {
      return location.hash === `#${path.split('#')[1]}`;
    }
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Drawer"
    >
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-darkNavy-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer container from the right */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10',
          'transition-transform duration-300 ease-out animate-in slide-in-from-right'
        )}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-ice-200 flex items-center justify-between bg-white">
          <Logo size="sm" onClick={onClose} />
          
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-darkNavy/60 hover:text-darkNavy hover:bg-ice-100 transition-colors focus:outline-none focus:ring-2 focus:ring-aqua-400"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Snippet */}
        {user ? (
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-ice-50 border border-ice-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-darkNavy truncate max-w-[170px]">{user.full_name}</div>
                  <div className="text-[11px] text-navy-400 truncate max-w-[170px]">{user.email}</div>
                </div>
              </div>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-500 text-white">
                  Admin
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-ice-200/80 flex items-center justify-between text-xs">
              <Link to="/account" onClick={onClose} className="text-navy-600 font-semibold hover:underline">
                My Account
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-red-600 hover:underline flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-ice-50 border border-ice-200 text-xs font-semibold text-navy-600 hover:bg-ice-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-aqua-600" />
                <span>Customer Login / Register</span>
              </div>
              <ChevronRight className="w-4 h-4 text-navy-400" />
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1" aria-label="Mobile Navigation Links">
          <div className="text-[11px] uppercase tracking-wider font-bold text-navy-400 px-3 py-1">
            Menu Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={cn(
                  'flex items-center justify-between min-h-[48px] px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-ice-100 text-navy-500 font-semibold border-l-4 border-aqua-400 pl-3'
                    : 'text-darkNavy/80 hover:bg-ice-50 hover:text-navy-500'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', active ? 'text-aqua-500' : 'text-navy-400')} />
                  <span>{item.label}</span>
                </div>

                <ChevronRight className={cn('w-4 h-4', active ? 'text-aqua-500' : 'text-darkNavy/30')} />
              </Link>
            );
          })}

          {/* Quick Track Order Link */}
          <Link
            to="/track"
            onClick={onClose}
            className="flex items-center justify-between min-h-[48px] px-3.5 py-3 rounded-2xl text-sm font-medium text-darkNavy/80 hover:bg-ice-50 hover:text-navy-500"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-navy-400" />
              <span>Track Your Order</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-aqua-100 text-navy-800 border border-aqua-200">
              Live
            </span>
          </Link>
        </nav>

        {/* Prominent "Book Now" Button & Contact in Drawer Footer */}
        <div className="p-5 border-t border-ice-200 bg-ice-50/60 space-y-3">
          <Link to="/book" onClick={onClose} className="block w-full">
            <Button
              variant="accent"
              size="lg"
              fullWidth
              className="gap-2.5 font-bold shadow-aqua text-darkNavy py-3.5"
            >
              <CalendarCheck className="w-5 h-5 text-darkNavy" />
              <span>Book Now</span>
            </Button>
          </Link>

          {/* Kasur Phone Hotline */}
          <div className="text-center pt-1">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="inline-flex items-center gap-1.5 text-xs text-navy-600 font-semibold hover:text-navy-900"
            >
              <Phone className="w-3.5 h-3.5 text-aqua-500" />
              <span>Kasur Helpline: {BUSINESS_INFO.phone}</span>
            </a>
            <div className="text-[10px] text-darkNavy/50 mt-0.5">
              Doorstep Pickup Across Kasur City
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
