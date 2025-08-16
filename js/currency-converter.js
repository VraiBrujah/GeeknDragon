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
  const coins = Object.keys(rates);

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
        const converted = baseValue / (rates[currency] * multiplier);
        cells[idx].textContent = converted.toFixed(2);
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

  const handleChange = () => {
    const amount = parseFloat(input.value) || 0;
    render(amount, select.value);
  };

  select.addEventListener('change', handleChange);
  input.addEventListener('input', handleChange);

  // Initial render
  handleChange();
})();
