// Test simple de la logique de recommandation
console.log('🧪 Test de la logique de recommandation...');

// Mock des données produits
const mockProducts = {
  "piece-personnalisee": {
    "name": "Pièce Personnalisée",
    "price": 15,
    "multipliers": [1, 10, 100, 1000, 10000],
    "coin_lots": { "copper": 1, "silver": 1, "electrum": 1, "gold": 1, "platinum": 1 },
    "customizable": true,
    "metals": ["cuivre", "argent", "électrum", "or", "platine"]
  },
  "lot10": {
    "name": "Offrande du Voyageur",
    "price": 60,
    "multipliers": [1, 10, 100, 1000, 10000],
    "coin_lots": { "copper": 2, "silver": 2, "electrum": 2, "gold": 2, "platinum": 2 }
  },
  "lot25": {
    "name": "La Monnaie des Cinq Royaumes",
    "price": 145,
    "multipliers": [],
    "coin_lots": {
      "copper": { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
      "silver": { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
      "electrum": { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
      "gold": { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 },
      "platinum": { "1": 1, "10": 1, "100": 1, "1000": 1, "10000": 1 }
    }
  }
};

// Mock global products
global.window = { products: mockProducts };

// Charger le script (en Node.js on aurait besoin d'adapter)
console.log('✅ Données mockées créées');

// Test des besoins spécifiques
const testBreakdown = {
  platinum: { "1": 1 },
  gold: { "1": 2 },
  electrum: { "1": 1 },
  silver: { "1": 1 },
  copper: { "1": 1 }
};

console.log('📊 Besoins testés:', JSON.stringify(testBreakdown, null, 2));

// Calcul manuel du coût minimum avec pièces personnalisées
const customCoinsCost = (1 + 2 + 1 + 1 + 1) * 15; // 6 pièces × 15$ = 90$
console.log(`💰 Coût solution pièces personnalisées: ${customCoinsCost}$`);

// Coût d'un lot complet
const completeLotCost = 145;
console.log(`💰 Coût lot complet: ${completeLotCost}$`);

// Coût de 2 lots multiplicateurs
const multiplierLotsCost = 60 * 2; // 2 × 60$ = 120$
console.log(`💰 Coût 2 lots multiplicateurs: ${multiplierLotsCost}$`);

console.log(`🎯 La solution optimale devrait être: ${Math.min(customCoinsCost, completeLotCost, multiplierLotsCost)}$ (pièces personnalisées)`);