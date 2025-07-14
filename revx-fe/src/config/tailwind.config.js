/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',  // Scans all js, ts, jsx, and tsx files in pages directory
      './components/**/*.{js,ts,jsx,tsx}', // Scans all js, ts, jsx, and tsx files in components directory
      './app/**/*.{js,ts,jsx,tsx}', // If you're using the app directory (for Next.js 13+)
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  