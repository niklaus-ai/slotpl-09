/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-motion': 'gradientMotion 10s ease infinite',
        shake: 'shake 0.5s ease-in-out 0s 5', 
        horizontalShuffle: 'horizontalShuffle 0.5s ease-out', 
      },
      keyframes: {
        gradientMotion: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        shake: {
          '0%': {
            transform: 'translateX(0)',
          },
          '25%': {
            transform: 'translateX(-10px)',
          },
          '50%': {
            transform: 'translateX(10px)',
          },
          '75%': {
            transform: 'translateX(-10px)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        horizontalShuffle: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
