(function (global) {
  /**
   * Module dédié aux opérations de scan et de constitution de playlists.
   */
  const scannerMixin = {
    /**
     * Charge dynamiquement le scanner de fichiers si nécessaire.
     */
    async loadMusicScanner() {
      if (!document.querySelector('#music-scanner-script')) {
        const script = document.createElement('script');
        script.id = 'music-scanner-script';
        script.src = 'js/music-scanner.js';
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      if (!this.musicScanner) {
        const scannerOptions = {
          enableRangeFallback: this.options?.scanner?.enableRangeFallback !== false,
        };

        if (this.options?.scanner?.fileProbe) {
          scannerOptions.fileProbe = this.options.scanner.fileProbe;
        }

        this.musicScanner = new window.MusicFileScanner(scannerOptions);
      }
    },

    /**
     * Mélange la playlist courante pour obtenir une lecture aléatoire.
     */
    shufflePlaylist() {
      const indices = Array.from({ length: this.state.playlist.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      this.state.shuffleOrder = indices;
    },

    /**
     * Bascule vers une playlist en fonction du type souhaité.
     *
     * @param {'current'|'default'} type Type de playlist désirée.
     */
    switchToPlaylist(type) {
      if (type === this.state.currentPlaylistType) {
        return;
      }

      if (type === 'current' && this.state.currentPagePlaylist.length > 0) {
        this.state.currentPlaylistType = 'current';
        this.state.playlist = [...this.state.currentPagePlaylist];
        this.currentDirectory = `musique/${this.state.currentPage}`;
      } else if (type === 'default' && this.state.defaultPlaylist.length > 0) {
        this.state.currentPlaylistType = 'default';
        this.state.playlist = [...this.state.defaultPlaylist];
        this.currentDirectory = 'musique';
      } else {
        return;
      }

      this.shufflePlaylist();
      this.state.currentTrack = 0;

      console.log(
        `🔄 Changement vers playlist ${type}: ${this.state.playlist.length} pistes`,
      );
    },

    /**
     * Choisit la prochaine playlist en respectant le ratio de priorité.
     */
    selectNextPlaylistWithPriority() {
      if (
        this.state.currentPagePlaylist.length === 0 &&
        this.state.defaultPlaylist.length > 0
      ) {
        this.switchToPlaylist('default');
        return;
      }

      if (
        this.state.defaultPlaylist.length === 0 &&
        this.state.currentPagePlaylist.length > 0
      ) {
        this.switchToPlaylist('current');
        return;
      }

      if (
        this.state.currentPagePlaylist.length > 0 &&
        this.state.defaultPlaylist.length > 0
      ) {
        const random = Math.random();

        if (random <= this.state.priorityRatio.current) {
          this.switchToPlaylist('current');
          console.log('🎵 Priorité: Musique de la page courante');
        } else {
          this.switchToPlaylist('default');
          console.log('🎵 Priorité: Musique générale');
        }
      }
    },

    /**
     * Gère le démarrage rapide du lecteur.
     */
    async quickStart() {
      await this.loadMusicScanner();

      const welcomeOptions = this.options?.welcome;
      if (welcomeOptions?.track) {
        const storageKey = welcomeOptions.storageKey || 'gnd-audio-welcome-played';
        if (!localStorage.getItem(storageKey)) {
          let ok = false;
          try {
            const probe = this.musicScanner.options.fileProbe;
            ok = await probe(welcomeOptions.track);
          } catch (error) {
            ok = false;
          }

          if (ok) {
            this.state.playlist = [welcomeOptions.track];
            this.state.currentPlaylistType = 'default';
            this.state.shouldResume = true;
            this.state.currentTime = 0;
            this.shufflePlaylist();
            this.loadTrack(0);
            this.setActualPlayingState(this.isActuallyPlaying());
            this.emit('playlist-update', {
              playlist: this.state.playlist,
              type: this.state.currentPlaylistType,
              currentPagePlaylist: [],
              defaultPlaylist: [welcomeOptions.track],
            });
            localStorage.setItem(storageKey, '1');
            setTimeout(() => this.scanMusicFiles(), 500);
            return;
          }

          localStorage.setItem(storageKey, '1');
        }
      }

      await this.findFirstAvailableMusic();
    },

    /**
     * Recherche la première musique disponible pour lancer la lecture instantanément.
     */
    async findFirstAvailableMusic() {
      const directories = [
        `musique/${this.state.currentPage}`,
        'musique',
      ];
      const quickStartFile = this.options?.quickStartFile || this.state.quickStartFile;

      for (const directory of directories) {
        const files = await this.musicScanner.scanDirectory(directory);
        if (files.length > 0) {
          files.sort();
          const heroIntro = files.find((f) => f.endsWith(quickStartFile));
          const firstFile = heroIntro || files[0];

          this.state.playlist = [firstFile];
          this.state.shouldResume = true;
          this.state.currentTime = 0;
          this.state.currentTrack = 0;
          this.state.shuffleOrder = [0];

          if (directory === directories[0]) {
            this.state.currentPlaylistType = 'current';
            this.state.currentPagePlaylist = [firstFile];
          } else {
            this.state.currentPlaylistType = 'default';
            this.state.defaultPlaylist = [firstFile];
          }

          this.currentDirectory = directory;
          this.loadTrack(0);
          this.setActualPlayingState(this.isActuallyPlaying());

          this.emit('playlist-update', {
            playlist: this.state.playlist,
            type: this.state.currentPlaylistType,
            currentPagePlaylist: this.state.currentPagePlaylist,
            defaultPlaylist: this.state.defaultPlaylist,
          });

          console.log(`🎵 Démarrage rapide avec ${firstFile.split('/').pop()}`);
          setTimeout(() => this.scanMusicFiles(), 500);
          return;
        }
      }

      console.log('⚠️ Aucune musique trouvée pour démarrage rapide, scan complet...');
      await this.scanMusicFiles();
    },

    /**
     * Analyse les dossiers de musiques pour constituer les playlists intelligentes.
     */
    async scanMusicFiles() {
      console.log('🔍 Scan intelligent des fichiers musicaux...');
      const wasPlaying = this.state.shouldResume || this.isActuallyPlaying();
      const currentShuffleIndex = this.state.currentTrack;
      let currentTrackUrl = null;

      if (wasPlaying && this.state.playlist.length > 0) {
        const actualIndex =
          this.state.shuffleOrder[currentShuffleIndex] || currentShuffleIndex;
        currentTrackUrl = this.state.playlist[actualIndex];
      }

      await this.loadMusicScanner();

      const pageDirectory = `musique/${this.state.currentPage}`;
      const currentPageFiles = await this.musicScanner.scanDirectory(pageDirectory);
      const defaultFiles = await this.musicScanner.scanDirectory('musique');

      this.state.currentPagePlaylist = [...new Set(currentPageFiles)];
      this.state.defaultPlaylist = [...new Set(defaultFiles)];

      console.log(
        `📁 Page courante (${pageDirectory}): ${this.state.currentPagePlaylist.length} pistes`,
      );
      console.log(
        `📁 Dossier général: ${this.state.defaultPlaylist.length} pistes`,
      );

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

        if (currentTrackUrl) {
          const newActualIndex = this.state.playlist.indexOf(currentTrackUrl);
          if (newActualIndex !== -1) {
            const newShuffleIndex =
              this.state.shuffleOrder.indexOf(newActualIndex);
            if (
              newShuffleIndex !== -1 &&
              newShuffleIndex !== currentShuffleIndex
            ) {
              [
                this.state.shuffleOrder[newShuffleIndex],
                this.state.shuffleOrder[currentShuffleIndex],
              ] = [
                this.state.shuffleOrder[currentShuffleIndex],
                this.state.shuffleOrder[newShuffleIndex],
              ];
            }
            this.state.currentTrack = currentShuffleIndex;
          } else {
            this.state.currentTrack = 0;
            if (this.sound) {
              this.sound.stop();
            }
            this.state.currentTime = 0;
            this.loadTrack(0);
          }
        } else {
          this.state.currentTrack = 0;
        }

        if (!wasPlaying) {
          this.state.shouldResume = true;
          this.state.currentTime = 0;
          this.loadTrack(this.state.currentTrack);
          this.setActualPlayingState(this.isActuallyPlaying());
        }

        this.updateTrackInfo();
        console.log(
          `✅ Système de priorité activé - Courante: ${this.state.currentPagePlaylist.length}, Défaut: ${this.state.defaultPlaylist.length}`,
        );
      } else {
        console.log('⚠️ Aucune musique trouvée');
        this.updateTrackInfo('Aucune musique disponible');
        this.showMusicSuggestions();
        this.state.shouldResume = false;
        this.setActualPlayingState(false);
      }

      this.emit('playlist-update', {
        playlist: this.state.playlist,
        type: this.state.currentPlaylistType,
        currentPagePlaylist: this.state.currentPagePlaylist,
        defaultPlaylist: this.state.defaultPlaylist,
      });
    },

  };

  global.GeeknDragonAudioScannerMixin = scannerMixin;
})(window);
