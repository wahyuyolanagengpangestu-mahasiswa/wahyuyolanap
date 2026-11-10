/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#002046',
          container: '#1B365D',
          dark: '#00142D',
        },
        surface: {
          DEFAULT: '#F8F9FF',
          lowest: '#FFFFFF',
          low: '#EFF4FF',
          container: '#E5EEFF',
          high: '#DCE9FF',
          highest: '#D3E4FE',
        },
        teal: {
          DEFAULT: '#006A6A',
          container: '#90EFEF',
          glow: '#4EDEA3',
        },
        accentGreen: {
          DEFAULT: '#002718',
          light: '#4EDEA3',
        },
        gis: {
          dark: '#0F172A',
          darker: '#090D16',
          card: '#1E293B',
          border: '#334155',
        },
        urgency: {
          p0: '#BA1A1A',
          p0Bg: '#FFDAD6',
          p1: '#B45309',
          p1Bg: '#FEF3C7',
          p2: '#1D4ED8',
          p2Bg: '#DBEAFE',
          p3: '#475569',
          p3Bg: '#F1F5F9',
          success: '#15803D',
          successBg: '#DCFCE7',
        },
        brandText: {
          main: '#0B1C30',
          secondary: '#44474E',
          muted: '#74777F',
        }
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}

