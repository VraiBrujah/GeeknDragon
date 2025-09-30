# 🎵 Plan de Refactorisation - Système de Musique
**Date** : 2025-09-30
**Projet** : Geek & Dragon
**Répertoire** : `E:\GitHub\GeeknDragon`

---

## 📊 Analyse du Système Actuel

### **Fichiers Existants**
1. **`js/dnd-music-player.js`** (360 lignes) - Lecteur JavaScript
2. **`api/music-scanner.php`** (83 lignes) - Scanner PHP des MP3

### **État Actuel**
- ✅ Scanner récursif fonctionnel
- ✅ Détection de `hero-intro.mp3`
- ⚠️  Système pondéré complexe (hero-intro favorisé 2.5×)
- ❌ **Problème** : hero-intro ne joue PAS en premier à coup sûr
- ❌ Gestion aléatoire incohérente
- ⚠️  Seulement 2 MP3 trouvés (beaucoup supprimés par git status)

---

## 🎯 Objectifs de Refactorisation

### **Fonctionnalités Requises**
1. ✅ **hero-intro.mp3 EN PREMIER** (obligatoire)
2. ✅ **Lecture aléatoire** après hero-intro
3. ✅ **Scan dynamique** de tous les MP3 du dossier `media/musique/`
4. ✅ **Détection automatique** des ajouts/suppressions de fichiers
5. ✅ **Performance optimale** (pas de lag, chargement rapide)
6. ✅ **Support sous-dossiers** (récursif)

---

## 🏗️ Architecture Proposée

### **1. Backend PHP - Scanner Optimisé**

#### **`api/music-scanner.php`** (amélioration)

**Modifications** :
```php
// Ajout cache avec durée de vie
// Détection plus robuste de hero-intro.mp3
// Support exclusions (ex: .git, node_modules)
// Logging des erreurs
```

**Fonctionnalités** :
- ✅ Scan récursif de `media/musique/**/*.mp3`
- ✅ Identification garantie de `hero-intro.mp3`
- ✅ Cache intelligent (5 minutes) avec invalidation manuelle
- ✅ Exclusion dossiers système
- ✅ Gestion erreurs robuste

---

### **2. Frontend JavaScript - Lecteur Simplifié**

#### **`js/dnd-music-player.js`** (refactorisation majeure)

**Changements Majeurs** :

##### **a) Suppression Système Pondéré**
```javascript
// AVANT (complexe, non fiable)
createWeightedPlaylist() {
    this.weightedPlaylist = [];
    // Duplication de hero-intro 2.5× dans la playlist...
}

// APRÈS (simple, fiable)
startPlayback() {
    // 1. Jouer hero-intro.mp3 EN PREMIER
    // 2. Puis lecture aléatoire du reste
}
```

##### **b) Logique de Lecture Linéaire**
```javascript
class DnDMusicPlayer {
    constructor() {
        this.playlist = [];        // Liste complète des MP3
        this.playedOnce = false;   // Flag hero-intro joué
        this.heroIntroPath = null; // Chemin hero-intro
        this.regularPlaylist = []; // Playlist sans hero-intro
    }

    async startPlayback() {
        // TOUJOURS jouer hero-intro en premier
        if (this.heroIntroPath && !this.playedOnce) {
            await this.playHeroIntro();
            this.playedOnce = true;
        } else {
            await this.playRandomTrack();
        }
    }

    async playHeroIntro() {
        this.audio.src = `/${this.heroIntroPath}`;
        await this.audio.play();
    }

    async playRandomTrack() {
        // Exclure hero-intro de la sélection aléatoire
        const randomIndex = Math.floor(Math.random() * this.regularPlaylist.length);
        const track = this.regularPlaylist[randomIndex];
        this.audio.src = `/${track.path}`;
        await this.audio.play();
    }
}
```

##### **c) Gestion Événements Simplifiée**
```javascript
this.audio.addEventListener('ended', () => {
    // À la fin de n'importe quelle piste : jouer aléatoire
    this.playRandomTrack();
});
```

---

### **3. Système de Cache Intelligent**

#### **Cache côté Backend**
```php
// api/music-scanner.php
$cacheFile = __DIR__ . '/../cache/music-playlist.json';
$cacheDuration = 300; // 5 minutes

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheDuration) {
    // Retourner cache
    echo file_get_contents($cacheFile);
} else {
    // Scanner et créer nouveau cache
    $playlist = scanMusicDirectory();
    file_put_contents($cacheFile, json_encode($playlist));
    echo json_encode($playlist);
}
```

#### **Cache côté Frontend**
```javascript
// localStorage avec timestamp
const CACHE_KEY = 'dnd_music_playlist';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async loadPlaylist() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION) {
            this.playlist = data.playlist;
            return;
        }
    }

    // Charger depuis API
    const response = await fetch('/api/music-scanner.php');
    const data = await response.json();

    localStorage.setItem(CACHE_KEY, JSON.stringify({
        playlist: data.files,
        timestamp: Date.now()
    }));

    this.playlist = data.files;
}
```

---

## 📋 Plan d'Implémentation Détaillé

### **Phase 1 : Backend PHP** (30 min)

#### **Étape 1.1 : Améliorer music-scanner.php**
```php
✅ Ajouter système de cache (fichier JSON)
✅ Améliorer détection hero-intro.mp3
✅ Ajouter exclusions (.git, node_modules, cache)
✅ Logging des erreurs
✅ Endpoint invalidation cache (?refresh=1)
```

**Fichier** : `api/music-scanner.php`

**Tests** :
- Tester scan avec 2 MP3 actuels
- Ajouter un MP3, vérifier détection
- Supprimer un MP3, vérifier mise à jour
- Tester cache (5 min)

---

### **Phase 2 : Frontend JavaScript** (45 min)

#### **Étape 2.1 : Refactoriser DnDMusicPlayer**
```javascript
✅ Supprimer createWeightedPlaylist()
✅ Ajouter playedOnce flag
✅ Séparer regularPlaylist (sans hero-intro)
✅ Garantir hero-intro EN PREMIER
✅ Lecture aléatoire après hero-intro
```

**Fichier** : `js/dnd-music-player.js`

**Changements Clés** :
```javascript
// Ligne 14 : Supprimer shuffle, heroIntroWeight
this.playedOnce = false;
this.regularPlaylist = [];

// Ligne 59-68 : Simplifier loadPlaylist
this.heroIntroPath = data.heroIntro;
this.regularPlaylist = data.files.filter(f => f.path !== this.heroIntroPath);

// Ligne 70-84 : Supprimer createWeightedPlaylist()

// Ligne 210-223 : Simplifier startPlayback
if (!this.playedOnce && this.heroIntroPath) {
    await this.playHeroIntro();
} else {
    await this.playRandomTrack();
}

// Ajouter nouvelles méthodes
async playHeroIntro() { ... }
async playRandomTrack() { ... }

// Ligne 263-275 : Simplifier playNext
async playNext() {
    await this.playRandomTrack();
}
```

---

#### **Étape 2.2 : Ajouter Cache localStorage**
```javascript
✅ Stocker playlist dans localStorage
✅ Ajouter timestamp de cache
✅ Vérifier fraîcheur avant utilisation
✅ Fallback API si cache expiré
```

---

### **Phase 3 : Tests & Validation** (15 min)

#### **Tests Fonctionnels**
1. ✅ Hero-intro joue EN PREMIER au démarrage
2. ✅ Après hero-intro, musique aléatoire
3. ✅ Ajout MP3 détecté après 5 min
4. ✅ Suppression MP3 détectée après 5 min
5. ✅ Sous-dossiers scannés correctement
6. ✅ Boutons prev/next fonctionnent
7. ✅ Volume et mute fonctionnent
8. ✅ Mobile + desktop fonctionnent

---

### **Phase 4 : Optimisations** (optionnel, 20 min)

#### **Optimisation Performance**
```javascript
✅ Preload hero-intro.mp3 au chargement page
✅ Lazy load autres pistes
✅ Compression MP3 (si gros fichiers)
✅ Service Worker pour offline (avancé)
```

---

## 🔧 Code de Refactorisation

### **1. Nouveau music-scanner.php**

```php
<?php
/**
 * Scanner automatique des fichiers audio MP3 - VERSION OPTIMISÉE
 * - Cache intelligent (5 minutes)
 * - Détection garantie de hero-intro.mp3
 * - Support exclusions
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

define('CACHE_FILE', __DIR__ . '/../cache/music-playlist.json');
define('CACHE_DURATION', 300); // 5 minutes
define('MUSIC_DIR', dirname(__DIR__) . '/media/musique');
define('EXCLUDE_DIRS', ['.git', 'node_modules', 'cache', 'vendor']);

function shouldRefreshCache() {
    return isset($_GET['refresh']) ||
           !file_exists(CACHE_FILE) ||
           (time() - filemtime(CACHE_FILE)) >= CACHE_DURATION;
}

function scanMusicDirectory() {
    $musicFiles = [];
    $heroIntroPath = null;

    $iterator = new RecursiveDirectoryIterator(MUSIC_DIR, RecursiveDirectoryIterator::SKIP_DOTS);
    $recursiveIterator = new RecursiveIteratorIterator($iterator);

    foreach ($recursiveIterator as $file) {
        // Vérifier exclusions
        $path = $file->getPathname();
        $excluded = false;
        foreach (EXCLUDE_DIRS as $excludeDir) {
            if (strpos($path, DIRECTORY_SEPARATOR . $excludeDir . DIRECTORY_SEPARATOR) !== false) {
                $excluded = true;
                break;
            }
        }
        if ($excluded) continue;

        if ($file->isFile() && strtolower($file->getExtension()) === 'mp3') {
            $fullPath = str_replace('\\', '/', $file->getPathname());
            $projectRoot = str_replace('\\', '/', dirname(__DIR__));
            $relativePath = str_replace($projectRoot . '/', '', $fullPath);

            // Détecter hero-intro.mp3 (chemin direct uniquement)
            if ($file->getBasename() === 'hero-intro.mp3' &&
                $relativePath === 'media/musique/hero-intro.mp3') {
                $heroIntroPath = $relativePath;
            }

            $musicFiles[] = [
                'path' => $relativePath,
                'name' => $file->getBasename('.mp3'),
                'size' => $file->getSize()
            ];
        }
    }

    // Trier par nom
    usort($musicFiles, fn($a, $b) => strcmp($a['name'], $b['name']));

    return [
        'files' => $musicFiles,
        'heroIntro' => $heroIntroPath,
        'count' => count($musicFiles),
        'scannedAt' => date('c')
    ];
}

try {
    if (shouldRefreshCache()) {
        $result = scanMusicDirectory();

        // Créer dossier cache si nécessaire
        $cacheDir = dirname(CACHE_FILE);
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }

        file_put_contents(CACHE_FILE, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    } else {
        $result = json_decode(file_get_contents(CACHE_FILE), true);
    }

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    error_log("Erreur music-scanner: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur scan musique', 'message' => $e->getMessage()]);
}
```

---

### **2. Nouveau dnd-music-player.js (extrait clé)**

```javascript
class DnDMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.heroIntroPath = null;
        this.regularPlaylist = [];
        this.playedOnce = false;
        this.isPlaying = false;
        this.volume = 0.15;

        this.initializePlayer();
        this.setupEventListeners();
    }

    async loadPlaylist() {
        try {
            // Essayer cache localStorage
            const cached = this.getCachedPlaylist();
            if (cached) {
                this.setPlaylistData(cached);
                return;
            }

            // Charger depuis API
            const response = await fetch('/api/music-scanner.php');
            const data = await response.json();

            this.setPlaylistData(data);
            this.cachePlaylist(data);

        } catch (error) {
            console.error('Erreur chargement playlist:', error);
            this.useFallbackPlaylist();
        }
    }

    setPlaylistData(data) {
        this.playlist = data.files || [];
        this.heroIntroPath = data.heroIntro;

        // Créer playlist régulière (sans hero-intro)
        this.regularPlaylist = this.playlist.filter(
            track => track.path !== this.heroIntroPath
        );
    }

    async startPlayback() {
        if (!this.playlist.length) return;

        // TOUJOURS jouer hero-intro en premier
        if (!this.playedOnce && this.heroIntroPath) {
            await this.playHeroIntro();
            this.playedOnce = true;
        } else {
            await this.playRandomTrack();
        }
    }

    async playHeroIntro() {
        this.audio.src = `/${this.heroIntroPath}`;
        this.audio.load();
        await this.play();
    }

    async playRandomTrack() {
        if (!this.regularPlaylist.length) return;

        const randomIndex = Math.floor(Math.random() * this.regularPlaylist.length);
        const track = this.regularPlaylist[randomIndex];

        this.audio.src = `/${track.path}`;
        this.audio.load();
        await this.play();
    }

    async playNext() {
        // Après hero-intro : toujours aléatoire
        await this.playRandomTrack();
    }

    // Cache helpers
    getCachedPlaylist() {
        const cached = localStorage.getItem('dnd_music_playlist');
        if (!cached) return null;

        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;

        return (age < 5 * 60 * 1000) ? data.playlist : null;
    }

    cachePlaylist(data) {
        localStorage.setItem('dnd_music_playlist', JSON.stringify({
            playlist: data,
            timestamp: Date.now()
        }));
    }
}
```

---

## ✅ Critères de Réussite

### **Tests de Validation**

1. **Hero-intro EN PREMIER** ✅
   - Au démarrage, hero-intro.mp3 joue
   - Vérifié par console.log du src audio

2. **Lecture Aléatoire** ✅
   - Après hero-intro, musique différente
   - Hero-intro ne rejoue pas sauf si bouton prev

3. **Détection Dynamique** ✅
   - Ajouter un MP3 → détecté après 5 min ou refresh
   - Supprimer un MP3 → retiré après 5 min ou refresh

4. **Performance** ✅
   - Chargement initial < 500ms
   - Pas de lag entre pistes
   - Cache réduit requêtes API

---

## 📊 Avantages de la Refactorisation

### **Avant (Système Actuel)**
- ❌ Hero-intro pas garanti en premier
- ❌ Système pondéré complexe
- ❌ Playlist dupliquée en mémoire
- ❌ Logique confuse

### **Après (Système Refactorisé)**
- ✅ Hero-intro **TOUJOURS** en premier
- ✅ Logique simple et claire
- ✅ Performance optimisée (cache)
- ✅ Maintenabilité maximale
- ✅ Extensible (playlists thématiques futures)

---

## 🚀 Estimation Temps Total

| Phase | Durée | Complexité |
|-------|-------|------------|
| Backend PHP | 30 min | Faible |
| Frontend JS | 45 min | Moyenne |
| Tests | 15 min | Faible |
| **TOTAL** | **90 min** | **Moyenne** |

---

## 📝 Checklist Implémentation

### **Backend**
- [ ] Créer dossier `cache/`
- [ ] Modifier `api/music-scanner.php`
- [ ] Ajouter système de cache
- [ ] Tester avec `?refresh=1`
- [ ] Valider JSON retourné

### **Frontend**
- [ ] Modifier `js/dnd-music-player.js`
- [ ] Supprimer `createWeightedPlaylist()`
- [ ] Ajouter `playHeroIntro()` et `playRandomTrack()`
- [ ] Implémenter cache localStorage
- [ ] Simplifier `playNext()`

### **Tests**
- [ ] Hero-intro joue en premier
- [ ] Lecture aléatoire après
- [ ] Cache fonctionne (5 min)
- [ ] Ajout/suppression MP3 détecté
- [ ] Boutons contrôle fonctionnent

---

## 🎯 Résultat Final Attendu

```
┌─────────────────────────────────────┐
│  Démarrage Page                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Chargement Playlist                │
│  (cache ou API)                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Première Interaction Utilisateur   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🎵 HERO-INTRO.MP3 JOUE             │
│  (garanti 100%)                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Hero-intro se termine              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🎲 Musique ALÉATOIRE               │
│  (playlist sans hero-intro)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Fin de piste                       │
└──────────────┬──────────────────────┘
               │
               └──────────────────────► Retour à 🎲
```

---

## 🏆 Conclusion

### **Problème Résolu**
✅ Hero-intro joue **SYSTÉMATIQUEMENT** en premier
✅ Lecture aléatoire **simple et performante**
✅ Système **extensible** et **maintenable**

### **Prochaines Étapes**
1. Implémenter Phase 1 (Backend)
2. Implémenter Phase 2 (Frontend)
3. Tester exhaustivement
4. Déployer en production

**Plan de refactorisation complet et prêt à implémenter ! 🎉**
