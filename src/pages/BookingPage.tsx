import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';
import { BookingFormData, Order } from '@/types';
import { KASUR_SERVICE_AREAS, TIME_SLOTS, CORE_SERVICES } from '@/utils/constants';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Copy
} from 'lucide-react';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') || CORE_SERVICES[0].id;
  const { user } = useAuth();

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: user?.full_name || '',
    phoneNumber: user?.phone_number || '',
    email: user?.email || '',
    area: KASUR_SERVICE_AREAS[0],
    streetAddress: user?.address || '',
    landmark: '',
    serviceId: preselectedService,
    estimatedWeightOrPieces: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTimeSlot: TIME_SLOTS[0],
    specialInstructions: '',
    paymentMethod: 'cash_on_delivery',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && CORE_SERVICES.some((s) => s.id === serviceParam)) {
      setFormData((prev) => ({ ...prev, serviceId: serviceParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name,
        phoneNumber: prev.phoneNumber || user.phone_number,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.streetAddress.trim()) {
      setErrorMessage('Please fill in your name, contact phone number, and street address.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await orderService.createOrder(formData, user?.id);
      if (result.success && result.order) {
        setCreatedOrder(result.order);
      } else {
        setErrorMessage(result.error || 'Failed to place booking. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while creating booking.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTracking = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESS CONFIRMATION STATE
  if (createdOrder) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4 sm:px-6">
        <Card className="text-center p-8 sm:p-12 border-emerald-200 bg-white shadow-soft-hover space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <Badge variant="success">Booking Successfully Placed</Badge>
            <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-500">
              Your Pickup is Scheduled!
            </h1>
            <p className="text-sm text-navy-600/80 max-w-md mx-auto">
              Our rider will visit your doorstep in Kasur during your requested time slot. Please keep your items packed in a bag or basket.
            </p>
          </div>

          {/* Tracking Number Highlight Box */}
          <div className="p-5 rounded-2xl bg-ice-50 border border-ice-200 space-y-2 max-w-md mx-auto">
            <div className="text-xs uppercase font-bold tracking-wider text-navy-400">
              Your Order Tracking Code
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono font-extrabold text-2xl text-navy-500 tracking-wider">
                {createdOrder.trackingNumber}
              </span>
              <button
                type="button"
                onClick={copyTracking}
                className="p-1.5 rounded-lg text-navy-500 hover:bg-white transition-colors"
                title="Copy tracking code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <span className="text-[11px] text-emerald-600 font-medium">Copied to clipboard!</span>}
          </div>

          {/* Booking Summary details */}
          <div className="border-t border-b border-ice-200 py-4 text-xs text-navy-700/80 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-navy-400 block">Customer</span>
              <span className="font-semibold text-navy-900">{createdOrder.customerName}</span>
            </div>
            <div>
              <span className="text-navy-400 block">Area</span>
              <span className="font-semibold text-navy-900">{createdOrder.area}</span>
            </div>
            <div>
              <span className="text-navy-400 block">Pickup Date</span>
              <span className="font-semibold text-navy-900">{createdOrder.pickupDate}</span>
            </div>
            <div>
              <span className="text-navy-400 block">Time Slot</span>
              <span className="font-semibold text-navy-900">{createdOrder.pickupTimeSlot}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={`/track?code=${createdOrder.trackingNumber}`}>
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Track This Order Live
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setCreatedOrder(null);
              }}
              className="w-full sm:w-auto"
            >
              Book Another Pickup
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <Badge variant="accent">Doorstep Collection in Kasur</Badge>
          <h1 className="font-poppins text-3xl sm:text-4xl font-extrabold text-navy-500 tracking-tight">
            Schedule a Laundry Pickup
          </h1>
          <p className="text-xs sm:text-sm text-navy-600/80">
            Tell us when and where in Kasur to collect your laundry. No advance payment required.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Contact Details */}
          <Card className="p-6 sm:p-8 border-ice-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-ice-200">
              <User className="w-5 h-5 text-aqua-500" />
              <h2 className="font-poppins font-semibold text-lg text-navy-500">
                1. Your Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Muhammad Ahmad"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0300 1234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Email Address (Optional for e-receipts)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>
            </div>
          </Card>

          {/* Step 2: Kasur Pickup Location */}
          <Card className="p-6 sm:p-8 border-ice-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-ice-200">
              <MapPin className="w-5 h-5 text-aqua-500" />
              <h2 className="font-poppins font-semibold text-lg text-navy-500">
                2. Doorstep Pickup Address in Kasur
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Neighborhood / Area *
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                >
                  {KASUR_SERVICE_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Nearest Landmark (Helpful for rider)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near PSO Pump, Steel Bagh Chowk"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Street & House Address *
                </label>
                <textarea
                  name="streetAddress"
                  required
                  rows={2}
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="House #, Street #, Mohallah / Colony"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>
            </div>
          </Card>

          {/* Step 3: Service Selection & Timing */}
          <Card className="p-6 sm:p-8 border-ice-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-ice-200">
              <Sparkles className="w-5 h-5 text-aqua-500" />
              <h2 className="font-poppins font-semibold text-lg text-navy-500">
                3. Service & Preferred Timing
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-2">
                  Select Primary Service *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CORE_SERVICES.map((s) => (
                    <label
                      key={s.id}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        formData.serviceId === s.id
                          ? 'border-aqua-400 bg-aqua-50/40 ring-1 ring-aqua-400'
                          : 'border-ice-200 bg-white hover:border-ice-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceId"
                        value={s.id}
                        checked={formData.serviceId === s.id}
                        onChange={handleChange}
                        className="mt-1 text-navy-500 focus:ring-navy-400"
                      />
                      <div>
                        <div className="font-semibold text-sm text-navy-900">{s.title}</div>
                        <div className="text-xs text-navy-500">
                          PKR {s.pricePerUnit} / {s.unit} • {s.turnaroundTime}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  required
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Pickup Time Slot *
                </label>
                <select
                  name="pickupTimeSlot"
                  value={formData.pickupTimeSlot}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-600 uppercase mb-1.5">
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Special care for embroidered shirts, please deliver on hangers"
                  className="w-full px-4 py-2.5 rounded-xl border border-ice-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
                />
              </div>
            </div>
          </Card>

          {/* Step 4: Payment Preference */}
          <Card className="p-6 sm:p-8 border-ice-200 space-y-4">
            <h2 className="font-poppins font-semibold text-lg text-navy-500">
              4. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'cash_on_delivery', title: 'Cash on Delivery (COD)', desc: 'Pay cash to rider upon delivery' },
                { id: 'easypaisa_jazzcash', title: 'JazzCash / EasyPaisa', desc: 'Direct digital transfer at delivery' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.paymentMethod === m.id
                      ? 'border-aqua-400 bg-aqua-50/40 ring-1 ring-aqua-400'
                      : 'border-ice-200 bg-white hover:border-ice-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={formData.paymentMethod === m.id}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold text-xs text-navy-900">{m.title}</div>
                    <div className="text-[11px] text-navy-500">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full font-semibold shadow-md shadow-navy-500/20"
            >
              Confirm & Schedule Doorstep Pickup
            </Button>
            <p className="text-center text-xs text-navy-400 mt-3">
              No advance payment required. Free cancellation anytime before pickup.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

