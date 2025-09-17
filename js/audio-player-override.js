// Override ciblé pour forcer "musique/hero-intro.mp3" au tout premier lancement
// Nécessite que js/audio-player.js soit chargé avant ce fichier.

(function patchQuickStart() {
  function install() {
    if (!window.GeeknDragonAudioPlayer && !window.gndAudioPlayer) {
      // La classe n'est pas globale, on tente via script instancié plus tard
    }
    const Proto = (typeof GeeknDragonAudioPlayer !== 'undefined')
      ? GeeknDragonAudioPlayer.prototype
      : (window.gndAudioPlayer && Object.getPrototypeOf(window.gndAudioPlayer));
    if (!Proto) return false;

    const original = Proto.quickStart;
    if (typeof original !== 'function') return false;

    Proto.quickStart = async function () {
      try {
        const firstKey = 'gnd-audio-welcome-played';
        if (!localStorage.getItem(firstKey)) {
          const welcome = 'musique/hero-intro.mp3';
          let ok = false;
          try { const r1 = await fetch(welcome, { method: 'HEAD' }); ok = r1.ok; } catch(_) {}
          if (!ok) {
            try {
              const r2 = await fetch(welcome, { method: 'GET', headers: { 'Range': 'bytes=0-0' } });
              ok = r2.ok || r2.status === 206;
            } catch(_) {}
          }
          if (ok) {
            this.state.playlist = [welcome];
            this.state.isPlaying = true;
            this.state.currentTime = 0;
            this.loadTrack(0);
            this.updatePlayButton();
            localStorage.setItem(firstKey, '1');
            setTimeout(() => this.scanMusicFiles(), 500);
            return;
          } else {
            localStorage.setItem(firstKey, '1');
          }
        }
      } catch (_) {}

      return await original.apply(this, arguments);
    };

    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(install, 0));
  } else {
    // essaie plusieurs fois pour attendre que audio-player.js soit chargé
    let tries = 0;
    (function tryInstall(){
      if (install()) return;
      if (++tries < 50) setTimeout(tryInstall, 100);
    })();
  }
})();

