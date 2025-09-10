(() => {
  // Conversion rates in copper pieces
  const rates = {
    copper: 1,
    silver: 10,
    electrum: 50,
    gold: 100,
    platinum: 1000,
  };

  const sources = document.querySelectorAll('#currency-sources input:not([data-multiplier])');
  const advancedInputs = document.querySelectorAll('.advanced-group input');
  const advancedGroups = document.querySelectorAll('.advanced-group');
  const advancedToggle = document.getElementById('currency-advanced-toggle');
  const best = document.getElementById('currency-best');
  const equivContainer = document.getElementById('currency-equivalences');
  const equivTable = document.getElementById('currency-equivalences-list');
  const equivBody = equivTable?.querySelector('tbody');

  if (!sources.length || !best || !equivContainer || !equivTable || !equivBody) return;

  const multipliers = [1, 10, 100, 1000, 10000];
  const coins = Object.keys(rates).sort((a, b) => rates[b] - rates[a]);

  const locale =
    window?.i18n?.lang ||
    document.documentElement?.lang ||
    window.navigator?.language ||
    'fr-FR';
  const nf = new Intl.NumberFormat(locale);

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
      [text] = parts;
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

  const updateBaseFromAdvanced = (currency) => {
    const total = Array.from(advancedInputs)
      .filter((input) => input.dataset.currency === currency)
      .reduce((sum, input) => {
        const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
        const mult = parseInt(input.dataset.multiplier, 10);
        return sum + amount * mult;
      }, 0);
    const source = document.querySelector(
      `#currency-sources input[data-currency="${currency}"]`
    );
    if (source) source.value = total;
  };

  const updateAdvancedFromBase = (currency) => {
    const source = document.querySelector(
      `#currency-sources input[data-currency="${currency}"]`
    );
    if (!source) return;
    let value = Math.max(0, Math.floor(parseFloat(source.value) || 0));
    multipliers
      .slice()
      .reverse()
      .forEach((mult) => {
        const field = document.querySelector(
          `.advanced-group input[data-currency="${currency}"][data-multiplier="${mult}"]`
        );
        if (field) {
          const qty = Math.floor(value / mult);
          field.value = qty;
          value -= qty * mult;
        }
      });
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

    const baseSources = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
      return sum + amount * rates[currency];
    }, 0);
    const baseValue = baseSources;
    const minimal = minimalParts(baseValue, currencyNames, andText);
    const totalPieces = minimal.items.reduce((sum, { qty }) => sum + qty, 0);
    best.innerHTML = minimal.text
      ? `${bestLabel}<br>${minimal.text}<br><span class="total-pieces">${totalPiecesLabel} ${nf.format(totalPieces)}</span>`
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
          const label = currencyNames[coin].replace(
            /^pièce/,
            qty > 1 ? 'pièces' : 'pièce',
          );
          const text =
            mult === 1
              ? `${nf.format(qty)} ${label}`
              : `${nf.format(qty)} ${label} x${nf.format(mult)}`;
          parts.push({ qty, mult, text });
          rest -= qty * mult;
        }
      });
      if (!parts.length) return;
      const summaryParts = parts.map((p) => p.text);
      const remainder = baseValue % base;
      let remainderItems = [];
      if (remainder > 0) {
        const rem = minimalParts(remainder, currencyNames, andText);
        remainderItems = rem.items;
      }
      const remainderPhrase = remainderItems
        .map(({ coin: rCoin, multiplier, qty }) => {
          const label = currencyNames[rCoin].replace(
            /^pièce/,
            qty > 1 ? 'pièces' : 'pièce',
          );
          return multiplier === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
        })
        .join('<br>');
      const totalRowPieces =
        parts.reduce((sum, { qty }) => sum + qty, 0) +
        remainderItems.reduce((sum, { qty }) => sum + qty, 0);
      const totalValue =
        parts.reduce((sum, { qty, mult: m }) => sum + qty * m, 0) +
        remainderItems.reduce(
          (sum, { coin: rCoin, multiplier, qty }) =>
            sum + (qty * multiplier * rates[rCoin]) / base,
          0,
        );
      const label = currencyNames[coin].replace(
        /^pièce/,
        totalValue > 1 ? 'pièces' : 'pièce',
      );
      const summary = `${summaryParts.join('<br>')}<br>${
        tr.equivTotalValue || 'Total:'
      } ${nf.format(totalValue)} ${label}`;
      const row = document.createElement('tr');
      const coinTitle = currencyNames[coin]
        .replace(/^pièces?\s+(?:de|d['’])\s*/i, '')
        .replace(/^./, (ch) => ch.toUpperCase());
      row.innerHTML = `<th>${coinTitle}</th><td>${summary}</td><td>${remainderPhrase}</td><td>${nf.format(
        totalRowPieces,
      )}</td>`;
      equivBody.appendChild(row);
      hasEquiv = true;
    });
    equivContainer.classList.toggle('hidden', !hasEquiv);
  };

  const addHandlers = (inputEl, onInput) => {
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
      if (typeof onInput === 'function') onInput(el);
      render();
    });
  };

  sources.forEach((input) =>
    addHandlers(input, (el) => updateAdvancedFromBase(el.dataset.currency))
  );
  advancedInputs.forEach((input) =>
    addHandlers(input, (el) => updateBaseFromAdvanced(el.dataset.currency))
  );

  advancedToggle?.addEventListener('click', () => {
    advancedGroups.forEach((group) => group.classList.toggle('hidden'));
  });

  // Initial render
  render();
})();
