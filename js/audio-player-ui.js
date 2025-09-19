(function (global) {
  const resolveStorageKey = (instance, key, fallback) =>
    typeof instance?.getStorageKey === 'function'
      ? instance.getStorageKey(key, fallback)
      : fallback;

  /**
   * Responsabilité interface utilisateur (widget flottant + intégration header).
   */
  const uiMixin = {
    /**
     * Crée ou réutilise le widget flottant et initialise les interactions UI.
     */
    createPlayerInterface() {
      if (document.querySelector('.gnd-audio-player')) {
        this.playerElement = document.querySelector('.gnd-audio-player');
        this.updatePlayerInterface();
        this.initializeHeaderUI();
        this.bindUiToEvents();
        return;
      }

      const collapsedClass = this.state.isCollapsed ? 'collapsed' : '';
      const playerHTML = `
        <div class="gnd-audio-player ${collapsedClass}" id="gndAudioPlayer" aria-live="polite" aria-label="Lecteur audio Geek&Dragon">
          <button class="main-play-button" type="button" aria-pressed="${this.state.isPlaying ? 'true' : 'false'}" title="Lecture/Pause">
            <i class="fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </button>
          <button class="volume-toggle ${this.state.isCollapsed ? 'hidden' : ''}" type="button" title="Afficher le volume">
            <i class="fas fa-chevron-up"></i>
          </button>
          <div class="volume-panel hidden" role="region" aria-label="Réglage du volume">
            <div class="volume-control">
              <i class="fas fa-volume-up volume-icon" aria-hidden="true"></i>
              <input type="range" min="0" max="100" value="${Math.round(this.state.volume * 100)}" class="volume-slider" aria-label="Volume">
              <span class="volume-value">${Math.round(this.state.volume * 100)}%</span>
            </div>
            <button class="volume-close" type="button" title="Fermer" aria-label="Fermer">×</button>
          </div>
        </div>`;

      this.injectStyles();
      document.body.insertAdjacentHTML('beforeend', playerHTML);
      this.playerElement = document.querySelector('.gnd-audio-player');

      const playButton = this.playerElement.querySelector('.main-play-button');
      const volumeToggle = this.playerElement.querySelector('.volume-toggle');
      const volumeSlider = this.playerElement.querySelector('.volume-slider');
      const volumeClose = this.playerElement.querySelector('.volume-close');

      if (playButton) {
        playButton.addEventListener('click', (event) => this.handleMainButtonClick(event));
        playButton.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          this.toggleCollapse();
        });
      }
      if (volumeToggle) {
        volumeToggle.addEventListener('click', () => this.toggleVolumePanel());
      }
      if (volumeSlider) {
        volumeSlider.addEventListener('input', (event) => this.setVolume(event.target.value));
      }
      if (volumeClose) {
        volumeClose.addEventListener('click', () => this.hideVolumePanel());
      }

      this.bindUiToEvents();
      this.initializeHeaderUI();
    },

    /**
     * Abonne les interfaces aux événements du bus pour rester synchronisées.
     */
    bindUiToEvents() {
      if (this._uiEventsBound) {
        return;
      }
      this._uiEventsBound = true;

      this.on('playback-change', (event) => {
        this.updateHeaderPlayback(event.detail);
      });

      this.on('volume-change', (event) => {
        this.syncVolumeControls(event.detail.volume);
      });

      this.on('track-change', (event) => {
        this.updateHeaderTrack(event.detail);
      });

      this.on('playlist-update', () => {
        this.ensureHeaderVisibility();
      });
    },

    /**
     * Crée l'interface compacte dans le header si souhaité.
     */
    initializeHeaderUI() {
      if (this.options?.ui?.attachHeader === false) {
        return;
      }
      if (this.headerElement) {
        return;
      }

      // On privilégie le conteneur de navigation du header pour fixer les contrôles audio.
      const nav =
        document.querySelector('header .nav-container') ||
        document.querySelector('.nav-container') ||
        document.querySelector('header');
      if (!nav) {
        return;
      }

      this.injectHeaderStyles();

      const wrapper = document.createElement('div');
      wrapper.id = 'gndHeaderAudio';
      wrapper.className = 'gnd-header-audio';
      wrapper.setAttribute('aria-label', 'Contrôles musique');

      wrapper.innerHTML = [
        '<div class="gnd-header-vol">',
        '  <input class="gnd-header-volume" type="range" min="0" max="100" value="',
        Math.round(this.state.volume * 100),
        '" aria-label="Volume">',
        '</div>',
        '<div class="gnd-header-controls">',
        '  <button class="gnd-header-play" type="button" title="Lecture/Pause" aria-label="Lecture/Pause" aria-pressed="',
        this.state.isPlaying ? 'true' : 'false',
        '">',
        this.state.isPlaying ? '⏸' : '▶',
        '</button>',
        '  <button class="gnd-header-next" type="button" title="Morceau suivant" aria-label="Morceau suivant">⏭</button>',
        '</div>',
      ].join('');

      const toggle = nav.querySelector('.nav-toggle');
      if (toggle && toggle.parentElement === nav) {
        toggle.insertAdjacentElement('beforebegin', wrapper);
      } else {
        nav.appendChild(wrapper);
      }

      const playBtn = wrapper.querySelector('.gnd-header-play');
      const nextBtn = wrapper.querySelector('.gnd-header-next');
      const vol = wrapper.querySelector('.gnd-header-volume');

      if (playBtn) {
        playBtn.addEventListener('click', async (event) => {
          event.preventDefault();
          if (!this.sound) {
            await this.quickStart();
          } else {
            await this.togglePlay();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', async (event) => {
          event.preventDefault();
          if (!this.sound) {
            await this.quickStart();
          } else {
            this.playNext();
          }
        });
      }

      if (vol) {
        vol.addEventListener('input', (event) => this.setVolume(event.target.value));
      }

      this.headerElement = wrapper;
      this.ensureHeaderVisibility();
      this.updateHeaderPlayback({
        isPlaying: this.state.isPlaying,
        shouldResume: this.state.shouldResume,
      });
      this.syncVolumeControls(this.state.volume);
    },

    /**
     * Met à jour les éléments de l'interface flottante.
     */
    updatePlayerInterface() {
      if (!this.playerElement) {
        return;
      }

      this.updatePlayButton();
      this.syncVolumeControls(this.state.volume);

      const volumeToggle = this.playerElement.querySelector('.volume-toggle');
      if (volumeToggle) {
        volumeToggle.classList.toggle('hidden', this.state.isCollapsed);
      }

      this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
    },

    /**
     * Synchronise les sliders de volume (widget + header) avec la valeur courante.
     *
     * @param {number} volume Valeur normalisée entre 0 et 1.
     */
    syncVolumeControls(volume) {
      const percent = Math.round(volume * 100);

      if (this.playerElement) {
        const slider = this.playerElement.querySelector('.volume-slider');
        if (slider) {
          slider.value = percent;
        }
        const valueSpan = this.playerElement.querySelector('.volume-value');
        if (valueSpan) {
          valueSpan.textContent = `${percent}%`;
        }
      }

      if (this.headerElement) {
        const headerSlider = this.headerElement.querySelector('.gnd-header-volume');
        if (headerSlider) {
          headerSlider.value = percent;
        }
      }
    },

    /**
     * Affiche/masque le panneau de volume.
     */
    toggleVolumePanel() {
      if (!this.playerElement) {
        return;
      }
      const volumePanel = this.playerElement.querySelector('.volume-panel');
      const volumeToggle = this.playerElement.querySelector('.volume-toggle i');

      if (!volumePanel || !volumeToggle) {
        return;
      }

      if (volumePanel.classList.contains('hidden')) {
        volumePanel.classList.remove('hidden');
        volumeToggle.className = 'fas fa-chevron-down';
        this.resetVolumeTimeout();
      } else {
        this.hideVolumePanel();
      }
    },

    /**
     * Cache le panneau de volume.
     */
    hideVolumePanel() {
      if (!this.playerElement) {
        return;
      }
      const volumePanel = this.playerElement.querySelector('.volume-panel');
      const volumeToggle = this.playerElement.querySelector('.volume-toggle i');

      if (volumePanel) {
        volumePanel.classList.add('hidden');
      }
      if (volumeToggle) {
        volumeToggle.className = 'fas fa-chevron-up';
      }

      if (this.volumeTimeout) {
        clearTimeout(this.volumeTimeout);
        this.volumeTimeout = null;
      }
    },

    /**
     * Redémarre le timer de fermeture automatique du panneau volume.
     */
    resetVolumeTimeout() {
      if (this.volumeTimeout) {
        clearTimeout(this.volumeTimeout);
      }

      this.volumeTimeout = setTimeout(() => {
        this.hideVolumePanel();
      }, 5000);
    },

    /**
     * Réduit/étend le widget flottant.
     */
    toggleCollapse() {
      this.state.isCollapsed = !this.state.isCollapsed;
      if (this.playerElement) {
        this.playerElement.classList.toggle('collapsed', this.state.isCollapsed);
        const volumeToggle = this.playerElement.querySelector('.volume-toggle');
        const volumePanel = this.playerElement.querySelector('.volume-panel');
        if (volumeToggle) {
          volumeToggle.classList.toggle('hidden', this.state.isCollapsed);
        }
        if (this.state.isCollapsed && volumePanel) {
          this.hideVolumePanel();
        }
      }

      const collapsedKey = resolveStorageKey(this, 'collapsed', 'gnd-audio-collapsed');
      if (collapsedKey) {
        localStorage.setItem(collapsedKey, this.state.isCollapsed.toString());
      }
      console.log(`🔄 Lecteur ${this.state.isCollapsed ? 'réduit' : 'étendu'}`);
    },

    /**
     * Met à jour l'icône du bouton play principal.
     */
    updatePlayButton() {
      if (!this.playerElement) {
        return;
      }
      const playBtn = this.playerElement.querySelector('.main-play-button i');
      if (playBtn) {
        playBtn.className = `fas ${this.state.isPlaying ? 'fa-pause' : 'fa-play'}`;
      }
      const playWrapper = this.playerElement.querySelector('.main-play-button');
      if (playWrapper) {
        playWrapper.setAttribute('aria-pressed', this.state.isPlaying ? 'true' : 'false');
      }
    },

    /**
     * Met à jour le bouton lecture du header en tenant compte des reprises prévues.
     *
     * @param {{ isPlaying?: boolean, shouldResume?: boolean }} [detail] Informations de lecture à refléter.
     */
    updateHeaderPlayback(detail) {
      if (!this.headerElement) {
        return;
      }
      const button = this.headerElement.querySelector('.gnd-header-play');
      if (button) {
        const { isPlaying = false, shouldResume = false } = detail || {};
        const isActive = Boolean(isPlaying || shouldResume);
        button.textContent = isActive ? '⏸' : '▶';
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
    },

    updateHeaderTrack(detail) {
      if (!this.headerElement) {
        return;
      }
      this.headerElement.setAttribute(
        'data-current-track',
        detail?.fileName || '',
      );
    },

    ensureHeaderVisibility() {
      if (!this.headerElement) {
        return;
      }
      if (this.options?.ui?.hideFloatingWhenHeader !== false && this.playerElement) {
        this.playerElement.style.display = this.headerElement ? 'none' : '';
      }
    },

    updateTrackInfo(trackName = null) {
      if (trackName) {
        console.log(`🎵 Piste actuelle: ${trackName}`);
      } else if (this.state.playlist.length > 0) {
        const currentFile =
          this.state.playlist[
            this.state.shuffleOrder[this.state.currentTrack] || this.state.currentTrack
          ];
        const fileName = currentFile
          ? currentFile.split('/').pop().replace('.mp3', '')
          : 'Inconnu';
        const sourceIcon =
          this.state.currentPlaylistType === 'current' ? '📍' : '🌍';
        const totalTracks =
          this.state.currentPagePlaylist.length + this.state.defaultPlaylist.length;

        console.log(
          `🎵 ${sourceIcon} ${fileName} (${this.state.currentTrack + 1}/${this.state.playlist.length}) - Total: ${totalTracks}`,
        );
      }
    },

    showMusicSuggestions() {
      if (!this.musicScanner) {
        return;
      }
      const suggestions = this.musicScanner.getSuggestedFilenames(
        this.state.currentPage,
      );
      const message =
        'Aucune musique détectée. Suggestions:' +
        suggestions.map((name) => `\n• ${name}`).join('');
      this.showNotification(message, 'warning');
    },

    showNotification(message, type = 'info') {
      this.injectNotificationStyles();

      const notification = document.createElement('div');
      notification.className = `gnd-audio-notification ${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <i class="fas ${type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
          <span>${message}</span>
          <button type="button" aria-label="Fermer">×</button>
        </div>`;

      const closeBtn = notification.querySelector('button');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => notification.remove());
      }

      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 8000);
    },

    injectStyles() {
      if (document.querySelector('#gnd-audio-styles')) return;
      const styles = `
        <style id="gnd-audio-styles">
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
          .gnd-audio-player.collapsed .volume-panel { display: none; }
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
          .volume-toggle.hidden { display: none; }
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
          }
          .volume-panel.hidden { display: none; }
          .volume-slider {
            flex: 1;
            height: 6px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 3px;
            outline: none;
            border: 1px solid #d4af37;
            cursor: pointer;
          }
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
          }
        </style>`;
      document.head.insertAdjacentHTML('beforeend', styles);
    },

    injectHeaderStyles() {
      if (document.querySelector('#gnd-header-audio-styles')) {
        return;
      }
      const styles = `
        <style id="gnd-header-audio-styles">
          .gnd-header-audio {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.35rem;
            margin-left: auto;
            padding: 0.25rem 0.4rem;
            border: 1px solid var(--secondary-color, #d4af37);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(6px);
          }
          .gnd-header-audio .gnd-header-controls {
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .gnd-header-audio .gnd-header-play,
          .gnd-header-audio .gnd-header-next {
            appearance: none;
            border: 2px solid var(--secondary-color, #d4af37);
            background: var(--secondary-color, #d4af37);
            color: var(--dark-bg, #1a1a1a);
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .gnd-header-audio .gnd-header-next {
            background: transparent;
            color: var(--secondary-color, #d4af37);
          }
          .gnd-header-audio .gnd-header-vol {
            display: flex;
            align-items: center;
            gap: 0.2rem;
          }
          .gnd-header-audio .gnd-header-volume {
            width: 100px;
            accent-color: var(--secondary-color, #d4af37);
          }
          @media (max-width: 767px) {
            .gnd-header-audio {
              flex-direction: row;
              align-items: center;
              flex-wrap: nowrap;
              gap: 0.25rem;
              padding: 0.15rem 0.3rem;
            }
            .gnd-header-audio .gnd-header-vol {
              flex: 1 1 auto;
              min-width: 0;
            }
            .gnd-header-audio .gnd-header-controls {
              flex: 0 0 auto;
            }
            .gnd-header-audio .gnd-header-volume {
              width: 100%;
              max-width: 88px;
            }
          }
        </style>`;
      document.head.insertAdjacentHTML('beforeend', styles);
    },

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
          .gnd-audio-notification .notification-content {
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
          .gnd-audio-notification .notification-content button {
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
        </style>`;
      document.head.insertAdjacentHTML('beforeend', notificationStyles);
    },

  };

  global.GeeknDragonAudioUIMixin = uiMixin;
})(window);
