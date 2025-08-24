/**
 * =================================================================
 * LECTEUR AUDIO MEDIEVAL GEEK&DRAGON
 * =================================================================
 * Lecteur audio adaptatif avec continuité entre pages
 * Détection automatique des MP3, style médiéval D&D
 */

class GeeknDragonAudioPlayer {
    constructor() {
        // Préférences utilisateur
        const storedVolume = parseFloat(localStorage.getItem('gnd-audio-volume')) || 0.15;
        const collapsedPref = localStorage.getItem('gnd-audio-collapsed');
        const isMobile = window.innerWidth <= 768;

        this.state = {
            isPlaying: false,
            currentTrack: 0,
            currentTime: 0,
            volume: storedVolume,
            playlist: [],
            // Sur mobile, réduire par défaut le lecteur si aucune préférence n'est stockée
            isCollapsed: collapsedPref !== null ? collapsedPref === 'true' : isMobile,
            currentPage: this.getCurrentPage(),
            shuffleOrder: [],
            isLoaded: false,
            quickStartFile: 'hero-intro.mp3', // Fichier de démarrage rapide
            
            // Nouvelles propriétés pour la gestion intelligente
            currentPagePlaylist: [], // Musiques du dossier de la page courante
            defaultPlaylist: [], // Musiques du dossier général musique/
            currentPlaylistType: 'current', // 'current' ou 'default'
            priorityRatio: { current: 0.7, default: 0.3 } // 70% - 30%
        };
        
        this.audioElement = null;
        this.playerElement = null;
        this.currentDirectory = '';
        
        this.init();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('boutique')) return 'boutique';
        if (path.includes('produit-')) return 'produit';
        return 'index';
    }
    
    async init() {
        console.log('🎵 Initialisation du lecteur audio Geek&Dragon...');
        
        // Créer l'élément audio
        this.createAudioElement();
        
        // Créer l'interface
        this.createPlayerInterface();
        
        // Vérifier si on a changé de page
        await this.handlePageChange();
        
        // Démarrage rapide avec fichier hero (si pas de restauration)
        if (!this.state.isPlaying) {
            await this.quickStart();
        }
        
        // Scanner les musiques en arrière-plan
        this.scanMusicFiles();
        
        console.log('✅ Lecteur audio Geek&Dragon initialisé');
    }
    
    async handlePageChange() {
        const savedState = localStorage.getItem('gnd-audio-state');
        const currentPage = this.getCurrentPage();
        
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const previousPage = state.currentPage;
                
                if (previousPage && previousPage !== currentPage) {
                    console.log(`🔄 Changement de page détecté: ${previousPage} → ${currentPage}`);
                    
                    // Mettre à jour la page courante
                    this.state.currentPage = currentPage;
                    
                    // Restaurer l'état de lecture en cours
                    this.restorePlaybackState();
                    
                    // Les nouvelles playlists seront scannées dans scanMusicFiles()
                    return;
                }
            } catch (e) {
                console.log('Erreur lors de la vérification du changement de page:', e);
            }
        }
        
        // Si pas de changement de page ou premier chargement
        this.restorePlaybackState();
    }
    
    createAudioElement() {
        // Utiliser l'élément audio existant ou en créer un
        this.audioElement = document.querySelector('#musique-fond') || document.createElement('audio');
        this.audioElement.id = 'musique-fond';
        this.audioElement.preload = 'auto';
        this.audioElement.autoplay = true;
        this.audioElement.volume = this.state.volume;
        
        if (!document.querySelector('#musique-fond')) {
            document.body.appendChild(this.audioElement);
        }
        
        // Événements audio
        this.audioElement.addEventListener('ended', () => this.playNext());
        this.audioElement.addEventListener('timeupdate', () => this.updatePlaybackState());
        this.audioElement.addEventListener('loadeddata', () => {
            if (this.state.currentTime > 0) {
                this.audioElement.currentTime = this.state.currentTime;
            }
        });
    }
    
    createPlayerInterface() {
        // Vérifier si le lecteur existe déjà
        if (document.querySelector('.gnd-audio-player')) {
            this.playerElement = document.querySelector('.gnd-audio-player');
            this.updatePlayerInterface();
            return;
        }
        
        const playerHTML = `
            <div class="gnd-audio-player ${this.state.isCollapsed ? 'collapsed' : ''}" id="gndAudioPlayer">
                <div class="player-toggle" onclick="window.gndAudioPlayer.toggleCollapse()">
                    <i class="fas fa-music"></i>
                </div>
                
                <div class="player-controls">
                    <div class="controls-row">
                        <button class="control-btn play-btn" onclick="window.gndAudioPlayer.togglePlay()" title="Lecture/Pause">
                            <i class="fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                        </button>

                        <div class="volume-control">
                            <input type="range" min="0" max="100" value="${this.state.volume * 100}"
                                   class="volume-slider" onchange="window.gndAudioPlayer.setVolume(this.value)">
                        </div>

                        <button class="collapse-btn" onclick="window.gndAudioPlayer.toggleCollapse()" title="Réduire">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', playerHTML);
        this.playerElement = document.querySelector('.gnd-audio-player');
        
        // Injecter les styles CSS
        this.injectStyles();
    }
    
    async quickStart() {
        // Essayer de charger le fichier de démarrage rapide
        const quickStartPath = `musique/${this.state.currentPage}/${this.state.quickStartFile}`;
        
        try {
            // Tester si le fichier existe
            const response = await fetch(quickStartPath, { method: 'HEAD' });
            if (response.ok) {
                this.audioElement.src = quickStartPath;
                this.audioElement.load();
                this.state.playlist = [quickStartPath];
                this.updateTrackInfo(this.state.quickStartFile);
                
                // Démarrage automatique
                try {
                    await this.audioElement.play();
                    this.state.isPlaying = true;
                    this.updatePlayButton();
                    console.log('🎵 Démarrage rapide avec:', this.state.quickStartFile);
                } catch (e) {
                    console.log('🎵 Autoplay bloqué, en attente d\'interaction utilisateur');
                    this.setupAutoplayFallback();
                }
                return;
            }
        } catch (e) {
            console.log('ℹ️ Fichier de démarrage rapide non trouvé, passage au scan complet');
        }
        
        // Si pas de fichier de démarrage, scanner directement
        await this.scanMusicFiles();
    }
    
    async scanMusicFiles() {
        console.log('🔍 Scan intelligent des fichiers musicaux...');
        
        // Créer le scanner si pas encore fait
        if (!this.musicScanner) {
            await this.loadMusicScanner();
            this.musicScanner = new window.MusicFileScanner();
        }
        
        // Scanner le dossier de la page courante
        const pageDirectory = `musique/${this.state.currentPage}`;
        const currentPageFiles = await this.musicScanner.scanDirectory(pageDirectory);
        
        // Scanner le dossier par défaut
        const defaultFiles = await this.musicScanner.scanDirectory('musique');
        
        // Stocker les deux playlists séparément
        this.state.currentPagePlaylist = [...new Set(currentPageFiles)];
        this.state.defaultPlaylist = [...new Set(defaultFiles)];
        
        console.log(`📁 Page courante (${pageDirectory}): ${this.state.currentPagePlaylist.length} pistes`);
        console.log(`📁 Dossier général: ${this.state.defaultPlaylist.length} pistes`);
        
        // Choisir la playlist initiale
        if (this.state.currentPagePlaylist.length > 0) {
            this.state.currentPlaylistType = 'current';
            this.state.playlist = [...this.state.currentPagePlaylist];
            this.currentDirectory = pageDirectory;
        } else if (this.state.defaultPlaylist.length > 0) {
            this.state.currentPlaylistType = 'default';
            this.state.playlist = [...this.state.defaultPlaylist];
            this.currentDirectory = 'musique';
        }
        
        if (this.state.playlist.length > 0) {
            this.shufflePlaylist();
            
            // Si on n'avait que le fichier de démarrage, charger la première piste
            if (this.state.playlist.length > 1 || !this.state.isPlaying) {
                this.loadTrack(0);

                if (!this.state.isPlaying) {
                    try {
                        await this.audioElement.play();
                        this.state.isPlaying = true;
                        this.updatePlayButton();
                    } catch (e) {
                        console.log("🎵 Autoplay bloqué, en attente d'interaction utilisateur");
                        this.setupAutoplayFallback();
                    }
                }
            }

            this.updateTrackInfo();
            console.log(`✅ Système de priorité activé - Courante: ${this.state.currentPagePlaylist.length}, Défaut: ${this.state.defaultPlaylist.length}`);
        } else {
            console.log('⚠️ Aucune musique trouvée');
            this.updateTrackInfo('Aucune musique disponible');
            this.showMusicSuggestions();
        }
    }
    
    async loadMusicScanner() {
        // Charger le scanner de musique dynamiquement
        if (!document.querySelector('#music-scanner-script')) {
            const script = document.createElement('script');
            script.id = 'music-scanner-script';
            script.src = 'js/music-scanner.js';
            document.head.appendChild(script);
            
            // Attendre que le script se charge
            await new Promise((resolve) => {
                script.onload = resolve;
                script.onerror = resolve; // Continuer même si erreur
            });
        }
    }
    
    showMusicSuggestions() {
        if (this.musicScanner) {
            const suggestions = this.musicScanner.getSuggestedFilenames(this.state.currentPage);
            console.log(`🎵 Suggestions de fichiers pour ${this.state.currentPage}:`);
            suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
            
            // Afficher une notification visuelle
            this.showNotification(
                `Aucune musique trouvée. Ajoutez des fichiers MP3 dans le dossier musique/${this.state.currentPage}/ ou musique/`,
                'info'
            );
        }
    }
    
    showNotification(message, type = 'info') {
        // Créer une notification simple
        const notification = document.createElement('div');
        notification.className = 'gnd-audio-notification';
        notification.innerHTML = `
            <div class="notification-content ${type}">
                <i class="fas fa-music"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Injecter les styles si pas encore fait
        this.injectNotificationStyles();
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 8 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }
    
    shufflePlaylist() {
        const indices = Array.from({ length: this.state.playlist.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        this.state.shuffleOrder = indices;
    }
    
    loadTrack(index) {
        if (!this.state.playlist[index]) return;
        
        const actualIndex = this.state.shuffleOrder[index] || index;
        const trackPath = this.state.playlist[actualIndex];
        
        this.audioElement.src = trackPath;
        this.audioElement.load();
        this.state.currentTrack = index;
        
        const fileName = trackPath.split('/').pop().replace('.mp3', '');
        this.updateTrackInfo(fileName);
    }
    
    async togglePlay() {
        if (!this.audioElement.src) return;
        
        if (this.state.isPlaying) {
            this.audioElement.pause();
            this.state.isPlaying = false;
        } else {
            try {
                await this.audioElement.play();
                this.state.isPlaying = true;
            } catch (error) {
                console.log('Erreur de lecture:', error);
                return;
            }
        }
        
        this.updatePlayButton();
        this.savePlaybackState();
    }
    
    playNext() {
        console.log('🔄 playNext() appelé - État isPlaying:', this.state.isPlaying);
        
        // Logique de sélection intelligente de la prochaine piste
        this.selectNextPlaylistWithPriority();
        
        if (this.state.playlist.length === 0) {
            console.log('⚠️ Aucune playlist disponible');
            return;
        }
        
        let nextTrack = (this.state.currentTrack + 1) % this.state.playlist.length;
        
        // Si on a fini la playlist courante, remélanger
        if (nextTrack === 0) {
            console.log('🔀 Fin de playlist, remélange...');
            this.shufflePlaylist();
        }
        
        console.log(`🎵 Chargement piste ${nextTrack + 1}/${this.state.playlist.length}`);
        this.loadTrack(nextTrack);
        
        // TOUJOURS continuer la lecture automatiquement
        setTimeout(() => {
            this.audioElement.play().then(() => {
                this.state.isPlaying = true;
                this.updatePlayButton();
                console.log('✅ Piste suivante en cours de lecture');
            }).catch(error => {
                console.log('⚠️ Erreur lecture:', error);
                // Réessayer une fois
                setTimeout(() => {
                    this.audioElement.play().catch(() => console.log('Réessai échoué'));
                }, 1000);
            });
        }, 200);
    }
    
    selectNextPlaylistWithPriority() {
        // Si une seule playlist disponible, l'utiliser
        if (this.state.currentPagePlaylist.length === 0 && this.state.defaultPlaylist.length > 0) {
            this.switchToPlaylist('default');
            return;
        }
        
        if (this.state.defaultPlaylist.length === 0 && this.state.currentPagePlaylist.length > 0) {
            this.switchToPlaylist('current');
            return;
        }
        
        // Si les deux playlists sont disponibles, utiliser la priorité
        if (this.state.currentPagePlaylist.length > 0 && this.state.defaultPlaylist.length > 0) {
            const random = Math.random();
            
            if (random <= this.state.priorityRatio.current) {
                // 70% de chance : playlist de la page courante
                this.switchToPlaylist('current');
                console.log('🎵 Priorité: Musique de la page courante (70%)');
            } else {
                // 30% de chance : playlist par défaut
                this.switchToPlaylist('default');
                console.log('🎵 Priorité: Musique générale (30%)');
            }
        }
    }
    
    switchToPlaylist(type) {
        if (type === this.state.currentPlaylistType) {
            return; // Déjà sur la bonne playlist
        }
        
        const wasPlaying = this.state.isPlaying;
        
        if (type === 'current' && this.state.currentPagePlaylist.length > 0) {
            this.state.currentPlaylistType = 'current';
            this.state.playlist = [...this.state.currentPagePlaylist];
            this.currentDirectory = `musique/${this.state.currentPage}`;
        } else if (type === 'default' && this.state.defaultPlaylist.length > 0) {
            this.state.currentPlaylistType = 'default';
            this.state.playlist = [...this.state.defaultPlaylist];
            this.currentDirectory = 'musique';
        } else {
            return; // Playlist demandée non disponible
        }
        
        // Remélanger la nouvelle playlist
        this.shufflePlaylist();
        this.state.currentTrack = 0;
        
        console.log(`🔄 Changement vers playlist ${type}: ${this.state.playlist.length} pistes`);
        
        // Ne pas charger automatiquement, laisser playNext() le faire
    }
    
    setVolume(value) {
        const volume = value / 100;
        this.state.volume = volume;
        this.audioElement.volume = volume;
        localStorage.setItem('gnd-audio-volume', volume.toString());
    }
    
    toggleCollapse() {
        this.state.isCollapsed = !this.state.isCollapsed;
        this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
        
        const chevron = this.playerElement.querySelector('.collapse-btn i');
        chevron.className = `fas fa-chevron-${this.state.isCollapsed ? 'up' : 'down'}`;
        
        localStorage.setItem('gnd-audio-collapsed', this.state.isCollapsed.toString());
    }
    
    updatePlayButton() {
        const playBtn = this.playerElement.querySelector('.control-btn i');
        if (playBtn) {
            playBtn.className = `fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}`;
        }
    }
    
    updateTrackInfo(trackName = null) {
        const trackInfoElement = this.playerElement.querySelector('.track-name');
        const counterElement = this.playerElement.querySelector('.track-counter');
        
        if (trackName) {
            trackInfoElement.textContent = trackName;
        } else if (this.state.playlist.length > 0) {
            const currentFile = this.state.playlist[this.state.shuffleOrder[this.state.currentTrack] || this.state.currentTrack];
            const fileName = currentFile ? currentFile.split('/').pop().replace('.mp3', '') : 'Inconnu';
            trackInfoElement.textContent = fileName;
        }
        
        // Affichage amélioré avec indication de la source
        const sourceIcon = this.state.currentPlaylistType === 'current' ? '📍' : '🌍';
        const totalTracks = this.state.currentPagePlaylist.length + this.state.defaultPlaylist.length;
        counterElement.textContent = `${sourceIcon} ${this.state.currentTrack + 1}/${this.state.playlist.length} (Total: ${totalTracks})`;
    }
    
    updatePlaybackState() {
        if (this.audioElement && !this.audioElement.paused) {
            this.state.currentTime = this.audioElement.currentTime;
            this.savePlaybackState();
        }
    }
    
    savePlaybackState() {
        const state = {
            isPlaying: this.state.isPlaying,
            currentTrack: this.state.currentTrack,
            currentTime: this.state.currentTime,
            playlist: this.state.playlist,
            shuffleOrder: this.state.shuffleOrder,
            currentDirectory: this.currentDirectory,
            
            // Nouvelles propriétés pour la logique intelligente
            currentPagePlaylist: this.state.currentPagePlaylist,
            defaultPlaylist: this.state.defaultPlaylist,
            currentPlaylistType: this.state.currentPlaylistType,
            currentPage: this.state.currentPage,
            
            timestamp: Date.now()
        };
        
        localStorage.setItem('gnd-audio-state', JSON.stringify(state));
    }
    
    restorePlaybackState() {
        const savedState = localStorage.getItem('gnd-audio-state');
        if (!savedState) return;
        
        try {
            const state = JSON.parse(savedState);
            
            // Vérifier que l'état n'est pas trop ancien (plus de 30 minutes)
            if (Date.now() - state.timestamp > 30 * 60 * 1000) {
                return;
            }
            
            // Restaurer l'état avec les nouvelles propriétés
            if (state.playlist && state.playlist.length > 0) {
                this.state.playlist = state.playlist;
                this.state.shuffleOrder = state.shuffleOrder || [];
                this.state.currentTrack = state.currentTrack || 0;
                this.state.currentTime = state.currentTime || 0;
                this.currentDirectory = state.currentDirectory || this.currentDirectory;
                
                // Restaurer les playlists séparées si disponibles
                if (state.currentPagePlaylist) {
                    this.state.currentPagePlaylist = state.currentPagePlaylist;
                }
                if (state.defaultPlaylist) {
                    this.state.defaultPlaylist = state.defaultPlaylist;
                }
                if (state.currentPlaylistType) {
                    this.state.currentPlaylistType = state.currentPlaylistType;
                }
                
                this.loadTrack(this.state.currentTrack);
                
                if (state.isPlaying) {
                    // Reprendre la lecture après un court délai
                    setTimeout(() => {
                        this.audioElement.play().then(() => {
                            this.state.isPlaying = true;
                            this.updatePlayButton();
                        }).catch(() => {
                            this.setupAutoplayFallback();
                        });
                    }, 100);
                }
                
                console.log('🔄 État restauré - Continuité de lecture maintenue');
            }
        } catch (error) {
            console.log('Erreur lors de la restauration:', error);
        }
    }
    
    setupAutoplayFallback() {
        const oneTimePlay = () => {
            if (!this.state.isPlaying && this.audioElement.src) {
                this.audioElement.play().then(() => {
                    this.state.isPlaying = true;
                    this.updatePlayButton();
                    console.log('🎵 Lecture activée après interaction utilisateur');
                }).catch(() => {});
                document.removeEventListener('click', oneTimePlay);
                document.removeEventListener('keydown', oneTimePlay);
            }
        };
        
        document.addEventListener('click', oneTimePlay);
        document.addEventListener('keydown', oneTimePlay);
    }
    
    updatePlayerInterface() {
        // Mettre à jour l'interface si elle existe déjà
        this.updatePlayButton();
        this.updateTrackInfo();
        
        const volumeSlider = this.playerElement.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.state.volume * 100;
        }
        
        this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
    }
    
    injectStyles() {
        if (document.querySelector('#gnd-audio-styles')) return;
        
        const styles = `
            <style id="gnd-audio-styles">
            .gnd-audio-player {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--primary-color, #8b4513) 0%, var(--primary-dark, #654321) 100%);
                border: 2px solid var(--secondary-color, #d4af37);
                border-radius: var(--border-radius, 12px);
                box-shadow: 
                    0 8px 25px rgba(0, 0, 0, 0.5),
                    0 0 15px rgba(212, 175, 55, 0.3);
                color: var(--light-text, #ffffff);
                font-family: var(--font-heading, 'Cinzel', serif);
                z-index: 1500;
                backdrop-filter: blur(15px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                min-width: 200px;
                max-width: 220px;
            }
            
            .gnd-audio-player::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, 
                    var(--secondary-color, #d4af37), 
                    var(--mystical-purple, #6a0dad), 
                    var(--dragon-red, #dc143c), 
                    var(--forest-green, #228b22));
                border-radius: var(--border-radius, 12px);
                z-index: -1;
                opacity: 0.6;
                filter: blur(2px);
            }
            
            .gnd-audio-player.collapsed {
                min-width: 50px;
                max-width: 50px;
            }
            
            .gnd-audio-player.collapsed .player-controls {
                display: none;
            }
            
            .player-toggle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--secondary-color, #d4af37);
                color: var(--dark-bg, #1a1a1a);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1rem;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
                transition: all var(--transition, 0.3s ease);
                opacity: 0;
                pointer-events: none;
            }
            
            .gnd-audio-player.collapsed .player-toggle {
                opacity: 1;
                pointer-events: auto;
            }
            
            .player-toggle:hover {
                transform: translate(-50%, -50%) scale(1.1);
                box-shadow: 
                    0 6px 16px rgba(0, 0, 0, 0.4),
                    0 0 12px rgba(212, 175, 55, 0.6);
            }
            
            .player-controls {
                padding: 1rem;
                display: block;
            }
            
            
            .collapse-btn {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid var(--secondary-color, #d4af37);
                color: var(--secondary-color, #d4af37);
                cursor: pointer;
                font-size: 0.8rem;
                width: 25px;
                height: 25px;
                border-radius: 4px;
                transition: all var(--transition, 0.3s ease);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .collapse-btn:hover {
                background: var(--secondary-color, #d4af37);
                color: var(--dark-bg, #1a1a1a);
                transform: scale(1.1);
            }
            
            .controls-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
                padding: 0.75rem;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 8px;
                border: 1px solid rgba(212, 175, 55, 0.3);
            }
            
            .control-btn {
                background: rgba(0, 0, 0, 0.6);
                color: var(--secondary-color, #d4af37);
                border: 2px solid var(--secondary-color, #d4af37);
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all var(--transition, 0.3s ease);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
            }
            
            .control-btn:hover {
                background: var(--secondary-color, #d4af37);
                color: var(--dark-bg, #1a1a1a);
                transform: scale(1.1);
                box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
            }
            
            .volume-control {
                display: flex;
                align-items: center;
                flex: 1;
                margin: 0 0.5rem;
            }
            
            .volume-slider {
                flex: 1;
                height: 4px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 2px;
                outline: none;
                border: 1px solid var(--secondary-color, #d4af37);
                cursor: pointer;
            }
            
            .volume-slider::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                background: var(--secondary-color, #d4af37);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                transition: all var(--transition, 0.3s ease);
            }
            
            .volume-slider::-webkit-slider-thumb:hover {
                transform: scale(1.3);
                box-shadow: 0 0 6px rgba(212, 175, 55, 0.8);
            }
            
            
            /* Responsive */
            @media (max-width: 768px) {
                .gnd-audio-player {
                    bottom: 10px;
                    right: 10px;
                    min-width: 120px;
                    max-width: 120px;
                    background: rgba(34, 26, 14, 0.7);
                }
                
                .gnd-audio-player.collapsed {
                    min-width: 45px;
                    max-width: 45px;
                }
                
                .player-controls {
                    padding: 0.75rem;
                }
                
                .controls-row {
                    gap: 0.5rem;
                }
                
                .control-btn {
                    width: 30px;
                    height: 30px;
                    font-size: 0.8rem;
                }
                
                .collapse-btn {
                    width: 20px;
                    height: 20px;
                    font-size: 0.7rem;
                }
                
                .player-toggle {
                    width: 35px;
                    height: 35px;
                    font-size: 0.9rem;
                }
            }
            
            /* Animations */
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
                50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.4); }
            }
            
            .gnd-audio-player {
                animation: glow 4s ease-in-out infinite;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    injectNotificationStyles() {
        if (document.querySelector('#gnd-notification-styles')) return;
        
        const notificationStyles = `
            <style id="gnd-notification-styles">
            .gnd-audio-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2000;
                max-width: 500px;
                animation: slideDown 0.3s ease;
            }
            
            .notification-content {
                background: var(--gradient-primary, linear-gradient(135deg, #8b4513, #654321));
                color: var(--light-text, #ffffff);
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius, 12px);
                border: 2px solid var(--secondary-color, #d4af37);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                gap: 1rem;
                backdrop-filter: blur(10px);
            }
            
            .notification-content i {
                color: var(--secondary-color, #d4af37);
                font-size: 1.2rem;
            }
            
            .notification-content span {
                flex: 1;
                font-family: var(--font-heading, 'Cinzel', serif);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            }
            
            .notification-content button {
                background: var(--secondary-color, #d4af37);
                color: var(--dark-bg, #1a1a1a);
                border: none;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', notificationStyles);
    }
}

// Initialisation globale
let gndAudioPlayer = null;

// Auto-initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    if (!window.gndAudioPlayer) {
        window.gndAudioPlayer = new GeeknDragonAudioPlayer();
        gndAudioPlayer = window.gndAudioPlayer;
    }
});

// Export pour usage modulaire si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeeknDragonAudioPlayer;
}
