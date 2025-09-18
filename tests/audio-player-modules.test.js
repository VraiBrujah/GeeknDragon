import 'fake-indexeddb/auto';
import { jest } from '@jest/globals';

/**
 * Utilitaires de tests pour le lecteur audio.
 */
class FakeHowl {
  constructor(config) {
    this._config = config;
    this._src = config.src?.[0] || '';
    this._volume = config.volume || 0;
    this._playing = false;
    this._seek = 0;
    this._onceHandlers = {};
    FakeHowl.instances.push(this);
  }

  play() {
    this._playing = true;
    this._config.onplay?.();
    if (this._onceHandlers.play) {
      const handler = this._onceHandlers.play;
      delete this._onceHandlers.play;
      handler(1);
    }
    return 1;
  }

  pause() {
    this._playing = false;
    this._config.onpause?.();
  }

  stop() {
    this._playing = false;
    this._config.onstop?.();
  }

  unload() {
    this._playing = false;
  }

  playing() {
    return this._playing;
  }

  seek(value) {
    if (typeof value === 'number') {
      this._seek = value;
      return this._seek;
    }
    return this._seek;
  }

  volume(value) {
    if (typeof value === 'number') {
      this._volume = value;
    }
    return this._volume;
  }

  once(event, handler) {
    this._onceHandlers[event] = handler;
    if (event === 'load') {
      handler();
    }
  }

  off(event) {
    delete this._onceHandlers[event];
  }

  duration() {
    return 180;
  }
}

FakeHowl.instances = [];

class FakeScanner {
  constructor(options = {}) {
    this.options = {
      fileProbe:
        typeof options.fileProbe === 'function'
          ? options.fileProbe
          : () => Promise.resolve(false),
    };
  }

  async scanDirectory(directory) {
    const directories = FakeScanner.directories || {};
    const files = directories[directory] || [];
    return [...files];
  }

  getSuggestedFilenames(page) {
    return [`${page}-suggestion.mp3`];
  }
}

FakeScanner.directories = {};

let GeeknDragonAudioPlayer;

const prepareDom = () => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  const script = document.createElement('script');
  script.id = 'music-scanner-script';
  document.head.appendChild(script);
};

const defaultScannerProbe = jest.fn().mockResolvedValue(true);

const createPlayer = (options = {}, directories = {}) => {
  FakeScanner.directories = directories;
  const scannerOptions = {
    fileProbe: defaultScannerProbe,
    ...(options.scanner || {}),
  };
  const mergedOptions = {
    ...options,
    scanner: scannerOptions,
  };
  const player = new GeeknDragonAudioPlayer(mergedOptions);
  return player;
};

beforeAll(async () => {
  window.Howler = {
    autoUnlock: false,
    html5PoolSize: 0,
    volume: jest.fn(),
    _html5AudioPool: [],
  };
  window.Howl = FakeHowl;
  window.MusicFileScanner = FakeScanner;
  prepareDom();

  await import('../js/audio-player-engine.js');
  await import('../js/audio-player-scanner.js');
  await import('../js/audio-player-ui.js');
  await import('../js/audio-player.js');

  GeeknDragonAudioPlayer = window.GeeknDragonAudioPlayer;
  await window.gndAudioPlayer.ready;
});

beforeEach(() => {
  localStorage.clear();
  FakeScanner.directories = {};
  defaultScannerProbe.mockClear();
  prepareDom();
});

describe('GeeknDragonAudioPlayer - Moteur', () => {
  test('bus d\'événements et stockage personnalisé du volume', async () => {
    const player = createPlayer(
      {
        storageKeys: { volume: 'custom-volume' },
      },
      {
        'musique/index': ['musique/index/ambient.mp3'],
      },
    );

    await player.ready;

    const events = [];
    const unsubscribe = player.on('volume-change', (event) => {
      events.push(event.detail.volume);
    });

    player.setVolume(40);
    expect(localStorage.getItem('custom-volume')).toBe('0.4');

    player.setVolume(70);
    expect(events).toEqual([0.4, 0.7]);

    unsubscribe();
    player.setVolume(80);
    expect(events).toEqual([0.4, 0.7]);
  });

  test('listener ready transmis via les options', async () => {
    const readySpy = jest.fn();
    const player = createPlayer(
      {
        listeners: {
          ready: readySpy,
        },
      },
      {
        'musique/index': ['musique/index/theme.mp3'],
      },
    );

    await player.ready;
    expect(readySpy).toHaveBeenCalledTimes(1);
    expect(readySpy.mock.calls[0][0].detail.player).toBe(player);
  });
});

describe('GeeknDragonAudioPlayer - Scanner', () => {
  test('piste de bienvenue jouée une seule fois puis playlists scannées', async () => {
    const welcomeProbe = jest
      .fn()
      .mockImplementation((path) => Promise.resolve(path === 'musique/hero-intro.mp3'));

    const player1 = createPlayer(
      {
        welcome: { track: 'musique/hero-intro.mp3' },
        scanner: { fileProbe: welcomeProbe },
      },
      {
        'musique/index': ['musique/index/ambient.mp3'],
        musique: ['musique/common.mp3'],
      },
    );

    await player1.ready;
    expect(player1.state.playlist).toEqual(['musique/hero-intro.mp3']);
    expect(localStorage.getItem('gnd-audio-welcome-played')).toBe('1');

    await player1.scanMusicFiles();
    expect(player1.state.currentPagePlaylist).toContain('musique/index/ambient.mp3');

    const player2 = createPlayer(
      {
        welcome: { track: 'musique/hero-intro.mp3' },
      },
      {
        'musique/index': ['musique/index/ambient.mp3'],
        musique: ['musique/common.mp3'],
      },
    );

    await player2.ready;
    await player2.scanMusicFiles();
    expect(player2.state.playlist).toContain('musique/index/ambient.mp3');
  });

  test('sélection de playlist selon le ratio de priorité', async () => {
    const player = createPlayer(
      {
        priorityRatio: { current: 0.6, default: 0.4 },
      },
      {
        'musique/index': ['musique/index/quest.mp3'],
        musique: ['musique/common.mp3'],
      },
    );

    await player.ready;
    await player.scanMusicFiles();

    jest.spyOn(Math, 'random').mockReturnValueOnce(0.2);
    player.selectNextPlaylistWithPriority();
    expect(player.state.currentPlaylistType).toBe('current');

    Math.random.mockReturnValueOnce(0.95);
    player.selectNextPlaylistWithPriority();
    expect(player.state.currentPlaylistType).toBe('default');

    Math.random.mockRestore();
  });
});

describe('GeeknDragonAudioPlayer - Interface', () => {
  test('synchronisation du header via le bus d\'événements', async () => {
    document.body.innerHTML = `
      <header class="nav-container">
        <button class="nav-toggle">Menu</button>
      </header>
    `;

    const player = createPlayer(
      {
        ui: { attachHeader: true, hideFloatingWhenHeader: true },
      },
      {
        'musique/index': ['musique/index/ambient.mp3'],
      },
    );

    await player.ready;

    const header = document.querySelector('#gndHeaderAudio');
    expect(header).not.toBeNull();
    const floating = document.querySelector('.gnd-audio-player');
    expect(floating).not.toBeNull();

    player.emit('playback-change', { isPlaying: true, shouldResume: true });
    const playButton = header.querySelector('.gnd-header-play');
    expect(playButton.textContent).toBe('⏸');

    player.emit('volume-change', { volume: 0.42 });
    const volumeSlider = header.querySelector('.gnd-header-volume');
    expect(volumeSlider.value).toBe('42');

    player.emit('playlist-update', {});
    expect(floating.style.display).toBe('none');

    player.toggleCollapse();
    expect(localStorage.getItem('gnd-audio-collapsed')).toBe('false');
  });
});

