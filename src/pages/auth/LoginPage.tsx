import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { SEO } from '@/components/common/SEO';

export const LoginPage: React.FC = () => {
  const { login, resetPassword, user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to customer dashboard
  useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (res.success) {
        // Redirect to intended route or customer dashboard
        const destination = (location.state as any)?.from?.pathname || '/account';
        navigate(destination, { replace: true });
      } else {
        setGeneralError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setForgotSuccess(
          'Password reset instructions have been dispatched. Please check your inbox and spam folder.'
        );
      } else {
        setForgotError(res.error || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'An unexpected error occurred.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20">
      <SEO
        title="Customer Login"
        description="Sign in to your Pickup Wash account to view booking history, track laundry orders, and manage pickup addresses in Kasur."
      />
      <Container size="sm">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-ice-200 shadow-soft space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </div>

            <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 tracking-tight">
              Sign In to Pickup Wash
            </h1>

            <p className="text-xs sm:text-sm text-darkNavy/70 max-w-sm mx-auto font-inter">
              Access your doorstep pickups, active laundry cycles, and profile in Kasur.
            </p>
          </div>

          {/* Missing Supabase Configuration Notice (Exact requirement from prompt) */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Info className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Supabase Backend Configuration Required</span>
              </div>
              <p className="leading-relaxed">
                Live customer login uses Supabase Authentication. Currently, placeholder values are
                configured in your project environment.
              </p>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200 font-mono text-[11px] space-y-1">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
              <p className="text-[11px] text-amber-800">
                In accordance with security standards, no fake authentication or insecure bypass is
                permitted.
              </p>
            </div>
          )}

          {/* General Error Banner */}
          {generalError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed">{generalError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            
            {/* 1. Email Address */}
            <FormField
              label="Email Address"
              required
              htmlFor="login-email"
              error={errors.email}
            >
              <Input
                id="login-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  setGeneralError('');
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                isError={Boolean(errors.email)}
              />
            </FormField>

            {/* 2. Password with Show/Hide toggle */}
            <FormField
              label="Password"
              required
              htmlFor="login-password"
              error={errors.password}
            >
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    setGeneralError('');
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  isError={Boolean(errors.password)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 hover:text-navy-500 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* 3. Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-darkNavy/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-ice-300 text-aqua-600 focus:ring-aqua-400"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError('');
                  setForgotSuccess('');
                  setIsForgotOpen(true);
                }}
                className="text-navy-600 hover:text-aqua-600 font-semibold transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* 4. Login Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="font-bold text-darkNavy shadow-aqua text-sm py-3.5"
                variant="accent"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* 5. Link to Create Account */}
          <div className="text-center pt-4 border-t border-ice-100 text-xs text-darkNavy/70">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-navy-600 hover:text-aqua-600 transition-colors underline"
            >
              Create a New Account
            </Link>
          </div>

        </div>
      </Container>

      {/* =========================================================================
          FORGOT PASSWORD MODAL (Secure Supabase Password Reset)
         ========================================================================= */}
      {isForgotOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-ice-200 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-ice-100 text-aqua-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-lg text-navy-500">
                    Reset Password
                  </h3>
                  <p className="text-xs text-darkNavy/65">
                    We'll dispatch a secure recovery link
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="p-1 rounded-lg text-darkNavy/40 hover:text-darkNavy hover:bg-ice-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reset Link Dispatched</span>
                  </div>
                  <p className="leading-relaxed">{forgotSuccess}</p>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setIsForgotOpen(false)}
                >
                  Close Window
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">
                  Enter your registered email address below. If your account exists in our Supabase
                  system, a secure password reset link will be sent to your inbox.
                </p>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <FormField label="Email Address" required htmlFor="forgot-email">
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </FormField>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsForgotOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    isLoading={forgotLoading}
                    className="font-bold text-darkNavy shadow-aqua"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
