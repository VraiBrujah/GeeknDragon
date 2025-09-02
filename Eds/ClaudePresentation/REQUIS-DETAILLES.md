# 📋 SPÉCIFICATIONS DÉTAILLÉES - ÉDITEUR DE WIDGETS HIÉRARCHIQUE

## 🎯 VISION GÉNÉRALE
Éditeur WYSIWYG modulaire pour création de pages marketing avec système de widgets composables hiérarchiques infinis, édition contextuelle directe, drag & drop intégré et sauvegarde temps réel.

---

## 🎨 ANALYSE WIDGETS ACTUELS - DIAGRAMMES ASCII HIÉRARCHIQUES

### ORDRE DES WIDGETS (selon priorité utilisateur)
1. **TextSimpleWidget** - Widget de texte éditable
2. **LogoWidget** - Widget logo avec image  
3. **ImageAnimatedWidget** - Widget image avec animations
4. **HeaderWidget** ⭐ **NOUVEAU** - Header pour viewer (éditable)
5. **HeroTitleWidget** - Section hero avec titre/sous-titre/texte
6. **FeatureGridWidget** - Grille de fonctionnalités
7. **PricingCardWidget** - Carte de prix individuelle
8. **TarifLocationWidget** - Widget 3 cartes tarifs
9. **ComparisonWidget** - Widget de comparaison avant/après
10. **CallToActionWidget** - Section appel à l'action




---

## 📐 DIAGRAMMES ASCII - DÉCOMPOSITION HIÉRARCHIQUE

### 1. TextSimpleWidget - Structure Actuelle
```
┌─────────────────────────────────────┐
│           TextSimpleWidget          │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique ─────────────┐ │
│ │ • Background (couleur/gradient) │ │
│ │ • Border (style/width/radius)   │ │ 
│ │ • Padding (tous côtés)          │ │
│ │ • Shadow (optionnel)            │ │
│ │ ┌─ TexteAtomique ─────────────┐ │ │
│ │ │ • Contenu text éditable     │ │ │
│ │ │ • Font, taille, couleur     │ │ │
│ │ │ • Gras, italique           │ │ │
│ │ │ • Alignement (L/C/R)       │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (background, border, padding, shadow)
└── TexteAtomique (contenu, style, alignement)
```

### 2. LogoWidget - Structure Actuelle  
```
┌─────────────────────────────────────┐
│            LogoWidget               │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique ─────────────┐ │
│ │ • Background avec opacité       │ │
│ │ • Border configurable          │ │
│ │ • Border-radius                 │ │
│ │ • Shadow optionnelle            │ │
│ │ • Container padding X/Y         │ │
│ │ ┌─ ImageAtomique ─────────────┐ │ │
│ │ │ • Source image (upload/URL) │ │ │
│ │ │ • Alt text                  │ │ │
│ │ │ • Dimensions (W x H)        │ │ │
│ │ │ • Position dans conteneur   │ │ │
│ │ │ • Image fit (contain/cover) │ │ │
│ │ │ • Lien href optionnel       │ │ │
│ │ │ • Hover effect              │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper visuel)
└── ImageAtomique (image + propriétés)
```

### 3. ImageAnimatedWidget - Structure Actuelle
```
┌─────────────────────────────────────┐
│        ImageAnimatedWidget          │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique ─────────────┐ │
│ │ • Animation CSS (float/pulse)   │ │
│ │ • Container alignment           │ │
│ │ • Container padding configurable│ │
│ │ • Background optionnel          │ │
│ │ ┌─ ImageAtomique ─────────────┐ │ │
│ │ │ • Image source              │ │ │
│ │ │ • Dimensions configurables  │ │ │
│ │ │ • Alt text                  │ │ │
│ │ │ • Image fit modes           │ │ │
│ │ │ • Transform effects         │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper + animations CSS)
└── ImageAtomique (image de base)
```

### 4. HeaderWidget ⭐ NOUVEAU - À Créer
```
┌─────────────────────────────────────┐
│            HeaderWidget             │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique (header-bg) ─┐ │
│ │ • Background gradient/couleur   │ │
│ │ • Border-bottom                 │ │
│ │ • Padding global                │ │
│ │ • Shadow optionnelle            │ │
│ │ ┌─ ConteneurAtomique (left) ─┐ │ │
│ │ │ ┌─ LogoWidget ───────────┐ │ │ │
│ │ │ │ └─ ImageAtomique + Icon│ │ │ │
│ │ │ └───────────────────────┘ │ │ │
│ │ │ ┌─ TexteAtomique ───────┐ │ │ │
│ │ │ │ • Nom entreprise       │ │ │ │
│ │ │ └───────────────────────┘ │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (right)─┐ │ │
│ │ │ ┌─ TexteAtomique ───────┐ │ │ │
│ │ │ │ • Date génération      │ │ │ │
│ │ │ └───────────────────────┘ │ │ │
│ │ │ ┌─ TexteAtomique ───────┐ │ │ │
│ │ │ │ • Info confidentiel    │ │ │ │
│ │ │ └───────────────────────┘ │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper global)
├── ConteneurAtomique (section gauche)
│   ├── LogoWidget (composé)
│   └── TexteAtomique (nom entreprise)
└── ConteneurAtomique (section droite)
    ├── TexteAtomique (date)
    └── TexteAtomique (confidentialité)
```

### 5. HeroTitleWidget - Structure Actuelle
```
┌─────────────────────────────────────┐
│           HeroTitleWidget           │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique (hero-bg) ──┐ │
│ │ • Background configurable       │ │
│ │ • Border-radius global          │ │
│ │ • Animation slide-up            │ │
│ │ ┌─ TexteAtomique (titre) ────┐ │ │
│ │ │ • Titre principal (48px)   │ │ │
│ │ │ • Couleur/gradient         │ │ │
│ │ │ • Font weight bold         │ │ │
│ │ │ • Background optionnel     │ │ │
│ │ │ • Border optionnelle       │ │ │
│ │ │ • Padding configurable     │ │ │
│ │ └───────────────────────────┘ │ │
│ │ ┌─ TexteAtomique (sous-titre)┐ │ │
│ │ │ • Sous-titre (24px)        │ │ │
│ │ │ • Style indépendant        │ │ │
│ │ └───────────────────────────┘ │ │
│ │ ┌─ TexteAtomique (texte) ────┐ │ │
│ │ │ • Description longue       │ │ │
│ │ │ • Taille configurable      │ │ │
│ │ └───────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper avec animation)
├── TexteAtomique (titre principal)
├── TexteAtomique (sous-titre)
└── TexteAtomique (description)
```

### 6. FeatureGridWidget - Structure Actuelle
```
┌─────────────────────────────────────────────────────────┐
│                FeatureGridWidget                        │
├─────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper) ─────────────────────┐ │
│ │ ┌─ TexteAtomique (titre-principal) ──────────────┐ │ │
│ │ │ • Titre de la grille                           │ │ │
│ │ └───────────────────────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (grille-features) ─────────┐ │ │
│ │ │ • Display: CSS Grid                            │ │ │
│ │ │ • Colonnes configurables (1-6)                │ │ │
│ │ │ • Gap entre éléments                           │ │ │
│ │ │ ┌─ CarteFeature (répété x N) ─────────────┐   │ │ │
│ │ │ │ ┌─ ConteneurAtomique (carte-wrapper)──┐ │   │ │ │
│ │ │ │ │ • Background de la carte            │ │   │ │ │  
│ │ │ │ │ • Border et border-radius           │ │   │ │ │
│ │ │ │ │ • Padding interne                   │ │   │ │ │
│ │ │ │ │ ┌─ IconeAtomique ──────────────┐   │ │   │ │ │
│ │ │ │ │ │ • Icône FontAwesome/Emoji     │   │ │   │ │ │
│ │ │ │ │ │ • Taille configurable         │   │ │   │ │ │
│ │ │ │ │ │ • Couleur                     │   │ │   │ │ │
│ │ │ │ │ └───────────────────────────────┘   │ │   │ │ │
│ │ │ │ │ ┌─ TexteAtomique (titre) ──────┐   │ │   │ │ │
│ │ │ │ │ │ • Titre de la fonctionnalité  │   │ │   │ │ │
│ │ │ │ │ └───────────────────────────────┘   │ │   │ │ │
│ │ │ │ │ ┌─ TexteAtomique (description)─┐   │ │   │ │ │
│ │ │ │ │ │ • Description détaillée       │   │ │   │ │ │
│ │ │ │ │ └───────────────────────────────┘   │ │   │ │ │
│ │ │ │ └─────────────────────────────────┘   │ │   │ │ │
│ │ │ └─────────────────────────────────────┘   │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper global)
├── TexteAtomique (titre principal)
├── ConteneurAtomique (grille CSS)
└── Liste de CarteFeature (widgets composés)
    └── CarteFeature (pour chaque feature):
        ├── ConteneurAtomique (wrapper carte)
        ├── IconeAtomique (icône)
        ├── TexteAtomique (titre feature) 
        └── TexteAtomique (description feature)
```

### 7. PricingCardWidget - Structure Actuelle
```
┌─────────────────────────────────────┐
│         PricingCardWidget           │
├─────────────────────────────────────┤
│ ┌─ ConteneurAtomique (carte) ─────┐ │
│ │ • Background de la carte        │ │
│ │ • Border et ombres              │ │
│ │ • Border-radius                 │ │
│ │ ┌─ ConteneurAtomique (header) ┐ │ │
│ │ │ ┌─ TexteAtomique (nom-plan)┐ │ │ │
│ │ │ │ • Nom du plan            │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ │ ┌─ BadgeAtomique (populaire)│ │ │ │
│ │ │ │ • Badge "Populaire"      │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (prix) ──┐ │ │
│ │ │ ┌─ TexteAtomique (montant) ┐ │ │ │
│ │ │ │ • Prix principal (gros)  │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ │ ┌─ TexteAtomique (période) ┐ │ │ │
│ │ │ │ • Unité (/mois, /an)     │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (features)│ │ │
│ │ │ ┌─ ElementListe (répété) ──┐ │ │ │
│ │ │ │ ┌─ IconeAtomique (✓/✗) ┐ │ │ │ │
│ │ │ │ └─ TexteAtomique (desc)┘ │ │ │ │
│ │ │ └─────────────────────────┘ │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ ┌─ BoutonAtomique (CTA) ──────┐ │ │
│ │ │ • Texte bouton              │ │ │
│ │ │ • Lien d'action             │ │ │
│ │ │ • Style selon plan          │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper carte)
├── ConteneurAtomique (header section)
│   ├── TexteAtomique (nom plan)
│   └── BadgeAtomique (badge populaire)
├── ConteneurAtomique (section prix)
│   ├── TexteAtomique (montant)
│   └── TexteAtomique (période)
├── ConteneurAtomique (liste fonctionnalités)
│   └── Liste de ElementListe:
│       ├── IconeAtomique (checkmark)
│       └── TexteAtomique (description)
└── BoutonAtomique (bouton CTA)
```

### 8. TarifLocationWidget - Structure Actuelle
```
┌───────────────────────────────────────────────────────────────────────────┐
│                         TarifLocationWidget                               │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper-global) ────────────────────────────────┐  │
│ │ ┌─ TexteAtomique (titre-principal) ────────────────────────────────┐ │  │
│ │ │ • Titre de la section tarifs                                     │ │  │
│ │ └─────────────────────────────────────────────────────────────────┘ │  │
│ │ ┌─ ConteneurAtomique (grille-3-colonnes) ─────────────────────────┐ │  │
│ │ │ • CSS Grid: repeat(3, 1fr)                                       │ │  │
│ │ │ • Responsive: 3→2→1 colonnes                                     │ │  │
│ │ │ ┌─ PricingCardWidget (Plan-1) ──────────────────────────────┐   │ │  │
│ │ │ │ [Toute la structure PricingCardWidget décrite ci-dessus]  │   │ │  │
│ │ │ └───────────────────────────────────────────────────────────┘   │ │  │
│ │ │ ┌─ PricingCardWidget (Plan-2) ──────────────────────────────┐   │ │  │
│ │ │ │ [Toute la structure PricingCardWidget décrite ci-dessus]  │   │ │  │
│ │ │ │ + Badge "Populaire" activé                                │   │ │  │
│ │ │ └───────────────────────────────────────────────────────────┘   │ │  │
│ │ │ ┌─ PricingCardWidget (Plan-3) ──────────────────────────────┐   │ │  │
│ │ │ │ [Toute la structure PricingCardWidget décrite ci-dessus]  │   │ │  │
│ │ │ └───────────────────────────────────────────────────────────┘   │ │  │
│ │ └─────────────────────────────────────────────────────────────────┘ │  │
│ │ ┌─ ConteneurAtomique (section-bonus) ─────────────────────────────┐ │  │
│ │ │ ┌─ TexteAtomique (titre-bonus) ──────────────────────────────┐ │ │  │
│ │ │ │ • Titre de la section bonus/astuce                         │ │ │  │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │  │
│ │ │ ┌─ TexteAtomique (description-bonus) ─────────────────────────┐ │ │  │
│ │ │ │ • Description/conseil supplémentaire                       │ │ │  │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │  │
│ │ └─────────────────────────────────────────────────────────────────┘ │  │
│ └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper global)
├── TexteAtomique (titre principal)
├── ConteneurAtomique (grille responsive 3 colonnes)
│   ├── PricingCardWidget (Plan 1) [widget complet]
│   ├── PricingCardWidget (Plan 2) [widget complet + badge]
│   └── PricingCardWidget (Plan 3) [widget complet]
└── ConteneurAtomique (section bonus)
    ├── TexteAtomique (titre bonus)
    └── TexteAtomique (description bonus)
```

### 9. ComparisonWidget - Structure Actuelle
```
┌─────────────────────────────────────────────────────────────────────┐
│                         ComparisonWidget                            │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper-global) ─────────────────────────────┐ │
│ │ ┌─ TexteAtomique (titre-principal) ────────────────────────────┐ │ │
│ │ │ • Titre de la comparaison                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (grille-comparaison) ─────────────────────┐ │ │
│ │ │ • CSS Grid: 1fr auto 1fr (obsolète | VS | moderne)         │ │ │ │
│ │ │ ┌─ ConteneurAtomique (colonne-obsolete) ──────────────────┐ │ │ │
│ │ │ │ ┌─ TexteAtomique (titre-obsolete) ───────────────────┐ │ │ │ │
│ │ │ │ │ • Ex: "Ancienne méthode"                           │ │ │ │ │
│ │ │ │ └───────────────────────────────────────────────────┘ │ │ │ │
│ │ │ │ ┌─ ConteneurAtomique (liste-desavantages) ───────────┐ │ │ │ │
│ │ │ │ │ ┌─ ElementComparaison (répété) ──────────────────┐ │ │ │ │ │
│ │ │ │ │ │ ┌─ IconeAtomique (emoji-negatif) ────────────┐ │ │ │ │ │ │
│ │ │ │ │ │ │ • Ex: ❌ ou 😞                              │ │ │ │ │ │ │
│ │ │ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ │ ┌─ TexteAtomique (description-probleme) ──────┐ │ │ │ │ │ │
│ │ │ │ │ │ │ • Description du problème                   │ │ │ │ │ │ │
│ │ │ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ └─────────────────────────────────────────────────┘ │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─ ConteneurAtomique (section-vs) ─────────────────────────┐ │ │ │
│ │ │ │ ┌─ TexteAtomique (texte-vs) ──────────────────────────┐ │ │ │ │
│ │ │ │ │ • Texte "VS" stylisé                               │ │ │ │ │
│ │ │ │ │ • Background personnalisable                       │ │ │ │ │
│ │ │ │ │ • Border et border-radius                          │ │ │ │ │
│ │ │ │ │ • Padding configurables                            │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─ ConteneurAtomique (colonne-moderne) ────────────────────┐ │ │ │
│ │ │ │ ┌─ TexteAtomique (titre-moderne) ────────────────────┐ │ │ │ │
│ │ │ │ │ • Ex: "Nouvelle approche"                          │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────────────┘ │ │ │ │
│ │ │ │ ┌─ ConteneurAtomique (liste-avantages) ──────────────┐ │ │ │ │
│ │ │ │ │ ┌─ ElementComparaison (répété) ──────────────────┐ │ │ │ │ │
│ │ │ │ │ │ ┌─ IconeAtomique (emoji-positif) ────────────┐ │ │ │ │ │ │
│ │ │ │ │ │ │ • Ex: ✅ ou 🚀                              │ │ │ │ │ │ │
│ │ │ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ │ ┌─ TexteAtomique (description-avantage) ──────┐ │ │ │ │ │ │
│ │ │ │ │ │ │ • Description de l'avantage                 │ │ │ │ │ │ │
│ │ │ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ └─────────────────────────────────────────────────┘ │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (conclusion) ─────────────────────────────┐ │ │
│ │ │ ┌─ TexteAtomique (message-final) ────────────────────────────│ │ │
│ │ │ │ • Message de conclusion                                   │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper global)
├── TexteAtomique (titre principal)  
├── ConteneurAtomique (grille 3 sections: obsolète|VS|moderne)
│   ├── ConteneurAtomique (colonne obsolète)
│   │   ├── TexteAtomique (titre colonne)
│   │   └── ConteneurAtomique (liste)
│   │       └── Liste de ElementComparaison:
│   │           ├── IconeAtomique (emoji négatif)
│   │           └── TexteAtomique (description problème)
│   ├── ConteneurAtomique (section VS)
│   │   └── TexteAtomique (texte "VS" stylisé)
│   ├── ConteneurAtomique (colonne moderne)  
│   │   ├── TexteAtomique (titre colonne)
│   │   └── ConteneurAtomique (liste)
│   │       └── Liste de ElementComparaison:
│   │           ├── IconeAtomique (emoji positif)
│   │           └── TexteAtomique (description avantage)
└── ConteneurAtomique (conclusion)
    └── TexteAtomique (message final)
```

### 10. CallToActionWidget - Structure Actuelle
```
┌─────────────────────────────────────────────────────────────┐
│                  CallToActionWidget                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─ ConteneurAtomique (wrapper-global-cta) ────────────────┐ │
│ │ • Background principal (couleur/gradient/image)         │ │
│ │ • Padding global de la section                          │ │
│ │ • Border-radius de la section                           │ │
│ │ ┌─ ConteneurAtomique (section-contenu) ──────────────┐ │ │
│ │ │ ┌─ TexteAtomique (titre-accrocheur) ─────────────┐ │ │ │
│ │ │ │ • Titre principal du CTA                       │ │ │ │
│ │ │ │ • Taille et style configurables                │ │ │ │
│ │ │ └───────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─ TexteAtomique (description) ──────────────────┐ │ │ │
│ │ │ │ • Texte descriptif/motivation                  │ │ │ │
│ │ │ └───────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─ ConteneurAtomique (section-boutons) ──────────┐ │ │ │
│ │ │ │ • Layout horizontal/vertical des boutons       │ │ │ │
│ │ │ │ ┌─ BoutonAtomique (bouton-principal) ─────────┐ │ │ │ │
│ │ │ │ │ • Texte du bouton                           │ │ │ │ │
│ │ │ │ │ • Lien d'action                             │ │ │ │ │
│ │ │ │ │ • Style couleur primaire                    │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │
│ │ │ │ ┌─ BoutonAtomique (bouton-secondaire) ────────┐ │ │ │ │
│ │ │ │ │ • Bouton optionnel                          │ │ │ │ │
│ │ │ │ │ • Style couleur secondaire                  │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ┌─ ConteneurAtomique (section-illustration) ──────────┐ │ │
│ │ │ ┌─ ImageAtomique (image-optionnelle) ─────────────┐ │ │ │
│ │ │ │ • Image d'illustration du CTA                   │ │ │ │
│ │ │ │ • Position configurable (gauche/droite/dessus)  │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

DÉCOMPOSITION MODULAIRE:
├── ConteneurAtomique (wrapper global avec background)
├── ConteneurAtomique (section contenu)
│   ├── TexteAtomique (titre accrocheur)
│   ├── TexteAtomique (description)
│   └── ConteneurAtomique (section boutons)
│       ├── BoutonAtomique (bouton principal)
│       └── BoutonAtomique (bouton secondaire optionnel)
└── ConteneurAtomique (section illustration)
    └── ImageAtomique (image optionnelle)
```

## 🏗️ ARCHITECTURE SYSTÈME

### Contraintes Fondamentales
- **Aucun hardcodage** : Tous les éléments visuels doivent être des widgets
- **Composition récursive** : Widgets complexes = assemblage de widgets atomiques
- **Édition contextuelle** : Clic sur élément → édition directe
- **Grille infinie** : Taille dynamique, pas de limites artificielles
- **Standalone** : Fonctionnement 100% client-side
- **Sauvegarde temps réel** : TOUT est sauvegardé automatiquement (grille, widgets, hiérarchie, éditions)

### Système de Grille Dynamique
- **Taille libre** : Utilisateur définit colonnes/lignes (pas de max)
- **Cellules en pixels** : Chaque widget a sa taille exacte en px (largeur/hauteur)
- **Marges personnalisées** : Chaque widget a ses marges en px (top/right/bottom/left)
- **Récursion illimitée** : Chaque widget peut contenir une sous-grille infinie
- **Positionnement libre** : Widgets positionnables partout sur la grille

### Système Drag & Drop Hiérarchique
- **Glisser-déposer libre** : Widgets déplaçables n'importe où sur grille principale
- **Intégration hiérarchique** : Drop sur widget → intègre dans sous-widget
- **Positionnement relatif** : Position définie par glisser-déposer OU champs numériques
- **Contraintes parent** : Widget enfant ne peut pas sortir des limites du parent
- **Redimensionnement parent** : Parent agrandi automatiquement si nécessaire
- **Profondeur z-index** : Gestion des superpositions avec contrôle de profondeur

### Édition Contextuelle Multi-niveaux
- **Panel fixe** : Panneau propriétés à droite (toujours visible)
- **Popup contextuel** : Édition rapide près de l'élément cliqué
- **Édition inline** : Double-clic sur texte pour édition directe
- **Sélection visuelle** : Highlight de l'élément sélectionné
- **Arborescence hiérarchique** : Vue Gimp-like avec noms de widgets éditables
- **Sélection par arborescence** : Clic dans arborescence pour sélectionner widget caché
- **Regroupement** : Possibilité de grouper widgets dans dossiers

### Système de Nommage et Organisation
- **Noms par défaut** : Chaque widget a un nom auto-généré éditable
- **Hiérarchie visible** : Arborescence complète avec noms personnalisés
- **Dossiers virtuels** : Regroupement de widgets pour organisation
- **Visibilité** : Show/hide widgets individuels
- **Verrouillage** : Lock/unlock pour éviter déplacements accidentels

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

**✅ VALIDATION REQUISE AVANT IMPLÉMENTATION**

Ce document reflète-t-il bien votre vision ? Y a-t-il des widgets ou fonctionnalités manquantes ?