/** @type {import('tailwindcss').Config} */
module.exports = {
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
        void:    '#080A0F',
        surface: '#0E1118',
        panel:   '#141820',
        border:  '#1E2530',
        muted:   '#2A3342',
        subtle:  '#4A5568',
        dim:     '#718096',
        text:    '#E2E8F0',
        bright:  '#F7FAFC',
        acid:    '#C8FF00',
        'acid-dim': '#8AB500',
        cyan:    '#00E5FF',
        'cyan-dim': '#0099AA',
        magenta: '#FF00C8',
        warn:    '#FF6B35',
      },
      animation: {
        'pulse-acid': 'pulse-acid 2s ease-in-out infinite',
        'slide-in':   'slide-in 0.3s ease-out',
        'fade-in':    'fade-in 0.4s ease-out',
        'eq':         'eq 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-acid': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,255,0,0)' },
          '50%':       { boxShadow: '0 0 20px 4px rgba(200,255,0,0.25)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        eq: {
          from: { transform: 'scaleY(0.3)' },
          to:   { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
