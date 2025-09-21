# 🎵 Système Audio Geek&Dragon

## 📁 Structure des dossiers

```
musique/
├── index/              # Musiques pour la page d'accueil
│   ├── hero-intro.mp3  # ⭐ FICHIER DE DÉMARRAGE RAPIDE
│   ├── medieval-tavern.mp3
│   ├── epic-adventure.mp3
│   └── ...
├── boutique/           # Musiques pour la page boutique
│   ├── hero-intro.mp3  # ⭐ FICHIER DE DÉMARRAGE RAPIDE
│   ├── royal-court.mp3
│   ├── magic-spells.mp3
│   └── ...
└── (par défaut)        # Musiques par défaut pour toutes les pages
    ├── ambient.mp3
    ├── background.mp3
    └── ...
```

## ⚡ Démarrage Rapide

**IMPORTANT**: Créez un fichier nommé exactement `hero-intro.mp3` dans chaque dossier de page pour un démarrage instantané de la musique.

### Pour la page d'accueil:
- Placez `hero-intro.mp3` dans `musique/index/`

### Pour la page boutique:
- Placez `hero-intro.mp3` dans `musique/boutique/`

Ce fichier se lancera immédiatement pendant que les autres musiques sont scannées en arrière-plan.

## 🎯 Fonctionnalités

- ✅ **Détection automatique** des fichiers MP3 dans les dossiers
- ✅ **Continuité parfaite entre pages** - la musique continue sans interruption
- ✅ **Système de priorité intelligent** 70% page courante / 30% générale
- ✅ **Deux playlists séparées** pour une gestion optimisée
- ✅ **Volume sauvegardé** (défaut: 15%)
- ✅ **Interface réductible** avec style médiéval D&D
- ✅ **Démarrage automatique** dès le chargement de la page

## 📋 Noms de fichiers supportés

Le système détecte automatiquement ces noms courants:

### Thématiques médiévales:
- `medieval-tavern.mp3`
- `dragon-lair.mp3` 
- `forest-mystery.mp3`
- `castle-halls.mp3`
- `epic-adventure.mp3`
- `magic-spells.mp3`
- `battle-drums.mp3`
- `ancient-ruins.mp3`
- `mystical-forest.mp3`
- `royal-court.mp3`

### Noms génériques:
- `ambient01.mp3`, `ambient02.mp3`, etc.
- `music1.mp3`, `music2.mp3`, etc.
- `track1.mp3`, `track2.mp3`, etc.
- `background.mp3`
- `theme.mp3`

## 🧠 Système de Priorité Intelligent

### Comment ça marche ?
Quand une musique se termine, le lecteur choisit la suivante selon cette logique :

- **70% de chance** → Musique du dossier de la page courante (`musique/index/`, `musique/boutique/`)
- **30% de chance** → Musique du dossier général (`musique/`)
- **Si aucune musique dans le dossier de la page** → 100% dossier général

### Indicateurs visuels
- 📍 = Piste du dossier de la page courante
- 🌍 = Piste du dossier général

### Continuité entre pages
Quand vous changez de page :
1. **La musique continue** de jouer sans interruption
2. **Les nouvelles playlists sont scannées** en arrière-plan
3. **La priorité s'adapte** à la nouvelle page pour les prochaines pistes

## 🔧 Configuration

### Initialisation via options officielles
Avant d'inclure `js/audio-player.js`, vous pouvez définir une configuration globale :

```html
<script>
  window.GeeknDragonAudioPlayerOptions = {
    welcome: {
      track: 'musique/hero-intro.mp3',
      storageKey: 'gnd-audio-welcome-played'
    },
    quickStartFile: 'hero-intro.mp3',
    priorityRatio: { current: 0.7, default: 0.3 },
    defaultVolume: 0.15,
    scanner: {
      enableRangeFallback: true,
      // Exemple : remplacer la sonde réseau par une version custom
      // fileProbe: async (path) => myHeadThenRangeCheck(path),
    },
    ui: {
      attachHeader: true,
      hideFloatingWhenHeader: true,
    },
    listeners: {
      ready: (event) => console.log('Lecteur prêt', event.detail.player),
    },
  };
</script>
```

### Priorité des playlists
- `priorityRatio.current` : probabilité de piocher dans le dossier de la page courante.
- `priorityRatio.default` : probabilité de piocher dans le dossier général.

Les valeurs sont normalisées automatiquement afin que la somme vaille 1.

### Piste de bienvenue
Utilisez `welcome.track` pour forcer un morceau spécifique au premier lancement (le lecteur se charge de la persistance via `welcome.storageKey`).

### Volume et stockage
- `defaultVolume` contrôle le volume initial si aucun réglage n'est présent dans `localStorage`.
- `storageKeys` permet de renommer les clés utilisées pour `state`, `volume` et `collapsed` si besoin.

### Interface
- `ui.attachHeader` : ajoute les contrôles compacts dans l'en-tête.
- `ui.hideFloatingWhenHeader` : masque le widget flottant lorsqu'un header existe.

### Bus d'événements
`window.gndAudioPlayer` expose un bus (`on`, `off`, `emit`) et une promesse `ready`.

Événements disponibles :
- `ready` : émis à la fin de l'initialisation.
- `playback-change` : lecture/pause confirmée.
- `volume-change` : variation du volume global.
- `track-change` : nouvelle piste sélectionnée.
- `playlist-update` : playlists reconstruites après scan.

```javascript
window.gndAudioPlayer.on('track-change', (event) => {
  console.log('Piste en lecture :', event.detail.fileName);
});
```

### Position du lecteur
Le lecteur apparaît en bas à droite et peut être réduit/agrandi en cliquant sur l'icône principale.

## 🎨 Style

Le lecteur utilise automatiquement les variables CSS de Geek&Dragon:
- `--primary-color`: Brun principal
- `--secondary-color`: Or/jaune
- `--font-heading`: Police médiévale

## 🚀 Déploiement

1. **Créez la structure de dossiers** (déjà faite)
2. **Ajoutez vos fichiers MP3** :
   - `musique/index/hero-intro.mp3` (démarrage instantané accueil)
   - `musique/boutique/hero-intro.mp3` (démarrage instantané boutique)
   - D'autres musiques dans les dossiers respectifs
3. **Le lecteur se lance automatiquement** avec le système de priorité

### Recommandations
- **Minimum 2-3 musiques** par dossier pour la variété
- **Noms descriptifs** pour faciliter l'identification
- **Fichiers optimisés** (128-320 kbps) pour le web

## ⚠️ Notes techniques

- Compatible avec MP3, OGG, WAV, M4A
- Utilise localStorage pour la persistance
- Détection automatique ou endpoint PHP optionnel
- Support des navigateurs modernes avec autoplay

## 🔍 Dépannage

### Aucune musique détectée ?
Vérifiez :
1. Les fichiers sont bien dans les bons dossiers
2. Les noms de fichiers correspondent aux noms supportés
3. Les extensions sont en minuscules (.mp3)
4. L'autoplay n'est pas bloqué par le navigateur

### La priorité ne fonctionne pas ?
- Assurez-vous d'avoir des musiques dans les deux dossiers
- Consultez la console du navigateur (F12) pour voir les logs
- L'indicateur 📍/🌍 montre quelle playlist est utilisée

### La musique s'arrête au changement de page ?
- Vérifiez que le script est bien inclus sur toutes les pages
- La continuité utilise localStorage, vérifiez qu'il n'est pas désactivé