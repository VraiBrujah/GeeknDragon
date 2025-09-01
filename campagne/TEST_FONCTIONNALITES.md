# 🧪 Tests du Gestionnaire de Campagne

## 🚀 Exécution des tests automatisés

1. Installer les dépendances et le navigateur Chromium de Playwright :

   ```bash
   npm install
   npx playwright install chromium
   ```

2. Lancer tous les scénarios de test :

   ```bash
   npm test
   ```

## ✅ Checklist de Fonctionnalités

### 🗺️ **Navigation & Structure**
- [ ] Ouverture du gestionnaire (`gestionnaire-campagne.html`)
- [ ] Chargement automatique des données "Le Coffre-fort oublié" 
- [ ] Navigation hiérarchique fonctionnelle
- [ ] Expansion/réduction des nœuds (clic flèches ▶)
- [ ] Sélection des éléments (couleur dorée)
- [ ] Fil d'Ariane mis à jour en temps réel

### 🖼️ **Système de Cartes**
- [ ] Affichage de la vraie carte : `Carte_Donjon_1.webp`
- [ ] Épingles pré-définies visibles sur la carte
- [ ] Ajout de nouvelles épingles (clic "Ajouter une note")
- [ ] Modification d'épingles existantes (clic sur épingle)
- [ ] Suppression d'épingles (texte vide)
- [ ] Tooltips des épingles au survol

### 👥 **Gestion des Personnages**
- [ ] **5 PJ affichés** : Petite Lumière, Bouclier Vivant, Œil Perçant, Ombre Dansante, Gardien des Secrets
- [ ] **2 PNJ affichés** : Nackrag l'Estimeur, Verdoyant le Dragon
- [ ] Barres de vie correctes (couleur selon %)
- [ ] Stats affichées (CA, FOR, DEX)
- [ ] Actions avec boutons de dés fonctionnels
- [ ] Animations des résultats de dés
- [ ] Modification des PV (bouton ❤️)
- [ ] Édition des personnages (bouton ✏️)
- [ ] Soins automatiques pour actions marquées `heal: true`

### 🎲 **Système de Dés**
- [ ] Lancers d'attaque (`1d20+5`)
- [ ] Lancers de dégâts (`1d8+3`) 
- [ ] Lancers de soins (`1d4`)
- [ ] Animation du résultat (rotation + fade)
- [ ] Application automatique des soins
- [ ] Logs détaillés dans la console (F12)

### 📜 **Gestion des Quêtes**
- [ ] **3 quêtes pré-chargées** : Mission principale, Sauver dragon, Mystères gobelin
- [ ] Objectifs cochables 
- [ ] Barres de progression visuelles
- [ ] États de quêtes (actif/inactif/complété)
- [ ] Persistance des modifications

### 🎒 **Système d'Inventaires**
- [ ] Inventaires PNJ (colonne gauche)
- [ ] Inventaires PJ (colonne droite)
- [ ] Sélection d'objets (bordure dorée)
- [ ] Transfert entre personnages
- [ ] Ajout d'objets (bouton +)
- [ ] Quantités d'objets affichées

### 📅 **Calendrier & Temps**
- [ ] Calendrier interactif 30 jours
- [ ] Date courante surlignée (15-3-1492)
- [ ] Événements pré-programmés (16-3-1492)
- [ ] Navigation mois (flèches ← →)
- [ ] Ajout d'événements personnalisés
- [ ] Repos court : +PV partiels, +1h
- [ ] Repos long : PV complets, +8h

### 🎵 **Musique Contextuelle**
- [ ] Chargement automatique selon navigation
- [ ] Hiérarchie : `dragon_vert` > `acte3` > `campagne`
- [ ] Contrôles lecture/pause fonctionnels
- [ ] Réglage volume (0-100%)
- [ ] Transitions fluides entre contextes
- [ ] Auto-play de la piste suivante
- [ ] Gestion des erreurs (fichiers manquants)

### 💾 **Sauvegarde & Persistance**
- [ ] Auto-sauvegarde toutes les 30 secondes
- [ ] Sauvegarde manuelle (bouton "Sauvegarder")
- [ ] Export JSON fonctionnel
- [ ] Import JSON fonctionnel
- [ ] Persistance après rechargement page
- [ ] Raccourci Ctrl+S

### 🎨 **Interface & Ergonomie**
- [ ] Thème médiéval cohérent
- [ ] Responsive design (desktop/mobile)
- [ ] Animations fluides
- [ ] Modales fonctionnelles
- [ ] Fermeture ESC/clic-extérieur
- [ ] Raccourcis clavier
- [ ] Messages de feedback utilisateur

## 🔧 Tests de Performance

### Chargement Initial
- [ ] Temps < 3 secondes
- [ ] Pas d'erreurs console
- [ ] Musique démarre automatiquement

### Navigation
- [ ] Changements contextes < 500ms
- [ ] Animations fluides (60fps)
- [ ] Pas de lag sur gros datasets

### Mémoire
- [ ] Pas de fuites mémoire
- [ ] Sons libérés correctement
- [ ] LocalStorage optimal

## 🐛 Tests d'Erreurs

### Données Manquantes
- [ ] Carte introuvable → placeholder
- [ ] Musique introuvable → fallback
- [ ] Personnage corrompu → valeurs par défaut

### Interactions Invalides
- [ ] Transfert vers personnage inexistant
- [ ] Lancer de dés syntaxe incorrecte
- [ ] Import JSON malformé

### Cas Limites
- [ ] Inventaire vide
- [ ] PV à 0
- [ ] Date invalide
- [ ] Volume 0%

## 📊 Résultats Attendus

### ✅ Succès Total
- Toutes les fonctionnalités marchent
- Interface fluide et intuitive
- Données persistantes
- Musique contextuelle parfaite

### ⚠️ Succès Partiel
- Fonctionnalités principales OK
- Quelques bugs mineurs
- Performance acceptable

### ❌ Échec
- Fonctionnalités critiques cassées
- Interface inutilisable
- Pertes de données

## 🚀 Optimisations Possibles

### Performance
- Lazy loading des images
- Cache intelligent des sons
- Debounce des sauvegardes

### UX
- Animations plus poussées
- Sons d'interface
- Thèmes multiples

### Fonctionnalités
- Mode multijoueur
- IA d'assistance
- Génération procédurale

---

**Objectif** : 100% des fonctionnalités de base ✅  
**Version** : 1.0.0 - Le Coffre-fort oublié  
**Tests par** : MJ & Joueurs  

*Prêt pour l'aventure ! ⚔️🏰*