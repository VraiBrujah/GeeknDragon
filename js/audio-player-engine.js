(function (global) {
  /**
   * Sélectionne la clé de stockage appropriée en fonction des options.
   *
   * @param {unknown} instance Référence du lecteur.
   * @param {'state'|'volume'|'collapsed'} key Usage souhaité.
   * @param {string} fallback Clé par défaut.
   * @returns {string} Clef finale.
   */
  const resolveStorageKey = (instance, key, fallback) =>
    typeof instance?.getStorageKey === 'function'
      ? instance.getStorageKey(key, fallback)
      : fallback;

  /**
   * Regroupe la logique noyau du lecteur (gestion de l'état et de Howler).
   * Chaque méthode sera mélangée sur le prototype de `GeeknDragonAudioPlayer`.
   */
  const engineMixin = {
    /**
     * Détermine la page courante afin d'adapter les playlists analysées.
     *
     * @returns {string} Identifiant de page (index, boutique, produit, ...).
     */
    getCurrentPage() {
      const path = window.location.pathname;
      if (path.includes('boutique')) return 'boutique';
      if (path.includes('product.php') || path.includes('produit-')) return 'produit';
      return 'index';
    },

    /**
     * Vérifie auprès de Howler si une piste est réellement en cours de lecture.
     *
     * @returns {boolean} Indique si Howler diffuse effectivement un morceau.
     */
    isActuallyPlaying() {
      return (
        !!this.sound &&
        typeof this.sound.playing === 'function' &&
        this.sound.playing()
      );
    },

    /**
     * Synchronise l'état interne `isPlaying` et les timers avec Howler.
     *
     * @param {boolean} playing Vaut `true` si la lecture est confirmée.
     */
    setActualPlayingState(playing) {
      this.state.isPlaying = Boolean(playing);

      if (this.state.isPlaying) {
        this.startTimeUpdater();
      } else {
        this.stopTimeUpdater();
      }

      this.updatePlayButton();
      this.emit('playback-change', {
        isPlaying: this.state.isPlaying,
        shouldResume: this.state.shouldResume,
      });
    },

    /**
     * Centralise la gestion des erreurs de lecture Howler.
     *
     * @param {Error|undefined} error Erreur renvoyée par Howler.
     */
    handlePlayError(error) {
      if (error) {
        console.log('Erreur de lecture détectée:', error);
      }
      this.setActualPlayingState(false);
    },

    /**
     * Callback Howler exécuté lorsque la lecture démarre réellement.
     */
    handleHowlerPlay() {
      this.state.shouldResume = true;
      this.setActualPlayingState(this.isActuallyPlaying());
    },

    /**
     * Callback Howler exécuté lors d'une mise en pause.
     */
    handleHowlerPause() {
      this.setActualPlayingState(false);
    },

    /**
     * Callback Howler exécuté lors d'un arrêt brutal de la piste.
     */
    handleHowlerStop() {
      this.setActualPlayingState(false);
    },

    /**
     * Callback Howler exécuté quand un morceau se termine.
     */
    handleHowlerEnd() {
      this.setActualPlayingState(false);
      this.playNext();
    },

    /**
     * Callback Howler exécuté en cas d'impossibilité de lancer la lecture.
     *
     * @param {Error|undefined} error Erreur optionnelle fournie par Howler.
     */
    handleHowlerPlayError(error) {
      this.handlePlayError(error);
      this.setupAutoplayFallback();
    },

    /**
     * Initialise le lecteur en préparant Howler, l'audio HTML5 et les interfaces.
     */
    async init() {
      console.log('🎵 Initialisation du lecteur audio Geek&Dragon...');

      this.initHowler();
      this.createAudioElement();
      this.createPlayerInterface();

      const hasRestoredState = await this.handlePageChange();

      if (!hasRestoredState) {
        await this.quickStart();
      }

      if (hasRestoredState) {
        setTimeout(() => this.scanMusicFiles(), 1000);
      }

      console.log('✅ Lecteur audio Geek&Dragon initialisé');
      this.emit('ready', { player: this });
    },

    /**
     * Gère le changement de page et restaure éventuellement l'état sauvegardé.
     */
    async handlePageChange() {
      const stateKey = resolveStorageKey(this, 'state', 'gnd-audio-state');
      const savedState = localStorage.getItem(stateKey);
      const currentPage = this.getCurrentPage();

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const previousPage = state.currentPage;

          if (previousPage && previousPage !== currentPage) {
            console.log(
              `🔄 Changement de page détecté: ${previousPage} → ${currentPage}`,
            );

            this.state.currentPage = currentPage;
            const hasState = this.restorePlaybackState();
            return hasState;
          } else if (state.playlist && state.playlist.length > 0) {
            const hasState = this.restorePlaybackState();
            return hasState;
          }
        } catch (e) {
          console.log('Erreur lors de la vérification du changement de page:', e);
        }
      }

      return false;
    },

    /**
     * Prépare Howler pour éviter l'épuisement du pool audio natif.
     */
    initHowler() {
      Howler.autoUnlock = true;
      Howler.volume(this.state.volume);

      if (window.Howler && window.Howler._html5AudioPool) {
        window.Howler._html5AudioPool = [];
      }

      Howler.html5PoolSize = 3;
    },

    /**
     * Force le nettoyage du pool audio HTML5 lorsque nécessaire.
     */
    cleanupAudioPool() {
      try {
        if (window.Howler && window.Howler._html5AudioPool) {
          window.Howler._html5AudioPool.forEach(audio => {
            if (audio && typeof audio.remove === 'function') {
              audio.remove();
            }
          });
          window.Howler._html5AudioPool = [];
        }
      } catch (e) {
        console.warn('🔧 Nettoyage du pool audio:', e.message);
      }
    },

    /**
     * Crée un élément audio HTML5 utilisé pour contourner certaines restrictions navigateur.
     */
    createAudioElement() {
      this.audioElement = document.createElement('audio');
      this.audioElement.preload = 'metadata';
      this.audioElement.muted = true;
      this.audioElement.playsInline = true;
    },

    /**
     * Charge une piste via Howler en conservant le suivi d'état et la reprise.
     *
     * @param {number} index Index de la piste dans la playlist courante.
     * @param {boolean} [resume=false] Indique s'il faut reprendre à `currentTime`.
     */
    loadTrack(index, resume = false) {
      this.stopTimeUpdater();

      if (!this.state.playlist[index]) return;

      const actualIndex = this.state.shuffleOrder[index] || index;
      const trackPath = this.state.playlist[actualIndex];

      if (this.sound && this.sound._src === trackPath) {
        if (resume && this.state.currentTime > 0) {
          this.sound.seek(this.state.currentTime);
        } else {
          this.state.currentTime = 0;
          this.sound.seek(0);
        }
      } else {
        if (this.sound) {
          this.sound.unload();
          this.sound = null;
        }

        this.cleanupAudioPool();

        this.sound = new Howl({
          src: [trackPath],
          html5: true,
          volume: this.state.volume,
          pool: 1,
          preload: false,
          onplay: () => this.handleHowlerPlay(),
          onpause: () => this.handleHowlerPause(),
          onstop: () => this.handleHowlerStop(),
          onend: () => this.handleHowlerEnd(),
          onplayerror: (soundId, error) => this.handleHowlerPlayError(error),
          onload: () => {
            if (this.state.shouldResume) {
              this.setupAutoplayFallback();
            }
          },
        });

        if (resume && this.state.currentTime > 0) {
          this.sound.once('load', () => {
            const duration = this.sound.duration();
            if (this.state.currentTime >= duration) {
              this.state.currentTime = 0;
              this.sound.seek(0);
            } else {
              this.sound.seek(this.state.currentTime);
            }
          });
        } else {
          this.state.currentTime = 0;
          this.sound.once('load', () => this.sound.seek(0));
        }
      }

      this.state.currentTrack = index;
      this.savePlaybackState(true);

      if (this.state.shouldResume) {
        if (!this.sound.playing()) {
          this.sound.play();
        }
        this.setActualPlayingState(this.isActuallyPlaying());
      } else {
        this.setActualPlayingState(false);
      }

      const fileName = trackPath.split('/').pop().replace('.mp3', '');
      this.updateTrackInfo(fileName);
      this.emit('track-change', {
        fileName,
        index: this.state.currentTrack,
        playlistType: this.state.currentPlaylistType,
      });
    },

    /**
     * Gestion du clic principal Play/Pause depuis l'interface flottante.
     *
     * @param {Event} event Évènement DOM d'origine.
     */
    handleMainButtonClick(event) {
      event.preventDefault();
      this.togglePlay();
    },

    /**
     * Basculer la lecture selon l'état courant.
     */
    async togglePlay() {
      if (!this.sound) return;

      if (this.state.shouldResume && (this.state.isPlaying || this.isActuallyPlaying())) {
        this.state.shouldResume = false;
        this.sound.pause();
        this.setActualPlayingState(false);
      } else {
        try {
          this.sound.play();
          this.state.shouldResume = true;
          this.setActualPlayingState(this.isActuallyPlaying());
        } catch (error) {
          this.state.shouldResume = false;
          this.handlePlayError(error);
          return;
        }
      }

      this.savePlaybackState(!this.state.shouldResume);
    },

    /**
     * Passe au morceau suivant en respectant la priorité entre playlists.
     */
    playNext() {
      console.log(
        '🔄 playNext() appelé - Lecture confirmée:',
        this.state.isPlaying,
        '- Intention:',
        this.state.shouldResume,
      );

      this.selectNextPlaylistWithPriority();

      if (this.state.playlist.length === 0) {
        console.log('⚠️ Aucune playlist disponible');
        return;
      }

      let nextTrack = (this.state.currentTrack + 1) % this.state.playlist.length;

      if (nextTrack === 0) {
        console.log('🔀 Fin de playlist, remélange...');
        this.shufflePlaylist();
      }

      console.log(
        `🎵 Chargement piste ${nextTrack + 1}/${this.state.playlist.length}`,
      );
      this.state.shouldResume = true;
      this.state.currentTime = 0;
      this.loadTrack(nextTrack);
    },

    /**
     * Ajuste le volume global et notifie les interfaces.
     *
     * @param {number|string} value Valeur exprimée sur 0-100.
     */
    setVolume(value) {
      const volume = Number(value) / 100;
      this.state.volume = volume;
      Howler.volume(volume);
      if (this.sound) {
        this.sound.volume(volume);
      }
      const volumeKey = resolveStorageKey(this, 'volume', 'gnd-audio-volume');
      if (volumeKey) {
        localStorage.setItem(volumeKey, volume.toString());
      }
      this.emit('volume-change', { volume });
    },

    /**
     * Met en place une stratégie de relance automatique respectant les restrictions autoplay.
     *
     * @param {{ skipAutoAttempt?: boolean }} options Options supplémentaires.
     */
    setupAutoplayFallback(options = {}) {
      const { skipAutoAttempt = false } = options;
      if (this.sound?.playing?.()) {
        return;
      }
      if (this.autoplayFallbackActive) {
        return;
      }
      this.autoplayFallbackActive = true;

      const canResumePlayback = () =>
        this.state.shouldResume &&
        this.sound &&
        typeof this.sound.playing === 'function' &&
        !this.sound.playing();

      const attemptPlaybackWithHowlerEvents = ({
        successLog,
        errorLog,
        rearmOnError = false,
      }) => {
        if (!this.sound || typeof this.sound.play !== 'function') {
          this.cleanupAutoplayListeners();
          return;
        }

        const handlePlaySuccess = () => {
          this.state.shouldResume = true;
          this.setActualPlayingState(this.isActuallyPlaying());
          if (successLog) {
            console.log(successLog);
          }
          this.cleanupAutoplayListeners();
        };

        const handlePlayError = (soundId, error) => {
          if (errorLog) {
            if (error) {
              console.log(errorLog, error);
            } else {
              console.log(errorLog);
            }
          }
          this.handlePlayError(error);
          this.cleanupAutoplayListeners();
          if (rearmOnError && canResumePlayback()) {
            this.setupAutoplayFallback({ skipAutoAttempt: true });
          }
        };

        this.sound.once('play', handlePlaySuccess);
        this.sound.once('playerror', handlePlayError);

        try {
          this.sound.play();
        } catch (error) {
          if (typeof this.sound?.off === 'function') {
            this.sound.off('play', handlePlaySuccess);
            this.sound.off('playerror', handlePlayError);
          }
          if (errorLog) {
            console.log(errorLog, error);
          }
          this.cleanupAutoplayListeners();
          if (rearmOnError && canResumePlayback()) {
            this.setupAutoplayFallback({ skipAutoAttempt: true });
          }
        }
      };

      const oneTimePlay = (event) => {
        console.log('🎵 Interaction détectée:', event?.type || 'inconnue');

        if (!canResumePlayback()) {
          if (!this.state.shouldResume) {
            console.log(
              '🎵 Fallback annulé: la lecture est en pause sur demande de l\'utilisateur.',
            );
          } else if (this.isActuallyPlaying()) {
            console.log(
              '🎵 Fallback inutile: la lecture est déjà en cours.',
            );
          }
          this.cleanupAutoplayListeners();
          return;
        }

        if (typeof this.sound?.playing === 'function' && !this.sound.playing()) {
          attemptPlaybackWithHowlerEvents({
            successLog: '🎵 Lecture activée après interaction utilisateur',
            errorLog: '🎵 Erreur de lecture après interaction:',
          });
        } else {
          this.cleanupAutoplayListeners();
        }
      };

      this.oneTimePlayHandler = oneTimePlay;

      document.addEventListener('click', oneTimePlay, { once: true, passive: true });
      document.addEventListener('keydown', oneTimePlay, { once: true, passive: true });
      document.addEventListener('scroll', oneTimePlay, { once: true, passive: true });
      document.addEventListener('touchstart', oneTimePlay, { once: true, passive: true });
      document.addEventListener('mousemove', oneTimePlay, { once: true, passive: true });

      console.log('🎵 Fallback autoplay configuré - En attente d\'interaction...');

      if (!skipAutoAttempt) {
        setTimeout(() => {
          if (!this.autoplayFallbackActive) {
            return;
          }

          if (!canResumePlayback()) {
            if (!this.state.shouldResume) {
              console.log(
                '🎵 Relance automatique annulée: la lecture a été mise en pause par l\'utilisateur.',
              );
              this.cleanupAutoplayListeners();
            } else if (this.isActuallyPlaying()) {
              console.log(
                '🎵 Relance automatique inutile: la lecture est déjà en cours.',
              );
              this.cleanupAutoplayListeners();
            }
            return;
          }

          attemptPlaybackWithHowlerEvents({
            successLog: '🎵 Démarrage automatique réussi',
            errorLog: '🎵 Autoplay bloqué, en attente d\'interaction utilisateur...',
            rearmOnError: true,
          });
        }, 1000);
      }
    },

    /**
     * Nettoie les écouteurs attachés lors de la configuration du fallback autoplay.
     */
    cleanupAutoplayListeners() {
      if (this.oneTimePlayHandler) {
        document.removeEventListener('click', this.oneTimePlayHandler);
        document.removeEventListener('keydown', this.oneTimePlayHandler);
        document.removeEventListener('scroll', this.oneTimePlayHandler);
        document.removeEventListener('touchstart', this.oneTimePlayHandler);
        document.removeEventListener('mousemove', this.oneTimePlayHandler);
        this.oneTimePlayHandler = null;
      }
      this.autoplayFallbackActive = false;
    },

    /**
     * Lance l'intervalle chargé de persister la position de lecture.
     */
    startTimeUpdater() {
      if (this.timeUpdater) clearInterval(this.timeUpdater);
      this.timeUpdater = setInterval(() => this.updatePlaybackState(), 1000);
    },

    /**
     * Arrête le suivi d'avancement de la piste.
     */
    stopTimeUpdater() {
      if (this.timeUpdater) {
        clearInterval(this.timeUpdater);
        this.timeUpdater = null;
      }
    },

    /**
     * Sauvegarde régulièrement l'état de lecture.
     */
    updatePlaybackState() {
      if (this.sound && this.sound.playing()) {
        this.state.currentTime = this.sound.seek();
        this.savePlaybackState();
      }
    },

    /**
     * Persiste l'état du lecteur dans le stockage local.
     *
     * @param {boolean} updateTimestamp Force la mise à jour du timestamp de sauvegarde.
     */
    savePlaybackState(updateTimestamp = false) {
      let timestamp;

      if (updateTimestamp) {
        timestamp = Date.now();
      } else {
        const stateKey = resolveStorageKey(this, 'state', 'gnd-audio-state');
        const existing = localStorage.getItem(stateKey);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            timestamp = parsed.timestamp;
          } catch (e) {
            timestamp = undefined;
          }
        }
      }

      const state = {
        isPlaying: this.state.isPlaying,
        shouldResume: this.state.shouldResume,
        currentTrack: this.state.currentTrack,
        currentTime: this.state.currentTime,
        playlist: this.state.playlist,
        shuffleOrder: this.state.shuffleOrder,
        currentDirectory: this.currentDirectory,
        currentPagePlaylist: this.state.currentPagePlaylist,
        defaultPlaylist: this.state.defaultPlaylist,
        currentPlaylistType: this.state.currentPlaylistType,
        currentPage: this.state.currentPage,
      };

      if (timestamp) {
        state.timestamp = timestamp;
      }

      const stateKey = resolveStorageKey(this, 'state', 'gnd-audio-state');
      localStorage.setItem(stateKey, JSON.stringify(state));
    },

    /**
     * Restaure un état précédemment sauvegardé si encore pertinent.
     *
     * @returns {boolean} Indique si la restauration a réussi.
     */
    restorePlaybackState() {
      const stateKey = resolveStorageKey(this, 'state', 'gnd-audio-state');
      const savedState = localStorage.getItem(stateKey);
      if (!savedState) return false;

      try {
        const state = JSON.parse(savedState);

        if (Date.now() - state.timestamp > 30 * 60 * 1000) {
          return false;
        }

        if (state.playlist && state.playlist.length > 0) {
          this.state.playlist = state.playlist;
          this.state.shuffleOrder = state.shuffleOrder || [];
          this.state.currentTrack = state.currentTrack || 0;
          this.state.currentTime = state.currentTime || 0;
          const restoredShouldResume =
            typeof state.shouldResume === 'boolean'
              ? state.shouldResume
              : Boolean(state.isPlaying);

          this.state.shouldResume = restoredShouldResume;
          this.state.isPlaying = false;
          this.currentDirectory = state.currentDirectory || this.currentDirectory;

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
          return true;
        }
      } catch (error) {
        console.log('Erreur lors de la restauration:', error);
      }

      return false;
    },
  };

  global.GeeknDragonAudioEngineMixin = engineMixin;
})(window);
