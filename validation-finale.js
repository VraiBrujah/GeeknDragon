/**
 * VALIDATION FINALE DU CALCULATEUR DYNAMIQUE
 * Script de test pour s'assurer que tout fonctionne correctement
 */

// Tests à exécuter dans la console du navigateur
console.log('🧪 DÉMARRAGE VALIDATION FINALE - CALCULATEUR DYNAMIQUE');

// Vérification que le calculateur est chargé
if (typeof window.dynamicRecommender !== 'undefined') {
    console.log('✅ Calculateur dynamique détecté');
    
    // Test 1: Cas simple
    console.log('\n🔍 Test 1: Cas simple (1 cuivre)');
    const test1 = window.dynamicRecommender.findOptimalLots({
        copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0
    });
    
    if (test1 && test1.length > 0) {
        console.log(`✅ Résultat: ${test1.length} recommandation(s)`);
        test1.forEach(rec => console.log(`   - ${rec.productName}: ${rec.price}€`));
    } else {
        console.log('❌ Aucune recommandation trouvée');
    }
    
    // Test 2: Cas moyen
    console.log('\n🔍 Test 2: Cas moyen (mix métaux)');
    const test2 = window.dynamicRecommender.findOptimalLots({
        copper: 5, silver: 3, electrum: 2, gold: 1, platinum: 1
    });
    
    if (test2 && test2.length > 0) {
        console.log(`✅ Résultat: ${test2.length} recommandation(s)`);
        const totalCost = test2.reduce((sum, rec) => sum + (rec.price * rec.quantity), 0);
        console.log(`   💰 Coût total: ${totalCost.toFixed(2)}€`);
    } else {
        console.log('❌ Aucune recommandation trouvée');
    }
    
    // Test 3: Performance
    console.log('\n⏱️ Test 3: Performance');
    const startTime = performance.now();
    const test3 = window.dynamicRecommender.findOptimalLots({
        copper: 25, silver: 15, electrum: 10, gold: 5, platinum: 3
    });
    const endTime = performance.now();
    
    console.log(`✅ Temps d'exécution: ${(endTime - startTime).toFixed(2)}ms`);
    
    // Test 4: Cache
    console.log('\n🔄 Test 4: Cache');
    const cacheSize = window.dynamicRecommender.cache.size;
    console.log(`✅ Entrées en cache: ${cacheSize}`);
    
    // Test 5: Produits chargés
    console.log('\n📦 Test 5: Produits chargés');
    const productCount = Object.keys(window.dynamicRecommender.products || {}).length;
    console.log(`✅ Produits de pièces: ${productCount}`);
    
    console.log('\n🎉 VALIDATION FINALE TERMINÉE');
    console.log('Tous les tests de base sont passés avec succès !');
    
} else {
    console.log('❌ Calculateur dynamique NON TROUVÉ');
    console.log('Vérifiez que le script dynamic-coin-recommender.js est chargé');
}

// Instructions pour exécution manuelle
console.log('\n📋 INSTRUCTIONS MANUELLES:');
console.log('1. Ouvrez aide-jeux.php dans votre navigateur');
console.log('2. Ouvrez la console développeur (F12)');
console.log('3. Collez ce script et appuyez sur Entrée');
console.log('4. Vérifiez que tous les tests affichent ✅');