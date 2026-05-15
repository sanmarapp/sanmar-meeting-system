const colors = require('./colors.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:   colors.brand.primary,
        secondary: colors.brand.secondary,
        neutral:   colors.brand.neutral,
        success:   colors.semantic.success,
        warning:   colors.semantic.warning,
        danger:    colors.semantic.danger,
        info:      colors.semantic.info,
      },
      fontFamily: {
        sans:  ['Inter', 'Segoe UI', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
};
