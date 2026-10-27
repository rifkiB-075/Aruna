import type { Config } from 'tailwindcss';

// Token mengikuti docs/02-DESIGN-SYSTEM.md. Nilai warna adalah usulan netral, bukan warna resmi.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 100: 'var(--color-primary-100)', 600: 'var(--color-primary-600)', 700: 'var(--color-primary-700)' },
        accent: { 600: 'var(--color-accent-600)' },
        neutral: {
          50: 'var(--color-neutral-50)',
          200: 'var(--color-neutral-200)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        surface: 'var(--color-surface)',
        success: { 700: 'var(--color-success-700)' },
        warning: { 700: 'var(--color-warning-700)' },
        danger: { 700: 'var(--color-danger-700)' },
        info: { 700: 'var(--color-info-700)' },
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      fontSize: {
        display: ['2.25rem', { lineHeight: '2.75rem' }],
        h1: ['1.875rem', { lineHeight: '2.375rem' }],
        h2: ['1.5rem', { lineHeight: '2rem' }],
        h3: ['1.25rem', { lineHeight: '1.75rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.875rem' }],
        body: ['1rem', { lineHeight: '1.625rem' }],
      },
      borderRadius: { sm: '6px', md: '10px', lg: '16px' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
};

export default config;
