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
  const best = document.getElementById('currency-best');
  const equivContainer = document.getElementById('currency-equivalences');
  const equivTable = document.getElementById('currency-equivalences-list');
  const equivBody = equivTable?.querySelector('tbody');

  if (!sources.length || !best || !equivContainer || !equivTable || !equivBody) return;

  const multipliers = [1, 10, 100, 1000, 10000];
  const coins = Object.keys(rates).sort((a, b) => rates[b] - rates[a]);

  const nf = new Intl.NumberFormat('fr-FR');

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

    let text = '';
    if (parts.length === 1) {
      text = parts[0];
    } else if (parts.length > 1) {
      const groups = [];
      for (let i = 0; i < parts.length; i += 3) {
        groups.push(parts.slice(i, i + 3));
      }
      const lastGroup = groups[groups.length - 1];
      const lastItem = lastGroup.pop();
      const lastGroupText = lastGroup.length
        ? `${lastGroup.join(', ')} ${andText} ${lastItem}`
        : `${andText} ${lastItem}`;
      groups[groups.length - 1] = lastGroupText;
      text = groups
        .map((g) => (Array.isArray(g) ? g.join(', ') : g))
        .join(',<br>');
    }

    return { text, remaining, items };
  };

  /**
   * Render converted values for all currencies.
   */
  const render = () => {
    const tr = window.i18n?.shop?.converter || {};
    const currencyNames = {
      copper: tr.copper || 'pièce de cuivre',
      silver: tr.silver || 'pièce d’argent',
      electrum: tr.electrum || 'pièce d’électrum',
      gold: tr.gold || 'pièce d’or',
      platinum: tr.platinum || 'pièce de platine',
    };
    const andText = tr.and || 'and';
    const bestLabel = tr.bestLabel || '';
    const totalPiecesLabel = tr.totalPieces || 'Total pieces:';

    const baseValue = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
      return sum + amount * rates[currency];
    }, 0);
    const minimal = minimalParts(baseValue, currencyNames, andText);
    const totalPieces = minimal.items.reduce((sum, { qty }) => sum + qty, 0);
    best.innerHTML = minimal.text
      ? `${bestLabel}<br>${minimal.text}<br>${totalPiecesLabel} ${nf.format(totalPieces)}`
      : '';
    best.classList.toggle('hidden', !minimal.text);

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
      const summary = summaryParts.join('<br>');
      const remainder = baseValue % base;
      let remainderItems = [];
      if (remainder > 0) {
        const rem = minimalParts(remainder, currencyNames, andText);
        remainderItems = rem.items;
      }
      const remainderPhrase = remainderItems
        .map(({ coin: rCoin, multiplier, qty }) => {
          const label = currencyNames[rCoin].replace(/^pièce/, qty > 1 ? 'pièces' : 'pièce');
          return multiplier === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
        })
        .join('<br>');
      const totalRowPieces = parts.reduce((sum, { qty }) => sum + qty, 0)
        + remainderItems.reduce((sum, { qty }) => sum + qty, 0);
      const row = document.createElement('tr');
      const coinTitle = currencyNames[coin]
        .replace(/^pièces?\s+(?:de|d['’])\s*/i, '')
        .replace(/^./, (ch) => ch.toUpperCase());
      row.innerHTML = `<th>${coinTitle}</th><td>${summary}</td><td>${remainderPhrase}</td><td>${nf.format(totalRowPieces)}</td>`;
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
