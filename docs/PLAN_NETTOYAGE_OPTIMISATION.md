# Plan de Nettoyage et Optimisation - GeeknDragon

## Fichiers Obsolètes à Supprimer

### Scripts de migration/maintenance obsolètes
- `lot10.php` - Redirection simple, peut être dans .htaccess
- `lot25.php` - Redirection simple, peut être dans .htaccess
- `lot50-essence.php` - Redirection simple, peut être dans .htaccess
- `lot50-tresorerie.php` - Redirection simple, peut être dans .htaccess
- `clean-final-csv.php` - Script de migration terminé (marqué obsolète dans le code)
- `count-cards.php` - Script d'analyse one-shot (marqué obsolète)
- `create-smaller-packs.php` - Script de migration terminé
- `create-triptych-products.php` - Script de migration terminé
- `update-csv-real-data.php` - Script de migration terminé
- `update-csv-smaller-packs.php` - Script de migration terminé
- `convert-products.php` - Script de conversion one-shot

### Scripts shell/batch redondants
- `check_unused_media.sh` - Doublon avec `scripts/audit-unused-media.cjs`
- `identify_unused.sh` - Doublon avec `scripts/audit-unused-media.cjs`
- `cleanup-old-files.ps1` - Migration terminée
- `compress-images.ps1` - Doublon avec `scripts/optimize-images.cjs`
- `compress-videos.ps1` - Utilisation ponctuelle, peut être archivé
- `Gestion-Produits.bat` - Doublon avec admin-products.php
- `update-products.bat` - Doublon avec admin-products.php
- `Update-Products.ps1` - Doublon avec admin-products.php

## Code Dupliqué à Factoriser

### 1. Cache-busting avec filemtime()
**Occurrences** : 6 fichiers (head-common.php, index.php, boutique.php, snipcart-init.php, script-loader.php, TranslationSync.php)

**Solution** : Créer helper centralisé `includes/asset-helper.php`
```php
function asset_url(string $path, bool $absolute = false): string
```

### 2. Gestion des langues
**Occurrences** : Logique répétée dans plusieurs fichiers

**Solution** : Centraliser dans `includes/language-helper.php`

### 3. Logs conditionnels Snipcart
**Problème** : Désactivation globale dans snipcart-init.php

**Solution** : Respecter variable DEBUG_MODE déjà documentée dans README

## Actions d'Optimisation

### Phase 1 : Création Helpers Communs (1-2h)
1. `includes/asset-helper.php` - Gestion cache-busting centralisée
2. `includes/debug-helper.php` - Gestion logs conditionnels
3. Mise à jour de tous les appels pour utiliser helpers

### Phase 2 : Nettoyage Fichiers (30 min)
1. Archiver scripts obsolètes dans `archive/migrations/`
2. Ajouter redirections .htaccess pour lot*.php
3. Supprimer scripts shell redondants

### Phase 3 : Optimisation Vidéo Hero (1h)
1. Détection mobile via User-Agent ou Accept header
2. Fallback image statique pour mobile
3. Lazy-loading conditionnel

## Bénéfices Attendus

- **Réduction complexité** : -17 fichiers racine (-43%)
- **Maintenance** : Code DRY, single source of truth
- **Performance** : Cache-busting optimisé, vidéo conditionnelle
- **Debuggage** : Logs Snipcart activables via DEBUG_MODE
- **Standards** : Respect PSR-4, séparation des responsabilités
