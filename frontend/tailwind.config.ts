/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode (primary)
        'bg-primary': '#0f0f0f',    // Pure black
        'bg-secondary': '#1a1a1a',  // Deep slate
        'bg-tertiary': '#2a2a2a',   // Lighter slate
        
        // Neon accents
        'neon-pink': '#ff006e',
        'neon-cyan': '#00f5ff',
        'neon-purple': '#b700ff',
        'neon-green': '#39ff14',
        'neon-yellow': '#ffff00',
        
        // Status colors
        'status-free': '#39ff14',   // Neon green
        'status-chill': '#00f5ff',  // Neon cyan
        'status-active': '#ff006e', // Neon pink
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'base': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'neon-pink': '0 0 10px rgba(255, 0, 110, 0.5)',
        'neon-cyan': '0 0 10px rgba(0, 245, 255, 0.5)',
        'neon-glow': '0 0 20px rgba(57, 255, 20, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(57, 255, 20, 0.5)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(57, 255, 20, 0.8)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
