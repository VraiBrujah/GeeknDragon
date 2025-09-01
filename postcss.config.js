// Configuration PostCSS pour transformer et minifier le CSS
// Ajoute Tailwind, Autoprefixer et, en production, CSSNano pour la minification
const plugins = {
  tailwindcss: {},
  autoprefixer: {},
};

if (process.env.NODE_ENV === 'production') {
  // CSSNano réduit la taille du fichier CSS pour un chargement plus rapide
  plugins.cssnano = {};
}

module.exports = {
  plugins,
};
