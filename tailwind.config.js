/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#dce8f2',
          200: '#bad4e6',
          300: '#8db9d5',
          400: '#5a99c0',
          500: '#173B57', // Primary Brand Navy
          600: '#13324a',
          700: '#0f273b',
          800: '#0c1f2e',
          900: '#07121b',
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
          500: '#409ca9',
          600: '#327f8b',
          700: '#2c6670',
          800: '#28545c',
          900: '#25474e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 59, 87, 0.08)',
        'soft-hover': '0 10px 25px -3px rgba(23, 59, 87, 0.12)',
        'card': '0 2px 12px 0 rgba(23, 59, 87, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

