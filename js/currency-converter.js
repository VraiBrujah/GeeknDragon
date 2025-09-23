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
    
    // Métaheuristique : Algorithme glouton avec recherche locale limitée
    const bestSolution = this.findMinimalCoins(value);
    
    if (!bestSolution || bestSolution.length === 0) return '';
    
    // Formater l'affichage
    const formatted = bestSolution.map(item => {
      const data = this.currencyData[item.currency];
      if (item.multiplier === 1) {
        return `${this.nf.format(item.quantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()}`;
      } else {
        return `${this.nf.format(item.quantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()}(×${this.nf.format(item.multiplier)})`;
      }
    });
    
    // Joindre avec "et"
    if (formatted.length > 1) {
      const last = formatted.pop();
      return formatted.join(', ') + ` ${this.getTranslation('shop.converter.and', 'et')} ` + last;
    }
    
    return formatted.join('');
  }
  
  findMinimalCoins(targetValue) {
    // Créer toutes les dénominations possibles
    const denoms = [];
    ['platinum', 'gold', 'electrum', 'silver', 'copper'].forEach(currency => {
      this.multipliers.forEach(multiplier => {
        denoms.push({
          currency,
          multiplier,
          value: this.rates[currency] * multiplier
        });
      });
    });
    
    // Trier par valeur décroissante
    denoms.sort((a, b) => b.value - a.value);
    
    let bestSolution = null;
    let minPieces = Infinity;
    
    // Essayer plusieurs stratégies gloutonnes
    for (let strategy = 0; strategy < 3; strategy++) {
      const solution = this.greedyStrategy(targetValue, denoms, strategy);
      const pieces = solution.reduce((sum, item) => sum + item.quantity, 0);
      
      if (pieces < minPieces) {
        minPieces = pieces;
        bestSolution = solution;
      }
    }
    
    return bestSolution;
  }
  
  greedyStrategy(targetValue, denoms, strategy) {
    const result = [];
    let remaining = targetValue;
    
    switch (strategy) {
      case 0: // Standard greedy : plus grosse valeur d'abord
        denoms.forEach(denom => {
          if (remaining >= denom.value) {
            const qty = Math.floor(remaining / denom.value);
            if (qty > 0) {
              result.push({ ...denom, quantity: qty });
              remaining -= qty * denom.value;
            }
          }
        });
        break;
        
      case 1: // Greedy modifié : éviter les gros multiplicateurs si possible
        denoms.forEach(denom => {
          if (remaining >= denom.value && denom.multiplier <= 100) {
            const qty = Math.floor(remaining / denom.value);
            if (qty > 0) {
              result.push({ ...denom, quantity: qty });
              remaining -= qty * denom.value;
            }
          }
        });
        // Compléter avec les gros multiplicateurs si nécessaire
        denoms.forEach(denom => {
          if (remaining >= denom.value) {
            const qty = Math.floor(remaining / denom.value);
            if (qty > 0) {
              result.push({ ...denom, quantity: qty });
              remaining -= qty * denom.value;
            }
          }
        });
        break;
        
      case 2: // Greedy par devise : une seule pièce par devise si possible
        ['platinum', 'gold', 'electrum', 'silver', 'copper'].forEach(currency => {
          const currencyDenoms = denoms.filter(d => d.currency === currency);
          for (const denom of currencyDenoms) {
            if (remaining >= denom.value) {
              const qty = Math.min(1, Math.floor(remaining / denom.value));
              if (qty > 0) {
                result.push({ ...denom, quantity: qty });
                remaining -= qty * denom.value;
                break; // Une seule pièce de cette devise
              }
            }
          }
        });
        // Compléter avec l'algorithme standard
        denoms.forEach(denom => {
          if (remaining >= denom.value) {
            const qty = Math.floor(remaining / denom.value);
            if (qty > 0) {
              result.push({ ...denom, quantity: qty });
              remaining -= qty * denom.value;
            }
          }
        });
        break;
    }
    
    return result;
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
    if (baseValue <= 0) return 0;
    
    // Utiliser la même métaheuristique que getOptimalBreakdown
    const bestSolution = this.findMinimalCoins(baseValue);
    
    if (!bestSolution || bestSolution.length === 0) return 0;
    
    return bestSolution.reduce((sum, item) => sum + item.quantity, 0);
  }
  

  updateCoinLotsRecommendations(baseValue) {
    // Logique déplacée vers CoinLotOptimizer pour séparation des responsabilités
    const recommendationsContainer = document.getElementById('coin-lots-recommendations');
    if (!recommendationsContainer) return;
    
    recommendationsContainer.style.display = 'block';
    
    if (baseValue === 0) {
      this.displayDefaultRecommendationMessage();
      return;
    }
    
    // Déléguer à CoinLotOptimizer si disponible
    if (window.CoinLotOptimizer) {
      this.showCalculatingIndicator();
      
      setTimeout(() => {
        try {
          // Convertir la solution de conversion en besoins
          const optimalSolution = this.findMinimalCoins(baseValue);
          const needs = {};
          optimalSolution.forEach(item => {
            const key = `${item.currency}_${item.multiplier}`;
            needs[key] = (needs[key] || 0) + item.quantity;
          });
          
          // Utiliser CoinLotOptimizer pour trouver les lots optimaux
          const optimizer = new window.CoinLotOptimizer();
          const recommendations = optimizer.findOptimalProductCombination(needs);
          
          if (recommendations && recommendations.length > 0) {
            this.displayRecommendations(recommendations);
          } else {
            this.displayNoRecommendationsMessage();
          }
        } catch (error) {
          console.error('Erreur calcul recommandations:', error);
          this.displayNoRecommendationsMessage();
        } finally {
          this.hideCalculatingIndicator();
        }
      }, 100);
    } else {
      console.warn('CoinLotOptimizer non disponible');
      this.displayNoRecommendationsMessage();
    }
  }
  
  // Méthodes d'affichage délégués vers CoinLotOptimizer
  showCalculatingIndicator() {
    const recommendationsContent = document.getElementById('coin-lots-content');
    if (!recommendationsContent) return;
    
    const lang = this.getCurrentLang();
    const calculatingText = lang === 'en' ? 'Calculating optimal lots...' : 'Calcul des lots optimaux...';
    
    recommendationsContent.innerHTML = `
      <div class="calculating-indicator flex items-center justify-center p-8">
        <div class="text-center">
          <div class="abacus-animation mb-4">
            <div class="text-6xl animate-bounce">🧮</div>
          </div>
          <p class="text-amber-300 font-medium">${calculatingText}</p>
          <div class="flex justify-center mt-2 space-x-1">
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
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

  displayRecommendations(recommendations) {
    // Logique d'affichage déléguée vers un module dédié ou CoinLotOptimizer
    // Pour l'instant, affichage simple
    const recommendationsContent = document.getElementById('coin-lots-content');
    const addToCartButton = document.getElementById('add-all-lots-to-cart');
    
    if (!recommendationsContent) return;
    
    const lang = this.getCurrentLang();
    let html = '<div class="space-y-4">';
    let totalPrice = 0;
    
    recommendations.forEach((item, index) => {
      const totalItemPrice = item.totalCost || (item.price * item.quantity);
      totalPrice += totalItemPrice;
      
      html += `
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h6 class="font-medium text-gray-200">${item.displayName}</h6>
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
      addToCartButton.textContent = 'Ajouter tous les lots au panier';
    }
  }
  
  hideCalculatingIndicator() {
    // L'indicateur sera remplacé par displayRecommendations()
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