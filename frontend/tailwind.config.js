/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF9800',
        'primary-dark': '#e68900',
        'dark-bg': '#1C1C1C',
        'card-bg': '#252540',
        'header-bg': '#232323',
      },
    },
  },
  plugins: [],
}
