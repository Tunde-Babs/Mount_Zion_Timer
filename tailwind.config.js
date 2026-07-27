/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712',
        }
      }
    },
  },
  plugins: [],
}
