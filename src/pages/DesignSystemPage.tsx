import React, { useState } from 'react';
import { 
  Button, 
  NavLink, 
  NavPill, 
  ServiceCard, 
  PricingCard, 
  FormField, 
  Input, 
  Select, 
  Textarea, 
  RadioCard, 
  StatusBadge, 
  InfoCard, 
  StatCard, 
  StepCard, 
  AlertBanner, 
  Modal,
  FooterBrand,
  FooterLinkList,
  FooterCoverageCloud,
  FooterContactCard,
  FooterCopyright
} from '@/components/ui';
import { BRAND_COLORS, TYPOGRAPHY_SCALE } from '@/constants/designSystem';
import { OrderStatus } from '@/types';
import { 
  Sparkles, 
  CalendarCheck, 
  ArrowRight, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Clock, 
  Flame, 
  Layers, 
  Package, 
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  // Interactive state demos
  const [btnLoading, setBtnLoading] = useState(false);
  const [activePill, setActivePill] = useState('All');
  const [selectedRadio, setSelectedRadio] = useState('cod');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Form field demos
  const [demoName, setDemoName] = useState('');
  const [demoPhone, setDemoPhone] = useState('0300 1234567');
  const [demoArea, setDemoArea] = useState('Model Town');
  const [demoNotes, setDemoNotes] = useState('');
  const [showFormError, setShowFormError] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const orderStatuses: OrderStatus[] = [
    'pending_pickup',
    'picked_up',
    'processing',
    'ironing',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  return (
    <div className="py-12 sm:py-16 space-y-20 pb-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <StatusBadge variant="accent" label="Pickup Wash Design System" pulse />
          <h1 className="font-poppins text-3xl sm:text-5xl font-extrabold text-navy-500 tracking-tight">
            Brand Identity & UI Component Library
          </h1>
          <p className="text-darkNavy/70 text-base sm:text-lg leading-relaxed">
            A cohesive, accessible design system engineered for Kasur’s premier doorstep laundry startup. Built with React, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* =========================================================================
            SECTION 0: BRAND PALETTE & TYPOGRAPHY FOUNDATIONS
           ========================================================================= */}
        <section className="space-y-8">
          <div className="border-b border-ice-200 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Foundation</span>
            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-500">
              1. Brand Colours & Tokens
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Precision color palette tuned for high contrast, hygienic freshness, and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {Object.entries(BRAND_COLORS).map(([key, col]) => (
              <div
                key={key}
                onClick={() => copyToClipboard(col.hex)}
                className="group relative bg-white rounded-3xl p-5 border border-ice-200 shadow-soft hover:shadow-soft-hover transition-all cursor-pointer flex flex-col justify-between"
              >
                <div
                  className="w-full h-24 rounded-2xl mb-4 border border-black/5 shadow-inner flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: col.hex }}
                >
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1 backdrop-blur-sm"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHex === col.hex ? 'Copied!' : 'Copy Hex'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-poppins font-bold text-sm text-darkNavy">{col.name}</h4>
                  </div>
                  <div className="font-mono text-xs font-semibold text-navy-500">{col.hex}</div>
                  <p className="text-[11px] text-darkNavy/60 mt-2 leading-relaxed">{col.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Typography Specimen */}
          <div className="bg-white rounded-3xl p-8 border border-ice-200 shadow-soft space-y-6">
            <div className="border-b border-ice-200 pb-3">
              <h3 className="font-poppins font-bold text-lg text-navy-500">Typography Scale</h3>
              <p className="text-xs text-darkNavy/60">Poppins for Headings • Inter for Body</p>
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-ice-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-navy-400 w-32 shrink-0">H1 / Poppins 36px</span>
                <span className="font-poppins text-3xl sm:text-4xl font-extrabold text-navy-500">
                  Doorstep Laundry in Kasur City
                </span>
              </div>
              <div className="pb-4 border-b border-ice-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-navy-400 w-32 shrink-0">H2 / Poppins 28px</span>
                <span className="font-poppins text-2xl sm:text-3xl font-bold text-navy-500">
                  Wash, Steam Press & Crisp Delivery
                </span>
              </div>
              <div className="pb-4 border-b border-ice-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-navy-400 w-32 shrink-0">H3 / Poppins 22px</span>
                <span className="font-poppins text-xl font-bold text-darkNavy">
                  Hygienic Fabric Separation & Delicate Care
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-navy-400 w-32 shrink-0">Body / Inter 15px</span>
                <p className="font-inter text-sm sm:text-base text-darkNavy/85 max-w-2xl leading-relaxed">
                  Our professional laundry riders collect garments from Model Town, Steel Bagh, Railway Road, and throughout Kasur. Every batch is individually washed and finished with high-pressure steam pressing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 1: BUTTONS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 1</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Primary & Secondary Buttons
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              High-conversion action buttons with keyboard accessibility, focus rings, loading states, and icon integration.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-8">
            {/* Variants */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Button Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon={<CalendarCheck className="w-4 h-4 text-aqua-300" />}>
                  Primary Navy
                </Button>
                <Button variant="secondary" leftIcon={<Truck className="w-4 h-4 text-aqua-500" />}>
                  Secondary White
                </Button>
                <Button variant="accent" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Accent Aqua
                </Button>
                <Button variant="outline">
                  Outline Navy
                </Button>
                <Button variant="ghost">
                  Ghost Link
                </Button>
                <Button variant="danger">
                  Cancel Order
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Button Sizes
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="primary">Extra Small</Button>
                <Button size="sm" variant="primary">Small (sm)</Button>
                <Button size="md" variant="primary">Medium (md)</Button>
                <Button size="lg" variant="primary" rightIcon={<Sparkles className="w-4 h-4" />}>
                  Large Call To Action
                </Button>
              </div>
            </div>

            {/* Interactive Loading & Disabled states */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Interactive States
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  isLoading={btnLoading}
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 2000);
                  }}
                >
                  {btnLoading ? 'Processing Order...' : 'Click to Test Loading State'}
                </Button>

                <Button variant="secondary" disabled>
                  Disabled Secondary
                </Button>

                <Button variant="accent" disabled>
                  Disabled Accent
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 2: NAVIGATION LINKS & PILLS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 2</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Navigation Links & Filter Pills
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Responsive links with active state indicator dots, badge chips, and category filter pills.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Desktop Navigation Links & Badges
              </span>
              <div className="p-3 bg-ice-100/70 rounded-2xl flex flex-wrap items-center gap-2 border border-ice-200">
                <NavLink to="/design-system" badge="Active">Active Route</NavLink>
                <NavLink to="/services">Services</NavLink>
                <NavLink to="/pricing" badge="Popular" badgeVariant="aqua">Pricing</NavLink>
                <NavLink to="/track">Track Order</NavLink>
                <NavLink to="/contact">Contact Support</NavLink>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Interactive Filter Pills
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Wash & Steam Iron', 'Steam Press Only', 'Wash & Fold (Bulk)', 'Bedding'].map((pill) => (
                  <NavPill
                    key={pill}
                    label={pill}
                    active={activePill === pill}
                    onClick={() => setActivePill(pill)}
                    count={pill === 'All' ? 4 : 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 3: SERVICE CARDS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 3</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Laundry Service Cards
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Attractive card design with turnaround badge, feature list, pricing, and popular ribbon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              id="wash-and-iron"
              title="Wash & Steam Iron"
              description="Complete hygienic laundering, softening rinse, crisp steam press, and hanger packaging."
              pricePerUnit={180}
              unit="suit"
              turnaroundTime="24–48 Hours"
              popular={true}
              features={[
                'Eco-friendly fabric detergents',
                'High-pressure steam ironing',
                'Color-safe separation',
                'Hanger packaging included',
              ]}
              onSelect={(id) => alert(`Selected service: ${id}`)}
            />

            <ServiceCard
              id="steam-iron-only"
              title="Steam Ironing Only"
              description="Wrinkle-free pressing with sharp creases for Shalwar Kameez, shirts, and office trousers."
              pricePerUnit={60}
              unit="suit"
              turnaroundTime="Same Day / 24h"
              popular={false}
              features={[
                'Gentle fabric protection',
                'Crisp collar & cuff finishing',
                'Neat fold or hanger choice',
                'Doorstep pickup in Kasur',
              ]}
              onSelect={(id) => alert(`Selected service: ${id}`)}
            />

            <ServiceCard
              id="wash-and-fold"
              title="Wash & Fold (Bulk)"
              description="Ideal for busy families and students: casual t-shirts, daily wear, towels washed and folded."
              pricePerUnit={160}
              unit="kg"
              turnaroundTime="24 Hours"
              popular={false}
              features={[
                'Weighed accurately upon pickup',
                'Hypoallergenic wash cycle',
                'Precision fold & pack',
                'Economical bulk rates',
              ]}
              onSelect={(id) => alert(`Selected service: ${id}`)}
            />
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 4: PRICING CARDS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 4</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Pricing & Rate Cards
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Tiered package cards with transparent PKR pricing and included benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              name="Student & Casual Bulk"
              price={160}
              unit="kg"
              description="Best for daily casual wear, t-shirts, jeans, and hostel students."
              turnaround="24 Hours"
              perks={[
                'Accurate digital scale at door',
                'Soft tumble wash & dry',
                'Neatly folded & bagged',
                'Free delivery on PKR 500+',
              ]}
              onSelect={() => alert('Selected Student Bulk Plan')}
            />

            <PricingCard
              name="Executive Care"
              badge="Kasur Favorite"
              price={180}
              unit="suit"
              description="Full wash and high-pressure steam press for 2-piece / 3-piece outfits."
              turnaround="24–48 Hours"
              isHighlighted={true}
              perks={[
                'Stain pre-treatment check',
                'Hygienic color-separated wash',
                'Sharp collar & crease steam press',
                'Complimentary wire hanger packaging',
              ]}
              onSelect={() => alert('Selected Executive Care Plan')}
            />

            <PricingCard
              name="Winter Bedding & Blankets"
              price={650}
              unit="piece"
              description="Deep sanitization for heavy winter quilts, comforters, and blankets."
              turnaround="48–72 Hours"
              perks={[
                'Anti-dust mite sanitization',
                'Heavy-duty gentle tumbling',
                'Odor removal & freshening',
                'Dust-proof storage bag delivery',
              ]}
              onSelect={() => alert('Selected Bedding Plan')}
            />
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 5 & 6: FORM FIELDS, INPUTS, SELECTS, TEXTAREA & RADIOCARDS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Components 5 & 6</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Form Fields, Inputs & Dropdowns
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Accessible input components with icon prefixes, custom chevron dropdowns, helper hints, error validation, and radio cards.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-ice-200">
              <h3 className="font-poppins font-semibold text-base text-navy-500">
                Interactive Form Demo
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowFormError(!showFormError)}
              >
                {showFormError ? 'Clear Error State' : 'Trigger Error State'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <FormField
                label="Full Customer Name"
                required
                htmlFor="demo-name"
                error={showFormError ? 'Please provide your full name for the rider' : undefined}
                helperText="Name of the person handing over the laundry."
              >
                <Input
                  id="demo-name"
                  placeholder="e.g. Muhammad Ahmad"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  isError={showFormError}
                  clearable
                  onClear={() => setDemoName('')}
                />
              </FormField>

              {/* Phone */}
              <FormField
                label="WhatsApp Phone Number"
                required
                htmlFor="demo-phone"
                helperText="We send SMS & WhatsApp status updates."
              >
                <Input
                  id="demo-phone"
                  placeholder="0300 1234567"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </FormField>

              {/* Area Dropdown */}
              <FormField
                label="Kasur City Neighborhood"
                required
                htmlFor="demo-area"
                hint="Covering all union councils"
              >
                <Select
                  id="demo-area"
                  value={demoArea}
                  onChange={(e) => setDemoArea(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                >
                  <option value="Model Town">Model Town, Kasur</option>
                  <option value="Steel Bagh">Steel Bagh, Kasur</option>
                  <option value="Railway Road">Railway Road, Kasur</option>
                  <option value="Circular Road">Circular Road, Kasur</option>
                  <option value="Kot Murad Khan">Kot Murad Khan, Kasur</option>
                </Select>
              </FormField>

              {/* Special Instructions Textarea */}
              <FormField
                label="Special Laundry Instructions"
                htmlFor="demo-notes"
                helperText="Mention delicate embroidery or specific hanger requests."
              >
                <Textarea
                  id="demo-notes"
                  placeholder="e.g. Gentle wash for white cotton kurta, deliver on hangers."
                  rows={2}
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                />
              </FormField>
            </div>

            {/* Radio Cards: Payment Method Demo */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Selectable Radio Cards (Payment & Slots)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RadioCard
                  id="pay-cod"
                  name="payment-demo"
                  value="cod"
                  checked={selectedRadio === 'cod'}
                  onChange={setSelectedRadio}
                  title="Cash on Delivery (COD)"
                  description="Pay the rider in cash when fresh laundry is delivered."
                  badge="Recommended"
                  icon={<Zap className="w-4 h-4 text-aqua-600" />}
                />

                <RadioCard
                  id="pay-digital"
                  name="payment-demo"
                  value="digital"
                  checked={selectedRadio === 'digital'}
                  onChange={setSelectedRadio}
                  title="JazzCash / EasyPaisa"
                  description="Transfer digitally directly to our official merchant account."
                  badge="Instant"
                  icon={<ShieldCheck className="w-4 h-4 text-navy-500" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 7: STATUS BADGES
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 7</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Live Order Status Badges
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Visual indicators for the 8 real-time order tracking stages across Kasur.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Order Tracking Pipeline (with live pulsing dot)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {orderStatuses.map((st) => (
                  <StatusBadge key={st} status={st} pulse={['processing', 'ironing', 'out_for_delivery'].includes(st)} />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-ice-200">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-400 block mb-3">
                Generic Semantic Badge Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant="primary" label="Primary Navy" />
                <StatusBadge variant="accent" label="Accent Aqua" />
                <StatusBadge variant="success" label="Hygienically Clean" />
                <StatusBadge variant="warning" label="Pending Confirmation" />
                <StatusBadge variant="info" label="Rider Dispatched" />
                <StatusBadge variant="danger" label="Urgent Attention" />
                <StatusBadge variant="neutral" label="Archive Order" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 8: INFORMATION CARDS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 8</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Information & Metric Cards
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              KPI metric cards, 4-step process cards, and dismissible notice banners.
            </p>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              label="Turnaround Time"
              value="24h"
              subtext="Doorstep pickup to delivery"
              variant="white"
              icon={<Clock className="w-5 h-5 text-aqua-500" />}
              trend={{ value: 'Fastest in Kasur', isPositive: true }}
            />
            <StatCard
              label="Hygienic Cleanliness"
              value="100%"
              subtext="Zero cross-batch mixing"
              variant="ice"
              icon={<Sparkles className="w-5 h-5 text-aqua-600" />}
            />
            <StatCard
              label="Kasur Coverage"
              value="All UCs"
              subtext="Model Town, Steel Bagh, Railway Rd"
              variant="navy"
              icon={<MapPin className="w-5 h-5 text-aqua-300" />}
            />
          </div>

          {/* 4-Step Process Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              step="01"
              title="Schedule Online"
              description="Choose your pickup date and convenient time slot in Kasur."
              icon={<CalendarCheck className="w-6 h-6 text-navy-500" />}
            />
            <StepCard
              step="02"
              title="Doorstep Pickup"
              description="Our rider collects your laundry bag directly from your home."
              icon={<Truck className="w-6 h-6 text-navy-500" />}
            />
            <StepCard
              step="03"
              title="Wash & Steam"
              description="Fabric-safe washing and high-temperature steam ironing."
              icon={<Flame className="w-6 h-6 text-navy-500" />}
            />
            <StepCard
              step="04"
              title="Fresh Return"
              description="Delivered back clean, crisp, and neatly folded or hung."
              icon={<Sparkles className="w-6 h-6 text-navy-500" />}
            />
          </div>

          {/* Alert Notice Banner */}
          <div className="space-y-3">
            <AlertBanner
              type="tip"
              title="Free Pickup Offer"
              message="All orders over PKR 500 receive complimentary doorstep pickup and delivery anywhere in Kasur City."
            />
            <AlertBanner
              type="info"
              title="Steam Ironing Quality Check"
              message="Delicate lawn suits, embroidered clothing, and formal shirts are ironed with commercial Teflon shoe plates to prevent fabric burn."
            />
          </div>
        </section>

        {/* =========================================================================
            COMPONENT 9: MODAL DIALOGS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 9</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Accessible Modal Dialogs
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Overlay dialogs with backdrop blur, keyboard escape listener, and smooth animations.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-ice-200 shadow-soft text-center space-y-4">
            <h3 className="font-poppins font-bold text-lg text-navy-500">
              Interactive Dialog Preview
            </h3>
            <p className="text-xs sm:text-sm text-darkNavy/70 max-w-md mx-auto">
              Click the button below to trigger the accessible modal dialog. Test closing via button, backdrop click, or pressing the <kbd className="px-1.5 py-0.5 rounded bg-ice-100 border text-xs font-mono">Escape</kbd> key.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              className="gap-2"
            >
              Open Booking Confirmation Modal
            </Button>
          </div>

          {/* Actual Modal Instance */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirm Pickup Schedule"
            subtitle="Pickup Wash • Kasur Doorstep Service"
            footer={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    alert('Pickup confirmed!');
                  }}
                >
                  Confirm Pickup
                </Button>
              </>
            }
          >
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-ice-50 border border-ice-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-darkNavy/60">Selected Neighborhood:</span>
                  <span className="font-semibold text-navy-900">Model Town, Kasur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkNavy/60">Pickup Timing:</span>
                  <span className="font-semibold text-navy-900">Tomorrow (09:00 AM - 12:00 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkNavy/60">Estimated Service:</span>
                  <span className="font-semibold text-navy-900">Wash & Steam Iron (PKR 180/suit)</span>
                </div>
              </div>

              <p className="text-darkNavy/80 leading-relaxed">
                Our rider will arrive on a designated motorbike with a sealed, sanitized laundry bag. No advance payment is needed until delivery.
              </p>
            </div>
          </Modal>
        </section>

        {/* =========================================================================
            COMPONENT 10: FOOTER COMPONENTS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-ice-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-aqua-600">Component 10</span>
            <h2 className="font-poppins text-2xl font-bold text-navy-500">
              Modular Footer Components
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-1">
              Reusable brand column, link lists, neighborhood cloud, contact info block, and copyright bar.
            </p>
          </div>

          <div className="bg-navy-700 text-white rounded-3xl p-8 border border-navy-600 shadow-soft space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FooterBrand
                name="Pickup Wash"
                tagline="Kasur Doorstep Laundry"
                description="Doorstep laundry pickup, wash, steam press, and return service in Kasur City, Pakistan."
              />

              <FooterLinkList
                title="Service Links"
                links={[
                  { label: 'Wash & Steam Iron', href: '/services' },
                  { label: 'Steam Press Only', href: '/services' },
                  { label: 'Student Bulk Rates', href: '/pricing' },
                  { label: 'Order Tracking', href: '/track' },
                ]}
              />

              <FooterCoverageCloud
                areas={['Model Town', 'Steel Bagh', 'Railway Road', 'Circular Road']}
              />

              <FooterContactCard
                location="Kasur City, Punjab, Pakistan"
                phone="+92 300 0000000"
                email="contact@pickupwash.pk"
                hours="Mon - Sat: 8:00 AM - 9:00 PM"
              />
            </div>

            <FooterCopyright companyName="Pickup Wash" />
          </div>
        </section>
      </div>
    </div>
  );
};

