/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // TailwindCSS가 클라이언트에서 파일 시스템을 사용하지 않도록 설정
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: ['class'],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '2560px',
      },
      screens: {
        '2xl': '2560px',
        '3xl': '3840px',
      },
      colors: {
        brand: {
          primary: '#2864FF',
          bg: '#F7F8FA',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#6B7280',
        },
        state: {
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
} 