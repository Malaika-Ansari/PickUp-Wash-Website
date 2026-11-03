import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Truck,
  Sparkles,
  Clock,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  MapPin,
  ArrowRight,
  Gift,
  Layers,
  Calendar,
  ThumbsUp,
  Smile,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const AboutPage: React.FC = () => {
  // Why Choose Pickup Wash 4 Core Pillars from requirement
  const whyChooseUs = [
    {
      id: 'convenience',
      icon: Truck,
      title: 'Convenience',
      subtitle: 'Doorstep laundry collection and delivery',
      description:
        'Say goodbye to lugging heavy bundles through Kasur traffic or visiting crowded shops. Our polite riders collect your clothes right from your gate and deliver them back cleanly packed.',
      tag: 'Doorstep Service',
      badgeColor: 'bg-aqua-50 text-aqua-800 border-aqua-200',
    },
    {
      id: 'time-saving',
      icon: Clock,
      title: 'Time-saving',
      subtitle: 'Spend more time on what matters',
      description:
        'Reclaim 5 to 10 hours every week previously lost to soaking, scrub-washing, hanging clothes, and standing over hot irons. Spend your precious time with family, studies, or your career.',
      tag: 'Save 5+ Hours',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'reliable-service',
      icon: ShieldCheck,
      title: 'Reliable Service',
      subtitle: 'Clear booking and customer policies',
      description:
        'Transparent rates in PKR, strict segregated batch washing (never mixed with other households), treated soft water, and straightforward customer-first service policies.',
      tag: '100% Segregated',
      badgeColor: 'bg-navy-50 text-navy-800 border-navy-200',
    },
    {
      id: 'flexible-options',
      icon: Layers,
      title: 'Flexible Options',
      subtitle: 'Monthly packages and express service',
      description:
        'Whether you need everyday wash & iron, an urgent outfit returned fast with express turnaround, or a cost-effective recurring monthly plan for your home, we have you covered.',
      tag: 'Tailored Plans',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  // Our Service Promise 5 commitments from requirement
  const servicePromises = [
    {
      title: 'Doorstep Pickup',
      desc: 'Punctual collection directly from your doorstep anywhere in Kasur City.',
      icon: Truck,
    },
    {
      title: 'Washing and Ironing',
      desc: 'Careful segregated machine washing and crisp commercial high-pressure steam pressing.',
      icon: Sparkles,
    },
    {
      title: 'Same or Next-Day Return',
      desc: 'Prompt turnaround so you never run out of clean clothes for work, school, or events.',
      icon: Clock,
    },
    {
      title: 'Free First Pickup',
      desc: 'Zero pickup charge on eligible first bookings to experience our convenience risk-free.',
      icon: Gift,
    },
    {
      title: 'Customer-Friendly Support',
      desc: 'Simple web booking, clear status updates, and responsive helpline assistance via phone & WhatsApp.',
      icon: HeartHandshake,
    },
  ];

  // 4-step process summary
  const processSteps = [
    {
      step: '01',
      title: 'Schedule',
      desc: 'Book your pickup online or call our helpline with your preferred slot.',
    },
    {
      step: '02',
      title: 'Doorstep Pickup',
      desc: 'Our rider collects your laundry bag directly from your home in Kasur.',
    },
    {
      step: '03',
      title: 'Wash & Steam Iron',
      desc: 'Handled with fabric-safe detergents and sanitized steam pressing.',
    },
    {
      step: '04',
      title: 'Fresh Return',
      desc: 'Delivered crisp, folded or on hangers back to your doorstep on time.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* =========================================================================
          1. ABOUT US HERO SECTION
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

        <Container size="xl" className="relative z-10 text-center max-w-4xl mx-auto space-y-5">
          {/* Brand Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-aqua-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
              About Pickup Wash • Kasur City, Pakistan
            </span>
          </div>

          {/* MAIN HEADING (Exact prompt requirement) */}
          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
            Making Laundry Easier, <br className="hidden sm:inline" />
            <span className="text-aqua-600">One Pickup at a Time.</span>
          </h1>

          {/* BRAND SLOGAN (Exact prompt requirement) */}
          <div className="inline-block px-4 py-2 rounded-2xl bg-white/80 border border-aqua-200 shadow-sm">
            <p className="font-poppins font-semibold text-base sm:text-lg text-navy-600 tracking-wide">
              “Ghar baithe kapray dhulwayein, fikar chhor dein.”
            </p>
          </div>

          {/* INTRODUCTION (Exact prompt requirement) */}
          <p className="font-inter text-base sm:text-lg text-darkNavy/80 max-w-3xl mx-auto leading-relaxed pt-2">
            Pickup Wash is a convenient laundry service that collects clothes directly from your
            doorstep. We take your clothes from home, wash and iron them, and return them fresh and
            ready to wear. No queues, no carrying heavy laundry bags and no wasted time. Simply hand
            over your laundry and let us take care of the rest.
          </p>

          {/* Quick CTAs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link to="/book">
              <Button
                variant="accent"
                size="md"
                className="gap-2 font-bold shadow-aqua text-darkNavy hover:text-white"
                leftIcon={<CalendarCheck className="w-4 h-4 text-darkNavy" />}
              >
                Book a Pickup
              </Button>
            </Link>

            <Link to="/services">
              <Button
                variant="secondary"
                size="md"
                className="gap-2 text-navy-500 border-ice-300 shadow-sm"
                leftIcon={<Layers className="w-4 h-4 text-aqua-600" />}
              >
                Explore Our Services
              </Button>
            </Link>

            <a href={`tel:${BUSINESS_INFO.phone}`}>
              <Button
                variant="ghost"
                size="md"
                className="gap-2 text-navy-500 hover:bg-white/80"
                leftIcon={<PhoneCall className="w-4 h-4 text-emerald-600" />}
              >
                Call: {BUSINESS_INFO.phone}
              </Button>
            </a>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. OUR BRAND STORY SECTION
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-ice-200 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Brand Story Content */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Kasur City Doorstep Service</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight leading-tight">
                  Crafted for Kasur: Why We Built Pickup Wash
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-darkNavy/80 leading-relaxed font-inter">
                  <p>
                    For households, working professionals, and students across Kasur City, doing
                    laundry has always meant dedicating precious hours to soaking, heavy scrubbing,
                    line drying in variable weather, and standing over hot irons. For many others,
                    it involved carrying bulky laundry bags on motorcycles or in rickshaws to local
                    shops, followed by uncertain pickup delays.
                  </p>
                  <p>
                    Pickup Wash was built to replace that hassle with a dependable, technology-first
                    doorstep service. By combining reliable doorstep collection, treated soft-water
                    wash cycles, fabric-safe detergents, and crisp steam press finishing, we provide
                    a professional laundry experience that fits effortlessly into modern routines.
                  </p>
                  <p className="text-xs sm:text-sm text-darkNavy/70">
                    From Model Town to Steel Bagh and Railway Road, our courteous riders provide
                    scheduled pickups so your clothes are cared for and returned fresh without you
                    ever having to leave your home.
                  </p>
                </div>

                {/* Local Trust Badges */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-aqua-600 shrink-0" />
                    <span className="text-xs font-bold text-navy-600">Doorstep Collection</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-navy-600">100% Segregated</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-navy-500 shrink-0" />
                    <span className="text-xs font-bold text-navy-600">Kasur City Coverage</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Laundry Photography */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-ice-200 bg-ice-100 aspect-[4/3] sm:aspect-square group">
                  <img
                    src="/images/about-laundry-care.jpg"
                    alt="Neatly folded clean laundry and fresh towels - Pickup Wash Kasur"
                    onError={(e) => {
                      // Fallback to existing hero photography if specific about image is loading
                      (e.currentTarget as HTMLImageElement).src = '/images/hero-laundry.jpg';
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Gradient Overlay for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-700/80 via-transparent to-transparent pointer-events-none" />

                  {/* Float pill on the image */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-darkNavy">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ice-100 text-aqua-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-poppins font-bold text-xs sm:text-sm text-navy-500">
                          Hygienic Care & Crisp Steam Press
                        </p>
                        <p className="text-[11px] text-darkNavy/70">
                          Treated water, fabric-safe soap & sanitized cycles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background shape */}
                <div
                  className="absolute -bottom-6 -right-6 w-48 h-48 bg-aqua-200/40 rounded-full blur-2xl -z-10 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. MISSION AND SERVICE PROMISE
         ========================================================================= */}
      <section className="bg-ice-50 py-16 sm:py-20 border-y border-ice-200">
        <Container size="xl" className="space-y-12">
          {/* Mission Card */}
          <div className="bg-gradient-to-r from-navy-500 via-navy-600 to-navy-700 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-72 h-72 bg-aqua-400/20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-aqua-300">
                Our Mission
              </span>
              <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                “To make everyday laundry convenient and accessible by providing reliable doorstep
                pickup, careful washing, professional ironing and convenient delivery.”
              </h2>
              <p className="text-ice-200/90 text-sm sm:text-base leading-relaxed pt-1">
                We believe clean, well-ironed clothes give you confidence every day. Our goal is to
                make that standard effortless for every household and individual in Kasur.
              </p>
            </div>
          </div>

          {/* Service Promise Grid */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
                Our Commitment to You
              </span>
              <h3 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 tracking-tight">
                Our Service Promise
              </h3>
              <p className="text-xs sm:text-sm text-darkNavy/70">
                The standards we guarantee on every single pickup and order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {servicePromises.map((promise, idx) => {
                const Icon = promise.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-aqua-200 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
                        <Icon className="w-5 h-5 text-aqua-600" />
                      </div>
                      <h4 className="font-poppins font-bold text-sm text-navy-500 leading-snug">
                        {promise.title}
                      </h4>
                      <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">
                        {promise.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. WHY CHOOSE PICKUP WASH (4 CORE PILLARS)
         ========================================================================= */}
      <section>
        <Container size="xl" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              The Pickup Wash Advantage
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Why Choose Pickup Wash
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Built from the ground up to solve the real laundry pain points of Kasur City.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-7 sm:p-8 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 p-3.5 rounded-2xl bg-ice-100 text-navy-500 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors shadow-sm border border-ice-200/80">
                        <Icon className="w-6 h-6 text-navy-500 group-hover:text-aqua-800" />
                      </div>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeColor}`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-poppins font-bold text-xl text-navy-500 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-aqua-600 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-darkNavy/80 leading-relaxed font-inter">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-ice-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-darkNavy/60">
                      Standard across all Kasur orders
                    </span>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1 text-xs font-bold text-navy-500 hover:text-aqua-600 transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. OUR LAUNDRY SERVICE PROCESS (4 SIMPLE STAGES)
         ========================================================================= */}
      <section className="bg-white py-16 sm:py-20 border-y border-ice-200">
        <Container size="xl" className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
                Simple & Transparent
              </span>
              <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight mt-1">
                Our Laundry Service Process
              </h2>
              <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
                How your garments travel safely from your doorstep, through expert washing, and back clean.
              </p>
            </div>

            <Link to="/how-it-works">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Detailed 4-Step Process
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-ice-50/70 border border-ice-200 shadow-soft relative overflow-hidden group hover:border-aqua-200 transition-colors"
              >
                <span className="font-poppins font-extrabold text-4xl text-ice-200 absolute top-3 right-4 select-none group-hover:text-aqua-200 transition-colors">
                  {st.step}
                </span>
                <div className="space-y-2 relative z-10">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-aqua-700 bg-white px-2 py-0.5 rounded border border-ice-200">
                    Step {st.step}
                  </span>
                  <h3 className="font-poppins font-bold text-base text-navy-500">{st.title}</h3>
                  <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          6. BOOK NOW CTA BANNER
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
                {/* Free pickup offer pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold backdrop-blur-sm">
                  <Gift className="w-3.5 h-3.5 text-aqua-300" />
                  <span>Welcome to Pickup Wash Kasur • First Pickup is FREE!</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  Ready for Effortless Laundry?
                </h2>

                <p className="text-ice-200/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                  Join families, working professionals, and students across Kasur who have given up
                  the chore of washing and ironing. Book your doorstep pickup in 60 seconds.
                </p>

                {/* Kasur Neighborhoods Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-white">
                  <span className="text-aqua-300 text-xs font-semibold mr-1">Doorstep pickup in:</span>
                  {KASUR_SERVICE_AREAS.slice(0, 6).map((area) => (
                    <span
                      key={area}
                      className="px-2.5 py-0.5 rounded-lg bg-white/10 text-ice-200 text-[11px]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center lg:items-end">
                <Link to="/book" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="lg"
                    variant="accent"
                    fullWidth
                    className="gap-2.5 font-bold shadow-aqua text-darkNavy py-4 text-base"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Book Your Pickup Now
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
