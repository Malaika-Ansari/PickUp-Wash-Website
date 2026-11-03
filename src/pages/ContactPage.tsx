import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  Send,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic validation
    if (!form.fullName.trim() || !form.phone.trim() || !form.message.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, and Message.');
      return;
    }

    setIsSubmitting(true);
    // Simulate brief responsive feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setForm({
      fullName: '',
      phone: '',
      email: '',
      subject: 'General Inquiry',
      message: '',
    });
    setSubmitted(false);
    setErrorMessage('');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* =========================================================================
          1. HERO HEADER
         ========================================================================= */}
      <section className="relative overflow-hidden bg-ice-100 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-ice-200/70">
        {/* Soft background ambient blur circles */}
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
              Get in Touch • Kasur City, Pakistan
            </span>
          </div>

          {/* Heading: Exact prompt requirement */}
          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
            We're Here to Help!
          </h1>

          {/* Supporting Text: Exact prompt requirement */}
          <p className="font-inter text-base sm:text-lg text-darkNavy/80 max-w-2xl mx-auto leading-relaxed pt-1">
            Have questions about laundry pickup, delivery, or packages? Get in touch with Pickup
            Wash.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/book">
              <Button
                variant="accent"
                size="md"
                className="gap-2 font-bold shadow-aqua text-darkNavy hover:text-white"
                leftIcon={<CalendarCheck className="w-4 h-4 text-darkNavy" />}
              >
                Schedule a Pickup
              </Button>
            </Link>

            <Link to="/faq">
              <Button
                variant="secondary"
                size="md"
                className="gap-2 text-navy-500 border-ice-300 shadow-sm"
                leftIcon={<HelpCircle className="w-4 h-4 text-aqua-600" />}
              >
                Browse FAQ
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. MAIN CONTACT SECTION: INFO & FORM
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Contact Details, Location & WhatsApp Placeholder */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Service Location Card: Explicitly "Entire Kasur City, Pakistan" */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0 border border-ice-200">
                    <MapPin className="w-6 h-6 text-aqua-600" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-aqua-600 block">
                      Service Location
                    </span>
                    <h3 className="font-poppins font-bold text-xl text-navy-500 mt-0.5">
                      Entire Kasur City, Pakistan
                    </h3>
                    <p className="text-xs text-darkNavy/70 mt-1 leading-relaxed">
                      Our doorstep riders collect and deliver laundry across all neighborhoods,
                      hostels, and homes throughout Kasur.
                    </p>
                  </div>
                </div>

                {/* Neighborhood Badges */}
                <div className="p-4 rounded-2xl bg-ice-50/80 border border-ice-200 space-y-2.5">
                  <span className="text-xs font-semibold text-navy-700 block">
                    Active Doorstep Coverage Areas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {KASUR_SERVICE_AREAS.slice(0, 8).map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 rounded-lg bg-white text-navy-600 text-xs font-medium border border-ice-200 shadow-2xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-darkNavy/60 pt-1">
                    Plus all surrounding urban and residential union councils in Kasur.
                  </p>
                </div>
              </div>

              {/* Verified Business Address / Google Maps Notice */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0 border border-ice-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-base text-navy-500">
                      Physical Location Status
                    </h4>
                    <p className="text-xs text-darkNavy/70">
                      Doorstep Mobile Service Model
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-amber-900">
                    No physical walk-in counter address is currently registered.
                  </p>
                  <p className="text-amber-900/80">
                    Pickup Wash operates exclusively as an on-demand doorstep service throughout
                    Kasur City. A verified Google Maps pin will be published once our physical
                    intake hub is opened to walk-in customers.
                  </p>
                </div>
              </div>

              {/* WhatsApp Contact Section: Clearly marked placeholder */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-base text-navy-500">
                      WhatsApp Messaging Support
                    </h4>
                    <p className="text-xs text-darkNavy/70">
                      Quick inquiries & order confirmations
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-950">WhatsApp Business Status:</span>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Setup Pending
                    </span>
                  </div>

                  <p className="text-xs text-emerald-900 leading-relaxed font-inter">
                    Our direct WhatsApp business link is being configured. In the meantime, please
                    use the contact form on this page or our phone line to reach us.
                  </p>

                  {/* Placeholder button explicitly marked as placeholder */}
                  <div className="pt-1">
                    <Button
                      variant="secondary"
                      fullWidth
                      size="sm"
                      disabled
                      className="border-emerald-300 text-emerald-800 bg-white/90 cursor-not-allowed opacity-80"
                      leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
                    >
                      WhatsApp: [Number to be provided]
                    </Button>
                  </div>
                </div>
              </div>

              {/* Operating Hours & Hotline */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-aqua-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-base text-navy-500">
                      Operating Hours
                    </h4>
                    <p className="text-xs text-darkNavy/70">Kasur Customer Helpline</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-darkNavy/80">
                  <div className="flex justify-between py-1 border-b border-ice-100">
                    <span>Monday – Saturday</span>
                    <span className="font-semibold text-navy-600">8:00 AM – 9:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ice-100">
                    <span>Sunday</span>
                    <span className="font-semibold text-navy-600">10:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Customer Response</span>
                    <span className="font-semibold text-emerald-700">Within 30 Mins</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-ice-200 shadow-soft space-y-6">
                
                {submitted ? (
                  /* Form Submission Success State */
                  <div className="text-center py-10 space-y-5">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Message Sent Successfully
                      </span>
                      <h3 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500">
                        Thank You, {form.fullName}!
                      </h3>
                      <p className="text-sm text-darkNavy/75 max-w-md mx-auto leading-relaxed font-inter">
                        We have received your message regarding{' '}
                        <strong className="text-navy-600">"{form.subject}"</strong>. Our customer
                        support team in Kasur will get in touch with you at{' '}
                        <strong className="text-navy-600">{form.phone}</strong> shortly.
                      </p>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleReset}
                        className="text-xs"
                      >
                        Send Another Message
                      </Button>

                      <Link to="/book">
                        <Button
                          variant="accent"
                          size="md"
                          className="text-xs font-bold shadow-aqua text-darkNavy"
                          leftIcon={<CalendarCheck className="w-4 h-4 text-darkNavy" />}
                        >
                          Book a Pickup Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* The Contact Form */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="border-b border-ice-100 pb-4">
                      <h2 className="font-poppins font-bold text-2xl text-navy-500">
                        Send Us a Message
                      </h2>
                      <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
                        Fill out the details below and we will respond promptly during operating hours.
                      </p>
                    </div>

                    {errorMessage && (
                      <div
                        role="alert"
                        className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* 1. Full Name */}
                    <FormField label="Full Name" required htmlFor="contact-name">
                      <Input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Muhammad Usman"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </FormField>

                    {/* 2. Phone Number & 3. Email (optional) in responsive 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Phone Number" required htmlFor="contact-phone" hint="For pickup coordination">
                        <Input
                          id="contact-phone"
                          type="tel"
                          required
                          placeholder="e.g. 0300 1234567"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </FormField>

                      <FormField label="Email" htmlFor="contact-email" hint="Optional">
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="your.email@example.com (optional)"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </FormField>
                    </div>

                    {/* 4. Subject */}
                    <FormField label="Subject" required htmlFor="contact-subject">
                      <Select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Laundry Pickup & Delivery">Laundry Pickup & Delivery</option>
                        <option value="Monthly Packages & Family Plans">Monthly Packages & Family Plans</option>
                        <option value="Rates & Pricing Inquiry">Rates & Pricing Inquiry</option>
                        <option value="Express Service Availability">Express Service Availability</option>
                        <option value="Order Tracking / Support">Order Tracking / Support</option>
                        <option value="Other Question">Other Question</option>
                      </Select>
                    </FormField>

                    {/* 5. Message */}
                    <FormField label="Message" required htmlFor="contact-message">
                      <Textarea
                        id="contact-message"
                        required
                        rows={5}
                        placeholder="Please write your questions or requests here. Mention your neighborhood in Kasur if inquiring about pickup availability..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </FormField>

                    {/* 6. Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="accent"
                        size="lg"
                        fullWidth
                        isLoading={isSubmitting}
                        className="font-bold text-darkNavy shadow-aqua text-base py-3.5"
                        leftIcon={<Send className="w-5 h-5 text-darkNavy" />}
                      >
                        Submit Message
                      </Button>
                    </div>

                    <p className="text-[11px] text-center text-darkNavy/60 pt-1">
                      We respect your privacy. Your information is only used to respond to your inquiry.
                    </p>
                  </form>
                )}

              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. FAQ SHORTCUT BANNER
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="bg-ice-50 rounded-3xl p-8 border border-ice-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-poppins font-bold text-xl text-navy-500">
                Looking for Quick Answers?
              </h3>
              <p className="text-xs sm:text-sm text-darkNavy/70">
                Explore our Frequently Asked Questions covering service areas, turnaround times, rates, and policies.
              </p>
            </div>

            <Link to="/faq" className="shrink-0">
              <Button
                variant="secondary"
                size="md"
                className="gap-2 shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4 text-aqua-600" />}
              >
                Read All FAQs
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};
