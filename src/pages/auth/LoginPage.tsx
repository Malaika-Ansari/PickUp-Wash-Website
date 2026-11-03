import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (email.includes('admin')) {
          navigate('/admin');
        } else {
          navigate('/book');
        }
      } else {
        setError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setEmail('admin@pickupwash.pk');
    setPassword('admin123');
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto">
      <Card className="p-8 border-ice-200 space-y-6 shadow-soft">
        <div className="text-center space-y-2">
          <Badge variant="primary">Customer & Admin Portal</Badge>
          <h1 className="font-poppins font-bold text-2xl text-navy-500">Sign In to Pickup Wash</h1>
          <p className="text-xs text-navy-600/80">
            Access your orders, saved addresses, and scheduling.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2 font-semibold">
            Sign In
          </Button>
        </form>

        {/* Demo Helper for fast developer review */}
        <div className="pt-4 border-t border-ice-200 text-center space-y-2">
          <p className="text-[11px] text-navy-400">Testing the admin dashboard?</p>
          <button
            type="button"
            onClick={handleAdminQuickFill}
            className="inline-flex items-center gap-1.5 text-xs text-navy-600 hover:text-navy-900 bg-ice-100 px-3 py-1.5 rounded-lg border border-ice-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-aqua-600" />
            Auto-fill Admin Demo Credentials
          </button>
        </div>

        <div className="text-center text-xs text-navy-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-navy-500 hover:text-navy-700 underline">
            Register for free
          </Link>
        </div>
      </Card>
    </div>
  );
};

