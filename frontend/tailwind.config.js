/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#daeaff',
          200: '#bcd8ff',
          300: '#8fbfff',
          400: '#5b9dff',
          500: '#3b82f6',
          600: '#2463d6',
          700: '#1d4db3',
          800: '#1b418f',
          900: '#19386f',
        }
      }
    },
  },
  plugins: [],
}

