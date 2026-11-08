/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cic: {
          orange: '#E65100',
          blue: '#0288D1',
          yellow: '#FBC02D',
          green: '#4CAF50',
          dark: '#1E293B',
        },
      },
    },
  },
  plugins: [],
};
