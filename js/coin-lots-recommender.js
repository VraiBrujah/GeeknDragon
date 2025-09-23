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

      // Ne traiter que les lots de pièces et pièces personnalisées
      if (id.startsWith('lot') || id.startsWith('piece') || id.includes('essence') || id.includes('tresorerie')) {
        convertedProducts[id] = {
          name: product.name || product.name_fr || id,
          price: product.price || 0,
          multipliers: product.multipliers || [],
          coinLots: product.coin_lots || {},
          customizable: product.customizable || false,
          metals: product.metals || [],
          metals_en: product.metals_en || []
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
      'piece-personnalisee': {
        name: "Pièce Personnalisée",
        price: 15,
        multipliers: [1, 10, 100, 1000, 10000],
        coinLots: { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 },
        customizable: true,
        metals: ["cuivre", "argent", "électrum", "or", "platine"],
        metals_en: ["copper", "silver", "electrum", "gold", "platinum"]
      },
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
   * Calcule les lots minimaux nécessaires - ALGORITHME SIMPLIFIÉ ET OPTIMISÉ
   * Génère toutes les solutions possibles et retourne la moins chère
   */
  calculateMinimalLots(coinsBreakdown) {
    if (!coinsBreakdown || Object.keys(coinsBreakdown).length === 0) {
      return [];
    }

    const solutions = [];

    // Détection spéciale : 1 de chaque métal = Quintessence Métallique optimal
    if (this.isOneOfEachMetal(coinsBreakdown)) {
      this.addQuintessenceMetalliqueSolution(coinsBreakdown, solutions);
    }

    // Solution 1: Pièces personnalisées uniquement
    this.addCustomCoinsSolution(coinsBreakdown, solutions);

    // Solution 2-N: Chaque lot possible + compléments optimaux
    Object.keys(this.products).forEach(productId => {
      if (productId !== 'piece-personnalisee') {
        this.addLotBasedSolutions(coinsBreakdown, productId, solutions);
      }
    });

    // Retourner la solution la moins chère
    if (solutions.length === 0) return [];

    return solutions.reduce((best, current) =>
      current.totalPrice < best.totalPrice ? current : best
    ).lots;
  }

  /**
   * Vérifie si les besoins correspondent exactement à 1 de chaque métal
   */
  isOneOfEachMetal(coinsBreakdown) {
    const metals = ['copper', 'silver', 'electrum', 'gold', 'platinum'];
    
    // Compter le nombre total de pièces par métal
    const totalsByMetal = {};
    metals.forEach(metal => {
      totalsByMetal[metal] = 0;
      if (coinsBreakdown[metal]) {
        Object.values(coinsBreakdown[metal]).forEach(count => {
          totalsByMetal[metal] += count;
        });
      }
    });
    
    // Vérifier si c'est exactement 1 de chaque métal
    return metals.every(metal => totalsByMetal[metal] === 1) &&
           Object.keys(coinsBreakdown).length === 5;
  }

  /**
   * Ajoute la solution Quintessence Métallique optimale
   */
  addQuintessenceMetalliqueSolution(coinsBreakdown, solutions) {
    const quintessence = this.products['lot5-metaux'];
    if (!quintessence) return;

    const lots = [{
      productId: 'lot5-metaux',
      name: quintessence.name,
      quantity: 1,
      price: quintessence.price,
      multiplier: null
    }];

    solutions.push({ 
      lots, 
      totalPrice: quintessence.price 
    });
  }

  /**
   * Ajoute la solution "pièces personnalisées uniquement"
   */
  addCustomCoinsSolution(coinsBreakdown, solutions) {
    const customCoin = this.products['piece-personnalisee'];
    if (!customCoin || !customCoin.customizable) return;

    const lots = [];
    let totalPrice = 0;

    Object.keys(coinsBreakdown).forEach(currency => {
      Object.keys(coinsBreakdown[currency]).forEach(multiplier => {
        const quantity = coinsBreakdown[currency][multiplier];
        if (quantity > 0) {
          lots.push({
            productId: 'piece-personnalisee',
            name: `Pièce Personnalisée en ${this.getMetalDisplayName(currency)}`,
            quantity: quantity,
            price: customCoin.price * quantity,
            multiplier: parseInt(multiplier),
            metal: currency
          });
          totalPrice += customCoin.price * quantity;
        }
      });
    });

    if (lots.length > 0) {
      solutions.push({ lots, totalPrice });
    }
  }

  /**
   * Ajoute toutes les solutions basées sur un lot spécifique + compléments optimaux
   */
  addLotBasedSolutions(coinsBreakdown, baseLotId, solutions) {
    const baseLot = this.products[baseLotId];
    if (!baseLot) return;

    // Pour chaque multiplicateur disponible dans ce lot
    const availableMultipliers = baseLot.multipliers || [];

    if (availableMultipliers.length === 0) {
      // Lot complet (contient tous les multiplicateurs)
      this.tryCompleteLotWithComplements(coinsBreakdown, baseLotId, solutions);
    } else {
      // Lot à multiplicateur spécifique
      availableMultipliers.forEach(multiplier => {
        this.tryMultiplierLotWithComplements(coinsBreakdown, baseLotId, multiplier, solutions);
      });
    }
  }

  /**
   * Teste un lot complet + compléments optimaux
   */
  tryCompleteLotWithComplements(coinsBreakdown, lotId, solutions) {
    const lot = this.products[lotId];
    const remaining = this.calculateRemainingNeeds(coinsBreakdown, lotId, 1);

    const baseLots = [{
      productId: lotId,
      name: lot.name,
      quantity: 1,
      price: lot.price,
      multiplier: null
    }];

    const complements = this.getOptimalComplements(remaining);
    const allLots = [...baseLots, ...complements];
    const totalPrice = allLots.reduce((sum, l) => sum + l.price, 0);

    solutions.push({ lots: allLots, totalPrice });
  }

  /**
   * Teste un lot à multiplicateur spécifique + compléments optimaux
   */
  tryMultiplierLotWithComplements(coinsBreakdown, lotId, multiplier, solutions) {
    const lot = this.products[lotId];
    const maxNeeded = this.getMaxQuantityNeededForMultiplier(coinsBreakdown, multiplier.toString());

    if (maxNeeded === 0) return;

    const providedPerLot = this.getProvidedQuantityPerLot(lotId, multiplier.toString());
    const lotsNeeded = Math.ceil(maxNeeded / providedPerLot);

    const baseLots = [];
    for (let i = 0; i < lotsNeeded; i++) {
      baseLots.push({
        productId: lotId,
        name: lot.name,
        quantity: 1,
        price: lot.price,
        multiplier: multiplier
      });
    }

    const remaining = this.calculateRemainingNeedsForLotsList(coinsBreakdown, baseLots);
    const complements = this.getOptimalComplements(remaining);
    const allLots = [...baseLots, ...complements];
    const totalPrice = allLots.reduce((sum, l) => sum + l.price, 0);

    solutions.push({ lots: allLots, totalPrice });
  }

  /**
   * Obtient les compléments optimaux pour des besoins restants
   */
  getOptimalComplements(remaining) {
    if (this.areNeedsEmpty(remaining)) return [];

    // Utiliser des pièces personnalisées pour compléter (solution optimale)
    const customCoin = this.products['piece-personnalisee'];
    if (!customCoin) return [];

    const complements = [];
    Object.keys(remaining).forEach(currency => {
      Object.keys(remaining[currency]).forEach(multiplier => {
        const quantity = remaining[currency][multiplier];
        if (quantity > 0) {
          complements.push({
            productId: 'piece-personnalisee',
            name: `Pièce Personnalisée en ${this.getMetalDisplayName(currency)}`,
            quantity: quantity,
            price: customCoin.price * quantity,
            multiplier: parseInt(multiplier),
            metal: currency
          });
        }
      });
    });

    return complements;
  }

  /**
   * Obtient le nom d'affichage d'un métal
   */
  getMetalDisplayName(currency) {
    const metalNames = {
      copper: 'cuivre',
      silver: 'argent',
      electrum: 'électrum',
      gold: 'or',
      platinum: 'platine'
    };
    return metalNames[currency] || currency;
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
      const metal = lot.metal;

      // Formatage spécial pour les pièces personnalisées
      let displayName = name;
      let detailsText = '';

      if (lot.productId && lot.productId.startsWith('piece') && metal && multiplier) {
        // Pour les pièces personnalisées, formater le nom proprement
        const metalNames = {
          copper: 'cuivre',
          silver: 'argent',
          electrum: 'électrum',
          gold: 'or',
          platinum: 'platine'
        };
        const metalDisplay = metalNames[metal] || metal;
        displayName = `Pièce Personnalisée en ${metalDisplay}`;
        detailsText = ` <span class="text-sm text-gray-400">(×${this.nf.format(multiplier)})</span>`;
      } else {
        // Pour les autres produits, utiliser l'ancien formatage
        if (multiplier !== null && multiplier !== undefined) {
          detailsText += ` <span class="text-sm text-gray-400">(×${this.nf.format(multiplier)}</span>`;
        }
        if (metal && !lot.productId?.startsWith('piece')) {
          detailsText += detailsText ? `, ${metal})` : ` <span class="text-sm text-gray-400">(${metal})</span>`;
        } else if (detailsText) {
          detailsText += ')';
        }
      }

      html += `
        <div class="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div class="flex-1">
            <span class="font-medium text-gray-200">${quantity}× ${displayName}</span>
            ${detailsText}
          </div>
          <div class="text-right">
            <span class="text-green-400 font-medium">$${this.nf.format(price)}</span>
          </div>
        </div>
      `;
      totalPrice += price;
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
      metal: lot.metal,
      price: lot.price || ((lot.price || 60) * (lot.quantity || 1)),
      customizable: lot.productId && lot.productId.startsWith('piece'),
      isCustomCoin: lot.productId && lot.productId.startsWith('piece-personnalisee')
    }));
  }
}

// Initialisation globale
window.CoinLotsRecommender = CoinLotsRecommender;