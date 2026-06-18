/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    'bg-red-50', 'bg-red-100', 'bg-red-500',
    'bg-amber-50', 'bg-amber-100',
    'bg-blue-50', 'bg-blue-100',
    'bg-gray-50', 'bg-gray-100',
    'border-red-100', 'border-amber-100', 'border-blue-100', 'border-gray-100', 'border-navy-300',
    'text-red-600', 'text-red-700',
    'text-amber-500', 'text-amber-600', 'text-amber-700',
    'text-blue-600', 'text-blue-700',
    'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700',
    'text-navy-300', 'text-navy-500', 'text-navy-600', 'text-navy-700',
    'bg-navy-50', 'bg-navy-100', 'bg-navy-700',
    'border-navy-100',
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          500: '#334e7a',
          600: '#2a4065',
          700: '#1e3a5f',
          800: '#162a47',
          900: '#0f1e33',
          950: '#0a1422',
        },
        sentiment: {
          positive: '#059669',
          neutral: '#6b7280',
          negative: '#dc2626',
          doubtful: '#f59e0b',
          risk: '#b91c1c',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.1)' },
        },
        'highlight': {
          '0%': { backgroundColor: 'rgba(250, 204, 21, 0)' },
          '30%': { backgroundColor: 'rgba(250, 204, 21, 0.35)' },
          '100%': { backgroundColor: 'rgba(250, 204, 21, 0.15)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'highlight': 'highlight 1s ease-out forwards',
      },
      borderRadius: {
        'sm': '2px',
      }
    },
  },
  plugins: [],
};
