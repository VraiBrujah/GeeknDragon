/**
 * =================================================================
 * Lecteur audio Geek&Dragon - Point d'entrée modulaire
 * =================================================================
 * Cette version assemble les briques moteur, scanner et interface via
 * des mixins dédiés. Le constructeur accepte des options officielles
 * (welcome track, ratio de priorité, personnalisation UI, etc.) afin
 * d'éviter les surcharges dynamiques.
 */

/* global Howler, GeeknDragonAudioEngineMixin, GeeknDragonAudioScannerMixin, GeeknDragonAudioUIMixin */

(function (global) {
  const DEFAULT_OPTIONS = {
    /** Volume par défaut si aucun réglage n'est stocké. */
    defaultVolume: 0.15,
    /** Fichier utilisé pour le démarrage rapide en l'absence d'options. */
    quickStartFile: 'hero-intro.mp3',
    /** Ratio courant/général pour l'alternance des playlists. */
    priorityRatio: { current: 0.7, default: 0.3 },
    /** Comportement du scanner distant. */
    scanner: {
      enableRangeFallback: true,
      fileProbe: null,
    },
    /** Options d'interface. */
    ui: {
      attachHeader: true,
      hideFloatingWhenHeader: true,
    },
    /** Liste d'écouteurs à enregistrer dès l'initialisation. */
    listeners: {},
    /** Clés de stockage local pour persister l'état du lecteur. */
    storageKeys: {
      state: 'gnd-audio-state',
      volume: 'gnd-audio-volume',
      collapsed: 'gnd-audio-collapsed',
    },
  };

  /**
   * Fusion profonde et préservant les objets afin de créer les options finales.
   *
   * @param {Record<string, unknown>} base Valeurs par défaut.
   * @param {Record<string, unknown>} override Options utilisateur.
   * @returns {Record<string, unknown>} Options fusionnées.
   */
  const mergeOptions = (base, override) => {
    const result = Array.isArray(base) ? [...base] : { ...base };

    Object.entries(override || {}).forEach(([key, value]) => {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        result[key] = mergeOptions(base?.[key] || {}, value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    });

    return result;
  };

  /**
   * Crée un hub d'événements compatible EventTarget pour le bus interne.
   *
   * @returns {EventTarget} Instance capable de dispatcher des CustomEvent.
   */
  const createEventHub = () => {
    if (typeof EventTarget === 'function') {
      return new EventTarget();
    }

    if (typeof document !== 'undefined' && document.createElement) {
      return document.createElement('span');
    }

    // Fallback minimaliste pour d'éventuels environnements de test.
    return {
      listeners: {},
      addEventListener(type, callback) {
        if (!this.listeners[type]) {
          this.listeners[type] = new Set();
        }
        this.listeners[type].add(callback);
      },
      removeEventListener(type, callback) {
        this.listeners[type]?.delete(callback);
      },
      dispatchEvent(event) {
        const callbacks = this.listeners[event.type];
        if (!callbacks) return true;
        callbacks.forEach((callback) => callback.call(null, event));
        return true;
      },
    };
  };

  /**
   * Normalise des ratios sous forme d'objet { current, default }.
   *
   * @param {{ current?: number, default?: number }|undefined} ratio Valeurs utilisateur.
   * @returns {{ current: number, default: number }} Ratio normalisé (somme = 1).
   */
  const normalizeRatio = (ratio) => {
    const defaults = DEFAULT_OPTIONS.priorityRatio;
    let current = Number.isFinite(ratio?.current)
      ? Number(ratio.current)
      : defaults.current;
    let fallback = Number.isFinite(ratio?.default)
      ? Number(ratio.default)
      : defaults.default;

    current = Math.max(0, current);
    fallback = Math.max(0, fallback);

    if (current === 0 && fallback === 0) {
      current = defaults.current;
      fallback = defaults.default;
    }

    const total = current + fallback;
    if (total > 0) {
      current /= total;
      fallback /= total;
    } else {
      current = defaults.current;
      fallback = defaults.default;
    }

    return { current, default: fallback };
  };

  class GeeknDragonAudioPlayer {
    /**
     * Instancie le lecteur audio et configure les options officielles.
     *
     * @param {Record<string, unknown>} [options] Paramètres d'extension.
     */
    constructor(options = {}) {
      this.options = mergeOptions(DEFAULT_OPTIONS, options);
      this.storageKeys = {
        ...DEFAULT_OPTIONS.storageKeys,
        ...(this.options.storageKeys || {}),
      };
      this.events = createEventHub();

      const volumeKey = this.getStorageKey('volume', DEFAULT_OPTIONS.storageKeys.volume);
      const storedVolumeRaw = volumeKey ? localStorage.getItem(volumeKey) : null;
      const storedVolume = storedVolumeRaw !== null ? parseFloat(storedVolumeRaw) : NaN;
      const collapsedKey = this.getStorageKey('collapsed', DEFAULT_OPTIONS.storageKeys.collapsed);
      const collapsedPref = collapsedKey ? localStorage.getItem(collapsedKey) : null;
      const currentPage = typeof this.getCurrentPage === 'function' ? this.getCurrentPage() : 'index';

      this.state = {
        isPlaying: false,
        shouldResume: false,
        currentTrack: 0,
        currentTime: 0,
        volume: Number.isFinite(storedVolume)
          ? storedVolume
          : Number(this.options.defaultVolume) || DEFAULT_OPTIONS.defaultVolume,
        playlist: [],
        isCollapsed: collapsedPref !== null ? collapsedPref === 'true' : true,
        currentPage,
        shuffleOrder: [],
        isLoaded: false,
        quickStartFile: this.options.quickStartFile || DEFAULT_OPTIONS.quickStartFile,
        currentPagePlaylist: [],
        defaultPlaylist: [],
        currentPlaylistType: 'current',
        priorityRatio: normalizeRatio(this.options.priorityRatio),
      };

      this.sound = null;
      this.playerElement = null;
      this.headerElement = null;
      this.audioElement = null;
      this.musicScanner = null;
      this.timeUpdater = null;
      this.volumeTimeout = null;
      this.autoplayFallbackActive = false;
      this.oneTimePlayHandler = null;
      this.currentDirectory = '';
      this._uiEventsBound = false;

      this.applyInitialListeners();

      // L'initialisation principale est asynchrone : exposer la promesse pour les intégrations.
      this.ready = this.init();
    }

    /**
     * Retourne la clé de stockage adaptée pour un usage donné.
     *
     * @param {'state'|'volume'|'collapsed'} name Identifiant fonctionnel.
     * @param {string} fallback Valeur de repli.
     * @returns {string} Clé finale utilisée dans localStorage.
     */
    getStorageKey(name, fallback) {
      if (this.storageKeys && typeof this.storageKeys[name] === 'string') {
        return this.storageKeys[name];
      }
      if (this.options?.storageKeys?.[name]) {
        return this.options.storageKeys[name];
      }
      return fallback;
    }

    /**
     * Enregistre les écouteurs passés via `options.listeners`.
     */
    applyInitialListeners() {
      const { listeners } = this.options || {};
      if (!listeners || typeof listeners !== 'object') {
        return;
      }

      Object.entries(listeners).forEach(([eventName, handler]) => {
        if (typeof handler === 'function') {
          this.on(eventName, handler);
        } else if (Array.isArray(handler)) {
          handler.filter((fn) => typeof fn === 'function').forEach((fn) => this.on(eventName, fn));
        }
      });
    }

    /**
     * Abonne un écouteur au bus d'événements interne.
     *
     * @param {string} type Nom de l'événement (ex: `track-change`).
     * @param {(event: CustomEvent) => void} listener Callback exécuté lors de l'émission.
     * @param {AddEventListenerOptions|boolean} [options] Options natives EventTarget.
     * @returns {() => void} Fonction utilitaire pour désinscrire l'écouteur.
     */
    on(type, listener, options) {
      this.events.addEventListener(type, listener, options);
      return () => this.off(type, listener, options);
    }

    /**
     * Supprime un écouteur précédemment enregistré.
     *
     * @param {string} type Nom de l'événement.
     * @param {(event: CustomEvent) => void} listener Callback d'origine.
     * @param {EventListenerOptions|boolean} [options] Options utilisées lors de l'inscription.
     */
    off(type, listener, options) {
      this.events.removeEventListener(type, listener, options);
    }

    /**
     * Diffuse un événement personnalisé sur le bus interne.
     *
     * @param {string} type Nom de l'événement.
     * @param {unknown} [detail] Données associées à l'événement.
     * @returns {CustomEvent} Événement créé et dispatché.
     */
    emit(type, detail) {
      const event = typeof CustomEvent === 'function'
        ? new CustomEvent(type, { detail })
        : { type, detail };
      if (typeof this.events.dispatchEvent === 'function') {
        this.events.dispatchEvent(event);
      } else if (typeof this.events.dispatchEvent === 'undefined' && typeof this.events.dispatch === 'function') {
        this.events.dispatch(type, event);
      }
      return event;
    }
  }

  Object.assign(
    GeeknDragonAudioPlayer.prototype,
    global.GeeknDragonAudioEngineMixin,
    global.GeeknDragonAudioScannerMixin,
    global.GeeknDragonAudioUIMixin,
  );

  global.GeeknDragonAudioPlayer = GeeknDragonAudioPlayer;

  const bootstrap = () => {
    const config = global.GeeknDragonAudioPlayerOptions || {};
    global.gndAudioPlayer = new GeeknDragonAudioPlayer(config);
    return global.gndAudioPlayer;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})(window);
