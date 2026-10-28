/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'neo-bg': '#dce5e0',
        'neo-canvas': '#ffffff',
        'neo-black': '#111215',
        'neo-dock': '#151618',
        'neo-dock-active': '#27282d',
        'neo-lime': '#e5fc73',
        'neo-lime-hover': '#d7f05a',
        'neo-border': '#f0f2f1',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '26px',
        'dock': '38px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
