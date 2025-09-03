# Feuille de route

Ce document présente la trajectoire de développement du framework de widgets de GeeknDragon.

## 0. MVP : BaseWidget, widgets atomiques et GrilleCanvas
**Objectif :** disposer d'une base fonctionnelle minimale sur laquelle bâtir les phases ultérieures.

**Livrables :**
- `BaseWidget` gérant cycle de vie et propriétés communes.
- Bibliothèque de widgets atomiques (Bouton, Texte, Champ de saisie, Image).
- `GrilleCanvas` permettant l'agencement des widgets sur une grille.

**Critères d'acceptation limités :**
- Chaque widget atomique peut être instancié, configuré et détruit sans erreur.
- La `GrilleCanvas` positionne et redimensionne les widgets au sein d'une grille réactive.
- Documentation succincte et exemples de code pour les éléments ci-dessus.
- Tests unitaires de base pour `BaseWidget` et deux widgets atomiques.

## 1. Jalons ultérieurs

### Phase 1 – Widgets composés
**Objectif :** combiner les widgets atomiques pour créer des composants usuels (ex : carte, formulaire).
**Critères d'acceptation limités :**
- Deux widgets composés publiés avec tests unitaires.
- Chaque widget composé expose au moins une option de configuration.

### Phase 2 – Gestion d'état et persistance
**Objectif :** centraliser l'état des widgets et synchroniser avec un stockage local.
**Critères d'acceptation limités :**
- Un gestionnaire d'état global disponible.
- Sauvegarde/restauration de l'état dans `localStorage`.

### Phase 3 – Connecteurs externes
**Objectif :** permettre la communication avec des API externes pour alimenter les widgets.
**Critères d'acceptation limités :**
- Connecteur HTTP minimal avec authentification par jeton.
- Exemple d'intégration affichant des données distantes dans un widget.

### Phase 4 – Personnalisation et thèmes
**Objectif :** offrir un système de thèmes pour adapter l'apparence des widgets.
**Critères d'acceptation limités :**
- Deux thèmes prédéfinis avec documentation.
- API pour surcharger les variables de thème.

### Phase 5 – Documentation et distribution
**Objectif :** préparer la diffusion publique de la bibliothèque.
**Critères d'acceptation limités :**
- Guide de démarrage rapide.
- Publication d'une version `1.0.0` empaquetée.

