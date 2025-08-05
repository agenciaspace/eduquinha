/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: '#3B82F6',       // azul-claro
        mint:    '#6EE7B7',       // verde menta
        yellow:  '#FDE68A',       // amarelo suave
      }
    },
  },
  plugins: [],
}