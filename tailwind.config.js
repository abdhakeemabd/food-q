/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e23744',
          hover: '#c92f3b',
          orange: '#f59e0b',
          dark: '#0f172a',
          card: '#1e293b',
          tertiary: '#334155',
        }
      }
    },
  },
  plugins: [],
}

