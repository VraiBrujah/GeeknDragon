# 🚀 Checklist de Déploiement sur Hostpapa

## 📋 Pré-Déploiement

### Vérifications Locales

- [ ] **API fonctionne** : `php -r '$_GET["action"] = "list"; include "api.php";'`
- [ ] **Fichiers présents** : Tous les fichiers listés ci-dessous
- [ ] **Permissions correctes** : Fichiers lisibles (644), dossiers exécutables (755)
- [ ] **marked.min.js présent** : `assets/js/marked.min.js` (35 KB)
- [ ] **Tests navigateur** : Page fonctionne en local sans erreurs console

---

## 📦 Fichiers à Uploader

### Fichiers Racine

```
Livre/
├── index.php              (3.5 KB)
├── api.php                (8.3 KB)
├── .htaccess              (1.5 KB)
├── .gitignore             (0.3 KB)
```

### Assets

```
assets/
├── css/
│   └── viewer.css         (11 KB)
└── js/
    ├── viewer.js          (13 KB)
    └── marked.min.js      (35 KB) ← CRITIQUE !
```

### Documentation (Optionnel)

```
Livre/
├── README.md              (15 KB)
├── GUIDE_RAPIDE.md        (8 KB)
├── ACCES.md               (5 KB)
├── ARCHITECTURE.md        (25 KB)
├── NOTES_CSP.md           (6 KB)
└── DEPLOIEMENT.md         (ce fichier)
```

### Vos Livres

```
Livre/
├── Eveil/
│   ├── 00_prologue.md
│   ├── 01_chapitre1.md
│   └── ...
└── [AutresLivres]/
    └── ...
```

---

## 🔧 Méthodes de Déploiement

### Option 1 : FTP avec FileZilla

1. **Connecter à Hostpapa**
   - Host : `ftp.geekndragon.com` (ou IP fournie)
   - Username : Votre nom d'utilisateur FTP
   - Password : Votre mot de passe FTP
   - Port : 21 (FTP) ou 22 (SFTP)

2. **Naviguer vers le dossier web**
   ```
   /public_html/Livre/
   ```

3. **Uploader tout le contenu**
   - Glisser-déposer le dossier `Livre/` complet
   - **ATTENTION** : Vérifier que `marked.min.js` est bien uploadé !

### Option 2 : FTP via Ligne de Commande (lftp)

```bash
# Installer lftp si nécessaire
# Windows : scoop install lftp
# Linux : sudo apt install lftp

# Se connecter
lftp -u votreuser ftp.geekndragon.com

# Commandes
> cd /public_html
> mirror -R Livre/ Livre/
> quit
```

### Option 3 : Git + Déploiement Automatique

Si vous avez configuré Git sur Hostpapa :

```bash
# Sur votre machine locale
cd E:\GitHub\GeeknDragon
git add Livre/
git commit -m "Ajout visualiseur de manuscrits avec CSP fix"
git push origin main

# Sur Hostpapa (SSH)
ssh votreuser@geekndragon.com
cd public_html
git pull origin main
```

---

## ✅ Post-Déploiement

### 1. Vérifier Upload Complet

**Via FTP** : Vérifier que tous les fichiers sont présents, notamment :
- ✅ `Livre/assets/js/marked.min.js` (35 KB)
- ✅ `Livre/assets/js/viewer.js` (13 KB)
- ✅ `Livre/assets/css/viewer.css` (11 KB)

### 2. Tester URL Principale

Ouvrir dans le navigateur :
```
https://geekndragon.com/Livre/
```

**Résultat attendu** :
- ✅ Page se charge sans erreur
- ✅ Onglets de livres visibles
- ✅ Navigation chapitres fonctionne
- ✅ Markdown parsé correctement

### 3. Vérifier Console Navigateur (F12)

**Console** :
- ✅ Aucune erreur JavaScript
- ✅ Aucune erreur CSP
- ✅ Ressources chargées depuis `'self'`

**Network** :
- ✅ `marked.min.js` : 200 OK
- ✅ `viewer.js` : 200 OK
- ✅ `viewer.css` : 200 OK
- ✅ `api.php?action=list` : 200 OK (JSON valide)

### 4. Tester Fonctionnalités

- [ ] **Changement de livre** : Cliquer sur onglets
- [ ] **Navigation chapitres** : Cliquer sur sidebar
- [ ] **Scroll fluide** : Ancres fonctionnent
- [ ] **Mémorisation** : Fermer/rouvrir → position conservée
- [ ] **Bouton retour haut** : Apparaît après scroll
- [ ] **Responsive mobile** : Tester sur smartphone

### 5. Vérifier API REST

**Test direct** :
```bash
# Liste des livres
curl https://geekndragon.com/Livre/api.php?action=list

# Chapitres d'un livre
curl "https://geekndragon.com/Livre/api.php?action=book&name=Eveil"

# Contenu d'un chapitre
curl "https://geekndragon.com/Livre/api.php?action=chapter&book=Eveil&file=00_prologue.md"
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": [...],
  "error": null,
  "timestamp": "2025-10-07T..."
}
```

---

## 🔒 Sécurité Post-Déploiement

### Vérifier CSP

Console navigateur : **Aucune erreur CSP** liée à marked.js

### Vérifier Permissions

```bash
# Via SSH sur Hostpapa
cd /public_html/Livre

# Fichiers : 644 (rw-r--r--)
find . -type f -exec chmod 644 {} \;

# Dossiers : 755 (rwxr-xr-x)
find . -type d -exec chmod 755 {} \;

# API exécutable
chmod 644 api.php
chmod 644 index.php
```

### Vérifier .htaccess Actif

```bash
# Tester si .htaccess fonctionne
curl -I https://geekndragon.com/Livre/

# Vérifier headers de sécurité
# Attendu :
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

---

## 🐛 Dépannage Déploiement

### Erreur 500 Internal Server Error

**Causes possibles** :
1. `.htaccess` mal configuré → Renommer temporairement `.htaccess_backup`
2. PHP version incompatible → Vérifier PHP 8.1+ actif
3. Permissions incorrectes → Voir section Permissions ci-dessus

**Solution** :
```bash
# Vérifier logs erreurs Hostpapa
tail -f ~/logs/error_log
```

### Page blanche

**Causes possibles** :
1. `index.php` corrompu pendant upload
2. Erreur PHP fatale

**Solution** :
1. Re-uploader `index.php`
2. Activer affichage erreurs temporairement :
   ```php
   // En haut de index.php (temporaire)
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

### Markdown non parsé

**Causes possibles** :
1. `marked.min.js` manquant ou corrompu
2. Erreur JavaScript

**Solution** :
1. Vérifier taille fichier : `ls -lh assets/js/marked.min.js` (doit être 35 KB)
2. Re-télécharger si nécessaire :
   ```bash
   curl -L https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js \
     -o assets/js/marked.min.js
   ```

### API ne répond pas

**Causes possibles** :
1. `api.php` manquant
2. Permissions incorrectes sur dossiers

**Solution** :
```bash
# Tester directement
php api.php

# Vérifier permissions
chmod 755 Livre/
chmod 755 Livre/Eveil/
chmod 644 Livre/api.php
```

---

## 📊 Monitoring Post-Lancement

### Semaine 1

- [ ] Vérifier logs serveur quotidiennement
- [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
- [ ] Tester sur mobile (iOS, Android)
- [ ] Vérifier localStorage fonctionne
- [ ] Monitorer performance (temps de chargement)

### Mois 1

- [ ] Collecter retours utilisateurs
- [ ] Vérifier aucune erreur CSP
- [ ] Optimiser si nécessaire (cache, compression)
- [ ] Sauvegarder base de données manuscrits

---

## 🎯 Critères de Succès

✅ **Page accessible** : `https://geekndragon.com/Livre/` charge en < 2s
✅ **Aucune erreur console** : Console F12 propre
✅ **CSP respectée** : marked.js chargé depuis local
✅ **Markdown parsé** : Formatage visible (titres, gras, italique)
✅ **Navigation fluide** : Onglets et ancres fonctionnent
✅ **Mémorisation active** : Position conservée entre sessions
✅ **Responsive** : Fonctionne sur mobile

---

## 📞 Support Hostpapa

Si problème persistant :

- **Support technique** : https://hostpapa.com/support
- **Documentation** : https://hostpapa.com/knowledgebase
- **Live Chat** : Disponible 24/7

---

## 🔄 Mises à Jour Futures

Pour déployer une mise à jour :

1. **Modifier localement**
2. **Tester localement** (localhost)
3. **Uploader fichiers modifiés uniquement**
4. **Vérifier en production**
5. **Documenter changements** dans ce fichier

---

**Date de création** : 2025-10-06
**Dernière mise à jour** : 2025-10-07 (CSP Fix)
**Statut** : ✅ Production Ready
**Version** : 1.1.0
