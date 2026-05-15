module.exports = {
  content: [
    './apps/frontend/src/**/*.{js,jsx,ts,tsx}',
    './apps/frontend/index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#826B52',
          50: '#F5F3F0',
          100: '#E8E3DC',
          200: '#D4C9B9',
          300: '#BFAD96',
          400: '#A08973',
          500: '#826B52',
          600: '#6A573F',
          700: '#51422E',
          800: '#38291D',
          900: '#1F140C'
        },
        accent: {
          gold: '#B8860B',
          copper: '#B6ADA3'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif']
      },
      borderRadius: {
        'sanmar': '0.375rem'
      }
    }
  },
  plugins: []
}
