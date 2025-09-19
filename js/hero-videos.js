// hero-videos.js
// Rotation robuste des vidéos "hero" avec crossfade et boucle fiable
// - 1 seule source : un seul <video> en loop, jamais recréé.
// - Plusieurs sources : double-buffer + préchargement, on ne retire l'ancien
//   qu'après que le nouveau joue vraiment (plus d'écran vide).

console.log('🚀 Script hero-videos.js chargé !');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 Hero Videos script chargé');
  const FADE_MS = 1000;

  const containers = document.querySelectorAll('.hero-videos');
  console.log('📹 Containers hero-videos trouvés:', containers.length);

  containers.forEach((container, index) => {
    console.log(`🎥 Traitement container ${index + 1}:`, {
      main: container.dataset.main,
      videos: container.dataset.videos,
      parent: container.parentElement.className
    });
    // 1) Lire et valider la liste aléatoire + éventuelle vidéo principale
    let list = [];
    try {
      const raw = container.dataset.videos || '[]';
      console.log('📝 Raw videos data:', raw);
      
      // Validation plus stricte pour éviter les problèmes CSP
      if (raw && raw.startsWith('[') && raw.endsWith(']')) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          list = arr.filter((s) => typeof s === 'string' && s.trim() !== '');
          console.log('✅ Liste vidéos validée:', list);
        }
      }
    } catch (e) { 
      console.error('❌ Erreur parse JSON:', e);
    }

    const mainSrc = (container.dataset.main || '').trim();

    if (mainSrc && list.length === 0) {
      list = [mainSrc];
    } else if (!mainSrc && list.length === 0) {
      return;
    }

    // Helper de création <video>
    const makeVideo = (src, hidden = true) => {
      console.log('🎞️ Création vidéo:', src);
      const v = document.createElement('video');
      v.src = src;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', ''); // iOS
      v.preload = 'metadata';
      v.autoplay = true;
      v.loop = false; // géré au cas par cas
      // Layout + anim
      v.style.position = 'absolute';
      v.style.inset = '0';
      v.style.width = '100%';
      v.style.height = '100%';
      v.style.objectFit = 'cover';
      v.style.pointerEvents = 'none';
      v.style.transition = `opacity ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`;
      v.style.opacity = hidden ? '0' : '1';
      v.style.filter = hidden ? 'blur(8px)' : 'blur(0)';
      
      v.addEventListener('loadeddata', () => {
        console.log('📺 Vidéo chargée:', src);
      });
      
      v.addEventListener('error', (e) => {
        console.error('❌ Erreur vidéo:', src, e);
      });
      
      return v;
    };

    // Cas C — vidéo principale + liste aléatoire
    if (mainSrc && (list.length > 1 || (list.length === 1 && list[0] !== mainSrc))) {
      let lastWasMain = true;
      let current = makeVideo(mainSrc, true);
      container.appendChild(current);

      let next = null;

      let pool = [...list];
      const pickRandom = () => {
        if (pool.length === 0) pool = [...list];
        const i = Math.floor(Math.random() * pool.length);
        return pool.splice(i, 1)[0];
      };

      const showWhenReady = (video) => {
        const vid = video;
        const run = () => {
          vid.play().catch(() => {});
          requestAnimationFrame(() => {
            vid.style.opacity = '1';
            vid.style.filter = 'blur(0)';
          });
        };
        if (vid.readyState >= 2) run();
        else vid.addEventListener('canplay', run, { once: true });
      };

      const buildNextRandom = () => {
        const src = lastWasMain ? pickRandom() : mainSrc;
        lastWasMain = !lastWasMain;
        const v = makeVideo(src, true);
        v.addEventListener('error', () => {
          setTimeout(() => {
            if (v.parentNode) v.parentNode.removeChild(v);
            // eslint-disable-next-line no-use-before-define
            buildAndStageNextRandom();
          }, 100);
        });
        return v;
      };

      const buildAndStageNextRandom = () => {
        next = buildNextRandom();
        container.appendChild(next);
        if (next.readyState < 2) next.load();
      };

      const goToNext = () => {
        if (!next) buildAndStageNextRandom();

        const startTransition = () => {
          next.play().catch(() => {});
          requestAnimationFrame(() => {
            next.style.opacity = '1';
            next.style.filter = 'blur(0)';

            current.style.opacity = '0';
            current.style.filter = 'blur(8px)';

            const old = current;
            current = next;

            old.addEventListener('transitionend', () => {
              if (old.parentNode) old.parentNode.removeChild(old);
              current.addEventListener('ended', goToNext, { once: true });
              buildAndStageNextRandom();
            }, { once: true });
          });
        };

        if (next.readyState >= 2) startTransition();
        else next.addEventListener('canplay', startTransition, { once: true });
      };

      current.addEventListener('loadeddata', () => {
        showWhenReady(current);
      }, { once: true });

      current.addEventListener('playing', () => {
        buildAndStageNextRandom();
        current.addEventListener('ended', goToNext, { once: true });
      }, { once: true });

      setTimeout(() => {
        if (current.style.opacity !== '1') {
          showWhenReady(current);
        }
      }, 300);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          [current, next].forEach((v) => v && v.paused && v.play().catch(() => {}));
        }
      });

      return;
    }

    // Cas A — une seule vidéo : pas de recréation, boucle fiable
    if (list.length === 1) {
      const src = list[0];
      const vid = makeVideo(src, true);
      vid.loop = true;

      const reveal = () => {
        requestAnimationFrame(() => {
          vid.style.opacity = '1';
          vid.style.filter = 'blur(0)';
        });
      };

      vid.addEventListener('loadeddata', () => {
        vid.play().catch(() => {});
        reveal();
      }, { once: true });

      // Filets de sécurité : si loop est ignoré (certains contextes/sommeil d’onglet)
      vid.addEventListener('ended', () => {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      });

      vid.addEventListener('error', () => {
        setTimeout(() => {
          vid.load();
          vid.play().catch(() => {});
        }, 500);
      });

      container.appendChild(vid);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && vid.paused) {
          vid.play().catch(() => {});
        }
      });

      return; // terminé pour le cas 1 vidéo
    }

    // Cas B — plusieurs vidéos : double-buffer avec précharge
    let idx = 0;
    let current = makeVideo(list[idx], true);
    container.appendChild(current);

    let next = null;

    const showWhenReady = (video) => {
      const vid = video;
      const run = () => {
        vid.play().catch(() => {});
        requestAnimationFrame(() => {
          vid.style.opacity = '1';
          vid.style.filter = 'blur(0)';
        });
      };
      if (vid.readyState >= 2) run();
      else vid.addEventListener('canplay', run, { once: true });
    };

    const buildNext = () => {
      idx = (idx + 1) % list.length;
      const v = makeVideo(list[idx], true);
      v.addEventListener('error', () => {
        // Si erreur sur la source, on tente de passer à la suivante
        setTimeout(() => {
          if (v.parentNode) v.parentNode.removeChild(v);
          // eslint-disable-next-line no-use-before-define
          buildAndStageNext();
        }, 100);
      });
      return v;
    };

    const buildAndStageNext = () => {
      next = buildNext();
      container.appendChild(next); // on l'ajoute cachée pour bufferiser
      if (next.readyState < 2) next.load();
    };

    const goToNext = () => {
      if (!next) buildAndStageNext();

      const startTransition = () => {
        next.play().catch(() => {});
        requestAnimationFrame(() => {
          // Faire apparaître la nouvelle
          next.style.opacity = '1';
          next.style.filter = 'blur(0)';

          // Faire disparaître l'ancienne APRÈS le démarrage de la nouvelle
          current.style.opacity = '0';
          current.style.filter = 'blur(8px)';

          const old = current;
          current = next;

          old.addEventListener('transitionend', () => {
            if (old.parentNode) old.parentNode.removeChild(old);
            // Écouter la fin de la "nouvelle actuelle"
            current.addEventListener('ended', goToNext, { once: true });
            // Préparer la suivante
            buildAndStageNext();
          }, { once: true });
        });
      };

      if (next.readyState >= 2) startTransition();
      else next.addEventListener('canplay', startTransition, { once: true });
    };

    // Démarrage : afficher la première dès qu’elle peut
    current.addEventListener('loadeddata', () => {
      showWhenReady(current);
    }, { once: true });

    // Une fois qu’elle joue, on prépare la suite et on enchaîne à "ended"
    current.addEventListener('playing', () => {
      buildAndStageNext();
      current.addEventListener('ended', goToNext, { once: true });
    }, { once: true });

    // Sécurité anti-écran vide si "playing" est lent/bloqué
    setTimeout(() => {
      if (current.style.opacity !== '1') {
        showWhenReady(current);
      }
    }, 300);

    // Reprise à retour d’onglet
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        [current, next].forEach((v) => v && v.paused && v.play().catch(() => {}));
      }
    });
  });
});
