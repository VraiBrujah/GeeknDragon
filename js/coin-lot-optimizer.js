/**
 * CoinLotOptimizer - Algorithme de sac à dos pour optimisation des lots de pièces D&D
 * 
 * Responsabilité : Trouver la combinaison de lots la moins chère qui couvre exactement
 * les besoins de pièces, avec surplus autorisé mais déficit interdit.
 * 
 * Expansion complète des variations :
 * - Pièces Personnalisées : 25 variations (5 métaux × 5 multiplicateurs)
 * - Trio de Pièces : 25 variations (3 pièces même métal/multiplicateur)
 * - Quintessence Métallique : 5 variations (1 par multiplicateur, tous métaux)
 * - Septuple Libre : 25 variations (7 pièces même métal/multiplicateur)
 * - Produits fixes : parsing structure coin_lots
 */
class CoinLotOptimizer {
  constructor() {
    this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
    this.multipliers = [1, 10, 100, 1000, 10000];
    this.metalNames = {
      'fr': {'copper': 'Cuivre', 'silver': 'Argent', 'electrum': 'Électrum', 'gold': 'Or', 'platinum': 'Platine'},
      'en': {'copper': 'Copper', 'silver': 'Silver', 'electrum': 'Electrum', 'gold': 'Gold', 'platinum': 'Platinum'}
    };
  }

  getCurrentLang() {
    return document.documentElement?.lang || 'fr';
  }

  /**
   * Point d'entrée principal - trouve la combinaison optimale de lots
   * @param {Object} needs - Besoins exacts {"copper_1": 2, "platinum_10": 1, ...}
   * @returns {Array} Solution optimale formatée pour Snipcart
   */
  findOptimalProductCombination(needs) {
    console.log('🎯 CoinLotOptimizer: Recherche solution optimale pour:', needs);
    
    if (!needs || Object.keys(needs).length === 0) {
      return [];
    }

    // Vérifier disponibilité des produits
    if (!window.products) {
      console.warn('❌ CoinLotOptimizer: window.products non disponible');
      return [];
    }

    // 1. Générer toutes les variations possibles de tous les produits
    const allVariations = this.generateAllProductVariations();
    console.log(`📦 CoinLotOptimizer: ${allVariations.length} variations générées`);

    // 2. Appliquer l'algorithme de sac à dos pour trouver la solution optimale
    const optimalSolution = this.knapsackOptimize(needs, allVariations);

    // 3. Formater la solution pour l'interface utilisateur et Snipcart
    return this.formatSolution(optimalSolution);
  }

  /**
   * Génère toutes les variations possibles de tous les produits de type "pieces"
   * @returns {Array} Liste de toutes les variations avec capacités
   */
  generateAllProductVariations() {
    const variations = [];
    
    Object.entries(window.products).forEach(([productId, product]) => {
      if (!product || product.category !== 'pieces') return;
      
      if (product.customizable) {
        this.generateCustomizableVariations(productId, product, variations);
      } else {
        this.generateFixedVariations(productId, product, variations);
      }
    });
    
    console.log(`✅ CoinLotOptimizer: ${variations.length} variations générées au total`);
    return variations;
  }

  /**
   * Génère les variations pour les produits personnalisables
   * @param {string} productId - ID du produit
   * @param {Object} product - Données du produit
   * @param {Array} variations - Array à remplir
   */
  generateCustomizableVariations(productId, product, variations) {
    const metals = product.metals_en || ['copper', 'silver', 'electrum', 'gold', 'platinum'];
    const multipliers = product.multipliers || [1, 10, 100, 1000, 10000];
    
    // Détecter le type de produit par ID
    if (productId === 'coin-quintessence-metals') {
      // CAS SPÉCIAL : Quintessence Métallique
      // 5 variations (1 par multiplicateur)
      // Chaque variation donne 1 pièce de chaque métal avec le même multiplicateur
      console.log(`🔸 CoinLotOptimizer: ${product.name} - Type Quintessence (${multipliers.length} variations)`);
      
      multipliers.forEach(mult => {
        const capacity = {};
        metals.forEach(metal => {
          capacity[`${metal}_${mult}`] = 1; // 1 pièce de chaque métal
        });
        
        variations.push({
          productId,
          name: product.name,
          price: product.price,
          type: 'quintessence',
          multiplier: mult,
          capacity,
          coinsProvided: metals.length // 5 pièces total
        });
      });
      
    } else {
      // CAS STANDARD : Pièces Personnalisées, Trio, Septuple
      // 25 variations (5 métaux × 5 multiplicateurs)
      // Chaque variation donne N pièces du même métal/multiplicateur
      const coinsPerLot = Object.values(product.coin_lots)[0] || 1;
      console.log(`🔹 CoinLotOptimizer: ${product.name} - Type normal (${metals.length * multipliers.length} variations, ${coinsPerLot} pièces par lot)`);
      
      metals.forEach(metal => {
        multipliers.forEach(mult => {
          if (product.coin_lots[metal]) {
            const capacity = {};
            capacity[`${metal}_${mult}`] = product.coin_lots[metal]; // N pièces du même type
            
            variations.push({
              productId,
              name: product.name,
              price: product.price,
              type: 'normal',
              metal,
              multiplier: mult,
              capacity,
              coinsProvided: product.coin_lots[metal]
            });
          }
        });
      });
    }
  }

  /**
   * Génère les variations pour les produits fixes
   * @param {string} productId - ID du produit
   * @param {Object} product - Données du produit
   * @param {Array} variations - Array à remplir
   */
  generateFixedVariations(productId, product, variations) {
    console.log(`🔳 CoinLotOptimizer: ${product.name} - Produit fixe`);
    
    const multipliers = product.multipliers || [];
    
    if (multipliers.length > 0) {
      // Produit fixe avec choix de multiplicateur (ex: Offrande du Voyageur)
      multipliers.forEach(mult => {
        const capacity = {};
        let totalCoins = 0;
        
        if (product.coin_lots) {
          Object.entries(product.coin_lots).forEach(([metal, quantity]) => {
            if (typeof quantity === 'number' && quantity > 0) {
              capacity[`${metal}_${mult}`] = quantity;
              totalCoins += quantity;
            }
          });
        }
        
        if (Object.keys(capacity).length > 0) {
          variations.push({
            productId,
            name: product.name,
            price: product.price,
            type: 'fixed_multiplier',
            multiplier: mult,
            capacity,
            coinsProvided: totalCoins
          });
        }
      });
      
    } else {
      // Produit complètement fixe (ex: Collections complètes)
      const capacity = {};
      let totalCoins = 0;
      
      if (product.coin_lots) {
        Object.entries(product.coin_lots).forEach(([metal, data]) => {
          if (typeof data === 'number') {
            // Format simple: coin_lots.copper = 2
            capacity[`${metal}_1`] = data;
            totalCoins += data;
          } else if (typeof data === 'object' && data !== null) {
            // Format détaillé: coin_lots.copper.1 = 1, coin_lots.copper.10 = 1, etc.
            Object.entries(data).forEach(([mult, qty]) => {
              if (qty > 0) {
                capacity[`${metal}_${mult}`] = qty;
                totalCoins += qty;
              }
            });
          }
        });
      }
      
      if (Object.keys(capacity).length > 0) {
        variations.push({
          productId,
          name: product.name,
          price: product.price,
          type: 'fixed_complete',
          capacity,
          coinsProvided: totalCoins
        });
      }
    }
  }

  /**
   * Algorithme de sac à dos pour trouver la solution optimale
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Toutes les variations disponibles
   * @returns {Array} Solution optimale
   */
  knapsackOptimize(needs, variations) {
    console.log('🧮 CoinLotOptimizer: Algorithme de sac à dos...');
    
    const solutions = [];
    
    // ÉTAPE 1: Solutions à produit unique
    // Chercher si un seul produit peut couvrir tous les besoins
    variations.forEach(variation => {
      if (this.canCoverAllNeeds(variation, needs)) {
        const quantity = this.calculateRequiredQuantity(variation, needs);
        const cost = variation.price * quantity;
        
        solutions.push({
          items: [{ variation, quantity }],
          totalCost: cost,
          type: 'single'
        });
        
        console.log(`💡 CoinLotOptimizer: Solution unique: ${variation.name} (${variation.type}) x${quantity} = ${cost}$`);
      }
    });
    
    // ÉTAPE 2: Solution avec pièces personnalisées multiples
    // Générer une solution exacte avec des pièces personnalisées
    const customSolution = this.findCustomCoinsSolution(needs, variations);
    if (customSolution && customSolution.length > 0) {
      const totalCost = customSolution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
      
      solutions.push({
        items: customSolution,
        totalCost,
        type: 'custom_multiple'
      });
      
      console.log(`🔧 CoinLotOptimizer: Solution pièces personnalisées: ${totalCost}$ (${customSolution.length} produits)`);
    }
    
    // ÉTAPE 3: Solutions combinées avec quintessence + complément
    // Utiliser une approche de base + compléments pour les cas complexes
    const quintessenceVariations = variations.filter(v => v.type === 'quintessence');
    
    quintessenceVariations.forEach(baseVariation => {
      const coverage = this.calculateCoverage(baseVariation, needs, 1);
      const remaining = this.calculateRemainingNeeds(needs, coverage);
      
      if (Object.keys(remaining).length > 0) {
        const complement = this.findComplementSolution(remaining, variations);
        
        if (complement) {
          const allItems = [{ variation: baseVariation, quantity: 1 }, ...complement];
          const totalCost = allItems.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
          
          solutions.push({
            items: allItems,
            totalCost,
            type: 'combined'
          });
          
          console.log(`🔗 CoinLotOptimizer: Solution combinée: ${totalCost}$ (${allItems.length} produits)`);
        }
      }
    });
    
    // ÉTAPE 4: Sélectionner la meilleure solution
    solutions.sort((a, b) => a.totalCost - b.totalCost);
    
    if (solutions.length > 0) {
      const best = solutions[0];
      console.log(`🏆 CoinLotOptimizer: Solution optimale: ${best.totalCost}$ (${best.type})`);
      return best.items;
    }
    
    console.warn('⚠️ CoinLotOptimizer: Aucune solution trouvée');
    return [];
  }

  /**
   * Vérifie si une variation peut couvrir tous les besoins
   * @param {Object} variation - Variation à tester
   * @param {Object} needs - Besoins
   * @returns {boolean}
   */
  canCoverAllNeeds(variation, needs) {
    for (const [coinKey, needed] of Object.entries(needs)) {
      if (needed > 0 && (!variation.capacity[coinKey] || variation.capacity[coinKey] === 0)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calcule la quantité requise d'un produit pour couvrir les besoins
   * @param {Object} variation - Variation du produit
   * @param {Object} needs - Besoins
   * @returns {number}
   */
  calculateRequiredQuantity(variation, needs) {
    let maxQuantity = 1;
    
    for (const [coinKey, needed] of Object.entries(needs)) {
      if (needed > 0 && variation.capacity[coinKey]) {
        const requiredQty = Math.ceil(needed / variation.capacity[coinKey]);
        maxQuantity = Math.max(maxQuantity, requiredQty);
      }
    }
    
    return maxQuantity;
  }

  /**
   * Calcule la couverture fournie par une variation
   * @param {Object} variation - Variation du produit
   * @param {Object} needs - Besoins
   * @param {number} quantity - Quantité du produit
   * @returns {Object}
   */
  calculateCoverage(variation, needs, quantity = 1) {
    const coverage = {};
    
    for (const [coinKey, needed] of Object.entries(needs)) {
      const provided = (variation.capacity[coinKey] || 0) * quantity;
      if (provided > 0) {
        coverage[coinKey] = Math.min(needed, provided);
      }
    }
    
    return coverage;
  }

  /**
   * Calcule les besoins restants après couverture
   * @param {Object} originalNeeds - Besoins originaux
   * @param {Object} coverage - Couverture fournie
   * @returns {Object}
   */
  calculateRemainingNeeds(originalNeeds, coverage) {
    const remaining = {};
    
    for (const [coinKey, needed] of Object.entries(originalNeeds)) {
      const covered = coverage[coinKey] || 0;
      const stillNeeded = needed - covered;
      if (stillNeeded > 0) {
        remaining[coinKey] = stillNeeded;
      }
    }
    
    return remaining;
  }

  /**
   * Trouve une solution avec uniquement des pièces personnalisées
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Variations disponibles
   * @returns {Array|null}
   */
  findCustomCoinsSolution(needs, variations) {
    // Chercher toutes les pièces personnalisées nécessaires
    const customVariations = variations.filter(v => 
      v.productId === 'coin-custom-single' && v.type === 'normal'
    );
    
    const solution = [];
    
    for (const [coinKey, needed] of Object.entries(needs)) {
      if (needed <= 0) continue;
      
      const [metal, multiplier] = coinKey.split('_');
      const matchingVariation = customVariations.find(v => 
        v.metal === metal && v.multiplier == multiplier
      );
      
      if (matchingVariation) {
        solution.push({
          variation: matchingVariation,
          quantity: needed
        });
      } else {
        // Si on ne peut pas satisfaire un besoin, cette stratégie échoue
        return null;
      }
    }
    
    return solution.length > 0 ? solution : null;
  }

  /**
   * Trouve une solution complémentaire pour les besoins restants
   * @param {Object} remainingNeeds - Besoins restants
   * @param {Array} variations - Variations disponibles
   * @returns {Array|null}
   */
  findComplementSolution(remainingNeeds, variations) {
    // Même logique que findCustomCoinsSolution
    return this.findCustomCoinsSolution(remainingNeeds, variations);
  }

  /**
   * Formate la solution pour l'interface utilisateur et Snipcart
   * @param {Array} solution - Solution brute de l'algorithme
   * @returns {Array} Solution formatée
   */
  formatSolution(solution) {
    if (!solution || solution.length === 0) {
      return [];
    }
    
    const formatted = [];
    const lang = this.getCurrentLang();
    
    for (const item of solution) {
      const variation = item.variation;
      
      let displayName = variation.name;
      const customFields = {};
      
      // Formater selon le type de variation
      if (variation.type === 'quintessence') {
        displayName += ` (×${variation.multiplier})`;
        customFields[`multiplier-${variation.productId}`] = {
          role: 'multiplier',
          value: variation.multiplier
        };
        
      } else if (variation.type === 'normal' && variation.metal && variation.multiplier) {
        const metalName = this.metalNames[lang][variation.metal] || variation.metal;
        displayName += ` (${metalName} ×${variation.multiplier})`;
        
        customFields[`metal-${variation.productId}`] = {
          role: 'metal',
          value: variation.metal
        };
        customFields[`multiplier-${variation.productId}`] = {
          role: 'multiplier', 
          value: variation.multiplier
        };
        
      } else if (variation.type === 'fixed_multiplier') {
        displayName += ` (×${variation.multiplier})`;
        customFields[`multiplier-${variation.productId}`] = {
          role: 'multiplier',
          value: variation.multiplier
        };
      }
      
      formatted.push({
        productId: variation.productId,
        displayName,
        price: variation.price,
        quantity: item.quantity,
        totalCost: variation.price * item.quantity,
        customFields,
        url: `/${lang}/products/${variation.productId}/`,
        image: window.products[variation.productId]?.images?.[0] || null,
        description: window.products[variation.productId]?.description || ''
      });
    }
    
    return formatted;
  }
}

// Exposition globale pour l'intégration
window.CoinLotOptimizer = CoinLotOptimizer;