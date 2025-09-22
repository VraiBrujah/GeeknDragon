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
   * Calcule les lots minimaux nécessaires - ALGORITHME SIMPLE
   */
  calculateMinimalLots(coinsBreakdown) {
    if (!coinsBreakdown || Object.keys(coinsBreakdown).length === 0) {
      return [];
    }

    const allOptions = [];
    
    // Option 1: Lots individuels L'Offrande du Voyageur (un par multiplicateur)
    const individualLotsOption = this.calculateIndividualLotsOption(coinsBreakdown);
    if (individualLotsOption) {
      allOptions.push(individualLotsOption);
    }
    
    // Option 2: Lots complets
    const completeLots = [
      { id: 'lot25', name: "La Monnaie des Cinq Royaumes", price: 145 },
      { id: 'lot50-essence', name: "L'Essence du Marchand", price: 275 }
    ];
    
    completeLots.forEach(option => {
      if (this.lotCoversNeeds(option.id, coinsBreakdown)) {
        allOptions.push({
          lots: [{
            productId: option.id,
            name: option.name,
            quantity: 1,
            price: option.price,
            multiplier: null
          }],
          totalPrice: option.price
        });
      }
    });
    
    // Retourner l'option la moins chère
    if (allOptions.length === 0) return [];
    
    const bestOption = allOptions.reduce((best, current) => 
      current.totalPrice < best.totalPrice ? current : best
    );
    
    return bestOption.lots;
  }

  /**
   * Calcule l'option avec des lots individuels L'Offrande du Voyageur
   */
  calculateIndividualLotsOption(coinsBreakdown) {
    const neededMultipliers = this.getNeededMultipliers(coinsBreakdown);
    const lots = [];
    let totalPrice = 0;
    
    // Pour chaque multiplicateur, vérifier si on peut utiliser L'Offrande du Voyageur
    for (const mult of neededMultipliers) {
      const multiplier = parseInt(mult);
      
      // Vérifier si ce multiplicateur est supporté par L'Offrande du Voyageur
      if (!this.products['lot10'].multipliers.includes(multiplier)) {
        return null; // Ce multiplicateur n'est pas supporté
      }
      
      // Créer un breakdown pour ce multiplicateur seulement
      const multiplierBreakdown = {};
      for (const currency in coinsBreakdown) {
        if (coinsBreakdown[currency][mult]) {
          multiplierBreakdown[currency] = { [mult]: coinsBreakdown[currency][mult] };
        }
      }
      
      // Vérifier si L'Offrande du Voyageur peut couvrir ce multiplicateur
      if (this.lot10CoversNeeds(multiplierBreakdown, multiplier)) {
        lots.push({
          productId: 'lot10',
          name: "L'Offrande du Voyageur",
          quantity: 1,
          price: 60,
          multiplier: multiplier
        });
        totalPrice += 60;
      } else {
        return null; // Un multiplicateur ne peut pas être couvert
      }
    }
    
    return { lots, totalPrice };
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
   * Vérifie si L'Offrande du Voyageur avec un multiplicateur couvre les besoins
   */
  lot10CoversNeeds(coinsBreakdown, testMultiplier) {
    const lot10 = this.products['lot10'];
    if (!lot10) return false;
    
    // Vérifier si tous les besoins sont au même multiplicateur
    for (const currency in coinsBreakdown) {
      for (const multiplier in coinsBreakdown[currency]) {
        if (parseInt(multiplier) !== testMultiplier) {
          return false; // Besoin d'un autre multiplicateur
        }
        
        const needed = coinsBreakdown[currency][multiplier];
        const provided = lot10.coinLots[currency] || 0;
        
        if (needed > provided) {
          return false; // Pas assez de pièces
        }
      }
    }
    
    return true;
  }

  /**
   * Vérifie si un lot couvre tous les besoins
   */
  lotCoversNeeds(lotId, coinsBreakdown) {
    const lot = this.products[lotId];
    if (!lot) return false;
    
    // Vérifier chaque besoin
    for (const currency in coinsBreakdown) {
      for (const multiplier in coinsBreakdown[currency]) {
        const needed = coinsBreakdown[currency][multiplier];
        const provided = lot.coinLots[currency] && lot.coinLots[currency][multiplier] 
          ? lot.coinLots[currency][multiplier] 
          : 0;
        
        if (needed > provided) {
          return false;
        }
      }
    }
    
    return true;
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