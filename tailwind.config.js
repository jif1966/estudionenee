/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}', // Añadido por si usas el App Router en el futuro
  ],
  theme: {
    extend: {
      // Aquí podríamos agregar colores o fuentes personalizadas en el futuro
    },
  },
  plugins: [],
};