# 🎁 Implémentation Affichage Dynamique des Promotions Snipcart

## 📋 Résumé

Système d'affichage dynamique des promotions Snipcart **sans popup**, affichant toutes les promotions appliquées directement dans le résumé du panier, les unes après les autres, avec décalage automatique du sous-total, livraison, taxes et total.

---

## ✅ Fonctionnalités Implémentées

### 🎯 Affichage des Promotions

- ✅ **Extraction automatique** des promotions depuis `window.Snipcart.store.getState().cart.discounts`
- ✅ **Affichage ligne par ligne** : chaque promotion sur une ligne séparée
- ✅ **Décalage automatique** : sous-total, livraison, taxes, total poussés vers le bas
- ✅ **Animation fluide** : apparition en fondu (fadeIn) de chaque ligne
- ✅ **Icône cadeau** 🎁 devant chaque promotion
- ✅ **Couleur verte** (#10b981) pour les montants de réduction
- ✅ **Effet de survol** : fond coloré au passage de la souris

### 🔄 Mises à Jour Automatiques

- ✅ **Événements Snipcart** : écoute de `discount.applied`, `discount.removed`, `cart.opened`, `item.updated`
- ✅ **MutationObserver** : détection des changements DOM dans le résumé du panier
- ✅ **Rafraîchissement intelligent** : délai de 100ms après événements pour éviter les conflits
- ✅ **Suppression préalable** : anciennes promotions supprimées avant affichage des nouvelles

---

## 📁 Fichiers Modifiés

### 1. **`js/snipcart.js`** (Source)

**Lignes 213-329** : Nouvelles fonctions ajoutées

#### Fonction `displayPromotionsDynamically()`

```javascript
/**
 * Affiche les promotions appliquées dynamiquement dans le panier
 * Les promotions sont extraites du panier et affichées les unes après les autres
 * sans popup, décalant automatiquement le sous-total, livraison, taxes et total
 */
function displayPromotionsDynamically() {
  // 1. Trouver la section résumé (3 fallbacks)
  const summarySection =
    $('.snipcart-cart-summary') ||
    $('.snipcart-checkout__content--summary') ||
    $('.snipcart-summary');

  // 2. Récupérer les données du panier
  const cart = window.Snipcart?.store?.getState()?.cart;
  const discounts = cart.discounts || [];

  // 3. Supprimer les promotions précédentes
  $$('.__gd-promo-line', summarySection).forEach(el => el.remove());

  // 4. Créer une ligne pour chaque promotion
  discounts.forEach((discount, index) => {
    const promoLine = document.createElement('div');
    promoLine.className = '__gd-promo-line snipcart-cart-summary-item';

    // Nom de la promotion
    const nameSpan = document.createElement('span');
    nameSpan.className = '__gd-promo-name';
    nameSpan.textContent = discount.name || `Promotion ${index + 1}`;

    // Montant de la réduction
    const amountSpan = document.createElement('span');
    amountSpan.className = '__gd-promo-amount';

    if (discount.type === 'FixedAmount' || discount.amount) {
      amountSpan.textContent = `-${formatCurrency(discount.amount || 0, cart.currency)}`;
    } else if (discount.rate) {
      amountSpan.textContent = `-${(discount.rate * 100).toFixed(0)}%`;
    }

    promoLine.appendChild(nameSpan);
    promoLine.appendChild(amountSpan);

    // Insérer avant le sous-total
    subtotalLine.parentNode.insertBefore(promoLine, subtotalLine);
  });
}
```

#### Fonction `formatCurrency()`

```javascript
/**
 * Formate un montant en devise
 * @param {number} amount - Montant à formater
 * @param {string} currency - Code devise (CAD, USD, EUR...)
 * @returns {string} Montant formaté
 */
function formatCurrency(amount, currency = 'CAD') {
  try {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
```

#### Événements Écoutés (Ligne 357)

```javascript
['item.added', 'item.updated', 'cart.opened', 'cart.closed',
 'cart.confirmed', 'discount.applied', 'discount.removed']
  .forEach(evt => {
    ev.on(evt, () => {
      processAll();
      setTimeout(displayPromotionsDynamically, 100);
    });
  });
```

#### MutationObserver Amélioré (Lignes 201-227)

```javascript
const obs = new MutationObserver((mutations) => {
  let shouldUpdatePromotions = false;

  for (const m of mutations) {
    if (m.type === 'childList') {
      // Traiter les lignes d'articles
      $$('.snipcart-item-line', m.target).forEach(processItemLine);

      // Vérifier si le résumé du panier a été modifié
      if (m.target.classList?.contains('snipcart-cart-summary') ||
          m.target.classList?.contains('snipcart-checkout__content--summary') ||
          m.target.classList?.contains('snipcart-summary') ||
          m.target.querySelector?.('.snipcart-cart-summary, ...')) {
        shouldUpdatePromotions = true;
      }
    }
  }

  // Rafraîchir les promotions si le résumé a changé
  if (shouldUpdatePromotions) {
    setTimeout(displayPromotionsDynamically, 50);
  }
});
```

### 2. **`js/snipcart.min.js`** (Minifié)

Version minifiée générée avec `terser` :
- Taille : **6.1 KB** (vs 14 KB source)
- Optimisation : `-c -m` (compression + mangling)

### 3. **`css/snipcart-custom.css`**

**Lignes 1030-1139** : Styles pour promotions dynamiques

```css
/* Ligne de promotion appliquée */
.__gd-promo-line {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 12px 0 !important;
  border-bottom: 1px solid var(--gd-border, rgba(255,255,255,0.1)) !important;
  color: var(--gd-success, #10b981) !important;
  font-size: 0.95rem !important;
  animation: fadeInPromo 0.4s ease-out !important;
}

/* Animation d'apparition */
@keyframes fadeInPromo {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Nom de la promotion avec icône */
.__gd-promo-name {
  flex: 1 !important;
  font-weight: 500 !important;
  color: var(--gd-success, #10b981) !important;
}

.__gd-promo-name::before {
  content: "🎁" !important;
  font-size: 1.1rem !important;
}

/* Montant de la réduction */
.__gd-promo-amount {
  font-weight: 600 !important;
  color: var(--gd-success, #10b981) !important;
  white-space: nowrap !important;
  margin-left: 12px !important;
}

/* Effet de survol */
.__gd-promo-line:hover {
  background: rgba(16, 185, 129, 0.05) !important;
  padding-left: 8px !important;
  border-radius: 6px !important;
}

/* Ligne de séparation après dernière promotion */
.__gd-promo-line:last-of-type {
  margin-bottom: 8px !important;
  border-bottom: 2px solid var(--gd-success, #10b981) !important;
  padding-bottom: 16px !important;
}

/* Ajustement du sous-total */
.snipcart-cart-summary-item--subtotal {
  margin-top: 8px !important;
  padding-top: 16px !important;
  border-top: 2px solid var(--gd-border, rgba(255,255,255,0.2)) !important;
}
```

---

## 🧪 Fichiers de Test

### 1. **`test-promotions-affichage.html`**

Page de test autonome avec :
- ✅ Simulation de 3 promotions (bouton "Simuler Promotions")
- ✅ Simulation d'une seule promotion (bouton "Une Seule Promotion")
- ✅ Effacement des promotions (bouton "Effacer")
- ✅ Aperçu visuel du résumé du panier
- ✅ Instructions de test et vérifications
- ✅ Code d'implémentation Snipcart documenté

**Ouvrir** : `file:///E:/GitHub/GeeknDragon/test-promotions-affichage.html`

### 2. **`docs/snipcart-promotions-dynamiques.md`**

Documentation technique complète :
- 📋 Aperçu et fonctionnalités
- 🎨 Design et visuels
- 🔧 Architecture technique
- 🐛 Gestion des erreurs
- 🔄 Mises à jour automatiques
- 🚀 Déploiement
- 🔗 Références

---

## 📊 Structure des Données

### Format des Promotions Snipcart

```javascript
{
  name: "Cadeau Livraison Gratuite - 17$ de réduction",
  type: "FixedAmount",  // ou "Rate"
  amount: 17.00,        // si FixedAmount
  rate: 0.10,           // si Rate (10%)
  code: "LIVRAISON",    // code promo utilisé
  trigger: "Code",      // déclencheur
  // ... autres propriétés Snipcart
}
```

### Exemple Console

D'après les logs fournis :

```javascript
coupon: 'Cadeau Livraison Gratuite - 17$ de réduction|Partez à l\'Aventure Game - 10% de réduction|Geek & Dragon Livraison'
```

Les promotions sont séparées par `|` dans le champ `coupon` (tracking Google Analytics).

---

## 🎨 Rendu Visuel Attendu

```
┌────────────────────────────────────────────────┐
│  RÉSUMÉ DU PANIER                              │
├────────────────────────────────────────────────┤
│                                                │
│  🎁 Cadeau Livraison Gratuite - 17$ de réd...  │ -17,00 $
│  🎁 Partez à l'Aventure Game - 10% de réd...   │ -10%
│  🎁 Geek & Dragon Livraison                    │ -5,00 $
├════════════════════════════════════════════════┤
│  Sous-total                                    │ 500,00 $
│  Livraison                                     │ 17,00 $
│  Taxes                                         │ 36,49 $
├────────────────────────────────────────────────┤
│  TOTAL                                         │ 553,49 $
└────────────────────────────────────────────────┘
```

---

## 🔍 Sélecteurs CSS Utilisés

### Section Résumé (3 fallbacks)

```javascript
const summarySection =
  $('.snipcart-cart-summary') ||
  $('.snipcart-checkout__content--summary') ||
  $('.snipcart-summary');
```

### Ligne Sous-Total (3 fallbacks)

```javascript
const subtotalLine =
  $('.snipcart-cart-summary-item--subtotal', summarySection) ||
  $('.snipcart-summary-fees__item--subtotal', summarySection) ||
  $('.snipcart-cart-summary-item', summarySection);
```

### Lignes de Promotion (nettoyage)

```javascript
$$('.__gd-promo-line', summarySection).forEach(el => el.remove());
```

---

## 🐛 Gestion des Erreurs

### Scénarios Couverts

| Scénario | Action | Log |
|----------|--------|-----|
| Section résumé non trouvée | Retour silencieux | `⚠️ Section résumé du panier non trouvée` |
| Données panier indisponibles | Retour silencieux | `⚠️ Données du panier non disponibles` |
| Ligne sous-total non trouvée | Retour silencieux | `⚠️ Ligne sous-total non trouvée` |
| Aucune promotion | Suppression anciennes + retour | - |
| Erreur formatage devise | Fallback manuel | `${amount.toFixed(2)} ${currency}` |

### Try-Catch Global

```javascript
try {
  // Logique principale
} catch (error) {
  console.error('Erreur lors de l\'affichage des promotions:', error);
}
```

---

## 📈 Performance

### Optimisations

- ✅ **Suppression sélective** : seules les lignes `.__gd-promo-line` sont supprimées
- ✅ **Insertion directe** : pas de recréation du DOM entier
- ✅ **Délais intelligents** : 50-100ms après événements pour éviter conflits
- ✅ **Vérifications conditionnelles** : MutationObserver ne déclenche que si nécessaire

### Timing

| Événement | Délai | Raison |
|-----------|-------|--------|
| `discount.applied` | 100ms | Laisser Snipcart finaliser |
| `discount.removed` | 100ms | Laisser Snipcart finaliser |
| `cart.opened` | 100ms | Initialisation complète |
| MutationObserver | 50ms | Réactivité rapide |

---

## 🚀 Déploiement

### Pré-requis

- ✅ Snipcart 3.x installé et configuré
- ✅ Variables CSS Geek & Dragon définies (`:root`)
- ✅ `snipcart-init.php` chargé avant

### Fichiers à Déployer

```bash
E:\GitHub\GeeknDragon\
├── js/
│   ├── snipcart.js           # Version source (14 KB)
│   └── snipcart.min.js       # Version minifiée (6.1 KB)
├── css/
│   └── snipcart-custom.css   # Styles (avec promotions L1030-L1139)
└── docs/
    └── snipcart-promotions-dynamiques.md  # Documentation
```

### Vérification Post-Déploiement

1. ✅ Ouvrir le panier avec promotions appliquées
2. ✅ Vérifier que les promotions s'affichent en liste (pas de popup)
3. ✅ Confirmer le décalage du sous-total vers le bas
4. ✅ Tester l'ajout/suppression de promotions
5. ✅ Valider l'animation d'apparition (fadeIn)
6. ✅ Vérifier l'effet de survol (background coloré)
7. ✅ Confirmer la bordure verte en bas de la dernière promotion

### Checklist de Test

- [ ] **Test 1** : Ajouter 1 promotion → Affichage correct
- [ ] **Test 2** : Ajouter 3 promotions → Affichage en liste
- [ ] **Test 3** : Supprimer une promotion → Mise à jour automatique
- [ ] **Test 4** : Modifier quantité article → Recalcul promotions
- [ ] **Test 5** : Ouvrir/fermer panier → État conservé
- [ ] **Test 6** : Responsive mobile → Affichage adapté

---

## 🔗 Références

- **Snipcart API** : https://docs.snipcart.com/v3/sdk/api
- **Snipcart Events** : https://docs.snipcart.com/v3/sdk/events
- **Snipcart Store** : https://docs.snipcart.com/v3/sdk/store
- **MutationObserver MDN** : https://developer.mozilla.org/fr/docs/Web/API/MutationObserver
- **Intl.NumberFormat MDN** : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

---

## 📝 Notes du Développeur

### Choix de Conception

1. **Insertion avant sous-total** : garantit que les promotions sont toujours visibles avant les calculs finaux
2. **Suppression préalable** : évite les doublons lors des mises à jour
3. **Fallbacks multiples** : assure la compatibilité avec différentes versions Snipcart
4. **Animation fadeIn** : feedback visuel agréable sans surcharger l'interface
5. **Classes préfixées `__gd-`** : évite les conflits avec les classes Snipcart natives

### Limitations Connues

- ⚠️ Nécessite Snipcart 3.x (API `store.getState()`)
- ⚠️ Fonctionne uniquement si `window.Snipcart.store` est disponible
- ⚠️ Les traductions des noms de promotions doivent être gérées côté Snipcart Dashboard

### Améliorations Futures

- 🔮 Ligne "Économie totale" si plusieurs promotions
- 🔮 Badge avec nombre de promotions appliquées
- 🔮 Animation de suppression (fadeOut)
- 🔮 Support traductions i18n pour "Promotion"

---

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`
**Date d'Implémentation** : 3 octobre 2025
**Auteur** : Geek & Dragon Development Team
**Version** : 1.0.0
