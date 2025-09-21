# Système Multilingue - Geek & Dragon

## 📋 Résumé des améliorations

Le système multilingue a été **simplifié et optimisé** pour faciliter l'ajout de nouvelles langues et corriger les éléments non traduits.

### ✅ Problèmes corrigés
- ✅ Éléments hardcodés dans les pages produits maintenant traduits
- ✅ Convertisseur de monnaie **entièrement traduit** (100% des textes)
- ✅ Messages d'interface utilisateur (images, navigation) traduits
- ✅ Descriptions de cartes et triptyques traduites
- ✅ Boutons de langue **forcent maintenant le rechargement** (F5) pour mise à jour complète
- ✅ Système simplifié avec fonctions helper

### 🆕 Nouvelles fonctionnalités
- **Helper I18N** (`includes/i18n-helper.php`) avec fonctions utilitaires
- **Fonction `t()`** pour récupérer les traductions facilement
- **Fonction `__()`** alias global court
- **Fonction `dataI18n()`** pour générer les attributs HTML
- **Fonction `ariaLabel()`** pour l'accessibilité
- **Script de test** pour vérifier la cohérence

## 🛠️ Utilisation du nouveau système

### 1. Fonctions de base

```php
// Dans un fichier PHP
require_once __DIR__ . '/i18n.php';

// Récupérer une traduction simple
echo t('nav.shop'); // "Boutique" ou "Shop"

// Avec fallback
echo t('cle.inexistante', null, 'Texte par défaut');

// Alias court
echo __('product.add'); // "Ajouter" ou "Add"

// Générer un attribut data-i18n avec le texte
echo '<span ' . dataI18n('ui.loading', 'Chargement...') . '</span>';
// Résultat: <span data-i18n="ui.loading">Chargement...</span>

// Générer un aria-label
echo '<button ' . ariaLabel('ui.close', 'Fermer') . '>×</button>';
// Résultat: <button aria-label="Fermer">×</button>
```

### 2. Dans les templates PHP

```php
<!-- Ancienne méthode (toujours supportée) -->
<span data-i18n="product.add">Ajouter au panier</span>

<!-- Nouvelle méthode recommandée -->
<span data-i18n="product.add"><?= __('product.add', 'Ajouter') ?></span>

<!-- Pour les attributs aria-label -->
<button aria-label="<?= __('ui.close', 'Fermer') ?>">×</button>
```

### 3. Ajouter de nouvelles traductions

1. **Éditer les fichiers JSON** :
   - `translations/fr.json`
   - `translations/en.json`

2. **Structure recommandée** :
```json
{
  "section": {
    "subsection": {
      "key": "Valeur traduite"
    }
  }
}
```

3. **Exemples d'ajouts** :
```json
// fr.json
{
  "ui": {
    "confirm": "Confirmer",
    "cancel": "Annuler"
  }
}

// en.json
{
  "ui": {
    "confirm": "Confirm", 
    "cancel": "Cancel"
  }
}
```

## 📂 Structure des fichiers

```
├── i18n.php                    # Système principal (amélioré)
├── includes/
│   └── i18n-helper.php         # Fonctions helper (nouveau)
├── translations/
│   ├── fr.json                 # Traductions françaises (enrichi)
│   └── en.json                 # Traductions anglaises (enrichi)
├── test-i18n.php              # Script de test (nouveau)
└── SYSTEME_MULTILINGUE.md     # Cette documentation
```

## 🔧 Nouvelles traductions ajoutées

### Interface utilisateur
- `ui.noImageAvailable` : "Aucune image disponible" / "No image available"
- `ui.previousImage` : "Image précédente" / "Previous image"  
- `ui.nextImage` : "Image suivante" / "Next image"
- `ui.loading` : "Chargement..." / "Loading..."
- `ui.error` : "Erreur" / "Error"
- `ui.close` : "Fermer" / "Close"

### Convertisseur de monnaie
- `shop.converter.title` : "Convertisseur de monnaie" / "Currency converter"
- `shop.converter.sourcesLabel` : "💰 Monnaies sources" / "💰 Source currencies"
- `shop.converter.multiplierLabel` : "⚖️ Tableau multiplicateur" / "⚖️ Multiplier table"
- `shop.converter.equivalences` : "💼 Équivalences totales" / "💼 Total equivalences"
- `shop.converter.recommendations` : "✨ Recommandations optimales" / "✨ Optimal recommendations"
- `shop.converter.enterAmounts` : "Entrez des montants..." / "Enter amounts..."
- `shop.converter.optimalConversion` : "Conversion optimale" / "Optimal conversion"
- `shop.converter.minimalCoins` : "Nombre minimal de pièces" / "Minimum number of coins"
- `shop.converter.totalCoins` : "Total pièces" / "Total coins"
- `shop.converter.remainder` : "Reste" / "Remainder"
- `shop.converter.units` : "Unités" / "Units"
- `shop.converter.lots` : "Lots" / "Lots"
- `shop.converter.coins` : "pièces" / "coins"
- `shop.converter.and` : "et" / "and"

### Monnaies
- `shop.converter.currency.copper` : "Cuivre" / "Copper"
- `shop.converter.currency.silver` : "Argent" / "Silver"
- `shop.converter.currency.electrum` : "Électrum" / "Electrum"
- `shop.converter.currency.gold` : "Or" / "Gold"  
- `shop.converter.currency.platinum` : "Platine" / "Platinum"

### Descriptions produits
- `shop.cards.description` : Description courte pour les cartes
- `shop.triptychs.description` : Description courte pour les triptyques

## 🧪 Test et validation

### Exécuter les tests
```bash
php test-i18n.php
```

### Vérifications automatiques
- ✅ Cohérence des clés entre FR et EN
- ✅ Fonctionnement des nouvelles fonctions helper
- ✅ Chargement correct des traductions
- ✅ Fallbacks en cas de clé manquante

## 🚀 Ajout d'une nouvelle langue

Pour ajouter une nouvelle langue (ex: espagnol):

1. **Créer le fichier de traduction** :
   ```bash
   cp translations/fr.json translations/es.json
   ```

2. **Traduire le contenu** dans `es.json`

3. **Mettre à jour `i18n.php`** :
   ```php
   $availableLangs = ['fr', 'en', 'es']; // Ajouter 'es'
   ```

4. **Ajouter le drapeau** dans `header.php` :
   ```html
   <button type="button" data-lang="es" class="flag-btn" aria-label="Español">
     <img src="/media/ui/flags/flag-es.svg" width="32" height="24" alt="">
   </button>
   ```

## 📋 Bonnes pratiques

### 1. Nommage des clés
- Utiliser la notation pointée : `section.subsection.key`
- Noms en anglais, explicites : `product.addToCart` plutôt que `prod.add`
- Grouper par fonctionnalité : `ui.*`, `shop.*`, `product.*`

### 2. Fallbacks
- Toujours fournir un fallback lisible
- Préférer `__('key', 'Fallback')` à `t('key')`

### 3. Performance
- Le système utilise le cache JSON déjà présent
- Les traductions sont chargées une seule fois par requête

### 4. Accessibilité
- Utiliser `ariaLabel()` pour les éléments interactifs
- Maintenir les attributs `data-i18n` pour la compatibilité JavaScript

## 🔄 Migration depuis l'ancien système

L'ancien système reste **100% compatible**. Vous pouvez migrer progressivement :

```php
// Ancien (toujours supporté)
<span data-i18n="product.add">Ajouter</span>

// Nouveau (recommandé)
<span data-i18n="product.add"><?= __('product.add', 'Ajouter') ?></span>
```

## 📞 Support

Pour toute question ou problème avec le système multilingue :
1. Vérifiez les traductions avec `php test-i18n.php`
2. Consultez les logs d'erreur PHP
3. Vérifiez la cohérence des fichiers JSON avec un validateur

---

*Système mis à jour le <?= date('Y-m-d') ?> - Geek & Dragon*