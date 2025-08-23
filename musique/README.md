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
- ✅ **Continuité entre pages** - la musique continue sans interruption
- ✅ **Lecture aléatoire** de toutes les musiques trouvées
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

## 🔧 Configuration

### Volume par défaut
Le volume est configuré à 15% par défaut. Pour le changer, modifiez cette ligne dans `audio-player.js`:
```javascript
volume: parseFloat(localStorage.getItem('gnd-audio-volume')) || 0.15, // 15%
```

### Position du lecteur
Le lecteur apparaît en bas à droite et peut être réduit/agrandi en cliquant sur l'icône de musique.

## 🎨 Style

Le lecteur utilise automatiquement les variables CSS de Geek&Dragon:
- `--primary-color`: Brun principal
- `--secondary-color`: Or/jaune
- `--font-heading`: Police médiévale

## 🚀 Déploiement

1. Créez la structure de dossiers
2. Ajoutez vos fichiers MP3 (au moins `hero-intro.mp3`)
3. Le lecteur se lance automatiquement

## ⚠️ Notes techniques

- Compatible avec MP3, OGG, WAV, M4A
- Utilise localStorage pour la persistance
- Détection automatique ou endpoint PHP optionnel
- Support des navigateurs modernes avec autoplay

## 🔍 Dépannage

Si aucune musique n'est détectée, vérifiez:
1. Les fichiers sont bien dans les bons dossiers
2. Les noms de fichiers correspondent aux noms supportés
3. Les extensions sont en minuscules (.mp3)
4. L'autoplay n'est pas bloqué par le navigateur