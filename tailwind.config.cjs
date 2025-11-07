/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // New Electric Dark Theme
        'night-sky': '#0f172a', // Deep navy blue
        'deep-violet': '#1e1b4b', // Dark, rich violet
        'glass-surface': 'rgba(28, 25, 64, 0.4)', // Semi-transparent surface for cards
        'glass-border': 'rgba(107, 114, 128, 0.2)', // Subtle border for glassmorphism
        'glow-cyan': 'rgba(56, 189, 248, 0.5)', // Neon cyan for glows

        'electric-blue': '#3b82f6',
        'electric-blue-hover': '#60a5fa',
        'neon-cyan': '#06b6d4',
        'bright-violet': '#a78bfa',
        
        'text-primary': '#f8fafc', // Brighter white for primary text
        'text-secondary': '#94a3b8', // Softer gray for secondary text
        'text-accent': '#67e8f9', // Neon cyan for accents

        // Status Colors
        'status-green': '#22c55e',
        'error-red': '#ef4444',
        'warning-yellow': '#f59e0b',
        
        // --- Shared dark theme colors ---
        'primary-background': '#0f172a', // Re-mapped to night-sky
        'secondary-background': '#1f2937', // Re-mapped for compatibility
        'accent-blue': '#3b82f6', // Re-mapped to electric-blue
        'accent-blue-hover': '#60a5fa',
        'secondary-cyan': '#06b6d4', // Re-mapped to neon-cyan
        'success-green': '#22c55e',
        'text-light': '#f8fafc', // Re-mapped
        'text-muted': '#94a3b8', // Re-mapped
        'border-color': 'rgba(107, 114, 128, 0.2)', // Re-mapped
        
        // Original Light Theme Colors (for Public Site)
        'brand-blue': '#293B5F',
        'primary-green': '#10B981',
        'primary-blue': '#3B82F6',
        'accent-orange': '#F97316',
        'accent-orange-hover': '#EA580C',
        'accent-yellow': '#F59E0B',
        'accent-yellow-hover': '#D97706',
      },
      backgroundImage: {
        'electric-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 8px 0px var(--tw-shadow-color)',
        'glow-md': '0 0 16px 0px var(--tw-shadow-color)',
        'glow-lg': '0 0 24px 0px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 10px 0px var(--tw-shadow-color)',
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'marquee': 'marquee 40s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'border-spin': 'borderSpin 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
            '50%': { opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', boxShadow: '0 0 8px 0px var(--tw-shadow-color)' },
          '50%': { opacity: '1', boxShadow: '0 0 16px 2px var(--tw-shadow-color)' },
        },
        borderSpin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};