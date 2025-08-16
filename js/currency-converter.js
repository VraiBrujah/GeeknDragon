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

  if (!select || !input || !results) return;

  // Retrieve translated currency names from the select options
  const currencyNames = Array.from(select.options).reduce((acc, option) => ({
    ...acc,
    [option.value]: option.textContent,
  }), {});

  /**
   * Render converted values for all currencies.
   * @param {number} amount - Amount in the selected currency
   * @param {string} source - Selected currency key
   */
  const render = (amount, source) => {
    results.innerHTML = '';
    const baseValue = amount * rates[source];
    Object.keys(rates).forEach((currency) => {
      const li = document.createElement('li');
      const converted = baseValue / rates[currency];
      li.textContent = `${currencyNames[currency]}: ${converted.toFixed(2)}`;
      results.appendChild(li);
    });
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
