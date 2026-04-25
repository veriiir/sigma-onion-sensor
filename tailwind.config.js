/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Berdasarkan palet "Vivid Earth" yang Anda kirim
        primary: {
          DEFAULT: '#2E7D32', // Forest Green
          light: '#E8F5E9',
        },
        secondary: {
          DEFAULT: '#0288D1', // Sky Blue
          light: '#E1F5FE',
        },
        tertiary: {
          DEFAULT: '#A05220', // Soil Brown
          light: '#FBE9E7',
        },
        neutral: {
          surface: '#F8F9F8', // Background krim/abu sangat muda seperti di foto
          muted: '#747970',
        }
      },
      borderRadius: {
        '4xl': '2.5rem', // Sesuai permintaan Anda untuk lekukan modal yang dalam
      },
      fontFamily: {
        // Sesuaikan dengan referensi (Manrope adalah pilihan terbaik untuk style ini)
        sans: ['Manrope', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};