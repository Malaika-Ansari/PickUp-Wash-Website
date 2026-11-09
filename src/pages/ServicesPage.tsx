import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  PhoneCall, 
  Droplets, 
  Flame, 
  HelpCircle,
  MapPin,
  CalendarCheck,
  Gift
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FOUR_MAIN_SERVICES, BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';
import { catalogService } from '@/services/catalogService';
import { ServiceRecord, PromotionRecord } from '@/types';
import { SEO } from '@/components/common/SEO';

export const ServicesPage: React.FC = () => {
  const [activeServices, setActiveServices] = useState<ServiceRecord[]>([]);
  const [firstPickupPromo, setFirstPickupPromo] = useState<PromotionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [srvRes, promoRes] = await Promise.all([
          catalogService.getActiveServices(),
          catalogService.getFirstPickupPromotion(),
        ]);
        if (isMounted) {
          setActiveServices(srvRes.services);
          setFirstPickupPromo(promoRes);
        }
      } catch (err) {
        console.warn('Error loading services for ServicesPage:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);
  const displayedServices = React.useMemo(() => {
    if (activeServices.length === 0) {
      return FOUR_MAIN_SERVICES;
    }
    return activeServices.map((srv) => {
      const match = FOUR_MAIN_SERVICES.find(
        (f) => f.id === srv.slug || f.title.toLowerCase() === srv.service_name.toLowerCase()
      );
      if (match) {
        return {
          ...match,
          id: srv.slug || match.id,
          title: srv.service_name.toUpperCase(),
          description: srv.description || match.description,
          timingNote: srv.turnaround_time || match.timingNote,
        };
      }
      return {
        id: srv.slug,
        title: srv.service_name.toUpperCase(),
        shortTitle: srv.service_name,
        description: srv.description,
        iconName: 'WashingMachine' as const,
        timingNote: srv.turnaround_time || '24–48h Return',
        popular: false,
        badge: undefined,
        features: [
          'Hygienic individual machine wash',
          'Fabric softening & anti-bacterial rinse',
          'High-pressure steam ironing',
          'Doorstep collection and delivery in Kasur',
        ],
      };
    });
  }, [activeServices]);

  // Custom Washing Machine Icon matching brand geometry
  const WashingMachineIcon = () => (
    <svg className="w-6 h-6 text-navy-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="20" x="3" y="2" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <path d="M12 10a3 3 0 0 1 3 3" />
      <circle cx="7.5" cy="5.5" r=".5" fill="currentColor" />
      <circle cx="10" cy="5.5" r=".5" fill="currentColor" />
    </svg>
  );

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'WashingMachine':
        return <WashingMachineIcon />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-aqua-600" />;
      case 'Calendar':
        return <Calendar className="w-6 h-6 text-navy-500" />;
      case 'Truck':
        return <Truck className="w-6 h-6 text-emerald-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-aqua-500" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="Our Laundry Services & Solutions"
        description="Explore wash & iron, express delivery, and monthly package subscriptions tailored for homes and professionals in Kasur City, Pakistan."
      />
      
      {/* =========================================================================
          1. SERVICES HERO BANNER
         ========================================================================= */}
      <section className="relative overflow-hidden bg-ice-100 pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-ice-200/70">
        {/* Soft background glow circles */}
        <div className="absolute top-0 right-0 -mr-20 w-80 h-80 bg-aqua-200/40 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 -ml-20 w-80 h-80 bg-ice-300/50 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <Container size="xl" className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-aqua-400" />
            <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
              Doorstep Fabric Care in Kasur
            </span>
          </div>

          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.12]">
            Our Laundry Services
          </h1>

          <p className="font-poppins font-medium text-lg sm:text-xl text-darkNavy/85 max-w-2xl mx-auto">
            “Everything your wardrobe needs, without leaving home.”
          </p>

          <p className="font-inter text-sm sm:text-base text-darkNavy/70 max-w-2xl mx-auto leading-relaxed pt-1">
            We collect your clothes directly from your doorstep anywhere in Kasur City, wash with fabric-safe solutions, steam press with precision, and return them clean and fresh.
          </p>

          {/* Quick Kasur Benefits Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            {firstPickupPromo?.is_active && (
              <span className="px-3 py-1 rounded-full bg-aqua-100 text-aqua-900 border border-aqua-300 shadow-card flex items-center gap-1.5 font-bold">
                <Gift className="w-3.5 h-3.5 text-aqua-700" />
                First Pickup is FREE!
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-white text-navy-700 border border-ice-200 shadow-card flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-aqua-500" />
              Free Pickup on PKR 500+
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-navy-700 border border-ice-200 shadow-card flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-aqua-500" />
              Separated Customer Batches
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-navy-700 border border-ice-200 shadow-card flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-aqua-500" />
              Cash on Delivery or JazzCash
            </span>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. INTRODUCTION TO OUR SERVICES
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ice-200 shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
                  Hygienic Care Standards
                </span>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-500 tracking-tight leading-tight">
                  Professional Laundry Engineered for Kasur Families & Professionals
                </h2>
                <p className="text-sm sm:text-base text-darkNavy/80 leading-relaxed">
                  In Kasur, hard water and unpredictable weather can quickly fade fabrics and cause stubborn wrinkles on Shalwar Kameez and office wear. Pickup Wash provides commercial-grade fabric care without taking a minute of your weekend.
                </p>
                <p className="text-sm text-darkNavy/70 leading-relaxed">
                  Every batch of clothes is processed in individual machines—never mixed with other customers. We treat stains with specialized color-safe detergents, apply softening rinses, and finish with high-pressure steam pressing so your clothes look and feel brand new.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200/80 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-navy-500 flex items-center justify-center shrink-0 shadow-sm border border-ice-200">
                    <Droplets className="w-5 h-5 text-aqua-500" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-navy-500">Treated Water & Eco Detergents</h4>
                    <p className="text-xs text-darkNavy/70 mt-0.5 leading-normal">
                      Gentle on sensitive skin and color-safe on lawn, cotton, and blended fabrics.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200/80 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-navy-500 flex items-center justify-center shrink-0 shadow-sm border border-ice-200">
                    <Flame className="w-5 h-5 text-navy-500" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-navy-500">Crisp Steam Pressing</h4>
                    <p className="text-xs text-darkNavy/70 mt-0.5 leading-normal">
                      High-heat steam eliminates 99.9% of bacteria and creates sharp, wrinkle-free pleats.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. FOUR SERVICE CARDS
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              Core Offerings
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Tailored For Every Laundry Requirement
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Select any service below to schedule your doorstep collection in Kasur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayedServices.map((service) => (
              <div
                key={service.id}
                className={`relative rounded-3xl p-6 sm:p-8 bg-white border transition-all duration-300 flex flex-col justify-between group ${
                  service.popular
                    ? 'border-aqua-400 ring-2 ring-aqua-400/30 shadow-soft-hover'
                    : 'border-ice-200 shadow-soft hover:shadow-soft-hover hover:border-aqua-200 hover:-translate-y-1'
                }`}
              >
                {/* Popular / Feature Pill */}
                {service.badge && (
                  <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-poppins font-bold tracking-wide shadow-sm flex items-center gap-1.5 bg-navy-500 text-white">
                    <Sparkles className="w-3.5 h-3.5 text-aqua-300" />
                    <span>{service.badge}</span>
                  </div>
                )}

                <div>
                  {/* Top Bar: Icon Container & Timing Note */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-ice-100 text-navy-500 border border-ice-200 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
                      {getServiceIcon(service.iconName)}
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-ice-50 text-navy-600 border border-ice-200">
                      {service.timingNote}
                    </span>
                  </div>

                  {/* Title & Short Tagline */}
                  <div className="mb-3">
                    <h3 className="font-poppins font-bold text-xl sm:text-2xl text-navy-500 tracking-tight">
                      {service.title}
                    </h3>
                    <span className="text-xs font-semibold text-aqua-600">
                      {service.shortTitle}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-darkNavy/80 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Included Features Checklist */}
                  <div className="space-y-2.5 mb-8 pt-4 border-t border-ice-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400 block">
                      Service Highlights:
                    </span>
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-darkNavy/85">
                        <CheckCircle2 className="w-4 h-4 text-aqua-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-ice-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-darkNavy/60 self-start sm:self-auto">
                    Kasur Doorstep Service
                  </span>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    {service.id === 'monthly-packages' && (
                      <a
                        href={`tel:${BUSINESS_INFO.phone}`}
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full sm:w-auto text-xs"
                          leftIcon={<PhoneCall className="w-3.5 h-3.5 text-navy-500" />}
                        >
                          Inquire
                        </Button>
                      </a>
                    )}

                    <Link
                      to={`/book?service=${service.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant={service.popular ? 'accent' : 'primary'}
                        size="md"
                        className="w-full sm:w-auto font-semibold gap-2"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. WHY CHOOSE PICKUP WASH SECTION
         ========================================================================= */}
      <section className="bg-ice-100 py-16 sm:py-20 border-y border-ice-200/80">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">
              The Pickup Wash Difference
            </span>
            <h2 className="font-poppins font-extrabold text-3xl sm:text-4xl text-navy-500 tracking-tight">
              Why Kasur Chooses Us
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70">
              Reliable, modern, and dedicated to stress-free doorstep convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: 'Zero Hauling Hassle',
                desc: 'No carrying heavy laundry bags to roadside dhobis. Our polite riders visit your doorstep directly.',
              },
              {
                icon: ShieldCheck,
                title: 'Individual Machine Batches',
                desc: 'Your garments are NEVER washed with another household’s clothes. 100% segregated hygienic care.',
              },
              {
                icon: Flame,
                title: 'High-Heat Steam Ironing',
                desc: 'Professional steam boilers sanitize your clothing and create razor-sharp collars and pleats.',
              },
              {
                icon: Clock,
                title: 'Dependable Scheduling',
                desc: 'Punctual morning and evening pickup windows across Model Town, Steel Bagh, Railway Road, and all Kasur.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-ice-200 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-aqua-600" />
                  </div>
                  <h3 className="font-poppins font-bold text-base text-navy-500">
                    {item.title}
                  </h3>
                  <p className="text-xs text-darkNavy/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. A CLEAR BOOKING CTA SECTION
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="rounded-3xl bg-gradient-to-r from-navy-500 via-navy-600 to-navy-700 text-white p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-80 h-80 bg-aqua-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Special Welcome Offer</span>
                </div>

                <h2 className="font-poppins font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  Ready to Experience Effortless Laundry in Kasur?
                </h2>

                <p className="text-ice-200/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                  Schedule your doorstep pickup in less than 60 seconds. Our rider will arrive during your selected time slot with a clean laundry bag.{firstPickupPromo?.is_active ? ' Your first pickup is completely FREE!' : ''}
                </p>

                {/* Kasur Neighborhoods Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-xs text-white">
                  <span className="text-aqua-300 text-xs font-semibold mr-1">Riders active in:</span>
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
                    Schedule a Pickup
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
