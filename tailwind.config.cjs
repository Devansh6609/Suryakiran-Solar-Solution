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
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        /* ---- CRM Design System v2 (CSS variable–based) ---- */

        // Surfaces
        'surface-0':  'rgb(var(--surface-0) / <alpha-value>)',
        'surface-1':  'rgb(var(--surface-1) / <alpha-value>)',
        'surface-2':  'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3':  'rgb(var(--surface-3) / <alpha-value>)',

        // Borders
        'border-default': 'rgb(var(--border-default) / <alpha-value>)',
        'border-muted':   'rgb(var(--border-muted) / <alpha-value>)',
        'border-strong':  'rgb(var(--border-strong) / <alpha-value>)',

        // Brand accent (Solar Amber)
        'accent':       'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'accent-muted': 'rgb(var(--accent-muted) / <alpha-value>)',
        'accent-text':  'rgb(var(--accent-text) / <alpha-value>)',

        // Text scale
        'text-0': 'rgb(var(--text-0) / <alpha-value>)',
        'text-1': 'rgb(var(--text-1) / <alpha-value>)',
        'text-2': 'rgb(var(--text-2) / <alpha-value>)',
        'text-3': 'rgb(var(--text-3) / <alpha-value>)',
        'text-inv': 'rgb(var(--text-inv) / <alpha-value>)',

        // Sidebar
        'sidebar-bg':     'rgb(var(--sidebar-bg) / <alpha-value>)',
        'sidebar-border': 'rgb(var(--sidebar-border) / <alpha-value>)',
        'topbar-bg':      'rgb(var(--topbar-bg) / <alpha-value>)',

        // Semantic statuses
        'clr-success': 'rgb(var(--color-success) / <alpha-value>)',
        'clr-danger':  'rgb(var(--color-danger) / <alpha-value>)',
        'clr-info':    'rgb(var(--color-info) / <alpha-value>)',
        'clr-warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'clr-violet':  'rgb(var(--color-violet) / <alpha-value>)',
        'clr-cyan':    'rgb(var(--color-cyan) / <alpha-value>)',
        'clr-orange':  'rgb(var(--color-orange) / <alpha-value>)',

        /* ---- Legacy aliases (keep so old pages don't break at compile) ---- */
        'night-sky':      'rgb(var(--surface-0) / <alpha-value>)',
        'glass-surface':  'rgb(var(--surface-1) / <alpha-value>)',
        'glass-border':   'rgb(var(--border-default) / <alpha-value>)',
        'text-primary':   'rgb(var(--text-0) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-2) / <alpha-value>)',
        'text-accent':    'rgb(var(--accent-text) / <alpha-value>)',
        'neon-cyan':      'rgb(var(--color-cyan) / <alpha-value>)',
        'electric-blue':  'rgb(var(--color-info) / <alpha-value>)',
        'bright-violet':  'rgb(var(--color-violet) / <alpha-value>)',
        'status-green':   'rgb(var(--color-success) / <alpha-value>)',
        'error-red':      'rgb(var(--color-danger) / <alpha-value>)',
        'warning-yellow': 'rgb(var(--color-warning) / <alpha-value>)',
        'success-green':  'rgb(var(--color-success) / <alpha-value>)',

        /* ---- Public Site Colors (unchanged) ---- */
        'varcas-navy':   '#011B44',
        'solar-gold':    '#FFB800',
        'solar-amber':   '#E6A700',
        'aurora-blue':   '#003E8C',
        'cloud-white':   '#F8FAFC',
        'brand-blue':    '#011B44',
        'primary-green': '#10B981',
        'primary-blue':  '#003E8C',
        'accent-orange': '#FFB800',
        'accent-orange-hover': '#E6A700',
        'accent-yellow': '#FFB800',
        'accent-yellow-hover': '#E6A700',
      },

      boxShadow: {
        'sm':    'var(--shadow-sm)',
        'md':    'var(--shadow-md)',
        'lg':    'var(--shadow-lg)',
        'xl':    'var(--shadow-xl)',
        // Legacy glow shadows
        'glow-sm': '0 0 8px 0px var(--tw-shadow-color)',
        'glow-md': '0 0 16px 0px var(--tw-shadow-color)',
        'glow-lg': '0 0 24px 0px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 10px 0px var(--tw-shadow-color)',
      },

      borderRadius: {
        'DEFAULT': '8px',
        'sm':   '6px',
        'md':   '8px',
        'lg':   '10px',
        'xl':   '12px',
        '2xl':  '16px',
        '3xl':  '20px',
        '4xl':  '24px',
        'full': '9999px',
      },

      animation: {
        'fade-in':    'fadeIn 0.25s ease both',
        'fade-up':    'fadeUp 0.3s ease both',
        'slide-right': 'slideRight 0.3s ease both',
        'spin':       'spin 1s linear infinite',
        'pulse':      'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
        // Legacy animations (public site)
        'marquee':    'marquee 40s linear infinite',
        'blink':      'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'border-spin': 'borderSpin 4s linear infinite',
        'fade-in-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in-right': 'slideRight 0.5s ease-out forwards',
      },

      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        spin:    { to: { transform: 'rotate(360deg)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        // Legacy
        marquee:   { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
        blink:     { '50%': { opacity: '0' } },
        pulseGlow: { '0%, 100%': { opacity: '0.7', boxShadow: '0 0 8px 0px var(--tw-shadow-color)' }, '50%': { opacity: '1', boxShadow: '0 0 16px 2px var(--tw-shadow-color)' } },
        borderSpin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};