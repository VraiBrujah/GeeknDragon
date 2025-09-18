# Feuille de route

## Socle web 2025
- [x] Centraliser la configuration applicative via `config.php` (normalisation des variables d'environnement, calcul d'URL de base).
- [x] Uniformiser les gabarits publics (`head-common.php`, `header.php`, `footer.php`) et partager la logique i18n.
- [x] Moderniser les formulaires `contact.php` et `devis.php` avec CSRF, honeypot et persistance des erreurs.
- [x] Retirer les dossiers historiques `old/` et `backup-phase1/` pour ne conserver que la nouvelle source de vérité (`src/`, racine PHP, `views/`, `partials/`).
- [x] Migrer le générateur de sitemap vers `tools/build-sitemap.php` pour suivre les routes actives.

## Phase en cours — Consolidation formulaires & Snipcart
- [ ] Finaliser les tests fonctionnels sur `contact-handler.php` et `devis-handler.php` (CSRF, anti-spam, limites de taille).
- [ ] Vérifier les redirections `public/index.php` après soumission (merci, erreurs) sur chaque langue.
- [ ] Harmoniser les textes i18n restants (`quote.*`, `contact.*`) et compléter les traductions manquantes.
- [ ] Couvrir les nouvelles pages par `composer test` et s'assurer que `ProjectFilesTest` détecte les gabarits partagés.

## Phase suivante — Expérience compte & automatisation
- [ ] Étendre les tests autour de `AccountController` (login local, commandes, factures).
- [ ] Documenter l'API interne (`src/Controller/*`) et exposer les flux attendus pour l'équipe produit.
- [ ] Automatiser la régénération de `sitemap.xml` via CI après chaque déploiement.
- [ ] Auditer l'admin (`admin/`) afin d'aligner les variables d'environnement et supprimer les restes de Phase 0.
