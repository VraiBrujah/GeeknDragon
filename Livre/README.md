# 📚 Visualiseur de Manuscrits Autonome

Système de visualisation élégant pour manuscrits littéraires au format Markdown, complètement autonome et isolé du reste du site.

## 🎯 Fonctionnalités

✅ **Détection automatique des livres** : Tout nouveau dossier dans `Livre/` est détecté automatiquement
✅ **Navigation par onglets** : Basculer facilement entre différents livres
✅ **Chapitres ordonnés** : Tri automatique par numéro de chapitre (00_, 01_, etc.)
✅ **Ancres de navigation** : Table des matières interactive avec scroll fluide
✅ **Mémorisation de position** : Reprend automatiquement là où vous vous êtes arrêté
✅ **Mode sombre** : Design optimisé pour lecture prolongée sans fatigue oculaire
✅ **Parsing Markdown** : Rendu complet des fichiers .md avec mise en forme
✅ **Complètement autonome** : Aucune dépendance au site principal

---

## 📁 Structure des Fichiers

```
Livre/
├── index.php              # Page principale du visualiseur
├── api.php                # API REST pour charger les manuscrits
├── README.md              # Cette documentation
├── assets/
│   ├── css/
│   │   └── viewer.css     # Styles autonomes en mode sombre
│   └── js/
│       └── viewer.js      # Logic JavaScript complète
├── Eveil/                 # Exemple : Livre "Éveil"
│   ├── 00_prologue.md
│   ├── 01_chapitre1.md
│   └── 02_chapitre2.md
└── [NouveauLivre]/        # Ajoutez simplement un nouveau dossier
    ├── 00_prologue.md
    └── ...
```

---

## 📖 Convention de Nommage des Chapitres

Les fichiers doivent suivre cette convention pour être détectés et triés correctement :

```
<NuméroOrdre>_<nom_chapitre>.md
```

### Exemples valides :
- `00_prologue.md` → **Prologue** (chapitre 0)
- `01_chapitre_un.md` → **Chapitre un** (chapitre 1)
- `02_le_reveil.md` → **Le reveil** (chapitre 2)
- `15_epilogue.md` → **Epilogue** (chapitre 15)

### Règles :
- ✅ Commencer par **2 chiffres** (00 à 99)
- ✅ Séparateur **underscore** (`_`) après le numéro
- ✅ Extension **`.md`** obligatoire
- ✅ Nom lisible après l'underscore (converti automatiquement en titre)

---

## 🚀 Utilisation

### 1. Accéder au visualiseur

Ouvrez simplement dans votre navigateur :

```
http://localhost/GeeknDragon/Livre/
```

ou selon votre configuration serveur :

```
https://geekndragon.local/Livre/
```

### 2. Ajouter un nouveau livre

1. Créez un nouveau dossier dans `Livre/` avec le nom de votre livre :
   ```
   Livre/MonNouveauLivre/
   ```

2. Ajoutez vos chapitres avec la convention de nommage :
   ```
   00_prologue.md
   01_chapitre_un.md
   02_chapitre_deux.md
   ...
   ```

3. Rechargez la page → Le livre apparaît automatiquement dans les onglets ! ✨

### 3. Navigation

- **Onglets en haut** : Basculer entre les livres
- **Sidebar gauche** : Liste des chapitres cliquables
- **Scroll fluide** : Cliquez sur un chapitre pour y accéder directement
- **Position mémorisée** : Fermez et rouvrez → vous reprenez là où vous étiez
- **Bouton ↑** : Retour rapide en haut de page (apparaît après scroll)

---

## 🔧 Personnalisation

### Modifier les couleurs

Éditez `assets/css/viewer.css` et changez les variables CSS :

```css
:root {
  --couleur-accent: #DAA520;        /* Or pour titres */
  --couleur-bordure-active: #8B0000; /* Rouge bordure active */
  --couleur-fond-principal: #0f0f0f; /* Fond noir */
  /* ... autres variables ... */
}
```

### Modifier les polices

```css
:root {
  --police-titre: 'Cinzel', 'Georgia', serif;
  --police-texte: 'Georgia', 'Times New Roman', serif;
}
```

### Ajuster la largeur de lecture

```css
:root {
  --largeur-contenu-max: 800px; /* Largeur texte principal */
}
```

---

## 🛠️ Architecture Technique

### API REST (`api.php`)

**Endpoints disponibles :**

```php
// Liste tous les livres
GET api.php?action=list

// Chapitres d'un livre
GET api.php?action=book&name=Eveil

// Contenu d'un chapitre
GET api.php?action=chapter&book=Eveil&file=00_prologue.md
```

**Réponse JSON standardisée :**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2025-10-06T13:00:00+00:00"
}
```

### Sécurité

✅ **Validation stricte** des entrées utilisateur
✅ **Protection path traversal** (pas de `../` autorisé)
✅ **Échappement HTML** pour éviter XSS
✅ **Headers sécurisés** (X-Content-Type-Options, X-Frame-Options)
✅ **Extension .md forcée** pour éviter lecture fichiers systèmes

### Cache localStorage

Le système sauvegarde automatiquement :
- Livre actuellement ouvert
- Chapitre en cours de lecture
- Position de scroll exacte
- Timestamp de dernière lecture

**Clé localStorage :** `manuscrits_reading_position`

---

## 📱 Responsive

Le design s'adapte automatiquement :

- **Desktop** : Sidebar fixe à gauche
- **Tablette** : Sidebar rétractable
- **Mobile** : Navigation overlay en plein écran

---

## 🐛 Dépannage

### Le parser markdown ne fonctionne pas

**Symptôme** : Texte brut affiché au lieu du formatage

**Solution** : ✅ **Déjà résolu !** Le système utilise marked.js en version **locale** (`assets/js/marked.min.js`) pour garantir la compatibilité avec la Content Security Policy (CSP) stricte d'Hostpapa.

Si le fichier `marked.min.js` est manquant, téléchargez-le :

```bash
curl -L https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js -o assets/js/marked.min.js
```

### Les chapitres ne s'affichent pas dans l'ordre

**Symptôme** : Ordre aléatoire des chapitres

**Solution** : Vérifiez que vos fichiers suivent le format `XX_nom.md` avec **2 chiffres** :
- ❌ `1_chapitre.md`
- ✅ `01_chapitre.md`

### Le livre n'apparaît pas dans les onglets

**Symptôme** : Nouveau dossier créé mais invisible

**Solutions** :
1. Vérifiez qu'il contient au moins un fichier `.md` valide
2. Le nom du dossier ne doit pas être `assets`, `.git`, ou commencer par `.`
3. Rechargez complètement la page (Ctrl+F5)

---

## 🎨 Style Markdown Supporté

Le visualiseur supporte tous les éléments Markdown standard :

```markdown
# Titre principal (H1)
## Titre section (H2)
### Sous-titre (H3)

**Texte en gras**
*Texte en italique*

> Citation avec bordure

- Liste à puces
- Élément 2

1. Liste numérotée
2. Élément 2
```

---

## 📊 Performance

- **Chargement initial** : < 500ms
- **Parsing markdown** : < 100ms par chapitre
- **Détection scroll** : Debounced à 100ms
- **Sauvegarde position** : Toutes les 5 secondes + avant fermeture

---

## 🔐 Confidentialité

✅ **100% local** : Aucune donnée envoyée à des serveurs externes
✅ **Pas de tracking** : Aucun analytics ou télémétrie
✅ **Données privées** : Tout reste sur votre machine
✅ **localStorage uniquement** : Position de lecture en local

---

## 📝 Licence

Propriété de **Brujah — Geek & Dragon**
Usage interne uniquement, non accessible publiquement.

---

## 💡 Améliorations Futures Possibles

- [ ] Export PDF d'un livre complet
- [ ] Recherche plein texte dans tous les manuscrits
- [ ] Mode impression optimisé
- [ ] Support images dans les chapitres
- [ ] Annotations et marque-pages
- [ ] Mode clair/sombre basculable
- [ ] Statistiques de lecture (temps, progression)

---

**Répertoire de Travail Actuel** : `E:\GitHub\GeeknDragon\Livre`
**Version** : 1.0.0
**Dernière mise à jour** : 2025-10-06
