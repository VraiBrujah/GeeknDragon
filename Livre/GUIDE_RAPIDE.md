# 🚀 Guide de Démarrage Rapide

## Accès au Visualiseur

**URL d'accès** : `http://localhost/GeeknDragon/Livre/`

Le visualiseur est **complètement autonome** et **dissocié du reste du site**.

---

## ✨ Ajouter un Nouveau Livre en 3 Étapes

### 1️⃣ Créer le dossier

```bash
mkdir "E:\GitHub\GeeknDragon\Livre\MonNouveauLivre"
```

### 2️⃣ Ajouter vos chapitres

Créez vos fichiers `.md` avec la convention de nommage :

```
00_prologue.md
01_chapitre_un.md
02_chapitre_deux.md
03_la_rencontre.md
...
```

**Important** : Toujours 2 chiffres + underscore + nom

### 3️⃣ Rechargez la page

C'est tout ! Le livre apparaît automatiquement dans les onglets. ✨

---

## 📝 Format Markdown des Chapitres

Vos fichiers `.md` peuvent utiliser tout le Markdown standard :

```markdown
# L'Éveil de l'Étoile Pourpre

## PROLOGUE : Les Murmures de l'Ombre

### L'Éveil des Ombres Anciennes

La nuit s'épandait sur les Monts de l'Éther...

**Texte en gras** pour emphase forte.

*Texte en italique* pour emphase légère.

> Citation ou pensée interne du personnage

- Liste d'éléments
- Deuxième élément
```

---

## 🎨 Fonctionnalités Principales

### Navigation

- **Onglets en haut** : Cliquez pour changer de livre
- **Sidebar gauche** : Liste cliquable de tous les chapitres
- **Scroll automatique** : Cliquez sur un chapitre → scroll fluide vers celui-ci

### Mémorisation Automatique

Le système se souvient automatiquement de :
- ✅ Quel livre vous lisiez
- ✅ Quel chapitre vous étiez en train de lire
- ✅ Votre position exacte de scroll

**Fermez et rouvrez** → Vous reprenez exactement où vous étiez ! 🎯

### Bouton Retour en Haut

Après avoir scrollé, un bouton **↑** apparaît en bas à droite pour revenir rapidement en haut.

---

## 🔍 Exemple Complet

### Structure d'un livre "La Légende Perdue"

```
Livre/
└── La_Legende_Perdue/
    ├── 00_prologue.md
    ├── 01_le_reveil.md
    ├── 02_la_quete.md
    ├── 03_la_bataille.md
    └── 04_epilogue.md
```

### Contenu d'un chapitre (exemple `01_le_reveil.md`)

```markdown
# La Légende Perdue

## Chapitre 1 : Le Réveil

### L'aube nouvelle

Le soleil se levait lentement sur les plaines d'Etheria,
déchirant le voile de brume qui enveloppait la vallée...

---

*Quelques heures plus tard...*

Le héros ouvrit les yeux, désorienté. **Où était-il ?**
```

### Résultat

Le visualiseur affichera :
- **Onglet** : "La Legende Perdue"
- **Navigation** : Chapitres 00-04 cliquables
- **Contenu** : Markdown parfaitement formaté avec titres, emphases, etc.

---

## 🎯 Raccourcis Clavier (Navigation Navigateur Standard)

- `Ctrl + F` : Recherche dans le texte actuel
- `Espace` / `Shift + Espace` : Scroll page par page
- `Home` : Retour en haut
- `End` : Aller en bas

---

## 🛠️ Personnalisation Rapide

### Changer les couleurs

Éditez `assets/css/viewer.css` ligne ~12 :

```css
:root {
  --couleur-accent: #DAA520;        /* Couleur des titres */
  --couleur-bordure-active: #8B0000; /* Couleur active */
}
```

### Changer la largeur du texte

```css
:root {
  --largeur-contenu-max: 800px; /* Plus large = 1000px */
}
```

### Changer la police

```css
:root {
  --police-texte: 'Georgia', 'Times New Roman', serif;
}
```

---

## ⚠️ Dépannage Express

| Problème | Solution |
|----------|----------|
| Livre n'apparaît pas | Vérifiez qu'il contient au moins un `.md` valide |
| Ordre chapitres incorrect | Nommez avec 2 chiffres : `01_` pas `1_` |
| Markdown pas affiché | Vérifiez `assets/js/marked.min.js` existe (35 KB) |
| Page blanche | Vérifiez console navigateur (F12) pour erreurs |
| Erreur CSP | ✅ Résolu : marked.js est maintenant local |

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :

1. **Console navigateur** (F12) → Onglet "Console"
2. **Réseau** (F12) → Onglet "Network" pour voir les requêtes
3. **Fichiers** : Vérifiez permissions lecture sur dossier `Livre/`

---

**C'est tout !** Profitez de votre lecture immersive. 📚✨

---

**Répertoire** : `E:\GitHub\GeeknDragon\Livre`
**Version** : 1.0.0
