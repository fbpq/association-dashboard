/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f7fd',
          100: '#d9ebf7',
          200: '#aed2ef',
          300: '#75b2e3',
          400: '#4592d4',
          500: '#2d82c4',
          600: '#2174b8',
          700: '#1a5e97',
          800: '#154974',
          900: '#0f3455',
          950: '#0a2238',
        },
        success: {
          50:  '#f3f8ec',
          100: '#e4f0d2',
          200: '#c7e0a7',
          300: '#a2cc76',
          400: '#8bb954',
          500: '#7fa343',
          600: '#6b8b38',
          700: '#55702d',
          800: '#415623',
          900: '#2c3a18',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        surface: '#FFFFFF',
        background: '#F1F5F9',
        border: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 6px 18px rgba(0,0,0,0.08)',
        'card-hover':'0 10px 26px rgba(33,116,184,0.25)',
        glow:       '0 0 0 3px rgba(33,116,184,0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'spin-slow':  'spin 2s linear infinite',
        'pulse-soft': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-12px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
