/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Patient Interface Tokens (WCAG 2.1 AA Compliant - Light & High Contrast)
        patient: {
          canvas: '#FAF8F4',
          surface: '#FFFFFF',
          primary: '#1A1A1A',
          secondary: '#374151',
          accent: '#0B6E6E', // Deep NER Teal
          'accent-hover': '#085252',
          terracotta: '#B5502E', // NER Terracotta motif
          'terracotta-hover': '#963E20',
          success: '#2E7D32', // Muted gentle green
          hint: '#4B5563', // Neutral hint, never punitive red
          border: '#D1D5DB'
        },
        // Marketing / Dashboard Surface Tokens (Dark Canvas)
        marketing: {
          canvas: '#110F14',
          card: '#1B1820',
          'card-border': '#2D2937',
          primary: '#F5F3F0',
          secondary: '#A8A2AE',
          accent: '#E58A3C', // Warm Amber
          'accent-teal': '#0B6E6E'
        }
      },
      minHeight: {
        touch: '48px', // Exceeds WCAG 44px minimum for elderly motor-control
      },
      minWidth: {
        touch: '48px',
      },
      fontSize: {
        'patient-body': ['18px', { lineHeight: '1.6' }],
        'patient-prompt': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'patient-hero': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
