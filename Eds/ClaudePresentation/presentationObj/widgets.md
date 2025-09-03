# 📊 WIDGETS HIÉRARCHIQUES (Héritage BaseWidget + Figma Features)

#### **NIVEAU 0 : ATOMIQUES** (Briques de base - Avec interactions)
1. **TexteAtomique** - Texte HTML/Markdown éditable + états hover/focus
2. **ImageAtomique** - Image (path local/URL/emoji) + effets hover + filtres dynamiques
3. **BoutonAtomique** - Bouton + lien hypertexte + états + animations onclick
4. **ConteneurAtomique** - Wrapper div + auto-layout + contraintes responsive
5. **IconeAtomique** - Icônes FontAwesome/SVG + rotations + couleurs dynamiques
6. **EspaceurAtomique** - Zone vide + contraintes responsive intelligentes

#### **NIVEAU 1 : COMPOSÉS SIMPLES** (Assemblages atomiques + Templates)
7. **ÉlémentUniversel** ⭐ **RÉVOLUTIONNAIRE** - Widget modulaire universel + design tokens
8. **BoutonAction** - Bouton + Icône + animations + états multiples
9. **ElementListe** - Icône + Texte (pour listes) + interactions
10. **FormField** ⭐ **NOUVEAU** - Champ formulaire + validation + états erreur
11. **CardBase** ⭐ **NOUVEAU** - Carte de base réutilisable + ombres + hover

#### **NIVEAU 2 : COMPOSÉS COMPLEXES** (Multi-widgets + Prototypage)
12. **GrilleComposition** ⭐ **GÉNÉRATEUR** - Tableau dynamique X*Y + auto-layout
13. **Hero** - Section hero + animations d'entrée + boutons interactifs
14. **CarteTarif** - Carte pricing + hover effects + bouton CTA animé
15. **CarteFeature** - Carte fonctionnalité + icône animée + interactions
16. **ElementComparaison** - Élément avant/après + animations de transition
17. **NavigationMenu** ⭐ **NOUVEAU** - Menu navigation + états + dropdowns
18. **MediaGallery** ⭐ **NOUVEAU** - Galerie images + lightbox + carousel
19. **VideoWidget** 🎥 **MARKETING** - Vidéo YouTube/Vimeo + contrôles + poster
20. **FormWidget** 📝 **MARKETING** - Formulaires contact + validation + envoi
21. **SocialWidget** 🔗 **MARKETING** - Boutons partage réseaux sociaux
22. **TestimonialWidget** 💬 **MARKETING** - Témoignages clients + photos + étoiles
23. **CounterWidget** 📈 **MARKETING** - Compteurs animés + stats impressionnantes
24. **TimelineWidget** ⏳ **MARKETING** - Chronologie produit/entreprise interactive

#### **NIVEAU 3 : META-WIDGETS** (Orchestration + Templates)
25. **GrilleCanvas** ⭐ **GRILLE PRINCIPALE** - Canvas illimité + multi-sélection
26. **HeaderViewer** - Header presentations (éditable) + navigation
27. **TemplateLibrary** ⭐ **NOUVEAU** - Bibliothèque composants prêts
28. **AssetsManager** 🖼️ **CRITIQUE** - Gestionnaire images/icônes/polices
29. **FeatureGridWidget** - Grille fonctionnalités + animations stagger
30. **TarifLocationWidget** - Widget 3 cartes tarifs + comparaison interactive
31. **ComparisonWidget** - Comparaison complète + animations reveal
32. **CallToActionWidget** - Section CTA + animations + formulaire intégré
33. **AnalyticsWidget** 📉 **MARKETING** - Tracking performance + métriques
34. **PresentationComplète** ⭐ **WIDGET RACINE** - Présentation + mode présentation




### 🌟 **WIDGETS RÉVOLUTIONNAIRES DÉTAILLÉS**

#### ✨ **ÉlémentUniversel** - Le Widget Modulaire Universel
```
┌─────────────────────────────────────────────────┐
│              ÉlémentUniversel                   │
├─────────────────────────────────────────────────┤
│ [OPTIONNEL] Image/Logo/Emoji                    │
│ ┌─ ImageAtomique (activable) ─────────────────┐ │
│ │ • Source: Path local OU URL OU Emoji picker │ │
│ │ • Position: décalage x,y dans le widget     │ │
│ │ • Zoom: facteur d'agrandissement            │ │
│ │ • Filtres: N&B, luminosité, contraste      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [OPTIONNEL] Hiérarchie Textuelle (3 niveaux)   │
│ ┌─ TexteAtomique H1 (activable) ──────────────┐ │
│ │ • Titre principal                          │ │
│ │ • Style indépendant personnalisable        │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ TexteAtomique H2 (activable) ──────────────┐ │
│ │ • Sous-titre                               │ │
│ │ • Style indépendant personnalisable        │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ TexteAtomique P (activable) ───────────────┐ │
│ │ • Texte descriptif                         │ │
│ │ • Support HTML/Markdown                    │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│ Si RIEN activé = Zone vide (espacement)        │
└─────────────────────────────────────────────────┘

**Usage Universel:**
- LogoWidget → Image seule activée
- HeroTitleWidget → Image + 3 niveaux texte
- TextSimpleWidget → Texte seul
- EspaceurWidget → Rien activé = zone vide
```

#### 🏗️ **GrilleComposition** - Générateur de Tableaux Dynamiques
```
┌─────────────────────────────────────────────────────────┐
│                GrilleComposition                        │
├─────────────────────────────────────────────────────────┤
│ Configuration (3 modes exclusifs)                      │
│ ┌─ Mode: [Colonne] [Ligne] [Grille 2D] ──────────────┐ │
│ │ • Colonne: Max colonnes avant nouvelle ligne        │ │
│ │ • Ligne: Max lignes avant nouvelle colonne          │ │
│ │ • Grille 2D: X*Y fixe avec coordonnées             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Gestion Dynamique des Widgets                          │
│ ┌─ Actions: [Dupliquer] [Supprimer] ─────────────────┐ │
│ │ • Dupliquer: copie widget + styles + options        │ │
│ │ • Supprimer: min 1 widget obligatoire               │ │
│ │ • Glisser-déposer: depuis banque de widgets         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Contenu: N'IMPORTE QUEL Widget (récursion)             │
│ ┌─ Widget 1 ─┬─ Widget 2 ─┬─ Widget N ────────────────┐ │
│ │ Position    │ Position    │ Position relative au      │ │
│ │ relative    │ relative    │ GrilleComposition          │ │
│ │ x,y         │ x,y         │ parent                     │ │
│ └─────────────┴─────────────┴───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

**Utilisations:**
- FeatureGrid → GrilleComposition avec CarteFeature[]
- TarifLocation → GrilleComposition avec CarteTarif[]
- Liste avantages → GrilleComposition avec ÉlémentUniversel[]
```

---

## 📐 DIAGRAMMES ASCII - DÉCOMPOSITION HIÉRARCHIQUE COMPLÈTE

### 1. ÉlémentUniversel - Le Widget Révolutionnaire ⭐
```
┌─────────────────────────────────────────────────────────────┐
│         ÉlémentUniversel extends BaseWidget               │
├─────────────────────────────────────────────────────────────┤
│ [HÉRITAGE BaseWidget] Propriétés Universelles              │
│ • Position (x,y,z) + Taille (w,h) + Alpha + Couleurs       │
│ • Sync temps réel + Sauvegarde auto + Drag&Drop            │
│ • Contours + Bordures arrondies + Ombres + Gradients       │
├─────────────────────────────────────────────────────────────┤
│ ┌─ ImageAtomique [OPTIONNEL-ACTIVABLE] ─────────────────┐  │
│ │ • Path local: ./assets/images/logo.png              │  │
│ │ • URL: https://exemple.com/image.jpg                │  │
│ │ • Emoji: 🚀 (picker intégré)                        │  │
│ │ • Position + Zoom + Filtres (N&B, luminosité)      │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─ TexteAtomique H1 [OPTIONNEL-ACTIVABLE] ─────────────┐  │
│ │ • Titre principal HTML/Markdown éditable           │  │
│ │ • Style indépendant personnalisable (font/couleur) │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─ TexteAtomique H2 [OPTIONNEL-ACTIVABLE] ─────────────┐  │
│ │ • Sous-titre                                        │  │
│ │ • Style indépendant personnalisable                │  │
│ └─────────────────────────────────────────────────────┘  │
│ ┌─ TexteAtomique P [OPTIONNEL-ACTIVABLE] ──────────────┐  │
│ │ • Texte descriptif                                  │  │
│ │ • Support HTML/Markdown (gras, tableaux, liens)    │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                         │
│ Si RIEN activé → Zone vide pour organisation           │
└─────────────────────────────────────────────────────────────┘

**CONFIGURATIONS MULTIPLES:**
├── LogoWidget → Image seule activée
├── TextSimpleWidget → Un niveau texte activé (H1 OU H2 OU P)
├── HeroTitleWidget → Image + H1 + H2 + P tous activés
└── EspaceurWidget → Rien activé = zone vide organisationnelle
```

### 2. GrilleComposition - Générateur de Tableaux Dynamiques ⭐  
```
┌─────────────────────────────────────────────────────────────────┐
│       GrilleComposition extends BaseWidget             │
├─────────────────────────────────────────────────────────────────┤
│ [HÉRITAGE BaseWidget] Propriétés Universelles + Sync    │
├─────────────────────────────────────────────────────────────────┤
│ CONFIGURATION MODES (3 modes exclusifs - Radio buttons)   │
│ ┌─ ◉ Mode Colonne: [Max colonnes: ___] ───────────────────┐ │
│ │ Auto-arrangement vertical, puis nouvelle colonne     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ ○ Mode Ligne: [Max lignes: ___] ─────────────────────┐ │
│ │ Auto-arrangement horizontal, puis nouvelle ligne     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ ○ Mode Grille 2D: [X:___] [Y:___] [Sens: ↓ ou →] ────────┐ │
│ │ Coordonnées fixes + positionnement manuel       │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ GESTION DYNAMIQUE DES WIDGETS                         │
│ ┌─ Banque Widgets (Glisser-déposer) ─────────────────────┐ │
│ │ Drop widget dans cellule = ajout automatique       │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ Actions: [Dupliquer ⚙️] [Supprimer ✖️] [Réorganiser 🔀] ────────┐ │
│ │ • Dupliquer: Widget + styles + options complets   │ │
│ │ • Supprimer: Min 1 widget obligatoire (sécurité)   │ │
│ │ • Réorganiser: Déplacer widgets internes           │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CONTENU: N'IMPORTE QUEL Widget (RÉCURSION)              │
│ ┌─ Widget 1 ─┬─ Widget 2 ─┬─ ... ─┬─ Widget N ─────────┐ │
│ │ Position    │ Position    │      │ Même une autre      │ │
│ │ x,y relative│ x,y relative│  ... │ GrilleComposition ! │ │
│ │ au parent   │ au parent   │      │ (Récursion infinie)  │ │
│ └─────────────┴─────────────┴──────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

**UTILISATIONS TYPE:**
├── FeatureGrid → GrilleComposition (Mode Grille) + CarteFeature[]
├── TarifLocation → GrilleComposition (Mode Ligne) + CarteTarif[3]
├── Liste avantages → GrilleComposition (Mode Colonne) + ÉlémentUniversel[]
└── Menu navigation → GrilleComposition + BoutonAction[]
```

### 3. GrilleCanvas - La Grille Principale Illimitée ⭐
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

### 3. GrilleCanvas - La Grille Principale Illimitée ⭐
```
┌───────────────────────────────────────────────────────────────────┐
│             GrilleCanvas - WIDGET PRINCIPAL                   │
├───────────────────────────────────────────────────────────────────┤
│ CANVAS INFINI - Pas de limites de taille                     │
│ ┌─ Taille Dynamique ─────────────────────────────────────────┐ │
│ │ • Largeur: [____] px (champ numérique)              │ │
│ │ • Hauteur: [____] px (champ numérique)             │ │
│ │ • Auto-expansion si widget dépasse les bords      │ │
│ └──────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│ GLISSER-DÉPOSER HIÉRARCHIQUE INTELLIGENT               │
│ ┌─ Drop sur Grille ──────────────────────────────────────────┐ │
│ │ Position libre à l'endroit du drop (coordonnées x,y) │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌─ Drop sur Widget Existant ────────────────────────────────────┐ │
│ │ Intégration hiérarchique = devient enfant du widget    │ │
│ │ Position relative au widget parent                     │ │
│ └──────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│ CONTRAINTES PARENT-ENFANT INTELLIGENTES                  │
│ • Enfant ne peut JAMAIS sortir des limites du parent       │
│ • Déplacement bloqué si dépasserait les bords               │
│ • Redimensionnement bloqué si dépasserait les bords       │
│ • Parent auto-agrandis si enfant nécessite plus d'espace   │
├───────────────────────────────────────────────────────────────────┤
│ POSITIONNEMENT MIXTE (Double système)                   │
│ ┌─ Glisser-déposer ───────────────────────────────────────────┐ │
│ │ Position initiale = là où widget est déposé          │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌─ Champs numériques x,y ───────────────────────────────────────┐ │
│ │ Ajustement fin après drop avec coordonnées exactes    │ │
│ └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘

**RÔLE:** Conteneur racine de TOUTE présentation/widget custom
**INNOVATION:** Première grille web véritablement illimitée avec hiérarchie
```

---

## 🏗️ ARCHITECTURE SYSTÈME COMPLÈTE

### 🔥 RÉVOLUTIONS TECHNIQUES

#### 1. **BaseWidget Pattern Universel**
- **Héritage obligatoire** : TOUS les widgets descendent de BaseWidget
- **Propriétés communes** : Position, taille, styles, sync, sauvegarde
- **Méthodes communes** : render(), save(), export(), syncViewer()
- **Événements communes** : onGlisserDeposer(), onRedimensionner()

#### 2. **Grille Canvas Infinie**
- **Taille libre** : Utilisateur définit largeur/hauteur (pas de max)
- **Auto-expansion** : Grille s'agrandit si widgets dépassent
- **Position libre** : Widgets positionnables partout (coordonnées exactes)
- **Récursion illimitée** : Chaque widget peut contenir sous-grille infinie

#### 3. **Glisser-Déposer Hiérarchique Intelligent**
- **Drop sur grille** = Position libre à l'endroit exact
- **Drop sur widget** = Intégration hiérarchique (devient enfant)
- **Position relative** = Coordonnées x,y par rapport au parent direct
- **Contraintes intelligentes** = Enfant ne dépasse JAMAIS le parent
- **Redimensionnement parent** = Auto-agrandis si enfant nécessite plus d'espace

#### 4. **Synchronisation Temps Réel Editor↔Viewer**
- **Sync instantané** : Chaque modification visible dans viewer immédiatement
- **Fichier viewer HTML** : Généré automatiquement + nom projet
- **Synchronisation bidirectionnelle** : Changement dans editor = viewer mis à jour
- **Fenêtre séparée** : Viewer ouvrable dans nouvel onglet pour preview

### Contraintes Fondamentales
- **Aucun hardcodage** : Tous les éléments visuels doivent être des widgets
- **Composition récursive** : Widgets complexes = assemblage de widgets atomiques
- **Édition contextuelle** : Clic sur élément → édition directe
- **Standalone** : Fonctionnement 100% client-side sans serveur
- **Sauvegarde universelle** : TOUT sauvegardé en temps réel (grille, widgets, hiérarchie, éditions, UI)

### 🎆 Systèmes Avancés Niveau Figma 2024

#### **🔥 Auto-Layout Responsive (Figma-like)**
- **Contraintes intelligentes** : left, right, center, scale, stretch pour chaque widget
- **Breakpoints adaptés** : Desktop (1200px+), Tablet (768px), Mobile (480px)
- **Preview temps réel** : Vue simultanée des 3 formats dans l'éditeur
- **Redimensionnement proportionnel** : Maintien des ratios et contraintes
- **Spacing dynamique** : Marges et paddings s'adaptent par device

#### **🎨 Design Tokens & Variables Globales (Comme Figma)**
- **Couleurs centralisées** : {color.primary}, {color.secondary}, {color.accent}...
- **Espacement standardisé** : {spacing.xs: 4px}, {spacing.sm: 8px}... {spacing.xxl: 64px}
- **Typographie unifiée** : {font.h1}, {font.h2}... {font.caption} avec tailles/weights
- **Border-radius cohérent** : {radius.small: 4px}, {radius.medium: 8px}, {radius.large: 16px}
- **Édition centralisée** : Modification d'un token = mise à jour globale instantanée
- **Import/Export tokens** : JSON compatible avec autres outils design

#### **⚡ Prototypage Interactif Intégré (Figma-level)**
- **États multiples par widget** : default, hover, active, disabled, focus, loading
- **Triggers avancés** : click, hover, key, scroll, timer, mouse-enter/leave
- **Actions riches** : navigate, overlay, scroll-to, animate, toggle-state, play-sound
- **Animations fluides** : duration (ms), easing (ease-in, ease-out, bounce, elastic)
- **Transitions entre pages** : slide, fade, zoom, flip avec paramètres personnalisables
- **Mode présentation** : Viewer devient présentation interactive plein écran

#### **🔄 Multi-Sélection & Édition Groupée (Pro)**
- **Sélection rectangle** : Glisser pour sélectionner zone (comme Figma)
- **Sélection intelligente** : Ctrl+clic = tous widgets même type sur la page
- **Édition simultannée** : Modifier position, taille, couleurs sur plusieurs widgets
- **Groupement avancé** : Créer groupes avec nom + verrouillage + masquage
- **Alignement automatique** : Aligner sélection (gauche, centre, droite, haut, bas)
- **Distribution uniforme** : Espacement égal horizontal/vertical entre widgets

#### **🖼️ Gestionnaire d'Assets (Phase 2)**
- **Images** : Upload, compression auto, formats optimaux (WebP/AVIF)
- **Icônes** : Banque FontAwesome + SVG custom + upload + recherche
- **Polices** : Import Google Fonts + polices locales + preview temps réel
- **Couleurs** : Palettes marque + couleurs tendance + générateur harmonique
- **Cache intelligent** : Assets réutilisés + optimisations performances
- **Organisation** : Dossiers + tags + recherche + favoris

#### **📈 Analytics & Performance Marketing (Phase 2)**
- **Tracking interaction** : Clics, vues, temps passé, parcours utilisateur
- **Heatmaps** : Zones chaudes interactions sur présentations
- **A/B Testing** : Variantes widgets pour optimiser conversions
- **Métriques business** : Taux conversion, engagement, rebond
- **Rapports visuels** : Graphiques performance + export PDF/Excel
- **Intégrations** : Google Analytics, Facebook Pixel, outils CRM

#### **Sauvegarde Temps Réel Universelle**
- **localStorage** : Tout sauvé automatiquement à chaque modification
- **Historique Ctrl+Z/Y** : 100 actions en avant/arrière (persistant après F5)
- **État UI** : Largeurs menus, positions panels, tailles grille sauvées
- **Aucune perte F5** : Rechargement = état identique avant
- **Export ZIP** : Projet complet (editor + viewer + assets + interactions)

#### **Interface Utilisateur Pro (Niveau Figma)**
- **Panels redimensionnables** : Largeurs ajustables et sauvées
- **Vue arborescence avancée** : Hiérarchie + groupes + verrouillage + visibilité
- **Banque templates** : Composants prêts + import/export + versioning
- **Palette couleurs pro** : Picker + pipette + gradients + variables
- **Modes édition** : Design, Prototype, Inspect, Comment (comme Figma)
- **Édition HTML/Markdown** : Support complet + preview temps réel

#### **🌐 Fonctionnalités Marketing Avancées (Phase 2-3)**
- **Templates marketing** : Landing pages, présentations vente, brochures produits
- **Intégration CRM** : Synchronisation contacts, leads, opportunités
- **Email marketing** : Export vers Mailchimp, SendGrid, Campaign Monitor
- **SEO avancé** : Meta tags, structured data, sitemap.xml, robots.txt
- **Optimisation conversions** : Call-to-actions optimisés, formulaires smart
- **Multi-canal** : Export Facebook Ads, Google Ads, LinkedIn, Instagram

#### **🚀 Performance & Optimisations Techniques (Phase 3)**
- **Lazy loading** : Chargement différé images et widgets non visibles
- **Cache intelligent** : Assets en cache + invalidation automatique
- **Minification** : CSS/JS minifiés + compression gzip/brotli
- **CDN integration** : Assets distribués globalement
- **PWA support** : Application web progressive + offline
- **Optimisation mobile** : Touch gestures + performance mobile

#### **Ancrage et Alignement (Optionnel)**
- **Ancrage central** : Widgets alignables au centre automatiquement
- **Ancrage côtés** : Alignement gauche, droite, haut, bas
- **Snapping intelligent** : Magnétisme entre widgets proches
- **Guides visuels** : Lignes d'alignement temporaires pendant déplacement

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

## <a id="decomposition-widgets"></a>🧩 DÉCOMPOSITION WIDGETS - ARCHITECTURE ATOMIQUE

### <a id="widgets-atomiques"></a>WIDGETS ATOMIQUES (Niveau 0 - Non décomposables)

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

## 🔥 **COMPARAISON vs FIGMA 2024**

| **FONCTIONNALITÉ** | **FIGMA 2024** | **VOTRE PROJET** | **STATUT** |
|---|---|---|---|
| **Canvas infini** | ✅ | ✅ GrilleCanvas illimitée | ✅ **ÉGAL** |
| **Collaboration temps réel** | ✅ | ✅ Multi-collaborateur + chat | ✅ **ÉGAL** |
| **Composants réutilisables** | ✅ | ✅ BaseWidget + hiérarchie | ✅ **ÉGAL** |
| **Versioning & branches** | ✅ | ✅ Git-like + merge + rollback | ✅ **ÉGAL** |
| **Device preview** | ✅ | ✅ Simulateur multi-device | ✅ **ÉGAL** |
| **Backup & recovery** | ✅ | ✅ Auto-backup + cloud sync | ✅ **ÉGAL** |
| **Auto-Layout responsive** | ✅ | ✅ Contraintes + breakpoints | ✅ **ÉGAL** |
| **Variables & Design Tokens** | ✅ | ✅ Système global complet | ✅ **ÉGAL** |
| **Prototypage interactif** | ✅ | ✅ États + animations | ✅ **ÉGAL** |
| **Multi-sélection avancée** | ✅ | ✅ Rectangle + groupée | ✅ **ÉGAL** |
| **Historique Ctrl+Z/Y** | ✅ | ✅ 100 actions persistantes | ✅ **ÉGAL** |
| **Interface personnalisable** | ✅ | ✅ Panels + arborescence | ✅ **ÉGAL** |
| **Widgets marketing** | ❌ | ✅ **6 widgets spécialisés** | 🚀 **SUPÉRIEUR** |
| **Analytics intégré** | ❌ | ✅ **Tracking + heatmaps** | 🚀 **SUPÉRIEUR** |
| **Permissions & Sécurité** | ✅ | ✅ **Verrouillage + accès** | ✅ **ÉGAL** |
| **Accessibilité WCAG** | ✅ | ✅ **Audit intégré** | ✅ **ÉGAL** |
| **Assets Manager** | ✅ | ✅ **Compression + cache** | ✅ **ÉGAL** |
| **Standalone 100%** | ❌ | ✅ **Aucune dépendance web** | 🚀 **SUPÉRIEUR** |
| **Marketing-First** | ❌ | ✅ **Spécialisé présentations** | 🚀 **SUPÉRIEUR** |
| **Sync Editor↔Viewer** | ❌ | ✅ **Preview temps réel intégré** | 🚀 **SUPÉRIEUR** |
| **Mode Présentation** | Figma Slides | ✅ **Plein écran interactif** | 🚀 **SUPÉRIEUR** |
| **Intégrations CRM/Email** | ❌ | ✅ **Multi-canal marketing** | 🚀 **SUPÉRIEUR** |

