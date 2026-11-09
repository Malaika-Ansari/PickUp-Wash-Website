import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  Calendar,
  Truck,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  Gift,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';
import { catalogService } from '@/services/catalogService';
import { ServiceRecord, MonthlyPackageRecord, PromotionRecord } from '@/types';
import { SEO } from '@/components/common/SEO';

export const PricingPage: React.FC = () => {
  const [activeServices, setActiveServices] = useState<ServiceRecord[]>([]);
  const [activePackages, setActivePackages] = useState<MonthlyPackageRecord[]>([]);
  const [firstPickupPromo, setFirstPickupPromo] = useState<PromotionRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPricingData() {
      try {
        const [srvRes, pkgRes, promoRes] = await Promise.all([
          catalogService.getActiveServices(),
          catalogService.getActiveMonthlyPackages(),
          catalogService.getFirstPickupPromotion(),
        ]);
        if (isMounted) {
          setActiveServices(srvRes.services);
          setActivePackages(pkgRes.packages);
          setFirstPickupPromo(promoRes);
        }
      } catch (err) {
        console.warn('Error loading PricingPage data:', err);
      }
    }
    loadPricingData();
    return () => {
      isMounted = false;
    };
  }, []);
  // Custom Washing Machine SVG icon matching brand geometry
  const WashingMachineIcon = () => (
    <svg
      className="w-7 h-7 text-navy-500 group-hover:text-aqua-800 transition-colors"
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

  // The 4 Core Service Pricing Cards required by prompt
  const serviceCards = [
    {
      id: 'wash-and-iron',
      title: 'Wash & Iron',
      tagline: 'Complete everyday wardrobe care',
      description:
        'Complete laundry care, including washing, ironing and careful folding of everyday clothes.',
      icon: <WashingMachineIcon />,
      rateDisplay: 'Contact Us for Current Rates',
      actionText: 'Book Wash & Iron',
      actionLink: '/book?service=wash-and-iron',
      badge: 'Popular Choice',
      badgeClass: 'bg-aqua-50 text-aqua-800 border-aqua-200',
      highlights: [
        'Dedicated separated machine wash',
        'Fabric softening & anti-bacterial rinse',
        'Crisp steam press on collars and pleats',
        'Neatly folded or delivered on hangers',
      ],
    },
    {
      id: 'express-service',
      title: 'Express Service',
      tagline: 'Faster turnaround for urgent needs',
      description:
        'Faster laundry service for customers with urgent laundry needs. Availability and timing can be confirmed during booking.',
      icon: <Clock className="w-7 h-7 text-aqua-600 group-hover:text-aqua-800 transition-colors" />,
      rateDisplay: 'Contact Us for Current Rates',
      actionText: 'Book Express Service',
      actionLink: '/book?service=express-service',
      badge: 'Urgent Care',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      highlights: [
        'Prioritized queue jump in processing',
        'Fast-track washing and steam press',
        'Direct rider dispatch across Kasur',
        'Timing confirmed during booking',
      ],
    },
    {
      id: 'monthly-packages',
      title: 'Monthly Packages',
      tagline: 'Consistent routine for regular households',
      description:
        'Convenient laundry packages for regular households. Contact us to explore available plans and package details.',
      icon: <Calendar className="w-7 h-7 text-navy-500 group-hover:text-aqua-800 transition-colors" />,
      rateDisplay: 'Contact Us for Current Rates',
      actionText: 'Get Package Details',
      actionLink: '#monthly-packages',
      badge: 'Household Plan',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      highlights: [
        'Scheduled weekly doorstep pickups',
        'Hassle-free laundry routine for families',
        'Customized to your household size',
        'Dedicated customer support hotline',
      ],
    },
    {
      id: 'pickup-and-delivery',
      title: 'Pickup & Delivery',
      tagline: 'Direct doorstep collection & return',
      description:
        'We collect your laundry from your doorstep and return it fresh and clean.',
      icon: <Truck className="w-7 h-7 text-emerald-600 group-hover:text-aqua-800 transition-colors" />,
      rateDisplay: 'Contact Us for Current Rates',
      actionText: 'Book a Pickup',
      actionLink: '/book',
      badge: 'Kasur Doorstep',
      badgeClass: 'bg-navy-50 text-navy-800 border-navy-200',
      highlights: [
        'Collected directly from your gate',
        'Sanitized, clean laundry bags provided',
        'Coverage throughout Kasur City',
        'Returned fresh, crisp and ready to wear',
      ],
    },
  ];

  const displayedServiceCards = useMemo(() => {
    if (activeServices.length === 0) return serviceCards;

    return activeServices.map((srv) => {
      const match = serviceCards.find(
        (c) => c.id === srv.slug || c.title.toLowerCase() === srv.service_name.toLowerCase()
      );

      let rateDisplay = 'Contact Us for Current Rates';
      if (srv.is_pricing_active && srv.price_per_kg != null) {
        rateDisplay = `PKR ${srv.price_per_kg} / kg`;
      } else if (srv.is_pricing_active && srv.base_price != null) {
        rateDisplay = `From PKR ${srv.base_price}`;
      }

      if (match) {
        return {
          ...match,
          title: srv.service_name,
          description: srv.description || match.description,
          rateDisplay,
        };
      }

      return {
        id: srv.slug,
        title: srv.service_name,
        tagline: srv.turnaround_time || 'Quality Doorstep Care',
        description: srv.description,
        icon: <WashingMachineIcon />,
        rateDisplay,
        actionText: `Book ${srv.service_name}`,
        actionLink: `/book?service=${srv.slug}`,
        badge: 'Kasur Care',
        badgeClass: 'bg-ice-100 text-navy-800 border-ice-200',
        highlights: [
          'Hygienic individual machine wash',
          'Anti-bacterial softening treatment',
          'Crisp steam pressing',
          'Fast doorstep return in Kasur',
        ],
      };
    });
  }, [activeServices]);

  const handlePackageScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('monthly-packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="Laundry Rates & Monthly Packages"
        description="Transparent laundry pricing and affordable monthly plans for households and students in Kasur. Zero hidden charges, free first pickup."
      />
      {/* =========================================================================
          1. HERO SECTION
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

        <Container size="xl" className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-aqua-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
              Pricing & Packages • Kasur City, Pakistan
            </span>
          </div>

          {/* Heading: Exact prompt requirement */}
          <h1 className="font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
            Simple Laundry Solutions <br className="hidden sm:inline" />
            <span className="text-aqua-600">That Fit Your Budget</span>
          </h1>

          {/* Supporting Text: Exact prompt requirement */}
          <p className="font-inter text-base sm:text-lg text-darkNavy/80 max-w-2xl mx-auto leading-relaxed pt-1">
            Enjoy convenient doorstep laundry services with affordable pricing and flexible packages.
          </p>

          {/* Quick CTA Buttons */}
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

            <a href="#monthly-packages" onClick={handlePackageScroll}>
              <Button
                variant="secondary"
                size="md"
                className="gap-2 text-navy-500 border-ice-300 shadow-sm"
                leftIcon={<Calendar className="w-4 h-4 text-aqua-600" />}
              >
                Explore Monthly Packages
              </Button>
            </a>

            <Link to="/contact">
              <Button
                variant="ghost"
                size="md"
                className="gap-2 text-navy-500 hover:bg-white/80"
                leftIcon={<PhoneCall className="w-4 h-4 text-emerald-600" />}
              >
                Inquire Current Rates
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. SERVICE PRICING CARDS
         ========================================================================= */}
      <section>
        <Container size="xl" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              Transparent & Affordable
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Our Service Offerings
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Clear laundry care tailored for households, professionals, and students in Kasur.
            </p>
          </div>

          {/* 4 Cards Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedServiceCards.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft hover:shadow-soft-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Icon & Badge Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-13 h-13 p-3.5 rounded-2xl bg-ice-100 text-navy-500 group-hover:bg-aqua-100 transition-colors shadow-sm border border-ice-200/80">
                      {service.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${service.badgeClass}`}
                    >
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-navy-500 tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-darkNavy/60 mt-0.5">
                      {service.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-darkNavy/75 leading-relaxed font-inter">
                    {service.description}
                  </p>

                  {/* Pricing Callout Box: Prominently displays "Contact Us for Current Rates" */}
                  <div className="p-3.5 rounded-2xl bg-ice-50/80 border border-ice-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-navy-400 block">
                      Pricing Rate
                    </span>
                    <p className="font-poppins font-bold text-sm text-navy-600">
                      {service.rateDisplay}
                    </p>
                    <p className="text-[11px] text-darkNavy/65">
                      Affordable rates with no hidden charges
                    </p>
                  </div>

                  {/* Feature Highlights List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block">
                      Includes
                    </span>
                    <ul className="space-y-1.5 text-xs text-darkNavy/75">
                      {service.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-aqua-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-6 border-t border-ice-100">
                  {service.actionLink.startsWith('#') ? (
                    <a
                      href={service.actionLink}
                      onClick={handlePackageScroll}
                      className="block w-full"
                    >
                      <Button variant="secondary" fullWidth size="sm" className="gap-2">
                        <span>{service.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  ) : (
                    <Link to={service.actionLink} className="block w-full">
                      <Button
                        variant={service.id === 'wash-and-iron' ? 'accent' : 'secondary'}
                        fullWidth
                        size="sm"
                        className={
                          service.id === 'wash-and-iron'
                            ? 'gap-2 font-bold text-darkNavy shadow-aqua'
                            : 'gap-2'
                        }
                      >
                        <span>{service.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. MONTHLY PACKAGES SPOTLIGHT
         ========================================================================= */}
      <section id="monthly-packages" className="scroll-mt-24">
        <Container size="xl">
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-ice-200 shadow-soft relative overflow-hidden">
            {/* Background ambient decorative shapes */}
            <div
              className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-aqua-100/60 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: Monthly Package Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-navy-600 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-aqua-600" />
                  <span>Household Laundry Packages</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight leading-tight">
                  Convenient Monthly Packages for Regular Households
                </h2>

                <p className="text-sm sm:text-base text-darkNavy/80 leading-relaxed font-inter">
                  Managing weekly laundry for a whole household takes considerable time and effort.
                  Pickup Wash offers flexible monthly package options designed to give families,
                  students, and busy professionals predictable, recurring laundry care without the
                  daily hassle.
                </p>

                <p className="text-xs sm:text-sm text-darkNavy/70 leading-relaxed font-inter">
                  Customers can contact Pickup Wash directly to learn about package details, pickup
                  schedules, and pricing plans tailored specifically to their household needs.
                </p>

                {/* Key Benefits of Monthly Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-aqua-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-poppins font-semibold text-xs sm:text-sm text-navy-500">
                        Scheduled Weekly Pickups
                      </h4>
                      <p className="text-[11px] text-darkNavy/70 mt-0.5">
                        Set a recurring pickup day that fits your family routine.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-ice-50 border border-ice-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-poppins font-semibold text-xs sm:text-sm text-navy-500">
                        Tailored for Kasur Homes
                      </h4>
                      <p className="text-[11px] text-darkNavy/70 mt-0.5">
                        Custom plans adapted for small to large households.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Monthly Package Plans from Supabase */}
                {activePackages.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block">
                      Active Household Plans ({activePackages.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activePackages.map((pkg) => (
                        <div key={pkg.id} className="p-3 rounded-2xl bg-ice-50 border border-ice-200 flex flex-col justify-between space-y-1">
                          <div>
                            <h5 className="font-poppins font-bold text-xs text-darkNavy">{pkg.package_name}</h5>
                            <p className="text-[11px] text-navy-600 line-clamp-2 mt-0.5">{pkg.description}</p>
                          </div>
                          <div className="pt-2 border-t border-ice-200/60 flex items-center justify-between text-[11px]">
                            <span className="text-navy-400 font-medium">Rate:</span>
                            <span className="font-mono font-bold text-aqua-700">
                              {pkg.price != null ? `PKR ${pkg.price.toLocaleString()} / mo` : 'Confirm with Kasur Hub'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* "Get Package Details" Button required by prompt */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link to="/contact">
                    <Button
                      variant="accent"
                      size="md"
                      className="gap-2 font-bold shadow-aqua text-darkNavy hover:text-white"
                      leftIcon={<MessageSquare className="w-4 h-4 text-darkNavy" />}
                    >
                      Get Package Details
                    </Button>
                  </Link>

                  <a href={`tel:${BUSINESS_INFO.phone}`}>
                    <Button
                      variant="secondary"
                      size="md"
                      className="gap-2 text-navy-500 border-ice-300"
                      leftIcon={<PhoneCall className="w-4 h-4 text-aqua-600" />}
                    >
                      Call Helpline: {BUSINESS_INFO.phone}
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right Column: Information Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-navy-500 to-navy-700 text-white shadow-xl space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>How Monthly Plans Work</span>
                  </div>

                  <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white">
                    Contact Us for Custom Package Quotes
                  </h3>

                  <p className="text-xs sm:text-sm text-ice-200/90 leading-relaxed font-inter">
                    Every household in Kasur has different laundry volumes. Whether you need
                    weekly Shalwar Kameez care, school uniforms, or bedding cleaned regularly, our
                    team will discuss the most convenient plan for you.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2 text-xs">
                    <p className="font-semibold text-aqua-300">Package Inquiries Include:</p>
                    <ul className="space-y-1 text-ice-100/90">
                      <li>• Pickup frequency (e.g. once or twice a week)</li>
                      <li>• Types of garments (Wash & Iron, casuals, or bedding)</li>
                      <li>• Turnaround timeline preference</li>
                    </ul>
                  </div>

                  <Link to="/contact" className="block">
                    <Button
                      variant="accent"
                      fullWidth
                      size="sm"
                      className="font-bold text-darkNavy shadow-aqua"
                    >
                      Get Package Details & Rates
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. SPECIAL OFFER: "YOUR FIRST PICKUP IS FREE!"
         ========================================================================= */}
      {firstPickupPromo?.is_active && (
        <section>
          <Container size="xl">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-aqua-300 shadow-soft relative overflow-hidden">
              {/* Ambient decorative glow */}
              <div
                className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-aqua-100/60 rounded-full blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-3.5 text-center lg:text-left">
                  {/* Special Offer Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aqua-50 text-aqua-800 text-xs font-bold border border-aqua-200">
                    <Gift className="w-4 h-4 text-aqua-600" />
                    <span>Welcome Offer for Kasur Residents</span>
                  </div>

                  {/* Highlight: Exact prompt requirement */}
                  <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy-500 tracking-tight">
                    {firstPickupPromo.title || 'Your First Pickup is FREE!'}
                  </h2>

                  <p className="text-xs sm:text-sm text-darkNavy/80 max-w-2xl leading-relaxed font-inter">
                    {firstPickupPromo.description ||
                      'Experience the convenience of doorstep laundry in Kasur with zero risk. We collect your laundry directly from your gate, wash and steam press with hygienic care, and return it fresh. Enjoy free pickup on your very first booking!'}
                  </p>

                  {/* Trust Badges */}
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

                {/* Clear Booking Button */}
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
      )}

      {/* =========================================================================
          5. CALL TO ACTION (CTA)
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
                  <span>Doorstep Laundry in Kasur</span>
                </div>

                {/* Heading: Exact prompt requirement */}
                <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  Ready to Make Laundry Easier?
                </h2>

                <p className="text-ice-200/90 text-sm sm:text-base max-w-2xl leading-relaxed font-inter">
                  Say goodbye to laundry chores. Schedule your pickup in seconds or contact us to
                  ask any questions about rates, service areas, or custom monthly plans.
                </p>

                {/* Service Neighborhood Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-white">
                  <span className="text-aqua-300 text-xs font-semibold mr-1">Doorstep pickup across:</span>
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

              {/* Action Buttons: "Book a Pickup" and "Contact Us" as required */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center lg:items-end">
                <Link to="/book" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="lg"
                    variant="accent"
                    fullWidth
                    className="gap-2.5 font-bold shadow-aqua text-darkNavy py-4 text-base"
                    leftIcon={<CalendarCheck className="w-5 h-5 text-darkNavy" />}
                  >
                    Book a Pickup
                  </Button>
                </Link>

                <Link to="/contact" className="w-full sm:w-auto lg:w-full">
                  <Button
                    size="md"
                    variant="secondary"
                    fullWidth
                    className="gap-2 text-xs text-navy-500 bg-white/95 hover:bg-white"
                    leftIcon={<MessageSquare className="w-4 h-4 text-aqua-600" />}
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
