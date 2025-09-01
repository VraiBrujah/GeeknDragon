const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const LZString = require('lz-string');
(async () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.sessionStorage = dom.window.sessionStorage;
  // Injection des librairies globales utilisées par le service
  global.LZString = LZString;
  window.LZString = LZString;
  global.crypto = require('crypto').webcrypto;
  Object.defineProperty(window, 'crypto', { value: global.crypto });
  // Polyfill minimal pour btoa/atob dans Node
  global.btoa = str => Buffer.from(str, 'binary').toString('base64');
  global.atob = str => Buffer.from(str, 'base64').toString('binary');
  window.btoa = global.btoa;
  window.atob = global.atob;
  // Chargement du service sans l'export ES6
  let script = fs.readFileSync(path.join(__dirname, '..', 'Eds/ClaudePresentation/locationVSOLD/js/core/storage-service.js'), 'utf8');
  script = script.replace(/export default.*$/m, '');
  dom.window.eval(script);
  const ServiceClass = window.StorageService.constructor;
  const service = new ServiceClass({
    prefix: 'test',
    useCompression: true,
    enableEncryption: true,
    encryptionKey: '0123456789abcdef0123456789abcdef'
  });
  await service.set('item', { foo: 'bar', num: 42 });
  const result = await service.get('item');
  assert.deepStrictEqual(result, { foo: 'bar', num: 42 });
  const raw = localStorage.getItem('test-item');
  assert.ok(!raw.includes('bar'));
  console.log('StorageService test passed');
  process.exit(0);
})();
