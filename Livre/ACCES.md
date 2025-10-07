# 🔗 Accès au Visualiseur de Manuscrits

## 📍 URL d'Accès

### URL Principale
```
http://localhost/GeeknDragon/Livre/
```

**OU** selon votre configuration serveur :

```
https://geekndragon.local/Livre/
http://127.0.0.1/GeeknDragon/Livre/
```

---

## 🔒 Sécurité & Confidentialité

✅ **Page cachée** : Non accessible depuis la navigation principale du site
✅ **URL directe uniquement** : Pas de liens depuis boutique.php, index.php, etc.
✅ **Complètement autonome** : Fonctionnement indépendant du reste du site
✅ **Pas de robots** : `<meta name="robots" content="noindex, nofollow">`
✅ **Données locales** : Aucune fuite vers l'extérieur

---

## 📂 Structure Physique

**Répertoire de Travail** : `E:\GitHub\GeeknDragon\Livre`

```
Livre/
├── index.php              ← Page principale (point d'entrée)
├── api.php                ← API REST backend
├── .htaccess              ← Configuration Apache
├── .gitignore             ← Exclusions Git
├── README.md              ← Documentation complète
├── GUIDE_RAPIDE.md        ← Guide utilisateur
├── ACCES.md               ← Ce fichier
├── assets/
│   ├── css/viewer.css     ← Styles autonomes
│   └── js/viewer.js       ← JavaScript complet
└── [VosLivres]/
    └── *.md               ← Vos chapitres
```

---

## 🧪 Tests de Fonctionnement

### Vérifier que l'API fonctionne

```bash
# Liste des livres disponibles
curl http://localhost/GeeknDragon/Livre/api.php?action=list

# Chapitres d'un livre
curl "http://localhost/GeeknDragon/Livre/api.php?action=book&name=Eveil"

# Contenu d'un chapitre
curl "http://localhost/GeeknDragon/Livre/api.php?action=chapter&book=Eveil&file=00_prologue.md"
```

### Réponse attendue (exemple)

```json
{
    "success": true,
    "data": [...],
    "error": null,
    "timestamp": "2025-10-06T17:00:00+00:00"
}
```

---

## 🚀 Premier Accès

1. **Ouvrir le navigateur**
2. **Taper l'URL** : `http://localhost/GeeknDragon/Livre/`
3. **Patienter quelques secondes** : Chargement initial des livres
4. **Cliquer sur un onglet** : Sélectionner le livre à lire
5. **Naviguer avec la sidebar** : Cliquer sur un chapitre

---

## 💾 Mémorisation Automatique

Le système sauvegarde automatiquement :
- ✅ Livre ouvert
- ✅ Chapitre en cours
- ✅ Position de scroll

**Clé localStorage** : `manuscrits_reading_position`

### Effacer la mémoire de lecture

Console navigateur (F12) :
```javascript
localStorage.removeItem('manuscrits_reading_position');
location.reload();
```

---

## 🔧 Dépannage Rapide

### Page blanche

**Solution** :
1. Ouvrir console navigateur (F12 → Console)
2. Vérifier erreurs JavaScript
3. Vérifier que PHP est actif : `php -v`
4. Vérifier permissions fichiers : `chmod 755 Livre/`

### API ne répond pas

**Vérifications** :
```bash
# Test direct PHP
cd E:\GitHub\GeeknDragon\Livre
php -r '$_GET["action"] = "list"; include "api.php";'
```

### Markdown non parsé

**Symptôme** : Texte brut au lieu de formatage

**Solution** :
- CDN marked.js bloqué
- Télécharger version locale dans `assets/js/marked.min.js`

---

## 📱 Accès Mobile

Même URL accessible depuis mobile sur le réseau local :

```
http://[IP_DE_VOTRE_PC]/GeeknDragon/Livre/
```

**Exemple** :
```
http://192.168.1.100/GeeknDragon/Livre/
```

Pour trouver votre IP :
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

---

## 🔐 Protection Additionnelle (Optionnel)

Si vous souhaitez protéger l'accès par mot de passe, ajoutez dans `.htaccess` :

```apache
AuthType Basic
AuthName "Zone Privée - Manuscrits"
AuthUserFile E:/GitHub/GeeknDragon/Livre/.htpasswd
Require valid-user
```

Puis créez le fichier `.htpasswd` :
```bash
htpasswd -c .htpasswd votre_nom_utilisateur
```

---

## ✨ Raccourcis Utiles

| Action | Raccourci |
|--------|-----------|
| Recherche texte | `Ctrl + F` |
| Scroll page | `Espace` / `Shift + Espace` |
| Retour haut | `Home` ou cliquer bouton ↑ |
| Aller bas | `End` |
| Recharger | `Ctrl + R` ou `F5` |
| Recharger complet | `Ctrl + Shift + R` ou `Ctrl + F5` |

---

## 📞 Support

En cas de problème :
1. Vérifier console navigateur (F12)
2. Vérifier logs PHP (si configurés)
3. Lire `README.md` et `GUIDE_RAPIDE.md`
4. Vérifier structure fichiers et permissions

---

**Date de création** : 2025-10-06
**Version** : 1.0.0
**Répertoire** : `E:\GitHub\GeeknDragon\Livre`
