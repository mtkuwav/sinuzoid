/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Manrope', 'system-ui', 'sans-serif'], // Corps de texte
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'], // Titres
        'body': ['Manrope', 'system-ui', 'sans-serif'], // Alias pour le corps
        'heading': ['Space Grotesk', 'system-ui', 'sans-serif'], // Alias pour les titres
      },
    },
  },
  plugins: [],
}
