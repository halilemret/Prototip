/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        onyx: {
          bg: '#0A0A0A',
          surface: '#141414',
          elevated: '#1E1E1E',
          border: '#2A2A2A',
          text: '#FAFAFA',
          muted: '#6B6B6B',
          action: '#FF6B35',
          actionHover: '#FF8255',
          success: '#4ADE80',
          warning: '#FBBF24',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'onyx': '12px',
        'onyx-lg': '16px',
        'onyx-xl': '24px',
      },
      boxShadow: {
        'onyx': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'onyx-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
