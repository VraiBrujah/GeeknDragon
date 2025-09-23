/**
 * Algorithme de recommandation de lots de pièces optimisé
 * Trouve les combinaisons au coût total minimum via analyse dynamique de products.json
 */
class CoinLotRecommender {
  
  constructor() {
    this.debugMode = false;
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
    
    // Convertir le format needs en format standardisé
    const standardNeeds = this.standardizeNeeds(needs);
    if (this.debugMode) {
      console.log('Besoins standardisés:', standardNeeds);
    }
    
    // Trouver la solution optimale
    const optimalSolution = this.findMinimalCostSolution(standardNeeds);
    
    if (!optimalSolution) {
      return null; // Pas de solution trouvée
    }
    
    // Formater pour l'ancien algorithme
    return this.formatRecommendations(optimalSolution);
  }
  
  /**
   * Standardise les besoins en format uniforme
   * @param {Object} needs - Format {currency_multiplier: quantity}
   * @returns {Object} - Format {metal: {multiplier: quantity}}
   */
  standardizeNeeds(needs) {
    const standard = {};
    
    Object.entries(needs).forEach(([key, quantity]) => {
      if (quantity > 0) {
        const [metal, multiplier] = key.split('_');
        const mult = parseInt(multiplier) || 1;
        
        if (!standard[metal]) {
          standard[metal] = {};
        }
        standard[metal][mult] = quantity;
      }
    });
    
    return standard;
  }
  
  /**
   * Trouve la solution au coût minimum en analysant tous les lots disponibles
   */
  findMinimalCostSolution(standardNeeds) {
    const allCombinations = this.generateAllPossibleCombinations(standardNeeds);
    
    if (allCombinations.length === 0) {
      return null;
    }
    
    // Trier par prix total croissant
    allCombinations.sort((a, b) => a.totalCost - b.totalCost);
    
    if (this.debugMode) {
      console.log('Meilleures combinaisons:', allCombinations.slice(0, 3));
    }
    
    return allCombinations[0];
  }
  
  /**
   * Génère toutes les combinaisons possibles de lots pour satisfaire les besoins
   */
  generateAllPossibleCombinations(standardNeeds) {
    const combinations = [];
    
    // 1. Analyser chaque produit qui a des coin_lots
    Object.entries(window.products).forEach(([productId, product]) => {
      if (!product.coin_lots || typeof product.coin_lots !== 'object') {
        return;
      }
      
      const multipliers = product.customizable && product.multipliers ? product.multipliers : [1];
      
      // Tester chaque multiplicateur disponible
      multipliers.forEach(multiplier => {
        const solution = this.testProductForNeeds(productId, product, multiplier, standardNeeds);
        if (solution) {
          combinations.push(solution);
        }
      });
    });
    
    // Note: Les pièces personnalisées sont maintenant traitées comme tous les autres produits
    
    return combinations;
  }
  
  /**
   * Teste si un produit peut satisfaire les besoins avec un multiplicateur donné
   */
  testProductForNeeds(productId, product, multiplier, standardNeeds) {
    if (this.debugMode) {
      console.log(`🔍 Test produit ${productId} avec multiplicateur ${multiplier}`);
    }
    
    // Vérifier si ce produit peut satisfaire TOUS les besoins du même multiplicateur
    const metalGroups = {};
    
    // Regrouper tous les besoins par multiplicateur
    for (const [metal, multiplierNeeds] of Object.entries(standardNeeds)) {
      if (multiplierNeeds[multiplier] && multiplierNeeds[multiplier] > 0) {
        if (product.coin_lots[metal] && product.coin_lots[metal] > 0) {
          metalGroups[metal] = multiplierNeeds[multiplier];
        } else {
          // Ce produit ne fournit pas ce métal
          if (this.debugMode) {
            console.log(`  ❌ ${metal}: produit ne fournit pas ce métal`);
          }
          return null;
        }
      }
    }
    
    
    // Si aucun besoin pour ce multiplicateur, ignorer
    if (Object.keys(metalGroups).length === 0) {
      return null;
    }
    
    // CORRECTION CRITIQUE: Calculer le coût réel selon le type de produit
    let totalCost = 0;
    let totalQuantity = 0;
    
    if (productId === 'coin-custom-single' || productId === 'coin-trio-customizable') {
      // Pièces personnalisables = 1 produit par métal différent nécessaire
      const metalCount = Object.keys(metalGroups).length;
      const maxQuantityPerMetal = Math.max(...Object.values(metalGroups));
      
      if (metalCount > 1) {
        // Plusieurs métaux = impossible à satisfaire avec un seul produit
        return null;
      }
      
      // Un seul métal
      const [metal, quantity] = Object.entries(metalGroups)[0];
      const coinsPerProduct = productId === 'coin-custom-single' ? 1 : 3;
      totalQuantity = Math.ceil(quantity / coinsPerProduct);
      totalCost = product.price * totalQuantity;
      
      if (this.debugMode) {
        console.log(`  📊 ${product.name}: ${quantity} ${metal} nécessaires, ${coinsPerProduct} par produit = ${totalQuantity} produit(s) × ${product.price}$ = ${totalCost}$`);
      }
    } else {
      // Produit lot (ex: Quintessence) = 1 exemplaire pour couvrir tous les métaux
      let maxQuantityNeeded = 0;
      for (const [metal, neededQty] of Object.entries(metalGroups)) {
        const providedQty = product.coin_lots[metal];
        const requiredInstances = Math.ceil(neededQty / providedQty);
        maxQuantityNeeded = Math.max(maxQuantityNeeded, requiredInstances);
      }
      totalQuantity = maxQuantityNeeded;
      totalCost = product.price * maxQuantityNeeded;
      
      if (this.debugMode) {
        console.log(`  📊 Produit lot: ${maxQuantityNeeded} exemplaire(s) × ${product.price}$ = ${totalCost}$`);
      }
    }
    
    const solution = {
      type: 'product_solution',
      lots: [{
        productId,
        product,
        multiplier,
        quantity: totalQuantity,
        covers: metalGroups,
        isCustomCoin: productId === 'coin-custom-single'
      }],
      totalCost,
      description: `${product.name} (×${multiplier}) - ${totalQuantity} pièce(s)`
    };
    
    if (this.debugMode) {
      console.log(`  🎯 Solution trouvée: ${solution.description} = ${totalCost}$`);
    }
    
    return solution;
  }
  
  
  /**
   * Formate les recommandations selon le format attendu par l'ancien algorithme
   * UNIFIÉ : même logique pour tous les types de produits
   */
  formatRecommendations(solution) {
    if (!solution || !solution.lots || solution.lots.length === 0) {
      return null;
    }
    
    const recommendations = [];
    
    // TRAITEMENT UNIFIÉ pour tous les types de produits
    solution.lots.forEach(lot => {
      if (lot.isCustomCoin || lot.productId === 'coin-trio-customizable') {
        // Pièces personnalisables : une recommandation par métal nécessaire
        Object.keys(lot.covers).forEach(metal => {
          const metalName = this.getMetalDisplayName(metal);
          
          const recommendation = {
            productId: lot.productId,
            quantity: lot.quantity,
            price: lot.product.price,
            totalCost: lot.product.price * lot.quantity,
            displayName: `${lot.product.name} (${metalName} ×${lot.multiplier})`,
            customFields: {
              custom1: {
                name: 'Métal',
                type: 'dropdown',
                value: metal,
                options: 'copper|silver|electrum|gold|platinum',
                role: 'metal'
              }
            }
          };
          
          if (lot.multiplier !== 1) {
            recommendation.customFields.custom2 = {
              name: 'Multiplicateur',
              type: 'dropdown',
              value: lot.multiplier.toString(),
              options: '1|10|100|1000|10000',
              role: 'multiplier'
            };
          }
          
          recommendations.push(recommendation);
        });
        
      } else {
        // Produits lots (ex: Quintessence Métallique)
        const recommendation = {
          productId: lot.productId,
          quantity: lot.quantity,
          price: lot.product.price,
          totalCost: lot.product.price * lot.quantity,
          displayName: lot.product.name,
          customFields: {}
        };
        
        // CORRECTION: Toujours ajouter multiplicateur pour produits customizable
        if (lot.product.customizable) {
          recommendation.customFields.custom2 = {
            name: 'Multiplicateur',
            type: 'dropdown',
            value: lot.multiplier.toString(),
            options: '1|10|100|1000|10000',
            role: 'multiplier'
          };
        }
        
        recommendations.push(recommendation);
      }
    });
    
    if (this.debugMode) {
      console.log('Recommandations formatées:', recommendations);
      console.log('Coût total solution:', solution.totalCost);
    }
    
    return recommendations;
  }
  
  /**
   * Traduit le nom du métal pour l'affichage
   */
  getMetalDisplayName(metal) {
    const metalNames = {
      copper: 'cuivre',
      silver: 'argent',
      electrum: 'électrum',
      gold: 'or',
      platinum: 'platine'
    };
    return metalNames[metal] || metal;
  }
}

// Rendre la classe disponible globalement
window.CoinLotRecommender = CoinLotRecommender;