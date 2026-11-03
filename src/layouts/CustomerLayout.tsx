import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  User, 
  LogOut, 
  CalendarCheck, 
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/common/Footer';
import { MobileBottomBar } from '@/components/layout/MobileBottomBar';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const CustomerLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect unauthenticated customers away from protected customer pages
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ice-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const customerNav = [
    { label: 'Overview', path: '/account', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/account/history', icon: Package },
    { label: 'Track Order', path: '/track', icon: Search },
    { label: 'My Profile', path: '/account/profile', icon: User },
    { label: 'Help & Support', path: '/contact', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ice-100 text-darkNavy selection:bg-aqua-400 selection:text-white pb-16 sm:pb-0">
      <Header />

      {/* Account Header Hero Strip */}
      <div className="bg-navy-500 text-white py-8 border-b border-navy-600">
        <Container size="xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-aqua-300 border border-white/20 flex items-center justify-center font-poppins font-bold text-2xl uppercase">
                {user?.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-poppins font-bold text-xl sm:text-2xl text-white">
                    {user?.full_name || 'Valued Customer'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-aqua-400 text-darkNavy">
                    Kasur Resident
                  </span>
                </div>
                <p className="text-xs text-ice-200 mt-0.5">
                  {user?.phone_number || '+92 300 0000000'} • {user?.email || 'customer@pickupwash.pk'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/book">
                <Button size="sm" variant="accent" className="gap-2 font-semibold">
                  <CalendarCheck className="w-4 h-4" />
                  New Doorstep Booking
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Account Portal Viewport */}
      <main className="flex-1 py-8">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop / Tablet Sidebar Navigation */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-ice-200 shadow-soft space-y-1">
                <div className="text-[11px] uppercase tracking-wider font-bold text-navy-400 px-3 py-2">
                  Customer Navigation
                </div>

                {customerNav.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-colors',
                        active
                          ? 'bg-navy-500 text-white font-semibold shadow-sm shadow-navy-500/20'
                          : 'text-darkNavy/80 hover:bg-ice-100 hover:text-navy-500'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn('w-4 h-4', active ? 'text-aqua-300' : 'text-navy-400')} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={cn('w-3.5 h-3.5', active ? 'text-white' : 'text-darkNavy/30')} />
                    </Link>
                  );
                })}

                <div className="pt-3 mt-3 border-t border-ice-200 space-y-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Kasur Support Quick Card */}
              <div className="bg-ice-50 rounded-3xl p-5 border border-ice-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-navy-500">
                  <ShieldCheck className="w-4 h-4 text-aqua-600" />
                  <span>Doorstep Pickup Assistance</span>
                </div>
                <p className="text-darkNavy/70 leading-relaxed">
                  Need to change pickup time or have delicate garment requests? Reach out to our Kasur team directly.
                </p>
                <Link to="/contact" className="text-navy-600 font-semibold hover:underline block pt-1">
                  Contact Kasur Helpline →
                </Link>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-9">
              <Outlet />
            </div>
          </div>
        </Container>
      </main>

      <Footer />
      <MobileBottomBar />
    </div>
  );
};

