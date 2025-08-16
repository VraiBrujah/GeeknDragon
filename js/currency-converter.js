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
  const equivTable = document.getElementById('currency-equivalences-list');
  const equivBody = equivTable?.querySelector('tbody');

  if (!sources.length || !results || !best || !equivContainer || !equivTable || !equivBody) return;

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
    const totalPiecesLabel = tr.totalPieces || 'Total pieces:';

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
    const totalPieces = minimal.items.reduce((sum, { qty }) => sum + qty, 0);
    best.innerHTML = minimal.text
      ? `${bestLabel} ${minimal.text}<br>${totalPiecesLabel} ${nf.format(totalPieces)}`
      : '';

    equivBody.innerHTML = '';
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
          const text = mult === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(mult)}`;
          parts.push({ qty, text });
          rest -= qty * mult;
        }
      });
      if (!parts.length) return;
      const summaryParts = parts.map((p) => p.text);
      const summary = summaryParts.length > 1
        ? `${summaryParts.slice(0, -1).join(', ')} ${andText} ${summaryParts[summaryParts.length - 1]}`
        : summaryParts[0];
      const remainder = baseValue % base;
      let remainderPhrase = '';
      let remainderItems = [];
      if (remainder > 0) {
        const rem = minimalParts(remainder, currencyNames, andText);
        remainderPhrase = rem.text ? `${remainderText}: ${rem.text}` : '';
        remainderItems = rem.items;
      }
      const totalRowPieces = parts.reduce((sum, { qty }) => sum + qty, 0)
        + remainderItems.reduce((sum, { qty }) => sum + qty, 0);
      const row = document.createElement('tr');
      const coinTitle = currencyNames[coin]
        .replace(/^pièces?\s+(?:de|d['’])\s*/i, '')
        .replace(/^./, (ch) => ch.toUpperCase());
      row.innerHTML = `<th class="text-left">${coinTitle}</th><td>${summary}</td><td>${remainderPhrase}</td><td>${nf.format(totalRowPieces)}</td>`;
      equivBody.appendChild(row);
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
