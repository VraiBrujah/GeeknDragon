import { readFileSync } from 'fs';

describe('currency converter', () => {
  test('uses French conjunction', async () => {
    document.body.innerHTML = `
      <div id="currency-sources"><input data-currency="copper" value="111"></div>
      <div class="advanced-group"><input data-currency="copper" data-multiplier="1"></div>
      <button id="currency-advanced-toggle"></button>
      <div id="currency-total-best"></div>
      <div id="currency-total-remainder"></div>
      <div id="currency-total-gold"></div>
      <div id="currency-total-pieces"></div>
      <div id="currency-equivalences">
        <table id="currency-equivalences-list"><tbody></tbody><tfoot></tfoot></table>
      </div>`;
    const fr = JSON.parse(
      readFileSync(new URL('../translations/fr.json', import.meta.url)),
    );
    window.i18n = fr;
    window.i18n.lang = 'fr';
    document.documentElement.lang = 'fr';

    await import('../js/currency-converter.js');

    expect(window.i18n.shop.converter.and).toBe('et');
    expect(
      document.getElementById('currency-total-remainder').innerHTML,
    ).toContain('et');
  });
});
