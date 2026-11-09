import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface AdminAccessDeniedProps {
  userEmail?: string;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ userEmail }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ice-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden text-center">
        {/* Top Warning Banner */}
        <div className="bg-red-50 border-b border-red-100 p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-200/80 text-red-800 uppercase tracking-wider mb-2">
            403 - Forbidden
          </span>
          <h1 className="text-xl sm:text-2xl font-poppins font-bold text-darkNavy">
            Admin Access Restricted
          </h1>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <p className="text-sm text-darkNavy/80 leading-relaxed">
            You are currently signed in as{' '}
            <strong className="text-darkNavy font-semibold underline decoration-aqua-500">
              {userEmail || 'a Customer Account'}
            </strong>
            . This portal is strictly reserved for authorized Pickup Wash operational staff in Kasur City.
          </p>

          <div className="bg-ice-50 border border-ice-200 rounded-2xl p-4 text-xs text-left space-y-1.5 text-navy-700">
            <div className="font-bold flex items-center gap-1.5 text-navy-900">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Security Policy Notice
            </div>
            <p className="text-navy-700/80">
              Customer accounts cannot inspect internal order dispatches, modify service rates, or verify customer transactions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to="/account"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-500 hover:bg-navy-600 text-white font-medium text-sm transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-aqua-400" />
              <span>Go to Customer Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleSwitchAccount}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-navy-200 hover:bg-ice-100 text-navy-700 font-medium text-sm transition-colors"
            >
              <LogOut className="w-4 h-4 text-navy-500" />
              <span>Switch to Admin Account</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-aqua-700 hover:text-aqua-800 pt-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

