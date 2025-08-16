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

  const multipliers = [1, 10, 100, 1000, 10000];
  const coins = Object.keys(rates).sort((a, b) => rates[b] - rates[a]);

  const nf = new Intl.NumberFormat('fr-FR');

  const getCurrencyNames = () => Array.from(results.querySelectorAll('tbody tr')).reduce(
    (acc, row) => ({
      ...acc,
      [row.dataset.currency]: row.querySelector('th').textContent,
    }),
    {},
  );

  const denominations = multipliers
    .flatMap((multiplier) => coins.map((coin) => ({
      coin,
      multiplier,
      value: rates[coin] * multiplier,
    })))
    .sort((a, b) => b.value - a.value);

  /**
   * Render converted values for all currencies.
   */
  const render = () => {
    const currencyNames = getCurrencyNames();
    const tr = window.i18n?.shop?.converter || {};
    const andText = tr.and || 'and';
    const bestLabel = tr.bestLabel || '';

    const baseValue = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
      return sum + amount * rates[currency];
    }, 0);
    results.querySelectorAll('tbody tr').forEach((row) => {
      const { currency } = row.dataset;
      const cells = row.querySelectorAll('td');
      multipliers.forEach((multiplier, idx) => {
        const converted = Math.floor(baseValue / (rates[currency] * multiplier));
        cells[idx].textContent = converted ? nf.format(converted) : '';
      });
    });

    let remaining = baseValue;
    const items = [];
    denominations.forEach(({ coin, multiplier, value }) => {
      if (remaining <= 0) return;
      const qty = Math.floor(remaining / value);
      if (qty > 0) {
        remaining -= qty * value;
        items.push({ coin, multiplier, qty });
      }
    });

    const parts = items.map(({ coin, multiplier, qty }) => {
      const label = currencyNames[coin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
      return multiplier === 1
        ? `${nf.format(qty)} ${label}`
        : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
    });

    const phrase = parts.length > 1
      ? `${parts.slice(0, -1).join(', ')} ${andText} ${parts[parts.length - 1]}`
      : (parts[0] || '');
    best.textContent = phrase ? `${bestLabel} ${phrase}` : '';
  };

  sources.forEach((inputEl) => {
    const el = inputEl;
    el.addEventListener('focus', () => {
      if (el.value === '0') el.value = '';
    });
    el.addEventListener('input', () => {
      el.value = el.value.replace(/[^0-9.-]/g, '');
      const value = parseFloat(el.value);
      const invalid = Number.isFinite(value) && (value < 0 || !Number.isInteger(value));
      el.setCustomValidity(invalid ? 'Veuillez saisir un entier positif' : '');
      if (invalid) el.reportValidity();
      render();
    });
  });

  // Initial render
  render();
})();
