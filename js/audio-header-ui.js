// Intègre des contrôles audio compacts dans le header et masque le widget flottant
// Dépend de window.gndAudioPlayer (défini par js/audio-player.js)

(function () {
  function buildHeaderUI(player) {
    const nav = document.querySelector('.nav-container') || document.querySelector('header');
    if (!nav || document.querySelector('#gndHeaderAudio')) return null;

    const wrap = document.createElement('div');
    wrap.id = 'gndHeaderAudio';
    wrap.className = 'gnd-header-audio';
    wrap.setAttribute('aria-label', 'Contrôles musique');
    const isPlaying =
      typeof player?.isActuallyPlaying === 'function'
        ? player.isActuallyPlaying()
        : !!(player?.state?.isPlaying);

    wrap.innerHTML = [
      '<div class="gnd-header-vol">',
      '  <input class="gnd-header-volume" type="range" min="0" max="100" value="',
      Math.round((player?.state?.volume || 0.15) * 100),
      '" aria-label="Volume">',
      '</div>',
      '<div class="gnd-header-controls">',
      '  <button class="gnd-header-play" type="button" title="Lecture/Pause" aria-label="Lecture/Pause" aria-pressed="',
      isPlaying ? 'true' : 'false',
      '">',
      isPlaying ? '⏸' : '▶',
      '</button>',
      '  <button class="gnd-header-next" type="button" title="Morceau suivant" aria-label="Morceau suivant">⏭</button>',
      '</div>'
    ].join('');

    const toggle = nav.querySelector('.nav-toggle');
    if (toggle && toggle.parentElement === nav) {
      toggle.insertAdjacentElement('beforebegin', wrap);
    } else {
      nav.appendChild(wrap);
    }

    injectHeaderStyles();
    return wrap;
  }

  function injectHeaderStyles() {
    if (document.querySelector('#gnd-header-audio-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'gnd-header-audio-styles';
    styles.textContent = `
      .gnd-header-audio {
        display:flex; flex-direction:column; align-items:center; gap:.35rem;
        margin-left:auto; padding:.25rem .4rem;
        border:1px solid var(--secondary-color, #d4af37);
        border-radius:8px; background:rgba(0,0,0,.25);
        backdrop-filter:blur(6px);
      }
      .gnd-header-audio .gnd-header-controls { display:flex; align-items:center; gap:.35rem; }
      .gnd-header-audio .gnd-header-play,
      .gnd-header-audio .gnd-header-next {
        appearance:none; border:2px solid var(--secondary-color, #d4af37);
        background:var(--secondary-color, #d4af37); color:var(--dark-bg, #1a1a1a);
        width:28px; height:28px; border-radius:50%; font-weight:700;
        display:inline-flex; align-items:center; justify-content:center; cursor:pointer;
      }
      .gnd-header-audio .gnd-header-next { background:transparent; color:var(--secondary-color, #d4af37); }
      .gnd-header-audio .gnd-header-vol{display:flex; align-items:center; gap:.2rem}
      .gnd-header-audio .gnd-header-volume{width:100px; accent-color:var(--secondary-color, #d4af37)}
      @media (max-width:768px){
        .gnd-header-audio{gap:.25rem; padding:.15rem .3rem}
        .gnd-header-audio .gnd-header-volume{width:80px}
      }
    `;
    document.head.appendChild(styles);
  }

  function attachBindings(player, header) {
    const btn = header.querySelector('.gnd-header-play');
    const nextBtn = header.querySelector('.gnd-header-next');
    const vol = header.querySelector('.gnd-header-volume');

    if (btn) {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!player.sound) {
          await player.quickStart();
        } else {
          await player.togglePlay();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!player.sound) {
          await player.quickStart();
        } else {
          player.playNext();
        }
      });
    }
    if (vol) {
      vol.addEventListener('input', (ev) => player.setVolume(ev.target.value));
    }

    // Mises à jour réactives via monkey-patch de méthodes existantes
    const updPlay = player.updatePlayButton?.bind(player) || (() => {});
    player.updatePlayButton = function () {
      try {
        const b = header.querySelector('.gnd-header-play');
        if (b) {
          const playing =
            typeof this.isActuallyPlaying === 'function'
              ? this.isActuallyPlaying()
              : !!this.state?.isPlaying;
          b.textContent = playing ? '⏸' : '▶';
          b.setAttribute('aria-pressed', playing ? 'true' : 'false');
        }
      } catch {}
      return updPlay();
    };

    const setVol = player.setVolume?.bind(player) || (() => {});
    player.setVolume = function (value) {
      const r = setVol(value);
      try {
        const v = header.querySelector('.gnd-header-volume');
        if (v) v.value = Math.round((this.state?.volume || 0) * 100);
      } catch {}
      return r;
    };
  }

  function hideFloatingWidgetIfAny() {
    const w = document.querySelector('.gnd-audio-player');
    if (w) w.style.display = 'none';
  }

  function initWhenReady() {
    const player = window.gndAudioPlayer;
    if (!player) return; // attendra un autre tick
    const header = buildHeaderUI(player);
    if (!header) return;
    attachBindings(player, header);
    hideFloatingWidgetIfAny();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    setTimeout(initWhenReady, 0);
  }
})();

