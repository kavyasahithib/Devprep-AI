/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vanilla: "#FAECB6",
        teal: "#2BBAA5",
        mint: "#93D3AE",
        sun: "#F9A822",
        coral: "#F96635",
        darkTeal: "#114a42",
      },
    },
  },
  plugins: [],
}