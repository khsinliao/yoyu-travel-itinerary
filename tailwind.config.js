/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        travel: {
          dark: '#0f172a', // slate-950
          card: '#1e293b', // slate-800
          accent: '#f59e0b', // amber-500
          text: '#f1f5f9', // slate-100
          muted: '#94a3b8', // slate-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}