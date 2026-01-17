/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        emerald: {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a6f4c5',
          300: '#6ee7a7',
          400: '#32d583',
          500: '#10b981',
          600: '#0b8f64',
          700: '#0a7554',
          800: '#0a5c43',
          900: '#0a4a39',
        },
      },
      boxShadow: {
        soft: '0 20px 60px -24px rgba(16, 185, 129, 0.35)',
        card: '0 18px 48px -16px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
