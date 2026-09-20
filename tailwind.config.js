/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        indic: ['var(--font-indic)'],
      },
      colors: {
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          sunken: 'var(--surface-sunken)',
        },
        border: {
          hairline: 'var(--border-hairline)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          inverse: 'var(--ink-inverse)',
        },
        brand: {
          muga: 'var(--color-muga)',
          'muga-dark': 'var(--color-muga-dark)',
          bamboo: 'var(--color-bamboo)',
          'bamboo-light': 'var(--color-bamboo-light)',
          gamosa: 'var(--color-gamosa-red)',
        }
      },
      borderRadius: {
        card: 'var(--radius-card)',
        btn: 'var(--radius-button)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        flat: 'var(--shadow-flat)',
      },
      minHeight: {
        touch: '80px', // 80x80px min touch targets
        'touch-clinical': '48px', // Clinical touch target
      },
      minWidth: {
        touch: '80px',
        'touch-clinical': '48px',
      },
    },
  },
  plugins: [],
}
