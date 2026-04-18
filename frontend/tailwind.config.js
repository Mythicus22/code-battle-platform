/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#080b14',
        primary: {
          400: '#5df1ff',
          500: '#00f2ff',
          600: '#00cbe6',
          700: '#0097ab',
        },
        secondary: {
          400: '#d74cff',
          500: '#bc00ff',
          600: '#9500cc',
        },
        success: {
          400: '#1aff8e',
          500: '#00ff88',
          600: '#00e676',
          700: '#00cc61',
        },
        danger: {
          400: '#ff1a54',
          500: '#ff3366',
          600: '#e62e5c',
          700: '#cc2952',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'enter': 'enter 0.2s ease-out',
        'leave': 'leave 0.15s ease-in forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(0, 242, 255, 0.5)' },
          '50%': { opacity: '.7', boxShadow: '0 0 30px rgba(0, 242, 255, 0.8)' },
        },
        enter: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        leave: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};