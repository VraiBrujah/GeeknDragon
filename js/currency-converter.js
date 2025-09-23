// Convertisseur de monnaie autonome avec détection dynamique des éléments DOM
class CurrencyConverterPremium {
  constructor() {
    this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
    this.multipliers = [1, 10, 100, 1000, 10000];
    this.nf = new Intl.NumberFormat('fr-FR');
    this.editMode = true;
    
    // Références dynamiques aux éléments DOM
    this.sourceInputs = null;
    this.multiplierInputs = null;
    this.bestDisplay = null;
    this.metalCards = {};
    
    this.currencyData = {
      copper: { name: 'Cuivre', nameEn: 'Copper', emoji: '🪙', color: 'amber' },
      silver: { name: 'Argent', nameEn: 'Silver', emoji: '🥈', color: 'gray' },
      electrum: { name: 'Électrum', nameEn: 'Electrum', emoji: '⚡', color: 'yellow' },
      gold: { name: 'Or', nameEn: 'Gold', emoji: '🥇', color: 'yellow' },
      platinum: { name: 'Platine', nameEn: 'Platinum', emoji: '💎', color: 'cyan' }
    };

    // Callbacks pour les événements de changement
    this.changeCallbacks = [];
    
    this.init();
  }
  
  init() {
    this.refreshDOMReferences();
    this.setupEventListeners();
    this.updateDisplay();
    
    // Afficher le message par défaut des recommandations dès l'initialisation
    this.displayDefaultRecommendationMessage();
  }
  
  // Méthode pour rafraîchir dynamiquement les références DOM
  refreshDOMReferences() {
    // Tentative de détection des différents types de convertisseurs
    const container = document.getElementById('currency-converter-premium');
    if (container) {
      this.sourceInputs = container.querySelectorAll('input[data-currency]');
      this.multiplierInputs = container.querySelectorAll('.multiplier-input');
      this.bestDisplay = document.getElementById('currency-best');
      
      // Références dynamiques aux cartes
      Object.keys(this.currencyData).forEach(currency => {
        const cardElement = document.getElementById(`${currency}-card`);
        if (cardElement) {
          this.metalCards[currency] = cardElement;
        }
      });
    }
  }
  
  // Méthode pour ajouter des callbacks d'événements
  onChange(callback) {
    if (typeof callback === 'function') {
      this.changeCallbacks.push(callback);
    }
  }
  
  // Méthode pour notifier les changements
  notifyChange(data) {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.warn('Erreur dans callback du convertisseur:', error);
      }
    });
  }
  
  getCurrentLang() {
    return document.documentElement.lang || 'fr';
  }
  
  getTranslation(key, fallback = '') {
    if (window.i18n) {
      const keys = key.split('.');
      let value = window.i18n;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return fallback;
        }
      }
      return typeof value === 'string' ? value : fallback;
    }
    return fallback;
  }
  
  getCurrencyName(currency) {
    const lang = this.getCurrentLang();
    const data = this.currencyData[currency];
    return lang === 'en' ? data.nameEn : data.name;
  }
  
  setupEventListeners() {
    // Utilisation de la délégation d'événements pour réduire le nombre de listeners
    const converterContainer = document.getElementById('currency-converter-premium');
    if (!converterContainer) {
      console.warn('Container currency-converter-premium non trouvé');
      return;
    }
    
    // Débounce pour éviter les calculs trop fréquents
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    };
    
    const debouncedUpdateSources = debounce(() => {
      this.updateFromSources();
      this.notifyChange(this.getCurrentValues());
    }, 150);
    
    const debouncedUpdateMultipliers = debounce(() => {
      this.updateFromMultipliers();
      this.notifyChange(this.getCurrentValues());
    }, 150);
    
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
  
  // Méthode pour obtenir les valeurs actuelles du convertisseur
  getCurrentValues() {
    if (!this.sourceInputs) {
      this.refreshDOMReferences();
    }
    
    const values = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };
    const baseValue = this.getTotalBaseValue();
    
    if (this.sourceInputs) {
      this.sourceInputs.forEach(input => {
        const currency = input.dataset.currency;
        const amount = Math.max(0, parseInt(input.value) || 0);
        values[currency] = amount;
      });
    }
    
    return {
      values,
      baseValue,
      breakdown: this.getOptimalBreakdown(baseValue)
    };
  }
  
  getTotalBaseValue() {
    if (!this.sourceInputs) {
      this.refreshDOMReferences();
    }
    
    if (!this.sourceInputs || this.sourceInputs.length === 0) {
      return 0;
    }
    
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
    this.updateCoinLotsRecommendations(baseValue);
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
    this.updateCoinLotsRecommendations(totalValue);
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
        if (this.metalCards[currency]) {
          this.metalCards[currency].innerHTML = '';
        }
      });
      return;
    }
    
    Object.keys(this.rates).forEach(currency => {
      if (!this.metalCards[currency]) return;
      
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
            <h6 class="text-${data.color}-300 font-bold text-lg">${data.emoji} ${this.getCurrencyName(currency)}</h6>
            <span class="text-2xl font-bold text-${data.color}-300">${this.nf.format(totalUnits)}</span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="text-sm">
              <span class="text-gray-300">${this.getTranslation('shop.converter.minimalCoins', 'Nombre minimal de pièces')}:</span>
            </div>
            ${minimalCoins.map(item => `
              <div class="flex justify-between text-sm pl-2">
                <span class="text-gray-300">${item.multiplier === 1 ? this.getTranslation('shop.converter.units', 'Unités') : `Multiplicateur ×${this.nf.format(item.multiplier)}`}:</span>
                <span class="text-${data.color}-300 font-medium">${this.nf.format(item.quantity)}</span>
              </div>
            `).join('')}
            <div class="border-t border-${data.color}-700/30 pt-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${this.getTranslation('shop.converter.totalCoins', 'Total pièces')}:</span>
                <span class="text-${data.color}-300 font-bold">${this.nf.format(minimalCoins.reduce((sum, item) => sum + item.quantity, 0))}</span>
              </div>
            </div>
          </div>
          
          ${remainderText ? `
            <div class="border-t border-${data.color}-700/30 pt-3">
              <p class="text-xs text-gray-400">${this.getTranslation('shop.converter.remainder', 'Reste')}: ${remainderText}</p>
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
    
    // Trouver la combinaison avec le minimum de pièces physiques
    let bestOption = null;
    let minPieces = Infinity;
    
    // Tester chaque devise comme devise principale
    const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    
    currencies.forEach(primaryCurrency => {
      const rate = this.rates[primaryCurrency];
      const maxUnits = Math.floor(value / rate);
      
      if (maxUnits > 0) {
        // Calculer le nombre minimal de pièces pour cette devise
        const breakdown = this.getMinimalCoinsBreakdown(maxUnits);
        const piecesCount = breakdown.reduce((sum, item) => sum + item.quantity, 0);
        
        // Calculer le reste
        const remainderValue = value - (maxUnits * rate);
        let remainderPieces = 0;
        if (remainderValue > 0) {
          remainderPieces = this.calculateRemainderPieces(remainderValue);
        }
        
        const totalPieces = piecesCount + remainderPieces;
        
        if (totalPieces < minPieces) {
          minPieces = totalPieces;
          bestOption = {
            primary: primaryCurrency,
            primaryBreakdown: breakdown,
            remainder: remainderValue
          };
        }
      }
    });
    
    if (!bestOption) return '';
    
    // Formater l'affichage
    const result = [];
    const primaryData = this.currencyData[bestOption.primary];
    
    // Ajouter les pièces principales avec multiplicateurs
    bestOption.primaryBreakdown.forEach(item => {
      if (item.multiplier === 1) {
        result.push(`${this.nf.format(item.quantity)} ${primaryData.emoji} ${this.getCurrencyName(bestOption.primary).toLowerCase()}`);
      } else {
        result.push(`${this.nf.format(item.quantity)} ${primaryData.emoji} ${this.getCurrencyName(bestOption.primary).toLowerCase()}(×${this.nf.format(item.multiplier)})`);
      }
    });
    
    // Ajouter le reste
    if (bestOption.remainder > 0) {
      const remainderText = this.getRemainderBreakdown(bestOption.remainder);
      if (remainderText) {
        result.push(remainderText);
      }
    }
    
    // Joindre avec "et"
    if (result.length > 1) {
      const last = result.pop();
      return result.join(', ') + ` ${this.getTranslation('shop.converter.and', 'et')} ` + last;
    }
    
    return result.join('');
  }
  
  calculateRemainderPieces(remainderValue) {
    let pieces = 0;
    let remaining = remainderValue;
    const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    
    currencies.forEach(currency => {
      const rate = this.rates[currency];
      const count = Math.floor(remaining / rate);
      if (count > 0) {
        pieces += count;
        remaining -= count * rate;
      }
    });
    
    return pieces;
  }
  
  getRemainderBreakdown(remainderValue) {
    const breakdown = [];
    let remaining = remainderValue;
    const currencies = ['platinum', 'gold', 'electrum', 'silver'];
    
    currencies.forEach(currency => {
      const rate = this.rates[currency];
      const count = Math.floor(remaining / rate);
      if (count > 0) {
        const data = this.currencyData[currency];
        breakdown.push(`${count} ${data.emoji} ${this.getCurrencyName(currency).toLowerCase()}`);
        remaining -= count * rate;
      }
    });
    
    if (remaining > 0) {
      breakdown.push(`${remaining} ${this.currencyData.copper.emoji} ${this.getCurrencyName('copper').toLowerCase()}`);
    }
    
    return breakdown.join(', ');
  }
  
  updateOptimalRecommendations(baseValue) {
    if (!this.bestDisplay) {
      this.refreshDOMReferences();
    }
    
    if (!this.bestDisplay) return;
    
    if (baseValue === 0) {
      const enterAmountsText = this.getTranslation('shop.converter.enterAmounts', 'Entrez des montants pour voir les recommandations optimales');
      this.bestDisplay.innerHTML = enterAmountsText;
      return;
    }
    
    const optimal = this.getOptimalBreakdown(baseValue);
    const totalPieces = this.calculateTotalPieces(baseValue);
    
    // Calcul de la valeur en or avec reste
    const goldValue = Math.floor(baseValue / this.rates.gold);
    const goldRemainder = baseValue % this.rates.gold;
    
    let goldValueDisplay = '';
    if (goldValue > 0) {
      goldValueDisplay = `${this.nf.format(goldValue)} 🥇 ${this.getCurrencyName('gold').toLowerCase()}`;
      if (goldRemainder > 0) {
        const remainderBreakdown = this.getOptimalBreakdown(goldRemainder);
        goldValueDisplay += ` ${this.getTranslation('shop.converter.and', 'et')} ${remainderBreakdown}`;
      }
    } else {
      goldValueDisplay = this.getOptimalBreakdown(baseValue);
    }
    
    const optimalConversionText = this.getTranslation('shop.converter.optimalConversion', 'Conversion optimale');
    const totalText = this.getTranslation('shop.converter.total', 'Total');
    const valueText = this.getTranslation('shop.converter.value', 'Valeur');
    
    this.bestDisplay.innerHTML = `
      <div class="text-center">
        <p class="text-lg mb-2"><strong>${optimalConversionText}:</strong></p>
        <p class="text-indigo-300 font-medium mb-2">${optimal}</p>
        <p class="text-sm text-gray-400">${totalText}: ${this.nf.format(totalPieces)} ${this.getTranslation('shop.converter.coins', 'pièces')}</p>
        <p class="text-sm text-gray-400"><br>${valueText}: ${goldValueDisplay}</p>
      </div>
    `;
  }
  
  calculateTotalPieces(baseValue) {
    // Calculer le nombre minimal de pièces en utilisant tous les multiplicateurs
    let minimalPieces = 0;
    let remaining = baseValue;
    
    // Utiliser les plus gros multiplicateurs d'abord pour minimiser le nombre de pièces
    const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
    
    currencies.forEach(currency => {
      const rate = this.rates[currency];
      const totalUnitsForThisCurrency = Math.floor(remaining / rate);
      
      if (totalUnitsForThisCurrency > 0) {
        // Calculer le nombre minimal de pièces pour cette devise avec multiplicateurs
        const breakdown = this.getMinimalCoinsBreakdown(totalUnitsForThisCurrency);
        const piecesForThisCurrency = breakdown.reduce((sum, item) => sum + item.quantity, 0);
        minimalPieces += piecesForThisCurrency;
        remaining -= totalUnitsForThisCurrency * rate;
      }
    });
    
    return minimalPieces;
  }
  

  updateCoinLotsRecommendations(baseValue) {
    const recommendationsContainer = document.getElementById('coin-lots-recommendations');
    if (!recommendationsContainer) return;
    
    // Toujours afficher la section
    recommendationsContainer.style.display = 'block';
    
    if (baseValue === 0) {
      // Afficher un message d'invitation au lieu de cacher
      this.displayDefaultRecommendationMessage();
      return;
    }
    
    // Afficher l'indicateur de calcul immédiatement
    this.showCalculatingIndicator();
    
    // Calculer les besoins en pièces depuis les valeurs sources
    const values = this.getCurrentValues();
    const { copper, silver, electrum, gold, platinum } = values.values;
    
    // Utilisation non-bloquante avec setTimeout pour performances
    setTimeout(() => {
      let recommendations = [];
      if (window.convertCoinsToLots) {
        recommendations = window.convertCoinsToLots(copper, silver, electrum, gold, platinum);
      } else {
        console.warn('window.convertCoinsToLots non disponible');
      }
      
      if (recommendations && recommendations.length > 0) {
        this.displayRecommendations(recommendations);
      } else {
        this.displayNoRecommendationsMessage();
      }
      
      this.hideCalculatingIndicator();
    }, 50); // Délai minimal pour éviter le blocage
  }
  
  displayRecommendations(recommendations) {
    const recommendationsContent = document.getElementById('coin-lots-content');
    const addToCartButton = document.getElementById('add-all-lots-to-cart');
    
    if (!recommendationsContent) return;
    
    let html = '<div class="space-y-4">';
    let totalPrice = 0;
    
    recommendations.forEach(item => {
      const totalItemPrice = item.price * item.quantity;
      totalPrice += totalItemPrice;
      
      // Utiliser le displayName s'il existe (produits personnalisables), sinon le nom du produit
      let productName = item.displayName;
      if (!productName) {
        const product = window.products ? window.products[item.productId] : null;
        productName = product ? (product.name || item.productId) : item.productId;
      }
      
      // Afficher avec le nom traduit
      html += `
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
          <div class="flex justify-between items-center">
            <div>
              <h6 class="font-medium text-gray-200">${productName}</h6>
              <p class="text-sm text-gray-400">Quantité: ${item.quantity}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-400">$${totalItemPrice.toFixed(2)}</p>
              <p class="text-xs text-gray-400">$${item.price.toFixed(2)} / unité</p>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `
      <div class="border-t border-gray-600/30 pt-4">
        <div class="flex justify-between items-center text-lg font-bold">
          <span class="text-gray-200">Total:</span>
          <span class="text-green-400">$${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>`;
    
    recommendationsContent.innerHTML = html;
    
    if (addToCartButton) {
      addToCartButton.style.display = 'block';
      addToCartButton.dataset.lotsData = JSON.stringify(recommendations);
    }
  }

  showCalculatingIndicator() {
    const recommendationsContent = document.getElementById('coin-lots-content');
    if (!recommendationsContent) return;
    
    // Boulier animé immersif avec le style du site
    recommendationsContent.innerHTML = `
      <div class="calculating-indicator flex items-center justify-center p-8">
        <div class="text-center">
          <div class="abacus-animation mb-4">
            <div class="text-6xl animate-bounce">🧮</div>
          </div>
          <p class="text-amber-300 font-medium">Calcul des lots optimaux...</p>
          <div class="flex justify-center mt-2 space-x-1">
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
      <style>
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-10px); }
          70% { transform: translateY(-5px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      </style>
    `;
  }

  displayDefaultRecommendationMessage() {
    const recommendationsContent = document.getElementById('coin-lots-content');
    const addToCartButton = document.getElementById('add-all-lots-to-cart');
    
    if (recommendationsContent) {
      recommendationsContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🪙</div>
          <p class="text-gray-300 text-lg mb-2">Entrez des montants dans le convertisseur</p>
          <p class="text-gray-400 text-sm">pour voir les lots de pièces recommandés</p>
        </div>
      `;
    }
    
    if (addToCartButton) {
      addToCartButton.style.display = 'none';
    }
  }

  displayNoRecommendationsMessage() {
    const recommendationsContent = document.getElementById('coin-lots-content');
    const addToCartButton = document.getElementById('add-all-lots-to-cart');
    
    if (recommendationsContent) {
      recommendationsContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-300 text-lg mb-2">Aucune recommandation trouvée</p>
          <p class="text-gray-400 text-sm">Essayez avec d'autres montants</p>
        </div>
      `;
    }
    
    if (addToCartButton) {
      addToCartButton.style.display = 'none';
    }
  }
  
  hideCalculatingIndicator() {
    // L'indicateur sera remplacé par displayRecommendations()
    // Pas besoin de le cacher explicitement
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
      // Référence globale simplifiée pour les boutons
      window.currencyConverter = window.converterInstance;
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