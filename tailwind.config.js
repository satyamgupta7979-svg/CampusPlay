/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#18211e',
        paper: '#f6f7f2',
        lime: '#c8f169',
        forest: '#1c342b',
        soft: '#e9ede5',
      },
      boxShadow: { card: '0 14px 42px rgba(20, 32, 27, .06)' },
    },
  },
  plugins: [],
}
