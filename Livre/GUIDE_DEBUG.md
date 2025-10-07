# 🐛 Guide de Debug - Sauvegarde Position Scroll

## 📋 Instructions Complètes

### Étape 1 : Préparer la Console

1. Ouvrir `http://localhost/GeeknDragon/Livre/` dans Chrome/Firefox
2. Appuyer sur **F12** pour ouvrir la console développeur
3. Dans la console, taper : `localStorage.clear()` puis **Entrée**
4. Recharger la page (**F5**)

### Étape 2 : Observer le Démarrage

Tu devrais voir dans la console :

```
═══════════════════════════════════════════════════════
🚀 DÉMARRAGE VISUALISEUR MANUSCRITS v1.3.0
═══════════════════════════════════════════════════════

[DEBUG] Configuration marked.js...
[DEBUG] ✅ marked.js configuré
[DEBUG] Chargement liste des livres...
[DEBUG] ✅ 1 livre(s) chargé(s)
[DEBUG] Détermination livre à charger...
[DEBUG] ========== CHARGEMENT LIVRE INITIAL ==========
[DEBUG] Position sauvegardée trouvée: Non
[DEBUG] Fallback : chargement premier livre "Éveil"
[DEBUG] ========== FIN CHARGEMENT LIVRE ==========
[DEBUG] Initialisation listeners...
[DEBUG] ========== INITIALISATION LISTENERS ==========
[DEBUG] ✅ Listener scroll TEMPS RÉEL activé
[DEBUG] ✅ Listener scroll UI (debounced) activé
[DEBUG] ✅ Bouton retour haut configuré
[DEBUG] ✅ Intervalle périodique 1s activé
[DEBUG] ✅ Listener beforeunload activé
[DEBUG] ✅ Listener visibilitychange activé
[DEBUG] ========== LISTENERS PRÊTS ==========

═══════════════════════════════════════════════════════
✅ VISUALISEUR PRÊT
═══════════════════════════════════════════════════════
```

### Étape 3 : Tester la Sauvegarde en Temps Réel

1. **Scroller lentement** vers le bas (molette ou flèche)
2. **Observer la console** : Tu devrais voir des messages comme :

```
[DEBUG] saveReadingPosition() appelée
[DEBUG] Position actuelle: 523px, Dernière sauvegardée: 0px
✅ [SAUVEGARDE] Position 523px sauvegardée pour livre "eveil"
[DEBUG] Contenu localStorage: {bookSlug: "eveil", chapterSlug: null, scrollY: 523, timestamp: 1738965432123}

[DEBUG] saveReadingPosition() appelée
[DEBUG] Position actuelle: 534px, Dernière sauvegardée: 523px
✅ [SAUVEGARDE] Position 534px sauvegardée pour livre "eveil"
...
```

**⚠️ QUESTIONS IMPORTANTES** :

- ❓ **Vois-tu** ces messages `[DEBUG] saveReadingPosition() appelée` en scrollant ?
- ❓ **Vois-tu** les messages `✅ [SAUVEGARDE] Position XXXpx sauvegardée` ?
- ❓ **Ou vois-tu** `[DEBUG] Sauvegarde annulée : currentBook est null` ?
- ❓ **Ou vois-tu** `[DEBUG] Sauvegarde annulée : delta XXpx < 10px` ?

### Étape 4 : Vérifier le localStorage Manuellement

Dans la console, taper :

```javascript
JSON.parse(localStorage.getItem('manuscrits_reading_position'))
```

Tu devrais voir quelque chose comme :

```json
{
  "bookSlug": "eveil",
  "chapterSlug": "00-prologue",
  "scrollY": 1234,
  "timestamp": 1738965432123
}
```

**⚠️ QUESTIONS** :

- ❓ Le `scrollY` correspond-il à ta position actuelle ?
- ❓ Le `bookSlug` est-il correct ("eveil") ?
- ❓ Le `timestamp` change-t-il quand tu scrolles ?

### Étape 5 : Tester le Rechargement

1. **Scroller** jusqu'à une position visible (ex: milieu d'un chapitre)
2. **Noter** la position actuelle dans la console (dernière sauvegarde)
3. **Recharger** immédiatement la page (**F5**)

### Étape 6 : Observer la Restauration

Après le rechargement, tu devrais voir :

```
[DEBUG] ========== RESTAURATION POSITION ==========
[DEBUG] Contenu localStorage brut: {"bookSlug":"eveil","chapterSlug":"00-prologue","scrollY":1234,"timestamp":1738965432123}
[DEBUG] Position parsée: {bookSlug: "eveil", chapterSlug: "00-prologue", scrollY: 1234, timestamp: 1738965432123}
[DEBUG] Livre actuel: "eveil", Livre sauvegardé: "eveil"
[DEBUG] Tentative scroll vers 1234px...
✅ [RESTAURATION] Position cible: 1234px, Position réelle: 1234px
[DEBUG] Chapitre actif mis à jour: "00-prologue"
[DEBUG] ========== FIN RESTAURATION ==========
```

**⚠️ QUESTIONS CRITIQUES** :

- ❓ Vois-tu `[DEBUG] ========== RESTAURATION POSITION ==========` ?
- ❓ Le `scrollY` lu depuis localStorage est-il correct ?
- ❓ La "Position cible" correspond-elle à ce que tu avais avant rechargement ?
- ❓ La "Position réelle" est-elle identique à la "Position cible" ?
- ❓ **Ou vois-tu** `[DEBUG] Aucune position sauvegardée trouvée` ?
- ❓ **Ou vois-tu** `[DEBUG] Livres différents` ?
- ❓ **Ou vois-tu** un écart : `⚠️ ÉCART DÉTECTÉ: XXpx de différence!` ?

### Étape 7 : Test Sauvegarde Périodique

Laisse la page ouverte **sans scroller** pendant 2-3 secondes.

Tu devrais voir toutes les 1 seconde :

```
[DEBUG] 🔄 Sauvegarde périodique (1s)
[DEBUG] saveReadingPosition() appelée
[DEBUG] Position actuelle: 1234px, Dernière sauvegardée: 1234px
[DEBUG] Sauvegarde annulée : delta 0px < 10px
```

**⚠️ QUESTIONS** :

- ❓ Vois-tu ces messages périodiques toutes les 1 seconde ?
- ❓ Si tu scrolles un tout petit peu (5px), vois-tu "delta 5px < 10px" ?

---

## 📊 Ce Que Je Dois Savoir

### Scénario A : Sauvegarde Ne Fonctionne Pas

**Si tu scrolles et que tu ne vois PAS** de messages `[DEBUG] saveReadingPosition() appelée`, alors :

- ❌ Les listeners scroll ne sont pas activés
- Raison possible : Erreur JavaScript bloquante avant `setupEventListeners()`

**SOLUTION** : Me donner **tous** les logs depuis le démarrage jusqu'à l'échec

### Scénario B : Sauvegarde Fonctionne Mais Pas Restauration

**Si tu vois** `✅ [SAUVEGARDE]` en scrollant **MAIS** `[DEBUG] Aucune position sauvegardée trouvée` au rechargement :

- ❌ localStorage est vidé entre rechargements
- Raisons possibles :
  - Navigation privée
  - Extensions navigateur (Clear Cache, Privacy Badger)
  - localStorage désactivé

**SOLUTION** :
1. Vérifier localStorage avant rechargement : `localStorage.getItem('manuscrits_reading_position')`
2. Recharger page
3. Vérifier localStorage après : `localStorage.getItem('manuscrits_reading_position')`
4. Comparer les deux

### Scénario C : Sauvegarde ET Restauration OK MAIS Position Incorrecte

**Si tu vois** `✅ [RESTAURATION] Position cible: 1234px, Position réelle: 0px` :

- ❌ `window.scrollTo()` ne fonctionne pas
- Raisons possibles :
  - Contenu pas encore chargé (hauteur document < position cible)
  - `behavior: 'instant'` non supporté (navigateur ancien)

**SOLUTION** : Me donner la différence entre cible et réelle

### Scénario D : currentBook est null

**Si tu vois** `[DEBUG] Sauvegarde annulée : currentBook est null` en scrollant :

- ❌ Le livre n'a pas été assigné à `this.currentBook`
- Raison : `switchBook()` a échoué ou n'a pas été appelé

**SOLUTION** : Me donner les logs depuis "CHARGEMENT LIVRE INITIAL"

---

## 🎯 Copie-Colle à Me Donner

**Fais ce test complet** et copie-colle **TOUS** les logs de la console, en particulier :

### 1. Logs de démarrage complets
```
Depuis "🚀 DÉMARRAGE VISUALISEUR MANUSCRITS"
Jusqu'à "✅ VISUALISEUR PRÊT"
```

### 2. Logs après avoir scrollé
```
Tous les messages [DEBUG] saveReadingPosition()
et ✅ [SAUVEGARDE]
pendant que tu scrolles
```

### 3. Contenu localStorage avant rechargement
```javascript
// Taper dans console AVANT de recharger :
JSON.parse(localStorage.getItem('manuscrits_reading_position'))
```

### 4. Logs de restauration après rechargement
```
Depuis "========== RESTAURATION POSITION =========="
Jusqu'à "========== FIN RESTAURATION =========="
```

### 5. Si aucune restauration détectée

Taper dans la console **après rechargement** :
```javascript
localStorage.getItem('manuscrits_reading_position')
```

Et me dire ce que ça affiche.

---

## 💡 Raccourcis Console Utiles

```javascript
// Vider localStorage et recommencer
localStorage.clear();
location.reload();

// Voir position sauvegardée
JSON.parse(localStorage.getItem('manuscrits_reading_position'))

// Voir position scroll actuelle
window.scrollY

// Forcer sauvegarde manuelle
window.manuscritsViewer.saveReadingPosition()

// Forcer restauration manuelle
window.manuscritsViewer.restoreScrollPosition()
```

---

## 🚨 Ce Que Je Recherche

### Possibilité 1 : `currentBook` est null
```
[DEBUG] Sauvegarde annulée : currentBook est null
```
→ Le livre ne charge pas correctement

### Possibilité 2 : Delta cache trop strict
```
[DEBUG] Sauvegarde annulée : delta 5px < 10px
```
→ Tu scrolles de petits incréments, position pas sauvegardée

### Possibilité 3 : localStorage vidé
```
[DEBUG] Aucune position sauvegardée trouvée
```
→ Mais tu as vu des sauvegardes avant rechargement

### Possibilité 4 : Restauration trop tôt
```
✅ [RESTAURATION] Position cible: 1234px, Position réelle: 0px
⚠️ ÉCART DÉTECTÉ: 1234px de différence!
```
→ Contenu pas chargé, scroll échoue

### Possibilité 5 : Livre différent
```
[DEBUG] Livres différents : actuel="eveil" vs sauvegardé="autre-livre"
```
→ Mismatch slug

---

**Avec tous ces logs, je pourrai identifier exactement où ça bloque ! 🎯**
