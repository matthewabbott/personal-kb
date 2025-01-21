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
        skin: {
          'bg': {
            primary: {
              DEFAULT: '#f8f3e9',    // Light mode
              dark: '#1a1614'        // Dark mode
            },
            secondary: {
              DEFAULT: '#ffffff',
              dark: '#252220'
            }
          },
          'text': {
            primary: {
              DEFAULT: '#2c1810',
              dark: '#e6ddd6'
            },
            secondary: {
              DEFAULT: '#6b4d3c',
              dark: '#b5a396'
            }
          },
          border: {
            DEFAULT: '#d4c5b9',
            dark: '#3d332d'
          },
          accent: {
            DEFAULT: '#843729',
            hover: '#6b2c21',
            dark: '#c25b4a',
            'dark-hover': '#d46d5c'
          },
          error: {
            bg: {
              DEFAULT: '#f8e6e6',
              dark: '#3d2724'
            },
            border: {
              DEFAULT: '#843729',
              dark: '#c25b4a'
            }
          },
        },
      },
      boxShadow: {
        'skin': '0 1px 3px var(--shadow-color)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}