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
          blue: '#155EEF',
          'blue-hover': '#1148B8',
          'blue-light': '#EFF4FF',
          teal: '#0D9488',
          'teal-light': '#F0FDFA',
          bg: '#F7F9FC',
          navy: '#101828',
          text: '#172033',
          muted: '#667085',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
