/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14171F',
          raised: '#1C2029',
          border: '#2A2F3B',
        },
        paper: {
          DEFAULT: '#EEF1F5',
          raised: '#FFFFFF',
          border: '#D8DEE6',
        },
        roj: {
          DEFAULT: '#E3A73C',
          soft: '#F0C979',
          deep: '#B5801F',
        },
        zagros: {
          DEFAULT: '#5C8A6E',
          soft: '#8FB39D',
          deep: '#3E6350',
        },
        slate: {
          light: '#4B5566',
          dark: '#9AA3B2',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', '"Noto Sans Arabic"', 'ui-serif', 'serif'],
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ray-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ray-spin-slow': 'ray-spin 8s linear infinite',
        'card-in': 'card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
