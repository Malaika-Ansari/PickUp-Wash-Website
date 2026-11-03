import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, ShoppingBag, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Orders & Tracking', path: '/admin', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-ice-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-700 text-white flex flex-col justify-between p-6 shrink-0 border-r border-navy-600">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-navy-500 flex items-center justify-center border border-aqua-400">
              <ShieldCheck className="w-5 h-5 text-aqua-400" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base leading-tight">Admin Console</h2>
              <p className="text-[11px] text-aqua-300">Pickup Wash • Kasur</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-navy-500 text-white font-semibold'
                      : 'text-ice-200/80 hover:bg-navy-600 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-aqua-300" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Back / Logout */}
        <div className="pt-6 border-t border-navy-600/70 space-y-3 mt-6">
          <div className="text-xs text-ice-200/70">
            Logged in as <br />
            <strong className="text-white font-medium">{user?.email || 'admin@pickupwash.pk'}</strong>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-aqua-300 hover:text-aqua-200 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Website
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200 w-full pt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

