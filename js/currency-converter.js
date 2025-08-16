(() => {
  // Conversion rates in copper pieces
  const rates = {
    copper: 1,
    silver: 10,
    electrum: 50,
    gold: 100,
    platinum: 1000,
  };

  const select = document.getElementById('currency-source');
  const input = document.getElementById('currency-amount');
  const results = document.getElementById('currency-results');
  const best = document.getElementById('currency-best');

  if (!select || !input || !results || !best) return;

  // Retrieve translated currency names from the select options
  const currencyNames = Array.from(select.options).reduce((acc, option) => ({
    ...acc,
    [option.value]: option.textContent,
  }), {});

  const multipliers = [1, 10, 100, 1000, 10000];

  /**
   * Render converted values for all currencies.
   * @param {number} amount - Amount in the selected currency
   * @param {string} source - Selected currency key
   */
  const render = (amount, source) => {
    const baseValue = amount * rates[source];
    results.querySelectorAll('tbody tr').forEach((row) => {
      const { currency } = row.dataset;
      const cells = row.querySelectorAll('td');
      multipliers.forEach((multiplier, idx) => {
        const converted = (baseValue * multiplier) / rates[currency];
        cells[idx].textContent = converted.toFixed(2);
      });
    });

    // Minimal coin representation
    let remaining = baseValue;
    const order = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    const parts = [];
    order.forEach((currency) => {
      const value = Math.floor(remaining / rates[currency]);
      if (value > 0) {
        parts.push(`${value} ${currencyNames[currency]}`);
        remaining -= value * rates[currency];
      }
    });
    best.textContent = parts.length ? parts.join(', ') : '';
  };

  const handleChange = () => {
    const amount = parseFloat(input.value) || 0;
    render(amount, select.value);
  };

  select.addEventListener('change', handleChange);
  input.addEventListener('input', handleChange);

  // Initial render
  handleChange();
})();
