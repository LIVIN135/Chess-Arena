/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0E1116',
        surface: '#161B22',
        'surface-elevated': '#1F242C',
        border: '#21262D',
        'border-subtle': '#30363D',
        primary: {
          DEFAULT: '#7FB069',
          hover: '#90C27A',
          dark: '#5D8B49',
        },
        chess: {
          light: '#F0D9B5',
          dark: '#B58863',
          green: '#7FB069',
          'green-hover': '#90C27A',
          board: '#21262D',
        },
        text: {
          primary: '#F0F6FC',
          secondary: '#8B949E',
          muted: '#484F58',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
}
