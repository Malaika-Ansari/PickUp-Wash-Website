import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  CalendarCheck, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  LogOut,
  ChevronRight,
  Home,
  Layers,
  Tag,
  Info,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { BUSINESS_INFO } from '@/utils/constants';
import { cn } from '@/utils/cn';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

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

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Services & Care', path: '/services', icon: Layers },
    { label: 'Pricing & Rates', path: '/pricing', icon: Tag },
    { label: 'Track Your Laundry', path: '/track', icon: Search, badge: 'Live' },
    { label: 'About Startup', path: '/about', icon: Info },
    { label: 'Contact Helpline', path: '/contact', icon: HelpCircle },
    { label: 'Brand & Design System', path: '/design-system', icon: Sparkles, badge: 'UI Kit' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-darkNavy-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface (Slides from right, takes 85% width up to 380px) */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto',
          'transition-transform duration-300 ease-out animate-in slide-in-from-right'
        )}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-ice-200 flex items-center justify-between bg-ice-50/60">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-500 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="32" stroke="#65B9C5" strokeWidth="8" strokeDasharray="140 30" strokeLinecap="round" />
                <path d="M50 32C46 38 40 45 40 52C40 57.5 44.5 62 50 62C55.5 62 60 57.5 60 52C60 45 54 38 50 32Z" fill="#65B9C5"/>
              </svg>
            </div>
            <div>
              <span className="font-poppins font-bold text-lg text-navy-500">Pickup<span className="text-aqua-400">Wash</span></span>
              <span className="block text-[10px] text-navy-400 uppercase font-semibold">Kasur City</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-darkNavy/60 hover:text-darkNavy hover:bg-ice-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-aqua-400"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card if Logged in */}
        {user ? (
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-ice-100/70 border border-ice-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold uppercase">
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

            <div className="pt-2 border-t border-ice-200 flex items-center justify-between text-xs">
              <Link
                to="/account"
                onClick={onClose}
                className="text-navy-600 font-semibold hover:underline"
              >
                Customer Portal
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
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-navy-500 text-white space-y-2">
            <div className="text-xs font-semibold text-aqua-300 uppercase tracking-wider">Customer Portal</div>
            <p className="text-xs text-ice-200/90 leading-normal">Sign in to track orders, schedule pickups in 1 click & save Kasur addresses.</p>
            <div className="pt-1 flex gap-2">
              <Link to="/login" onClick={onClose} className="flex-1">
                <Button size="xs" variant="accent" fullWidth className="text-xs py-2 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={onClose} className="flex-1">
                <Button size="xs" variant="secondary" fullWidth className="text-xs py-2">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-[11px] uppercase tracking-wider font-bold text-navy-400 px-3 py-1">
            Menu Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between min-h-[48px] px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-ice-200/80 text-navy-500 font-semibold'
                    : 'text-darkNavy/80 hover:bg-ice-100 hover:text-navy-500'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4', active ? 'text-navy-500' : 'text-navy-400')} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-aqua-100 text-navy-800 border border-aqua-200">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-darkNavy/30" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Drawer Actions */}
        <div className="p-5 border-t border-ice-200 bg-ice-50/50 space-y-3">
          <Link to="/book" onClick={onClose} className="block">
            <Button size="lg" variant="primary" fullWidth className="gap-2 shadow-md">
              <CalendarCheck className="w-4 h-4 text-aqua-300" />
              Schedule Doorstep Pickup
            </Button>
          </Link>

          {/* Quick Helpline Hotline */}
          <div className="text-center pt-1 space-y-1">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="inline-flex items-center gap-1.5 text-xs text-navy-600 font-semibold hover:text-navy-900"
            >
              <Phone className="w-3.5 h-3.5 text-aqua-500" />
              Kasur Hotline: {BUSINESS_INFO.phone}
            </a>
            <div className="text-[10px] text-darkNavy/50">
              Open 7 Days a week (8:00 AM – 9:00 PM)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
