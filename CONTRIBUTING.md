# Guide de contribution

Ce projet repose sur une architecture orientée objet centrée sur deux composants principaux :

- **BaseWidget** : classe de base pour tous les widgets. Elle gère l'identifiant, la position, la taille, les styles et l'émission d'événements.
- **WidgetStateManager** : service singleton responsable de l'enregistrement des widgets, de la persistance de leur état et de la synchronisation entre onglets.

## Principes architecturaux

1. **Héritage** : tout nouveau widget doit étendre `BaseWidget` et respecter son API publique.
2. **Séparation des responsabilités** : la logique de rendu appartient aux widgets, la gestion de l'état au `WidgetStateManager`.
3. **Événements** : utilisez `on`, `off` et `emit` de `BaseWidget` pour la communication interne.
4. **Persistance** : appelez `saveState()` et `loadState()` lorsque nécessaire pour synchroniser l'état.

## Flux de travail

- Forkez le dépôt puis créez vos branches de fonctionnalité.
- Assurez-vous que `npm test` et `npm run lint` passent avant toute proposition de fusion.
- Documentez vos classes avec JSDoc afin de clarifier les propriétés disponibles.
- Utilisez `npm run format` pour appliquer les règles Prettier.

Merci de contribuer !
