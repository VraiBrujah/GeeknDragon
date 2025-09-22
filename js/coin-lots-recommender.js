/**
 * Recommandeur de lots de pièces - VERSION OPTIMISÉE
 * Calcule les lots minimaux au meilleur prix pour couvrir les besoins
 */
class CoinLotsRecommender {
  constructor() {
    this.nf = new Intl.NumberFormat('en-US');
    
    // Charger les vrais produits depuis le JSON (en dur pour l'instant, à terme depuis fetch)
    this.products = {
      'lot10': {
        name: "L'Offrande du Voyageur",
        price: 60,
        multipliers: [1, 10, 100, 1000, 10000], // Multiplicateur à choisir
        coinLots: { copper: 2, silver: 2, electrum: 2, gold: 2, platinum: 2 }
      },
      'lot25': {
        name: "La Monnaie des Cinq Royaumes", 
        price: 145,
        multipliers: [], // Pas de choix, contient tous les multiplicateurs
        coinLots: {
          copper: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          silver: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          electrum: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          gold: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
          platinum: { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 }
        }
      },
      'lot50-essence': {
        name: "L'Essence du Marchand",
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
   * Calcule les besoins en pièces par multiplicateur depuis le convertisseur
   */
  getOptimalCoinsBreakdown(baseValue) {
    const rates = { copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000 };
    const multipliers = [1, 10, 100, 1000, 10000];
    
    const breakdown = {};
    
    // Calculer pour chaque type de monnaie
    Object.keys(rates).forEach(currency => {
      const totalUnits = Math.floor(baseValue / rates[currency]);
      if (totalUnits > 0) {
        breakdown[currency] = this.getMinimalCoinsForCurrency(totalUnits, multipliers);
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
   * Calcule les lots minimaux nécessaires - ALGORITHME VRAIMENT OPTIMISÉ
   */
  calculateMinimalLots(coinsBreakdown) {
    if (!coinsBreakdown || Object.keys(coinsBreakdown).length === 0) {
      return [];
    }

    // Analyser les besoins réels
    const neededMultipliers = this.getNeededMultipliers(coinsBreakdown);
    const neededCurrencies = Object.keys(coinsBreakdown);
    
    console.log('Debug - coinsBreakdown:', coinsBreakdown);
    console.log('Debug - neededMultipliers:', neededMultipliers);
    
    // Générer toutes les options possibles
    const options = [];
    
    // Option 1: Tester si un seul lot peut couvrir TOUS les besoins (tous multiplicateurs confondus)
    // Tester L'Offrande du Voyageur pour chaque multiplicateur possible
    neededMultipliers.forEach(mult => {
      const multiplierInt = parseInt(mult);
      
      if (this.products['lot10'].multipliers.includes(multiplierInt)) {
        const lot10 = this.products['lot10'];
        if (this.canSingleLotCoverAllNeeds(coinsBreakdown, multiplierInt, lot10)) {
          options.push({
            lots: [{
              productId: 'lot10',
              name: lot10.name,
              quantity: 1,
              price: lot10.price,
              multiplier: multiplierInt
            }],
            totalPrice: lot10.price
          });
        }
      }
      
      // Tester La Trésorerie du Seigneur
      if (this.products['lot50-tresorerie'].multipliers.includes(multiplierInt)) {
        const lot50 = this.products['lot50-tresorerie'];
        if (this.canSingleLotCoverAllNeeds(coinsBreakdown, multiplierInt, lot50)) {
          options.push({
            lots: [{
              productId: 'lot50-tresorerie',
              name: lot50.name,
              quantity: 1,
              price: lot50.price,
              multiplier: multiplierInt
            }],
            totalPrice: lot50.price
          });
        }
      }
    });
    
    // Option 2: lots complets (lot25, lot50-essence) si ils couvrent les besoins
    options.push(...this.calculateCompleteLots(coinsBreakdown, neededMultipliers, neededCurrencies));
    
    // Option 3: Combinaisons de lots individuels si aucune option simple ne fonctionne
    if (options.length === 0) {
      options.push(this.calculateMultiLotSolution(coinsBreakdown, neededMultipliers));
    }
    
    // Filtrer les options valides et trouver la moins chère
    const validOptions = options.filter(option => 
      option && option.lots && option.lots.length > 0 && this.coversAllNeeds(option.lots, coinsBreakdown)
    );
    
    console.log('Debug - validOptions:', validOptions);
    
    if (validOptions.length === 0) {
      return [];
    }
    
    // Retourner l'option la moins chère
    const bestOption = validOptions.reduce((best, current) => 
      current.totalPrice < best.totalPrice ? current : best
    );
    
    console.log('Debug - bestOption:', bestOption);
    return bestOption.lots;
  }

  /**
   * Vérifie si un lot unique peut couvrir TOUS les besoins (tous multiplicateurs confondus)
   */
  canSingleLotCoverAllNeeds(coinsBreakdown, multiplier, product) {
    // Vérifier pour chaque type de pièce et chaque multiplicateur si le lot couvre le besoin
    for (const currency of Object.keys(coinsBreakdown)) {
      for (const mult of Object.keys(coinsBreakdown[currency])) {
        const needed = coinsBreakdown[currency][mult] || 0;
        if (needed > 0) {
          // Le lot doit pouvoir fournir avec le multiplicateur testé
          if (parseInt(mult) === multiplier) {
            const provided = product.coinLots[currency] || 0;
            if (needed > provided) {
              return false;
            }
          } else {
            // Si on a besoin d'un autre multiplicateur, ce lot ne peut pas tout couvrir
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Calcule une solution avec plusieurs lots individuels
   */
  calculateMultiLotSolution(coinsBreakdown, neededMultipliers) {
    const lots = [];
    let totalPrice = 0;
    
    neededMultipliers.forEach(mult => {
      const multiplierInt = parseInt(mult);
      
      // Choisir le lot le moins cher qui supporte ce multiplicateur
      if (this.products['lot10'].multipliers.includes(multiplierInt)) {
        lots.push({
          productId: 'lot10',
          name: this.products['lot10'].name,
          quantity: 1,
          price: this.products['lot10'].price,
          multiplier: multiplierInt
        });
        totalPrice += this.products['lot10'].price;
      }
    });
    
    return {
      lots: lots,
      totalPrice: totalPrice
    };
  }


  /**
   * Calcule les options avec des lots complets
   */
  calculateCompleteLots(coinsBreakdown, neededMultipliers, neededCurrencies) {
    const options = [];
    
    // Vérifier lot25
    if (this.canLot25Cover(coinsBreakdown, neededMultipliers, neededCurrencies)) {
      options.push({
        lots: [{
          productId: 'lot25',
          name: "La Monnaie des Cinq Royaumes",
          quantity: 1,
          price: 145,
          multiplier: null
        }],
        totalPrice: 145
      });
    }
    
    // Vérifier lot50-essence si besoin de plus de quantité
    if (this.canLot50EssenceCover(coinsBreakdown, neededMultipliers, neededCurrencies)) {
      options.push({
        lots: [{
          productId: 'lot50-essence',
          name: "L'Essence du Marchand",
          quantity: 1,
          price: 275,
          multiplier: null
        }],
        totalPrice: 275
      });
    }
    
    return options;
  }

  /**
   * Calcule les options mixtes (combinaisons)
   */
  calculateMixedOptions(coinsBreakdown, neededMultipliers, neededCurrencies) {
    // Pour l'instant, on garde simple - peut être étendu plus tard
    return [];
  }

  /**
   * Vérifie si lot25 peut couvrir les besoins
   */
  canLot25Cover(coinsBreakdown, neededMultipliers, neededCurrencies) {
    const lot25 = this.products['lot25'];
    
    // Vérifier pour chaque besoin
    for (const currency of neededCurrencies) {
      for (const mult of neededMultipliers) {
        const needed = coinsBreakdown[currency][mult] || 0;
        const provided = lot25.coinLots[currency] && lot25.coinLots[currency][mult] ? lot25.coinLots[currency][mult] : 0;
        
        if (needed > provided) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Vérifie si lot50-essence peut couvrir les besoins
   */
  canLot50EssenceCover(coinsBreakdown, neededMultipliers, neededCurrencies) {
    const lot50 = this.products['lot50-essence'];
    
    // Vérifier pour chaque besoin
    for (const currency of neededCurrencies) {
      for (const mult of neededMultipliers) {
        const needed = coinsBreakdown[currency][mult] || 0;
        const provided = lot50.coinLots[currency] && lot50.coinLots[currency][mult] ? lot50.coinLots[currency][mult] : 0;
        
        if (needed > provided) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Vérifie si une combinaison de lots couvre tous les besoins
   */
  coversAllNeeds(lots, coinsBreakdown) {
    const provided = {};
    
    // Calculer ce que fournissent les lots
    lots.forEach(lot => {
      const product = this.products[lot.productId];
      if (!product) return;
      
      if (lot.multiplier !== null && lot.multiplier !== undefined) {
        // Lot avec multiplicateur spécifique
        Object.keys(product.coinLots).forEach(currency => {
          if (!provided[currency]) provided[currency] = {};
          if (!provided[currency][lot.multiplier.toString()]) provided[currency][lot.multiplier.toString()] = 0;
          provided[currency][lot.multiplier.toString()] += product.coinLots[currency] * lot.quantity;
        });
      } else {
        // Lot complet (lot25, lot50-essence)
        Object.keys(product.coinLots).forEach(currency => {
          if (!provided[currency]) provided[currency] = {};
          Object.keys(product.coinLots[currency]).forEach(mult => {
            if (!provided[currency][mult]) provided[currency][mult] = 0;
            provided[currency][mult] += product.coinLots[currency][mult] * lot.quantity;
          });
        });
      }
    });
    
    // Vérifier que tous les besoins sont couverts
    for (const currency of Object.keys(coinsBreakdown)) {
      for (const mult of Object.keys(coinsBreakdown[currency])) {
        const needed = coinsBreakdown[currency][mult];
        const available = provided[currency] && provided[currency][mult] ? provided[currency][mult] : 0;
        
        if (needed > available) {
          return false;
        }
      }
    }
    
    return true;
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
      const name = lot.name || "L'Offrande du Voyageur";
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