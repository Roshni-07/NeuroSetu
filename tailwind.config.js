/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Patient & Clinical Interface Tokens (Human-Centric & WCAG 2.1 AA Compliant)
        patient: {
          canvas: '#FBFBFA',
          surface: '#FFFFFF',
          primary: '#0F172A', // Deep slate navy
          secondary: '#475569', // Muted slate
          muted: '#64748B',
          accent: '#0D9488', // Deep clinical teal
          'accent-hover': '#0F766E',
          'accent-light': '#F0FDFA',
          terracotta: '#C2410C', // Refined terracotta
          'terracotta-hover': '#9A3412',
          'terracotta-light': '#FFF7ED',
          success: '#059669', // Muted sage/emerald
          'success-light': '#ECFDF5',
          teal: '#D97706',
          'teal-light': '#FFFBEB',
          rose: '#E11D48',
          'rose-light': '#FFF1F2',
          hint: '#475569',
          border: '#E2E8F0',
          'border-subtle': '#F1F5F9',
          'border-strong': '#CBD5E1',
        },
        // Marketing / Dashboard Surface Tokens
        marketing: {
          canvas: '#0F172A',
          card: '#1E293B',
          'card-border': '#334155',
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          accent: '#0D9488',
          'accent-teal': '#0D9488'
        }
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'soft-md': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'soft-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.06)',
        'soft-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
      minHeight: {
        touch: '48px', // Exceeds WCAG 44px minimum for elderly motor-control
      },
      minWidth: {
        touch: '48px',
      },
      fontSize: {
        'patient-body': ['18px', { lineHeight: '1.6' }],
        'patient-prompt': ['22px', { lineHeight: '1.4', fontWeight: '600' }],
        'patient-hero': ['30px', { lineHeight: '1.25', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
