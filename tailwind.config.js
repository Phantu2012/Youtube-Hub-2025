/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF0000',
        'primary-dark': '#CC0000',
        'light-bg': '#F9FAFB', // gray-50
        'light-card': '#FFFFFF',
        'light-text': '#111827', // gray-900
        'dark-bg': '#111827', // gray-900
        'dark-card': '#1F2937', // gray-800
        'dark-text': '#F9FAFB', // gray-50
      },
    },
  },
  plugins: [],
};