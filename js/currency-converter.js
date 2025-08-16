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
  const coins = Object.keys(rates);

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

    // Minimal coin representation using 25 denominations
    const denominations = multipliers
      .flatMap((multiplier) => coins.map((coin) => ({
        coin,
        multiplier,
        value: rates[coin] * multiplier,
      })))
      .sort((a, b) => b.value - a.value);

    let remaining = baseValue;
    const counts = {};
    denominations.forEach(({ coin, multiplier, value }) => {
      const qty = Math.floor(remaining / value);
      if (qty > 0) {
        counts[coin] = (counts[coin] || 0) + qty * multiplier;
        remaining -= qty * value;
      }
    });

    const parts = Object.entries(counts).map(
      ([coin, qty]) => `${qty} ${currencyNames[coin]}`,
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
