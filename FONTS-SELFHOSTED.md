# Polices Auto-Hébergées - Geek & Dragon

## Répertoire de Travail Actuel
`E:\GitHub\GeeknDragon`

## Problème Résolu

Les erreurs CSP (Content Security Policy) suivantes ont été corrigées :
```
Refused to load the stylesheet 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Cinzel:wght@400;600;700&display=swap'
because it violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'".
```

## Solution Implémentée

### 1. Téléchargement des Polices Locales

Les polices Google Fonts ont été téléchargées et auto-hébergées :

```bash
node scripts/fetch-fonts.cjs
```

**Polices téléchargées** :
- Open Sans 300 (pour Snipcart)
- Open Sans 400
- Open Sans 600
- Cinzel 400
- Cinzel 600
- Cinzel 700

**Localisation** : `media/fonts/`
- `OpenSans-300.woff2`
- `OpenSans-400.woff2`
- `OpenSans-600.woff2`
- `Cinzel-400.woff2`
- `Cinzel-600.woff2`
- `Cinzel-700.woff2`

### 2. Fichier CSS Généré

**Fichier** : `css/fonts-selfhosted.css`

Contient les déclarations `@font-face` pour toutes les variantes avec :
- `font-display: swap` pour optimiser le chargement
- Chemins locaux `/media/fonts/`
- Format WOFF2 moderne et léger

### 3. Suppression des Imports Externes

Les imports Google Fonts ont été supprimés de :
- `css/styles.css` (ligne 1)
- `css/snipcart.css` (ligne 1)

### 4. Chargement dans head-common.php

Le fichier `head-common.php` charge automatiquement les polices auto-hébergées avec :
- Détection de l'existence du fichier
- Preload des polices critiques
- Cache-busting avec `filemtime()`

```php
<?php if (file_exists(__DIR__.'/css/fonts-selfhosted.css')): ?>
  <link rel="stylesheet" href="/css/fonts-selfhosted.css?v=<?= filemtime(__DIR__.'/css/fonts-selfhosted.css') ?>">
  <?php if (file_exists(__DIR__.'/media/fonts/OpenSans-400.woff2')): ?>
    <link rel="preload" as="font" type="font/woff2" href="/media/fonts/OpenSans-400.woff2" crossorigin>
  <?php endif; ?>
  <?php if (file_exists(__DIR__.'/media/fonts/Cinzel-600.woff2')): ?>
    <link rel="preload" as="font" type="font/woff2" href="/media/fonts/Cinzel-600.woff2" crossorigin>
  <?php endif; ?>
<?php endif; ?>
```

### 5. Build Automatique Exécuté

Le build complet a régénéré tous les fichiers minifiés :
```bash
npm run build:complete
```

**Résultats** :
- ✅ `css/styles.min.css` : 88.03KB (16.25KB gzippé)
- ✅ `css/snipcart-custom.min.css` : 26.14KB (4.28KB gzippé)
- ✅ Build réussi : 17 fichiers optimisés

## Conformité 100% Local-First

✅ **Aucune dépendance externe** pour les polices
✅ **Aucun appel réseau** pendant le chargement des pages
✅ **Confidentialité totale** : pas de tracking Google Fonts
✅ **Performance optimale** : polices servies depuis le même domaine
✅ **CSP compatible** : `style-src 'self' 'unsafe-inline'`

## Maintenance Future

### Re-télécharger les Polices

Si Google met à jour les polices :
```bash
node scripts/fetch-fonts.cjs
npm run build:complete
```

### Ajouter une Nouvelle Variante

Modifier `scripts/fetch-fonts.cjs` :
```javascript
const wanted = {
  'Open Sans': new Set([300, 400, 600, 700]), // Ajouter 700
  'Cinzel': new Set([400, 600, 700])
};
```

Puis relancer :
```bash
node scripts/fetch-fonts.cjs
npm run build:complete
```

## Vérification Production

Sur HostPapa, vérifier que :
1. Les fichiers `.woff2` sont bien uploadés dans `media/fonts/`
2. Le fichier `css/fonts-selfhosted.css` existe
3. Aucune erreur CSP dans la console navigateur
4. Les polices s'affichent correctement

## Tailles de Fichiers

| Fichier | Taille |
|---------|--------|
| OpenSans-300.woff2 | ~12 KB |
| OpenSans-400.woff2 | ~12 KB |
| OpenSans-600.woff2 | ~12 KB |
| Cinzel-400.woff2 | ~15 KB |
| Cinzel-600.woff2 | ~15 KB |
| Cinzel-700.woff2 | ~15 KB |
| **Total** | **~81 KB** |

Comparé aux ~150 KB que Google Fonts aurait servis (avec latence réseau), c'est un gain net de performance.
