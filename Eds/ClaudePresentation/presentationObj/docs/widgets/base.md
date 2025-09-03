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

