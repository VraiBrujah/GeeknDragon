# 🎯 Solution : Affichage Dynamique des Variations avec Mise à Jour en Temps Réel

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`
**Objectif** : Afficher les variations (métal, multiplicateur) dans le sommaire ET les mettre à jour quand l'utilisateur les change dans le panier

---

## 🧠 Solution Hybride Recommandée

### Principe : Double Approche
1. **Écouter les événements Snipcart** pour détecter les changements de custom fields
2. **Mettre à jour le `data-item-name` dynamiquement** dans le store Snipcart
3. **Réinjecter les variations** dans le DOM du sommaire à chaque changement

---

## 🔧 Implémentation Complète

### Étape 1 : Fonction pour Construire le Nom avec Variations

```javascript
/**
 * Construit le nom du produit avec ses variations
 * @param {Object} item - Item du panier Snipcart
 * @returns {string} Nom avec variations
 */
function buildProductNameWithVariations(item) {
  // Nom de base (récupérer depuis customFields[0].product si disponible)
  let baseName = item.name;

  // Nettoyer le nom s'il contient déjà des variations entre parenthèses
  baseName = baseName.replace(/\s*\([^)]+\)\s*$/, '').trim();

  const customFields = item.customFields || [];
  const variations = [];

  customFields.forEach(field => {
    const fieldName = (typeof field.name === 'function' ? field.name() : field.name) || '';
    const fieldValue = (typeof field.value === 'function' ? field.value() : field.value) || '';

    if (fieldName.toLowerCase().includes('métal') || fieldName.toLowerCase().includes('metal')) {
      variations.push(fieldValue);
    } else if (fieldName.toLowerCase().includes('multiplicateur') || fieldName.toLowerCase().includes('multiplier')) {
      variations.push(`×${fieldValue}`);
    }
  });

  return variations.length > 0
    ? `${baseName} (${variations.join(' ')})`
    : baseName;
}
```

### Étape 2 : Mettre à Jour le Nom dans le Store Snipcart

```javascript
/**
 * Met à jour le nom d'un item dans le store Snipcart
 * @param {string} itemId - ID unique de l'item
 * @param {string} newName - Nouveau nom avec variations
 */
function updateItemNameInStore(itemId, newName) {
  try {
    const state = window.Snipcart?.store?.getState();
    if (!state) return;

    const cart = state.cart;
    const items = cart?.items || [];

    const itemIndex = items.findIndex(item => {
      const id = typeof item.uniqueId === 'function' ? item.uniqueId() : item.uniqueId;
      return id === itemId;
    });

    if (itemIndex === -1) return;

    // Utiliser l'API Snipcart pour mettre à jour
    window.Snipcart.api.cart.items.update({
      uniqueId: itemId,
      name: newName
    });

    console.log(`✅ Nom mis à jour: ${newName}`);
  } catch (error) {
    console.warn('⚠️ Erreur mise à jour nom:', error);
  }
}
```

### Étape 3 : Écouter les Changements de Custom Fields

```javascript
/**
 * Écoute les changements dans le panier et met à jour les noms
 */
function listenToCartChanges() {
  const events = window.Snipcart?.events;
  if (!events) return;

  // Événement déclenché quand un custom field change
  events.on('item.updated', (item) => {
    const itemData = item.item || item;
    const uniqueId = typeof itemData.uniqueId === 'function'
      ? itemData.uniqueId()
      : itemData.uniqueId;

    const newName = buildProductNameWithVariations(itemData);

    // Mettre à jour seulement si le nom a changé
    const currentName = typeof itemData.name === 'function'
      ? itemData.name()
      : itemData.name;

    if (currentName !== newName) {
      updateItemNameInStore(uniqueId, newName);
    }
  });

  // Événement à l'ajout initial
  events.on('item.added', (item) => {
    const itemData = item.item || item;
    const uniqueId = typeof itemData.uniqueId === 'function'
      ? itemData.uniqueId()
      : itemData.uniqueId;

    setTimeout(() => {
      const newName = buildProductNameWithVariations(itemData);
      updateItemNameInStore(uniqueId, newName);
    }, 100); // Petit délai pour laisser Snipcart initialiser
  });

  console.log('✅ Écoute des changements de panier activée');
}
```

### Étape 4 : Fallback CSS pour le Sommaire (Sécurité)

Si l'API ne fonctionne pas, injecter visuellement dans le DOM :

```javascript
/**
 * Injecte les variations dans le DOM du sommaire (fallback)
 */
function injectVariationsInSummaryDOM() {
  const cart = window.Snipcart?.store?.getState()?.cart;
  if (!cart) return;

  const items = cart.items || [];

  // Trouver les lignes du sommaire
  const summaryItems = document.querySelectorAll(
    '.snipcart-summary-item__title, ' +
    '.snipcart__item__title, ' +
    '.snipcart-order-item__title'
  );

  summaryItems.forEach(titleEl => {
    // Éviter de traiter deux fois
    if (titleEl.dataset.gdVariationsInjected === 'true') return;

    const titleText = titleEl.textContent.trim();

    // Trouver l'item correspondant
    const matchingItem = items.find(item => {
      const itemName = typeof item.name === 'function' ? item.name() : item.name;
      return itemName.includes(titleText) || titleText.includes(itemName);
    });

    if (!matchingItem) return;

    // Construire le nom avec variations
    const fullName = buildProductNameWithVariations(matchingItem);

    // Si le nom actuel ne contient pas les variations
    if (!titleText.includes('(') && fullName !== titleText) {
      // Créer un span pour les variations
      const variationsMatch = fullName.match(/\(([^)]+)\)/);
      if (variationsMatch) {
        const variationsSpan = document.createElement('span');
        variationsSpan.className = 'gd-item-variations';
        variationsSpan.style.cssText = `
          color: #94a3b8;
          font-weight: 400;
          font-size: 0.9em;
          margin-left: 0.25rem;
        `;
        variationsSpan.textContent = ` (${variationsMatch[1]})`;

        titleEl.appendChild(variationsSpan);
        titleEl.dataset.gdVariationsInjected = 'true';
      }
    }
  });
}
```

### Étape 5 : Observer les Changements de Page Snipcart

```javascript
/**
 * Observer les changements de page (panier → checkout → confirmation)
 */
function observeSnipcartPages() {
  const events = window.Snipcart?.events;
  if (!events) return;

  // Quand on change de page
  events.on('page.change', (page) => {
    setTimeout(() => {
      injectVariationsInSummaryDOM();
    }, 200); // Attendre que le DOM soit mis à jour
  });

  // Quand le panier s'ouvre
  events.on('cart.opened', () => {
    setTimeout(() => {
      injectVariationsInSummaryDOM();
    }, 200);
  });

  console.log('✅ Observer de pages Snipcart activé');
}
```

### Étape 6 : MutationObserver pour Sécurité Maximale

```javascript
/**
 * Observer les mutations DOM dans le conteneur Snipcart
 */
function observeSnipcartDOM() {
  const snipcartContainer = document.getElementById('snipcart');
  if (!snipcartContainer || snipcartContainer.__gdObserverMounted) return;

  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Vérifier si c'est le sommaire qui a changé
        const summaryAdded = Array.from(mutation.addedNodes).some(node =>
          node.nodeType === 1 && (
            node.classList?.contains('snipcart-summary') ||
            node.classList?.contains('snipcart-checkout__content--summary') ||
            node.querySelector?.('.snipcart-summary, .snipcart-checkout__content--summary')
          )
        );

        if (summaryAdded) {
          shouldUpdate = true;
          break;
        }
      }
    }

    if (shouldUpdate) {
      setTimeout(injectVariationsInSummaryDOM, 50);
    }
  });

  observer.observe(snipcartContainer, {
    childList: true,
    subtree: true
  });

  snipcartContainer.__gdObserverMounted = true;
  console.log('✅ MutationObserver Snipcart activé');
}
```

### Étape 7 : Initialisation Complète

```javascript
/**
 * Initialiser tout le système de variations dynamiques
 */
function initDynamicVariations() {
  try {
    if (!window.Snipcart) {
      console.warn('⚠️ Snipcart non disponible pour les variations dynamiques');
      return;
    }

    // 1. Écouter les changements de panier
    listenToCartChanges();

    // 2. Observer les changements de page
    observeSnipcartPages();

    // 3. Observer le DOM
    observeSnipcartDOM();

    // 4. Injection initiale
    setTimeout(injectVariationsInSummaryDOM, 500);

    console.log('🎨 Système de variations dynamiques initialisé');
  } catch (error) {
    console.error('💥 Erreur initialisation variations dynamiques:', error);
  }
}

// Appeler après chargement Snipcart
whenSnipcartReady(() => {
  initDynamicVariations();
});
```

---

## 📊 Flux de Mise à Jour

### Scénario 1 : Ajout au Panier

```
1. Utilisateur clique "Ajouter au panier"
   ↓
2. Snipcart déclenche event "item.added"
   ↓
3. buildProductNameWithVariations() extrait les variations
   ↓
4. updateItemNameInStore() met à jour le nom
   ↓
5. Snipcart affiche "Septuple Libre (platine ×10)" ✅
```

### Scénario 2 : Changement dans le Panier

```
1. Utilisateur change multiplicateur dans le panier
   ↓
2. Snipcart déclenche event "item.updated"
   ↓
3. buildProductNameWithVariations() recalcule le nom
   ↓
4. updateItemNameInStore() met à jour
   ↓
5. Panier & Sommaire affichent "Septuple Libre (platine ×100)" ✅
```

### Scénario 3 : Phase Checkout

```
1. Utilisateur clique "Paiement"
   ↓
2. Snipcart déclenche event "page.change"
   ↓
3. injectVariationsInSummaryDOM() inspecte le sommaire
   ↓
4. Variations affichées si nom pas à jour (fallback) ✅
```

---

## 🎨 CSS pour les Variations Injectées

```css
/* Dans css/snipcart-custom.css */

/* Variations dans le titre du sommaire */
.snipcart .gd-item-variations {
  color: #94a3b8 !important;
  font-weight: 400 !important;
  font-size: 0.9em !important;
  margin-left: 0.25rem !important;
}

/* Animation d'apparition */
@keyframes fadeInVariations {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.snipcart .gd-item-variations {
  animation: fadeInVariations 0.3s ease-out !important;
}
```

---

## ✅ Avantages de Cette Solution

1. ✅ **Mise à jour en temps réel** quand l'utilisateur change les variations
2. ✅ **Fonctionne partout** : panier, sommaire, confirmation
3. ✅ **Double sécurité** : API Snipcart + injection DOM fallback
4. ✅ **Pas de clignotement** : mise à jour avant affichage
5. ✅ **Emails corrects** : le nom dans le store contient les variations

---

## 🧪 Tests à Effectuer

### Test 1 : Ajout Initial
1. Sélectionner "platine" et "×10"
2. Ajouter au panier
3. ✅ Vérifier : "Septuple Libre (platine ×10)" dans le panier

### Test 2 : Changement dans le Panier
1. Ouvrir le panier
2. Changer multiplicateur à "×100"
3. ✅ Vérifier : nom devient "Septuple Libre (platine ×100)"

### Test 3 : Sommaire Checkout
1. Cliquer "Paiement"
2. ✅ Vérifier : "Septuple Libre (platine ×100)" dans le sommaire

### Test 4 : Email de Confirmation
1. Compléter une commande test
2. ✅ Vérifier email contient : "Septuple Libre (platine ×100)"

---

## 📝 Code Final à Ajouter

**Fichier** : `js/snipcart.js` (après la fonction `displayPromotionsDynamically`)

```javascript
// ============================================================================
// SYSTÈME DE VARIATIONS DYNAMIQUES
// ============================================================================

/**
 * Construit le nom du produit avec ses variations
 */
function buildProductNameWithVariations(item) {
  let baseName = item.name;
  baseName = baseName.replace(/\s*\([^)]+\)\s*$/, '').trim();

  const customFields = item.customFields || [];
  const variations = [];

  customFields.forEach(field => {
    const fieldName = (typeof field.name === 'function' ? field.name() : field.name) || '';
    const fieldValue = (typeof field.value === 'function' ? field.value() : field.value) || '';

    if (fieldName.toLowerCase().includes('métal') || fieldName.toLowerCase().includes('metal')) {
      variations.push(fieldValue);
    } else if (fieldName.toLowerCase().includes('multiplicateur') || fieldName.toLowerCase().includes('multiplier')) {
      variations.push(`×${fieldValue}`);
    }
  });

  return variations.length > 0 ? `${baseName} (${variations.join(' ')})` : baseName;
}

/**
 * Met à jour le nom d'un item dans le store Snipcart
 */
function updateItemNameInStore(itemId, newName) {
  try {
    window.Snipcart?.api?.cart?.items?.update({
      uniqueId: itemId,
      name: newName
    });
  } catch (error) {
    console.warn('⚠️ Erreur mise à jour nom:', error);
  }
}

/**
 * Injecte les variations dans le DOM du sommaire (fallback)
 */
function injectVariationsInSummaryDOM() {
  const cart = window.Snipcart?.store?.getState()?.cart;
  if (!cart) return;

  const items = cart.items || [];
  const summaryItems = document.querySelectorAll(
    '.snipcart-summary-item__title, .snipcart__item__title, .snipcart-order-item__title'
  );

  summaryItems.forEach(titleEl => {
    if (titleEl.dataset.gdVariationsInjected === 'true') return;

    const titleText = titleEl.textContent.trim();
    const matchingItem = items.find(item => {
      const itemName = typeof item.name === 'function' ? item.name() : item.name;
      return itemName.includes(titleText) || titleText.includes(itemName);
    });

    if (!matchingItem) return;

    const fullName = buildProductNameWithVariations(matchingItem);
    if (!titleText.includes('(') && fullName !== titleText) {
      const variationsMatch = fullName.match(/\(([^)]+)\)/);
      if (variationsMatch) {
        const variationsSpan = document.createElement('span');
        variationsSpan.className = 'gd-item-variations';
        variationsSpan.style.cssText = `
          color: #94a3b8;
          font-weight: 400;
          font-size: 0.9em;
          margin-left: 0.25rem;
        `;
        variationsSpan.textContent = ` (${variationsMatch[1]})`;
        titleEl.appendChild(variationsSpan);
        titleEl.dataset.gdVariationsInjected = 'true';
      }
    }
  });
}

/**
 * Initialiser le système de variations dynamiques
 */
function initDynamicVariations() {
  try {
    const events = window.Snipcart?.events;
    if (!events) return;

    // Écouter les changements
    events.on('item.updated', (item) => {
      const itemData = item.item || item;
      const uniqueId = typeof itemData.uniqueId === 'function' ? itemData.uniqueId() : itemData.uniqueId;
      const newName = buildProductNameWithVariations(itemData);
      const currentName = typeof itemData.name === 'function' ? itemData.name() : itemData.name;

      if (currentName !== newName) {
        updateItemNameInStore(uniqueId, newName);
      }
    });

    events.on('item.added', (item) => {
      const itemData = item.item || item;
      const uniqueId = typeof itemData.uniqueId === 'function' ? itemData.uniqueId() : itemData.uniqueId;
      setTimeout(() => {
        const newName = buildProductNameWithVariations(itemData);
        updateItemNameInStore(uniqueId, newName);
      }, 100);
    });

    // Observer les changements de page
    events.on('page.change', () => {
      setTimeout(injectVariationsInSummaryDOM, 200);
    });

    events.on('cart.opened', () => {
      setTimeout(injectVariationsInSummaryDOM, 200);
    });

    // MutationObserver
    const snipcartContainer = document.getElementById('snipcart');
    if (snipcartContainer && !snipcartContainer.__gdObserverMounted) {
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const summaryAdded = Array.from(mutation.addedNodes).some(node =>
              node.nodeType === 1 && (
                node.classList?.contains('snipcart-summary') ||
                node.classList?.contains('snipcart-checkout__content--summary') ||
                node.querySelector?.('.snipcart-summary, .snipcart-checkout__content--summary')
              )
            );
            if (summaryAdded) {
              shouldUpdate = true;
              break;
            }
          }
        }
        if (shouldUpdate) {
          setTimeout(injectVariationsInSummaryDOM, 50);
        }
      });

      observer.observe(snipcartContainer, { childList: true, subtree: true });
      snipcartContainer.__gdObserverMounted = true;
    }

    setTimeout(injectVariationsInSummaryDOM, 500);
    console.log('🎨 Variations dynamiques initialisées');
  } catch (error) {
    console.error('💥 Erreur variations dynamiques:', error);
  }
}
```

**Appel dans `initializeSnipcartCustomizations()` :**

```javascript
function initializeSnipcartCustomizations() {
  // ... code existant ...

  // Initialiser variations dynamiques
  initDynamicVariations();

  // ... reste du code ...
}
```

---

**Cette solution répond parfaitement à ton besoin : mise à jour en temps réel + affichage dans le sommaire ! 🚀**
