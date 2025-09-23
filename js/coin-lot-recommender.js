/**
 * Algorithme de recommandation de lots de pièces
 * Séparé du convertisseur de monnaie pour éviter les interférences
 * IMPORTANT: Doit générer exactement le même format que l'ancien algorithme
 */
class CoinLotRecommender {
  
  constructor() {
    // Aucune dépendance externe
  }
  
  /**
   * Trouve la combinaison de lots au prix total minimum
   * @param {Object} needs - Besoins par métal/multiplicateur {currency_multiplier: quantity}
   * @returns {Array} - Lots recommandés avec format compatible ancien algorithme
   */
  findOptimalLotCombination(needs) {
    if (!window.products || !needs || Object.keys(needs).length === 0) {
      return [];
    }
    
    // 1. Analyser tous les lots disponibles
    const availableLots = this.getAllAvailableLots();
    
    // 2. Trouver la meilleure combinaison
    const bestCombination = this.findBestCombination(needs, availableLots);
    
    // 3. Formater exactement comme l'ancien algorithme
    return this.formatRecommendations(bestCombination, needs);
  }
  
  /**
   * Analyse tous les produits avec coin_lots
   */
  getAllAvailableLots() {
    const lots = [];
    
    Object.entries(window.products).forEach(([productId, product]) => {
      if (product.coin_lots && typeof product.coin_lots === 'object') {
        // Pour chaque multiplicateur disponible
        const multipliers = product.customizable && product.multipliers ? product.multipliers : [1];
        
        multipliers.forEach(multiplier => {
          const provides = {};
          Object.entries(product.coin_lots).forEach(([metal, quantity]) => {
            if (quantity > 0) {
              const key = `${metal}_${multiplier}`;
              provides[key] = quantity;
            }
          });
          
          if (Object.keys(provides).length > 0) {
            lots.push({
              productId,
              product,
              multiplier,
              provides,
              price: product.price,
              isCustom: false
            });
          }
        });
      }
    });
    
    return lots;
  }
  
  /**
   * Trouve la meilleure combinaison de lots
   */
  findBestCombination(needs, availableLots) {
    let bestCombination = null;
    let bestTotalCost = Infinity;
    
    // 1. Essayer chaque lot individuel
    for (const lot of availableLots) {
      if (this.lotCoversNeeds(lot.provides, needs)) {
        if (lot.price < bestTotalCost) {
          bestTotalCost = lot.price;
          bestCombination = [lot];
        }
      }
    }
    
    // 2. Si aucun lot unique ne marche, essayer les combinaisons de 2
    if (!bestCombination) {
      for (let i = 0; i < availableLots.length; i++) {
        for (let j = i + 1; j < availableLots.length; j++) {
          const combination = [availableLots[i], availableLots[j]];
          const combinedProvides = this.combineLotProvides(combination);
          
          if (this.lotCoversNeeds(combinedProvides, needs)) {
            const totalCost = combination.reduce((sum, lot) => sum + lot.price, 0);
            if (totalCost < bestTotalCost) {
              bestTotalCost = totalCost;
              bestCombination = combination;
            }
          }
        }
      }
    }
    
    // 3. Fallback : utiliser l'ancien algorithme (pièce par pièce)
    if (!bestCombination) {
      return null; // Indique qu'il faut utiliser l'ancien algorithme
    }
    
    return bestCombination;
  }
  
  /**
   * Vérifie si un lot couvre tous les besoins
   */
  lotCoversNeeds(provides, needs) {
    for (const [key, neededQty] of Object.entries(needs)) {
      if (neededQty > 0 && (!provides[key] || provides[key] < neededQty)) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Combine les capacités de plusieurs lots
   */
  combineLotProvides(lots) {
    const combined = {};
    for (const lot of lots) {
      for (const [key, qty] of Object.entries(lot.provides)) {
        combined[key] = (combined[key] || 0) + qty;
      }
    }
    return combined;
  }
  
  /**
   * Formate les recommandations exactement comme l'ancien algorithme
   */
  formatRecommendations(lots, needs) {
    if (!lots || lots.length === 0) {
      return null; // Indique qu'il faut utiliser l'ancien algorithme
    }
    
    return lots.map(lot => {
      const recommendation = {
        productId: lot.productId,
        quantity: 1,
        price: lot.price,
        totalCost: lot.price,
        displayName: lot.product.name,
        customFields: {}
      };
      
      // Ajouter les champs personnalisés si nécessaire (multiplicateur pour lots)
      if (lot.product.customizable && lot.multiplier !== 1) {
        recommendation.customFields.custom2 = {
          name: 'Multiplicateur',
          type: 'dropdown',
          value: lot.multiplier.toString(),
          options: '1|10|100|1000|10000',
          role: 'multiplier'
        };
      }
      
      return recommendation;
    });
  }
}

// Rendre la classe disponible globalement
window.CoinLotRecommender = CoinLotRecommender;