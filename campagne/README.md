# 🐉 Gestionnaire de Campagne - Le Coffre-fort oublié

## 🎯 Description

Gestionnaire de campagne web complet et moderne pour la campagne D&D "Le Coffre-fort oublié". Interface intuitive avec thème médiéval/fantasy, navigation hiérarchique, système de musique contextuelle, et toutes les fonctionnalités essentielles pour gérer une partie de jeu de rôle.

## ✨ Fonctionnalités

### 🗺️ Navigation Hiérarchique
- **Arborescence complète** : Campagne → Actes → Lieux → Rencontres
- **Navigation intuitive** avec fil d'Ariane
- **États visuels** pour les éléments actifs/inactifs/complétés

### 👥 Gestion des Personnages
- **Fiches complètes** PJ et PNJ avec stats, PV, actions
- **Système de lancers de dés** intégré avec animations
- **Barres de vie dynamiques** avec couleurs visuelles
- **Modification en temps réel** des caractéristiques

### 🗺️ Système de Cartes
- **Affichage des cartes** avec support d'images
- **Notes épinglables** sur les cartes (click pour ajouter/modifier)
- **Système de pins** avec tooltips informatifs
- **Gestion multi-cartes** selon le contexte

### 🎒 Inventaires Intelligents
- **Inventaires séparés** PJ/PNJ avec interface visuelle
- **Transfert d'objets** entre personnages
- **Sélection multiple** pour transferts en lot
- **Ajout/suppression** d'objets en temps réel

### 🗓️ Calendrier & Temps
- **Calendrier interactif** avec événements
- **Gestion du temps** de campagne
- **Repos courts/longs** avec récupération automatique de PV
- **Événements programmés** avec alertes visuelles

### 🎵 Système Musical Contextuel
- **Musique adaptive** selon la position dans la campagne
- **Hiérarchie musicale** : combat_troll > donjon > général
- **Intégration avec le système existant** de Geek&Dragon
- **Contrôles de volume** et lecture/pause

### 📋 Gestion des Quêtes
- **Objectifs trackables** avec cases à cocher
- **Barres de progression** visuelles
- **États multiples** : actif, inactif, complété
- **Système de récompenses** intégrable

## 🛠️ Installation & Utilisation

### Prérequis
- Navigateur moderne (Chrome/Firefox/Edge)
- Accès aux fichiers musicaux dans `/musique/`
- Images de cartes dans `/images/maps/`

### Démarrage
1. Ouvrir `gestionnaire-campagne.html` dans votre navigateur
2. Le système charge automatiquement les données de "Le Coffre-fort oublié"
3. Naviguer dans l'arborescence avec le menu latéral
4. Utiliser les onglets pour accéder aux différentes fonctionnalités

### Sauvegarde
- **Auto-sauvegarde** toutes les 30 secondes dans le localStorage
- **Sauvegarde manuelle** avec le bouton "Sauvegarder"
- **Export/Import JSON** pour backup externe

## 📁 Structure des Fichiers

```
campagne/
├── gestionnaire-campagne.html          # Application principale
├── le-coffre-fort-oublie-data.json    # Données de campagne
├── images/
│   ├── maps/                           # Cartes de la campagne
│   │   ├── coffre_fort_principal.jpg
│   │   ├── salle_coeur.jpg
│   │   └── ...
│   └── characters/                     # Portraits des personnages
│       ├── petite_lumiere.jpg
│       ├── verdoyant_dragon.jpg
│       └── ...
└── README.md                          # Cette documentation
```

## 🎮 Utilisation des Fonctionnalités

### Navigation
- **Click gauche** sur un élément : naviguer
- **Expand/Collapse** : clic sur les flèches des noeuds
- **Breadcrumb** : affichage du chemin actuel

### Cartes
- **Click sur la carte** : ajouter une épingle
- **Click sur épingle** : modifier la note
- **Note vide** : supprime l'épingle
- **Bouton "Effacer"** : supprime toutes les épinges

### Personnages
- **Bouton dé** : lancer l'action correspondante
- **Bouton PV** : ajuster les points de vie (+/-)
- **Bouton Modifier** : éditer les informations du personnage

### Inventaires
- **Click objet** : sélectionner pour transfert
- **Sélection multiple** : maintenir les sélections
- **Bouton Transférer** : déplacer vers un autre personnage

### Calendrier
- **Click jour** : sélectionner la date
- **Flèches mois** : naviguer dans le calendrier
- **Repos** : récupération automatique de PV

## 🎵 Système Musical

Le système musical suit cette hiérarchie contextuelle :

1. **Contexte spécifique** : `campagne/acte3/dragon_vert/`
2. **Contexte parent** : `campagne/acte3/`
3. **Contexte général** : `campagne/`
4. **Défaut** : première musique alphabétique

### Configuration Musicale
```javascript
musicPaths: {
  "campagne": ["musique/general1.mp3", "musique/general2.mp3"],
  "campagne/acte1": ["musique/donjon.mp3"],
  "campagne/acte3/dragon_vert": ["musique/combat_boss.mp3"]
}
```

## 🔧 Personnalisation

### Ajout d'une Nouvelle Campagne
1. Dupliquer `le-coffre-fort-oublie-data.json`
2. Modifier la structure hiérarchique
3. Adapter les personnages et quêtes
4. Configurer les chemins musicaux
5. Charger avec le bouton "Charger"

### Modification du Thème
Les variables CSS sont centralisées dans `:root` :
```css
--primary-color: #8b4513;
--secondary-color: #d4af37;
--accent-color: #cd853f;
```

### Extension des Fonctionnalités
L'architecture modulaire permet d'ajouter facilement :
- Nouveaux types d'éléments
- Systèmes de règles personnalisés
- Intégrations externes (API, bases de données)
- Plugins de dés avancés

## 🐛 Résolution de Problèmes

### Musique ne joue pas
- Vérifier que les fichiers existent dans `/musique/`
- Autoriser la lecture automatique dans le navigateur
- Vérifier les chemins dans `musicPaths`

### Images de cartes manquantes
- Placer les images dans `/images/maps/`
- Vérifier les noms dans le JSON (`mapId` → `image`)
- Utiliser des formats supportés (JPG, PNG, WEBP)

### Perte de données
- Vérifier le localStorage du navigateur
- Utiliser les boutons Sauvegarder/Charger
- Garder des backups JSON réguliers

## 🎯 Roadmap

### Version 1.1
- [ ] Système de macros de dés personnalisées
- [ ] Export PDF des fiches personnages
- [ ] Mode sombre/clair
- [ ] Notifications push pour événements

### Version 2.0
- [ ] Mode multijoueur avec synchronisation
- [ ] Générateur de donjons aléatoires
- [ ] IA d'assistance pour MJ
- [ ] Module de création de campagnes

## 👨‍💻 Développement

Développé avec amour par **Claude** & **Happy** pour la communauté **Geek&Dragon**.

### Technologies
- **HTML5/CSS3** : Interface responsive moderne
- **JavaScript ES6+** : Logique applicative
- **Howler.js** : Gestion audio avancée
- **LocalStorage** : Persistance des données
- **Font Awesome** : Icônes
- **Google Fonts** : Typographies médiévales

### Contributions
Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature
3. Commit avec messages descriptifs
4. Ouvrir une Pull Request

---

*Que vos dés soient toujours favorables ! 🎲*