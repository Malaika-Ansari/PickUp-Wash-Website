import { ServiceItem } from '@/types';

export const BUSINESS_INFO = {
  name: 'Pickup Wash',
  tagline: 'Doorstep Laundry Pickup & Delivery in Kasur',
  location: 'Kasur City, Punjab, Pakistan',
  coverage: 'Serving all major neighborhoods across Kasur City',
  phone: '+92 300 0000000', // Configurable hotline
  whatsapp: '+92 300 0000000',
  email: 'contact@pickupwash.pk',
  hours: 'Monday – Saturday: 8:00 AM – 9:00 PM | Sunday: 10:00 AM – 6:00 PM',
  currency: 'PKR',
};

// Recognized major neighborhoods in Kasur City for reliable doorstep pickup routing
export const KASUR_SERVICE_AREAS = [
  'Model Town',
  'Steel Bagh',
  'Railway Road',
  'Circular Road',
  'Kot Murad Khan',
  'Kot Ghulam Mohammad',
  'Shahbaz Khan Road',
  'Khara Road',
  'Babu Gulab Singh',
  'Niazi Colony',
  'Gulberg Colony',
  'Kachehri Road',
  'Defence Colony / Canal View',
  'Other Kasur Urban Area',
];

export const TIME_SLOTS = [
  'Morning (09:00 AM - 12:00 PM)',
  'Afternoon (12:00 PM - 03:00 PM)',
  'Evening (03:00 PM - 06:00 PM)',
  'Night (06:00 PM - 09:00 PM)',
];

export interface LaundryServiceSpec {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: 'WashingMachine' | 'Clock' | 'Calendar' | 'Truck';
  badge?: string;
  popular?: boolean;
  features: string[];
  timingNote: string;
}

export const FOUR_MAIN_SERVICES: LaundryServiceSpec[] = [
  {
    id: 'wash-and-iron',
    title: 'WASH & IRON',
    shortTitle: 'Wash & Steam Iron',
    description: 'Complete laundry care, including washing, ironing and careful folding of everyday clothes.',
    iconName: 'WashingMachine',
    popular: true,
    badge: 'Most Popular',
    timingNote: 'Standard 24–48h Return',
    features: [
      'Gentle & hygienic washing cycle',
      'Fabric softening & anti-bacterial rinse',
      'High-pressure crisp steam ironing',
      'Neatly folded or hanger packaging',
    ],
  },
  {
    id: 'express-service',
    title: 'EXPRESS SERVICE',
    shortTitle: 'Express Urgent Care',
    description: 'Faster laundry service for customers with urgent laundry needs. Availability and timing can be confirmed during booking.',
    iconName: 'Clock',
    badge: 'Urgent Care',
    timingNote: 'Expedited Priority',
    features: [
      'Prioritized queue jump in washing line',
      'Dedicated fast-track steam pressing',
      'Immediate pickup dispatch in Kasur',
      'Confirmation of exact hours upon booking',
    ],
  },
  {
    id: 'monthly-packages',
    title: 'MONTHLY PACKAGES',
    shortTitle: 'Household Monthly Plan',
    description: 'Convenient laundry packages for regular households. Contact us to explore available plans and package details.',
    iconName: 'Calendar',
    badge: 'Family Savings',
    timingNote: 'Flexible Weekly Cycles',
    features: [
      'Regular weekly doorstep pickups',
      'Predictable household laundry management',
      'Tailored for families and students',
      'Priority customer helpline assistance',
    ],
  },
  {
    id: 'pickup-and-delivery',
    title: 'PICKUP & DELIVERY',
    shortTitle: 'Doorstep Pickup & Return',
    description: 'We collect your laundry from your doorstep and return it fresh and clean.',
    iconName: 'Truck',
    badge: '100% Doorstep',
    timingNote: 'Kasur City-Wide',
    features: [
      'Direct doorstep collection from your gate',
      'Clean sanitized pickup laundry bags',
      'Covering Model Town, Steel Bagh & beyond',
      'Returned fresh, crisp and ready to wear',
    ],
  },
];

// Backwards-compatible service item list for existing booking calculations
export const CORE_SERVICES: ServiceItem[] = [
  {
    id: 'wash-and-iron',
    title: 'Wash & Steam Iron',
    slug: 'wash-and-iron',
    description: 'Complete laundry care, including washing, ironing and careful folding of everyday clothes.',
    pricePerUnit: 180,
    unit: 'suit',
    turnaroundTime: '24–48 Hours',
    icon: 'Sparkles',
    popular: true,
    features: [
      'Eco-friendly fabric detergents',
      'High-pressure steam ironing',
      'Color-safe separation',
      'Anti-bacterial rinse cycle',
      'Hanger packaging included',
    ],
  },
  {
    id: 'express-service',
    title: 'Express Service',
    slug: 'express-service',
    description: 'Faster laundry service for customers with urgent laundry needs. Availability confirmed during booking.',
    pricePerUnit: 250,
    unit: 'suit',
    turnaroundTime: 'Express Timing',
    icon: 'Clock',
    popular: false,
    features: [
      'Priority wash & dry cycle',
      'Quick steam press & finishing',
      'Expedited dispatch in Kasur',
      'Confirmation on booking',
    ],
  },
  {
    id: 'monthly-packages',
    title: 'Monthly Packages',
    slug: 'monthly-packages',
    description: 'Convenient laundry packages for regular households. Contact us for custom plan details.',
    pricePerUnit: 2400,
    unit: 'piece',
    turnaroundTime: 'Weekly Scheduled',
    icon: 'Calendar',
    popular: false,
    features: [
      'Regular scheduled pickups',
      'Cost savings for families',
      'Customized bundle options',
      'Dedicated customer care',
    ],
  },
  {
    id: 'pickup-and-delivery',
    title: 'Pickup & Delivery',
    slug: 'pickup-and-delivery',
    description: 'We collect your laundry from your doorstep in Kasur and return it fresh and clean.',
    pricePerUnit: 0,
    unit: 'suit',
    turnaroundTime: 'Doorstep',
    icon: 'Truck',
    popular: false,
    features: [
      'Direct collection at your gate',
      'Kasur-wide rider routes',
      'Sanitized delivery bags',
      'Real-time order tracking',
    ],
  },
];

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  pending_pickup: { label: 'Pickup Scheduled', color: 'bg-amber-100 text-amber-800 border-amber-300', step: 1 },
  picked_up: { label: 'Collected from Doorstep', color: 'bg-blue-100 text-blue-800 border-blue-300', step: 2 },
  processing: { label: 'In Washing Cycle', color: 'bg-aqua-100 text-navy-700 border-aqua-300', step: 3 },
  ironing: { label: 'Steam Pressing & QC', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', step: 4 },
  ready_for_delivery: { label: 'Packaged & Ready', color: 'bg-teal-100 text-teal-800 border-teal-300', step: 5 },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', step: 6 },
  delivered: { label: 'Delivered Clean & Fresh', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', step: 7 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300', step: 0 },
};
