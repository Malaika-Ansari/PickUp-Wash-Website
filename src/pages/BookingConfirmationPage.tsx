import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  Home,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Layers,
  Search,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export interface BookingStateData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  pickupAddress: string;
  area: string;
  selectedService: string;
  pickupDate: string;
  preferredPickupTime: string;
  specialInstructions?: string;
  paymentMethod?: string;
  submittedAt?: string;
  trackingNumber?: string;
}

export const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Safely retrieve submitted booking details from route state (not public URL params)
  const booking = (location.state as { booking?: BookingStateData } | null)?.booking;

  // Handle page refresh or direct navigation gracefully
  if (!booking) {
    return (
      <div className="py-16 sm:py-24">
        <Container size="md">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-aqua-600" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 bg-ice-50 px-3 py-1 rounded-full border border-ice-200">
                Session Notice
              </span>
              <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-500">
                No Active Booking Request Found
              </h1>
              <p className="text-sm text-darkNavy/70 max-w-md mx-auto leading-relaxed font-inter">
                For customer privacy, submitted booking information is kept in memory during the
                active session and is not stored in public URLs or insecure browser storage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 text-xs text-darkNavy/75 max-w-md mx-auto leading-relaxed">
              If you would like to schedule a doorstep laundry collection in Kasur, please complete
              our pickup form.
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/book">
                <Button
                  variant="accent"
                  size="md"
                  className="font-bold text-darkNavy shadow-aqua"
                  leftIcon={<Sparkles className="w-4 h-4 text-darkNavy" />}
                >
                  Book a Pickup
                </Button>
              </Link>

              <Link to="/">
                <Button
                  variant="secondary"
                  size="md"
                  className="text-navy-500 border-ice-300"
                  leftIcon={<Home className="w-4 h-4 text-aqua-600" />}
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // 3-Step Next Steps process required by prompt
  const nextSteps = [
    {
      step: 1,
      title: 'Booking request received',
      desc: 'Your doorstep pickup request has reached our queue.',
      status: 'completed',
    },
    {
      step: 2,
      title: 'Team reviews & confirms availability',
      desc: 'Our Kasur customer desk verifies rider routing and confirms your slot.',
      status: 'in-progress',
    },
    {
      step: 3,
      title: 'Customer receives pickup confirmation',
      desc: 'You receive confirmation via phone call or message before the rider arrives.',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 pt-8 sm:pt-12">
      <Container size="lg">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* =========================================================================
              1. CONFIRMATION SCREEN HEADER
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft text-center space-y-6">
            
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-11 h-11" />
            </div>

            <div className="space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                Request Awaiting Team Review
              </span>

              {/* Exact Heading from prompt */}
              <h1 className="font-poppins font-extrabold text-2xl sm:text-4xl text-navy-500 tracking-tight">
                Your Booking Request Has Been Received!
              </h1>

              {/* Exact Supporting Text from prompt */}
              <p className="font-poppins font-medium text-base sm:text-lg text-navy-600/90 max-w-xl mx-auto">
                Thank you for choosing Pickup Wash. We appreciate your trust.
              </p>

              {/* Transparent Status Explanation: Awaiting backend confirmation */}
              <div className="p-4 rounded-2xl bg-ice-50/80 border border-ice-200 text-xs sm:text-sm text-darkNavy/80 max-w-xl mx-auto leading-relaxed">
                <p className="text-darkNavy/75">
                  Your booking request has been submitted and is{' '}
                  <strong className="text-navy-700">awaiting confirmation</strong> from the Pickup
                  Wash team. Our team will contact your phone number to verify slot availability
                  and rider dispatch before the pickup.
                </p>
              </div>
            </div>

            {/* Optional tracking / reference badge (only shown if real record exists) */}
            {booking.trackingNumber && (
              <div className="p-3.5 rounded-2xl bg-white border border-ice-200 inline-flex items-center gap-2.5 text-xs text-navy-600 shadow-2xs">
                <span className="text-navy-400 font-medium">Tracking Record:</span>
                <span className="font-mono font-bold text-navy-800 bg-ice-100 px-2 py-0.5 rounded">
                  {booking.trackingNumber}
                </span>
              </div>
            )}
          </div>

          {/* =========================================================================
              2. NEXT STEPS (THREE-STEP PROCESS)
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-ice-100">
              <Clock className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg text-navy-500">
                What Happens Next?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nextSteps.map((s) => (
                <div
                  key={s.step}
                  className={`p-4 rounded-2xl border transition-all ${
                    s.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : s.status === 'in-progress'
                      ? 'border-aqua-300 bg-aqua-50/30 ring-1 ring-aqua-300/50'
                      : 'border-ice-200 bg-ice-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        s.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : s.status === 'in-progress'
                          ? 'bg-aqua-500 text-white'
                          : 'bg-ice-200 text-darkNavy/60'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'completed'
                          ? 'text-emerald-700'
                          : s.status === 'in-progress'
                          ? 'text-aqua-800'
                          : 'text-darkNavy/50'
                      }`}
                    >
                      Step {s.step}
                    </span>
                  </div>

                  <h3 className="font-poppins font-semibold text-xs sm:text-sm text-navy-500 mb-1">
                    {s.title}
                  </h3>

                  <p className="text-[11px] text-darkNavy/70 leading-relaxed font-inter">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              3. BOOKING SUMMARY
             ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-aqua-600" />
                <h2 className="font-poppins font-bold text-lg text-navy-500">
                  Booking Summary
                </h2>
              </div>
              <span className="text-[11px] text-darkNavy/50">
                Submitted details
              </span>
            </div>

            {/* Submitted details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Customer Name */}
              <div className="p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Customer Name
                </span>
                <span className="font-poppins font-bold text-sm text-navy-700 block">
                  {booking.fullName}
                </span>
              </div>

              {/* Phone Number */}
              <div className="p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Phone Number
                </span>
                <span className="font-poppins font-bold text-sm text-navy-700 block">
                  {booking.phoneNumber}
                </span>
              </div>

              {/* Selected Service */}
              <div className="p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Selected Service
                </span>
                <span className="font-poppins font-bold text-sm text-aqua-700 block">
                  {booking.selectedService}
                </span>
              </div>

              {/* Pickup Date & Time */}
              <div className="p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Pickup Schedule
                </span>
                <span className="font-poppins font-bold text-sm text-navy-700 block">
                  {booking.pickupDate} • {booking.preferredPickupTime}
                </span>
              </div>

              {/* Pickup Address */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                  Pickup Address
                </span>
                <span className="font-medium text-darkNavy text-xs block leading-relaxed">
                  {booking.pickupAddress}
                </span>
              </div>

              {/* Special Instructions (only if provided) */}
              {booking.specialInstructions && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-ice-50/60 border border-ice-100 space-y-1">
                  <span className="text-navy-400 font-semibold uppercase tracking-wider text-[10px] block">
                    Special Instructions
                  </span>
                  <span className="font-normal text-darkNavy/80 text-xs italic block leading-relaxed">
                    "{booking.specialInstructions}"
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 text-[11px] text-darkNavy/60 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                First pickup is FREE. Payment is only collected upon safe delivery of your clean garments.
              </span>
            </div>
          </div>

          {/* =========================================================================
              4. ACTION BUTTONS
             ========================================================================= */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Back to Home */}
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="gap-2 text-navy-500 border-ice-300 shadow-sm"
                leftIcon={<Home className="w-4 h-4 text-navy-500" />}
              >
                Back to Home
              </Button>
            </Link>

            {/* View My Booking (only if a real booking record/tracking code exists) */}
            {booking.trackingNumber ? (
              <Link
                to={`/track?code=${booking.trackingNumber}`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  className="gap-2 shadow-sm"
                  leftIcon={<Search className="w-4 h-4 text-white" />}
                >
                  View My Booking
                </Button>
              </Link>
            ) : null}

            {/* Book Another Pickup */}
            <Link to="/book" className="w-full sm:w-auto">
              <Button
                variant="accent"
                size="md"
                fullWidth
                className="gap-2 font-bold text-darkNavy shadow-aqua"
                leftIcon={<RotateCcw className="w-4 h-4 text-darkNavy" />}
              >
                Book Another Pickup
              </Button>
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};

