# 🧪 Comment Tester l'Affichage Dynamique des Promotions

## 📋 Instructions

Le système d'affichage dynamique des promotions **masque automatiquement** la ligne "Promotions" avec popup et affiche les détails individuels.

### ✅ Ce qui doit se passer

**AVANT** (comportement par défaut Snipcart) :
```
Promotions          -85,60 $CA   [clic ouvre popup]
Sous-total          464,40 $CA
Livraison            17,00 $CA
Taxes                72,09 $CA
Total               553,49 $CA
```

**APRÈS** (comportement personnalisé Geek & Dragon) :
```
🎁 Cadeau Livraison Gratuite - 17$ de réduction    -17,00 $CA
🎁 Partez à l'Aventure Game - 10% de réduction     -10%
🎁 Geek & Dragon Livraison                          -5,00 $CA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sous-total                                          464,40 $CA
Livraison                                            17,00 $CA
Taxes                                                72,09 $CA
Total                                               553,49 $CA
```

### 🔍 Comment Vérifier

1. **Ouvrir le panier** avec des promotions appliquées
2. **Vérifier que** :
   - ✅ La ligne "Promotions -85,60 $CA" est **masquée** (display: none)
   - ✅ Les promotions individuelles apparaissent **avant le sous-total**
   - ✅ Chaque promotion a une icône 🎁
   - ✅ Les montants sont en **vert** (#10b981)
   - ✅ Une bordure verte sépare les promotions du sous-total
   - ✅ **Aucun popup** n'apparaît

### 🐛 Si ça ne fonctionne pas

#### Problème 1 : La ligne "Promotions" est toujours visible

**Solution** : Vérifier que le fichier `js/snipcart.js` est bien chargé

```html
<!-- Dans votre page HTML, vérifiez : -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
```

**Ou** utilisez la version minifiée :

```html
<script defer src="/js/snipcart.min.js?v=<?= filemtime(__DIR__.'/js/snipcart.min.js') ?>"></script>
```

#### Problème 2 : Les promotions individuelles ne s'affichent pas

**Vérifier dans la console** :

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Console
3. Chercher les messages :
   - ✅ `✅ X promotion(s) affichée(s) dynamiquement`
   - ⚠️ `Section résumé du panier non trouvée`
   - ⚠️ `Données du panier non disponibles`

**Si vous voyez des avertissements** :

```javascript
// Dans la console, exécuter :
window.Snipcart?.store?.getState()?.cart?.discounts
// Devrait retourner un tableau de promotions
```

#### Problème 3 : Le popup apparaît encore

**Solution** : Vider le cache du navigateur

1. `Ctrl + Shift + Delete`
2. Cocher "Fichiers en cache"
3. Cliquer "Effacer les données"
4. Rafraîchir la page (`Ctrl + F5`)

### 🔧 Débogage Avancé

#### Activer le Mode Debug

Ajouter `?debug=1` ou `#debug` à l'URL :

```
https://votre-site.com/boutique?debug=1
```

Dans la console, vous verrez :

```
🎨 Snipcart customizations initialisées: {api: true, events: true, store: true}
✅ 3 promotion(s) affichée(s) dynamiquement
```

#### Vérifier les Sélecteurs CSS

Dans la console :

```javascript
// Trouver la section résumé
document.querySelector('.snipcart-cart-summary')

// Trouver les promotions
window.Snipcart?.store?.getState()?.cart?.discounts

// Vérifier si les lignes sont créées
document.querySelectorAll('.__gd-promo-line')
```

#### Vérifier que la Ligne "Promotions" est Masquée

Dans la console :

```javascript
// Trouver les lignes du résumé
const lines = document.querySelectorAll('.snipcart-cart-summary-item');
lines.forEach(line => {
  if (line.textContent.includes('Promotions')) {
    console.log('Ligne Promotions:', line);
    console.log('Display:', window.getComputedStyle(line).display);
    console.log('Attribut data-gd-hidden:', line.getAttribute('data-gd-hidden'));
  }
});
```

**Résultat attendu** :
```
Ligne Promotions: <div class="snipcart-cart-summary-item" data-gd-hidden="true">...</div>
Display: none
Attribut data-gd-hidden: true
```

### 📊 Structure des Données

Les promotions sont extraites depuis :

```javascript
const cart = window.Snipcart.store.getState().cart;
const discounts = cart.discounts;

// Exemple de discount :
{
  name: "Cadeau Livraison Gratuite - 17$ de réduction",
  type: "FixedAmount",
  amount: 17.00,
  currency: "CAD"
}
```

### 🎨 Exemple de Code HTML Généré

```html
<div class="__gd-promo-line snipcart-cart-summary-item" style="display: flex !important; ...">
  <span class="__gd-promo-name" style="flex: 1; color: #10b981;">
    Cadeau Livraison Gratuite - 17$ de réduction
  </span>
  <span class="__gd-promo-amount" style="font-weight: 600; color: #10b981;">
    -17,00 $CA
  </span>
</div>
```

### 📝 Fichiers Impliqués

| Fichier | Rôle |
|---------|------|
| `js/snipcart.js` | Code principal (ligne 232-359) |
| `js/snipcart.min.js` | Version minifiée |
| `css/snipcart-custom.css` | Styles (ligne 1034-1144) |
| `snipcart-init.php` | Initialisation Snipcart |

### ✅ Checklist de Test

- [ ] La ligne "Promotions -XX,XX $" est **masquée**
- [ ] Les promotions individuelles sont **visibles**
- [ ] Icône 🎁 devant chaque promotion
- [ ] Couleur verte (#10b981) sur les montants
- [ ] Bordure verte après la dernière promotion
- [ ] Sous-total **décalé vers le bas**
- [ ] **Aucun popup** au clic
- [ ] Animation fadeIn lors de l'apparition
- [ ] Effet de survol (fond légèrement coloré)

### 🔗 Documentation Complète

- **Guide d'implémentation** : `IMPLEMENTATION-PROMOTIONS-DYNAMIQUES.md`
- **Documentation technique** : `docs/snipcart-promotions-dynamiques.md`
- **Changelog** : `CHANGELOG-PROMOTIONS.md`
- **Résumé visuel** : `VISUAL-SUMMARY-PROMOTIONS.txt`

---

**Répertoire de Travail** : `E:\GitHub\GeeknDragon`
**Date** : 3 octobre 2025
**Version** : 1.0.0
