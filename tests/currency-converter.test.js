import { readFileSync } from 'fs';
import { jest } from '@jest/globals';

describe('currency converter', () => {
  test('uses French conjunction', async () => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="currency-sources"><input data-currency="copper" value="111"></div>
      <div class="advanced-group"><input data-currency="copper" data-multiplier="1"></div>
      <button id="currency-advanced-toggle"></button>
      <div id="currency-total-breakdown"></div>
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
      document.getElementById('currency-total-breakdown').innerHTML,
    ).toContain('et');
  });

  test('reveals multiplier labels with translations', async () => {
    jest.resetModules();
    document.body.innerHTML = `
      <table id="currency-sources">
        <tbody>
          <tr>
            <td>
              <input data-currency="copper" value="0" />
              <div class="advanced-group hidden">
                <label>
                  <span data-i18n="shop.converter.multiplier10000"></span>
                  <input data-currency="copper" data-multiplier="10000" />
                </label>
                <label>
                  <span data-i18n="shop.converter.multiplier1000"></span>
                  <input data-currency="copper" data-multiplier="1000" />
                </label>
                <label>
                  <span data-i18n="shop.converter.multiplier100"></span>
                  <input data-currency="copper" data-multiplier="100" />
                </label>
                <label>
                  <span data-i18n="shop.converter.multiplier10"></span>
                  <input data-currency="copper" data-multiplier="10" />
                </label>
                <label>
                  <span data-i18n="shop.converter.multiplier1"></span>
                  <input data-currency="copper" data-multiplier="1" />
                </label>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <button id="currency-advanced-toggle"></button>
      <div id="currency-total-breakdown"></div>
      <div id="currency-total-gold"></div>
      <div id="currency-total-pieces"></div>
      <div id="currency-equivalences">
        <table id="currency-equivalences-list"><tbody></tbody><tfoot></tfoot></table>
      </div>`;
    const fr = JSON.parse(
      readFileSync(new URL('../translations/fr.json', import.meta.url)),
    );
    window.i18n = {
      ...fr,
      apply() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const keys = el.getAttribute('data-i18n').split('.');
          let val = this;
          keys.forEach((k) => {
            if (val) val = val[k];
          });
          if (val) el.textContent = val;
        });
      },
      lang: 'fr',
    };
    document.documentElement.lang = 'fr';

    await import('../js/currency-converter.js');
    document.getElementById('currency-advanced-toggle').click();

    const labels = Array.from(
      document.querySelectorAll('.advanced-group label'),
    ).map((el) => el.textContent.trim());
    expect(labels).toEqual(['x10 000', 'x1 000', 'x100', 'x10', 'x1']);
  });
});
