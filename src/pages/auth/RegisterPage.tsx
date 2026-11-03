import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

export const RegisterPage: React.FC = () => {
  const { register, user, isConfigured } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to customer dashboard
  useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pakistani phone validator
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const pkRegex = /^(?:(?:\+92|0092)|0)?3\d{9}$/;
    return pkRegex.test(cleaned);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setGeneralError('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = 'Please enter a valid Pakistani mobile number (e.g. 0300 1234567).';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!form.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(form.email, form.password, form.fullName, form.phone);

      if (res.success) {
        if (res.confirmationRequired) {
          setSuccessMessage(
            'Account registration successful! A confirmation email has been sent to your address. Please verify your email before logging in.'
          );
        } else {
          // Redirect to customer dashboard
          navigate('/account', { replace: true });
        }
      } else {
        setGeneralError(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20">
      <Container size="sm">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-ice-200 shadow-soft space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </div>

            <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 tracking-tight">
              Create Your Account
            </h1>

            <p className="text-xs sm:text-sm text-darkNavy/70 max-w-sm mx-auto font-inter">
              Join Pickup Wash in Kasur for seamless doorstep laundry scheduling and order tracking.
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
                Live customer registration requires your Supabase project keys. Currently,
                placeholder values are detected in your <code>.env</code> file.
              </p>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200 font-mono text-[11px] space-y-1">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
              <p className="text-[11px] text-amber-800">
                To protect customer security, no fake accounts or insecure mock sessions will be
                created.
              </p>
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Registration Submitted!</span>
              </div>
              <p className="leading-relaxed">{successMessage}</p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="accent" size="sm" className="font-bold text-darkNavy text-xs">
                    Proceed to Login
                  </Button>
                </Link>
              </div>
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

          {/* The Registration Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* 1. Full Name */}
              <FormField
                label="Full Name"
                required
                htmlFor="reg-name"
                error={errors.fullName}
              >
                <Input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahmad"
                  value={form.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  isError={Boolean(errors.fullName)}
                />
              </FormField>

              {/* 2. Phone Number */}
              <FormField
                label="Phone Number"
                required
                htmlFor="reg-phone"
                hint="Kasur mobile"
                error={errors.phone}
              >
                <Input
                  id="reg-phone"
                  type="tel"
                  required
                  placeholder="e.g. 0300 1234567"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                  isError={Boolean(errors.phone)}
                />
              </FormField>

              {/* 3. Email Address */}
              <FormField
                label="Email Address"
                required
                htmlFor="reg-email"
                error={errors.email}
              >
                <Input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  isError={Boolean(errors.email)}
                />
              </FormField>

              {/* 4. Password with Show/Hide toggle */}
              <FormField
                label="Password"
                required
                htmlFor="reg-password"
                hint="Min 6 characters"
                error={errors.password}
              >
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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

              {/* 5. Confirm Password with Show/Hide toggle */}
              <FormField
                label="Confirm Password"
                required
                htmlFor="reg-confirm-password"
                error={errors.confirmPassword}
              >
                <div className="relative">
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    isError={Boolean(errors.confirmPassword)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-darkNavy/40 hover:text-navy-500 focus:outline-none"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </FormField>

              {/* 6. Terms and Privacy Policy Checkbox */}
              <div className="pt-2">
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    errors.agreedToTerms
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-ice-200 bg-ice-50/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-ice-300 text-aqua-600 focus:ring-aqua-400"
                  />
                  <span className="text-xs text-darkNavy/80 leading-normal">
                    I agree to the{' '}
                    <span className="text-navy-600 font-semibold underline">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-navy-600 font-semibold underline">Privacy Policy</span>.
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.agreedToTerms}
                  </p>
                )}
              </div>

              {/* 7. Create Account Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  className="font-bold text-darkNavy shadow-aqua text-sm py-3.5"
                  variant="accent"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="text-center pt-4 border-t border-ice-100 text-xs text-darkNavy/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-navy-600 hover:text-aqua-600 transition-colors underline"
            >
              Sign In here
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};
