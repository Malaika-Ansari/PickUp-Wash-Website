import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CalendarCheck, 
  ArrowRight, 
  Truck, 
  Flame, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Star,
  Shirt,
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';

export const HeroSection: React.FC = () => {
  // High-res realistic laundry photography fallbacks (neatly folded clothes, clean towels, modern washer)
  const defaultLocalImage = '/images/hero-laundry.png';
  const highResFallback = 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1200&q=85';
  
  const [imageSrc, setImageSrc] = useState(defaultLocalImage);

  return (
    <section className="relative overflow-hidden bg-ice-100 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-ice-200/60">
      {/* Decorative Background Elements (Bubbles, Radial Water Glows, Subtle Waves) */}
      <div 
        className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-aqua-200/40 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-ice-300/60 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/40 blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Floating subtle laundry soap bubbles */}
      <div className="absolute top-20 left-8 w-4 h-4 rounded-full bg-aqua-300/40 blur-[1px] animate-pulse pointer-events-none" aria-hidden="true" />
      <div className="absolute top-44 right-1/4 w-6 h-6 rounded-full bg-white/70 shadow-sm blur-[0.5px] animate-float pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-16 right-12 w-3.5 h-3.5 rounded-full bg-aqua-400/30 blur-[1px] animate-pulse pointer-events-none" aria-hidden="true" />

      <Container size="xl" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: HEADLINES, OFFER, DESCRIPTION & CTAs
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Special Offer Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ice-200 shadow-sm shadow-navy-500/5 group hover:border-aqua-300 transition-colors">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aqua-400" />
              </span>
              <span className="font-poppins font-bold text-xs sm:text-sm text-navy-500 tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-aqua-500 fill-aqua-400" />
                <span>Special Offer:</span>
                <span className="text-aqua-600 font-extrabold uppercase">Your First Pickup is FREE!</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 tracking-tight leading-[1.12]">
                Fresh Clothes.{' '}
                <span className="text-aqua-400 relative inline-block">
                  Happy You.
                  {/* Subtle curved underline accent */}
                  <svg 
                    className="absolute -bottom-2 left-0 w-full h-3 text-aqua-300/80" 
                    viewBox="0 0 200 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Supporting Headline (Bilingual / Local Touch for Kasur) */}
              <p className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-darkNavy/85 pt-1">
                “Ghar baithe kapray dhulwayein, fikar chhor dein.”
              </p>
            </div>

            {/* Description */}
            <p className="font-inter text-base sm:text-lg text-darkNavy/75 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Enjoy convenient laundry pickup and delivery right from your doorstep. We collect your clothes, wash and iron them with care, and return them fresh and ready to wear.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              {/* Primary CTA Button: Book a Pickup (Aqua Accent) */}
              <Link to="/book" className="w-full sm:w-auto">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full sm:w-auto gap-2.5 font-bold shadow-aqua text-darkNavy hover:text-white px-7 py-4 text-base active:scale-95"
                  leftIcon={<CalendarCheck className="w-5 h-5 text-current" />}
                >
                  Book a Pickup
                </Button>
              </Link>

              {/* Secondary CTA Button: Explore Our Services */}
              <Link to="/services" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto gap-2 font-semibold text-navy-500 border-ice-300 hover:border-navy-400 px-6 py-4 text-base shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4 text-aqua-600" />}
                >
                  Explore Our Services
                </Button>
              </Link>
            </div>

            {/* Quick Kasur City Footnote */}
            <p className="text-xs text-darkNavy/60 flex items-center justify-center lg:justify-start gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Serving Model Town, Steel Bagh, Railway Road & all Kasur areas</span>
            </p>

            {/* =========================================================================
                TRUST SECTION: 3 KEY VALUE PILLARS
               ========================================================================= */}
            <div className="pt-8 border-t border-ice-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                
                {/* 1. Doorstep Pickup */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-ice-200/90 shadow-card flex items-center gap-3 group hover:border-aqua-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
                    <Truck className="w-5 h-5 text-navy-500" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-xs sm:text-sm text-navy-500 leading-tight">
                      Doorstep Pickup
                    </h4>
                    <span className="text-[11px] text-darkNavy/65 leading-tight block mt-0.5">
                      Collected at your door
                    </span>
                  </div>
                </div>

                {/* 2. Wash & Iron */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-ice-200/90 shadow-card flex items-center gap-3 group hover:border-aqua-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
                    <Flame className="w-5 h-5 text-aqua-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-xs sm:text-sm text-navy-500 leading-tight">
                      Wash & Iron
                    </h4>
                    <span className="text-[11px] text-darkNavy/65 leading-tight block mt-0.5">
                      Hygienic steam press
                    </span>
                  </div>
                </div>

                {/* 3. Same / Next Day Return */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-ice-200/90 shadow-card flex items-center gap-3 group hover:border-aqua-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-ice-100 text-navy-500 flex items-center justify-center shrink-0 group-hover:bg-aqua-100 group-hover:text-aqua-800 transition-colors">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-bold text-xs sm:text-sm text-navy-500 leading-tight">
                      Same/Next Day Return
                    </h4>
                    <span className="text-[11px] text-darkNavy/65 leading-tight block mt-0.5">
                      Prompt 24–48h return
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: REALISTIC LAUNDRY PHOTOGRAPHY WITH FLOATING CARDS
             ========================================================================= */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Laundry Photography Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
                <div className="aspect-[4/3] sm:aspect-[1/1] lg:aspect-[4/5] w-full overflow-hidden relative">
                  <img
                    src={imageSrc}
                    onError={() => {
                      // Fallback to high-resolution realistic laundry photo if local file is missing
                      if (imageSrc !== highResFallback) {
                        setImageSrc(highResFallback);
                      }
                    }}
                    alt="Neatly folded clean clothes and fresh pastel towels in a pristine modern laundry room"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* Subtle soft gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-darkNavy-900/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-aqua-100 text-aqua-800 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-aqua-600" />
                    </div>
                    <div>
                      <div className="font-poppins font-bold text-xs text-navy-500 leading-none">
                        Immaculate Fabric Care
                      </div>
                      <div className="text-[10px] text-darkNavy/60 mt-0.5">
                        Separated whites & color-safe cycles
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    100% Sanitized
                  </span>
                </div>
              </div>

              {/* Floating Badge 1: 5-Star Cleanliness Rating (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white py-2.5 px-3.5 rounded-2xl shadow-lg border border-ice-200 flex items-center gap-2.5 z-20 animate-float">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-500 flex items-center gap-1">
                    <span>5.0 Rating</span>
                    <span className="text-[10px] text-amber-500">★★★★★</span>
                  </div>
                  <div className="text-[10px] text-darkNavy/60">Kasur Households Trust Us</div>
                </div>
              </div>

              {/* Floating Badge 2: Free Pickup on First Order (Bottom Right) */}
              <div className="absolute -bottom-5 -right-3 sm:-right-6 bg-white py-3 px-4 rounded-2xl shadow-lg border border-ice-200 flex items-center gap-3 z-20">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-navy-500">Free First Pickup</div>
                  <div className="text-[10px] text-darkNavy/60">Code: FIRSTFREE at door</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

