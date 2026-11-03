import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Lock, Mail, User, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await register(email, password, fullName, phone);
      if (res.success) {
        navigate('/book');
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto">
      <Card className="p-8 border-ice-200 space-y-6 shadow-soft">
        <div className="text-center space-y-2">
          <Badge variant="accent">New Customer</Badge>
          <h1 className="font-poppins font-bold text-2xl text-navy-500">Create Pickup Wash Account</h1>
          <p className="text-xs text-navy-600/80">
            Enjoy 1-click scheduling, order history & door-to-door tracking.
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Bilal"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              WhatsApp / Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

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
                placeholder="bilal@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
              />
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-2 font-semibold">
            Create Free Account
          </Button>
        </form>

        <div className="text-center text-xs text-navy-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-navy-500 hover:text-navy-700 underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

