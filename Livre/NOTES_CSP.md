# 🔒 Notes sur la Content Security Policy (CSP)

## Problème Rencontré sur Hostpapa

### Erreur Console

```
Refused to load the script 'https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js'
because it violates the following Content Security Policy directive:
"script-src 'self' 'unsafe-inline' 'unsafe-eval'
https://cdn.snipcart.com
https://js.stripe.com
https://www.googletagmanager.com
https://cdn.consentmanager.net
https://c.delivery.consentmanager.net".

Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.
```

### Analyse du Problème

**CSP active sur Hostpapa** : Le serveur de production applique une politique de sécurité stricte qui autorise uniquement :
- ✅ Scripts provenant du même domaine (`'self'`)
- ✅ Scripts inline (`'unsafe-inline'`)
- ✅ Évaluation dynamique (`'unsafe-eval'`)
- ✅ CDN spécifiques : Snipcart, Stripe, Google Tag Manager, Consentmanager

**CDN bloqué** : `cdn.jsdelivr.net` n'est **PAS** dans la liste blanche → chargement refusé.

---

## ✅ Solution Implémentée

### 1. Téléchargement Local de marked.js

```bash
curl -L https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js \
  -o Livre/assets/js/marked.min.js
```

**Résultat** : Fichier de **35 KB** (`marked.min.js`) téléchargé dans `assets/js/`

### 2. Modification de index.php

**Avant (CDN)** :
```html
<script src="https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js"></script>
```

**Après (Local)** :
```php
<script src="assets/js/marked.min.js?v=<?= filemtime(__DIR__.'/assets/js/marked.min.js') ?>"></script>
```

**Avantages** :
- ✅ Conforme à la CSP stricte (`script-src 'self'`)
- ✅ Cache-busting via `filemtime()` (mise à jour automatique)
- ✅ Aucune dépendance externe
- ✅ Fonctionne offline et en production

---

## 🔐 Recommandations CSP pour ce Projet

### Politique Idéale pour Livre/

Si vous avez accès à la configuration `.htaccess` du dossier `Livre/`, vous pouvez définir une CSP spécifique encore plus stricte :

```apache
<IfModule mod_headers.c>
  # CSP ultra-stricte pour le visualiseur de manuscrits
  Header set Content-Security-Policy "\
    default-src 'none'; \
    script-src 'self'; \
    style-src 'self' 'unsafe-inline'; \
    img-src 'self' data:; \
    font-src 'self'; \
    connect-src 'self'; \
    base-uri 'self'; \
    form-action 'self'; \
    frame-ancestors 'none'"
</IfModule>
```

**Explication** :
- `default-src 'none'` : Tout bloqué par défaut
- `script-src 'self'` : Scripts uniquement depuis le même domaine
- `style-src 'self' 'unsafe-inline'` : CSS local + inline (pour styles dynamiques)
- `img-src 'self' data:` : Images locales + data URIs
- `connect-src 'self'` : Fetch/XHR uniquement vers api.php local
- `frame-ancestors 'none'` : Pas d'iframe (protection clickjacking)

---

## 📋 Checklist de Compatibilité CSP

Pour tout nouveau composant ajouté au visualiseur :

- [ ] **Bibliothèques JavaScript** : Télécharger en local dans `assets/js/`
- [ ] **Feuilles de style CSS** : Héberger dans `assets/css/`
- [ ] **Polices** : Auto-hébergées (pas de Google Fonts CDN)
- [ ] **Images** : Stockées localement (pas de hotlink externe)
- [ ] **API externes** : ❌ Interdites (tout doit être local)

---

## 🛠️ Outils pour Tester la CSP

### Console Navigateur (F12)

Ouvrir la console et vérifier :
- ✅ Aucune erreur CSP
- ✅ Toutes les ressources chargées depuis `'self'`

### En-têtes HTTP

Vérifier les headers reçus :

```bash
curl -I https://geekndragon.com/Livre/
```

Rechercher :
```
Content-Security-Policy: script-src 'self' ...
```

---

## 📦 Fichiers Locaux Requis

| Fichier | Taille | Source | Statut |
|---------|--------|--------|--------|
| `marked.min.js` | 35 KB | jsdelivr.net | ✅ Téléchargé |
| `viewer.css` | 11 KB | Créé | ✅ Local |
| `viewer.js` | 13 KB | Créé | ✅ Local |

**Total assets** : ~59 KB (très léger !)

---

## 🚀 Déploiement sur Hostpapa

### Fichiers à Uploader

```
Livre/
├── index.php
├── api.php
├── .htaccess
├── assets/
│   ├── css/viewer.css
│   └── js/
│       ├── viewer.js
│       └── marked.min.js  ← IMPORTANT !
└── [VosLivres]/
```

### Commande Upload FTP (exemple)

```bash
# Via lftp (Linux/Mac)
lftp -u votreuser,votrepass ftp.geekndragon.com
> mirror -R Livre/ /public_html/Livre/
> quit
```

### Vérification Post-Déploiement

1. **Console navigateur** (F12) : Aucune erreur CSP
2. **Test chargement** : Page s'affiche correctement
3. **Test parsing** : Markdown rendu avec formatage
4. **Test navigation** : Onglets et ancres fonctionnent

---

## 📖 Ressources CSP

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [Report URI CSP Builder](https://report-uri.com/home/generate)

---

## 🔄 Historique des Modifications

| Date | Modification | Raison |
|------|--------------|--------|
| 2025-10-06 | Migration CDN → Local pour marked.js | Erreur CSP sur Hostpapa |
| 2025-10-06 | Ajout cache-busting `filemtime()` | Éviter cache navigateur |

---

**Version** : 1.1.0 (Post-CSP Fix)
**Statut** : ✅ Production Ready
**Compatibilité** : Hostpapa ✅ | Localhost ✅ | CSP Stricte ✅
