import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#1E293B',
          amber: '#F59E0B',
          'amber-light': '#FCD34D',
          green: '#10B981',
          'green-light': '#34D399',
          red: '#EF4444',
          'red-light': '#F87171',
        },
        surface: {
          primary: '#F8FAFC',
          secondary: '#FFFFFF',
          card: '#FFFFFF',
          'card-hover': '#F8FAFC',
        },
        slate: {
          750: '#293548',
          850: '#172033',
        }
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'elevated': '0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in': 'slideInLeft 0.3s ease-out both',
        'scale-in': 'scaleIn 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
