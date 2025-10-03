# Système d'Affichage Dynamique des Promotions Snipcart

## 📋 Aperçu

Le système d'affichage dynamique des promotions permet d'afficher toutes les promotions appliquées dans le panier Snipcart **sans popup**, directement dans le résumé du panier, les unes après les autres.

## 🎯 Fonctionnalités

### ✅ Ce qui est implémenté

1. **Extraction automatique des promotions** depuis l'état du panier Snipcart
2. **Affichage dynamique** : chaque promotion est affichée sur une ligne séparée
3. **Décalage automatique** : le sous-total, livraison, taxes et total sont poussés vers le bas
4. **Animation fluide** : apparition en fondu des lignes de promotion
5. **Style cohérent** : intégration parfaite avec le thème sombre Geek & Dragon
6. **Mise à jour en temps réel** : rafraîchissement automatique lors de l'ajout/suppression de promotions

### 🎨 Design

- **Icône cadeau** 🎁 devant chaque promotion
- **Couleur verte** (#10b981) pour les montants de réduction
- **Bordures et séparateurs** pour une lisibilité optimale
- **Effet de survol** avec fond légèrement coloré
- **Animation d'apparition** douce (fadeIn)

## 🔧 Architecture Technique

### Fichiers Modifiés

1. **`js/snipcart.js`** (L213-L329)
   - Fonction `displayPromotionsDynamically()` : extrait et affiche les promotions
   - Fonction `formatCurrency()` : formate les montants en devise
   - Écoute des événements : `discount.applied`, `discount.removed`
   - MutationObserver amélioré : détecte les changements dans le résumé

2. **`css/snipcart-custom.css`** (L1030-L1139)
   - Styles pour `.__gd-promo-line` : ligne de promotion
   - Animation `@keyframes fadeInPromo`
   - Styles pour `.__gd-promo-name` et `.__gd-promo-amount`
   - Ajustements du sous-total et séparateurs

### Flux de Données

```
┌─────────────────────────────────────────────────┐
│  Snipcart API : window.Snipcart.store.getState() │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  cart.discounts  │
              │  (tableau)      │
              └────────┬────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  displayPromotionsDynamically() │
         └─────────────┬───────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
        ▼                              ▼
 ┌─────────────┐              ┌──────────────┐
 │  Créer ligne  │              │  Formater    │
 │  de promotion │              │  montant     │
 └──────┬────────┘              └──────┬───────┘
        │                              │
        └──────────────┬───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Insérer avant   │
              │  sous-total      │
              └─────────────────┘
```

### Détection des Promotions

Les promotions sont extraites depuis :

```javascript
const cart = window.Snipcart?.store?.getState()?.cart;
const discounts = cart.discounts || [];
```

Chaque promotion contient :
- `name` : Nom de la promotion
- `type` : 'FixedAmount', 'Rate', etc.
- `amount` : Montant de réduction (si type FixedAmount)
- `rate` : Pourcentage de réduction (si type Rate)

### Événements Écoutés

```javascript
['item.added', 'item.updated', 'cart.opened', 'cart.closed',
 'cart.confirmed', 'discount.applied', 'discount.removed']
```

À chaque événement, les promotions sont rafraîchies après 100ms.

### MutationObserver

Le MutationObserver surveille les changements dans :
- `.snipcart-cart-summary`
- `.snipcart-checkout__content--summary`
- `.snipcart-summary`

Et déclenche un rafraîchissement des promotions en cas de modification.

## 🎨 Exemple Visuel

```
┌────────────────────────────────────────┐
│  🎁 Cadeau Livraison Gratuite          │ -17,00 $
├────────────────────────────────────────┤
│  🎁 Partez à l'Aventure Game           │ -10%
├────────────────────────────────────────┤
│  🎁 Geek & Dragon Livraison            │ -5,00 $
╞════════════════════════════════════════╡
│  Sous-total                            │ 500,00 $
│  Livraison                             │ 17,00 $
│  Taxes                                 │ 36,49 $
├────────────────────────────────────────┤
│  TOTAL                                 │ 553,49 $
└────────────────────────────────────────┘
```

## 🐛 Gestion des Erreurs

### Scénarios Gérés

1. **Section résumé non trouvée** : log d'avertissement, pas d'erreur
2. **Données panier indisponibles** : log d'avertissement, retour silencieux
3. **Ligne sous-total non trouvée** : log d'avertissement, pas d'insertion
4. **Aucune promotion** : suppression des lignes existantes, retour silencieux
5. **Erreur de formatage** : fallback vers format simple

### Logs de Débogage

En mode debug (`?debug=1` ou `#debug`) :
```javascript
console.log(`✅ ${discounts.length} promotion(s) affichée(s) dynamiquement`);
```

## 🔄 Mises à Jour Automatiques

Le système se met à jour automatiquement :

1. **Lors de l'ajout/suppression de promotion** : événements `discount.applied` / `discount.removed`
2. **Lors de la modification du panier** : événements `item.added` / `item.updated`
3. **Lors de l'ouverture du panier** : événement `cart.opened`
4. **Lors de mutations DOM** : MutationObserver sur le résumé

## 🎯 Avantages

### Expérience Utilisateur
- ✅ **Pas de popup** : toutes les promotions visibles d'un coup d'œil
- ✅ **Clarté** : chaque promotion sur une ligne séparée
- ✅ **Lisibilité** : décalage automatique, pas de chevauchement
- ✅ **Feedback visuel** : animation d'apparition fluide

### Technique
- ✅ **Performance** : calculs optimisés, pas de re-renders inutiles
- ✅ **Robustesse** : gestion d'erreurs complète
- ✅ **Maintenabilité** : code documenté, modulaire
- ✅ **Compatibilité** : fonctionne avec toutes versions Snipcart 3.x

## 📝 Notes Importantes

### ⚠️ Points d'Attention

1. **Sélecteurs CSS** : les sélecteurs utilisent des fallbacks multiples pour compatibilité
2. **Timing** : délai de 100ms après événements pour laisser Snipcart finaliser les mises à jour
3. **Suppression préalable** : les anciennes lignes sont supprimées avant d'en créer de nouvelles
4. **Currency** : le formatage utilise `Intl.NumberFormat` avec fallback manuel

### 🔍 Sélecteurs de Secours

```javascript
// Section résumé (3 fallbacks)
const summarySection =
  $('.snipcart-cart-summary') ||
  $('.snipcart-checkout__content--summary') ||
  $('.snipcart-summary');

// Ligne sous-total (3 fallbacks)
const subtotalLine =
  $('.snipcart-cart-summary-item--subtotal', summarySection) ||
  $('.snipcart-summary-fees__item--subtotal', summarySection) ||
  $('.snipcart-cart-summary-item', summarySection);
```

## 🚀 Déploiement

### Fichiers à Déployer

1. ✅ `js/snipcart.js` (version source)
2. ✅ `js/snipcart.min.js` (version minifiée)
3. ✅ `css/snipcart-custom.css` (styles)

### Vérification Post-Déploiement

1. Ouvrir le panier avec promotions appliquées
2. Vérifier que les promotions s'affichent en liste
3. Confirmer que le sous-total est bien décalé
4. Tester l'ajout/suppression de promotions
5. Valider l'animation d'apparition

## 🔗 Références

- **Snipcart API** : https://docs.snipcart.com/v3/sdk/api
- **Snipcart Events** : https://docs.snipcart.com/v3/sdk/events
- **MutationObserver** : https://developer.mozilla.org/fr/docs/Web/API/MutationObserver

---

**Dernière mise à jour** : 3 octobre 2025
**Auteur** : Geek & Dragon Development Team
**Répertoire de travail** : `E:\GitHub\GeeknDragon`
