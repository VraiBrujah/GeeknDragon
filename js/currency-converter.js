(() => {
  // Conversion rates in copper pieces
  const rates = {
    copper: 1,
    silver: 10,
    electrum: 50,
    gold: 100,
    platinum: 1000,
  };

  const sources = document.querySelectorAll('#currency-sources input');
  const results = document.getElementById('currency-results');
  const best = document.getElementById('currency-best');

  if (!sources.length || !results || !best) return;

  // Retrieve translated currency names from the results table
  const currencyNames = Array.from(results.querySelectorAll('tbody tr')).reduce(
    (acc, row) => ({
      ...acc,
      [row.dataset.currency]: row.querySelector('th').textContent,
    }),
    {},
  );

  const multipliers = [1, 10, 100, 1000, 10000];
  const coinOrder = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

  /**
   * Convert a value to coin parts using multipliers for each coin type.
   * @param {number} baseValue - total value in copper pieces
   * @returns {Array} list of {coin, multiplier, qty}
   */
  const computeCoinParts = (baseValue) => {
    const baseCounts = {};
    let remaining = baseValue;
    coinOrder.forEach((coin) => {
      const value = rates[coin];
      const qty = Math.floor(remaining / value);
      if (qty > 0) {
        baseCounts[coin] = qty;
        remaining -= qty * value;
      }
    });

    const multiplierOrder = [10000, 1000, 100, 10, 1];
    const parts = [];
    coinOrder.forEach((coin) => {
      let count = baseCounts[coin] || 0;
      multiplierOrder.forEach((multiplier) => {
        const qty = Math.floor(count / multiplier);
        if (qty > 0) {
          parts.push({ coin, multiplier, qty });
          count -= qty * multiplier;
        }
      });
    });

    return parts;
  };

  /**
   * Render converted values for all currencies.
   */
  const render = () => {
    const baseValue = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = parseInt(input.value, 10) || 0;
      return sum + amount * rates[currency];
    }, 0);
    results.querySelectorAll('tbody tr').forEach((row) => {
      const { currency } = row.dataset;
      const cells = row.querySelectorAll('td');
      multipliers.forEach((multiplier, idx) => {
        const converted = Math.floor(baseValue / (rates[currency] * multiplier));
        cells[idx].textContent = converted;
      });
    });

    const parts = computeCoinParts(baseValue).map(
      ({ coin, multiplier, qty }) => `${qty} ${currencyNames[coin]}${multiplier > 1 ? ` x${multiplier}` : ''}`,
    );
    best.textContent = parts.length > 1
      ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
      : (parts[0] || '');
  };

  sources.forEach((inputEl) => {
    const el = inputEl;
    el.addEventListener('focus', () => {
      if (el.value === '0') el.value = '';
    });
    el.addEventListener('input', () => {
      el.value = el.value.replace(/[^0-9]/g, '');
      render();
    });
  });

  // Initial render
  render();
})();
