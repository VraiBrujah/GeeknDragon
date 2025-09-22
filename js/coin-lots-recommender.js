/**
 * Recommandeur de lots de pièces - VERSION OPTIMISÉE
 * Calcule les lots minimaux au meilleur prix pour couvrir les besoins
 */
class CoinLotsRecommender {
  constructor() {
    this.nf = new Intl.NumberFormat('en-US');
    this.products = {};
    this.loadProductsFromGlobal();
  }

  /**
   * Charge les produits depuis window.products ou utilise des données par défaut
   */
  loadProductsFromGlobal() {
    if (window.products) {
      // Charge dynamiquement depuis les données du site
      this.products = this.convertGlobalProducts(window.products);
    } else {
      // Données par défaut en cas d'échec
      this.products = this.getDefaultProducts();
    }
  }

  /**
   * Convertit les données globales au format attendu par le recommandeur
   */
  convertGlobalProducts(globalProducts) {
    const convertedProducts = {};
    
    Object.keys(globalProducts).forEach(id => {
      const product = globalProducts[id];
      
      // Ne traiter que les lots de pièces
      if (id.startsWith('lot') || id.includes('essence') || id.includes('tresorerie')) {
        convertedProducts[id] = {
          name: product.name || product.name_fr || id,
          price: product.price || 0,
          multipliers: product.multipliers || [],
          coinLots: product.coin_lots || {}
        };
      }
    });
    
    return convertedProducts;
  }

  /**
   * Données par défaut en cas d'échec de chargement
   */
  getDefaultProducts() {
    return {
      'lot10': {
        name: "Offrande du Voyageur",
        price: 60,
        multipliers: [1, 10, 100, 1000, 10000],
        coinLots: { copper: 2, silver: 2, electrum: 2, gold: 2, platinum: 2 }
      },
      'lot25': {
        name: "La Monnaie des Cinq Royaumes", 
        price: 145,
        multipliers: [],
        coinLots: {
          copper: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          silver: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          electrum: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          gold: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          platinum: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 }
        }
      },
      'lot50-essence': {
        name: "Essence du Marchand",
        price: 275,
        multipliers: [],
        coinLots: {
          copper: { "1": 2, "10": 2, "100": 2, "1000": 2, "10000": 2 },
          silver: { "1": 2, "10": 2, "100": 2, "1000": 2, "10000": 2 },
          electrum: { "1": 2, "10": 2, "100": 2, "1000": 2, "10000": 2 },
          gold: { "1": 2, "10": 2, "100": 2, "1000": 2, "10000": 2 },
          platinum: { "1": 2, "10": 2, "100": 2, "1000": 2, "10000": 2 }
        }
      },
      'lot50-tresorerie': {
        name: "La Trésorerie du Seigneur",
        price: 275,
        multipliers: [1, 10, 100, 1000, 10000],
        coinLots: { copper: 10, silver: 10, electrum: 10, gold: 10, platinum: 10 }
      }
    };
  }

  /**
   * Calcule les besoins en pièces basés sur la conversion optimale du convertisseur
   * Se base sur les valeurs du tableau multiplicateur éditable qui reflète la conversion optimale
   */
  getOptimalCoinsBreakdown(baseValue) {
    const breakdown = {};
    
    // Lire les valeurs du tableau multiplicateur qui reflète la conversion optimale
    const multiplierInputs = document.querySelectorAll('.multiplier-input');
    
    multiplierInputs.forEach(input => {
      const currency = input.closest('tr').dataset.currency;
      const multiplier = parseInt(input.dataset.multiplier);
      const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;
      
      if (quantity > 0) {
        if (!breakdown[currency]) breakdown[currency] = {};
        breakdown[currency][multiplier.toString()] = quantity;
      }
    });
    
    return breakdown;
  }

  /**
   * Répartit optimalement un nombre de pièces par multiplicateurs
   */
  getMinimalCoinsForCurrency(totalUnits, multipliers) {
    const breakdown = {};
    let remaining = totalUnits;
    
    // Calcul de la répartition optimale par multiplicateur (du plus grand au plus petit)
    multipliers.slice().reverse().forEach(mult => {
      const qty = Math.floor(remaining / mult);
      if (qty > 0) {
        breakdown[mult] = qty;
        remaining -= qty * mult;
      }
    });
    
    return breakdown;
  }

  /**
   * Calcule les lots minimaux nécessaires - ALGORITHME OPTIMISÉ PAR COÛT
   * Teste toutes les combinaisons possibles et retourne la moins chère
   */
  calculateMinimalLots(coinsBreakdown) {
    if (!coinsBreakdown || Object.keys(coinsBreakdown).length === 0) {
      return [];
    }

    const allSolutions = [];
    
    // Générer toutes les combinaisons possibles de lots
    this.generateAllCombinations(coinsBreakdown, allSolutions);
    
    // Retourner la solution la moins chère
    if (allSolutions.length === 0) return [];
    
    const bestSolution = allSolutions.reduce((best, current) => 
      current.totalPrice < best.totalPrice ? current : best
    );
    
    return bestSolution.lots;
  }

  /**
   * Génère toutes les combinaisons possibles de lots pour couvrir les besoins
   */
  generateAllCombinations(coinsBreakdown, solutions) {
    // Option 1: Utiliser des lots complets (qui contiennent tous les multiplicateurs)
    this.tryCompleteLots(coinsBreakdown, solutions);
    
    // Option 2: Utiliser des lots à multiplicateur unique
    this.tryMultiplierSpecificLots(coinsBreakdown, solutions);
    
    // Option 3: Combinaisons mixtes (lot complet + lots spécifiques pour compléter)
    this.tryMixedCombinations(coinsBreakdown, solutions);
  }

  /**
   * Teste les lots complets qui contiennent tous les multiplicateurs
   */
  tryCompleteLots(coinsBreakdown, solutions) {
    const completeLots = ['lot25', 'lot50-essence'];
    
    completeLots.forEach(lotId => {
      const remainingNeeds = this.calculateRemainingNeeds(coinsBreakdown, lotId, 1);
      
      if (this.areNeedsEmpty(remainingNeeds)) {
        // Un seul lot suffit
        solutions.push({
          lots: [{
            productId: lotId,
            name: this.products[lotId].name,
            quantity: 1,
            price: this.products[lotId].price,
            multiplier: null
          }],
          totalPrice: this.products[lotId].price
        });
      } else {
        // Essayer de compléter avec d'autres lots
        this.tryCompleteWithOtherLots(remainingNeeds, solutions, [{
          productId: lotId,
          name: this.products[lotId].name,
          quantity: 1,
          price: this.products[lotId].price,
          multiplier: null
        }], this.products[lotId].price);
      }
    });
  }

  /**
   * Teste les lots à multiplicateur spécifique
   * Essaie de couvrir TOUS les multiplicateurs avec des combinaisons de lots
   */
  tryMultiplierSpecificLots(coinsBreakdown, solutions) {
    const multiplierLots = ['lot10', 'lot50-tresorerie'];
    const neededMultipliers = this.getNeededMultipliers(coinsBreakdown);
    
    // Générer toutes les combinaisons possibles de lots pour chaque multiplicateur
    this.generateMultiplierCombinations(coinsBreakdown, neededMultipliers, multiplierLots, solutions);
  }

  /**
   * Génère les combinaisons de lots pour couvrir tous les multiplicateurs
   */
  generateMultiplierCombinations(coinsBreakdown, neededMultipliers, multiplierLots, solutions) {
    // Pour chaque multiplicateur, calculer les options possibles
    const multiplierOptions = {};
    
    neededMultipliers.forEach(multiplier => {
      multiplierOptions[multiplier] = [];
      
      multiplierLots.forEach(lotId => {
        const lot = this.products[lotId];
        if (!lot.multipliers.includes(parseInt(multiplier))) return;
        
        const maxNeeded = this.getMaxQuantityNeededForMultiplier(coinsBreakdown, multiplier);
        const providedPerLot = this.getProvidedQuantityPerLot(lotId, multiplier);
        const lotsNeeded = Math.ceil(maxNeeded / providedPerLot);
        
        if (lotsNeeded > 0) {
          multiplierOptions[multiplier].push({
            lotId: lotId,
            quantity: lotsNeeded,
            cost: lotsNeeded * lot.price,
            multiplier: parseInt(multiplier)
          });
        }
      });
    });
    
    // Générer toutes les combinaisons possibles
    const combinations = this.generateCombinations(multiplierOptions);
    
    // Tester chaque combinaison
    combinations.forEach(combination => {
      const lotsList = [];
      let totalCost = 0;
      
      combination.forEach(option => {
        const lot = this.products[option.lotId];
        for (let i = 0; i < option.quantity; i++) {
          lotsList.push({
            productId: option.lotId,
            name: lot.name,
            quantity: 1,
            price: lot.price,
            multiplier: option.multiplier
          });
        }
        totalCost += option.cost;
      });
      
      // Vérifier si cette combinaison couvre tous les besoins
      const remainingNeeds = this.calculateRemainingNeedsForLotsList(coinsBreakdown, lotsList);
      if (this.areNeedsEmpty(remainingNeeds)) {
        solutions.push({
          lots: lotsList,
          totalPrice: totalCost
        });
      }
    });
  }

  /**
   * Génère toutes les combinaisons possibles à partir des options par multiplicateur
   */
  generateCombinations(multiplierOptions) {
    const multipliers = Object.keys(multiplierOptions);
    if (multipliers.length === 0) return [];
    
    const combinations = [];
    
    function generateRecursive(index, currentCombination) {
      if (index >= multipliers.length) {
        combinations.push([...currentCombination]);
        return;
      }
      
      const multiplier = multipliers[index];
      const options = multiplierOptions[multiplier];
      
      options.forEach(option => {
        currentCombination.push(option);
        generateRecursive(index + 1, currentCombination);
        currentCombination.pop();
      });
    }
    
    generateRecursive(0, []);
    return combinations;
  }

  /**
   * Teste les combinaisons mixtes (lot complet + compléments)
   */
  tryMixedCombinations(coinsBreakdown, solutions) {
    const completeLots = ['lot25', 'lot50-essence'];
    const multiplierLots = ['lot10', 'lot50-tresorerie'];
    
    completeLots.forEach(completeLotId => {
      const remainingNeeds = this.calculateRemainingNeeds(coinsBreakdown, completeLotId, 1);
      
      if (!this.areNeedsEmpty(remainingNeeds)) {
        // Essayer de compléter avec des lots à multiplicateur
        const neededMultipliers = this.getNeededMultipliers(remainingNeeds);
        
        neededMultipliers.forEach(multiplier => {
          multiplierLots.forEach(multiplierLotId => {
            const lot = this.products[multiplierLotId];
            if (!lot.multipliers.includes(parseInt(multiplier))) return;
            
            const maxNeeded = this.getMaxQuantityNeededForMultiplier(remainingNeeds, multiplier);
            const providedPerLot = this.getProvidedQuantityPerLot(multiplierLotId, multiplier);
            const lotsNeeded = Math.ceil(maxNeeded / providedPerLot);
            
            if (lotsNeeded > 0) {
              const baseLot = {
                productId: completeLotId,
                name: this.products[completeLotId].name,
                quantity: 1,
                price: this.products[completeLotId].price,
                multiplier: null
              };
              
              const complementLots = [];
              for (let i = 0; i < lotsNeeded; i++) {
                complementLots.push({
                  productId: multiplierLotId,
                  name: lot.name,
                  quantity: 1,
                  price: lot.price,
                  multiplier: parseInt(multiplier)
                });
              }
              
              const allLots = [baseLot, ...complementLots];
              const totalCost = allLots.reduce((sum, lot) => sum + lot.price, 0);
              
              // Vérifier si cette combinaison couvre tous les besoins
              const finalRemaining = this.calculateRemainingNeedsForLotsList(coinsBreakdown, allLots);
              if (this.areNeedsEmpty(finalRemaining)) {
                solutions.push({
                  lots: allLots,
                  totalPrice: totalCost
                });
              }
            }
          });
        });
      }
    });
  }

  /**
   * Calcule les besoins restants après avoir utilisé un lot spécifique
   */
  calculateRemainingNeeds(originalNeeds, lotId, quantity) {
    const remaining = JSON.parse(JSON.stringify(originalNeeds)); // Deep clone
    const lot = this.products[lotId];
    
    if (!lot) return remaining;
    
    for (let i = 0; i < quantity; i++) {
      if (lot.multipliers.length === 0) {
        // Lot complet - soustrait selon coinLots détaillé
        for (const currency in lot.coinLots) {
          if (typeof lot.coinLots[currency] === 'object') {
            // Format { "1": 1, "10": 1, ... }
            for (const multiplier in lot.coinLots[currency]) {
              const provided = lot.coinLots[currency][multiplier];
              if (remaining[currency] && remaining[currency][multiplier]) {
                remaining[currency][multiplier] = Math.max(0, remaining[currency][multiplier] - provided);
                if (remaining[currency][multiplier] === 0) {
                  delete remaining[currency][multiplier];
                }
              }
            }
            if (remaining[currency] && Object.keys(remaining[currency]).length === 0) {
              delete remaining[currency];
            }
          }
        }
      }
    }
    
    return remaining;
  }

  /**
   * Calcule les besoins restants après utilisation d'une liste de lots
   */
  calculateRemainingNeedsForLotsList(originalNeeds, lotsList) {
    let remaining = JSON.parse(JSON.stringify(originalNeeds));
    
    lotsList.forEach(lot => {
      if (lot.multiplier !== null) {
        // Lot avec multiplicateur spécifique
        const provided = this.getProvidedQuantityPerLot(lot.productId, lot.multiplier.toString());
        const currencies = Object.keys(this.products[lot.productId].coinLots);
        
        currencies.forEach(currency => {
          if (remaining[currency] && remaining[currency][lot.multiplier.toString()]) {
            remaining[currency][lot.multiplier.toString()] = Math.max(0, 
              remaining[currency][lot.multiplier.toString()] - provided);
            if (remaining[currency][lot.multiplier.toString()] === 0) {
              delete remaining[currency][lot.multiplier.toString()];
            }
          }
        });
        
        // Nettoyer les devises vides
        Object.keys(remaining).forEach(currency => {
          if (Object.keys(remaining[currency]).length === 0) {
            delete remaining[currency];
          }
        });
      } else {
        // Lot complet
        remaining = this.calculateRemainingNeeds(remaining, lot.productId, 1);
      }
    });
    
    return remaining;
  }

  /**
   * Vérifie si tous les besoins sont satisfaits (objet vide)
   */
  areNeedsEmpty(needs) {
    return Object.keys(needs).length === 0;
  }

  /**
   * Obtient la quantité maximale nécessaire pour un multiplicateur donné
   */
  getMaxQuantityNeededForMultiplier(coinsBreakdown, multiplier) {
    let maxNeeded = 0;
    
    Object.keys(coinsBreakdown).forEach(currency => {
      if (coinsBreakdown[currency][multiplier]) {
        maxNeeded = Math.max(maxNeeded, coinsBreakdown[currency][multiplier]);
      }
    });
    
    return maxNeeded;
  }

  /**
   * Obtient la quantité fournie par lot pour un multiplicateur
   */
  getProvidedQuantityPerLot(lotId, multiplier) {
    const lot = this.products[lotId];
    if (!lot) return 0;
    
    if (lot.multipliers.length > 0) {
      // Lot à multiplicateur spécifique - retourne la quantité de chaque monnaie
      if (typeof lot.coinLots === 'object' && typeof lot.coinLots.copper === 'number') {
        return lot.coinLots.copper; // Toutes les devises ont la même quantité
      }
    }
    
    return 0;
  }

  /**
   * Essaie de compléter avec d'autres lots (méthode utilitaire)
   */
  tryCompleteWithOtherLots(remainingNeeds, solutions, baseLots, baseCost) {
    // Implémentation simplifiée - pour l'instant ne fait rien
    // Cette méthode peut être étendue pour des combinaisons plus complexes
  }
  
  /**
   * Récupère tous les multiplicateurs nécessaires
   */
  getNeededMultipliers(coinsBreakdown) {
    const multipliers = new Set();
    
    Object.keys(coinsBreakdown).forEach(currency => {
      const currencyData = coinsBreakdown[currency];
      if (currencyData && typeof currencyData === 'object') {
        Object.keys(currencyData).forEach(mult => {
          const amount = currencyData[mult];
          if (amount && amount > 0) {
            multipliers.add(mult);
          }
        });
      }
    });
    
    return Array.from(multipliers).sort((a, b) => parseInt(a) - parseInt(b));
  }


  /**
   * Formate une recommandation pour l'affichage
   */
  formatRecommendation(lots) {
    if (!lots || lots.length === 0) {
      return "Aucune recommandation disponible";
    }

    let html = '<div class="space-y-3">';
    let totalPrice = 0;

    lots.forEach(lot => {
      // Vérifier que toutes les propriétés existent
      const quantity = lot.quantity || 1;
      const price = lot.price || 60;
      const name = lot.name || "Offrande du Voyageur";
      const multiplier = lot.multiplier;
      
      const multiplierText = multiplier !== null && multiplier !== undefined
        ? ` <span class="text-sm text-gray-400">(×${this.nf.format(multiplier)})</span>`
        : '';
        
      html += `
        <div class="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div class="flex-1">
            <span class="font-medium text-gray-200">${quantity}× ${name}</span>
            ${multiplierText}
          </div>
          <div class="text-right">
            <span class="text-green-400 font-medium">$${this.nf.format(price * quantity)}</span>
          </div>
        </div>
      `;
      totalPrice += price * quantity;
    });

    html += `
      <div class="border-t border-gray-600 pt-3 mt-3">
        <div class="flex items-center justify-between font-bold text-lg">
          <span class="text-gray-200">Total</span>
          <span class="text-green-400">$${this.nf.format(totalPrice)}</span>
        </div>
      </div>
    </div>`;

    return html;
  }

  /**
   * Génère les données pour l'ajout au panier
   */
  generateCartData(lots) {
    return lots.map(lot => ({
      productId: lot.productId || 'lot10',
      quantity: lot.quantity || 1,
      multiplier: lot.multiplier,
      price: (lot.price || 60) * (lot.quantity || 1)
    }));
  }
}

// Initialisation globale
window.CoinLotsRecommender = CoinLotsRecommender;