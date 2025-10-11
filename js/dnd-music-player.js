/**
 * Lecteur Audio D&D - Geek & Dragon
 * Lecteur audio immersif avec lecture aléatoire intelligente
 * Compatible mobile/desktop avec design responsive adaptatif
 */

class DnDMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.initPlaylist = [];
        this.weightedPlaylist = [];
        this.shuffledQueue = []; // Queue exhaustive: toutes les musiques avant répétition
        this.currentIndex = 0;
        this.currentTrack = null; // Track actuel (objet complet avec path, name, isInit)
        this.isPlaying = false;
        this.volume = 0.15; // 15% par défaut
        this.shuffle = true;
        this.isInitialized = false;
        this.firstInteraction = true;
        this.heroIntroPath = null;
        this.firstPlayCompleted = false; // Track si la première lecture depuis init/ a été faite
        this.autoplayBlocked = false; // Track si l'autoplay a été bloqué (attendre un click)
        this.trackSelected = false; // Track si une musique a déjà été sélectionnée

        // Cache pour éviter les recharges inutiles
        this.lastPlaylistUpdate = 0;
        this.playlistCacheTimeout = 30000; // 30 secondes

        // Stocker la référence du listener pour pouvoir le retirer
        this.startMusicHandler = (event) => this.markUserInteraction(event);

        this.initializePlayer();
        this.setupEventListeners();
    }

    // Helper pour accéder aux traductions
    getTranslation(key, fallback = '') {
        if (window.i18n) {
            const keys = key.split('.');
            let value = window.i18n;
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
            return typeof value === 'string' ? value : fallback;
        }
        return fallback;
    }

    async initializePlayer() {
        try {
            await this.loadPlaylist();
            this.setupAudioElement();
            this.createPlayerInterface();
            this.isInitialized = true;
        } catch (error) {
            // Erreur initialisation silencieuse en production
        }
    }

    async loadPlaylist(forceRefresh = false) {
        // Éviter les recharges trop fréquentes (cache 30s)
        const now = Date.now();
        if (!forceRefresh && (now - this.lastPlaylistUpdate) < this.playlistCacheTimeout) {
            return;
        }

        try {
            const response = await fetch('/api/music-scanner.php?t=' + now);
            if (!response.ok) throw new Error('Erreur chargement playlist');

            const data = await response.json();
            const newPlaylist = data.files || [];
            const newInitPlaylist = data.initFiles || [];

            console.log('📁 DEBUG loadPlaylist - Données reçues de l\'API:');
            console.log('  - Total fichiers:', newPlaylist.length);
            console.log('  - Fichiers init:', newInitPlaylist.length);
            console.log('  - Détail fichiers avec isInit:');
            newPlaylist.forEach(track => {
                console.log(`    • ${track.name} - isInit: ${track.isInit} - path: ${track.path}`);
            });

            // Vérifier si la playlist a changé
            const playlistChanged = JSON.stringify(this.playlist) !== JSON.stringify(newPlaylist);

            this.playlist = newPlaylist;
            this.initPlaylist = newInitPlaylist;
            this.heroIntroPath = data.heroIntro;
            this.lastPlaylistUpdate = now;

            // Recréer la playlist pondérée seulement si nécessaire
            if (playlistChanged || !this.weightedPlaylist.length) {
                this.createWeightedPlaylist();
            }

            // Playlist mise à jour silencieusement

        } catch (error) {
            // Erreur chargement playlist - utilisation fallback intelligent
            console.warn('Échec chargement playlist API, utilisation fallback');
            
            // Fallback dynamique : scanner les fichiers connus + découverte
            this.playlist = await this.createFallbackPlaylist();
            this.initPlaylist = [];
            this.heroIntroPath = 'media/musique/init/hero-intro.mp3';
            this.createWeightedPlaylist();
        }
    }

    async createFallbackPlaylist() {
        // Liste des fichiers audio connus (màj avec nouveau chemin init)
        const knownFiles = [
            'media/musique/init/hero-intro.mp3',
            'media/musique/Adgon.mp3', 
            'media/musique/La saga de Diancastraa.mp3'
        ];

        const playlist = [];
        
        // Vérifier quels fichiers existent réellement
        for (const path of knownFiles) {
            try {
                const response = await fetch(`/${path}`, { method: 'HEAD' });
                if (response.ok) {
                    const name = path.split('/').pop().replace('.mp3', '');
                    const isInit = path.includes('/init/');
                    playlist.push({ path, name, isInit });
                }
            } catch (e) {
                // Fichier non accessible, ignorer silencieusement
            }
        }

        return playlist;
    }

    createWeightedPlaylist() {
        this.weightedPlaylist = [];

        // Toujours utiliser toute la playlist (toutes les musiques disponibles)
        this.playlist.forEach((track) => {
            this.weightedPlaylist.push(track);
        });

        // Recréer la queue exhaustive mélangée
        this.refillShuffledQueue();
    }

    /**
     * Remplit la queue avec toutes les musiques disponibles mélangées
     * Garantit qu'on n'entend pas deux fois la même musique avant d'avoir joué toutes les musiques
     * Si c'est la première lecture, s'assure qu'une musique init est en première position
     */
    refillShuffledQueue() {
        // Copier la playlist appropriée
        this.shuffledQueue = [...this.weightedPlaylist];

        // Mélanger la queue
        this.shuffleArray(this.shuffledQueue);

        console.log('🔍 DEBUG refillShuffledQueue:');
        console.log('  - firstPlayCompleted:', this.firstPlayCompleted);
        console.log('  - initPlaylist.length:', this.initPlaylist.length);
        console.log('  - Queue AVANT swap:', this.shuffledQueue.map(t => `${t.name} (isInit: ${t.isInit})`));

        // Si première lecture pas encore effectuée, garantir que les 2 PREMIÈRES musiques soient du dossier init
        if (!this.firstPlayCompleted && this.initPlaylist.length >= 2) {
            // Trouver TOUTES les musiques init dans la queue mélangée
            const initIndices = [];
            this.shuffledQueue.forEach((track, index) => {
                if (track.isInit) {
                    initIndices.push(index);
                }
            });

            console.log('  - Indices de musiques init trouvées:', initIndices);

            // S'assurer que les 2 premières positions contiennent des musiques init
            if (initIndices.length >= 2) {
                // Si position 0 n'est pas init, swapper avec la première musique init trouvée
                if (!this.shuffledQueue[0].isInit) {
                    console.log('  - SWAP position 0: Échange avec position', initIndices[0]);
                    [this.shuffledQueue[0], this.shuffledQueue[initIndices[0]]] =
                    [this.shuffledQueue[initIndices[0]], this.shuffledQueue[0]];

                    // Mettre à jour les indices après le swap
                    initIndices[0] = 0;
                }

                // Si position 1 n'est pas init, swapper avec la deuxième musique init trouvée
                if (!this.shuffledQueue[1].isInit) {
                    // Trouver le premier index init qui n'est pas en position 0
                    const secondInitIndex = initIndices.find(idx => idx !== 0 && idx > 1);
                    if (secondInitIndex !== undefined) {
                        console.log('  - SWAP position 1: Échange avec position', secondInitIndex);
                        [this.shuffledQueue[1], this.shuffledQueue[secondInitIndex]] =
                        [this.shuffledQueue[secondInitIndex], this.shuffledQueue[1]];
                    }
                }
            }
        }

        console.log('  - Queue APRÈS swap:', this.shuffledQueue.map(t => `${t.name} (isInit: ${t.isInit})`));
        console.log('  - Les 2 premières musiques:',
            this.shuffledQueue[0]?.name, '(isInit:', this.shuffledQueue[0]?.isInit + '),',
            this.shuffledQueue[1]?.name, '(isInit:', this.shuffledQueue[1]?.isInit + ')');
    }

    /**
     * Récupère la prochaine musique de la queue exhaustive
     * Si la queue est vide, la remplit à nouveau avec toutes les musiques
     */
    getNextTrackFromQueue() {
        // Si la queue est vide, la remplir à nouveau
        if (this.shuffledQueue.length === 0) {
            this.refillShuffledQueue();
        }

        // Retirer et retourner la première musique de la queue
        return this.shuffledQueue.shift();
    }

    setupAudioElement() {
        this.audio.volume = this.volume;
        this.audio.preload = 'none';

        this.audio.addEventListener('ended', () => {
            // Marquer la première lecture comme effectuée (pour ne plus forcer init en première position)
            if (!this.firstPlayCompleted) {
                this.firstPlayCompleted = true;
            }
            this.playNext();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('❌ ERREUR AUDIO détectée:', e);
            console.error('  - Type erreur:', e.type);
            console.error('  - Source:', this.audio.src);
            console.error('  - Error code:', this.audio.error?.code);
            console.error('  - Error message:', this.audio.error?.message);
            this.playNext(); // Passer au suivant en cas d'erreur
        });

        this.audio.addEventListener('canplaythrough', () => {
            this.updatePlayButton();
        });

        // Synchroniser l'état de lecture avec les événements audio natifs
        this.audio.addEventListener('playing', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.audio.addEventListener('timeupdate', () => {
            this.updateStatusIndicator();
        });
    }

    createPlayerInterface() {
        const existingPlayer = document.getElementById('dnd-music-player');
        if (existingPlayer) existingPlayer.remove();

        const playerHTML = `
            <div id="dnd-music-player" class="music-player-container">
                <div class="music-player">
                    <div class="music-status-indicator"></div>
                    
                    <div class="music-volume-container">
                        <button id="music-mute" class="music-btn volume-btn" title="${this.getTranslation('ui.musicPlayer.volume', 'Volume')}">
                            <svg class="volume-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>
                            </svg>
                            <svg class="mute-icon hidden" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                        </button>
                        <input type="range" id="music-volume" class="volume-slider" min="0" max="100" value="15">
                    </div>
                    
                    <div class="music-controls">
                        <button id="music-prev" class="music-btn" title="${this.getTranslation('ui.musicPlayer.previous', 'Précédent')}">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                            </svg>
                        </button>
                        <button id="music-play-pause" class="music-btn play-pause-btn" title="${this.getTranslation('ui.musicPlayer.playPause', 'Lecture / Pause')}">
                            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg class="pause-icon hidden" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        </button>
                        <button id="music-next" class="music-btn" title="${this.getTranslation('ui.musicPlayer.next', 'Suivant')}">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insérer après le hero ou au début du contenu principal
        const heroSection = document.querySelector('.hero-section');
        const mainContent = document.querySelector('main') || document.body;

        if (heroSection) {
            heroSection.insertAdjacentHTML('afterend', playerHTML);
        } else {
            mainContent.insertAdjacentHTML('afterbegin', playerHTML);
        }

        this.bindControlEvents();
    }

    bindControlEvents() {
        // Contrôles de lecture
        document.getElementById('music-play-pause').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('music-prev').addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('music-next').addEventListener('click', () => {
            this.playNext();
        });

        // Contrôle volume
        const volumeSlider = document.getElementById('music-volume');
        volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        // Marquer comme interaction utilisateur au toucher du volume
        volumeSlider.addEventListener('mousedown', () => {
            this.markUserInteraction();
        });
        volumeSlider.addEventListener('touchstart', () => {
            this.markUserInteraction();
        });

        document.getElementById('music-mute').addEventListener('click', () => {
            this.toggleMute();
        });
    }

    setupEventListeners() {
        // Écouter TOUS les types d'interactions (y compris scroll après F5)
        // Si le navigateur bloque l'autoplay via scroll, on réessaiera au prochain click
        document.addEventListener('click', this.startMusicHandler, true);
        document.addEventListener('keydown', this.startMusicHandler, true);
        document.addEventListener('touchstart', this.startMusicHandler, true);
        document.addEventListener('wheel', this.startMusicHandler, { passive: true, capture: true });
        document.addEventListener('scroll', this.startMusicHandler, { passive: true, capture: true });
        document.addEventListener('touchmove', this.startMusicHandler, { passive: true, capture: true });
    }

    /**
     * Marque qu'une interaction utilisateur a eu lieu
     * Lance automatiquement la lecture si c'est la première interaction
     */
    async markUserInteraction(event) {
        if (this.firstInteraction) {
            // Si l'autoplay a été bloqué, n'accepter QUE les clicks
            if (this.autoplayBlocked && event?.type !== 'click' && event?.type !== 'touchstart') {
                return;
            }

            // Attendre que l'initialisation soit terminée si nécessaire
            if (!this.isInitialized) {
                const startTime = Date.now();
                while (!this.isInitialized && (Date.now() - startTime) < 5000) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Lancer automatiquement la lecture si l'initialisation a réussi
            if (this.isInitialized) {
                const playbackSuccess = await this.startPlayback();

                // Retirer les listeners SEULEMENT si la lecture a réussi
                if (playbackSuccess) {
                    this.firstInteraction = false;
                    this.autoplayBlocked = false;
                    document.removeEventListener('click', this.startMusicHandler, true);
                    document.removeEventListener('keydown', this.startMusicHandler, true);
                    document.removeEventListener('touchstart', this.startMusicHandler, true);
                    document.removeEventListener('wheel', this.startMusicHandler, true);
                    document.removeEventListener('scroll', this.startMusicHandler, true);
                    document.removeEventListener('touchmove', this.startMusicHandler, true);
                } else {
                    // Lecture bloquée - marquer et attendre un click
                    this.autoplayBlocked = true;
                }
            }
        }
    }

    async startPlayback() {
        if (!this.playlist.length) {
            return false;
        }

        console.log('🎵 DEBUG startPlayback:');
        console.log('  - trackSelected:', this.trackSelected);

        // Si on n'a PAS encore sélectionné de musique, en sélectionner une
        if (!this.trackSelected) {
            // Pour la première lecture, sélectionner depuis la queue
            const selectedTrack = this.getNextTrackFromQueue();

            console.log('  - Track sélectionné depuis queue:', selectedTrack?.name);
            console.log('  - isInit:', selectedTrack?.isInit);
            console.log('  - path:', selectedTrack?.path);

            if (!selectedTrack) {
                return false;
            }

            // Stocker le track sélectionné directement au lieu de chercher son index
            this.currentTrack = selectedTrack;
            this.trackSelected = true;

            console.log('  - Track stocké directement:', this.currentTrack.name);
        } else {
            console.log('  - Réutilisation track déjà sélectionné:', this.currentTrack?.name);
        }

        await this.loadCurrentTrack();
        const playSuccess = await this.play();
        return playSuccess;
    }

    async loadCurrentTrack() {
        // Utiliser this.currentTrack si disponible (première lecture), sinon fallback sur this.currentIndex
        const trackToLoad = this.currentTrack || this.playlist[this.currentIndex];

        if (!trackToLoad) return;

        console.log('📀 Chargement track:', trackToLoad.name, '- path:', trackToLoad.path);

        // Encoder correctement l'URL pour gérer les caractères spéciaux
        const encodedPath = trackToLoad.path.split('/').map(part => encodeURIComponent(part)).join('/');
        this.audio.src = `/${encodedPath}`;

        console.log('📀 URL encodée:', this.audio.src);

        try {
            this.audio.load();
        } catch (error) {
            // Erreur chargement piste silencieuse en production
        }
    }

    async play() {
        try {
            await this.audio.play();
            // isPlaying sera mis à jour par l'événement 'playing'
            return true;
        } catch (error) {
            // Si c'est une erreur d'autoplay, ne pas passer au suivant
            // Juste signaler l'échec pour que l'appelant sache
            if (error.name === 'NotAllowedError') {
                return false;
            }
            // Pour les autres erreurs, passer au suivant
            this.playNext();
            return false;
        }
    }

    pause() {
        this.audio.pause();
        // isPlaying sera mis à jour par l'événement 'pause'
    }

    async togglePlayPause() {
        // Si c'est la première interaction, initialiser la lecture
        if (this.firstInteraction) {
            this.markUserInteraction();
            // startPlayback() est déjà appelé dans markUserInteraction()
            return;
        }

        // Sinon, basculer play/pause normalement
        if (this.isPlaying) {
            this.pause();
        } else {
            // Si aucune piste n'est chargée, charger la première
            if (!this.audio.src || this.audio.src === '') {
                await this.loadCurrentTrack();
            }
            await this.play();
        }
    }

    async playNext() {
        console.log('⏭️ playNext() appelé - Stack trace:');
        console.trace();

        // Mémoriser l'état de lecture actuel
        const wasPlaying = this.isPlaying;

        if (this.shuffle) {
            // Mode aléatoire exhaustif: prendre la prochaine musique de la queue
            const selectedTrack = this.getNextTrackFromQueue();
            if (selectedTrack) {
                this.currentTrack = selectedTrack;
                this.currentIndex = this.playlist.findIndex((track) => track.path === selectedTrack.path);
                console.log('  - Nouvelle musique:', selectedTrack.name, '- isInit:', selectedTrack.isInit);
            }
        } else {
            // Mode séquentiel
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.currentTrack = this.playlist[this.currentIndex];
        }

        await this.loadCurrentTrack();
        if (wasPlaying) await this.play();
    }

    async playPrevious() {
        if (this.audio.currentTime > 3) {
            // Si on est à plus de 3s, recommencer la piste actuelle
            this.audio.currentTime = 0;
        } else {
            // Mémoriser l'état de lecture actuel
            const wasPlaying = this.isPlaying;

            // Sinon, aller à la piste précédente
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
            this.currentTrack = this.playlist[this.currentIndex];
            await this.loadCurrentTrack();
            if (wasPlaying) await this.play();
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            document.querySelector('.volume-icon').classList.add('hidden');
            document.querySelector('.mute-icon').classList.remove('hidden');
        } else {
            this.audio.volume = this.volume;
            document.querySelector('.volume-icon').classList.remove('hidden');
            document.querySelector('.mute-icon').classList.add('hidden');
        }
    }

    updatePlayButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');

        if (this.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }

        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        const statusIndicator = document.querySelector('.music-status-indicator');
        if (statusIndicator) {
            if (this.isPlaying) {
                statusIndicator.classList.remove('paused');
            } else {
                statusIndicator.classList.add('paused');
            }
        }
    }

    updateVolumeDisplay() {
        const volumeSlider = document.getElementById('music-volume');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
    }

    // Méthode supprimée : plus de barre de progression

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Initialisation globale
window.dndMusicPlayer = null;

// Démarrer le lecteur quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    if (!window.dndMusicPlayer) {
        window.dndMusicPlayer = new DnDMusicPlayer();
    }
});
