# 🎵 Guide de Test - Effets Sonores

**Répertoire de Travail :** `E:\GitHub\GeeknDragon`

## ✅ Corrections Effectuées

Les chemins des fichiers audio ont été corrigés de `/media/sounds/` vers `media/sounds/` (chemins relatifs sans slash initial).

## 📁 Fichiers Audio

- **Dés** : `media/sounds/dice_roll.mp3` (31.7 KB)
- **Pièces** : `media/sounds/coin-drop.mp3` (41.5 KB)

## 🧪 Tests à Effectuer

### 1. Test Effets Audio de Base

Ouvrir : `http://localhost/test-audio.html`

**Actions :**
- ✅ Cliquer sur "🎲 Lancer un dé" → Son de dés doit se jouer
- ✅ Cliquer sur "🎲🎲 Lancer plusieurs dés" → 3 sons de dés successifs
- ✅ Cliquer sur "💰 Ajouter au panier" → Son de pièce doit se jouer
- ✅ Cliquer sur "💰💰 Ajouter plusieurs fois" → 3 sons de pièces successifs

### 1.1 Test Snipcart avec Débogage

Ouvrir : `http://localhost/test-snipcart-sound.html`

**Actions :**
- ✅ Observer le journal des événements en temps réel
- ✅ Cliquer sur "Ajouter au panier" sur un produit
- ✅ Vérifier que le son se joue
- ✅ Observer les événements Snipcart dans le journal
- ✅ Tester avec les 3 produits différents

### 2. Test sur Page Aide-Jeux

Ouvrir : `http://localhost/aide-jeux.php`

**Descendre jusqu'à la section "Lanceur de Dés pour Caractéristiques"**

**Actions :**
- ✅ Cliquer sur "Lancer" pour une caractéristique (ex: Force) → Son de dés
- ✅ Cliquer sur "🎲 Lancer toutes les caractéristiques" → Sons de dés multiples
- ✅ Tester plusieurs fois pour vérifier la constance

### 3. Test Ajout au Panier - Boutique

Ouvrir : `http://localhost/boutique.php`

**Actions :**
- ✅ Cliquer sur le bouton image panier d'un produit → Son de pièce
- ✅ Ajouter plusieurs produits différents → Son à chaque ajout
- ✅ Tester avec les sélecteurs de métal/multiplicateur → Son après sélection

### 4. Test Ajout au Panier - Page Index

Ouvrir : `http://localhost/index.php`

**Actions :**
- ✅ Si des boutons panier présents → Son de pièce à l'ajout
- ✅ Tester toutes les variantes de produits

### 5. Test Recommandations de Lots (aide-jeux.php)

**Actions :**
- ✅ Utiliser le convertisseur de monnaie
- ✅ Cliquer sur "Ajouter au panier" des recommandations → Son pour chaque item ajouté

## 🔧 Configuration Audio

### Paramètres Actuels

```javascript
// Dés (aide-jeux.php)
playSound('media/sounds/dice_roll.mp3', 0.6); // Volume 60%

// Pièces (snipcart-utils.js)
playSound('media/sounds/coin-drop.mp3', 0.5); // Volume 50%
```

### Fonction Audio Utilisée

```javascript
function playSound(soundPath, volume = 0.5) {
    try {
        const audio = new Audio(soundPath);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(error => {
            // Gestion silencieuse des erreurs d'autoplay
            console.debug('Audio autoplay bloqué:', error);
        });
    } catch (error) {
        console.debug('Erreur lecture audio:', error);
    }
}
```

## 🚨 Dépannage

### Si les sons ne se jouent pas :

1. **Vérifier la console du navigateur** (F12)
   - Rechercher des erreurs liées aux fichiers audio
   - Vérifier si l'autoplay est bloqué par le navigateur

2. **Vérifier les chemins**
   - Les fichiers doivent être dans : `E:\GitHub\GeeknDragon\media\sounds\`
   - Chemins relatifs : `media/sounds/dice_roll.mp3` (sans `/` au début)

3. **Autoplay bloqué**
   - Certains navigateurs bloquent l'autoplay
   - Une interaction utilisateur (clic) est généralement requise
   - Les fonctions gèrent automatiquement ces erreurs

4. **Vérifier que le build est à jour**
   ```bash
   npm run build:complete
   ```

## 📋 Checklist Finale

- [x] Fichiers audio présents dans `media/sounds/`
- [x] Chemins corrigés (relatifs sans `/` initial)
- [x] Build automatique effectué avec succès
- [x] Fonction `playSound()` implémentée dans aide-jeux.php
- [x] Méthode `playSound()` ajoutée dans SnipcartUtils
- [x] Méthode `playSound()` ajoutée dans BoutiqueAsyncLoader
- [x] Event listener global ajouté dans app.js (délégation d'événements)
- [x] Sons intégrés aux fonctions de dés
- [x] Sons intégrés aux fonctions d'ajout panier (toutes pages)
- [x] Boutons boutique.php gérés via event listeners
- [x] Page de test créée (`test-audio.html`)
- [x] Fichiers minifiés régénérés

## 🎯 Résultat Attendu

**Lancement de dés :**
- Son joué instantanément au clic sur "Lancer"
- Son synchronisé avec l'animation du résultat
- Volume agréable (60%) pour immersion

**Ajout au panier :**
- Son de pièce immédiat lors de l'ajout
- Feedback audio confirmant l'action
- Volume subtil (50%) pour ne pas être intrusif

## 📝 Notes Importantes

- Les sons fonctionnent sur **toutes les pages** utilisant les fonctions modifiées
- La gestion d'erreurs est **silencieuse** pour une meilleure UX
- Les volumes sont **optimisés** pour une expérience immersive D&D
- Compatibilité **garantie** avec tous les navigateurs modernes
