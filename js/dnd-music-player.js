/**
 * Lecteur Audio D&D - Geek & Dragon
 * Lecteur audio immersif avec lecture aléatoire intelligente
 * Compatible mobile/desktop avec design responsive adaptatif
 */

class DnDMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.volume = 0.15; // 15% par défaut
        this.shuffle = true;
        this.isInitialized = false;
        this.firstInteraction = true;
        this.heroIntroPath = null;
        this.heroIntroWeight = 2.5; // Pondération pour hero-intro.mp3
        
        this.initializePlayer();
        this.setupEventListeners();
    }

    async initializePlayer() {
        try {
            await this.loadPlaylist();
            this.setupAudioElement();
            this.createPlayerInterface();
            this.isInitialized = true;
        } catch (error) {
            console.error('Erreur initialisation lecteur:', error);
        }
    }

    async loadPlaylist() {
        try {
            const response = await fetch('/api/music-scanner.php');
            if (!response.ok) throw new Error('Erreur chargement playlist');
            
            const data = await response.json();
            this.playlist = data.files || [];
            this.heroIntroPath = data.heroIntro;
            
            // Créer playlist pondérée avec hero-intro favorisé
            this.createWeightedPlaylist();
            
        } catch (error) {
            console.error('Erreur chargement playlist:', error);
            // Playlist de fallback si l'API échoue
            this.playlist = [
                {path: 'media/musique/hero-intro.mp3', name: 'Hero Intro'},
                {path: 'media/musique/dnd/Agdon.mp3', name: 'Agdon'}
            ];
        }
    }

    createWeightedPlaylist() {
        this.weightedPlaylist = [];
        
        this.playlist.forEach(track => {
            const weight = (track.path === this.heroIntroPath) ? this.heroIntroWeight : 1;
            const weightedCount = Math.ceil(weight);
            
            for (let i = 0; i < weightedCount; i++) {
                this.weightedPlaylist.push(track);
            }
        });
        
        // Mélanger la playlist pondérée
        this.shuffleArray(this.weightedPlaylist);
    }

    setupAudioElement() {
        this.audio.volume = this.volume;
        this.audio.preload = 'none';
        
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.warn('Erreur audio:', e);
            this.playNext(); // Passer au suivant en cas d'erreur
        });
        
        this.audio.addEventListener('canplaythrough', () => {
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
                        <button id="music-mute" class="music-btn volume-btn" title="Volume">
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
                        <button id="music-prev" class="music-btn" title="Précédent">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                            </svg>
                        </button>
                        <button id="music-play-pause" class="music-btn play-pause-btn" title="Lecture / Pause">
                            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg class="pause-icon hidden" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        </button>
                        <button id="music-next" class="music-btn" title="Suivant">
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

        document.getElementById('music-mute').addEventListener('click', () => {
            this.toggleMute();
        });
    }

    setupEventListeners() {
        // Démarrer la musique à la première interaction utilisateur
        const startMusic = () => {
            if (this.firstInteraction && this.isInitialized) {
                this.startPlayback();
                this.firstInteraction = false;
                
                // Retirer les listeners après la première interaction
                document.removeEventListener('click', startMusic, true);
                document.removeEventListener('keydown', startMusic, true);
                document.removeEventListener('touchstart', startMusic, true);
            }
        };

        document.addEventListener('click', startMusic, true);
        document.addEventListener('keydown', startMusic, true);
        document.addEventListener('touchstart', startMusic, true);
    }

    async startPlayback() {
        if (!this.playlist.length) return;
        
        // Commencer par hero-intro.mp3 si disponible
        if (this.heroIntroPath) {
            const heroTrack = this.playlist.find(track => track.path === this.heroIntroPath);
            if (heroTrack) {
                this.currentIndex = this.playlist.indexOf(heroTrack);
            }
        }

        await this.loadCurrentTrack();
        this.play();
    }

    async loadCurrentTrack() {
        if (!this.playlist[this.currentIndex]) return;
        
        const currentTrack = this.playlist[this.currentIndex];
        this.audio.src = `/${currentTrack.path}`;
        
        try {
            this.audio.load();
        } catch (error) {
            console.warn('Erreur chargement piste:', error);
        }
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
        } catch (error) {
            console.warn('Impossible de lire la musique:', error);
            this.playNext();
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    async playNext() {
        if (this.shuffle) {
            // Mode aléatoire pondéré
            this.currentIndex = Math.floor(Math.random() * this.weightedPlaylist.length);
            const selectedTrack = this.weightedPlaylist[this.currentIndex];
            this.currentIndex = this.playlist.findIndex(track => track.path === selectedTrack.path);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        }
        
        await this.loadCurrentTrack();
        if (this.isPlaying) this.play();
    }

    async playPrevious() {
        if (this.audio.currentTime > 3) {
            // Si on est à plus de 3s, recommencer la piste actuelle
            this.audio.currentTime = 0;
        } else {
            // Sinon, aller à la piste précédente
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
            await this.loadCurrentTrack();
            if (this.isPlaying) this.play();
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