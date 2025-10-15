# Audit du site Geek & Dragon (mars 2025)

## Résumé exécutif
Cet audit couvre le socle PHP du site boutique Geek & Dragon. Les points les plus critiques concernent la fuite potentielle d'informations sensibles via les journaux d'erreur exposés publiquement, la dégradation des contenus d'e-mails envoyés via SendGrid, et plusieurs axes d'optimisation (performance et accessibilité) faciles à corriger.

## 1. Sécurité

### 1.1 Journaux accessibles depuis le web
Le gestionnaire du formulaire de contact écrit directement les erreurs et succès dans `logs/contact_errors.log` et `logs/contact_success.log`. Le répertoire `logs/` vit à la racine du site et n'est pas protégé par défaut, ce qui expose potentiellement les adresses IP, les adresses e‑mail et des messages d'erreur sensibles à toute personne qui connaît l'URL du fichier.【F:contact-handler.php†L115-L224】

**Recommandations**
- Déplacer les fichiers de log hors de la racine web (ex.: `/var/log/geekndragon/contact.log`).
- À défaut, ajouter une règle de protection (`.htaccess` ou configuration serveur) qui bloque toute lecture HTTP dans `logs/`.
- Centraliser ces journaux dans un canal syslog ou un service SaaS pour limiter la surface d'attaque.

### 1.2 Encodage excessif du payload SendGrid
Lors de l'assemblage de la requête SendGrid, toutes les valeurs (`to`, `subject`, `body`, etc.) sont passées à `htmlspecialchars`. Le JSON final contient donc des entités HTML (`&amp;`, `&quot;`…), ce qui altère le contenu envoyé (noms propres, caractères accentués) et empêche l'envoi de texte brut fidèle.【F:contact-handler.php†L142-L157】

**Recommandations**
- Supprimer `htmlspecialchars` dans le payload JSON et laisser SendGrid gérer les valeurs brutes.
- Conserver l'échappement uniquement pour un rendu HTML éventuel (ex. affichage côté back-office) et non pour l'appel API.

## 2. Fiabilité & maintenance

### 2.1 Utilisation de filtres PHP dépréciés
`gd_detect_request_scheme()` continue d'utiliser `FILTER_SANITIZE_STRING`, un filtre supprimé en PHP 8.3. L'appel génèrera bientôt un avertissement, puis une erreur fatale si la fonction disparaît des futures versions.【F:bootstrap.php†L84-L139】

**Recommandations**
- Remplacer `FILTER_SANITIZE_STRING` par `FILTER_UNSAFE_RAW` associé à une validation stricte (`preg_match`, `in_array`).
- Ajouter des tests automatisés pour garantir la compatibilité PHP 8.3+.

## 3. Performance

### 3.1 Accès disque répétés sur chaque requête
Le template `head-common.php` exécute `filemtime()` sur chaque ressource CSS (vendor, styles, shop-grid, polices…) pour générer un hash de cache-busting. En environnement de production, cela multiplie les accès disque à chaque page, ce qui dégrade la latence sous forte charge.【F:head-common.php†L77-L92】

**Recommandations**
- Geler le numéro de version dans un fichier de build (ex.: `build-manifest.json`) généré lors du déploiement.
- Ou mettre en cache le résultat de `filemtime()` via APCu/opcache en l'entourant d'un simple memoize statique.

## 4. Accessibilité & SEO

### 4.1 Préchargement vidéo mal positionné
La section héroïne ajoute `<link rel="preload" as="video">` à l'intérieur du `<body>`. Les navigateurs ignorent ce préchargement (la balise doit être dans `<head>`), ce qui annule le bénéfice de performance et génère du HTML invalide.【F:index.php†L35-L66】

**Recommandations**
- Déplacer la balise `<link rel="preload">` dans `head-common.php` via la variable `$extraHead`.
- Ajouter une image de fallback ou une alternative textuelle pour les utilisateurs qui désactivent les vidéos d'arrière-plan.

### 4.2 Lecture difficile pour les lecteurs d'écran
Plusieurs sections clés (témoignage, actualités) utilisent de longs paragraphes non structurés avec des sauts de ligne manuels, ce qui rend la lecture monotone pour les lecteurs d'écran et augmente la charge cognitive.【F:index.php†L146-L186】

**Recommandations**
- Segmenter les témoignages en paragraphes `<p>` plus courts.
- Ajouter des titres de niveau approprié (`<h3>`, `<h4>`) pour chaque bloc de contenu afin d'améliorer la navigation par titres.

## 5. Actions suggérées (priorisées)
1. **Sécuriser les journaux du formulaire de contact** (élevé, rapide).
2. **Corriger l'encodage SendGrid** pour éviter les contenus dégradés (élevé, rapide).
3. **Mettre à jour `gd_detect_request_scheme()`** pour supprimer les filtres dépréciés (moyen, moyen).
4. **Optimiser la stratégie de cache busting** afin de réduire les accès disque en production (moyen, rapide si build existant).
5. **Réviser la structure HTML des sections héro/actualités** pour respecter les bonnes pratiques d'accessibilité (moyen, planifiable avec l'équipe contenu).

En traitant ces points, le site gagnera en sécurité, en robustesse et en expérience utilisateur.
