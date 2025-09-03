import jestAxe from 'jest-axe';
const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

describe('Cart widget accessibility', () => {
  test('has no a11y violations for contrast and keyboard navigation', async () => {
    document.body.innerHTML = `
      <div id="gd-cart-widget">
        <button id="gd-cart-toggle-widget" aria-label="Panier" aria-expanded="false" aria-haspopup="dialog" aria-controls="gd-cart-panel">
          <span id="gd-cart-count-widget" aria-live="polite">0</span>
        </button>
        <div id="gd-cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true" tabindex="-1">
          <h3 id="cart-title">Panier</h3>
        </div>
      </div>`;
    const results = await axe(document.body, {
      runOnly: { type: 'tag', values: ['cat.color', 'cat.keyboard'] },
    });
    expect(results).toHaveNoViolations();
  });
});
