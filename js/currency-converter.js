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
  const equivContainer = document.getElementById('currency-equivalences');
  const equivList = document.getElementById('currency-equivalences-list');

  if (!sources.length || !results || !best || !equivContainer || !equivList) return;

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

  const minimalParts = (value, currencyNames, andText) => {
    let remaining = value;
    const items = [];
    denominations.forEach(({ coin, multiplier, value: val }) => {
      if (remaining <= 0) return;
      const qty = Math.floor(remaining / val);
      if (qty > 0) {
        remaining -= qty * val;
        items.push({ coin, multiplier, qty });
      }
    });
    const parts = items.map(({ coin, multiplier, qty }) => {
      const label = currencyNames[coin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
      return multiplier === 1
        ? `${nf.format(qty)} ${label}`
        : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
    });
    const text = parts.length > 1
      ? `${parts.slice(0, -1).join(', ')} ${andText} ${parts[parts.length - 1]}`
      : (parts[0] || '');
    return { text, remaining, items };
  };

  /**
   * Render converted values for all currencies.
   */
  const render = () => {
    const currencyNames = getCurrencyNames();
    const tr = window.i18n?.shop?.converter || {};
    const andText = tr.and || 'and';
    const bestLabel = tr.bestLabel || '';
    const remainderText = tr.remainder || 'Remainder';

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

    const minimal = minimalParts(baseValue, currencyNames, andText);
    best.textContent = minimal.text ? `${bestLabel} ${minimal.text}` : '';

    equivList.innerHTML = '';
    let hasEquiv = false;
    coins.forEach((coin) => {
      const base = rates[coin];
      const units = Math.floor(baseValue / base);
      if (!units) return;
      let rest = units;
      const parts = [];
      multipliers.slice().reverse().forEach((mult) => {
        const qty = Math.floor(rest / mult);
        if (qty > 0) {
          const label = currencyNames[coin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
          parts.push(mult === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(mult)}`);
          rest -= qty * mult;
        }
      });
      if (!parts.length) return;
      let summary = parts.length > 1
        ? `${parts.slice(0, -1).join(', ')} ${andText} ${parts[parts.length - 1]}`
        : parts[0];
      const remainder = baseValue % base;
      if (remainder > 0) {
        const remPhrase = minimalParts(remainder, currencyNames, andText).text;
        if (remPhrase) summary += ` — ${remainderText}: ${remPhrase}`;
      }
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[max-content_1fr] gap-2';
      const coinTitle = currencyNames[coin]
        .replace(/^pièces?\s+(?:de|d['’])\s*/i, '')
        .replace(/^./, (ch) => ch.toUpperCase());
      row.innerHTML = `<strong>${coinTitle}</strong><span>${summary}</span>`;
      equivList.appendChild(row);
      hasEquiv = true;
    });
    equivContainer.classList.toggle('hidden', !hasEquiv);
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
