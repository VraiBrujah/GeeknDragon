# 🎵 Système de Musique de Fond Li-CUBE PRO™

## Vue d'ensemble
Le système de musique de fond permet d'ajouter une ambiance sonore discrète aux présentations Li-CUBE PRO™. La musique se lance automatiquement en lecture aléatoire avec un volume configurable.

## 📁 Installation des fichiers de musique

### Étape 1: Ajouter vos fichiers MP3
Placez vos fichiers de musique dans ce dossier `./musique/` avec les extensions supportées :
- `.mp3` (recommandé)
- `.wav`
- `.ogg`

### Étape 2: Noms de fichiers recommandés
Le système recherche automatiquement ces noms de fichiers :
- `ambient1.mp3`, `ambient2.mp3`, `ambient3.mp3`
- `background1.mp3`, `background2.mp3`, `background3.mp3`
- `corporate1.mp3`, `corporate2.mp3`, `corporate3.mp3`
- `tech1.mp3`, `tech2.mp3`, `tech3.mp3`
- `presentation1.mp3`, `presentation2.mp3`, `presentation3.mp3`
- `music1.mp3`, `music2.mp3`, `music3.mp3`, `music4.mp3`, `music5.mp3`
- `song1.mp3`, `song2.mp3`, `song3.mp3`, `song4.mp3`, `song5.mp3`

**Exemple :**
```
musique/
├── ambient1.mp3          ← Musique d'ambiance douce
├── corporate2.mp3        ← Musique corporative moderne
├── tech3.mp3             ← Musique technologique
└── presentation1.mp3     ← Musique de présentation
```

## ⚙️ Configuration

### Modifier les paramètres dans `data/product-config.json`

Ajoutez ou modifiez la section `audio_settings` :

```json
{
  "audio_settings": {
    "background_music": {
      "enabled": true,           // Activer/désactiver la musique
      "volume": 0.2,            // Volume (0.0 à 1.0) - 0.2 = 20%
      "folder": "./musique/",    // Dossier des fichiers
      "autoplay": true,         // Démarrage automatique
      "loop_playlist": true,    // Boucle la playlist
      "fade_duration": 2000,    // Durée transition (ms)
      "file_types": [".mp3", ".wav", ".ogg"]  // Types supportés
    }
  }
}
```

### Paramètres détaillés :

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `enabled` | boolean | `true` | Active/désactive le système de musique |
| `volume` | number | `0.2` | Volume de 0.0 (muet) à 1.0 (maximum) |
| `folder` | string | `"./musique/"` | Chemin vers le dossier de musique |
| `autoplay` | boolean | `true` | Démarre automatiquement au chargement |
| `loop_playlist` | boolean | `true` | Recommence la playlist à la fin |
| `fade_duration` | number | `2000` | Durée des transitions en millisecondes |
| `file_types` | array | `[".mp3", ".wav", ".ogg"]` | Extensions de fichiers acceptées |

## 🎛️ Interface de Contrôle

Une interface discrète apparaît en bas à droite de l'écran avec :
- 🎵 Icône de musique
- Titre de la piste actuelle
- 🔊 Curseur de volume
- ▶️/⏸️ Bouton play/pause

## 🎯 Recommandations d'usage

### Volume recommandé
- **Présentations client** : 0.15 (15%) - très discret
- **Démonstrations** : 0.20 (20%) - standard
- **Salons/événements** : 0.25 (25%) - plus audible

### Types de musique conseillés
- **Musique d'ambiance** : sons doux, pas de paroles
- **Musique corporative** : moderne, professionnelle
- **Musique instrumentale** : éviter les paroles qui distraient
- **Durée** : 2-5 minutes par piste pour la variété

### Exemple de configuration pour différents contextes

**Pour présentations silencieuses :**
```json
"volume": 0.1,
"autoplay": false
```

**Pour événements :**
```json
"volume": 0.3,
"autoplay": true,
"loop_playlist": true
```

**Pour désactiver complètement :**
```json
"enabled": false
```

## 🔧 Dépannage

### Aucune musique ne joue
1. Vérifiez que des fichiers MP3 existent dans `./musique/`
2. Utilisez les noms de fichiers recommandés
3. Vérifiez que `"enabled": true` dans la configuration
4. Ouvrez la console du navigateur (F12) pour voir les messages

### La musique est trop forte/faible
Modifiez le paramètre `volume` dans `product-config.json` :
- `0.1` = 10% (très discret)
- `0.2` = 20% (standard)
- `0.3` = 30% (audible)

### La musique ne change pas
Le système mélange automatiquement la playlist. Si vous avez une seule piste, elle se répétera.

## 📊 Logs de Débogage

Ouvrez la console du navigateur (F12) pour voir :
```
🎵 Gestionnaire de musique Li-CUBE PRO™ initialisé
✅ Configuration audio chargée
🎼 Playlist découverte: 3 pistes
  1. Ambient 1
  2. Corporate 2  
  3. Tech 3
🎵 Lecture: Ambient 1
```

## 🎪 Intégration dans d'autres pages

Pour ajouter la musique à d'autres pages HTML :

1. Ajoutez le script dans le `<head>` :
```html
<script src="../utils/music-manager.js"></script>
```

2. Le gestionnaire se lance automatiquement

3. Accédez à l'instance globale :
```javascript
// Contrôler la musique depuis JavaScript
window.gestionnaireMusique.pauserLecture();
window.gestionnaireMusique.reprendre();
window.gestionnaireMusique.ajusterVolume(0.1);
```

---
**💡 Conseil** : Testez différents volumes selon votre contexte d'utilisation. Une musique trop forte peut distraire, trop faible peut être inaudible selon l'environnement.