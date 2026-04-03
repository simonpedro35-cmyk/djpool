/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        void: 'var(--color-void)',
        surface: 'var(--color-surface)',
        panel: 'var(--color-panel)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
        subtle: 'var(--color-subtle)',
        dim: 'var(--color-dim)',
        text: 'var(--color-text)',
        bright: 'var(--color-bright)',
        acid: 'var(--color-acid)',
        'acid-dim': 'var(--color-acid-dim)',
        cyan: 'var(--color-cyan)',
        'cyan-dim': 'var(--color-cyan-dim)',
        magenta: 'var(--color-magenta)',
        warn: 'var(--color-warn)',
      },
      animation: {
        'pulse-acid': 'pulse-acid 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        eq: 'eq 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-acid': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,255,0,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(200,255,0,0.25)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        eq: {
          from: { transform: 'scaleY(0.3)' },
          to: { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
