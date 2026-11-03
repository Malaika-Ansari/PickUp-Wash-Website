export const BRAND_COLORS = {
  navy: {
    hex: '#173B57',
    rgb: 'rgb(23, 59, 87)',
    name: 'Primary Navy Blue',
    role: 'Primary brand colour, main buttons, primary headers, dark navigation accents',
    textContrast: '#FFFFFF',
  },
  ice: {
    hex: '#EAF3F8',
    rgb: 'rgb(234, 243, 248)',
    name: 'Ice Blue',
    role: 'Main application background, calm canvas, light card backgrounds',
    textContrast: '#102B40',
  },
  aqua: {
    hex: '#65B9C5',
    rgb: 'rgb(101, 185, 197)',
    name: 'Accent Aqua',
    role: 'Highlights, focus rings, call-to-action badges, interactive accents',
    textContrast: '#102B40',
  },
  white: {
    hex: '#FFFFFF',
    rgb: 'rgb(255, 255, 255)',
    name: 'Pure White',
    role: 'Cards, inputs, modal dialogs, and elevated content surfaces',
    textContrast: '#102B40',
  },
  darkNavy: {
    hex: '#102B40',
    rgb: 'rgb(16, 43, 64)',
    name: 'Dark Navy',
    role: 'Primary body text, high-contrast headings, deep footer sections',
    textContrast: '#FFFFFF',
  },
} as const;

export const TYPOGRAPHY_SCALE = {
  display: 'font-poppins text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight',
  h1: 'font-poppins text-3xl sm:text-4xl font-extrabold tracking-tight',
  h2: 'font-poppins text-2xl sm:text-3xl font-bold tracking-tight',
  h3: 'font-poppins text-xl sm:text-2xl font-bold',
  h4: 'font-poppins text-lg sm:text-xl font-semibold',
  h5: 'font-poppins text-base font-semibold',
  bodyLead: 'font-inter text-base sm:text-lg text-darkNavy/80 leading-relaxed',
  body: 'font-inter text-sm sm:text-base text-darkNavy/85 leading-normal',
  bodySmall: 'font-inter text-xs sm:text-sm text-darkNavy/70 leading-normal',
  caption: 'font-inter text-xs text-darkNavy/60 uppercase tracking-wider font-semibold',
} as const;

export const BORDER_RADIUS = {
  sm: 'rounded-lg',     // 8px
  md: 'rounded-xl',    // 12px
  lg: 'rounded-2xl',   // 16px
  xl: 'rounded-3xl',   // 24px
  full: 'rounded-full', // Pills
} as const;

export const SHADOWS = {
  soft: 'shadow-soft',
  softHover: 'shadow-soft-hover',
  card: 'shadow-card',
  aqua: 'shadow-aqua',
  navy: 'shadow-navy',
  modal: 'shadow-modal',
} as const;

