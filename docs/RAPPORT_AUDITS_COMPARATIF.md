# Rapport Comparatif des Audits - Geek & Dragon
**Date** : 15 octobre 2025
**Répertoire** : E:\GitHub\GeeknDragon

---

## Résumé Exécutif

Six audits successifs ont été réalisés entre avril 2024 et mars 2025, identifiant des problématiques récurrentes dans trois domaines critiques :
1. **Compatibilité PHP** : Utilisation de filtres dépréciés (FILTER_SANITIZE_STRING)
2. **Sécurité & Maintenance** : Logs accessibles, encodage SendGrid défaillant
3. **Performance & Accessibilité** : Chargement vidéo lourd, dépendance JavaScript excessive

**État actuel** : Plusieurs problèmes critiques **persistent** malgré les recommandations répétées.

---

## 1. Problèmes Critiques Récurrents

### 1.1 Compatibilité PHP - FILTER_SANITIZE_STRING (🔴 NON RÉSOLU)

**Mentionné dans** : audit-2024-04.md, audit-2025-02.md, site-audit-2025-03.md

**Constat actuel** :
- Le filtre déprécié est **toujours présent** dans `bootstrap.php:98-127`
- Utilisé dans `gd_detect_request_scheme()` pour nettoyer les en-têtes proxy
- Bloquera la migration vers PHP 8.3+

**Impact** :
- Erreur fatale lors d'une montée de version PHP
- Casse la détection du schéma HTTPS/HTTP
- Affecte tous les URLs absolus générés (notamment pour Snipcart)

**Recommandation originale** :
```php
// Remplacer par :
filter_var(..., FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH)
// Ou une whitelist stricte :
in_array($proto, ['http','https'], true)
```

**Statut** : ⚠️ **Urgent - Bloquant pour évolution**

---

### 1.2 Encodage SendGrid - Contenu Dégradé (🔴 NON RÉSOLU)

**Mentionné dans** : audit-2025-02.md, site-audit-2025-03.md

**Constat actuel** :
- `contact-handler.php:145-156` applique toujours `htmlspecialchars()` sur le payload JSON SendGrid
- Les accents et apostrophes arrivent encodés (`&eacute;`, `&rsquo;`) dans les emails

**Impact** :
- Mauvaise expérience utilisateur (emails illisibles)
- Non-respect des standards SMTP UTF-8
- Perte de confiance client

**Recommandation originale** :
- Supprimer `htmlspecialchars` du payload JSON
- Laisser SendGrid gérer les valeurs brutes UTF-8
- Conserver l'échappement uniquement pour affichage HTML

**Statut** : ⚠️ **Urgent - Affecte tous les contacts clients**

---

### 1.3 Sécurité des Logs (🟢 RÉSOLU)

**Mentionné dans** : audit-geekndragon-2024-06.md, site-audit-2025-03.md

**Constat actuel** :
- Le dossier `logs/` dispose maintenant d'un `.htaccess` protecteur
- Configuration : `Require all denied` + `Options -Indexes`

**Statut** : ✅ **Résolu**

---

### 1.4 Observabilité Snipcart - Logs Désactivés Globalement (🟡 PARTIELLEMENT RÉSOLU)

**Mentionné dans** : audit-2025-02.md

**Constat actuel** :
- `snipcart-init.php:200-221` neutralise toujours `console.log` et `console.warn` globalement
- Bloque **tous** les messages contenant "snipcart", "gtag", "GTag"
- Aucune condition DEBUG_MODE ou environnement

**Impact** :
- Impossible de diagnostiquer les erreurs Stripe/Snipcart en production
- Perte de signaux critiques en développement
- Peut masquer des erreurs d'autres bibliothèques

**Recommandation originale** :
```javascript
if (!window.DEBUG_MODE && location.hostname.includes('.com')) {
  // Neutraliser uniquement en production
}
```

**Statut** : ⚠️ **Moyen - Complique le support client**

---

## 2. Problèmes de Performance

### 2.1 Chargement Vidéo Hero Lourd (🔴 NON RÉSOLU)

**Mentionné dans** : audit-geekndragon.md, audit-site-web.md

**Constat actuel** :
- `index.php:37-38` charge 1 vidéo principale + 8 alternatives (~plusieurs dizaines de Mo)
- `<link rel="preload">` mal positionné (dans `<body>` au lieu de `<head>`)
- Aucune détection de bande passante ou device mobile

**Impact** :
- Dégradation sévère du LCP (Largest Contentful Paint) sur mobile
- Surcoût réseau injustifié pour utilisateurs 3G/4G
- HTML invalide (preload dans body ignoré par navigateurs)

**Recommandations originales** :
1. Déplacer `<link rel="preload">` dans `head-common.php` via `$extraHead`
2. Ajouter un `poster` statique pour mobile (`matchMedia('(pointer: coarse)')`)
3. Limiter à 2-3 vidéos maximum ou implémenter lazy-loading

**Statut** : ⚠️ **Urgent - Affecte conversion mobile**

---

### 2.2 Cache-Busting via filemtime() Répétitif (🔴 NON RÉSOLU)

**Mentionné dans** : audit-2025-02.md, site-audit-2025-03.md

**Constat actuel** :
- `head-common.php:78-92` exécute `filemtime()` sur 7+ fichiers CSS à chaque requête
- Aucun système de cache (APCu/opcache) ou manifest de build
- Multiplicité d'accès disque sous charge

**Impact** :
- Latence accrue en production sous forte charge
- Coût I/O inutile sur serveur

**Recommandation originale** :
```php
// Option 1 : Manifest de build
$version = json_decode(file_get_contents('build-manifest.json'), true)['css/styles.css'];

// Option 2 : Memoization simple
static $cache = [];
if (!isset($cache[$file])) {
    $cache[$file] = file_exists($file) ? filemtime($file) : time();
}
```

**Statut** : 🟡 **Moyen - Optimisation importante**

---

## 3. Accessibilité & SEO

### 3.1 Dépendance JavaScript pour Contenu Critique (🔴 NON RÉSOLU)

**Mentionné dans** : audit-geekndragon.md, audit-site-web.md

**Constat actuel** :
- La grille produits (`index.php:68-92`) est vide côté serveur
- Les traductions sont chargées uniquement par JavaScript
- Aucun fallback `<noscript>` ou rendu serveur

**Impact** :
- Mauvais référencement (contenu non indexable)
- Dégradation pour utilisateurs JS désactivé
- Core Web Vitals affectés (INP, LCP)

**Recommandations originales** :
1. Générer un squelette HTML côté PHP pour les produits phares
2. Ajouter `<noscript>` avec liens directs vers boutique
3. Précharger le JSON langue critique avec `<link rel="preload" as="fetch">`

**Statut** : ⚠️ **Moyen - Affecte SEO**

---

### 3.2 Internationalisation Incomplète (🔴 NON RÉSOLU)

**Mentionné dans** : audit-geekndragon.md

**Constat actuel** :
- `head-common.php:134-140` charge 4 langues (fr, en, es, de)
- `js/app.js` et `header.php` ne supportent que fr/en
- Impossible d'activer es/de côté interface

**Impact** :
- Traductions chargées mais inutilisables
- Confusion utilisateur
- Gâchis de ressources réseau

**Recommandation originale** :
- Aligner `LANGS` dans `js/app.js` avec les 4 langues
- Ajouter les boutons de langue manquants dans `header.php`

**Statut** : 🟡 **Faible - Mais incohérent**

---

## 4. Qualité de Code

### 4.1 Désactivation Globale ESLint (🔴 NON RÉSOLU)

**Mentionné dans** : audit-site-web.md

**Constat actuel** :
- `js/app.js`, `js/hero-videos.js`, `js/i18n-manager.js` contiennent `/* eslint-disable */`
- Aucune règle de linting appliquée
- Code monolithique sans découpage modulaire

**Impact** :
- Risque de régressions silencieuses
- Difficulté de maintenance à long terme
- Manque de cohérence stylistique

**Recommandations originales** :
1. Réactiver ESLint avec configuration progressive
2. Segmenter `app.js` en modules ES (navigation, panier, i18n)
3. Ajouter `npm run lint` dans CI/CD

**Statut** : 🟡 **Moyen - Dette technique**

---

## 5. Points Forts Confirmés

Les audits ont également souligné plusieurs points positifs **maintenus** :

✅ **Sécurité CSRF & Sessions** : `admin-products.php` applique tokens CSRF stricts, sessions sécurisées
✅ **Validation Formulaire Contact** : Filtrage rigoureux, anti header-injection
✅ **Configuration Externalisée** : `config.php` gère tous les secrets via variables d'environnement
✅ **SEO Structuré** : Métadonnées Open Graph, schéma Store, canoniques
✅ **Accessibilité Header** : Navigation clavier, `aria-label` cohérents, lien "passer au contenu"

---

## 6. Plan d'Action Priorisé

### 🔴 Urgence Haute (< 7 jours)
1. **Corriger FILTER_SANITIZE_STRING** dans `bootstrap.php:98-127`
   - Impact : Bloquant pour PHP 8.3+
   - Effort : 1-2h (remplacement + tests)

2. **Supprimer htmlspecialchars() dans SendGrid** (`contact-handler.php:145-156`)
   - Impact : Qualité emails clients
   - Effort : 30 min

3. **Déplacer preload vidéo dans head** (`index.php:37` → `head-common.php`)
   - Impact : Performance LCP
   - Effort : 15 min

### ⚠️ Urgence Moyenne (< 30 jours)
4. **Implémenter cache manifest pour assets** (`head-common.php:78-92`)
   - Générer `build-manifest.json` lors du build
   - Effort : 2-3h

5. **Ajouter condition DEBUG_MODE pour logs Snipcart** (`snipcart-init.php:200-221`)
   - Effort : 1h

6. **Optimiser chargement vidéo hero**
   - Ajouter détection mobile + poster statique
   - Limiter à 2-3 vidéos
   - Effort : 3-4h

### 🟡 Amélioration Continue (< 90 jours)
7. **Générer grille produits côté serveur** (SEO)
8. **Compléter internationalisation** (es/de)
9. **Réactiver ESLint progressivement**
10. **Segmenter app.js en modules**

---

## 7. Métriques de Suivi

| Problématique | Audits concernés | État | Délai résolution |
|--------------|------------------|------|------------------|
| FILTER_SANITIZE_STRING | 3/6 audits | 🔴 Ouvert | - |
| Encodage SendGrid | 2/6 audits | 🔴 Ouvert | - |
| Logs accessibles | 2/6 audits | ✅ Fermé | Sept. 2024 |
| Vidéo hero lourde | 2/6 audits | 🔴 Ouvert | - |
| Cache filemtime | 2/6 audits | 🔴 Ouvert | - |
| Logs Snipcart globaux | 1/6 audits | 🟡 Partiel | - |
| Grille JS-only | 2/6 audits | 🔴 Ouvert | - |

---

## 8. Recommandations Stratégiques

1. **Automatiser les audits** : Intégrer Lighthouse CI, PHP_CodeSniffer dans pipeline
2. **Tester compatibilité PHP 8.3** : Avant migration serveur obligatoire
3. **Monitoring erreurs** : Sentry/Rollbar pour capturer problèmes Snipcart en production
4. **Revue trimestrielle** : Valider fermeture des tickets d'audit

---

## Conclusion

Les audits successifs démontrent une **cohérence architecturale forte** (sécurité, SEO) mais révèlent des **blocages d'évolution critiques** :
- La migration PHP 8.3 est **impossible** sans corriger les filtres dépréciés
- L'expérience utilisateur **mobile** est pénalisée par le chargement vidéo
- La **qualité des emails** reste dégradée depuis plusieurs mois

**Prochaine étape** : Traiter les 3 problèmes urgents en priorité absolue (estimation totale : 4h de développement).
