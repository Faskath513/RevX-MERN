/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}', // Add this if you're using the app directory in Next.js
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  