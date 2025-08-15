document.addEventListener('DOMContentLoaded', () => {
  const rates = {
    copper: 1,
    silver: 10,
    electrum: 50,
    gold: 100,
    platinum: 1000,
  };

  const names = {
    copper: 'pièces de cuivre',
    silver: 'pièces d’argent',
    electrum: 'pièces d’électrum',
    gold: 'pièces d’or',
    platinum: 'pièces de platine',
  };

  const typeSelect = document.getElementById('currency-type');
  const amountInput = document.getElementById('currency-amount');
  const results = document.getElementById('currency-results');

  function update() {
    const amount = parseFloat(amountInput.value) || 0;
    const type = typeSelect.value;
    const baseCopper = amount * rates[type];

    results.innerHTML = Object.keys(rates)
      .map((key) => {
        const value = baseCopper / rates[key];
        return `<div>${value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${names[key]}</div>`;
      })
      .join('');
  }

  typeSelect.addEventListener('change', update);
  amountInput.addEventListener('input', update);
  update();
});
