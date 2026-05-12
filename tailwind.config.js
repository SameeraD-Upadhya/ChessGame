/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon Cyberpunk
        cyber: {
          primary: '#00ffcc',
          secondary: '#ff00ff',
          accent: '#330066',
          bg: '#050505',
        },
        // Royal Gold
        royal: {
          primary: '#ffd700',
          secondary: '#8b4513',
          accent: '#ffffff',
          bg: '#1a1a1a',
        },
        // Cosmic Purple
        cosmic: {
          primary: '#9d00ff',
          secondary: '#2e004f',
          accent: '#ff00e5',
          bg: '#0a0014',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
