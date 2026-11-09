import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarCheck, 
  Truck, 
  Sparkles, 
  PackageCheck, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Droplets, 
  Flame, 
  HeartHandshake, 
  Gift, 
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';
import { SEO } from '@/components/common/SEO';

export const HowItWorksPage: React.FC = () => {
  // Custom Washing Machine Icon matching brand geometry
  const WashingMachineIcon = () => (
    <svg 
      className="w-7 h-7 text-navy-500" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="20" x="3" y="2" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <path d="M12 10a3 3 0 0 1 3 3" />
      <circle cx="7.5" cy="5.5" r=".5" fill="currentColor" />
      <circle cx="10" cy="5.5" r=".5" fill="currentColor" />
    </svg>
  );

  const steps = [
    {
      number: '01',
      title: 'BOOK',
      subtitle: 'Schedule in 60 Seconds',
      description:
        'Book through our website, chatbot, or simply call or message us. Choose your preferred pickup date and time.',
      icon: <CalendarCheck className="w-7 h-7 text-navy-500" />,
      tag: 'Step 1 • Online / Phone',
      details: 'Select a morning, afternoon, or evening time slot that fits your day.',
    },
    {
      number: '02',
      title: 'PICKUP',
      subtitle: 'Doorstep Collection',
      description:
        'Our team collects your laundry directly from your doorstep. Your first pickup is FREE.',
      icon: <Truck className="w-7 h-7 text-aqua-600" />,
      tag: 'Step 2 • Doorstep in Kasur',
      details: 'Our rider arrives with a sanitized laundry bag right at your gate.',
      highlight: 'First Pickup is FREE!',
    },
    {
      number: '03',
      title: 'WASH & IRON',
      subtitle: 'Hygienic Care & Steam Press',
      description:
        'We wash your clothes, iron them neatly and handle your laundry with care.',
      icon: <WashingMachineIcon />,
      tag: 'Step 3 • Expert Processing',
      details: 'Separated cycles with treated water, followed by commercial steam ironing.',
    },
    {
      number: '04',
      title: 'RETURN',
      subtitle: 'Fresh & Crisp at Your Door',
      description:
        'We deliver your fresh, clean clothes back to your doorstep the same or next day.',
      icon: <PackageCheck className="w-7 h-7 text-emerald-600" />,
      tag: 'Step 4 • On-Time Return',
      details: 'Delivered folded or on hangers, ready to wear for your week.',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save 5+ Hours Every Week',
      description:
        'Reclaim your precious weekends. No more soaking, scrubbing, line drying, or standing over a hot iron for hours.',
    },
    {
      icon: ShieldCheck,
      title: '100% Segregated Washing',
      description:
        'Your clothes are strictly washed in dedicated machine cycles. We never mix laundry between different households.',
    },
    {
      icon: Flame,
      title: 'High-Heat Steam Pressing',
      description:
        'Commercial boilers sanitize fabrics, eliminate 99.9% of bacteria, and create razor-sharp collars, cuffs, and pleats.',
    },
    {
      icon: Droplets,
      title: 'Treated Water & Color Care',
      description:
        'Specialized soft water treatment and color-safe detergents protect delicate embroidery, lawn, and traditional cotton fabrics.',
    },
    {
      icon: Truck,
      title: 'Direct Doorstep Logistics',
      description:
        'Courteous, punctual riders cover Model Town, Steel Bagh, Railway Road, and all Kasur neighborhoods on daily morning and evening rounds.',
    },
    {
      icon: HeartHandshake,
      title: 'Pay Upon Safe Delivery',
      description:
        'Zero advance payment required. Inspect your clean garments and pay conveniently with Cash on Delivery or JazzCash / EasyPaisa.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="How Pickup Wash Works - 4 Easy Steps"
        description="Learn how Pickup Wash works: 1. Schedule online, 2. Doorstep collection, 3. Hygienic washing & steam pressing, 4. Fresh doorstep delivery in Kasur."
      />
      
      {/* =========================================================================
          1. HERO BANNER
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
              Simple • Reliable • Doorstep
            </span>
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.12]">
            How Pickup Wash Works
          </h1>

          <p className="font-poppins font-medium text-lg sm:text-xl text-darkNavy/85 max-w-2xl mx-auto leading-normal">
            “Four simple steps to fresh, clean clothes without leaving your home.”
          </p>

          <p className="font-inter text-sm sm:text-base text-darkNavy/70 max-w-2xl mx-auto leading-relaxed pt-1">
            Say goodbye to carrying heavy laundry bundles through Kasur traffic. From scheduling to doorstep return, here is how we take complete care of your clothes.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/book">
              <Button
                variant="accent"
                size="md"
                className="gap-2 font-bold shadow-aqua text-darkNavy hover:text-white"
              >
                <CalendarCheck className="w-4 h-4 text-darkNavy" />
                <span>Book Your Pickup</span>
              </Button>
            </Link>

            <a href={`tel:${BUSINESS_INFO.phone}`}>
              <Button
                variant="secondary"
                size="md"
                className="gap-2 text-navy-500 border-ice-300 shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-aqua-600" />
                <span>Call Helpline: {BUSINESS_INFO.phone}</span>
              </Button>
            </a>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. WELCOMING INTRODUCTION
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
                  Effortless Laundry in Kasur
                </span>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight leading-tight">
                  Designed for Busy Families, Working Professionals & Students
                </h2>
                <p className="text-sm sm:text-base text-darkNavy/80 leading-relaxed">
                  Keeping Shalwar Kameez, office shirts, children's school uniforms, and daily casual wear in pristine condition takes hours of soaking, scrubbing, and hot ironing every single week.
                </p>
                <p className="text-sm text-darkNavy/70 leading-relaxed">
                  Pickup Wash was built specifically for Kasur City to eliminate this burden. With our seamless 4-step process, you can schedule a pickup in seconds, hand your laundry bag to our rider at your gate, and receive your clothes back sanitized, crisp, and beautifully pressed.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-navy-500 flex items-center justify-center shrink-0 shadow-sm border border-ice-200">
                    <Gift className="w-5 h-5 text-aqua-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-navy-500">First Pickup is FREE</h4>
                    <p className="text-xs text-darkNavy/70 mt-0.5 leading-normal">
                      Try our doorstep service with zero pickup charge on your very first order.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-navy-500 flex items-center justify-center shrink-0 shadow-sm border border-ice-200">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-navy-500">All Kasur Areas Covered</h4>
                    <p className="text-xs text-darkNavy/70 mt-0.5 leading-normal">
                      Active daily rounds in Model Town, Steel Bagh, Railway Road, and all union councils.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. FOUR-STEP PROCESS TIMELINE (DESKTOP HORIZONTAL & MOBILE VERTICAL)
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              The 4-Step Journey
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              From Your Doorstep & Back Fresh
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Follow the simple lifecycle of your laundry with Pickup Wash.
            </p>
          </div>

          {/* Desktop Timeline Flow (lg:block) */}
          <div className="hidden lg:block relative mb-12">
            {/* Connecting Line between steps */}
            <div 
              className="absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-navy-500 via-aqua-400 to-emerald-500 -translate-y-8 z-0 opacity-40 rounded-full" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-4 gap-6 relative z-10">
              {steps.map((st, idx) => (
                <div
                  key={st.number}
                  className="bg-white rounded-3xl p-6 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Step Number & Icon Node */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-ice-100 text-navy-500 border border-ice-200 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors shadow-sm">
                        {st.icon}
                      </div>

                      <span className="font-poppins font-extrabold text-3xl text-ice-300 group-hover:text-aqua-400 transition-colors">
                        {st.number}
                      </span>
                    </div>

                    {/* Step Tag */}
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ice-50 text-navy-600 border border-ice-200 mb-2">
                      {st.tag}
                    </span>

                    {/* Title & Subtitle */}
                    <h3 className="font-poppins font-bold text-xl text-navy-500 tracking-tight mb-1">
                      {st.title}
                    </h3>
                    <p className="text-xs font-semibold text-aqua-600 mb-3">
                      {st.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-darkNavy/80 leading-relaxed mb-4">
                      {st.description}
                    </p>
                  </div>

                  {/* Micro Detail Pill */}
                  <div className="pt-3 border-t border-ice-100">
                    <span className="text-[11px] text-darkNavy/65 block leading-normal">
                      {st.details}
                    </span>
                    {st.highlight && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {st.highlight}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile & Tablet Vertical Timeline (< lg) */}
          <div className="lg:hidden relative pl-6 sm:pl-8 space-y-6">
            {/* Vertical Connecting Line */}
            <div 
              className="absolute top-4 bottom-4 left-2.5 sm:left-3.5 w-1 bg-gradient-to-b from-navy-500 via-aqua-400 to-emerald-500 rounded-full opacity-40" 
              aria-hidden="true" 
            />

            {steps.map((st) => (
              <div
                key={st.number}
                className="relative bg-white rounded-3xl p-6 border border-ice-200 shadow-soft space-y-4"
              >
                {/* Node Pill on the Line */}
                <div 
                  className="absolute -left-6 sm:-left-8 top-6 w-8 h-8 rounded-full bg-navy-500 text-white font-poppins font-bold text-xs flex items-center justify-center border-4 border-ice-100 shadow-sm"
                  aria-hidden="true"
                >
                  {st.number}
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center">
                    {st.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-ice-50 text-navy-600 border border-ice-200">
                    {st.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-poppins font-bold text-lg text-navy-500">
                    {st.title}
                  </h3>
                  <p className="text-xs font-semibold text-aqua-600 mb-2">
                    {st.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-darkNavy/80 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-ice-100 text-xs text-darkNavy/65">
                  {st.details}
                  {st.highlight && (
                    <span className="inline-block mt-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {st.highlight}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. BENEFITS OF DOORSTEP LAUNDRY SERVICE
         ========================================================================= */}
      <section className="bg-white py-16 sm:py-20 border-y border-ice-200/80">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              Customer Advantages
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Benefits of Doorstep Laundry
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Everything crafted to make your life simpler, cleaner, and more relaxed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-ice-50/70 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-aqua-200 transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-navy-500 shadow-sm border border-ice-200 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-aqua-600" />
                  </div>
                  <h3 className="font-poppins font-bold text-base sm:text-lg text-navy-500">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-darkNavy/75 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. FIRST PICKUP FREE PROMOTIONAL SECTION
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-aqua-300 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-aqua-100/60 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-3.5 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aqua-50 text-aqua-800 text-xs font-bold border border-aqua-200">
                  <Gift className="w-4 h-4 text-aqua-600" />
                  <span>Welcome Offer for Kasur Residents</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight">
                  Your First Doorstep Pickup is Completely FREE!
                </h2>

                <p className="text-xs sm:text-sm text-darkNavy/80 max-w-2xl leading-relaxed">
                  Try Pickup Wash with zero risk. We collect your laundry from your gate in Kasur, weigh or count it transparently, wash and steam press with care, and deliver it back fresh. There is no pickup charge on your very first order!
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-navy-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    No Subscription Required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    No Advance Payment
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Valid on Any Service
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <Link to="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full sm:w-auto px-8 py-4 font-bold shadow-aqua text-darkNavy text-base"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Claim Free Pickup
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          6. BOOK YOUR PICKUP CTA BANNER
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="rounded-3xl bg-gradient-to-r from-navy-500 via-navy-600 to-navy-700 text-white p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div 
              className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-80 h-80 bg-aqua-400/20 rounded-full blur-3xl pointer-events-none" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready in Kasur City</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  Book Your Pickup Today
                </h2>

                <p className="text-ice-200/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                  Experience the easiest laundry day of your life. Tell us where to collect your laundry in Kasur, and let our team handle washing, drying, steam press, and delivery.
                </p>

                {/* Kasur Neighborhoods Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-white">
                  <span className="text-aqua-300 text-xs font-semibold mr-1">Serving:</span>
                  {KASUR_SERVICE_AREAS.slice(0, 6).map((area) => (
                    <span key={area} className="px-2.5 py-0.5 rounded-lg bg-white/10 text-ice-200 text-[11px]">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center lg:items-end">
                <Link to="/book" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="lg"
                    variant="accent"
                    fullWidth
                    className="gap-2.5 font-bold shadow-aqua text-darkNavy py-4 text-base"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Book Your Pickup
                  </Button>
                </Link>

                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="w-full sm:w-auto lg:w-full"
                >
                  <Button
                    size="md"
                    variant="secondary"
                    fullWidth
                    className="gap-2 text-xs text-navy-500 bg-white/95 hover:bg-white"
                    leftIcon={<PhoneCall className="w-4 h-4 text-aqua-600" />}
                  >
                    Call Helpline ({BUSINESS_INFO.phone})
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};

