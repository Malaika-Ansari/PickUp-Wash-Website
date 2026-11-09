import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, resetPassword, user, logout, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated as an administrator, go directly to Admin Dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      const target = (location.state as any)?.from?.pathname || '/admin';
      navigate(target, { replace: true });
    }
  }, [user, navigate, location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCustomerAccountAlert, setIsCustomerAccountAlert] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCustomerAccountAlert(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await adminLogin(cleanEmail, password);

      if (res.success) {
        const destination = (location.state as any)?.from?.pathname || '/admin';
        navigate(destination, { replace: true });
      } else {
        const err = res.error || 'Authentication failed. Please verify your credentials.';
        setErrorMessage(err);
        if (err.toLowerCase().includes('customer') || err.toLowerCase().includes('privileges')) {
          setIsCustomerAccountAlert(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid administrator email address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await resetPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSuccess(
          'Password recovery instructions have been dispatched to your email address.'
        );
      } else {
        setForgotError(res.error || 'Unable to send recovery email. Please contact systems administrator.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'An unexpected error occurred.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCustomerSwitch = async () => {
    await logout();
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setIsCustomerAccountAlert(false);
  };

  return (
    <div className="min-h-screen bg-ice-50 flex flex-col justify-between text-darkNavy">
      <SEO
        title="Admin Portal Login"
        description="Authorized administrator authentication gateway for Pickup Wash operations in Kasur City."
      />
      {/* Top Simple Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-ice-200 bg-white shadow-xs">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-navy-500 flex items-center justify-center text-aqua-400 font-bold shadow-md">
            PW
          </div>
          <div>
            <span className="font-poppins font-bold text-base text-darkNavy leading-tight block">
              Pickup Wash
            </span>
            <span className="text-[11px] font-semibold text-aqua-600 block">
              Kasur Operational Hub
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-navy-600 hover:text-navy-800 transition-colors hidden sm:inline-block"
          >
            Customer Portal →
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-darkNavy/70 hover:text-darkNavy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Site</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden">
          {/* Header Card */}
          <div className="bg-navy-700 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-aqua-400/10 blur-xl"></div>
            <div className="w-14 h-14 rounded-2xl bg-navy-600 border border-aqua-400/40 flex items-center justify-center mx-auto mb-4 text-aqua-400 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-aqua-400/20 text-aqua-300 border border-aqua-400/30 mb-2">
              Staff & Operations Only
            </span>
            <h1 className="text-xl sm:text-2xl font-poppins font-bold text-white tracking-tight">
              Admin Console Login
            </h1>
            <p className="text-xs text-ice-200/80 mt-1">
              Authorized credentials required to manage orders, payments, and dispatching in Kasur.
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Supabase Notice if not configured */}
            {!isConfigured && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Configuration Required</strong>
                  Connect Supabase credentials in <code className="bg-amber-100 px-1 rounded">.env</code> to enable live staff authentication.
                </div>
              </div>
            )}

            {/* If currently logged in as a customer */}
            {user && user.role !== 'admin' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Currently Signed In as Customer</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  You are logged into customer account <strong className="font-semibold">{user.email}</strong>. 
                  To access operations, enter your admin credentials below or switch accounts.
                </p>
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/account"
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Go to Customer Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleCustomerSwitch}
                    className="px-3 py-1.5 rounded-xl bg-amber-200 text-amber-900 font-semibold hover:bg-amber-300 transition-colors"
                  >
                    Sign Out Customer
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  isCustomerAccountAlert
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-semibold block">
                    {isCustomerAccountAlert ? 'Privilege Verification Failed' : 'Authentication Error'}
                  </strong>
                  <p className="leading-relaxed">{errorMessage}</p>
                  {isCustomerAccountAlert && (
                    <div className="pt-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 font-bold text-red-700 underline hover:text-red-900"
                      >
                        <span>Click here to sign in through the Customer Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pickupwash.pk"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all placeholder:text-navy-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs font-semibold text-aqua-600 hover:text-aqua-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 focus:border-transparent transition-all placeholder:text-navy-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-navy-400 hover:text-navy-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-navy-500 hover:bg-navy-600 active:bg-navy-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-aqua-400" />
                    <span>Access Operational Console</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Assurance Notice */}
            <div className="pt-2 border-t border-ice-200/80 text-center">
              <p className="text-[11px] text-navy-500/70 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-aqua-600 inline" />
                <span>Protected by PostgreSQL Row Level Security & Audit Logging</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-navy-500/60 border-t border-ice-200">
        Pickup Wash &copy; {new Date().getFullYear()} • Kasur City Central Operations Hub
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkNavy-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-navy-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ice-200">
              <div className="flex items-center gap-2 text-navy-900 font-poppins font-bold text-sm">
                <KeyRound className="w-4 h-4 text-aqua-600" />
                <span>Staff Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-600/90 leading-relaxed">
              Enter your registered staff email address below. A secure Supabase password reset link will be sent to you.
            </p>

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-navy-800 uppercase mb-1">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="staff@pickupwash.pk"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs focus:outline-none focus:ring-2 focus:ring-aqua-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-navy-600 hover:text-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 rounded-xl bg-navy-500 text-white text-xs font-semibold hover:bg-navy-600 disabled:opacity-50"
                  >
                    {forgotLoading ? 'Dispatching...' : 'Send Recovery Link'}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-500 text-white text-xs font-semibold hover:bg-navy-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

