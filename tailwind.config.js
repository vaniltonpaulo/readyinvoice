import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/src/**/*.{js,jsx}', './generator/templates/**/*.html'],
  theme: {
    extend: {
      colors: {
        ink:      '#0f172a',
        graphite: '#334155',
        mist:     '#e2e8f0',
        orange:   '#e05c25',
        amber:    '#d97706',
        cream:    '#faf9f6',
      },
      boxShadow: {
        document: '0 24px 70px rgba(15, 23, 42, 0.12)',
        card:     '4px 4px 0px #0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        readyinvoice: {
          'primary':          '#e05c25',
          'primary-content':  '#ffffff',
          'secondary':        '#0f172a',
          'secondary-content':'#ffffff',
          'accent':           '#d97706',
          'neutral':          '#334155',
          'base-100':         '#faf9f6',
          'base-200':         '#f1f5f9',
          'base-300':         '#e2e8f0',
          'base-content':     '#0f172a',
          'info':             '#2563eb',
          'success':          '#16a34a',
          'warning':          '#ca8a04',
          'error':            '#dc2626',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    darkTheme: false,
  },
}
