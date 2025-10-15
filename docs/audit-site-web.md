# Audit du site Geek & Dragon

## Résumé exécutif
- Les fondations techniques sont solides (mise en cache des assets, CMP, internationalisation), mais plusieurs choix impactent encore l'expérience utilisateur en première visite et la conformité SEO.
- Les scripts frontaux sont monolithiques, avec désactivation globale d'ESLint et absence de découpage fonctionnel, ce qui augmente le coût de maintenance et le risque de régressions.
- La gestion du contenu dépend fortement de JavaScript (traductions, grille produit), sans garde-fous pour les environnements à JS limité, ce qui fragilise accessibilité et référencement.

## Performance
- **Préchargement vidéo dans le `<body>`** : le lien `<link rel="preload" as="video">` est injecté dans la section Hero, donc après le démarrage du rendu. Les navigateurs ignorent parfois ce hint hors du `<head>`, ce qui annule l'optimisation et crée un coût parsing supplémentaire. Déplacer ce préchargement dans `$extraHead` (ou le head commun) et ajouter un `poster` statique au lecteur améliorerait le Largest Contentful Paint.【F:index.php†L35-L43】
- **Blocage du rendu par l'I18n** : le module ES chargé en tête attend le chargement des traductions depuis `/lang/`. Sur connexion lente, cela retarde la peinture des textes (ils s'affichent dans la langue par défaut puis sont remplacés). Précharger le JSON critique côté PHP (server-side render) ou fournir un `link rel="preload" as="fetch" crossorigin` pour la langue courante réduirait ce flash de contenu et la dépendance réseau initiale.【F:head-common.php†L126-L171】
- **Chargement de la grille produits** : la div `.shop-grid` est vide côté serveur. Sans JS, la section reste blanche et les Core Web Vitals (INP/LCP) se dégradent car le contenu majeur n'est pas indexable. Fournir au moins un squelette HTML server-side ou un `<noscript>` fallback permettrait d'éviter un LCP purement JS.【F:index.php†L68-L92】

## Accessibilité
- **Icônes décoratives non masquées** : les drapeaux de changement de langue et les icônes Snipcart portent `alt=""` mais ne sont pas marqués `aria-hidden="true"`. Ces images vides sont encore exposées aux lecteurs d'écran qui annoncent « graphic » sans description. Ajouter `role="presentation"` ou `aria-hidden` clarifie leur caractère décoratif.【F:header.php†L167-L185】
- **Navigation dépendante du survol** : les sous-menus potentiels utilisent `group-hover` sans alternative clavier. Envisager un déclenchement au focus (`:focus-within`) ou un bouton explicite améliore la navigation clavier et touche tactile.【F:header.php†L121-L139】
- **Animation vidéo sans contrôle** : la section Hero s'appuie sur une vidéo en arrière-plan sans commandes ni alternative. Prévoir un bouton « Pause animation » ou respecter `prefers-reduced-motion` en affichant une image statique limite la fatigue visuelle et respecte WCAG 2.3.1.【F:index.php†L35-L43】

## SEO & Contenu
- **Meta description optionnelle vide** : la description dépend des traductions, mais la valeur de repli reste une chaîne vide. Fournir un fallback pertinent en PHP garantit qu'une description minimale est toujours livrée, même si la traduction manque.【F:index.php†L5-L7】【F:head-common.php†L49-L53】
- **Dépendance JS pour les actualités** : la page d'accueil référence des articles via des liens `langUrl()` mais le contenu résumé est statique. S'assurer que les pages associées disposent de balises `hreflang` cohérentes pour toutes les langues exposées par l'I18n afin d'éviter le contenu dupliqué et de profiter de la navigation multilingue déclarée dans `availableLangs`.【F:head-common.php†L134-L140】【F:index.php†L146-L167】
- **Schema.org incomplet** : le JSON-LD déclaré ne fournit ni horaires ni téléphone/adresse complète. Ajouter `openingHoursSpecification`, `contactPoint` ou `sameAs` supplémentaires (YouTube/TikTok si existants) enrichira les SERP et la découverte locale.【F:head-common.php†L174-L195】

## Sécurité & Conformité
- **Construction d'URL à partir de `HTTP_HOST`** : le calcul du canonique utilise directement `$_SERVER['HTTP_HOST']`. Sans validation, un en-tête Host forgé pourrait générer des URL malicieuses dans les métadonnées. Normaliser l'hôte (liste blanche, `filter_var`) ou s'appuyer sur la configuration d'application réduit ce risque.【F:head-common.php†L55-L75】
- **Scripts inline non CSP-friendly** : plusieurs `<script>` inline (debug global, GA, module I18n) exigent `unsafe-inline` dans la CSP HTML. Pour renforcer la sécurité, externaliser ces scripts ou ajouter des `nonce` dynamiques alignés avec la politique serveur permettrait de réactiver une CSP stricte.【F:head-common.php†L37-L171】
- **Utilisation d'`eval` dans la détection navigateur** : le script de compatibilité appelle `eval` pour tester des fonctionnalités. Même si le code est interne, réduire ces appels (par exemple via `new Function`) ou basculer vers un test de parsing plus sûr limite les surfaces d'attaque XSS en cas d'injection dans ce fichier.【F:includes/browser-compatibility-check.php†L34-L76】

## Maintenabilité
- **Désactivation globale d'ESLint** : `js/app.js` commence par `/* eslint-disable */`, ce qui neutralise toutes les règles. Réactiver ESLint ou le restreindre à des sections ciblées aidera à prévenir les régressions et à harmoniser le style.【F:js/app.js†L34-L69】
- **Script monolithique** : `app.js` rassemble utilitaires, logique Snipcart, navigation et I18n. Migrer vers des modules ES distincts (navigation, panier, utilitaires) simplifiera les tests unitaires et autorisera le code-splitting via la chaîne de build existante (`scripts/build-complete.js`).【F:js/app.js†L34-L189】
- **Gestion JS vs. PHP redondante** : de nombreuses chaînes traduites sont présentes dans PHP et rechargées côté client. Harmoniser la source de vérité (par exemple générer les attributs `data-i18n` à partir d'un même catalogue) évitera les divergences entre rendu initial et mise à jour dynamique.【F:index.php†L41-L164】【F:head-common.php†L126-L171】

## Recommandations prioritaires
1. Sécuriser la génération d'URL canoniques et réactiver une CSP stricte sans `unsafe-inline` (impact sécurité/SEO).【F:head-common.php†L55-L121】
2. Délivrer la grille produits et les textes clés côté serveur pour réduire la dépendance JS et améliorer le LCP.【F:index.php†L35-L92】
3. Segmenter `app.js`, réactiver ESLint et mettre en place une intégration continue qui exécute `npm run lint` pour maîtriser la dette front-end.【F:js/app.js†L34-L189】
4. Documenter et enrichir les données structurées (JSON-LD) ainsi qu'un fallback méta-description pour toutes les langues.【F:index.php†L5-L7】【F:head-common.php†L49-L195】
5. Ajouter des attributs d'accessibilité (`aria-hidden`, `prefers-reduced-motion`) sur les médias décoratifs et animés pour respecter WCAG AA.【F:index.php†L35-L43】【F:header.php†L167-L185】
