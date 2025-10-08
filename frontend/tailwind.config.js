/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: { /* ... (all your shadcn colors) ... */ },
      borderRadius: { /* ... */ },
      keyframes: { /* ... */ },
      animation: { /* ... */ },
    },
  },
  plugins: [require("tailwindcss-animate")],
}