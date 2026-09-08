/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base palette (DESIGN.md) - used throughout the app
        'bg-base': '#011613',
        'accent-teal': '#27968F',
        'accent-green': '#72FF85',
        'accent-cyan': '#49EBF6',
        'text-primary': '#FFFFFF',
        // Warning states - ONLY for goal-progress indicators (DESIGN.md)
        'warn-amber': '#FFC24B',
        'warn-red': '#FF6B5E',
      },
      fontFamily: {
        sans: ['General Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
