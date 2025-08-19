/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{php,html,js}", "!./node_modules/**"],
  safelist: ['z-[1200]'],
  theme: {
    extend: {
      fontFamily: {
        body: ['"EB Garamond"', 'serif'],
        title: ['"Cinzel"', 'serif'],
      },
    },
  },
  plugins: [],
}

