const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  timeout: 60000,
  use: {
    headless: true,
  },
});
