import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard,
  ShoppingBag, 
  Users,
  Sliders,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  ArrowLeft, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  MapPin, 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileAdminDrawerOpen, setMobileAdminDrawerOpen] = useState(false);

  const currentTab = searchParams.get('tab') || 'overview';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', path: '/admin?tab=overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', path: '/admin?tab=bookings', icon: ShoppingBag, badge: 'Live' },
    { id: 'customers', label: 'Customers', path: '/admin?tab=customers', icon: Users },
    { id: 'services', label: 'Services & Pricing', path: '/admin?tab=services', icon: Sliders },
    { id: 'payments', label: 'Payments', path: '/admin?tab=payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', path: '/admin?tab=notifications', icon: Bell },
    { id: 'analytics', label: 'Reports & Analytics', path: '/admin?tab=analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', path: '/admin?tab=settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ice-50 flex flex-col lg:flex-row text-darkNavy">
      {/* =========================================================================
          DESKTOP & TABLET SIDEBAR (Hidden on small mobile)
         ========================================================================= */}
      <aside className="hidden lg:flex w-72 bg-navy-700 text-white flex-col justify-between p-6 shrink-0 border-r border-navy-600/80 min-h-screen">
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-navy-500 flex items-center justify-center border border-aqua-400 shadow-md">
              <ShieldCheck className="w-5 h-5 text-aqua-400" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-lg leading-tight tracking-tight text-white">
                Admin Console
              </h2>
              <p className="text-xs text-aqua-300">Pickup Wash • Kasur Operations</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            <div className="text-[11px] uppercase tracking-wider font-bold text-ice-200/50 px-3 py-1">
              Operations
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-colors',
                    active
                      ? 'bg-navy-500 text-white font-semibold shadow-sm'
                      : 'text-ice-200/80 hover:bg-navy-600 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', active ? 'text-aqua-300' : 'text-ice-200/60')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-aqua-400 text-darkNavy">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Public Return */}
        <div className="pt-6 border-t border-navy-600/70 space-y-3">
          <div className="text-xs text-ice-200/70 p-3 rounded-2xl bg-navy-800/60 border border-navy-600/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-aqua-300 uppercase font-bold tracking-wider">Authenticated</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-aqua-400/20 text-aqua-300 border border-aqua-400/30">
                Verified Admin
              </span>
            </div>
            <strong className="text-white font-medium block truncate text-xs">
              {user?.email || 'admin@pickupwash.pk'}
            </strong>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-aqua-300 hover:text-white py-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200 w-full pt-1 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE ADMIN TOP HEADER (Visible on small screens)
         ========================================================================= */}
      <div className="lg:hidden bg-navy-700 text-white p-4 border-b border-navy-600 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-navy-500 flex items-center justify-center border border-aqua-400">
            <ShieldCheck className="w-4 h-4 text-aqua-400" />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-sm text-white leading-tight">Admin Console</h2>
            <p className="text-[10px] text-aqua-300">Kasur Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs text-ice-200 hover:text-white px-2 py-1">
            Site
          </Link>
          <button
            type="button"
            onClick={() => setMobileAdminDrawerOpen(true)}
            className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Admin Drawer */}
      {mobileAdminDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-darkNavy-900/60 backdrop-blur-sm"
            onClick={() => setMobileAdminDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[80%] max-w-xs bg-navy-700 text-white p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-navy-600">
                <span className="font-poppins font-bold text-base text-white">Admin Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileAdminDrawerOpen(false)}
                  className="p-2 text-ice-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileAdminDrawerOpen(false)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors',
                        active
                          ? 'bg-navy-500 text-white font-semibold'
                          : 'bg-navy-600/70 text-ice-200/90 hover:bg-navy-600 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn('w-4 h-4', active ? 'text-aqua-300' : 'text-ice-200/60')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-aqua-400 text-darkNavy px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-navy-600 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileAdminDrawerOpen(false)}
                className="text-xs text-aqua-300 block"
              >
                ← Return to Public Website
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-300 block w-full text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN ADMIN VIEWPORT
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Status Bar */}
        <header className="bg-white border-b border-ice-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
          <div className="flex items-center gap-2 text-xs text-darkNavy/70">
            <MapPin className="w-3.5 h-3.5 text-aqua-600" />
            <span>Kasur City Central Operational Hub • Real-time Order Stream</span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Rider Dispatch Ready
            </span>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
