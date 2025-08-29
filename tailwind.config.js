/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./assets/js/**/*.js",
    "./themes/hugoplate/layouts/**/*.html",
    "./themes/hugoplate/assets/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb',
        'secondary': '#475569',
        'body': '#f8fafc',
        'text': '#334155',
        'light': '#64748b',
        'dark': '#0f172a',
        'darkmode-body': '#0f172a',
        'darkmode-text': '#e2e8f0',
        'darkmode-light': '#94a3b8',
        'darkmode-dark': '#f1f5f9',
        'theme-light': '#f1f5f9',
        'darkmode-theme-light': '#1e293b',
        'border': '#e2e8f0',
        'darkmode-border': '#334155',
      },
      fontSize: {
        'base': '16px',
        'base-sm': '14px',
        'h1': '3rem',
        'h1-sm': '2.5rem',
        'h2': '2.5rem',
        'h2-sm': '2rem',
        'h3': '2rem',
        'h3-sm': '1.75rem',
        'h4': '1.5rem',
        'h5': '1.25rem',
        'h6': '1.125rem',
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'secondary': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}