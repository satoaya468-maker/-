import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /*
        Каждый цвет собирается из компонентов с плейсхолдером <alpha-value>:
        только так работают модификаторы вида bg-graphite-950/95.
      */
      colors: {
        graphite: {
          950: 'oklch(var(--graphite-950-c) / <alpha-value>)',
          900: 'oklch(var(--graphite-900-c) / <alpha-value>)',
          800: 'oklch(var(--graphite-800-c) / <alpha-value>)',
          700: 'oklch(var(--graphite-700-c) / <alpha-value>)',
          600: 'oklch(var(--graphite-600-c) / <alpha-value>)',
          500: 'oklch(var(--graphite-500-c) / <alpha-value>)',
        },
        bg: 'oklch(var(--bg-c) / <alpha-value>)',
        surface: 'oklch(var(--surface-c) / <alpha-value>)',
        'surface-sunk': 'oklch(var(--surface-sunk-c) / <alpha-value>)',
        ink: 'oklch(var(--ink-c) / <alpha-value>)',
        'ink-muted': 'oklch(var(--ink-muted-c) / <alpha-value>)',
        'ink-faint': 'oklch(var(--ink-faint-c) / <alpha-value>)',
        line: 'oklch(var(--line-c) / <alpha-value>)',
        'line-strong': 'oklch(var(--line-strong-c) / <alpha-value>)',
        hv: 'oklch(var(--hv-c) / <alpha-value>)',
        'hv-deep': 'oklch(var(--hv-deep-c) / <alpha-value>)',
        'hv-ink': 'oklch(var(--hv-ink-c) / <alpha-value>)',
        stock: 'oklch(var(--stock-c) / <alpha-value>)',
        danger: 'oklch(var(--danger-c) / <alpha-value>)',
      },

      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        e1: 'var(--e1)',
        e2: 'var(--e2)',
        e3: 'var(--e3)',
        e4: 'var(--e4)',
      },
      borderRadius: {
        card: '14px',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        sticky: '100',
        dropdown: '200',
        drawer: '300',
        'modal-backdrop': '400',
        modal: '410',
        chat: '500',
        toast: '600',
      },
    },
  },
  plugins: [],
};

export default config;
