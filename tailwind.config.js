/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct brand palette
        brand: {
          navy: '#173B57',      // Primary brand colour
          ice: '#EAF3F8',       // Main background
          aqua: '#65B9C5',      // Accent and highlights
          white: '#FFFFFF',     // Cards and content surfaces
          darkNavy: '#102B40',  // Text and darker sections
        },
        navy: {
          50: '#f0f5fa',
          100: '#dce8f2',
          200: '#bad4e6',
          300: '#8db9d5',
          400: '#5a99c0',
          500: '#173B57', // Primary Brand Navy Blue
          600: '#13324a',
          700: '#102B40', // Dark Navy
          800: '#0d2233',
          900: '#081722',
          950: '#050f17',
        },
        darkNavy: {
          DEFAULT: '#102B40',
          50: '#f0f4f8',
          100: '#dce6f0',
          200: '#bad0e3',
          300: '#8db4d3',
          400: '#5c92c0',
          500: '#102B40', // Dark Navy
          600: '#0d2334',
          700: '#0a1b28',
          800: '#07131d',
          900: '#040b11',
        },
        ice: {
          50: '#f8fbfd',
          100: '#EAF3F8', // Background Ice Blue
          200: '#d5e7f2',
          300: '#b8d8ea',
          400: '#94c4e0',
          500: '#71b0d5',
        },
        aqua: {
          50: '#f0fafb',
          100: '#daf2f5',
          200: '#b9e6ec',
          300: '#8ad4df',
          400: '#65B9C5', // Accent Aqua
          500: '#4aa4b1',
          600: '#388b97',
          700: '#2f717b',
          800: '#295b63',
          900: '#254b52',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 43, 64, 0.07)',
        'soft-hover': '0 12px 28px -4px rgba(16, 43, 64, 0.12)',
        'card': '0 2px 12px 0 rgba(16, 43, 64, 0.05)',
        'aqua': '0 8px 24px -4px rgba(101, 185, 197, 0.35)',
        'navy': '0 8px 24px -4px rgba(23, 59, 87, 0.35)',
        'modal': '0 20px 40px -10px rgba(16, 43, 64, 0.25)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
