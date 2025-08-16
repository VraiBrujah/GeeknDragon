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
   * Compute optimal coin counts for a value using dynamic programming.
   * Minimizes the sum of multipliers used.
   * @param {number} baseValue - total value in copper pieces
   * @param {Array} denominations - list of {coin, multiplier, value}
   * @returns {Object} counts per coin
   */
  const computeOptimalCoins = (baseValue, denominations) => {
    const dp = Array(baseValue + 1).fill(Infinity);
    const choice = Array(baseValue + 1).fill(null);
    dp[0] = 0;

    for (let i = 1; i <= baseValue; i += 1) {
      denominations.forEach((denom, idx) => {
        if (denom.value <= i && dp[i - denom.value] + denom.multiplier < dp[i]) {
          dp[i] = dp[i - denom.value] + denom.multiplier;
          choice[i] = idx;
        }
      });
    }

    const counts = {};
    let v = baseValue;
    while (v > 0 && choice[v] !== null) {
      const denom = denominations[choice[v]];
      counts[denom.coin] = (counts[denom.coin] || 0) + denom.multiplier;
      v -= denom.value;
    }
    return counts;
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

    // Minimal coin representation using 25 denominations
    const denominations = multipliers
      .flatMap((multiplier) => coins.map((coin) => ({
        coin,
        multiplier,
        value: rates[coin] * multiplier,
      })))
      .sort((a, b) => b.value - a.value);

    const counts = computeOptimalCoins(baseValue, denominations);

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
