/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        paper: 'var(--paper)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          hover: 'var(--ink-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
          hover: 'var(--accent-hover)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'var(--warn-soft)',
          ink: 'var(--warn-ink)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
          ink: 'var(--danger-ink)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          strong: 'var(--rule-strong)',
        },
      },
      fontFamily: {
        serif: ['Georgia', '"Iowan Old Style"', '"Palatino Linotype"', '"Times New Roman"', 'serif'],
        mono: ['ui-monospace', '"Cascadia Code"', '"SFMono-Regular"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
