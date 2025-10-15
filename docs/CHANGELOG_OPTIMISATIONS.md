# Changelog - Optimisations et Nettoyage

## Version 2.1.0 - 15 octobre 2025

### 🔴 Corrections Critiques

#### Compatibilité PHP 8.3+ (bootstrap.php)
- **Problème** : Utilisation de `FILTER_SANITIZE_STRING` déprécié
- **Solution** : Remplacement par `FILTER_UNSAFE_RAW` avec flags de sécurité + validation stricte `in_array()`
- **Impact** : Débloque migration PHP 8.3+, élimine warnings futurs

#### Qualité Emails SendGrid (contact-handler.php)
- **Problème** : `htmlspecialchars()` encodait le payload JSON → emails illisibles
- **Solution** : Suppression de l'échappement, SendGrid gère UTF-8 nativement
- **Impact** : Restaure accents et caractères spéciaux dans emails clients

#### Performance LCP (index.php)
- **Problème** : `<link rel="preload">` vidéo dans `<body>` → ignoré par navigateurs
- **Solution** : Déplacement dans `<head>` via helper `preload_asset()`
- **Impact** : Optimisation LCP fonctionnelle, HTML valide

---

### ✨ Nouvelles Fonctionnalités

#### Helpers Communs Réutilisables

**includes/asset-helper.php** - Gestion centralisée des assets
- `asset_url(string $path, bool $absolute = false): string` - Cache-busting avec mémoization
- `preload_asset(string $path, string $type, array $attributes = []): string` - Préchargement optimisé
- `stylesheet_tag(string $path, array $attributes = []): string` - Balise `<link>` avec versioning
- `script_tag(string $path, array $attributes = []): string` - Balise `<script>` avec versioning

**Bénéfices** :
- Élimine 6+ appels `filemtime()` répétés par requête
- Cache statique en mémoire (1 accès disque par asset/requête max)
- Fallback gracieux si fichier manquant
- Single source of truth pour versioning

**includes/debug-helper.php** - Logs conditionnels selon environnement
- `is_debug_mode(): bool` - Vérifie variable `DEBUG_MODE`
- `debug_log($message, string $context = ''): void` - Log uniquement en debug
- `should_suppress_console_logs(string $source = ''): bool` - Détermine suppression logs
- `get_console_filter_script(): string` - Génère filtrage JavaScript conditionnel
- `performance_mark(string $label): void` - Marqueurs performance en debug

**Bénéfices** :
- Logs Snipcart/GTag supprimés uniquement en production
- Diagnostics complets disponibles en développement (DEBUG_MODE=true)
- Respecte variable d'environnement documentée dans README
- Améliore supportabilité et débogage

---

### 🧹 Nettoyage & Refactorisation

#### Archivage Fichiers Obsolètes (-17 fichiers racine)
**Migrations archivées** (`archive/migrations/`) :
- `lot10.php`, `lot25.php`, `lot50-essence.php`, `lot50-tresorerie.php` → Redirections .htaccess
- `clean-final-csv.php`, `count-cards.php` → Scripts one-shot terminés
- `create-*.php`, `update-csv-*.php`, `convert-products.php` → Migrations historiques

**Scripts shell obsolètes** (`archive/scripts-obsoletes/`) :
- `check_unused_media.sh`, `identify_unused.sh` → Remplacés par `scripts/audit-unused-media.cjs`
- `compress-images.ps1` → Remplacé par `scripts/optimize-images.cjs`
- `Gestion-Produits.bat`, `Update-Products.ps1` → Interface web `admin-products.php`

**Redirections SEO optimisées** (.htaccess) :
```apache
RewriteRule ^lot10\.php$ /product.php?id=coin-traveler-offering [L,R=301]
RewriteRule ^lot25\.php$ /product.php?id=coin-kingdom-currency [L,R=301]
RewriteRule ^lot50-essence\.php$ /product.php?id=coin-kingdom-essence [L,R=301]
RewriteRule ^lot50-tresorerie\.php$ /product.php?id=coin-merchant-treasury [L,R=301]
```

#### Refactorisation Code Dupliqué

**head-common.php** :
- Avant : 7 appels `filemtime()` répétés par requête
- Après : Utilise `asset_url()`, `preload_asset()`, `stylesheet_tag()`
- Réduction : -11 lignes, +lisibilité

**snipcart-init.php** :
- Avant : Désactivation globale logs (26 lignes JavaScript hardcodé)
- Après : `get_console_filter_script()` conditionnel (1 ligne PHP)
- Réduction : -25 lignes, respect DEBUG_MODE

**index.php** :
- Avant : Préchargement vidéo avec `filemtime()` manuel
- Après : `preload_asset('media/videos/...', 'video')`
- Réduction : -2 lignes, cohérence avec architecture

---

### 📊 Métriques d'Amélioration

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Fichiers racine | 39 | 22 | **-43%** |
| Appels `filemtime()` / requête | 7+ | 1 par asset | **-85%** |
| Duplication cache-busting | 6 fichiers | 1 helper | **DRY** |
| Logs debug contrôlables | Non | Oui (DEBUG_MODE) | ✅ |
| Compatibilité PHP | 8.1 max | 8.3+ | ✅ |
| Emails clients lisibles | Non | Oui (UTF-8) | ✅ |
| Préchargement vidéo fonctionnel | Non | Oui (`<head>`) | ✅ |

---

### 🔧 Configuration Requise

**Variables d'environnement** (.env) :
```bash
DEBUG_MODE=false  # true en développement pour activer logs Snipcart/GTag
```

**Comportement** :
- `DEBUG_MODE=true` : Tous les logs console affichés (développement)
- `DEBUG_MODE=false` : Logs Snipcart/GTag supprimés (production propre)
- `console.error` **toujours** préservé pour diagnostics critiques

---

### 🎯 Prochaines Étapes (Non Bloquantes)

#### Optimisation Vidéo Hero (Performance Mobile)
- Détection User-Agent ou `Accept` header pour mobile
- Fallback image statique sur connexions lentes
- Réduction liste vidéos de 9 → 2-3 max
- **Impact estimé** : -30% LCP mobile, -plusieurs Mo download

#### Refactorisation Additionnelle (Dette Technique)
- Migrer `boutique.php` et `product.php` vers helpers
- Générer grille produits côté serveur (SEO)
- Compléter internationalisation (es/de)
- Réactiver ESLint progressivement

---

### 📝 Documentation Associée

- `docs/RAPPORT_AUDITS_COMPARATIF.md` - Synthèse des 6 audits successifs
- `docs/PLAN_NETTOYAGE_OPTIMISATION.md` - Stratégie et bénéfices
- `archive/README.md` - Politique de rétention fichiers archivés

---

## Commits Associés

```bash
ea73b44 Documentation: audits comparatifs et plan nettoyage
1a3081f Ajout redirections 301 pour anciennes URLs produits
8d94f72 Refactorisation avec helpers: réduction duplication et optimisation
0ea24b0 Ajout helpers communs pour éliminer duplication code
77809ae Correction problèmes critiques audits
```

---

**Auteur** : Brujah
**Date** : 15 octobre 2025
**Statut** : ✅ Production-ready
