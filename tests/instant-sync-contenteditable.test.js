const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

(async () => {
  const dom = new JSDOM(`<!DOCTYPE html><body><div data-field="editable" contenteditable="true"></div></body>`, { url: 'http://localhost' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  global.Event = window.Event;
  global.CustomEvent = window.CustomEvent;
  global.MutationObserver = window.MutationObserver;

  const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'Eds/ClaudePresentation/locationVSOLD/js/instant-sync.js'), 'utf8');
  window.eval(scriptContent);
  await new Promise(r => setTimeout(r, 0));
  const sync = window.instantSync;
  const field = document.querySelector('[data-field="editable"]');

  field.textContent = 'hello';
  field.dispatchEvent(new window.Event('input'));
  await new Promise(r => setTimeout(r, 120));
  const stored = JSON.parse(localStorage.getItem(sync.storageKey));
  console.log('Stored value', stored.editable);

  if (stored.editable !== 'hello') throw new Error('ContentEditable not synced');

  console.log('InstantSync contentEditable test passed');
  process.exit(0);
})();
