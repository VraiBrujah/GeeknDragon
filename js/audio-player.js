/**
 * =================================================================
 * LECTEUR AUDIO MEDIEVAL GEEK&DRAGON
 * =================================================================
 * Lecteur audio adaptatif avec continuité entre pages
 * Détection automatique des MP3, style médiéval D&D
 */

/* global Howl, Howler */

/* eslint-disable */

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
            // Par défaut, le lecteur est réduit pour être plus discret
            isCollapsed: collapsedPref !== null ? collapsedPref === 'true' : true,
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
        
        this.sound = null;
        this.playerElement = null;
        this.currentDirectory = '';
        this.timeUpdater = null;
        this.volumeTimeout = null;
        
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

        // Initialiser Howler
        this.initHowler();

        // Créer l'élément audio avec configuration par défaut
        this.createAudioElement();

        // Créer l'interface
        this.createPlayerInterface();
        
        // Vérifier si on a changé de page et restaurer l'état
        const hasRestoredState = await this.handlePageChange();
        
        // Si aucun état restauré, démarrage rapide
        if (!hasRestoredState) {
            await this.quickStart();
        }
        
        // Scanner les musiques en arrière-plan (sauf si déjà fait dans quickStart)
        if (hasRestoredState) {
            setTimeout(() => this.scanMusicFiles(), 1000);
        }
        
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
                    const hasState = this.restorePlaybackState();
                    
                    return hasState; // Retourner si un état a été restauré
                } else if (state.playlist && state.playlist.length > 0) {
                    // Même page, restaurer l'état existant
                    const hasState = this.restorePlaybackState();
                    return hasState;
                }
            } catch (e) {
                console.log('Erreur lors de la vérification du changement de page:', e);
            }
        }
        
        return false; // Aucun état restauré
    }
    
    initHowler() {
        Howler.autoUnlock = true;
        Howler.volume(this.state.volume);
    }

    createAudioElement() {
        this.audioElement = document.createElement('audio');
        this.audioElement.preload = 'metadata';
        this.audioElement.muted = true;
        this.audioElement.playsInline = true;
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
                <!-- Bouton principal Play/Pause -->
                <div class="main-play-button" 
                     onclick="window.gndAudioPlayer.handleMainButtonClick(event)"
                     oncontextmenu="window.gndAudioPlayer.toggleCollapse(); return false;"
                     title="Clic gauche: Lecture/Pause | Clic droit: Étendre/Réduire">
                    <i class="fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </div>
                
                <!-- Flèche pour afficher le volume -->
                <div class="volume-toggle ${this.state.isCollapsed ? 'hidden' : ''}" 
                     onclick="window.gndAudioPlayer.toggleVolumePanel()" 
                     title="Afficher le volume">
                    <i class="fas fa-chevron-up"></i>
                </div>
                
                <!-- Panel de volume (caché par défaut) -->
                <div class="volume-panel hidden">
                    <div class="volume-control">
                        <i class="fas fa-volume-up volume-icon"></i>
                        <input type="range" min="0" max="100" value="${this.state.volume * 100}"
                               class="volume-slider" onchange="window.gndAudioPlayer.setVolume(this.value)">
                        <span class="volume-value">${Math.round(this.state.volume * 100)}%</span>
                    </div>
                    <div class="volume-close" onclick="window.gndAudioPlayer.hideVolumePanel()" title="Fermer">×</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', playerHTML);
        this.playerElement = document.querySelector('.gnd-audio-player');
        
        // Injecter les styles CSS
        this.injectStyles();
    }
    
    async quickStart() {
        console.log('🚀 Démarrage rapide - recherche de la première musique disponible...');
        await this.findFirstAvailableMusic();
    }

    async findFirstAvailableMusic() {
        // Créer le scanner si pas encore fait
        if (!this.musicScanner) {
            await this.loadMusicScanner();
            this.musicScanner = new window.MusicFileScanner();
        }

        const directories = [`musique/${this.state.currentPage}`, 'musique'];

        for (const directory of directories) {
            const files = await this.musicScanner.scanDirectory(directory);
            if (files.length > 0) {
                files.sort();
                const heroIntro = files.find(f => f.endsWith(this.state.quickStartFile));
                const firstFile = heroIntro || files[0];
                this.state.playlist = [firstFile];
                this.state.isPlaying = true;
                this.state.currentTime = 0;
                this.loadTrack(0);
                this.updatePlayButton();
                console.log(`🎵 Démarrage rapide avec ${firstFile.split('/').pop()}`);

                // Lancer le scan complet en arrière-plan après le démarrage
                setTimeout(() => this.scanMusicFiles(), 500);
                return;
            }
        }

        console.log('⚠️ Aucune musique trouvée pour démarrage rapide, scan complet...');
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
                if (!this.state.isPlaying) {
                    this.state.isPlaying = true;
                }
                this.state.currentTime = 0;
                this.loadTrack(0);
                this.updatePlayButton();
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
    
    loadTrack(index, resume = false) {
        if (!this.state.playlist[index]) return;

        const actualIndex = this.state.shuffleOrder[index] || index;
        const trackPath = this.state.playlist[actualIndex];

        if (this.sound) {
            this.sound.unload();
        }

        this.sound = new Howl({
            src: [trackPath],
            html5: true,
            volume: this.state.volume,
            onend: () => this.playNext(),
            onplayerror: () => this.setupAutoplayFallback()
        });

        if (resume && this.state.currentTime > 0) {
            this.sound.once('load', () => {
                this.sound.seek(this.state.currentTime);
            });
        }

        this.state.currentTrack = index;
        if (this.state.isPlaying) {
            this.sound.play();
            this.startTimeUpdater();
        }

        const fileName = trackPath.split('/').pop().replace('.mp3', '');
        this.updateTrackInfo(fileName);
    }
    
    handleMainButtonClick(event) {
        // Empêcher le menu contextuel sur le clic gauche
        event.preventDefault();
        
        // Simple clic gauche = play/pause
        this.togglePlay();
    }

    async togglePlay() {
        if (!this.sound) return;

        if (this.state.isPlaying) {
            this.sound.pause();
            this.stopTimeUpdater();
            this.state.isPlaying = false;
        } else {
            try {
                this.sound.play();
                this.startTimeUpdater();
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
        this.state.isPlaying = true;
        this.state.currentTime = 0;
        this.loadTrack(nextTrack);
        this.updatePlayButton();
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
        Howler.volume(volume);
        if (this.sound) {
            this.sound.volume(volume);
        }
        localStorage.setItem('gnd-audio-volume', volume.toString());
        
        // Mettre à jour l'affichage du pourcentage
        const volumeValue = this.playerElement.querySelector('.volume-value');
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(volume * 100)}%`;
        }
    }
    
    toggleVolumePanel() {
        const volumePanel = this.playerElement.querySelector('.volume-panel');
        const volumeToggle = this.playerElement.querySelector('.volume-toggle i');
        
        if (volumePanel.classList.contains('hidden')) {
            // Afficher le panel
            volumePanel.classList.remove('hidden');
            volumeToggle.className = 'fas fa-chevron-down';
            
            // Auto-masquage après 5 secondes
            this.resetVolumeTimeout();
        } else {
            this.hideVolumePanel();
        }
    }
    
    hideVolumePanel() {
        const volumePanel = this.playerElement.querySelector('.volume-panel');
        const volumeToggle = this.playerElement.querySelector('.volume-toggle i');
        
        volumePanel.classList.add('hidden');
        volumeToggle.className = 'fas fa-chevron-up';
        
        if (this.volumeTimeout) {
            clearTimeout(this.volumeTimeout);
            this.volumeTimeout = null;
        }
    }
    
    resetVolumeTimeout() {
        if (this.volumeTimeout) {
            clearTimeout(this.volumeTimeout);
        }
        
        this.volumeTimeout = setTimeout(() => {
            this.hideVolumePanel();
        }, 5000); // 5 secondes
    }
    
    toggleCollapse() {
        this.state.isCollapsed = !this.state.isCollapsed;
        this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
        
        const volumeToggle = this.playerElement.querySelector('.volume-toggle');
        const volumePanel = this.playerElement.querySelector('.volume-panel');
        
        if (volumeToggle) {
            volumeToggle.classList.toggle('hidden', this.state.isCollapsed);
        }
        
        // Si on réduit, cacher aussi le panel de volume
        if (this.state.isCollapsed && volumePanel) {
            this.hideVolumePanel();
        }
        
        localStorage.setItem('gnd-audio-collapsed', this.state.isCollapsed.toString());
        
        console.log(`🔄 Lecteur ${this.state.isCollapsed ? 'réduit' : 'étendu'}`);
    }
    
    updatePlayButton() {
        const playBtn = this.playerElement.querySelector('.main-play-button i');
        if (playBtn) {
            playBtn.className = `fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}`;
        }
    }
    
    updateTrackInfo(trackName = null) {
        // Interface simplifiée - pas d'affichage d'informations de piste
        // Les informations sont juste loggées dans la console pour le développement
        if (trackName) {
            console.log(`🎵 Piste actuelle: ${trackName}`);
        } else if (this.state.playlist.length > 0) {
            const currentFile = this.state.playlist[this.state.shuffleOrder[this.state.currentTrack] || this.state.currentTrack];
            const fileName = currentFile ? currentFile.split('/').pop().replace('.mp3', '') : 'Inconnu';
            
            const sourceIcon = this.state.currentPlaylistType === 'current' ? '📍' : '🌍';
            const totalTracks = this.state.currentPagePlaylist.length + this.state.defaultPlaylist.length;
            
            console.log(`🎵 ${sourceIcon} ${fileName} (${this.state.currentTrack + 1}/${this.state.playlist.length}) - Total: ${totalTracks}`);
        }
    }
    
    updatePlaybackState() {
        if (this.sound && this.sound.playing()) {
            this.state.currentTime = this.sound.seek();
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
        if (!savedState) return false;
        
        try {
            const state = JSON.parse(savedState);
            
            // Vérifier que l'état n'est pas trop ancien (plus de 30 minutes)
            if (Date.now() - state.timestamp > 30 * 60 * 1000) {
                return false;
            }
            
            // Restaurer l'état avec les nouvelles propriétés
            if (state.playlist && state.playlist.length > 0) {
                this.state.playlist = state.playlist;
                this.state.shuffleOrder = state.shuffleOrder || [];
                this.state.currentTrack = state.currentTrack || 0;
                this.state.currentTime = state.currentTime || 0;
                this.state.isPlaying = state.isPlaying || false;
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

                this.loadTrack(this.state.currentTrack, true);
                this.updatePlayButton();

                console.log('🔄 État restauré - Continuité de lecture maintenue');
                return true; // État restauré avec succès
            }
        } catch (error) {
            console.log('Erreur lors de la restauration:', error);
        }
        
        return false; // Aucun état restauré
    }
    
    setupAutoplayFallback() {
        const oneTimePlay = () => {
            if (!this.state.isPlaying && this.sound) {
                if (this.audioElement) {
                    this.audioElement.muted = false;
                }
                this.sound.play();
                this.startTimeUpdater();
                this.state.isPlaying = true;
                this.updatePlayButton();
                console.log('🎵 Lecture activée après interaction utilisateur');
                document.removeEventListener('click', oneTimePlay);
                document.removeEventListener('keydown', oneTimePlay);
                document.removeEventListener('scroll', oneTimePlay);
                document.removeEventListener('touchstart', oneTimePlay);
                document.removeEventListener('mousemove', oneTimePlay);
            }
        };
        
        // Écouter plusieurs types d'événements pour démarrer la lecture
        document.addEventListener('click', oneTimePlay, { once: true });
        document.addEventListener('keydown', oneTimePlay, { once: true });
        document.addEventListener('scroll', oneTimePlay, { once: true });
        document.addEventListener('touchstart', oneTimePlay, { once: true });
        document.addEventListener('mousemove', oneTimePlay, { once: true });
        
        // Essayer de démarrer automatiquement après 2 secondes
        setTimeout(() => {
            if (!this.state.isPlaying && this.sound) {
                this.sound.play().then(() => {
                    this.state.isPlaying = true;
                    this.updatePlayButton();
                    this.startTimeUpdater();
                    console.log('🎵 Démarrage automatique réussi');
                    // Nettoyer les événements si le démarrage automatique marche
                    document.removeEventListener('click', oneTimePlay);
                    document.removeEventListener('keydown', oneTimePlay);
                    document.removeEventListener('scroll', oneTimePlay);
                    document.removeEventListener('touchstart', oneTimePlay);
                    document.removeEventListener('mousemove', oneTimePlay);
                }).catch(() => {
                    console.log('🎵 Autoplay bloqué, en attente d\'interaction utilisateur...');
                });
            }
        }, 2000);
    }

    startTimeUpdater() {
        if (this.timeUpdater) clearInterval(this.timeUpdater);
        this.timeUpdater = setInterval(() => this.updatePlaybackState(), 1000);
    }

    stopTimeUpdater() {
        if (this.timeUpdater) {
            clearInterval(this.timeUpdater);
            this.timeUpdater = null;
        }
    }
    
    updatePlayerInterface() {
        // Mettre à jour l'interface si elle existe déjà
        this.updatePlayButton();
        
        const volumeSlider = this.playerElement.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.state.volume * 100;
        }
        
        const volumeValue = this.playerElement.querySelector('.volume-value');
        if (volumeValue) {
            volumeValue.textContent = `${Math.round(this.state.volume * 100)}%`;
        }
        
        const volumeToggle = this.playerElement.querySelector('.volume-toggle');
        if (volumeToggle) {
            volumeToggle.classList.toggle('hidden', this.state.isCollapsed);
        }
        
        this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
    }
    
    injectStyles() {
        if (document.querySelector('#gnd-audio-styles')) return;
        
        const styles = `
            <style id="gnd-audio-styles">
            /* ========================================
               LECTEUR AUDIO SIMPLIFIÉ - STYLE MEDIEVAL
               ======================================== */
            
            .gnd-audio-player {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
                border: 3px solid #d4af37;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
                color: #ffffff;
                font-family: 'Cinzel', serif;
                z-index: 1500;
                transition: all 0.3s ease;
                padding: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 60px;
            }
            
            /* ========================================
               BOUTON PRINCIPAL PLAY/PAUSE
               ======================================== */
            
            .main-play-button {
                background: #d4af37;
                color: #000000;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.6rem;
                font-weight: 900;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                transition: all 0.2s ease;
                border: 3px solid #ffffff;
                margin-bottom: 8px;
                text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
            }
            
            .main-play-button i {
                color: #000000 !important;
                text-shadow: 0 0 3px rgba(255, 255, 255, 0.9);
                font-weight: 900 !important;
            }
            
            .main-play-button:hover {
                background: #ffffff;
                color: #8b4513;
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(212, 175, 55, 0.8);
            }
            
            .main-play-button:hover i {
                color: #8b4513 !important;
                text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
            }
            
            /* ========================================
               FLÈCHE DE VOLUME
               ======================================== */
            
            .volume-toggle {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #d4af37;
                color: #d4af37;
                width: 30px;
                height: 20px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                margin-bottom: 8px;
            }
            
            .volume-toggle:hover {
                background: #d4af37;
                color: #1a1a1a;
                transform: scale(1.1);
            }
            
            .volume-toggle.hidden {
                display: none;
            }
            
            /* ========================================
               PANEL DE VOLUME
               ======================================== */
            
            .volume-panel {
                width: 200px;
                padding: 12px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #d4af37;
                border-radius: 8px;
                position: absolute;
                bottom: 100%;
                right: 0;
                margin-bottom: 10px;
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
                transition: all 0.3s ease;
                opacity: 1;
                transform: translateY(0);
            }
            
            .volume-panel.hidden {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                display: none;
            }
            
            .volume-control {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            .volume-icon {
                color: #d4af37;
                font-size: 1rem;
                min-width: 20px;
            }
            
            .volume-value {
                color: #d4af37;
                font-size: 0.9rem;
                min-width: 35px;
                text-align: right;
                font-weight: bold;
            }
            
            .volume-close {
                position: absolute;
                top: 4px;
                right: 8px;
                background: #d4af37;
                color: #1a1a1a;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
                transition: all 0.2s ease;
            }
            
            .volume-close:hover {
                background: #ffffff;
                transform: scale(1.1);
            }
            
            /* ========================================
               MODE RÉDUIT
               ======================================== */
            
            .gnd-audio-player.collapsed {
                min-width: 60px;
                max-width: 60px;
                padding: 8px;
            }
            
            .gnd-audio-player.collapsed .volume-toggle,
            .gnd-audio-player.collapsed .volume-panel {
                display: none;
            }
            
            .gnd-audio-player.collapsed .main-play-button {
                margin-bottom: 0;
            }
            
            /* Ajout d'une petite icône d'extension dans le mode réduit */
            .gnd-audio-player.collapsed::after {
                content: '⤴';
                position: absolute;
                bottom: 2px;
                right: 2px;
                font-size: 10px;
                color: #d4af37;
                opacity: 0.8;
                pointer-events: none;
                text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
            }
            
            /* ========================================
               VOLUME SLIDER
               ======================================== */
            
            .volume-slider {
                flex: 1;
                height: 6px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 3px;
                outline: none;
                border: 1px solid #d4af37;
                cursor: pointer;
            }
            
            .volume-slider::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: #d4af37;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
                transition: all 0.2s ease;
                border: 2px solid #ffffff;
            }
            
            .volume-slider::-webkit-slider-thumb:hover {
                background: #ffffff;
                transform: scale(1.2);
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
            }
            
            /* ========================================
               RESPONSIVE
               ======================================== */
            
            @media (max-width: 768px) {
                .gnd-audio-player {
                    bottom: 10px;
                    right: 10px;
                    padding: 6px;
                }
                
                .main-play-button {
                    width: 45px;
                    height: 45px;
                    font-size: 1.2rem;
                }
                
                .extended-controls {
                    width: 150px;
                    padding: 6px;
                }
                
                .expand-button {
                    width: 25px;
                    height: 18px;
                    font-size: 0.7rem;
                }
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
