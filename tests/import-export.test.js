const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

(async () => {
  const html = `<!DOCTYPE html><body>
    <div id="weaknesses-container"></div>
    <div id="strengths-container"></div>
    <template id="weakness-template">
      <div class="content-block">
        <input data-field="weaknessX-title" />
        <textarea data-field="weaknessX-desc"></textarea>
      </div>
    </template>
    <template id="strength-template">
      <div class="content-block">
        <input data-field="strengthX-title" />
        <textarea data-field="strengthX-desc"></textarea>
      </div>
    </template>
  </body>`;

  const dom = new JSDOM(html, { url: 'http://localhost' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  global.CustomEvent = window.CustomEvent;
  global.Blob = window.Blob;
  global.File = window.File;
  global.FileReader = window.FileReader;
  global.URL = window.URL;
  global.Event = window.Event;
  window.URL.createObjectURL = () => 'blob:url';
  window.URL.revokeObjectURL = () => {};

  let weaknessIndex = 0;
  window.addWeakness = function () {
    weaknessIndex += 1;
    const template = document.getElementById('weakness-template').content.cloneNode(true);
    template.querySelectorAll('[data-field]').forEach(el => {
      const type = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
      el.dataset.field = `weakness${weaknessIndex}-${type}`;
    });
    document.getElementById('weaknesses-container').appendChild(template);
  };
  window.removeWeakness = function () {
    const container = document.getElementById('weaknesses-container');
    const blocks = container.querySelectorAll('.content-block');
    if (blocks.length) {
      container.removeChild(blocks[blocks.length - 1]);
      weaknessIndex -= 1;
    }
  };
  let strengthIndex = 0;
  window.addStrength = function () {
    strengthIndex += 1;
    const template = document.getElementById('strength-template').content.cloneNode(true);
    template.querySelectorAll('[data-field]').forEach(el => {
      const type = el.dataset.field.endsWith('-title') ? 'title' : 'desc';
      el.dataset.field = `strength${strengthIndex}-${type}`;
    });
    document.getElementById('strengths-container').appendChild(template);
  };
  window.removeStrength = function () {
    const container = document.getElementById('strengths-container');
    const blocks = container.querySelectorAll('.content-block');
    if (blocks.length) {
      container.removeChild(blocks[blocks.length - 1]);
      strengthIndex -= 1;
    }
  };

  const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'Eds/ClaudePresentation/locationVSOLD/js/instant-sync.js'), 'utf8');
  window.eval(scriptContent);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  const sync = window.instantSync;
  sync.registerField = () => {};

  const initialData = {
    'weakness1-title': 'w1t',
    'weakness1-desc': 'w1d',
    'weakness2-title': 'w2t',
    'weakness2-desc': 'w2d',
    'strength1-title': 's1t',
    'strength1-desc': 's1d'
  };

  const file1 = new window.File([JSON.stringify(initialData)], 'data.json', { type: 'application/json' });
  sync.importContent(file1);
  await new Promise(r => setTimeout(r, 50));

  const wCount1 = document.querySelectorAll('[data-field^="weakness"][data-field$="-title"]').length;
  const sCount1 = document.querySelectorAll('[data-field^="strength"][data-field$="-title"]').length;
  console.log('After first import', wCount1, sCount1);

  window.removeWeakness();
  window.removeStrength();
  await sync.exportContent();

  const exported = localStorage.getItem(sync.storageKey);
  console.log('Exported data', exported);

  const file2 = new window.File([exported], 'data.json', { type: 'application/json' });
  sync.importContent(file2);
  await new Promise(r => setTimeout(r, 50));

  const wCount2 = document.querySelectorAll('[data-field^="weakness"][data-field$="-title"]').length;
  const sCount2 = document.querySelectorAll('[data-field^="strength"][data-field$="-title"]').length;
  console.log('After second import', wCount2, sCount2);
})();
