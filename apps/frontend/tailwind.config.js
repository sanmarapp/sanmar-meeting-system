/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ceff',
          300: '#85a8ff',
          400: '#4d79ff',
          500: '#1a4bff',
          600: '#0033e6',
          700: '#0029b8',
          800: '#002196',
          900: '#001a78',
        },
        secondary: {
          50:  '#fdf8f0',
          100: '#faeedd',
          500: '#d4882a',
          600: '#b8701f',
          700: '#96581a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
