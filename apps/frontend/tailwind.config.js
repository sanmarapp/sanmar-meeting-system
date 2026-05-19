/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Sanmar Brand — Golden-Bronze primary ─────────────────
        primary: {
          25:  '#FDFCFB',
          50:  '#FAF7F4',
          100: '#F0E9E0',
          200: '#D4C9BE',
          300: '#B8A898',
          400: '#9C8770',
          500: '#826B52',   // ← Brand anchor (buttons, accents)
          600: '#6B5642',
          700: '#574535',
          800: '#3D3027',
          900: '#1A1614',   // ← Sidebar background
        },
        // ── Warm neutrals (slightly warmer than pure grey) ───────
        neutral: {
          0:   '#FFFFFF',
          25:  '#FDFCFB',
          50:  '#FAF9F8',
          75:  '#F7F6F5',   // ← App background
          100: '#F0EFED',
          150: '#E8E5E2',
          200: '#DDDBD8',
          300: '#C5C2BE',
          400: '#A8A49F',
          500: '#8A8580',
          600: '#6B6560',
          700: '#4A4540',
          800: '#2D2A27',
          850: '#211E1B',
          900: '#1A1614',
        },
        // ── Semantic ─────────────────────────────────────────────
        success: {
          DEFAULT: '#16A34A',
          50:      '#F0FDF4',
          100:     '#DCFCE7',
          200:     '#BBF7D0',
          600:     '#15803D',
          700:     '#166534',
        },
        warning: {
          DEFAULT: '#D97706',
          50:      '#FFFBEB',
          100:     '#FEF3C7',
          200:     '#FDE68A',
          600:     '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',
          50:      '#FEF2F2',
          100:     '#FEE2E2',
          200:     '#FECACA',
          600:     '#B91C1C',
        },
        info: {
          DEFAULT: '#2563EB',
          50:      '#EFF6FF',
          100:     '#DBEAFE',
          200:     '#BFDBFE',
          600:     '#1D4ED8',
        },
        gold: {
          DEFAULT: '#C9A97A',
          light:   'rgba(201,169,122,0.14)',
          muted:   'rgba(201,169,122,0.55)',
          border:  'rgba(201,169,122,0.20)',
        },
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],  // login/branding only
        sans:    ['"Brown Pro"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono:    ['"Fira Code"', '"Fira Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs':  ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
        'xs':   ['11px', { lineHeight: '16px' }],
        'sm':   ['12px', { lineHeight: '18px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'md':   ['14px', { lineHeight: '22px' }],
        'lg':   ['15px', { lineHeight: '24px' }],
        'xl':   ['17px', { lineHeight: '26px' }],
        '2xl':  ['20px', { lineHeight: '28px' }],
        '3xl':  ['24px', { lineHeight: '32px' }],
        '4xl':  ['30px', { lineHeight: '38px' }],
        '5xl':  ['36px', { lineHeight: '44px' }],
      },
      fontWeight: {
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter:  '-0.02em',
        tight:    '-0.01em',
        normal:   '0em',
        wide:     '0.02em',
        wider:    '0.06em',
        widest:   '0.12em',
        caps:     '0.08em',
      },
      lineHeight: {
        none:     '1',
        tight:    '1.2',
        snug:     '1.35',
        normal:   '1.5',
        relaxed:  '1.65',
      },

      // ── Borders & Radius ───────────────────────────────────────
      borderRadius: {
        'none':  '0px',
        'xs':    '3px',
        'sm':    '5px',
        DEFAULT: '6px',
        'md':    '8px',
        'lg':    '10px',
        'xl':    '12px',
        '2xl':   '16px',
        '3xl':   '20px',
        'full':  '9999px',
      },

      // ── Elevation / Shadows ────────────────────────────────────
      boxShadow: {
        'none':  'none',
        'xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'sm':    '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        DEFAULT: '0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':    '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'lg':    '0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        'xl':    '0 16px 40px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.04)',
        '2xl':   '0 24px 64px rgba(0,0,0,0.12)',
        // UI-specific
        'button':   '0 1px 2px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.12)',
        'input':    '0 1px 2px rgba(0,0,0,0.05), 0 0 0 0px rgba(130,107,82,0)',
        'input-focus': '0 0 0 3px rgba(130,107,82,0.12)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'sidebar':  '1px 0 0 rgba(255,255,255,0.06)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
        'modal':    '0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)',
      },

      // ── Spacing ────────────────────────────────────────────────
      spacing: {
        '0.5':  '2px',
        '1':    '4px',
        '1.5':  '6px',
        '2':    '8px',
        '2.5':  '10px',
        '3':    '12px',
        '3.5':  '14px',
        '4':    '16px',
        '4.5':  '18px',
        '5':    '20px',
        '5.5':  '22px',
        '6':    '24px',
        '7':    '28px',
        '8':    '32px',
        '9':    '36px',
        '10':   '40px',
        '11':   '44px',
        '12':   '48px',
        '13':   '52px',
        '14':   '56px',
        '15':   '60px',
        '16':   '64px',
        '18':   '72px',
        '20':   '80px',
        '22':   '88px',
        '24':   '96px',
      },

      // ── Sizing ─────────────────────────────────────────────────
      height: {
        'input-sm': '32px',
        'input':    '38px',
        'input-lg': '42px',
        'header':   '56px',
        'sidebar':  '100vh',
      },

      // ── Max widths ─────────────────────────────────────────────
      maxWidth: {
        'xs':       '320px',
        'sm':       '480px',
        'md':       '640px',
        'lg':       '768px',
        'xl':       '960px',
        '2xl':      '1152px',
        'content':  '1280px',
        'wide':     '1440px',
        'form':     '440px',
        'card':     '320px',
      },

      // ── Z-index ────────────────────────────────────────────────
      zIndex: {
        '0':        '0',
        '10':       '10',
        '20':       '20',
        '30':       '30',   // overlay
        '40':       '40',   // sidebar
        '50':       '50',   // header
        '60':       '60',   // dropdown
        '70':       '70',   // modal backdrop
        '80':       '80',   // modal
        '90':       '90',   // toast
        '100':      '100',  // tooltip
      },

      // ── Transitions ────────────────────────────────────────────
      transitionDuration: {
        '75':   '75ms',
        '100':  '100ms',
        '150':  '150ms',
        '200':  '200ms',
        '300':  '300ms',
        '400':  '400ms',
        '500':  '500ms',
      },
      transitionTimingFunction: {
        'DEFAULT':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'in':        'cubic-bezier(0.4, 0, 1, 1)',
        'out':       'cubic-bezier(0, 0, 0.2, 1)',
        'spring':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      // ── Keyframes & Animations ─────────────────────────────────
      keyframes: {
        // Skeleton shimmer
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        // Entry animations
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Notification dot pulse
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.2)' },
        },
        // Spinner
        'spin': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer:          'shimmer 1.8s ease-in-out infinite',
        'fade-in':        'fade-in 0.15s ease-out',
        'fade-up':        'fade-up 0.2s ease-out',
        'fade-down':      'fade-down 0.2s ease-out',
        'slide-in-left':  'slide-in-left 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.22s ease-out',
        'scale-in':       'scale-in 0.15s ease-out',
        'pulse-dot':      'pulse-dot 2s ease-in-out infinite',
        'spin':           'spin 0.7s linear infinite',
      },
    },
  },
  plugins: [],
};
