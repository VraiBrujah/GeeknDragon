# 📘 Guide d'Utilisation - Gestionnaire de Campagne

## 🚀 Démarrage Rapide

1. **Ouvrir** `gestionnaire-campagne.html` dans votre navigateur
2. **Explorer** la campagne "Le Coffre-fort oublié" pré-chargée
3. **Naviguer** avec le menu latéral hiérarchique
4. **Tester** les fonctionnalités avec les onglets

## 🗺️ Navigation dans la Campagne

### Menu Latéral
- **▶ Flèche** : Développer/Réduire un noeud
- **Click sur nom** : Naviguer vers cet élément
- **Couleur dorée** : Élément actuellement sélectionné
- **Icônes** : Indiquent le type (🐉 campagne, 🚪 acte, 📍 lieu, ⚔️ rencontre)

### Fil d'Ariane
En bas de page, montre votre position :
```
🏠 > Le Coffre-fort oublié > Acte II > Vortex bleu
```

## 📑 Utilisation des Onglets

### 👁️ Aperçu
- **Description** détaillée de l'élément courant
- **Type** et **statut** de l'élément
- **Liste des sous-éléments** contenus

### 🗺️ Carte
- **Affichage** de la carte contextuelle
- **Épingles cliquables** avec notes
- **Ajouter Note** : Clic sur "Ajouter une note"
- **Modifier Note** : Clic sur une épingle existante
- **Supprimer Note** : Vider le texte lors de la modification

### 👥 Personnages
- **Fiches complètes** avec stats et PV
- **Actions disponibles** avec boutons de dés
- **Barres de vie** : Rouge (faible) → Jaune → Vert (plein)
- **Boutons** :
  - 🎲 : Lancer l'action
  - ✏️ : Modifier le personnage
  - ❤️ : Ajuster les PV

### 📜 Quêtes
- **Objectifs cochables** : Clic pour marquer comme terminé
- **Barre de progression** : Visuel du pourcentage accompli
- **États** : 🟢 Actif, 🔴 Inactif, 🔵 Terminé

### 🎒 Inventaires
- **Colonnes séparées** : PNJ à gauche, PJ à droite
- **Sélection d'objets** : Clic pour sélectionner (bordure dorée)
- **Transfert** : Bouton "Transférer objets" → Saisir ID destinataire
- **Ajouter objet** : Bouton + sur chaque inventaire

### 🗓️ Calendrier
- **Navigation** : Flèches pour changer de mois
- **Jour courant** : Surligné en doré
- **Événements** : Point coloré sur les jours
- **Actions** :
  - **Repos court** : +quelques PV, +1 heure
  - **Repos long** : PV complets, +8 heures
  - **Ajouter événement** : Sur le jour sélectionné

## 🎵 Système Musical

### Fonctionnement Automatique
La musique change **automatiquement** selon votre position :
- **Campagne générale** → Musiques d'ambiance
- **Acte I (Goulet)** → Musiques d'exploration
- **Acte II (Clefs)** → Musiques de tension
- **Acte III (Dragon)** → Musiques de combat

### Contrôles
- **▶️/⏸️** : Lecture/Pause
- **🔊 Curseur** : Volume (0-100%)
- **Auto-transition** : Passage automatique aux pistes suivantes

### Hiérarchie Musicale
```
campagne/acte3/dragon_vert  (plus spécifique)
         ↓
campagne/acte3              (moins spécifique)  
         ↓
campagne                    (général)
```

## 🎲 Système de Dés

### Types de Lancers
- **Attaques** : `1d20+5` (d20 + modificateur)
- **Dégâts** : `1d8+3` (dé de dégâts + modificateur)
- **Soins** : `1d4` (dé de récupération)
- **Spéciaux** : `2d20` (Portent du magicien)

### Animation
- **Résultat animé** : Apparaît au centre de l'écran
- **Durée** : 0.8 secondes avec rotation
- **Console** : Détails du lancer dans la console navigateur (F12)

### Effets Automatiques
- **Soins** : Ajoute automatiquement les PV au personnage
- **Dégâts** : À appliquer manuellement avec le bouton ❤️

## 💾 Sauvegarde & Données

### Auto-Sauvegarde
- **Intervalle** : Toutes les 30 secondes
- **Stockage** : LocalStorage du navigateur
- **Événements** : À chaque modification importante

### Sauvegarde Manuelle
- **Bouton "Sauvegarder"** : Force la sauvegarde immédiate
- **Export JSON** : Télécharge un fichier de backup
- **Raccourci** : Ctrl+S

### Chargement de Données
- **Bouton "Charger"** : Sélectionner un fichier JSON
- **Formats supportés** : Fichiers générés par le système
- **Restauration** : Remplace les données actuelles

## ⚔️ Gestion de Combat

### Préparation
1. **Naviguer** vers la rencontre (ex: dragon_vert)
2. **Vérifier PV** de tous les personnages
3. **Préparer actions** avec les boutons de dés

### Déroulement
1. **Initiative** : Utiliser les dés d20 pour l'ordre
2. **Actions** : Cliquer les boutons d'attaque
3. **Appliquer dégâts** : Bouton ❤️ pour ajuster PV
4. **Soins** : Les soins s'appliquent automatiquement

### Fin de Combat
- **Repos court** : Récupération partielle
- **Repos long** : Récupération complète
- **Mise à jour quêtes** : Cocher objectifs accomplis

## 🔧 Personnalisation

### Ajouter un Personnage
1. **Modifier le JSON** ou utiliser le bouton "Ajouter"
2. **Remplir** nom, classe, race, stats
3. **Définir actions** avec expressions de dés
4. **Sauvegarder** les modifications

### Créer une Nouvelle Carte
1. **Placer l'image** dans `/images/maps/`
2. **Ajouter** l'entrée dans la section `maps` du JSON
3. **Lier** avec `mapId` dans la structure hiérarchique

### Modifier la Musique
1. **Organiser** vos fichiers dans `/musique/`
2. **Éditer** la section `musicPaths` du JSON
3. **Respecter** la hiérarchie contextuelle

## 🐛 Problèmes Courants

### "Aucune carte sélectionnée"
- Vérifier que l'élément a un `mapId` défini
- Contrôler que l'image existe dans `/images/maps/`

### Musique ne démarre pas
- Autoriser autoplay dans le navigateur
- Vérifier les chemins dans `musicPaths`
- Tester avec clic utilisateur d'abord

### Données perdues
- Vérifier le localStorage (F12 → Application → Local Storage)
- Utiliser les sauvegardes JSON régulières
- Éviter mode privé/incognito

### Dés ne fonctionnent pas
- Vérifier la syntaxe : `XdY+Z` (ex: `1d20+5`)
- Contrôler que le personnage existe
- Regarder la console pour erreurs (F12)

## 🎯 Conseils de MJ

### Organisation
- **Préparer** les données avant la session
- **Tester** toutes les fonctionnalités à l'avance
- **Backup** régulier des données de campagne

### Pendant la Session
- **Naviguer** en temps réel selon l'action
- **Faire participer** les joueurs aux lancers
- **Utiliser** la musique pour l'ambiance
- **Mettre à jour** PV et objectifs immédiatement

### Après la Session
- **Sauvegarder** l'état final
- **Noter** les modifications pour la prochaine fois
- **Exporter** un backup de sécurité

## 📚 Ressources Avancées

### Structure JSON Complète
```json
{
  "name": "Ma Campagne",
  "structure": { ... },
  "characters": { ... },
  "maps": { ... },
  "quests": { ... },
  "calendar": { ... },
  "music": { ... }
}
```

### Expressions de Dés Supportées
- **Simple** : `1d6`, `2d8`, `3d10`
- **Avec modificateur** : `1d20+5`, `2d6-1`
- **Complexe** : `1d8+3+1d6` (attaque sournoise)

### Raccourcis Clavier
- **Échap** : Fermer les modales
- **Ctrl+S** : Sauvegarder
- **F12** : Console développeur (pour débug)

---

*Que vos aventures soient épiques ! ⚔️🏰*