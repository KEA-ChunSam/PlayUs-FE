/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
      },
      animation: {
        'fade-out': 'fade-out 0.5s forwards',
      },
    },
  },
  plugins: [],
};

