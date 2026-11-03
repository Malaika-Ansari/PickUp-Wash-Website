import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  Sparkles, 
  CheckCircle2, 
  Menu, 
  RefreshCw, 
  AlertTriangle,
  Layers,
  Shield,
  User,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner, Skeleton, PageLoader } from '@/components/feedback/Loading';
import { ErrorState, ErrorMessage } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NavigationDrawer } from '@/components/layout/NavigationDrawer';

export const ResponsivePreviewPage: React.FC = () => {
  // Device viewport simulator state
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'laptop' | 'tablet' | 'mobile'>('responsive');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  
  // Interactive test states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [showErrorDemo, setShowErrorDemo] = useState(false);
  const [showSkeletonDemo, setShowSkeletonDemo] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpointLabel = () => {
    if (windowWidth >= 1280) return 'Desktop XL (≥ 1280px)';
    if (windowWidth >= 1024) return 'Desktop LG (≥ 1024px)';
    if (windowWidth >= 768) return 'Tablet MD (768px – 1023px)';
    if (windowWidth >= 640) return 'Small Tablet SM (640px – 767px)';
    return 'Smartphone Mobile (< 640px)';
  };

  const deviceWidths = {
    responsive: 'w-full',
    laptop: 'max-w-[1024px] mx-auto',
    tablet: 'max-w-[768px] mx-auto',
    mobile: 'max-w-[375px] mx-auto',
  };

  return (
    <div className="py-10 space-y-12">
      {/* Page Loader Simulation */}
      {showPageLoader && (
        <div className="fixed inset-0 z-50 bg-ice-100/95 backdrop-blur-md flex flex-col items-center justify-center">
          <PageLoader
            message="Testing Laundry Drum Animation..."
            submessage="Simulating real-time server pickup dispatch in Kasur"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPageLoader(false)}
            className="mt-6"
          >
            Close Full-Page Loader Preview
          </Button>
        </div>
      )}

      {/* Top Controller Bar */}
      <Container size="xl">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-ice-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge variant="accent" label="Layout Test Bench" pulse />
                <span className="text-xs font-mono font-bold text-navy-500 bg-ice-100 px-2.5 py-0.5 rounded-full border border-ice-200">
                  {windowWidth}px × {windowHeight}px
                </span>
              </div>
              <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 tracking-tight">
                Responsive Architecture & Device Simulator
              </h1>
              <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
                Active Viewport: <strong className="text-navy-900 font-semibold">{getBreakpointLabel()}</strong>
              </p>
            </div>

            {/* Device Frame Buttons */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-ice-100 border border-ice-200">
              {[
                { id: 'responsive', label: 'Fluid', icon: Maximize2 },
                { id: 'laptop', label: 'Laptop (1024px)', icon: Monitor },
                { id: 'tablet', label: 'Tablet (768px)', icon: Tablet },
                { id: 'mobile', label: 'Mobile (375px)', icon: Smartphone },
              ].map((btn) => {
                const Icon = btn.icon;
                const active = deviceMode === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setDeviceMode(btn.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-navy-500 text-white shadow-sm'
                        : 'text-darkNavy/70 hover:text-navy-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsDrawerOpen(true)}
              leftIcon={<Menu className="w-4 h-4 text-aqua-300" />}
            >
              Test Mobile Navigation Drawer
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowPageLoader(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-aqua-600" />}
            >
              Test Laundry Swirl Page Loader
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSkeletonDemo(!showSkeletonDemo)}
            >
              {showSkeletonDemo ? 'Hide Skeletons' : 'Toggle Skeleton Loaders'}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowErrorDemo(!showErrorDemo)}
            >
              {showErrorDemo ? 'Hide Error State' : 'Toggle Error State Card'}
            </Button>
          </div>
        </div>
      </Container>

      {/* Simulated Device Frame Container */}
      <div className={`transition-all duration-300 ${deviceWidths[deviceMode]}`}>
        {deviceMode !== 'responsive' && (
          <div className="text-center pb-2">
            <span className="text-[11px] font-mono text-darkNavy/60 bg-white px-3 py-1 rounded-full border border-ice-200">
              Simulated {deviceMode.toUpperCase()} viewport container
            </span>
          </div>
        )}

        <div className={`space-y-12 ${deviceMode !== 'responsive' ? 'p-4 bg-white/40 rounded-3xl border-2 border-dashed border-aqua-300' : ''}`}>
          
          {/* SECTION 1: RESPONSIVE GRID & CARD ALIGNMENT STRESS TEST */}
          <Section
            variant="white"
            badge="Responsive Grids"
            title="Fluid Multi-Screen Grid Architecture"
            subtitle="Automatically flows from 1 column on smartphones, to 2 columns on tablets, and 4 columns on desktop."
          >
            {showSkeletonDemo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white border border-ice-200 space-y-4">
                    <Skeleton variant="circular" width={48} height={48} />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="rounded" height={40} className="mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Mobile First (<640px)', desc: 'Full width cards with 48px touch targets for easy one-thumb tapping.' },
                  { title: 'Small Tablet (640px)', desc: 'Neat 2-column flow with proportional gutters and readable typography.' },
                  { title: 'Tablet / iPad (768px+)', desc: 'Balanced whitespace with soft shadows and clear visual hierarchy.' },
                  { title: 'Desktop (1024px+)', desc: 'Spacious 4-column layout with hover lifts and rich micro-interactions.' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-ice-50/70 border border-ice-200 shadow-soft hover:shadow-soft-hover transition-all space-y-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-navy-500 text-white flex items-center justify-center font-bold text-sm">
                      0{idx + 1}
                    </div>
                    <h3 className="font-poppins font-bold text-base text-navy-500">{item.title}</h3>
                    <p className="text-xs text-darkNavy/70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* SECTION 2: APPLICATION LAYOUT PREVIEW CARDS */}
          <Section
            variant="ice"
            badge="Layout Architecture"
            title="Three Dedicated Application Layouts"
            subtitle="Organized into Public Customer, Customer Account Portal, and Staff Admin Operations."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Public Layout */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mb-4">
                    <Compass className="w-6 h-6 text-aqua-600" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-navy-500">1. Public Website Layout</h3>
                  <p className="text-xs text-darkNavy/70 mt-1 leading-relaxed">
                    Designed for discovery and conversion. Includes top hotline banner, sticky glass header, mobile bottom action bar, and comprehensive footer.
                  </p>
                </div>
                <div className="pt-4 border-t border-ice-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active on /
                  </span>
                  <a href="/" className="text-xs font-semibold text-navy-500 hover:underline flex items-center gap-1">
                    Visit Landing →
                  </a>
                </div>
              </div>

              {/* Customer Account Layout */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-navy-500" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-navy-500">2. Customer Account Layout</h3>
                  <p className="text-xs text-darkNavy/70 mt-1 leading-relaxed">
                    Personalized portal with customer summary header, active laundry tracking card, and sidebar navigation on desktop that flows into clean tabs on mobile.
                  </p>
                </div>
                <div className="pt-4 border-t border-ice-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy-800 bg-navy-50 px-2.5 py-0.5 rounded-full border border-navy-200">
                    Active on /account
                  </span>
                  <a href="/account" className="text-xs font-semibold text-navy-500 hover:underline flex items-center gap-1">
                    Visit Account →
                  </a>
                </div>
              </div>

              {/* Admin Layout */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-ice-200 shadow-soft space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-aqua-600" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-navy-500">3. Admin Operations Layout</h3>
                  <p className="text-xs text-darkNavy/70 mt-1 leading-relaxed">
                    Designed for Kasur laundry dispatchers. Features a dark navy operations sidebar on desktop and a slide-over drawer on tablets and mobile phones.
                  </p>
                </div>
                <div className="pt-4 border-t border-ice-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-aqua-900 bg-aqua-50 px-2.5 py-0.5 rounded-full border border-aqua-200">
                    Active on /admin
                  </span>
                  <a href="/admin" className="text-xs font-semibold text-navy-500 hover:underline flex items-center gap-1">
                    Visit Admin →
                  </a>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 3: ERROR & EMPTY STATE SHOWCASE */}
          {showErrorDemo ? (
            <Section variant="white" badge="Feedback Simulation" title="Interactive Error State">
              <ErrorState
                title="Unable to load laundry order data"
                description="Simulated network interruption. Touch the retry button to restore normal application state."
                onRetry={() => setShowErrorDemo(false)}
                onBack={() => setShowErrorDemo(false)}
              />
            </Section>
          ) : (
            <Section variant="white" badge="Empty State Architecture" title="Customer Empty State Component">
              <EmptyState
                title="Your laundry basket is currently empty"
                description="You have no active orders in Kasur. Schedule a doorstep pickup and our rider will collect your clothes today."
                actionText="Schedule Doorstep Pickup"
                onAction={() => window.location.href = '/book'}
                secondaryText="View Kasur Rate Card"
                onSecondary={() => window.location.href = '/pricing'}
              />
            </Section>
          )}
        </div>
      </div>

      {/* Navigation Drawer Component for Live Testing */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
