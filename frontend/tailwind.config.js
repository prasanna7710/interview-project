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
          50: '#F0F7FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        tealAccent: {
          50: '#F0FDF4',
          100: '#CCFBF1',
          500: '#0D9488',
          600: '#0F766E',
          700: '#115E59',
        },
        bgLight: '#FFFFFF',
        bgSection: '#F0F7FF',
        cardSurface: '#F8FAFC',
        darkText: '#0F172A',
        secText: '#64748B',
        borderColor: '#E2E8F0',
        successColor: '#10B981',
        warningColor: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px 0 rgba(15, 23, 42, 0.02)',
        card: '0 4px 6px -1px rgba(15, 23, 42, 0.03), 0 2px 4px -1px rgba(15, 23, 42, 0.02)',
        elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.025)',
      },
    },
  },
  plugins: [],
}
