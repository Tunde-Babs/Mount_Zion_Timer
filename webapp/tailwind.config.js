/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Cal Sans"', '"Inter var"', 'Inter', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        surface: {
          light: '#f8fafc',
          dark: '#0b0f1a'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.15), 0 8px 30px -8px rgba(99,102,241,0.35)',
        card: '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -8px rgba(15,23,42,0.12)'
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(1.6)', opacity: 0 }
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'flash-bg': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 }
        }
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up': 'slide-up 0.2s ease-out',
        'flash-bg': 'flash-bg 0.5s ease-in-out'
      }
    }
  },
  plugins: []
};
