// Test rapide du système de conversion
// Node.js n'est pas nécessaire, ce script sert de guide pour les tests manuels

console.log('🧪 Test rapide du système de conversion D&D');

// Cas de test spécifique mentionné par l'utilisateur
const testValue = 1661; // cuivres

console.log(`\n📊 Test: ${testValue} cuivres`);
console.log('Résultat attendu: 1 platine + 1 or×10 + 3 électrum×10 + 3 électrum + 1 argent + 1 cuivre = 4 pièces optimales');

// Pour référence, valeurs des pièces avec multiplicateurs
const rates = {
  copper: 1,      // 1 cuivre
  silver: 10,     // 10 cuivres
  electrum: 50,   // 50 cuivres
  gold: 100,      // 100 cuivres
  platinum: 1000  // 1000 cuivres
};

const multipliers = [1, 10, 100, 1000, 10000];

console.log('\n💰 Valeurs de référence:');
for (const [metal, value] of Object.entries(rates)) {
  for (const mult of multipliers) {
    const totalValue = value * mult;
    if (totalValue <= testValue) {
      console.log(`${metal} ×${mult}: ${totalValue} cuivres`);
    }
  }
}

console.log('\n🎯 Décomposition manuelle optimale pour 1661 cuivres:');
console.log('1000 (platine ×1) + 600 (or ×10) + 50 (électrum ×1) + 10 (argent ×1) + 1 (cuivre ×1) = 1661');
console.log('Total: 5 pièces physiques');

console.log('\n🛒 Lots attendus:');
console.log('- Quintessence Métallique (35$) couvre les 5 métaux de base');
console.log('- Pièce Personnalisée or ×10 (10$) pour les 600 cuivres supplémentaires');
console.log('Total recommandé: 45$ vs 5×10$ = 50$ individuel');

console.log('\n✅ Tests à valider:');
console.log('1. Le convertisseur trouve bien une solution en ≤5 pièces');
console.log('2. Les lots recommandés minimisent le coût (45$ vs 50$)');
console.log('3. Aucun déficit dans la couverture (surplus acceptable)');
console.log('4. Métaux et multiplicateurs corrects');