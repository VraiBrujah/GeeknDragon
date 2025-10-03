/**
 * Script de diagnostic pour déboguer l'affichage des promotions Snipcart
 * À exécuter dans la console du navigateur quand le panier est ouvert
 */

console.log('🔍 === DIAGNOSTIC PROMOTIONS SNIPCART ===');

// 1. Vérifier que Snipcart est chargé
console.log('\n1️⃣ État de Snipcart:');
console.log('window.Snipcart:', !!window.Snipcart);
console.log('window.Snipcart.store:', !!window.Snipcart?.store);
console.log('window.Snipcart.events:', !!window.Snipcart?.events);

// 2. Récupérer les données du panier
console.log('\n2️⃣ Données du panier:');
const cart = window.Snipcart?.store?.getState()?.cart;
if (cart) {
  console.log('cart.discounts:', cart.discounts);
  console.log('Nombre de promotions:', cart.discounts?.length || 0);

  if (cart.discounts && cart.discounts.length > 0) {
    console.log('\n📊 Détails des promotions:');
    cart.discounts.forEach((discount, index) => {
      console.log(`\nPromotion ${index + 1}:`);
      console.log('  - name:', discount.name);
      console.log('  - type:', discount.type);
      console.log('  - amount:', discount.amount);
      console.log('  - rate:', discount.rate);
    });
  }
} else {
  console.warn('❌ Impossible de récupérer les données du panier');
}

// 3. Trouver la section résumé
console.log('\n3️⃣ Section résumé du panier:');
const summarySelectors = [
  '.snipcart-cart-summary',
  '.snipcart-checkout__content--summary',
  '.snipcart-summary',
  '.snipcart__box--summary'
];

let summarySection = null;
for (const selector of summarySelectors) {
  summarySection = document.querySelector(selector);
  if (summarySection) {
    console.log(`✅ Trouvé avec: ${selector}`);
    break;
  }
}

if (!summarySection) {
  console.warn('❌ Section résumé non trouvée');
  console.log('Sélecteurs testés:', summarySelectors);
}

// 4. Lister TOUTES les lignes du résumé
console.log('\n4️⃣ Toutes les lignes du résumé:');
const allLines = document.querySelectorAll('.snipcart-cart-summary-item, .snipcart-summary-fees__item, [class*="summary"]');
console.log(`Nombre total de lignes: ${allLines.length}`);

allLines.forEach((line, index) => {
  const text = line.textContent?.trim() || '';
  const computedStyle = window.getComputedStyle(line);
  const display = computedStyle.display;

  console.log(`\nLigne ${index + 1}:`);
  console.log('  Texte:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
  console.log('  Classe:', line.className);
  console.log('  Display:', display);
  console.log('  data-gd-hidden:', line.getAttribute('data-gd-hidden'));

  if (text.toLowerCase().includes('promo')) {
    console.log('  ⚠️ LIGNE PROMOTIONS TROUVÉE!');
  }
});

// 5. Chercher spécifiquement la ligne "Promotions"
console.log('\n5️⃣ Recherche ligne "Promotions":');
const promoLine = Array.from(allLines).find(line => {
  const text = line.textContent?.toLowerCase() || '';
  return text.includes('promotion') && text.includes('-');
});

if (promoLine) {
  console.log('✅ Ligne "Promotions" trouvée:');
  console.log('  Texte complet:', promoLine.textContent);
  console.log('  Classes CSS:', promoLine.className);
  console.log('  Display:', window.getComputedStyle(promoLine).display);
  console.log('  Parent:', promoLine.parentElement?.className);
  console.log('  data-gd-hidden:', promoLine.getAttribute('data-gd-hidden'));

  // Tester le masquage manuellement
  console.log('\n🔧 Test de masquage manuel:');
  promoLine.style.display = 'none';
  promoLine.setAttribute('data-gd-hidden', 'true');
  console.log('✅ Ligne masquée manuellement (display: none)');
} else {
  console.warn('❌ Ligne "Promotions" non trouvée');
}

// 6. Vérifier les lignes personnalisées
console.log('\n6️⃣ Lignes de promotion personnalisées (__gd-promo-line):');
const customPromoLines = document.querySelectorAll('.__gd-promo-line');
console.log(`Nombre de lignes personnalisées: ${customPromoLines.length}`);

if (customPromoLines.length > 0) {
  customPromoLines.forEach((line, index) => {
    console.log(`\nLigne personnalisée ${index + 1}:`);
    console.log('  Texte:', line.textContent);
    console.log('  Display:', window.getComputedStyle(line).display);
  });
} else {
  console.warn('❌ Aucune ligne personnalisée trouvée');
  console.log('La fonction displayPromotionsDynamically() ne s\'est peut-être pas exécutée');
}

// 7. Vérifier que le script custom est chargé
console.log('\n7️⃣ Vérification du script custom:');
const scripts = Array.from(document.querySelectorAll('script'));
const snipcartScript = scripts.find(s => s.src?.includes('snipcart.js') || s.src?.includes('snipcart.min.js'));

if (snipcartScript) {
  console.log('✅ Script snipcart trouvé:', snipcartScript.src);
} else {
  console.warn('❌ Script snipcart.js non trouvé dans la page');
  console.log('Scripts chargés:', scripts.map(s => s.src).filter(s => s));
}

// 8. Forcer l'exécution de la fonction
console.log('\n8️⃣ Test d\'exécution forcée:');
if (typeof displayPromotionsDynamically === 'function') {
  console.log('✅ Fonction displayPromotionsDynamically() disponible');
  try {
    displayPromotionsDynamically();
    console.log('✅ Fonction exécutée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
  }
} else {
  console.warn('❌ Fonction displayPromotionsDynamically() non trouvée');
  console.log('Le script n\'a peut-être pas été chargé correctement');
}

console.log('\n🔍 === FIN DU DIAGNOSTIC ===');
console.log('\nPour relancer le diagnostic, rechargez cette page et collez ce script dans la console.');
