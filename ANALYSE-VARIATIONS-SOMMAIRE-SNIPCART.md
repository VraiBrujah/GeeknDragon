# 🔍 Analyse - Affichage des Variations dans le Sommaire Snipcart

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`
**Problème** : Les variations (métal, multiplicateur) s'affichent dans le panier mais **disparaissent dans le sommaire de commande** lors de la phase paiement

---

## 📊 Situation Actuelle

### ✅ Ce qui fonctionne
- **Panier (cart)** : Les variations s'affichent correctement
  - Titre produit : "Septuple Libre"
  - Variations visibles : "platine ×10"

### ❌ Ce qui ne fonctionne pas
- **Sommaire de commande (checkout summary)** : Les variations disparaissent
  - Titre produit : "Septuple Libre" ❌ (sans variations)
  - **Devrait afficher** : "Septuple Libre (platine ×10)" ✅

---

## 🏗️ Architecture Snipcart

### Structure DOM du Panier vs Sommaire

**Dans le PANIER** :
```html
<div class="snipcart-item-line">
  <div class="snipcart-item-line__product">
    <div class="snipcart-item-line__title">
      Septuple Libre
    </div>
    <!-- Variations affichées par Snipcart -->
    <div class="snipcart-item-line__variants">
      <div class="snipcart-item-line__variant">
        Metal: platine
      </div>
      <div class="snipcart-item-line__variant">
        Multiplicateur: 10
      </div>
    </div>
  </div>
</div>
```

**Dans le SOMMAIRE** :
```html
<div class="snipcart-summary-item">
  <div class="snipcart-summary-item__title">
    Septuple Libre  ❌ (sans variations)
  </div>
  <div class="snipcart-summary-item__quantity">
    1×
  </div>
  <div class="snipcart-summary-item__price">
    50,00 $CA
  </div>
</div>
```

---

## 🎯 Solutions Proposées

### 💡 Option 1 : Modifier le Nom du Produit Dynamiquement (Recommandé)

**Principe** : Ajouter les variations au `data-item-name` lors de l'ajout au panier

**Avantages** :
- ✅ Simple et fiable
- ✅ Fonctionne partout (panier, sommaire, email)
- ✅ Pas besoin de CSS complexe
- ✅ Compatible avec tous les affichages Snipcart

**Inconvénient** :
- ⚠️ Le nom produit est modifié dans la base Snipcart

**Code** :
```javascript
// Dans js/snipcart-utils.js ou js/app.js
function addVariationsToProductName(button) {
  const baseName = button.dataset.gdBaseName || button.getAttribute('data-item-name');

  // Sauvegarder le nom de base
  if (!button.dataset.gdBaseName) {
    button.dataset.gdBaseName = baseName;
  }

  // Récupérer les variations
  const variations = [];

  // Métal
  const metalIndex = findCustomFieldIndex(button, 'metal');
  if (metalIndex) {
    const metalValue = button.getAttribute(`data-item-custom${metalIndex}-value`);
    if (metalValue) {
      variations.push(metalValue);
    }
  }

  // Multiplicateur
  const multIndex = findCustomFieldIndex(button, 'multiplier');
  if (multIndex) {
    const multValue = button.getAttribute(`data-item-custom${multIndex}-value`);
    if (multValue) {
      variations.push(`×${multValue}`);
    }
  }

  // Construire le nouveau nom
  let newName = baseName;
  if (variations.length > 0) {
    newName = `${baseName} (${variations.join(' ')})`;
  }

  // Appliquer
  button.setAttribute('data-item-name', newName);
}

// Appeler avant chaque ajout au panier
document.querySelectorAll('.snipcart-add-item').forEach(button => {
  button.addEventListener('click', (e) => {
    addVariationsToProductName(button);
  });
});
```

---

### 🎨 Option 2 : CSS pour Afficher les Custom Fields

**Principe** : Utiliser CSS pour afficher les `data-item-custom*` dans le sommaire

**Avantages** :
- ✅ Nom produit original préservé
- ✅ Flexible et personnalisable

**Inconvénients** :
- ❌ CSS `::after` ne peut pas lire `data-item-custom*`
- ❌ Snipcart ne rend pas ces attributs accessibles dans le sommaire
- ❌ Impossible sans JavaScript

**Verdict** : ❌ **Non viable** - CSS ne peut pas accéder aux custom fields dans le sommaire

---

### ⚙️ Option 3 : JavaScript pour Injecter les Variations dans le Sommaire

**Principe** : Observer le DOM du sommaire et ajouter les variations dynamiquement

**Avantages** :
- ✅ Nom produit original préservé
- ✅ Affichage uniquement dans l'interface (pas dans les données)
- ✅ Flexible

**Inconvénients** :
- ⚠️ Complexe (MutationObserver)
- ⚠️ Risque de clignotement lors du chargement
- ⚠️ Doit être maintenu si Snipcart change sa structure

**Code** :
```javascript
// Dans js/snipcart.js
function injectVariationsInSummary() {
  const summaryItems = document.querySelectorAll('.snipcart-summary-item');

  summaryItems.forEach(item => {
    // Éviter de traiter deux fois
    if (item.dataset.variationsInjected === 'true') return;

    const titleEl = item.querySelector('.snipcart-summary-item__title');
    if (!titleEl) return;

    // Récupérer l'ID produit depuis Snipcart
    // NOTE: Snipcart ne donne pas directement l'ID dans le DOM du sommaire
    // Il faut le récupérer depuis le store

    const cart = window.Snipcart?.store?.getState()?.cart;
    const items = cart?.items || [];

    items.forEach(cartItem => {
      const itemName = typeof cartItem.name === 'function' ? cartItem.name() : cartItem.name;

      if (titleEl.textContent.trim() === itemName) {
        // Récupérer les custom fields
        const customFields = cartItem.customFields || [];
        const variations = [];

        customFields.forEach(field => {
          const name = typeof field.name === 'function' ? field.name() : field.name;
          const value = typeof field.value === 'function' ? field.value() : field.value;

          if (name.toLowerCase().includes('metal')) {
            variations.push(value);
          }
          if (name.toLowerCase().includes('multiplier')) {
            variations.push(`×${value}`);
          }
        });

        // Ajouter les variations au titre
        if (variations.length > 0) {
          const variationsText = ` (${variations.join(' ')})`;
          const variationSpan = document.createElement('span');
          variationSpan.className = 'gd-summary-variations';
          variationSpan.style.cssText = `
            color: #94a3b8;
            font-weight: 400;
            font-size: 0.9em;
          `;
          variationSpan.textContent = variationsText;
          titleEl.appendChild(variationSpan);

          item.dataset.variationsInjected = 'true';
        }
      }
    });
  });
}

// Observer les changements dans le sommaire
function observeSummary() {
  const summaryContainer = document.querySelector('.snipcart-checkout__content--summary') ||
                           document.querySelector('.snipcart-summary');

  if (!summaryContainer) return;

  const observer = new MutationObserver(() => {
    injectVariationsInSummary();
  });

  observer.observe(summaryContainer, {
    childList: true,
    subtree: true
  });

  // Injection initiale
  injectVariationsInSummary();
}

// Appeler quand on entre dans la phase checkout
window.Snipcart?.events?.on('page.change', (page) => {
  if (page.checkout) {
    setTimeout(observeSummary, 100);
  }
});
```

---

### 🔥 Option 4 : Utiliser `data-item-description` pour les Variations

**Principe** : Ajouter les variations dans la description du produit

**Avantages** :
- ✅ Apparaît partout (panier, sommaire, emails)
- ✅ Simple à implémenter
- ✅ Snipcart affiche nativement les descriptions

**Inconvénients** :
- ⚠️ La description originale est écrasée
- ⚠️ Moins élégant visuellement

**Code** :
```javascript
function addVariationsToDescription(button) {
  const baseDesc = button.dataset.gdBaseDescription ||
                   button.getAttribute('data-item-description') || '';

  if (!button.dataset.gdBaseDescription) {
    button.dataset.gdBaseDescription = baseDesc;
  }

  const variations = [];

  // Métal
  const metalIndex = findCustomFieldIndex(button, 'metal');
  if (metalIndex) {
    const metalValue = button.getAttribute(`data-item-custom${metalIndex}-value`);
    if (metalValue) {
      variations.push(`Métal: ${metalValue}`);
    }
  }

  // Multiplicateur
  const multIndex = findCustomFieldIndex(button, 'multiplier');
  if (multIndex) {
    const multValue = button.getAttribute(`data-item-custom${multIndex}-value`);
    if (multValue) {
      variations.push(`Multiplicateur: ×${multValue}`);
    }
  }

  let newDesc = baseDesc;
  if (variations.length > 0) {
    const variationsText = variations.join(' | ');
    newDesc = baseDesc ? `${baseDesc} • ${variationsText}` : variationsText;
  }

  button.setAttribute('data-item-description', newDesc);
}
```

---

## 📊 Comparaison des Options

| Critère | Option 1 (Nom) | Option 2 (CSS) | Option 3 (JS Injection) | Option 4 (Description) |
|---------|---------------|----------------|------------------------|------------------------|
| **Simplicité** | 🟢 Très simple | ❌ Impossible | 🟡 Complexe | 🟢 Simple |
| **Fiabilité** | 🟢 100% | ❌ N/A | 🟡 Fragile | 🟢 100% |
| **Maintenabilité** | 🟢 Facile | ❌ N/A | 🔴 Difficile | 🟢 Facile |
| **Visuel** | 🟢 Propre | ❌ N/A | 🟢 Propre | 🟡 Moins propre |
| **Emails** | 🟢 Oui | ❌ Non | ❌ Non | 🟢 Oui |
| **Données préservées** | 🟡 Nom modifié | 🟢 Oui | 🟢 Oui | 🟡 Desc modifiée |

---

## 🎯 Recommandation Finale

### ⭐ **Option 1 : Modifier le Nom du Produit** (Meilleure solution)

**Pourquoi** :
1. ✅ **Simple et robuste** - Une seule fonction, aucun observer
2. ✅ **Fonctionne partout** - Panier, sommaire, emails de confirmation
3. ✅ **Performant** - Aucune surveillance DOM
4. ✅ **Maintenable** - Code minimal et clair

**Implémentation recommandée** :
```javascript
// 1. Créer la fonction dans js/snipcart-utils.js
SnipcartUtils.addVariationsToProductName = function(button) {
  const baseName = button.dataset.gdBaseName ||
                   button.getAttribute('data-item-name') || '';

  if (!button.dataset.gdBaseName) {
    button.dataset.gdBaseName = baseName;
  }

  const variations = [];

  // Métal
  const metalIndex = SnipcartUtils.findCustomFieldIndex(button, 'metal');
  if (metalIndex) {
    const metalValue = button.getAttribute(`data-item-custom${metalIndex}-value`);
    if (metalValue) variations.push(metalValue);
  }

  // Multiplicateur
  const multIndex = SnipcartUtils.findCustomFieldIndex(button, 'multiplier');
  if (multIndex) {
    const multValue = button.getAttribute(`data-item-custom${multIndex}-value`);
    if (multValue) variations.push(`×${multValue}`);
  }

  // Mettre à jour le nom
  const newName = variations.length > 0
    ? `${baseName} (${variations.join(' ')})`
    : baseName;

  button.setAttribute('data-item-name', newName);
};

// 2. Appeler avant l'ajout au panier
document.addEventListener('click', (e) => {
  const addButton = e.target.closest('.snipcart-add-item');
  if (addButton) {
    SnipcartUtils.addVariationsToProductName(addButton);
  }
});
```

**Résultat attendu** :
- **Panier** : "Septuple Libre (platine ×10)" ✅
- **Sommaire** : "Septuple Libre (platine ×10)" ✅
- **Email** : "Septuple Libre (platine ×10)" ✅

---

### 🔄 Option Alternative : Option 3 si Besoin de Préserver le Nom

**Si tu veux absolument garder le nom original dans les données Snipcart**, utiliser Option 3 (JavaScript injection).

**Mais attention** :
- ⚠️ Plus complexe à maintenir
- ⚠️ Ne fonctionne pas dans les emails
- ⚠️ Risque de clignotement visuel

---

## 🚀 Prochaines Étapes

### Choix 1 : Implémenter Option 1 (Recommandé)
1. Ajouter la fonction dans `js/snipcart-utils.js`
2. Brancher l'event listener sur les boutons
3. Tester panier + sommaire + email
4. Vérifier mise à jour dynamique des variations

### Choix 2 : Implémenter Option 3
1. Ajouter `injectVariationsInSummary()` dans `js/snipcart.js`
2. Brancher le MutationObserver
3. Gérer les events Snipcart `page.change`
4. Tester et optimiser

---

## 🔍 Questions pour Décision

1. **Est-il acceptable que le nom produit dans Snipcart contienne les variations ?**
   - ✅ Oui → **Option 1** (simple et fiable)
   - ❌ Non → **Option 3** (complexe mais préserve le nom)

2. **Les emails de confirmation doivent-ils afficher les variations ?**
   - ✅ Oui → **Option 1** uniquement
   - ❌ Non → Option 3 acceptable

3. **Performance vs Pureté des données ?**
   - Performance → **Option 1**
   - Pureté → **Option 3**

**Mon conseil** : **Option 1** car elle résout le problème de manière élégante et complète, avec un code minimal et maintenable.

---

**Prêt à implémenter la solution choisie ! Dis-moi quelle option tu préfères. 🎯**
