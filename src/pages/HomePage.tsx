import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Truck, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  PhoneCall, 
  Layers, 
  Flame, 
  PackageCheck,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { CORE_SERVICES, BUSINESS_INFO, KASUR_SERVICE_AREAS } from '@/utils/constants';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft background glow circles */}
        <div className="absolute top-10 right-0 -mr-20 w-96 h-96 bg-aqua-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 w-80 h-80 bg-ice-300/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-aqua-400"></span>
                <span className="text-xs font-semibold text-navy-500 tracking-wide uppercase">
                  Doorstep Laundry in Kasur City
                </span>
              </div>

              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.15]">
                Fresh, Crisp Laundry <br />
                <span className="text-aqua-400 underline decoration-aqua-200 decoration-wavy decoration-2">
                  Picked Up & Returned
                </span> <br />
                At Your Doorstep.
              </h1>

              <p className="text-base sm:text-lg text-navy-700/80 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Never waste your weekend doing laundry or visiting dhobi shops again. We pick up your clothes from any neighborhood in Kasur, clean them with premium care, steam press, and deliver back fresh.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/book" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-navy-500 hover:bg-navy-600 shadow-lg shadow-navy-500/25">
                    <CalendarCheck className="w-5 h-5 text-aqua-300" />
                    Book Pickup Now
                  </Button>
                </Link>

                <Link to="/track" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2 border-ice-300 text-navy-600">
                    Track Your Order
                    <ArrowRight className="w-4 h-4 text-aqua-500" />
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-ice-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="font-poppins font-bold text-2xl text-navy-500">24h - 48h</div>
                  <div className="text-xs text-navy-600 font-medium">Fast Turnaround</div>
                </div>
                <div>
                  <div className="font-poppins font-bold text-2xl text-aqua-500">100%</div>
                  <div className="text-xs text-navy-600 font-medium">Hygienic Care</div>
                </div>
                <div>
                  <div className="font-poppins font-bold text-2xl text-navy-500">Kasur</div>
                  <div className="text-xs text-navy-600 font-medium">City-wide Pickup</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Feature Highlight Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-ice-200 relative z-10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-ice-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-ice-100 flex items-center justify-center text-navy-500">
                        <Sparkles className="w-6 h-6 text-aqua-500" />
                      </div>
                      <div>
                        <h3 className="font-poppins font-bold text-navy-500">Pickup Wash</h3>
                        <p className="text-xs text-navy-400">Serving Kasur City Everyday</p>
                      </div>
                    </div>
                    <Badge variant="accent">Open 7 Days</Badge>
                  </div>

                  {/* Quick Feature Checklist */}
                  <div className="space-y-3.5">
                    {[
                      { title: 'Doorstep Pickup & Return', desc: 'No more carrying heavy bundles to local shops.' },
                      { title: 'Steam Press Perfection', desc: 'Sharp creases for Shalwar Kameez & formal wear.' },
                      { title: 'Separate Fabric Washing', desc: 'Colors protected with gentle dermatological detergents.' },
                    ].map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-ice-50/70 border border-ice-200/50">
                        <CheckCircle2 className="w-5 h-5 text-aqua-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-navy-500">{feat.title}</h4>
                          <p className="text-xs text-navy-600/80">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live order mockup snippet */}
                  <div className="p-4 rounded-2xl bg-navy-500 text-white flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-aqua-300 font-medium">Active Order Demo</div>
                      <div className="font-mono font-bold text-sm">PW-KSR-84920</div>
                      <div className="text-xs text-ice-200/80">Model Town, Kasur</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-aqua-400 text-navy-900 text-xs font-bold">
                      Steam Pressing
                    </span>
                  </div>
                </div>

                {/* Decorative floating badge */}
                <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white py-3 px-4 rounded-2xl shadow-lg border border-ice-200 flex items-center gap-3 z-20">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-500">Free Pickup</div>
                    <div className="text-[10px] text-navy-400">On orders over PKR 500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge variant="primary">Simple 4-Step Process</Badge>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-500 tracking-tight">
            How Pickup Wash Works
          </h2>
          <p className="text-navy-600/80 text-sm sm:text-base">
            Enjoy clean clothes without lifting a finger. Designed to make your life hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Book Online',
              desc: 'Select your preferred pickup day and time slot right from your phone.',
              icon: CalendarCheck,
            },
            {
              step: '02',
              title: 'We Collect',
              desc: 'Our courteous rider arrives at your doorstep in Kasur with a clean laundry bag.',
              icon: Truck,
            },
            {
              step: '03',
              title: 'Expert Wash & Iron',
              desc: 'Hygienic machine wash, eco-detergents, and crisp high-pressure steam pressing.',
              icon: Sparkles,
            },
            {
              step: '04',
              title: 'Doorstep Delivery',
              desc: 'Delivered fresh, folded or on hangers, directly back to your hands.',
              icon: PackageCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} hoverEffect className="relative overflow-hidden group">
                <span className="font-poppins font-extrabold text-5xl text-ice-200 absolute top-3 right-4 select-none group-hover:text-aqua-100 transition-colors">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mb-5 group-hover:bg-aqua-400 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-navy-500 mb-2">{item.title}</h3>
                <p className="text-sm text-navy-600/80 leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FEATURED SERVICES & PRICING PREVIEW */}
      <section className="bg-white py-20 border-y border-ice-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="accent" className="mb-2">Our Popular Services</Badge>
              <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-500 tracking-tight">
                Crafted for Every Laundry Need
              </h2>
              <p className="text-navy-600/80 text-sm sm:text-base mt-1">
                Transparent rates in PKR with no hidden fees or charges.
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" size="sm">
                View Full Rate Card
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_SERVICES.map((service) => (
              <div
                key={service.id}
                className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  service.popular
                    ? 'bg-navy-500 text-white shadow-xl ring-2 ring-aqua-400'
                    : 'bg-ice-50 border border-ice-200 text-navy-900 hover:border-aqua-200 hover:shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      service.popular ? 'text-aqua-300' : 'text-navy-400'
                    }`}>
                      {service.turnaroundTime}
                    </span>
                    {service.popular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-aqua-400 text-navy-900">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <h3 className={`font-poppins font-bold text-xl mb-2 ${
                    service.popular ? 'text-white' : 'text-navy-500'
                  }`}>
                    {service.title}
                  </h3>

                  <p className={`text-xs mb-6 leading-relaxed ${
                    service.popular ? 'text-ice-200' : 'text-navy-600/80'
                  }`}>
                    {service.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs uppercase font-medium">PKR</span>
                      <span className="font-poppins font-extrabold text-3xl tracking-tight">
                        {service.pricePerUnit}
                      </span>
                      <span className={`text-xs ${service.popular ? 'text-ice-200' : 'text-navy-500'}`}>
                        /{service.unit}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-8 text-xs">
                    {service.features.slice(0, 4).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                          service.popular ? 'text-aqua-300' : 'text-aqua-500'
                        }`} />
                        <span className={service.popular ? 'text-ice-100' : 'text-navy-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/book" className="w-full">
                  <Button
                    variant={service.popular ? 'accent' : 'primary'}
                    className="w-full text-xs font-semibold py-2.5"
                  >
                    Select Service
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KASUR CITY COVERAGE CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-500 to-navy-600 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-aqua-400/20 rounded-full blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-aqua-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                Local Kasur Coverage
              </div>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold tracking-tight">
                Now Serving All Neighborhoods Across Kasur City
              </h2>
              <p className="text-ice-200/90 text-sm max-w-2xl leading-relaxed">
                Whether you live in Model Town, near Railway Road, Steel Bagh, Circular Road, Kot Murad Khan, or Kachehri Road — our riders are on the move every morning and evening.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {KASUR_SERVICE_AREAS.slice(0, 8).map((area) => (
                  <span key={area} className="px-3 py-1 rounded-lg bg-white/15 text-xs text-white backdrop-blur-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 justify-center items-center lg:items-end">
              <Link to="/book" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-aqua-400 text-navy-900 hover:bg-aqua-300 font-bold">
                  Schedule Your First Pickup
                </Button>
              </Link>
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="inline-flex items-center gap-2 text-xs text-ice-200 hover:text-white pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5 text-aqua-400" />
                Call Helpline: {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

