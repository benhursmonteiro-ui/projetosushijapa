/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        japaBg: '#0B0B0C',
        japaCard: '#121214',
        japaCardLight: '#1E1E22',
        japaRed: '#E50914',
        japaRedDark: '#9B1C1C',
        japaGold: '#D4AF37',
        japaGoldLight: '#F3C623',
        japaGoldDark: '#9A7B2C',
        japaText: '#E2E8F0',
        japaTextMuted: '#888896',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
