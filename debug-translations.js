/* ========================================================================
   SCRIPT DE DEBUG POUR LES TRADUCTIONS SNIPCART
   ======================================================================== */

// Copier-coller ce code dans la console du navigateur pour diagnostiquer

(() => {
  console.log('🔍 DIAGNOSTIC DES TRADUCTIONS SNIPCART');
  console.log('=====================================');

  // 1. Vérifier la langue actuelle
  const lang = localStorage.getItem('lang');
  const snipcartLang = localStorage.getItem('snipcartLanguage');
  console.log(`📍 Langue site: ${lang}`);
  console.log(`📍 Langue Snipcart: ${snipcartLang}`);

  // 2. Vérifier si Snipcart est chargé
  if (window.Snipcart) {
    console.log('✅ Snipcart chargé');
    
    // Vérifier l'API
    if (window.Snipcart.api) {
      console.log('✅ API Snipcart disponible');
    } else {
      console.log('❌ API Snipcart non disponible');
    }

    // Vérifier les événements
    if (window.Snipcart.events) {
      console.log('✅ Événements Snipcart disponibles');
    } else {
      console.log('❌ Événements Snipcart non disponibles');
    }
  } else {
    console.log('❌ Snipcart non chargé');
  }

  // 3. Vérifier le DOM Snipcart
  const snipcartEl = document.getElementById('snipcart');
  if (snipcartEl) {
    console.log('✅ Élément #snipcart trouvé');
    console.log(`📊 Enfants: ${snipcartEl.children.length}`);
    
    if (snipcartEl.children.length > 0) {
      console.log('✅ Contenu Snipcart présent');
      
      // Chercher les éléments problématiques
      const customFields = snipcartEl.querySelectorAll('*');
      let foundIssues = [];
      
      customFields.forEach(el => {
        const text = el.textContent?.trim().toLowerCase();
        if (text === 'multiplier' || text === 'language') {
          foundIssues.push({
            element: el,
            text: text,
            tagName: el.tagName,
            className: el.className
          });
        }
      });
      
      if (foundIssues.length > 0) {
        console.log('🔴 PROBLÈMES TROUVÉS:');
        foundIssues.forEach((issue, i) => {
          console.log(`${i + 1}. ${issue.tagName}.${issue.className}: "${issue.text}"`);
          console.log(issue.element);
        });
      } else {
        console.log('✅ Aucun nom de variable visible');
      }
    } else {
      console.log('ℹ️ Snipcart pas encore ouvert');
    }
  } else {
    console.log('❌ Élément #snipcart non trouvé');
  }

  // 4. Vérifier les scripts de traduction
  if (window.GD?.translateSnipcart) {
    console.log('✅ Script de traduction GD chargé');
  } else {
    console.log('❌ Script de traduction GD non chargé');
  }

  // 5. Test de traduction manuelle
  console.log('\n🛠️ COMMANDES DE DEBUG:');
  console.log('Pour forcer la traduction: window.GD.translateSnipcart()');
  console.log('Pour changer la langue: window.GD.setLang("en") ou window.GD.setLang("fr")');
  console.log('Pour ouvrir Snipcart: window.Snipcart.api.theme.cart.open()');

  // 6. Fonction utilitaire pour forcer la traduction
  window.debugTranslate = () => {
    const lang = localStorage.getItem('lang') || 'fr';
    const snipcart = document.getElementById('snipcart');
    
    if (!snipcart) {
      console.log('❌ Snipcart non trouvé');
      return;
    }

    const elements = snipcart.querySelectorAll('*');
    let translated = 0;

    elements.forEach(el => {
      const text = el.textContent?.trim().toLowerCase();
      if (text === 'multiplier') {
        el.textContent = lang === 'fr' ? 'Multiplicateur' : 'Multiplier';
        translated++;
      } else if (text === 'language') {
        el.textContent = lang === 'fr' ? 'Langue' : 'Language';
        translated++;
      }
    });

    console.log(`✨ ${translated} éléments traduits manuellement`);
  };

  console.log('\n💡 Utilisez debugTranslate() pour forcer la traduction manuellement');
})();