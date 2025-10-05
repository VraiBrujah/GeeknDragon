/**
 * Configuration Jest - Geek & Dragon - Standards v2.1.0
 * 
 * Configuration de test complète pour validation des composants
 * JavaScript critiques avec support TypeScript et coverage.
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Tests Français Complets
 */

export default {
  // Environnement de test principal
  testEnvironment: 'jsdom',
  
  // Support TypeScript avec ts-jest
  preset: 'ts-jest/presets/default-esm',
  
  // Extensions de fichiers supportées
  moduleFileExtensions: ['js', 'ts', 'json'],
  
  // Patterns de recherche des tests
  testMatch: [
    '**/tests/**/*.test.[jt]s',
    '**/tests/**/*.spec.[jt]s',
    '**/__tests__/**/*.[jt]s'
  ],
  
  // Mapping des modules pour alias
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/js/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuration du coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.{js,ts}',
    '!js/**/*.min.js',
    '!js/vendor.bundle.*',
    '!js/app.bundle.*',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  
  // Seuils de coverage requis
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Seuils spécifiques pour composants critiques
    'js/currency-converter.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'js/snipcart-utils.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Formats de rapport de coverage
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'json-summary'
  ],
  
  // Répertoire de sortie pour coverage
  coverageDirectory: '<rootDir>/coverage',
  
  // Setup de l'environnement de test
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Mocks globaux
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        target: 'ES2021',
        module: 'ESNext',
        moduleResolution: 'node'
      }
    }
  },
  
  // Transformation des fichiers
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      useESM: true
    }]
  },
  
  // Extensions à transformer
  extensionsToTreatAsEsm: ['.ts'],
  
  // Configuration timeout pour tests longs
  testTimeout: 10000,
  
  // Verbosité pour debugging
  verbose: true,
  
  // Couleurs dans les rapports
  colors: true,
  
  // Arrêter au premier échec (utile pour CI)
  bail: false,
  
  // Cache pour performances
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Nettoyage automatique des mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Détection des fichiers ouverts
  detectOpenHandles: true,
  
  // Forcer la sortie après les tests
  forceExit: false,
  
  // Patterns d'ignorance
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.git/'
  ],
  
  // Fichiers à ignorer pour le watch mode
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '\\.git'
  ],
  
  // Configuration des reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'jest-report.html',
      openReport: false,
      pageTitle: 'Tests Geek & Dragon',
      logoImgPath: './media/branding/logos/geekndragon_logo_blanc.png'
    }]
  ],
  
  // Variables d'environnement pour les tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};