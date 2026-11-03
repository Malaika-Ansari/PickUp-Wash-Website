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

export const CORE_SERVICES: ServiceItem[] = [
  {
    id: 'wash-and-iron',
    title: 'Wash & Steam Iron',
    slug: 'wash-and-iron',
    description: 'Complete premium care: deep hygienic washing, softening rinse, crisp steam press, and hanger or folded packaging.',
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
    id: 'steam-iron-only',
    title: 'Steam Ironing Only',
    slug: 'steam-iron-only',
    description: 'Wrinkle-free, sharp pressing for shalwar kameez, formal shirts, suits, and everyday wear.',
    pricePerUnit: 60,
    unit: 'suit',
    turnaroundTime: 'Same Day / 24 Hours',
    icon: 'Flame',
    features: [
      'Gentle fabric protection',
      'Crisp collar & cuff finishing',
      'Hanger or neat fold option',
      'Fast doorstep return',
    ],
  },
  {
    id: 'wash-and-fold',
    title: 'Wash & Fold (Bulk Laundry)',
    slug: 'wash-and-fold',
    description: 'Ideal for busy families and students: casual daily clothes, t-shirts, towels, and bed linens washed and neatly folded.',
    pricePerUnit: 160,
    unit: 'kg',
    turnaroundTime: '24 Hours',
    icon: 'Layers',
    popular: false,
    features: [
      'Weighed accurately upon pickup',
      'Hypoallergenic wash cycle',
      'Precision fold & pack',
      'Economical bulk rates',
    ],
  },
  {
    id: 'bedding-heavy',
    title: 'Bedding, Blankets & Curtains',
    slug: 'bedding-heavy',
    description: 'Specialized deep cleaning for heavy winter quilts, comforters, blankets, bedsheets, and window curtains.',
    pricePerUnit: 650,
    unit: 'piece',
    turnaroundTime: '48–72 Hours',
    icon: 'Package',
    features: [
      'Industrial gentle tumbling',
      'Dust-mite & allergen removal',
      'Odor neutralization',
      'Protective moisture-proof bags',
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

