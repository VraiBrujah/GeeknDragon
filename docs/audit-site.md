# Audit technique du site Geek & Dragon

Ce document synthétise les principaux constats effectués lors de l'audit du dépôt. Les points sont classés par thématique (performance, accessibilité, SEO/compliance et backend) avec un niveau de priorité indicatif :

- ⚠️ **Haute** : impact majeur ou risque élevé.
- ⚡ **Moyenne** : optimisation importante mais non bloquante.
- ✅ **Basse** : amélioration de confort ou dette technique mineure.

## Performance front-end

- ⚠️ **Préchargement systématique des vidéos de fond.** La page d'accueil précharge la vidéo « mage_compressed.mp4 » et fournit la liste complète des vidéos de fond dans l'attribut `data-videos`, ce qui force le téléchargement immédiat sur desktop comme sur mobile, même pour les visiteurs qui ne verront jamais ces médias lourds.【F:index.php†L35-L39】  
  ➤ Recommandation : remplacer `link rel="preload"` par un chargement différé conditionné à l'affichage, fournir une image de repli et respecter `prefers-reduced-data`/`prefers-reduced-motion` côté JS.
- ⚡ **Multiplication des `filemtime()` à chaque requête.** L'en-tête commun appelle `filemtime()` pour chaque feuille de style, police et script afin de générer un hash de cache-busting. Sur un hébergement mutualisé, ces appels répétés augmentent la latence car ils déclenchent de nombreux accès disque synchrones.【F:head-common.php†L77-L128】  
  ➤ Recommandation : externaliser la génération de hash vers la chaîne de build (ex. `npm run build`) et remplacer `filemtime()` par un manifest statique.
- ⚡ **Hydratation JavaScript obligatoire pour la grille produits.** La section « Produits phares » repose sur un `<div class="shop-grid"></div>` vide rempli côté client. Sans JS (ou en cas d'échec réseau), le bloc reste vide et les liens internes perdent en SEO/UX.【F:index.php†L69-L93】  
  ➤ Recommandation : rendre un fallback HTML côté PHP ou générer un rendu statique lors du build.
- ✅ **I18n chargé comme module critique.** Le module `i18n-manager.js` est importé dans `<head>` et son initialisation attend `loadTranslations` avant de déclencher `updateDOM`, ce qui ajoute une requête réseau bloquante sur les pages froides.【F:head-common.php†L126-L172】  
  ➤ Recommandation : charger le module en `defer`, embarquer les traductions critiques dans un `<script type="application/json">` ou lazy-loader la mise à jour du DOM.

## Accessibilité & UX

- ⚠️ **Contenu critique masqué si JavaScript désactivé.** Outre la grille produits, plusieurs CTA (« Découvrir nos créations », « Toute la collection ») reposent sur du contenu animé (vidéo de fond, overlays) sans alternative sémantique claire.【F:index.php†L35-L66】【F:index.php†L80-L90】  
  ➤ Prévoir un fallback statique (image + texte descriptif) et marquer les décorations vidéo comme `aria-hidden`.
- ⚡ **Préférence de mouvement non respectée sur la home.** La logique `prefers-reduced-motion` n'est implémentée que dans `aide-jeux.php`, pas dans le composant vidéo de la page d'accueil. Les utilisateurs sensibles se voient imposer des vidéos en boucle.【F:index.php†L35-L39】【F:aide-jeux.php†L3656-L3683】  
  ➤ Centraliser la détection `prefers-reduced-motion` et fournir une image fixe lorsque la réduction du mouvement est demandée.
- ✅ **Menu icône sans texte visible.** Les icônes de navigation reposent sur `aria-label`, mais l'image `<img alt="">` combinée à un `title` n'offre pas de focus visible clavier sur toutes les tailles d'écran. Ajouter du texte visible ou un `sr-only` renforcerait la compréhension.【F:header.php†L118-L164】

## SEO & conformité

- ⚡ **Script Analytics chargé avant consentement explicite.** Le snippet GA4 est injecté dès qu'un identifiant est configuré, même si le CMP n'a pas encore obtenu le consentement, ce qui peut être interprété comme un dépôt de cookie avant accord selon certaines juridictions.【F:head-common.php†L93-L121】  
  ➤ Retarder l'injection du script GA jusqu'au signal `cmpConsentUpdate`.
- ✅ **JSON-LD avec URL absolue codée en dur.** Les champs `logo`/`image` du schéma utilisent le domaine production, ce qui peut poser problème en préproduction ou environnement de test.【F:head-common.php†L174-L195】  
  ➤ Générer les URL à partir de `gd_build_absolute_url()` pour refléter l'environnement courant.

## Backend & sécurité

- ⚠️ **Encode doublement les e-mails envoyés.** Le gestionnaire de contact encapsule toutes les valeurs dans `htmlspecialchars` avant l'envoi via SendGrid, ce qui transforme les accents et les apostrophes (`&#039;`) dans les messages reçus.【F:contact-handler.php†L142-L157】  
  ➤ Conserver le texte brut dans le payload JSON (SendGrid n'interprète pas HTML en `text/plain`).
- ⚠️ **Absence de journalisation des erreurs cURL.** `curl_exec()` ignore la réponse et n'enregistre pas l'erreur éventuelle, rendant le diagnostic difficile en cas de panne SMTP.【F:contact-handler.php†L159-L172】  
  ➤ Vérifier `curl_exec`, logger `curl_error` et retourner un message utilisateur cohérent.
- ⚡ **Cookie de langue régénéré à chaque requête.** `setcookie('lang', …)` est appelé systématiquement, même si la valeur n'a pas changé, invalidant l'en-tête `Cache-Control` et empêchant certains reverse-proxy de mettre la page en cache.【F:i18n.php†L41-L58】  
  ➤ Ne réécrire le cookie qu'en cas de changement effectif.
- ✅ **Chargement JSON de traductions sans gestion d'erreur.** `file_get_contents()` sur `/lang/$lang.json` ne vérifie pas l'existence du fichier, ce qui génère un warning PHP et un tableau vide en cas de langue non déployée.【F:i18n.php†L87-L105】  
  ➤ Ajouter un contrôle (`is_file`/`json_last_error`) et retourner une réponse HTTP 500 claire.

## Pistes transverses

- Industrialiser la chaîne front (build CSS/JS, hash statique) pour limiter le travail au runtime.
- Mutualiser la gestion du consentement et des préférences utilisateurs (motion, data, langue) pour réduire la duplication de logique.
- Mettre en place une matrice de tests d'accessibilité (Keyboard, Screen Readers) et de performance (Lighthouse CI) sur les pages clés (index, boutique, contact).

