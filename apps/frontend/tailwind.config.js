/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sanmar Golden-Bronze primary scale
        primary: {
          50:  '#FAF7F4',
          100: '#F0E9E0',
          200: '#D4C9BE',
          300: '#B8A898',
          400: '#9C8770',
          500: '#826B52',  // ← Brand anchor
          600: '#6B5642',
          700: '#574535',
          800: '#3D3027',
          900: '#1A1614',
        },
        // Warm neutral greys (not cold)
        neutral: {
          50:  '#FAFAF9',
          100: '#F5F3F0',
          200: '#E8E4DF',
          300: '#D4CFC9',
          400: '#B8B0A8',
          500: '#9A8F87',
          600: '#6B6560',
          700: '#4A4540',
          800: '#2D2A27',
          900: '#1A1614',
        },
        // Semantic
        success: { DEFAULT: '#15803D', light: '#ECFDF5', border: '#BBF7D0' },
        warning: { DEFAULT: '#D97706', light: '#FFFBEB', border: '#FDE68A' },
        danger:  { DEFAULT: '#DC2626', light: '#FEF2F2', border: '#FECACA' },
        info:    { DEFAULT: '#2563EB', light: '#EFF6FF', border: '#BFDBFE' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['"Fira Code"', '"Fira Mono"', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['12px', { lineHeight: '18px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'md':   ['14px', { lineHeight: '22px' }],
        'lg':   ['15px', { lineHeight: '24px' }],
        'xl':   ['18px', { lineHeight: '28px' }],
        '2xl':  ['22px', { lineHeight: '32px' }],
        '3xl':  ['28px', { lineHeight: '36px' }],
        '4xl':  ['36px', { lineHeight: '44px' }],
      },
      borderRadius: {
        'sm':  '5px',
        DEFAULT: '7px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(26,22,20,0.04)',
        'sm':  '0 1px 3px rgba(26,22,20,0.06), 0 1px 2px rgba(26,22,20,0.04)',
        DEFAULT: '0 2px 6px rgba(26,22,20,0.06), 0 1px 2px rgba(26,22,20,0.04)',
        'md':  '0 4px 12px rgba(26,22,20,0.08), 0 2px 4px rgba(26,22,20,0.04)',
        'lg':  '0 8px 24px rgba(26,22,20,0.10), 0 4px 8px rgba(26,22,20,0.06)',
        'xl':  '0 16px 40px rgba(26,22,20,0.12)',
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
      },
      maxWidth: {
        'content': '1280px',
        'form':    '480px',
        'card':    '320px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer:        'shimmer 1.6s ease-in-out infinite',
        'fade-in':      'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-up':  'slide-in-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
