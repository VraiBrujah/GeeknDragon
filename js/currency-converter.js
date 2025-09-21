// Convertisseur de monnaie Premium avec synchronisation temps réel
class CurrencyConverterPremium {
  constructor() {
    this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
    this.multipliers = [1, 10, 100, 1000, 10000];
    this.nf = new Intl.NumberFormat('fr-FR');
    this.editMode = true; // Édition activée par défaut
    
    this.sourceInputs = document.querySelectorAll('#currency-converter-premium input[data-currency]');
    this.multiplierInputs = document.querySelectorAll('.multiplier-input');
    this.bestDisplay = document.getElementById('currency-best');
    
    // Références vers les cartes positionnées
    this.metalCards = {
      copper: document.getElementById('copper-card'),
      silver: document.getElementById('silver-card'),
      electrum: document.getElementById('electrum-card'),
      gold: document.getElementById('gold-card'),
      platinum: document.getElementById('platinum-card')
    };
    
    this.currencyData = {
      copper: { name: 'Cuivre', emoji: '🪙', color: 'amber' },
      silver: { name: 'Argent', emoji: '🥈', color: 'gray' },
      electrum: { name: 'Électrum', emoji: '⚡', color: 'yellow' },
      gold: { name: 'Or', emoji: '🥇', color: 'yellow' },
      platinum: { name: 'Platine', emoji: '💎', color: 'cyan' }
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateDisplay();
  }
  
  setupEventListeners() {
    // Utilisation de la délégation d'événements pour réduire le nombre de listeners
    const converterContainer = document.getElementById('currency-converter-premium');
    if (!converterContainer) return;
    
    // Débounce pour éviter les calculs trop fréquents
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };
    
    const debouncedUpdateSources = debounce(() => this.updateFromSources(), 150);
    const debouncedUpdateMultipliers = debounce(() => this.updateFromMultipliers(), 150);
    
    // Délégation d'événements sur le container principal
    converterContainer.addEventListener('input', (e) => {
      if (e.target.matches('input[data-currency]')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        debouncedUpdateSources();
      } else if (e.target.matches('.multiplier-input')) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        debouncedUpdateMultipliers();
      }
    }, { passive: true });
    
    converterContainer.addEventListener('focus', (e) => {
      if (e.target.matches('input[data-currency]') && e.target.value === '0') {
        e.target.value = '';
      }
    }, { passive: true });
  }
  
  getTotalBaseValue() {
    return Array.from(this.sourceInputs).reduce((sum, input) => {
      const currency = input.dataset.currency;
      const amount = Math.max(0, parseInt(input.value) || 0);
      return sum + amount * this.rates[currency];
    }, 0);
  }
  
  updateFromSources() {
    const baseValue = this.getTotalBaseValue();
    
    // Mettre à jour le tableau multiplicateur
    this.multiplierInputs.forEach(input => {
      const currency = input.closest('tr').dataset.currency;
      const multiplier = parseInt(input.dataset.multiplier);
      const value = Math.floor(baseValue / (this.rates[currency] * multiplier));
      input.value = value > 0 ? this.nf.format(value) : '';
    });
    
    this.updateMetalCards(baseValue);
    this.updateOptimalRecommendations(baseValue);
  }
  
  updateFromMultipliers() {
    // Calculer la valeur totale depuis les inputs multiplicateur
    let totalValue = 0;
    this.multiplierInputs.forEach(input => {
      const currency = input.closest('tr').dataset.currency;
      const multiplier = parseInt(input.dataset.multiplier);
      const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;
      totalValue += quantity * this.rates[currency] * multiplier;
    });
    
    // Mettre à jour les sources
    this.sourceInputs.forEach(input => {
      input.value = '0';
    });
    
    // Distribuer la valeur de manière optimale dans les sources
    this.distributeOptimally(totalValue);
    this.updateMetalCards(totalValue);
    this.updateOptimalRecommendations(totalValue);
  }
  
  distributeOptimally(totalValue) {
    let remaining = totalValue;
    const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    
    currencies.forEach(currency => {
      const input = document.querySelector(`input[data-currency="${currency}"]`);
      const rate = this.rates[currency];
      const count = Math.floor(remaining / rate);
      if (count > 0) {
        input.value = count.toString();
        remaining -= count * rate;
      }
    });
  }
  
  updateMetalCards(baseValue) {
    if (baseValue === 0) {
      Object.keys(this.metalCards).forEach(currency => {
        this.metalCards[currency].innerHTML = '';
      });
      return;
    }
    
    Object.keys(this.rates).forEach(currency => {
      const data = this.currencyData[currency];
      const rate = this.rates[currency];
      const totalUnits = Math.floor(baseValue / rate);
      
      if (totalUnits === 0) {
        this.metalCards[currency].innerHTML = '';
        return;
      }
      
      // Calcul du nombre minimal de pièces avec multiplicateurs
      const minimalCoins = this.getMinimalCoinsBreakdown(totalUnits);
      const remainderValue = baseValue % rate;
      let remainderText = '';
      if (remainderValue > 0) {
        remainderText = this.getOptimalBreakdown(remainderValue);
      }
      
      this.metalCards[currency].innerHTML = `
        <div class="currency-total-card bg-gradient-to-br from-${data.color}-900/20 to-${data.color}-800/20 rounded-xl p-6 border border-${data.color}-700/30">
          <div class="flex items-center justify-between mb-4">
            <h6 class="text-${data.color}-300 font-bold text-lg">${data.emoji} ${data.name}</h6>
            <span class="text-2xl font-bold text-${data.color}-300">${this.nf.format(totalUnits)}</span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="text-sm">
              <span class="text-gray-300">Nombre minimal de pièces:</span>
            </div>
            ${minimalCoins.map(item => `
              <div class="flex justify-between text-sm pl-2">
                <span class="text-gray-300">${item.multiplier === 1 ? 'Unités' : `Lots ×${this.nf.format(item.multiplier)}`}:</span>
                <span class="text-${data.color}-300 font-medium">${this.nf.format(item.quantity)}</span>
              </div>
            `).join('')}
            <div class="border-t border-${data.color}-700/30 pt-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">Total pièces:</span>
                <span class="text-${data.color}-300 font-bold">${this.nf.format(minimalCoins.reduce((sum, item) => sum + item.quantity, 0))}</span>
              </div>
            </div>
          </div>
          
          ${remainderText ? `
            <div class="border-t border-${data.color}-700/30 pt-3">
              <p class="text-xs text-gray-400">Reste: ${remainderText}</p>
            </div>
          ` : ''}
        </div>
      `;
    });
  }
  
  getMinimalCoinsBreakdown(totalUnits) {
    const breakdown = [];
    let remaining = totalUnits;
    
    // Calcul de la répartition optimale par multiplicateur (du plus grand au plus petit)
    this.multipliers.slice().reverse().forEach(mult => {
      const qty = Math.floor(remaining / mult);
      if (qty > 0) {
        breakdown.push({
          multiplier: mult,
          quantity: qty
        });
        remaining -= qty * mult;
      }
    });
    
    return breakdown;
  }
  
  getOptimalBreakdown(value) {
    if (value <= 0) return '';
    
    const breakdown = [];
    let remaining = value;
    const currencies = ['platinum', 'gold', 'electrum', 'silver'];
    
    // Traiter les métaux de valeur élevée d'abord (sans le cuivre)
    currencies.forEach(currency => {
      const rate = this.rates[currency];
      const count = Math.floor(remaining / rate);
      if (count > 0) {
        const data = this.currencyData[currency];
        breakdown.push(`${count} ${data.emoji} ${data.name.toLowerCase()}`);
        remaining -= count * rate;
      }
    });
    
    // Ajouter le cuivre restant (il devrait toujours y en avoir car remaining >= 0)
    if (remaining > 0) {
      const copperCount = remaining; // remaining est déjà en cuivre
      const copperData = this.currencyData.copper;
      breakdown.push(`${copperCount} ${copperData.emoji} ${copperData.name.toLowerCase()}`);
    }
    
    // Ajouter le connecteur "et" avant le dernier élément si il y en a plusieurs
    if (breakdown.length > 1) {
      const last = breakdown.pop();
      return breakdown.join(', ') + ' et ' + last;
    }
    
    return breakdown.join('');
  }
  
  updateOptimalRecommendations(baseValue) {
    if (baseValue === 0) {
      this.bestDisplay.innerHTML = 'Entrez des montants pour voir les recommandations optimales';
      return;
    }
    
    const optimal = this.getOptimalBreakdown(baseValue);
    const totalPieces = this.calculateTotalPieces(baseValue);
    
    // Calcul de la valeur en or avec reste
    const goldValue = Math.floor(baseValue / this.rates.gold);
    const goldRemainder = baseValue % this.rates.gold;
    
    let goldValueDisplay = '';
    if (goldValue > 0) {
      goldValueDisplay = `${this.nf.format(goldValue)} 🥇 or`;
      if (goldRemainder > 0) {
        const remainderBreakdown = this.getOptimalBreakdown(goldRemainder);
        goldValueDisplay += ` et ${remainderBreakdown}`;
      }
    } else {
      goldValueDisplay = this.getOptimalBreakdown(baseValue);
    }
    
    this.bestDisplay.innerHTML = `
      <div class="text-center">
        <p class="text-lg mb-2"><strong>Conversion optimale:</strong></p>
        <p class="text-indigo-300 font-medium mb-2">${optimal}</p>
        <p class="text-sm text-gray-400">Total: ${this.nf.format(totalPieces)} pièces</p>
        <p class="text-sm text-gray-400"><br>Valeur: ${goldValueDisplay}</p>
      </div>
    `;
  }
  
  calculateTotalPieces(baseValue) {
    let total = 0;
    let remaining = baseValue;
    const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    
    currencies.forEach(currency => {
      const rate = this.rates[currency];
      const count = Math.floor(remaining / rate);
      total += count;
      remaining -= count * rate;
    });
    
    return total;
  }
  
  updateDisplay() {
    this.updateFromSources();
  }
  
  // Méthode de nettoyage pour éviter les fuites mémoire
  destroy() {
    const converterContainer = document.getElementById('currency-converter-premium');
    if (converterContainer) {
      // Clone et replace pour supprimer tous les event listeners
      const newContainer = converterContainer.cloneNode(true);
      converterContainer.parentNode.replaceChild(newContainer, converterContainer);
    }
  }
}

// Nettoyage automatique à la fermeture de page
window.addEventListener('beforeunload', () => {
  if (window.converterInstance && typeof window.converterInstance.destroy === 'function') {
    window.converterInstance.destroy();
  }
});

// Initialisation paresseuse du convertisseur - ne charge que si l'utilisateur interagit
let converterInitialized = false;

const initConverter = () => {
  if (converterInitialized) return;
  converterInitialized = true;
  
  // Petite priorité au héro - délai de 100ms
  setTimeout(() => {
    if (document.getElementById('currency-converter-premium')) {
      window.converterInstance = new CurrencyConverterPremium();
    }
  }, 100);
};

// Observateur d'intersection pour charger le convertisseur quand il devient visible
document.addEventListener('DOMContentLoaded', () => {
  const converterElement = document.getElementById('currency-converter-premium');
  if (!converterElement) return;
  
  // Chargement paresseux quand la section devient visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initConverter();
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(converterElement);
  
  // Fallback : chargement après interaction utilisateur
  ['click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
      setTimeout(initConverter, 500);
    }, { once: true, passive: true });
  });
});