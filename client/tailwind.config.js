/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Keeping this but default will be light
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue (Main)
          700: '#1d4ed8',
        },
        secondary: '#64748b', // Slate for secondary text
        surface: {
            DEFAULT: '#ffffff',
            50: '#f8fafc', // Very light grey for backgrounds
            100: '#f1f5f9',
        },
        dark: { // Legacy support or dark mode items
          bg: '#020617',     
          surface: '#0f172a',
          border: '#1e293b',  
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
