/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/src/**/*.{js,jsx}', './generator/templates/**/*.html'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        graphite: '#334155',
        mist: '#e2e8f0',
        teal: '#0f766e',
        amber: '#d97706',
      },
      boxShadow: {
        document: '0 24px 70px rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
