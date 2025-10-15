# Audit du site Geek & Dragon

## Résumé exécutif
- Le socle technique est soigné : l'en-tête mutualisé gère la plupart des balises SEO, la conformité tracking via CMP et le chargement conditionnel de Google Analytics, ce qui réduit les risques de conformité et de duplication de configuration.【F:head-common.php†L24-L195】
- L'expérience d'accueil est ambitieuse mais lourde : la page d'accueil charge immédiatement une vidéo plein écran et prépare huit autres arrière-plans, ce qui peut fortement pénaliser les utilisateurs mobiles ou à faible bande passante.【F:index.php†L35-L66】
- L'internationalisation est incomplète côté front : le module i18n accepte quatre langues, mais les scripts d'interface ne reconnaissent que le français et l'anglais, empêchant l'activation des traductions supplémentaires.【F:head-common.php†L134-L140】【F:js/app.js†L161-L176】

## Points forts
- **SEO & métadonnées** : les pages héritent automatiquement de la balise canonique, des métadonnées Open Graph/Twitter et d'un schéma `Store`, limitant les risques de contenu dupliqué et améliorant le partage sur les réseaux sociaux.【F:head-common.php†L70-L195】
- **Conformité & analytics** : le script CMP est prioritaire et Google Analytics n'est injecté qu'en présence d'un identifiant, avec anonymisation IP et consentement par défaut refusé, ce qui répond aux attentes RGPD/CCPA.【F:head-common.php†L32-L121】
- **Formulaires sécurisés** : le gestionnaire de contact applique filtrage, contrôle CSRF, limites de longueur et journalisation des erreurs avant d'envoyer l'email via l'API, réduisant les risques d'injection et de spam automatisé.【F:contact-handler.php†L1-L161】
- **Accessibilité structurée** : le header expose un lien "passer au contenu", des libellés `aria-label` cohérents et ferme le menu mobile en respectant l'état `aria-expanded`, ce qui facilite la navigation clavier et lecteur d'écran.【F:header.php†L143-L256】【F:js/app.js†L462-L504】

## Risques et recommandations prioritaires

### Performance
- **Réduire la dette vidéo du hero** : l'arrière-plan vidéo précharge un MP4 principal et prépare huit variantes, tandis que le script JavaScript anticipe chaque prochaine vidéo dix secondes avant la fin. Cela peut représenter plusieurs dizaines de mégaoctets téléchargés sur mobile. Prévoir une image/poster statique pour les pointeurs grossiers ou les connexions lentes, et restreindre la liste de vidéos chargées côté client.【F:index.php†L35-L39】【F:js/hero-videos.js†L15-L198】
- **Différer les modules non critiques** : `hero-videos.js` est exécuté au `DOMContentLoaded`. Évaluer un chargement conditionnel (IntersectionObserver ou import() différé) afin de retarder l'initialisation tant que la section n'est pas visible, surtout sur les pages où la hero est sous le pli.【F:js/hero-videos.js†L15-L198】

### Internationalisation & UX
- **Aligner la liste des langues** : mettre à jour `LANGS` dans `js/app.js` et exposer les boutons nécessaires pour l'espagnol et l'allemand, sinon les traductions chargées par `I18nManager` ne seront jamais sélectionnées et les utilisateurs resteront bloqués en français/anglais.【F:head-common.php†L134-L140】【F:js/app.js†L161-L176】【F:header.php†L166-L232】
- **Synchroniser le sélecteur mobile** : le menu mobile n'affiche que deux drapeaux, identique à la version desktop. Après ajout des langues manquantes, prévoir une représentation textuelle (ex. `aria-live` ou libellés visibles) pour éviter que les visiteurs dépendant des lecteurs d'écran ne se fient uniquement aux icônes de drapeaux.【F:header.php†L166-L232】

### SEO & Contenu
- **Vérifier la hiérarchie éditoriale** : la page d'accueil enchaîne plusieurs sections riches (produits phares, actualités, témoignages). Assurer la cohérence des balises `h2`/`h3` pour chaque bloc nouvellement ajouté (ex. CTA contact) afin de conserver une structure accessible et SEO-friendly. Ajouter des résumés uniques aux actualités pour éviter le contenu dupliqué si plusieurs articles sont listés à terme.【F:index.php†L68-L188】

### Sécurité & exploitation
- **Anti-spam complémentaire** : malgré les protections en place, le formulaire de contact ne dispose pas de mécanisme de limitation (honeypot ou throttling). Ajouter un champ invisible, un délai minimum ou une vérification côté serveur du rythme d'envoi pour réduire le spam automatisé restant.【F:contact-handler.php†L18-L161】
- **Journalisation centralisée** : les erreurs de contact sont consignées dans `logs/contact_errors.log`. Vérifier que le dossier n'est pas servi publiquement et prévoir une rotation/surveillance (fail2ban, stack logging) pour suivre les tentatives répétées.【F:contact-handler.php†L83-L156】

### Maintenance & dette technique
- **Factoriser les contenus d'actualités** : les cartes d'actualités sont codées en dur dans `index.php`. Pour simplifier la maintenance, déplacer ces blocs vers des partiels ou un fichier de données (JSON/YAML) partagé avec `actualites/` afin d'éviter les divergences lors de futures mises à jour.【F:index.php†L142-L188】
- **Automatiser la génération de la grille produits** : la section "shop-grid" repose sur un conteneur vide alimenté par JavaScript. Documenter (ou intégrer) un fallback côté serveur pour conserver un minimum de contenu indexable si le script n'est pas exécuté (SEO + accessibilité progressive).【F:index.php†L68-L88】【F:footer.php†L130-L182】

## Prochaines étapes suggérées
1. Prototyper une version légère de la hero (image fixe + bouton lancer la vidéo) et mesurer l'impact sur LCP avec Lighthouse mobile.
2. Étendre l'internationalisation (JS + UI) et valider les traductions supplémentaires via un test utilisateur ciblé.
3. Mettre en place un mécanisme anti-spam discret (honeypot ou score heuristique) et surveiller les logs pour ajuster les seuils.
4. Formaliser un guide de contribution décrivant comment ajouter une actualité ou un produit, afin de limiter les modifications directes dans `index.php`.
