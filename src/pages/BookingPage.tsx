import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Sparkles,
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Gift,
  CreditCard,
  FileText,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS, TIME_SLOTS } from '@/utils/constants';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/hooks/useAuth';

// Allowed services as requested by the prompt
type ServiceType = 'Wash & Iron' | 'Express Service' | 'Monthly Package';

// Payment methods as requested by the prompt
type PaymentMethodType = 'Cash on Delivery' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer';

interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  pickupAddress: string;
  area: string;
  laundryService: ServiceType;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
  paymentMethod: PaymentMethodType;
  agreedToPolicies: boolean;
}

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get today's date formatted as YYYY-MM-DD for min date attribute
  const today = new Date().toISOString().split('T')[0];

  // Map service param if user clicked from Services or Pricing page
  const initialService = (): ServiceType => {
    const param = searchParams.get('service');
    if (param === 'express-service') return 'Express Service';
    if (param === 'monthly-packages') return 'Monthly Package';
    return 'Wash & Iron';
  };

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    pickupAddress: '',
    area: KASUR_SERVICE_AREAS[0],
    laundryService: initialService(),
    pickupDate: today,
    pickupTime: TIME_SLOTS[0],
    specialInstructions: '',
    paymentMethod: 'Cash on Delivery',
    agreedToPolicies: false,
  });

  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Auto-fill authenticated customer details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        phoneNumber: prev.phoneNumber || user.phone_number || user.phone || '',
        email: prev.email || user.email || '',
        pickupAddress: prev.pickupAddress || user.address || '',
        area: prev.area || user.area || KASUR_SERVICE_AREAS[0],
      }));
    }
  }, [user]);

  // Sync service from search params if changed
  useEffect(() => {
    const param = searchParams.get('service');
    if (param === 'express-service') {
      setFormData((prev) => ({ ...prev, laundryService: 'Express Service' }));
    } else if (param === 'monthly-packages') {
      setFormData((prev) => ({ ...prev, laundryService: 'Monthly Package' }));
    } else if (param === 'wash-and-iron') {
      setFormData((prev) => ({ ...prev, laundryService: 'Wash & Iron' }));
    }
  }, [searchParams]);

  // Phone validation for Pakistani phone numbers
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Matches 03XXXXXXXXX (11 digits) or +923XXXXXXXXX / 00923XXXXXXXXX
    const pkRegex = /^(?:(?:\+92|0092)|0)?3\d{9}$/;
    return pkRegex.test(cleaned);
  };

  // Form field change handler
  const handleInputChange = (
    field: keyof BookingFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field if exists
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Validate all required fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Customer Full Name is required.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        'Please enter a valid Pakistani phone number (e.g. 0300 1234567 or +92 300 1234567).';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup Address (Street, House #, or Landmark) is required.';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Please select your area / locality in Kasur.';
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Preferred Pickup Date is required.';
    } else if (formData.pickupDate < today) {
      newErrors.pickupDate = 'Pickup date cannot be in the past.';
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Preferred Pickup Time is required.';
    }

    if (!formData.agreedToPolicies) {
      newErrors.agreedToPolicies =
        'You must agree to the booking details and service policies before scheduling.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission -> navigates to /booking-confirmation with state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create local demo order record so tracking works seamlessly
      const serviceIdMap: Record<ServiceType, string> = {
        'Wash & Iron': 'wash-and-iron',
        'Express Service': 'express-service',
        'Monthly Package': 'monthly-packages',
      };

      setSubmitError('');

      const result = await orderService.createOrder(
        {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          streetAddress: formData.pickupAddress,
          area: formData.area,
          serviceId: serviceIdMap[formData.laundryService] || 'wash-and-iron',
          pickupDate: formData.pickupDate,
          pickupTimeSlot: formData.pickupTime,
          specialInstructions: formData.specialInstructions,
          paymentMethod: formData.paymentMethod,
        },
        user?.id
      );

      if (!result.success && result.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      const trackingNumber =
        result.success && result.order ? result.order.trackingNumber : undefined;

      // Safely navigate to confirmation page passing state (not in public URL)
      navigate('/booking-confirmation', {
        state: {
          booking: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            pickupAddress: `${formData.pickupAddress}, ${formData.area}, Kasur`,
            area: formData.area,
            selectedService: formData.laundryService,
            pickupDate: formData.pickupDate,
            preferredPickupTime: formData.pickupTime,
            specialInstructions: formData.specialInstructions,
            paymentMethod: formData.paymentMethod,
            submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trackingNumber,
          },
        },
      });
    } catch (err: any) {
      console.error('Error submitting booking:', err);
      setSubmitError(err.message || 'An unexpected error occurred while scheduling your pickup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* =========================================================================
          1. HERO HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden bg-ice-100 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-ice-200/70">
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-aqua-200/40 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-ice-300/60 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <Container size="xl" className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-aqua-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
              Doorstep Collection • Kasur City
            </span>
          </div>

          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
            Book a Doorstep Pickup
          </h1>

          <p className="font-inter text-base sm:text-lg text-darkNavy/80 max-w-2xl mx-auto leading-relaxed pt-1">
            Tell us when and where in Kasur to collect your laundry. We wash, steam iron, and return
            your clothes fresh and crisp to your doorstep.
          </p>

          {/* Special Offer Highlight Banner in Hero */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-aqua-300 shadow-sm mt-2">
            <Gift className="w-5 h-5 text-aqua-600 shrink-0" />
            <span className="font-poppins font-bold text-sm sm:text-base text-navy-600">
              Special Offer: Your First Pickup is FREE!
            </span>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. MAIN BOOKING SECTION (FORM & BOOKING INFORMATION)
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-8">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white rounded-3xl p-6 sm:p-10 border border-ice-200 shadow-soft space-y-8"
              >
                <div className="border-b border-ice-100 pb-4">
                  <h2 className="font-poppins font-bold text-2xl text-navy-500">
                    Customer & Pickup Information
                  </h2>
                  <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
                    Please enter your contact information and pickup location in Kasur.
                  </p>
                </div>

                {/* Server / Network Error Alert */}
                {submitError && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-red-900">Submission Error</span>
                      <p className="font-inter leading-relaxed mt-0.5">{submitError}</p>
                    </div>
                  </div>
                )}

                {/* Summary Error Banner if validation fails */}
                {Object.keys(errors).length > 0 && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-red-900">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>Please correct the following errors before submitting:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-red-700">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1. Customer Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Customer Full Name"
                    required
                    htmlFor="booking-name"
                    error={errors.fullName}
                  >
                    <Input
                      id="booking-name"
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ahmad"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                      isError={Boolean(errors.fullName)}
                    />
                  </FormField>

                  <FormField
                    label="Phone Number"
                    required
                    htmlFor="booking-phone"
                    hint="Kasur mobile number"
                    error={errors.phoneNumber}
                  >
                    <Input
                      id="booking-phone"
                      type="tel"
                      required
                      placeholder="e.g. 0300 1234567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                      isError={Boolean(errors.phoneNumber)}
                    />
                  </FormField>
                </div>

                {/* 2. Email Address (Optional) */}
                <FormField
                  label="Email Address"
                  htmlFor="booking-email"
                  hint="Optional for receipts"
                  error={errors.email}
                >
                  <Input
                    id="booking-email"
                    type="email"
                    placeholder="customer@example.com (optional)"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    isError={Boolean(errors.email)}
                  />
                </FormField>

                {/* 3. Kasur Locality & Pickup Address */}
                <div className="space-y-5 pt-2 border-t border-ice-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      label="Area / Locality in Kasur"
                      required
                      htmlFor="booking-area"
                      error={errors.area}
                    >
                      <Select
                        id="booking-area"
                        required
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        leftIcon={<MapPin className="w-4 h-4" />}
                      >
                        {KASUR_SERVICE_AREAS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <div className="flex flex-col justify-end">
                      <span className="text-[11px] text-darkNavy/65 bg-ice-50 p-2.5 rounded-xl border border-ice-200 leading-normal">
                        📍 Riders cover all Kasur neighborhoods daily with morning and evening rounds.
                      </span>
                    </div>
                  </div>

                  <FormField
                    label="Pickup Address"
                    required
                    htmlFor="booking-address"
                    hint="House #, Street #, Nearest Landmark"
                    error={errors.pickupAddress}
                  >
                    <Textarea
                      id="booking-address"
                      required
                      rows={2}
                      placeholder="e.g. House #14, Street 2, Model Town, near PSO Petrol Pump"
                      value={formData.pickupAddress}
                      onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      isError={Boolean(errors.pickupAddress)}
                    />
                  </FormField>
                </div>

                {/* 4. Laundry Service Selector */}
                <div className="space-y-3 pt-2 border-t border-ice-100">
                  <label className="block text-xs font-semibold text-darkNavy uppercase tracking-wider select-none">
                    Laundry Service *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'Wash & Iron',
                        title: 'Wash & Iron',
                        desc: 'Complete washing, steam ironing & neat folding',
                        icon: Sparkles,
                      },
                      {
                        id: 'Express Service',
                        title: 'Express Service',
                        desc: 'Priority expedited turnaround for urgent needs',
                        icon: Clock,
                      },
                      {
                        id: 'Monthly Package',
                        title: 'Monthly Package',
                        desc: 'Scheduled weekly plan for households',
                        icon: Layers,
                      },
                    ].map((srv) => {
                      const Icon = srv.icon;
                      const isSelected = formData.laundryService === srv.id;

                      return (
                        <div
                          key={srv.id}
                          onClick={() => handleInputChange('laundryService', srv.id as ServiceType)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-aqua-400 bg-aqua-50/50 ring-2 ring-aqua-400/30 shadow-sm'
                              : 'border-ice-200 bg-white hover:border-ice-300'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-aqua-400 text-darkNavy'
                                    : 'bg-ice-100 text-navy-500'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <input
                                type="radio"
                                name="laundryServiceRadio"
                                checked={isSelected}
                                onChange={() => handleInputChange('laundryService', srv.id as ServiceType)}
                                className="text-aqua-600 focus:ring-aqua-400"
                              />
                            </div>

                            <h4 className="font-poppins font-bold text-sm text-navy-500">
                              {srv.title}
                            </h4>
                            <p className="text-[11px] text-darkNavy/70 leading-normal">
                              {srv.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Preferred Pickup Date & Time */}
                <div className="space-y-4 pt-2 border-t border-ice-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      label="Preferred Pickup Date"
                      required
                      htmlFor="booking-date"
                      error={errors.pickupDate}
                    >
                      <Input
                        id="booking-date"
                        type="date"
                        required
                        min={today}
                        value={formData.pickupDate}
                        onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        leftIcon={<CalendarCheck className="w-4 h-4" />}
                        isError={Boolean(errors.pickupDate)}
                      />
                    </FormField>

                    <FormField
                      label="Preferred Pickup Time"
                      required
                      htmlFor="booking-time"
                      error={errors.pickupTime}
                    >
                      <Select
                        id="booking-time"
                        required
                        value={formData.pickupTime}
                        onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                        leftIcon={<Clock className="w-4 h-4" />}
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>
                </div>

                {/* 6. Special Instructions (Optional) */}
                <div className="pt-2 border-t border-ice-100">
                  <FormField
                    label="Special Instructions"
                    htmlFor="booking-instructions"
                    hint="Optional"
                  >
                    <Textarea
                      id="booking-instructions"
                      rows={2}
                      placeholder="e.g. Extra care for lawn suit embroidery, delivery on hangers, gate access code..."
                      value={formData.specialInstructions}
                      onChange={(e) =>
                        handleInputChange('specialInstructions', e.target.value)
                      }
                    />
                  </FormField>
                </div>

                {/* 7. Agreement Checkbox (Required) */}
                <div className="pt-4 border-t border-ice-100">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      errors.agreedToPolicies
                        ? 'border-red-300 bg-red-50/30'
                        : formData.agreedToPolicies
                        ? 'border-aqua-300 bg-aqua-50/20'
                        : 'border-ice-200 bg-ice-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.agreedToPolicies}
                      onChange={(e) => handleInputChange('agreedToPolicies', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-ice-300 text-aqua-600 focus:ring-aqua-400"
                    />
                    <div className="text-xs text-darkNavy/80 leading-normal">
                      <span className="font-semibold text-navy-600">
                        I agree to the booking details and service policies.
                      </span>{' '}
                      I understand that service rates will be confirmed prior to washing and no
                      advance payment is required until safe delivery.
                    </div>
                  </label>

                  {errors.agreedToPolicies && (
                    <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.agreedToPolicies}</span>
                    </p>
                  )}
                </div>

                {/* 8. Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    className="font-bold text-darkNavy shadow-aqua text-base py-4"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Confirm Doorstep Pickup
                  </Button>
                  <p className="text-[11px] text-center text-darkNavy/60 mt-2.5">
                    🔒 Your details are safe with Pickup Wash. Free cancellation anytime within 3 hours.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Booking Information & Policies */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Free First Pickup Banner */}
              <div className="bg-white rounded-3xl p-6 border-2 border-aqua-300 shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-aqua-100/50 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aqua-50 text-aqua-800 text-xs font-bold border border-aqua-200">
                    <Gift className="w-4 h-4 text-aqua-600" />
                    <span>Welcome Promotion</span>
                  </div>

                  <h3 className="font-poppins font-extrabold text-xl text-navy-500">
                    Your First Pickup is FREE!
                  </h3>

                  <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">
                    We want every household in Kasur to experience hassle-free laundry. Enjoy zero
                    doorstep pickup charges on your eligible first booking.
                  </p>
                </div>
              </div>

              {/* 2. Rates Confirmation Notice */}
              <div className="bg-white rounded-3xl p-6 border border-ice-200 shadow-soft space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-aqua-600" />
                  </div>
                  <h4 className="font-poppins font-bold text-sm text-navy-500">
                    Service Rate Confirmation
                  </h4>
                </div>

                <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">
                  Current per-kilo and itemized service rates can be confirmed by contacting Pickup
                  Wash directly. Our rider will weigh or count your garments transparently at your
                  doorstep before processing.
                </p>

                <div className="pt-1">
                  <Link
                    to="/pricing"
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-600 hover:text-aqua-600 transition-colors"
                  >
                    <span>View Pricing & Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3. Available Payment Methods */}
              <div className="bg-white rounded-3xl p-6 border border-ice-200 shadow-soft space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-sm text-navy-500">
                      Accepted Payment Methods
                    </h4>
                    <p className="text-[11px] text-darkNavy/65">Pay upon safe delivery</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-darkNavy/80">
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-ice-50/70 border border-ice-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-navy-600">Cash on Delivery (COD)</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-ice-50/70 border border-ice-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-navy-600">JazzCash Digital Wallet</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-ice-50/70 border border-ice-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-navy-600">Easypaisa Digital Wallet</span>
                  </li>
                  <li className="flex items-center gap-2.5 p-2 rounded-xl bg-ice-50/70 border border-ice-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-navy-600">Direct Bank Transfer</span>
                  </li>
                </ul>
                <p className="text-[11px] text-darkNavy/60 leading-normal">
                  * No advance payment is required. You only pay after your clothes are washed,
                  ironed, and delivered to your hands.
                </p>
              </div>

              {/* 4. Need Assistance Helpline Card */}
              <div className="bg-navy-500 text-white rounded-3xl p-6 shadow-soft space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-aqua-300">
                  Kasur Customer Support
                </span>
                <h4 className="font-poppins font-bold text-base text-white">
                  Need Help with Your Booking?
                </h4>
                <p className="text-xs text-ice-200/90 leading-relaxed">
                  Have questions about specific fabric care or monthly household packages? Our team
                  is here to help.
                </p>
                <div className="pt-1">
                  <Link to="/contact">
                    <Button
                      size="sm"
                      variant="accent"
                      fullWidth
                      className="text-darkNavy font-bold shadow-aqua"
                    >
                      Contact Customer Support
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </Container>
      </section>
    </div>
  );
};
