# Archive - Fichiers Obsolètes

Ce dossier contient les fichiers qui ne sont plus utilisés dans le projet actif mais conservés pour référence historique.

## migrations/
Scripts de migration et de transformation de données qui ont été exécutés une seule fois :
- `lot*.php` - Anciennes redirections produits (remplacées par redirections .htaccess)
- `*-csv.php` - Scripts de nettoyage et transformation des données CSV
- `create-*.php` - Scripts de création de produits (migrations terminées)
- `convert-products.php` - Conversion one-shot du format de données

## scripts-obsoletes/
Scripts shell et batch remplacés par des alternatives modernes :
- `check_unused_media.sh`, `identify_unused.sh` - Remplacés par `scripts/audit-unused-media.cjs`
- `compress-images.ps1` - Remplacé par `scripts/optimize-images.cjs`
- `compress-videos.ps1` - Traitement ponctuel terminé
- `*-Products.*` - Gestion produits migrée vers interface web `admin-products.php`
- `cleanup-old-files.ps1` - Migration de nettoyage terminée

## Date d'archivage
15 octobre 2025

## Politique de rétention
Ces fichiers peuvent être supprimés définitivement après 6 mois si aucun besoin de rollback n'est identifié.
