const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Intl: 'readonly',
        requestAnimationFrame: 'readonly',
        IntersectionObserver: 'readonly',
        AudioContext: 'readonly',
        Image: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        navigator: 'readonly',
        getComputedStyle: 'readonly',
        queueMicrotask: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn', // Avertissement pour les console.log
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error'
    },
    ignores: [
      'node_modules/**', 
      'css/**', 
      'vendor/**',
      '**/*.min.js',
      'js/swiper-bundle.min.js',
      'js/fancybox.umd.js',
      'js/vendor.bundle.min.js'
    ]
  }
];