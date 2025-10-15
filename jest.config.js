/**
 * Configuration Jest - Geek & Dragon
 * Tests unitaires pour modules JavaScript critiques
 *
 * @author Brujah
 * @version 1.0.0
 */

export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/unit/**/*.test.js', '**/tests/**/*.spec.js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  collectCoverageFrom: [
    'js/currency-converter.js',
    'js/coin-lot-optimizer.js',
    'js/snipcart-utils.js',
    '!js/*.min.js',
    '!js/*.bundle.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  testTimeout: 10000
};
