js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#0a2547',
          800: '#081c37',
          900: '#051124', // This is close to the dark navy color in mPragati's navbar
        }
      }
    },
  },
  plugins: [],
}