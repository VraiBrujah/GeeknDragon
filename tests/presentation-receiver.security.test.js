const assert = require('assert');
const path = require('path');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

(async () => {
  const dom = new JSDOM(`<!DOCTYPE html><body>
    <div data-field="safe"></div>
    <div data-field="rich" contenteditable="true"></div>
  </body>`, { url: 'http://localhost' });

  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  global.Event = window.Event;
  global.CustomEvent = window.CustomEvent;

  const DOMPurify = createDOMPurify(window);
  window.DOMPurify = DOMPurify;

  const PresentationReceiver = require(path.join(__dirname, '..', 'Eds/ClaudePresentation/locationVSOLD/js/presentation-receiver.js'));
  const receiver = new PresentationReceiver('test');

  // Test synchronisation
  receiver.handleSyncMessage({ fieldName: 'safe', fieldValue: '<script>window.__xss = true</script>' });
  await new Promise(r => setTimeout(r, 60));
  const safeEl = document.querySelector('[data-field="safe"]');
  assert.strictEqual(window.__xss, undefined, 'Script executed during sync');
  assert.strictEqual(safeEl.querySelector('script'), null, 'Script tag should not remain after sync');

  // Test importation
  receiver.applyFullUpdate({ rich: '<p>Test</p><script>window.__xss = true</script>' });
  const richEl = document.querySelector('[data-field="rich"]');
  assert.strictEqual(window.__xss, undefined, 'Script executed during import');
  assert.strictEqual(richEl.querySelector('script'), null, 'Script tag should be removed after import');

  console.log('PresentationReceiver sanitization tests passed');
  process.exit(0);
})();
