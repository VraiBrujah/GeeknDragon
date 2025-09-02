# 📋 SPÉCIFICATIONS DÉTAILLÉES - ÉDITEUR DE WIDGETS HIÉRARCHIQUE

## 🎯 VISION GÉNÉRALE ÉLARGIE
Éditeur WYSIWYG modulaire ultra-flexible pour création de pages marketing avec système de widgets universels composables hiérarchiques infinis, édition HTML/Markdown temps réel, synchronisation editor/viewer automatique, drag & drop intégré et sauvegarde complète persistante.

### 🌟 INNOVATIONS MAJEURES
1. **Widgets Universels** : ÉlémentUniversel remplace 3 widgets (TextSimple, Logo, Hero)
2. **Grille Compositeur** : GrilleComposition génère tableaux dynamiques x*y
3. **Édition Riche** : Support HTML + Markdown mixtes avec rendu viewer
4. **Sync Temps Réel** : Editor ↔ Viewer HTML synchronisés instantanément
5. **Interface Modulaire** : UI entièrement personnalisable et sauvée
6. **Extensibilité Totale** : Architecture orientée objet pour ajouts futurs

### 🎨 WIDGETS RÉVOLUTIONNAIRES

#### 1. **ÉlémentUniversel** ⭐ WIDGET DE BASE UNIVERSEL
```
┌─────────────────────────────────────────────────────────────────┐
│                        ÉlémentUniversel                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper-principal) ─────────────────────┐ │
│ │ • Background (couleur/gradient/image)                       │ │
│ │ • Border (style/width/radius) configurable                 │ │
│ │ • Padding (top/right/bottom/left) indépendants             │ │
│ │ • Shadow (box-shadow) optionnelle                           │ │
│ │ • Dimensions (width/height) en pixels                       │ │
│ │ • Position (x,y) relative au parent                         │ │
│ │                                                             │ │
│ │ ┌─ ImageAtomique (OPTIONNELLE) ──────────────────────────┐  │ │
│ │ │ • Source : Path local OU URL OU Emoji picker           │  │ │
│ │ │ • Dimensions configurables (width x height)            │  │ │
│ │ │ • Position dans conteneur (x,y offset)                 │  │ │
│ │ │ • Zoom/Scale configurable (0.1x à 5.0x)               │  │ │
│ │ │ • Fit mode (contain/cover/fill/scale-down)             │  │ │
│ │ │ • Rotation (0° à 360°)                                 │  │ │
│ │ │ • Alt text pour accessibilité                          │  │ │
│ │ │ • Lien href optionnel                                  │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ │ ┌─ TexteAtomique H1 (OPTIONNEL - Titre principal) ──────┐  │ │
│ │ │ • Contenu HTML/Markdown éditable                        │  │ │
│ │ │ • Font family, size, weight, style indépendants        │  │ │
│ │ │ • Color, background, border personnalisables          │  │ │
│ │ │ • Alignement (left/center/right/justify)               │  │ │
│ │ │ • Transform (uppercase/lowercase/capitalize)           │  │ │
│ │ │ • Shadow (text-shadow)                                  │  │ │
│ │ │ • Margin/padding configurables                         │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ │ ┌─ TexteAtomique H2 (OPTIONNEL - Sous-titre) ───────────┐  │ │
│ │ │ • Contenu HTML/Markdown éditable                        │  │ │
│ │ │ • Styles complètement indépendants du H1               │  │ │
│ │ │ • Toutes propriétés configurables                      │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ │ ┌─ TexteAtomique P (OPTIONNEL - Texte description) ─────┐  │ │
│ │ │ • Contenu HTML/Markdown éditable                        │  │ │
│ │ │ • Styles complètement indépendants                     │  │ │
│ │ │ • Support tableaux Markdown                            │  │ │
│ │ │ • Support listes, liens, formatage riche              │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

CAS D'UTILISATION:
├─ LOGO SEUL       : Image activée, textes désactivés
├─ TEXTE SEUL      : H1/H2/P activés selon besoins, image désactivée  
├─ HERO COMPLET    : Image + H1 + H2 + P tous activés
├─ ESPACE VIDE     : Rien d'activé, sert de spacer (taille x*y)
└─ COMBINAISONS    : Toute combinaison image + textes selon besoins

PROPRIÉTÉS SPÉCIALES:
• Activation/désactivation indépendante de chaque élément
• Styles visuels complètement personnalisables par élément  
• Duplication avec styles (via GrilleComposition)
• Position libre dans grille parent
• Ancrage optionnel avec autres widgets
```

#### 2. **GrilleComposition** ⭐ COMPOSITEUR DYNAMIQUE
```
┌─────────────────────────────────────────────────────────────────┐
│                       GrilleComposition                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper-grille) ─────────────────────────┐ │
│ │ • Background, border, padding configurables                 │ │
│ │ • Dimensions automatiques selon contenu                     │ │
│ │                                                             │ │
│ │ ┌─ PanneauControle (modes-organisation) ─────────────────┐  │ │
│ │ │ ◯ Mode Colonne                                           │  │ │
│ │ │   • Max colonnes avant passage ligne : [____] (opt.)    │  │ │
│ │ │ ◯ Mode Ligne                                             │  │ │  
│ │ │   • Max lignes avant passage colonne : [____] (opt.)    │  │ │
│ │ │ ◯ Mode Grille 2D                                         │  │ │
│ │ │   • Dimensions X: [___] Y: [___]                        │  │ │
│ │ │   • Remplissage: ◯Ligne ◯Colonne ◯Manuel               │  │ │
│ │ │                                                         │  │ │
│ │ │ [+ Dupliquer] [- Supprimer] [⚲ Réorganiser]            │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │                                                             │ │
│ │ ┌─ ZoneContenu (widgets-dynamiques) ─────────────────────┐  │ │
│ │ │                                                         │  │ │
│ │ │ ┌─ Widget1 (ÉlémentUniversel) ──────────────────────┐  │  │ │
│ │ │ │ • Position: x=[__] y=[__] (relative)              │  │  │ │
│ │ │ │ • [Dupliquer] [Supprimer] [Déplacer]              │  │  │ │
│ │ │ │ • Contenu + Styles dupliqués si duplication       │  │  │ │
│ │ │ └───────────────────────────────────────────────────┘  │  │ │
│ │ │                                                         │  │ │
│ │ │ ┌─ Widget2 (N'IMPORTE QUEL WIDGET) ─────────────────┐  │  │ │
│ │ │ │ • Glissé-déposé depuis banque widgets             │  │  │ │
│ │ │ │ • Position initiale = lieu de drop                │  │  │ │
│ │ │ │ • Position ajustable manuellement                 │  │  │ │
│ │ │ └───────────────────────────────────────────────────┘  │  │ │
│ │ │                                                         │  │ │
│ │ │ ┌─ WidgetN... (extensible à l'infini) ──────────────┐  │  │ │
│ │ │ └───────────────────────────────────────────────────┘  │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

FONCTIONNALITÉS AVANCÉES:
├─ ORGANISATION AUTOMATIQUE selon mode sélectionné
├─ POSITION MANUELLE avec coordonnées x,y relatives
├─ DUPLICATION avec styles/contenu/propriétés complètes
├─ GLISSER-DÉPOSER depuis banque widgets + repositionnement
├─ SUPERPOSITION autorisée en mode manuel
├─ REDIMENSIONNEMENT automatique du conteneur
└─ MINIMUM 1x1, pas de maximum (performance = responsabilité dev)
```

---

## 🧩 WIDGETS ATOMIQUES SUPPLÉMENTAIRES REQUIS

### Widgets Atomiques de Base (Phase 1)
```
✅ TexteAtomique     - Intégré dans ÉlémentUniversel
✅ ImageAtomique     - Intégré dans ÉlémentUniversel  
✅ ConteneurAtomique - Intégré dans ÉlémentUniversel
```

### Widgets Atomiques Supplémentaires (Phase 2)
```
1. BoutonAtomique    - Bouton cliquable avec lien et styles
2. IconeAtomique     - Icônes FontAwesome/SVG/Emoji pour UI
3. BadgeAtomique     - Badges "Populaire", statuts, notifications
4. SeparateurAtomique - Lignes de séparation visuelles
5. VideoAtomique     - Widgets vidéo (extensibilité future)
```

---

## 🎯 WIDGETS COMPLEXES REFACTORISÉS AVEC WIDGETS UNIVERSELS

Les 7 widgets complexes sont maintenant reconstruits avec **ÉlémentUniversel** + **GrilleComposition** + widgets atomiques supplémentaires :

```
┌───────────────────────────────────────────────────┐
│            ImageAnimatedWidget                    │
├───────────────────────────────────────────────────┤
│ ÉlémentUniversel (image avec animations CSS)     │
│ ├─ Image activée (Path/URL/Emoji)               │
│ ├─ H1, H2, P désactivés                          │
│ └─ Conteneur avec propriétés d'animation:        │
│    • transform: float/pulse/rotate               │
│    • animation-duration: configurable           │
│    • hover effects: scale/opacity                │
└───────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
└── ÉlémentUniversel 
    ├── Image (activée + animations CSS)
    └── Textes H1/H2/P (tous désactivés)
```

### 2. **HeaderWidget** ⭐ Header éditable pour viewer
```
┌─────────────────────────────────────────────────────────────┐
│                     HeaderWidget                           │
├─────────────────────────────────────────────────────────────┤
│ GrilleComposition (mode ligne, 2 colonnes)                │
│ ├─ Colonne Gauche:                                         │
│ │  └─ ÉlémentUniversel (logo + nom entreprise)            │
│ │     ├── Image activée (logo)                           │
│ │     ├── H1 activé (nom entreprise)                     │
│ │     └── H2, P désactivés                               │
│ └─ Colonne Droite:                                         │
│    └─ ÉlémentUniversel (informations header)              │
│       ├── Image désactivée                                │
│       ├── H1 activé (date génération)                    │
│       ├── H2 activé (info confidentiel)                  │
│       └── P désactivé                                     │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
└── GrilleComposition (2 colonnes)
    ├── ÉlémentUniversel #1 (logo + nom)
    │   ├── Image: Logo entreprise
    │   └── H1: Nom entreprise
    └── ÉlémentUniversel #2 (infos)
        ├── H1: Date génération
        └── H2: Confidentialité
```

### 3. **FeatureGridWidget** - Grille de fonctionnalités
```
┌─────────────────────────────────────────────────────────────┐
│                  FeatureGridWidget                          │
├─────────────────────────────────────────────────────────────┤
│ ÉlémentUniversel (titre principal)                        │
│ ├─ Image désactivée                                        │
│ ├─ H1 activé (titre de la grille)                        │
│ └─ H2, P désactivés                                        │
│                                                            │
│ GrilleComposition (mode grille 2D, colonnes configurables) │
│ └─ N × ÉlémentUniversel (cartes fonctionnalités)          │
│    ├── Image activée (icône FontAwesome/Emoji)           │
│    ├── H1 activé (titre fonctionnalité)                  │
│    ├── H2 désactivé                                       │
│    └── P activé (description détaillée)                   │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
├── ÉlémentUniversel (titre principal)
│   └── H1: Titre de la grille
└── GrilleComposition (grille N colonnes)
    └── N × ÉlémentUniversel (cartes)
        ├── Image: IconeAtomique 
        ├── H1: Titre feature
        └── P: Description
```

### 4. **PricingCardWidget** - Carte de prix individuelle
```
┌─────────────────────────────────────────────────────────────┐
│                  PricingCardWidget                          │
├─────────────────────────────────────────────────────────────┤
│ GrilleComposition (mode colonne, sections verticales)      │
│ ├─ Header: ÉlémentUniversel (nom plan + badge)            │
│ │  ├── Image désactivée                                    │
│ │  ├── H1 activé (nom du plan)                           │
│ │  ├── H2 activé (badge "Populaire" si applicable)       │
│ │  └── P désactivé                                        │
│ ├─ Prix: ÉlémentUniversel (montant + période)             │
│ │  ├── Image désactivée                                    │
│ │  ├── H1 activé (montant principal)                     │
│ │  ├── H2 activé (période /mois)                         │
│ │  └── P désactivé                                        │
│ ├─ Features: GrilleComposition (liste avantages)          │
│ │  └─ N × ÉlémentUniversel (ligne avantage)              │
│ │     ├── Image activée (✅ ou ❌)                        │
│ │     ├── H1 désactivé                                    │
│ │     ├── H2 désactivé                                    │
│ │     └── P activé (description avantage)                 │
│ └─ Action: BoutonAtomique (bouton CTA)                     │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
└── GrilleComposition (sections verticales)
    ├── ÉlémentUniversel (header)
    ├── ÉlémentUniversel (prix)
    ├── GrilleComposition (features)
    │   └── N × ÉlémentUniversel (icône + texte)
    └── BoutonAtomique (CTA)
```

### 5. **TarifLocationWidget** - Widget 3 cartes tarifs
```
┌─────────────────────────────────────────────────────────────┐
│                  TarifLocationWidget                        │
├─────────────────────────────────────────────────────────────┤
│ ÉlémentUniversel (titre section)                          │
│ ├─ Image désactivée                                        │
│ ├─ H1 activé (titre section tarifs)                      │
│ └─ H2, P désactivés                                        │
│                                                            │
│ GrilleComposition (mode grille 2D, 3 colonnes responsive) │
│ ├─ PricingCardWidget (Plan 1)                             │
│ ├─ PricingCardWidget (Plan 2 + badge)                     │
│ └─ PricingCardWidget (Plan 3)                             │
│                                                            │
│ ÉlémentUniversel (section bonus optionnelle)              │
│ ├─ Image désactivée                                        │
│ ├─ H1 activé (titre bonus)                               │
│ ├─ H2 désactivé                                            │
│ └─ P activé (description conseil)                          │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
├── ÉlémentUniversel (titre)
├── GrilleComposition (3 colonnes)
│   ├── PricingCardWidget (composé)
│   ├── PricingCardWidget (composé + badge)
│   └── PricingCardWidget (composé)
└── ÉlémentUniversel (bonus)
```

### 6. **ComparisonWidget** - Comparaison avant/après
```
┌─────────────────────────────────────────────────────────────┐
│                   ComparisonWidget                          │
├─────────────────────────────────────────────────────────────┤
│ ÉlémentUniversel (titre principal)                        │
│ ├─ Image désactivée                                        │
│ ├─ H1 activé (titre comparaison)                         │
│ └─ H2, P désactivés                                        │
│                                                            │
│ GrilleComposition (mode grille 2D, 3 colonnes: OLD|VS|NEW)│
│ ├─ Colonne Obsolète:                                       │
│ │  ├─ ÉlémentUniversel (titre section)                    │
│ │  │  └── H1: "Ancienne méthode"                         │
│ │  └─ GrilleComposition (liste désavantages)              │
│ │     └─ N × ÉlémentUniversel (problème)                 │
│ │        ├── Image: ❌ ou 😞                              │
│ │        └── P: Description problème                      │
│ ├─ Colonne VS:                                             │
│ │  └─ ÉlémentUniversel (texte VS stylisé)                │
│ │     ├── Image désactivée                                │
│ │     ├── H1 activé ("VS")                               │
│ │     └── H2, P désactivés                                │
│ └─ Colonne Moderne:                                        │
│    ├─ ÉlémentUniversel (titre section)                    │
│    │  └── H1: "Nouvelle approche"                        │
│    └─ GrilleComposition (liste avantages)                 │
│       └─ N × ÉlémentUniversel (avantage)                 │
│          ├── Image: ✅ ou 🚀                              │
│          └── P: Description avantage                       │
│                                                            │
│ ÉlémentUniversel (conclusion optionnelle)                 │
│ ├─ Image désactivée                                        │
│ ├─ H1 désactivé                                            │
│ ├─ H2 désactivé                                            │
│ └─ P activé (message final)                               │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
├── ÉlémentUniversel (titre)
├── GrilleComposition (3 colonnes)
│   ├── Colonne 1: ÉlémentUniversel + GrilleComposition
│   ├── Colonne 2: ÉlémentUniversel (VS)
│   └── Colonne 3: ÉlémentUniversel + GrilleComposition  
└── ÉlémentUniversel (conclusion)
```

### 7. **CallToActionWidget** - Section appel à l'action
```
┌─────────────────────────────────────────────────────────────┐
│                  CallToActionWidget                         │
├─────────────────────────────────────────────────────────────┤
│ GrilleComposition (mode ligne, contenu + image)            │
│ ├─ Section Contenu:                                         │
│ │  ├─ ÉlémentUniversel (textes CTA)                       │
│ │  │  ├── Image désactivée                                │
│ │  │  ├── H1 activé (titre accrocheur)                   │
│ │  │  ├── H2 désactivé                                    │
│ │  │  └── P activé (description motivation)               │
│ │  └─ GrilleComposition (boutons horizontaux)             │
│ │     ├── BoutonAtomique (principal)                      │
│ │     └── BoutonAtomique (secondaire, optionnel)          │
│ └─ Section Illustration (optionnelle):                     │
│    └─ ÉlémentUniversel (image illustration)               │
│       ├── Image activée (illustration CTA)               │
│       └── H1, H2, P désactivés                            │
└─────────────────────────────────────────────────────────────┘

COMPOSITION AVEC WIDGETS UNIVERSELS:
└── GrilleComposition (2 colonnes)
    ├── Section contenu:
    │   ├── ÉlémentUniversel (textes)
    │   └── GrilleComposition (boutons)
    │       ├── BoutonAtomique (principal)
    │       └── BoutonAtomique (secondaire)
    └── ÉlémentUniversel (image)
```

---

## 🔧 RÉSUMÉ ARCHITECTURE WIDGETS FINALISÉE

### 🌟 **WIDGETS UNIVERSELS DE BASE (Phase 1)**
```
1. ÉlémentUniversel    - Widget modulaire tout-en-un
   ├── Image optionnelle (Path/URL/Emoji + animations)
   ├── H1 optionnel (titre principal)  
   ├── H2 optionnel (sous-titre)
   ├── P optionnel (texte/description)
   └── Espace vide si rien d'activé

2. GrilleComposition   - Compositeur dynamique x*y
   ├── Mode Colonne (max colonnes → ligne)
   ├── Mode Ligne (max lignes → colonne)
   ├── Mode Grille 2D (dimensions X*Y)
   └── Position libre + duplication avec styles
```

### ⚡ **WIDGETS ATOMIQUES SUPPLÉMENTAIRES (Phase 2)**
```
3. BoutonAtomique      - Bouton cliquable avec lien et styles
4. IconeAtomique       - Icônes FontAwesome/SVG/Emoji
5. BadgeAtomique       - Badges "Populaire", statuts, notifications  
6. SeparateurAtomique  - Lignes de séparation visuelles
7. VideoAtomique       - Widgets vidéo (extensibilité future)
```

### 🎯 **WIDGETS COMPLEXES REFACTORISÉS (Phase 3)**
```
8. ImageAnimatedWidget  = ÉlémentUniversel (image + animations CSS)
9. HeaderWidget         = GrilleComposition (2×ÉlémentUniversel)  
10. FeatureGridWidget   = ÉlémentUniversel + GrilleComposition(N×ÉlémentUniversel)
11. PricingCardWidget   = GrilleComposition(4×ÉlémentUniversel + BoutonAtomique)
12. TarifLocationWidget = 2×ÉlémentUniversel + GrilleComposition(3×PricingCardWidget)
13. ComparisonWidget    = ÉlémentUniversel + GrilleComposition(3 colonnes complexes)  
14. CallToActionWidget  = GrilleComposition(ÉlémentUniversel + boutons + image)
```

**🎉 RÉSULTAT :** Au lieu de 19 widgets atomiques, **seulement 2 widgets universels + 5 widgets atomiques** couvrent 100% des besoins !

---

## 🏗️ ARCHITECTURE SYSTÈME RÉVOLUTIONNAIRE

### 🔧 CONTRAINTES FONDAMENTALES ÉLARGIES
- **Widgets Universels** : 2 widgets de base couvrent 90% des besoins (ÉlémentUniversel + GrilleComposition)
- **Composition infinie** : Récursion illimitée, widgets dans widgets dans widgets...
- **Édition temps réel** : HTML/Markdown → rendu viewer instantané
- **Interface modulaire** : UI complètement personnalisable et persistante  
- **Extensibilité totale** : Architecture orientée objet pour widgets futurs
- **Performance optimisée** : Responsabilité développeur, pas de limites artificielles
- **Standalone complet** : 100% client-side avec synchronisation editor/viewer

### 🌐 INTERFACE UTILISATEUR MODULAIRE

#### Panneau Gauche - Banque de Widgets
```
┌─ BANQUE WIDGETS ─────────────────────┐
│ [🔍 Rechercher widgets...]           │
│ ☐ Afficher tous  ☐ Par nom ☐ Mot-clé │
├─────────────────────────────────────┤
│ 📁 Atomiques/                       │
│   ├─ ÉlémentUniversel               │
│   ├─ BoutonAtomique                 │
│   ├─ IconeAtomique                  │
│   └─ EspaceurAtomique               │
│ 📁 Compositeurs/                    │
│   ├─ GrilleComposition              │
│   └─ (widgets futurs...)            │
│ 📁 Complexes/                       │
│   ├─ ComparisonWidget               │
│   ├─ FeatureGridWidget             │
│   └─ (autres widgets...)            │
└─────────────────────────────────────┘
```

#### Zone Centrale - Éditeur Principal
```
┌─ ÉDITEUR PRINCIPAL ──────────────────────────────────────┐
│ Nom projet: [________________] 📁 Sauv: [__________]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ GRILLE INFINIE ÉDITABLE ─────────────────────────┐   │
│  │ • Glisser-déposer widgets depuis banque          │   │
│  │ • Redimensionnement libre (resize handles)       │   │
│  │ • Position manuelle avec coordonnées x,y         │   │
│  │ • Zoom/Pan pour navigation grandes grilles       │   │
│  │ • Sélection multiple (Ctrl+clic)                 │   │
│  │ • Ancrage optionnel entre widgets                │   │
│  │                                                   │   │
│  │    [Widget1]     [Widget2]                       │   │
│  │                                                   │   │
│  │              [Widget3]     [Widget4]             │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│ 🔄 Ctrl+Z  ▶️ Ctrl+Y  💾 Auto-save: ON  ⚡ Sync: ON     │
└──────────────────────────────────────────────────────────┘
```

#### Panneau Droit - Propriétés Contextuelles  
```
┌─ PROPRIÉTÉS ─────────────────────────┐
│ Widget: ÉlémentUniversel #12         │
├─────────────────────────────────────┤
│ 🖼️ IMAGE (optionnelle)              │
│ ☑️ Activée                          │
│ Source: ○ Path ○ URL ○ Emoji        │
│ [./assets/logo.png...............]   │
│ Zoom: [1.0x] Position: X[0] Y[0]    │
│                                     │
│ 📝 TITRE H1 (optionnel)             │
│ ☑️ Activé                           │
│ Contenu: [**Titre Principal**]      │
│ Style: [Font] [Size] [Color]        │
│                                     │
│ 📝 SOUS-TITRE H2 (optionnel)        │
│ ☐ Activé                           │
│                                     │
│ 📝 TEXTE P (optionnel)              │
│ ☑️ Activé                           │
│ [Texte avec *markdown*...]          │
│                                     │
│ 🎨 CONTENEUR                        │
│ Background: [#ffffff] Border: [1px] │
│ Padding: T[10] R[10] B[10] L[10]    │
│                                     │
│ 📐 POSITION & TAILLE                │
│ X: [100] Y: [50] W: [300] H: [200]  │
│                                     │
│ 🔗 ANCRAGE (optionnel)              │
│ ☐ Activé  ☐ Central ☐ Latéral      │
└─────────────────────────────────────┘
```

### 🎯 ARBORESCENCE HIÉRARCHIQUE (Style Gimp)
```
┌─ STRUCTURE ──────────────────────────┐
│ 👁️ 🔒 Grille Principale             │
│ ├─ 👁️ 📝 Titre Section              │
│ ├─ 👁️ 🏗️ GrilleComposition #1       │
│ │  ├─ 👁️ 📱 ÉlémentUniversel #1.1  │
│ │  ├─ 👁️ 📱 ÉlémentUniversel #1.2  │  
│ │  └─ 👁️ 📱 ÉlémentUniversel #1.3  │
│ └─ 👁️ 🎨 ComparisonWidget           │
│    ├─ 👁️ 📝 Titre                   │
│    ├─ 👁️ 🏗️ GrilleComposition #2    │
│    └─ 👁️ 📝 Conclusion              │
│                                     │
│ [Renommer] [Dupliquer] [Supprimer]   │
└─────────────────────────────────────┘
```

### 🌐 SYNCHRONISATION TEMPS RÉEL EDITOR ↔ VIEWER

#### Création de Projet
```
1. Lancement éditeur → Saisie nom projet
   "MonProjet Marketing" → slug: "mon-projet-marketing"

2. Génération automatique fichiers:
   ├─ editor/
   │  ├─ mon-projet-marketing-editor.html (éditeur)
   │  ├─ data/mon-projet-marketing.json (sauvegarde)
   │  └─ assets/ (images, styles)
   └─ viewer/
      ├─ mon-projet-marketing.html (viewer final)
      ├─ assets/ (copies assets)
      └─ styles/ (CSS généré)

3. Synchronisation instantanée:
   - Édition → Auto-save 30s → Regeneration viewer
   - Ouverture viewer.html → Affichage temps réel
```

#### Fonctionnement Sync
- **Déclencheurs** : Toute modification (texte, style, position, ajout/suppression)
- **Latence** : < 500ms entre édition et mise à jour viewer
- **Persistance** : État complet sauvé (grille, widgets, UI, historique)
- **Robustesse** : F5 → restauration exacte état avant refresh

### 📝 ÉDITEUR HTML/MARKDOWN INTÉGRÉ

#### Mode Édition (Éditeur)
```
┌─ CHAMP TEXTE MARKDOWN ───────────────┐
│ ## Titre avec **gras**               │
│                                      │
│ Liste:                               │
│ - Élément 1                          │  
│ - Élément 2                          │
│                                      │
│ | Col1  | Col2  |                    │
│ |-------|-------|                    │
│ | A     | B     |                    │
│                                      │
│ <em>HTML mixé</em>                   │
└──────────────────────────────────────┘
```

#### Mode Viewer (Rendu)
```
┌─ RENDU FINAL ────────────────────────┐
│ Titre avec gras                      │
│                                      │
│ Liste:                               │
│ • Élément 1                          │
│ • Élément 2                          │
│                                      │
│ ┌─────┬─────┐                        │
│ │Col1 │Col2 │                        │
│ ├─────┼─────┤                        │
│ │ A   │ B   │                        │
│ └─────┴─────┘                        │
│                                      │
│ HTML mixé                            │
└──────────────────────────────────────┘
```

#### APIs Requises
```
📦 requirements.json
{
  "markdown-parser": "^3.0.0",
  "html-sanitizer": "^2.1.0", 
  "emoji-picker": "^1.5.0",
  "live-sync": "^4.2.0"
}
```

### 🎯 SYSTÈME DRAG & DROP AVANCÉ
- **Glisser depuis banque** : Widget → Zone édition (position = lieu drop)
- **Repositionnement libre** : Drag widget existant → nouvelle position
- **Intégration hiérarchique** : Drop widget sur GrilleComposition → ajout automatique
- **Contraintes intelligentes** : Parent redimensionné si enfant dépasse
- **Superposition** : Z-index automatique + contrôle manuel
- **Multi-sélection** : Ctrl+clic → déplacement groupe

### 🔧 ANCRAGE WIDGETS (OPTIONNEL)
```
Widget A ←→ Widget B  (ancrage horizontal)
Widget C ↕ Widget D   (ancrage vertical)  
Widget E ⟷ Widget F   (ancrage central bidirectionnel)

Configuration:
☐ Activé par défaut (caché)
☑️ Affiché si activé manuellement
• Distance minimale/maximale configurable
• Types: magnétique, rigide, flexible
```

### 💾 PERSISTANCE COMPLÈTE & HISTORIQUE
- **Auto-save** : Toutes les 30 secondes + à chaque action majeure
- **Historique 100 actions** : Ctrl+Z/Ctrl+Y avec pile persistante après F5
- **État UI complet** : Positions panneaux, zoom, sélections, filtres
- **Sauvegarde incrémentale** : Seules modifications stockées (optimisation)
- **Export ZIP** : Projet complet (editor + viewer + assets + sauvegarde)

## 🧩 DÉCOMPOSITION WIDGETS - ARCHITECTURE ATOMIQUE

### WIDGETS ATOMIQUES (Niveau 0 - Non décomposables)

#### 1. **TexteAtomique**
```
- Texte éditable inline
- Propriétés : contenu, police, taille, couleur, gras, italique, alignement
- Édition : contenteditable + panel propriétés
```

#### 2. **ImageAtomique** 
```
- Image uploadable/URL
- Propriétés : src, alt, width, height, border-radius, filters
- Édition : File picker + URL input + panel propriétés
```

#### 3. **BoutonAtomique**
```
- Bouton cliquable
- Propriétés : texte, couleur fond, couleur texte, padding, border-radius, lien
- Composition : TexteAtomique + propriétés visuelles
```

#### 4. **ConteneurAtomique**
```
- Div avec propriétés visuelles
- Propriétés : background, border, padding, margin, border-radius
- Usage : Wrapper pour autres widgets
```

#### 5. **IconeAtomique**
```
- Icône FontAwesome ou SVG
- Propriétés : icône, taille, couleur, rotation
```

#### 6. **EspaceurAtomique**
```
- Div vide pour espacement
- Propriétés : width, height, display (block/inline/flex)
```

### WIDGETS COMPOSÉS SIMPLES (Niveau 1)

#### 7. **TexteSimple** (= TexteAtomique + ConteneurAtomique)
```
Composition:
├── ConteneurAtomique (background, padding)
└── TexteAtomique (contenu text)

Propriétés héritées:
- Toutes les propriétés des widgets enfants
- Disposition : alignement du texte dans le conteneur
```

#### 8. **Logo** (= ImageAtomique seule)
```
Composition:
└── ImageAtomique (logo uploadable)

Spécialisation:
- Contraintes de ratio
- Tailles prédéfinies (petit, moyen, grand)
```

#### 9. **BoutonAction** (= BoutonAtomique + IconeAtomique optionnelle)
```
Composition:
├── ConteneurAtomique (wrapper bouton)
├── IconeAtomique (optionnelle)
└── TexteAtomique (texte bouton)

Propriétés composées:
- Position icône (gauche/droite/dessus/dessous)
- Gap entre icône et texte
```

### WIDGETS COMPOSÉS COMPLEXES (Niveau 2)

#### 10. **Hero** 
```
Composition:
├── ConteneurAtomique (background hero)
├── TexteSimple (titre principal)
├── TexteSimple (sous-titre)
├── TexteSimple (description)
└── BoutonAction (CTA principal)

Propriétés de layout:
- Alignement vertical/horizontal des éléments
- Espacement entre éléments
- Responsive breakpoints
```

#### 11. **CarteContact**
```
Composition:
├── ConteneurAtomique (wrapper carte)
├── IconeAtomique (icône contact)
├── TexteSimple (titre - ex: "Téléphone")
├── TexteSimple (valeur - ex: "514-XXX-XXXX")
└── BoutonAction (action optionnelle)

Layout: Flexbox vertical/horizontal
```

#### 12. **ElementComparaison**
```
Composition:
├── ConteneurAtomique (wrapper élément)
├── IconeAtomique (emoji/icône)
└── TexteSimple (description)

Usage: Composant pour ComparisonWidget
```

### WIDGETS COMPOSÉS TRÈS COMPLEXES (Niveau 3)

#### 13. **ComparisonWidget**
```
Composition:
├── ConteneurAtomique (wrapper global)
├── TexteSimple (titre principal)
├── ConteneurAtomique (colonne obsolète)
│   ├── TexteSimple (titre colonne)
│   └── Liste de ElementComparaison (widgets niveau 2)
├── ConteneurAtomique (section VS centrale)
│   └── TexteSimple (texte "VS")
├── ConteneurAtomique (colonne moderne)
│   ├── TexteSimple (titre colonne)
│   └── Liste de ElementComparaison (widgets niveau 2)
└── ConteneurAtomique (conclusion)
    └── TexteSimple (message final)

Propriétés de layout:
- Distribution colonnes (ratio 1:1 ou personnalisé)
- Alignement vertical des listes
- Responsive: stack vertical sur mobile
```

#### 14. **CarteTarif**
```
Composition:
├── ConteneurAtomique (wrapper carte)
├── TexteSimple (nom du plan)
├── ConteneurAtomique (section prix)
│   ├── TexteSimple (prix principal)
│   └── TexteSimple (unité/période)
├── ConteneurAtomique (liste fonctionnalités)
│   └── Liste de ElementComparaison (features)
└── BoutonAction (bouton souscription)

Propriétés spécialisées:
- Badge "Populaire" (ConteneurAtomique + TexteSimple)
- Couleur de thème de la carte
```

#### 15. **TarifLocationWidget** (3 cartes)
```
Composition:
├── ConteneurAtomique (wrapper global)
├── TexteSimple (titre principal)
├── ConteneurAtomique (grille 3 colonnes)
│   ├── CarteTarif (plan 1)
│   ├── CarteTarif (plan 2)
│   └── CarteTarif (plan 3)
└── ConteneurAtomique (section bonus)
    ├── TexteSimple (titre bonus)
    └── TexteSimple (description bonus)

Layout responsive:
- Desktop: 3 colonnes
- Tablette: 2+1 colonnes  
- Mobile: 1 colonne
```

#### 16. **FeatureGridWidget**
```
Composition:
├── ConteneurAtomique (wrapper global)
├── TexteSimple (titre principal)
└── ConteneurAtomique (grille fonctionnalités)
    └── Liste de CarteFeature (widgets niveau 2)

CarteFeature composition:
├── ConteneurAtomique (wrapper carte)
├── IconeAtomique (icône feature)
├── TexteSimple (titre feature)
└── TexteSimple (description feature)

Propriétés de grille:
- Nombre de colonnes (1-6)
- Gap entre cartes
- Taille des icônes
```

#### 17. **ImageAnimatedWidget**
```
Composition:
├── ConteneurAtomique (wrapper avec animations CSS)
└── ImageAtomique (image principale)

Propriétés d'animation:
- Type animation (float, pulse, rotate, etc.)
- Durée et timing
- Trigger (hover, auto, scroll)
```

#### 18. **PricingCardWidget** (similaire CarteTarif mais plus flexible)
```
Composition:
├── ConteneurAtomique (wrapper carte)
├── ConteneurAtomique (header)
│   ├── TexteSimple (titre)
│   └── TexteSimple (sous-titre optionnel)
├── ConteneurAtomique (section prix)
│   ├── TexteSimple (prix)
│   └── TexteSimple (période)
├── ConteneurAtomique (liste avantages)
│   └── Liste de ElementComparaison (avantages)
└── BoutonAction (CTA)

Différence avec CarteTarif:
- Plus de flexibilité dans le header
- Support de sous-titres
- Templates de couleurs multiples
```

#### 19. **CallToActionWidget**
```
Composition:
├── ConteneurAtomique (wrapper global avec background)
├── TexteSimple (titre accrocheur)
├── TexteSimple (description)
├── ConteneurAtomique (section boutons)
│   ├── BoutonAction (bouton principal)
│   └── BoutonAction (bouton secondaire optionnel)
└── ImageAtomique (image/illustration optionnelle)

Layout options:
- Image à gauche/droite/dessus/dessous
- Alignement global (center, left, right)
- Disposition boutons (horizontal, vertical)
```

## 📊 PROPRIÉTÉS SYSTÈME

### Propriétés Universelles (Tous widgets)
- **Position**: x, y dans la grille parent
- **Taille**: width, height en px
- **Marges**: top, right, bottom, left en px
- **Z-index**: Ordre d'empilement
- **Visibilité**: visible/hidden + conditions
- **Responsive**: Propriétés par breakpoint
- **Animation**: Entrée/sortie/hover

### Propriétés de Conteneur
- **Background**: couleur, gradient, image
- **Border**: width, style, color, radius
- **Padding**: top, right, bottom, left
- **Shadow**: box-shadow complet
- **Layout interne**: flex/grid propriétés

### Propriétés de Texte
- **Font**: family, size, weight, style
- **Color**: couleur texte + outline
- **Transform**: uppercase, lowercase, capitalize
- **Spacing**: letter-spacing, line-height
- **Decoration**: underline, strikethrough
- **Shadow**: text-shadow

### Propriétés d'Image
- **Fit**: cover, contain, fill, scale
- **Filter**: brightness, contrast, blur, etc.
- **Transform**: rotate, scale, skew
- **Crop**: position focus de l'image

## 🔧 SYSTÈME D'ÉDITION

### Modes d'Édition
1. **Sélection**: Clic simple → highlight + panel propriétés
2. **Édition inline**: Double-clic sur texte → contenteditable
3. **Édition contextuelle**: Right-clic → menu actions
4. **Édition globale**: Panel de droite → toutes propriétés

### Interactions Utilisateur
- **Drag & Drop**: Déplacement widgets dans grille
- **Resize handles**: Redimensionnement visuel
- **Copy/Paste**: Duplication widgets
- **Undo/Redo**: Historique actions
- **Multi-sélection**: Ctrl+clic pour sélection multiple

### Système de Thèmes
- **Variables CSS**: Couleurs, espacements, fonts système
- **Thèmes prédéfinis**: Dark mode par défaut + autres
- **Export/Import**: Fichiers .json de thèmes
- **Édition live**: Modification variables en temps réel

## 💾 PERSISTANCE & EXPORT

### Sauvegarde
- **Auto-save**: localStorage toutes les 30 secondes
- **Export projet**: Fichier .json complet
- **Import projet**: Chargement fichier .json
- **Templates**: Sauvegarde de configurations réutilisables

### Export Viewer
- **HTML standalone**: Un fichier .html complet
- **CSS inline**: Styles intégrés pour portabilité
- **Pas de JS**: HTML/CSS pur pour le viewer final
- **Assets inclus**: Images en base64 si nécessaire

## ⚡ PERFORMANCE & OPTIMISATION

### Contraintes Techniques
- **Pas de limites**: Grille et récursion illimitées
- **Responsabilité dev**: Performance à la charge utilisateur
- **Lazy loading**: Rendu différé des widgets non visibles
- **Debounced save**: Éviter saves trop fréquentes

## 🧪 TESTS & VALIDATION

### Tests Requis à Chaque Étape
1. **Test fonctionnel**: Toutes les interactions marchent
2. **Test responsive**: Comportement multi-devices
3. **Test performance**: Pas de lag avec 50+ widgets
4. **Test export**: Viewer généré fonctionne standalone
5. **Test persistence**: Sauvegarde/chargement correct

### Validation Humaine
- **Demo live** à chaque étape majeure
- **Feedback utilisateur** avant passage étape suivante
- **Tests edge cases** (grilles très grandes, widgets imbriqués profonds)

---

## 🚀 PLAN DE DÉVELOPPEMENT PHASÉ

### **Phase 1 - Base Universelle** ⭐ **PRIORITÉ ABSOLUE**
```
🎯 Objectif: Éditeur fonctionnel avec widgets universels de base

✅ À implémenter:
├─ Architecture orientée objet (ES6+ Classes)
├─ Grille éditable infinie avec drag & drop
├─ ÉlémentUniversel complet (image + 3 textes optionnels)
├─ GrilleComposition (3 modes: colonne/ligne/grille 2D)  
├─ Panel propriétés contextuel
├─ Éditeur HTML/Markdown intégré
├─ Synchronisation temps réel editor/viewer
├─ Auto-save + historique Ctrl+Z/Y (100 actions)
├─ Interface modulaire personnalisable
└─ Export projet ZIP complet

🧪 Tests validation:
• Créer un projet "Test Marketing"
• Ajouter 5 ÉlémentUniversel avec différentes configurations
• Créer 1 GrilleComposition en mode grille 2x3
• Vérifier sync temps réel viewer.html
• Tester sauvegarde/restauration F5
• Valider export ZIP
```

### **Phase 2 - Widgets Atomiques Avancés**
- BoutonAtomique + IconeAtomique + EspaceurAtomique
- Ancrage optionnel entre widgets
- Thèmes et templates prédéfinis

### **Phase 3 - Widgets Complexes Hérités**  
- Migration widgets existants vers nouveaux widgets universels
- ComparisonWidget, FeatureGridWidget, CallToActionWidget
- Tests compatibilité et migration données

### **Phase 4 - Optimisations & Extensions**
- Performance grandes grilles (lazy loading)
- Widgets vidéo, audio (extensibilité)
- API plugins pour widgets tiers

### **Phase 5 - Finalisation Production**
- Documentation utilisateur complète
- Tests extensifs multi-navigateurs  
- HeaderWidget éditable pour viewers
- Templates prêts-à-utiliser

## 📋 SPÉCIFICATIONS TECHNIQUES FINALES

### Structure Projet
```
Final/
├─ index.html                    (éditeur principal)
├─ css/
│  ├─ core.css                  (styles éditeur)
│  ├─ widgets.css               (styles widgets)
│  └─ themes.css                (thèmes prédéfinis)
├─ js/
│  ├─ core/
│  │  ├─ Editor.js             (classe principale)
│  │  ├─ Grid.js               (grille infinie)
│  │  ├─ DragDrop.js           (système drag & drop)
│  │  ├─ Persistence.js        (auto-save + historique)
│  │  └─ Sync.js               (synchronisation viewer)
│  ├─ widgets/
│  │  ├─ ElementUniversel.js   (widget universel)
│  │  ├─ GrilleComposition.js  (compositeur grilles)
│  │  ├─ BoutonAtomique.js     
│  │  └─ (autres widgets...)
│  └─ lib/
│     ├─ markdown-parser.js    (parsing Markdown)
│     ├─ emoji-picker.js       (sélecteur emoji)
│     └─ html-sanitizer.js     (sécurisation HTML)
├─ assets/
│  ├─ icons/                   (icônes interface)
│  └─ templates/               (templates prédéfinis)
└─ projects/
   └─ [nom-projet]/
      ├─ editor/               (fichiers éditeur)  
      ├─ viewer/               (viewer synchronisé)
      └─ exports/              (archives ZIP)
```

### API Requirements
```json
{
  "dependencies": {
    "marked": "^4.0.0",
    "dompurify": "^2.4.0", 
    "emoji-picker-element": "^1.15.0",
    "file-saver": "^2.0.5",
    "jszip": "^3.10.1"
  },
  "features": {
    "drag-drop-api": "native HTML5",
    "file-system-access": "modern browsers",
    "local-storage": "extended with compression",
    "css-grid": "native support",
    "es6-modules": "required"
  }
}
```

### Contraintes Performance
- **Grille infinie** : Virtualisation DOM pour grilles > 1000 widgets
- **Auto-save** : Compression JSON + debounce pour éviter surcharge
- **Synchronisation** : WebSocket local ou polling optimisé < 500ms
- **Mémoire** : Lazy loading widgets non-visibles
- **Export** : Génération asynchrone avec progress bar

## 🎯 CRITÈRES DE VALIDATION

### Validation Technique (Automatique)
✅ Tous widgets créables depuis banque  
✅ Propriétés modifiables via panel  
✅ HTML/Markdown rendu correctement  
✅ Sync editor/viewer < 500ms  
✅ Sauvegarde/restauration F5 parfaite  
✅ Export ZIP contient tout  
✅ Interface entièrement personnalisable  
✅ Performance fluide 50+ widgets  

### Validation Fonctionnelle (Humaine)
👤 **Utilisateur débutant** peut créer page complète en < 30min  
👤 **Sync temps réel** visible dans viewer séparé  
👤 **Toute modification** sauvée et restaurée  
👤 **Glisser-déposer** intuitif et précis  
👤 **Interface moderne** et responsive  

---

## ✅ **DOCUMENTATION FINALE - PRÊTE POUR VALIDATION**

**Cette spécification reflète-t-elle fidèlement votre vision élargie ?**

🔹 **Widgets universels** ÉlémentUniversel + GrilleComposition  
🔹 **Éditeur HTML/Markdown** avec rendu temps réel  
🔹 **Synchronisation parfaite** editor ↔ viewer  
🔹 **Interface modulaire** complètement personnalisable  
🔹 **Architecture extensible** pour widgets futurs  
🔹 **Performance optimisée** sans limites artificielles  

**Une fois validé → Démarrage Phase 1 immédiat ! 🚀**