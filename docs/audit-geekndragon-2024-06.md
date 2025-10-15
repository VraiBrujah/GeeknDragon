# Audit du site Geek & Dragon

## 1. Résumé exécutif
- Boutique e-commerce PHP sans framework adossée à Snipcart pour la caisse et la gestion de stock, déployée via cPanel avec synchronisation `rsync`.【F:README.md†L5-L145】
- Configuration applicative entièrement pilotée par variables d'environnement pour SMTP, Snipcart et authentification administrateur, ce qui facilite la séparation des secrets et du code.【F:config.php†L24-L61】
- Les points de vigilance concernent surtout la surface d'administration (absence de limitation d'essais), la gestion des journaux exposés dans `logs/`, et l'impact performance des appels temps réel vers l'API Snipcart depuis `product.php` à chaque requête publique.【F:admin-products.php†L8-L200】【F:contact-handler.php†L111-L225】【F:product.php†L1-L240】

## 2. Méthodologie
Lecture du code PHP côté serveur (`config.php`, `bootstrap.php`, `admin-products.php`, `contact-handler.php`, `product.php`, `head-common.php`) ainsi que de la documentation projet. Les constats portent sur la sécurité, la conformité et la performance à partir de cette base statique.

## 3. Points positifs
- Secret Snipcart et identifiants SMTP chargés côté serveur via `getEnvironmentVariable`, limitant les risques d'exposition accidentelle dans le dépôt.【F:config.php†L24-L61】
- Interface d'administration protégée par mot de passe haché, sessions sécurisées (`HttpOnly`, `SameSite=Strict`) et protections CSRF sur les formulaires.【F:admin-products.php†L9-L188】
- Gestionnaire de contact avec validation systématique des entrées (`filter_input`, longueurs maximales) et journalisation des erreurs pour faciliter le suivi.【F:contact-handler.php†L33-L210】
- Gabarit `head-common.php` qui prépare le terrain pour la conformité RGPD via CMP, anonymisation IP et chargements conditionnels de Google Analytics.【F:head-common.php†L11-L125】

## 4. Risques et améliorations prioritaires
### 4.1 Administration sans limitation d'essais ni traçabilité
Le formulaire `admin-products.php` autorise un nombre illimité de tentatives de mot de passe sans délai ni verrouillage, et aucune alerte n'est envoyée en cas d'échec répété.【F:admin-products.php†L40-L188】 Mettre en place :
- un délai progressif (`sleep` exponentiel) ou un compteur d'échecs stocké en session/IP,
- une journalisation d'audit (fichier hors webroot) pour suivre les connexions et erreurs,
- idéalement une authentification multifacteur ou un réseau restreint pour l'interface.

### 4.2 Journaux d'erreurs accessibles depuis le web
`contact-handler.php` écrit les logs de succès/erreur dans `logs/contact_errors.log` et `logs/contact_success.log`, répertoire situé dans la racine publique du site.【F:contact-handler.php†L115-L225】 Sans protection serveur, ces fichiers peuvent être téléchargés et révéler des adresses e-mail, IP et messages clients. Actions recommandées :
- déplacer le dossier `logs/` hors du répertoire public, ou
- ajouter une règle serveur (`.htaccess` ou configuration Nginx) bloquant tout accès HTTP à `logs/`.

### 4.3 Requêtes Snipcart synchrones sur chaque page produit
Chaque visite sur `product.php` déclenche un appel cURL vers l'API Snipcart pour récupérer le stock courant, avec un délai d'expiration de 2 secondes seulement.【F:product.php†L115-L147】 En cas de latence réseau ou d'indisponibilité API, cela ralentit le chargement produit voire retourne un stock vide. Pistes :
- mettre en cache le stock (fichier ou mémoire) avec TTL court (ex. 60 s) et retours gracieux,
- déporter la synchronisation dans une tâche planifiée (cron ou webhook déjà présent) qui alimente `data/stock.json`.

### 4.4 Accès disque répété et fragile dans `head-common.php`
Les feuilles de style sont incluses avec `filemtime(__DIR__.'/css/...')` pour buster le cache, mais chaque requête génère plusieurs accès disque et produit des warnings PHP si le fichier est manquant lors d'un déploiement incrémental.【F:head-common.php†L77-L124】 Centraliser ce cache-busting (manifest JSON généré à build) ou encapsuler `filemtime` avec `@` et une valeur par défaut réduira les erreurs et le coût I/O.

### 4.5 Chargement intégral des catalogues JSON par requête
Les pages produit chargent intégralement `data/products.json` et `data/stock.json` avant de filtrer l'identifiant demandé.【F:product.php†L6-L24】 Sur un catalogue croissant, cela augmente le temps CPU et la consommation mémoire. Prévoir un indexation (ex. stockage par fichier produit ou base légère) ou un cache APCu/opcache partagé.

## 5. Améliorations secondaires
- Ajouter une purge automatique des fichiers CSV uploadés échoués et des traces dans `data/` pour limiter les résidus sensibles.【F:admin-products.php†L118-L188】
- Prévoir une politique de conservation des journaux (`logrotate`) afin d'éviter la saturation disque et respecter le RGPD (suppression des données personnelles après X jours).【F:contact-handler.php†L115-L225】
- Documenter et tester la politique CSP mentionnée dans le commentaire (`.htaccess` requis) afin d'assurer qu'elle couvre bien Snipcart, Stripe et la CMP sans ouvertures excessives.【F:head-common.php†L47-L124】

## 6. Prochaines étapes suggérées
1. Sécuriser immédiatement `logs/` et ajouter une limitation d'essais côté admin.
2. Concevoir une couche de cache pour le stock Snipcart afin de réduire les dépendances temps réel.
3. Mettre en place un plan de monitoring (alertes sur les erreurs cURL, tentatives admin) et une revue périodique des journaux.
4. Industrialiser le busting d'actifs (manifest) et la gestion des catalogues pour préparer la montée en charge.

