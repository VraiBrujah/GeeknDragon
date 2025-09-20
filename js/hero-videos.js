// hero-videos.js
// Rotation robuste des vidéos "hero" avec crossfade et boucle fiable
// - 1 seule source : un seul <video> en loop, jamais recréé.
// - Plusieurs sources : double-buffer + préchargement, on ne retire l'ancien
//   qu'après que le nouveau joue vraiment (plus d'écran vide).

document.addEventListener('DOMContentLoaded', () => {
  const FADE_MS = 1000;
  const LOAD_AHEAD_SECONDS = 3;
  const supportsMatchMedia = typeof window.matchMedia === 'function';
  const reduceMotionQuery = supportsMatchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const coarsePointerQuery = supportsMatchMedia
    ? window.matchMedia('(pointer: coarse)')
    : null;
  const readMediaQuery = (query) => (query && 'matches' in query ? query.matches : false);

  // Gestion paresseuse du préchargement : charge la prochaine vidéo seulement
  // lorsque l'utilisateur interagit ou quand la lecture courante approche de sa fin.
  const createLazyManager = ({ container, getNext, thresholdSeconds }) => {
    const primed = new WeakMap();
    const watchers = new WeakMap();

    const mark = (video) => {
      if (video) {
        primed.set(video, false);
      }
    };

    const prime = () => {
      const candidate = getNext();
      if (!candidate) return;
      if (candidate.readyState >= 2) {
        primed.set(candidate, true);
        return;
      }
      if (primed.get(candidate)) return;
      primed.set(candidate, true);
      try {
        candidate.load();
      } catch (error) {
        // ignore
      }
    };

    const monitor = (video) => {
      if (!video) return;

      if (watchers.has(video)) {
        const previous = watchers.get(video);
        video.removeEventListener('timeupdate', previous);
        watchers.delete(video);
      }

      const handler = () => {
        const candidate = getNext();
        if (!candidate) return;
        if (candidate.readyState >= 2) {
          primed.set(candidate, true);
          video.removeEventListener('timeupdate', handler);
          watchers.delete(video);
          return;
        }
        if (primed.get(candidate)) return;

        const { duration, currentTime } = video;
        if (!Number.isFinite(duration) || duration <= 0) {
          if (currentTime >= thresholdSeconds) {
            prime();
            video.removeEventListener('timeupdate', handler);
            watchers.delete(video);
          }
          return;
        }

        if (duration - currentTime <= thresholdSeconds) {
          prime();
          video.removeEventListener('timeupdate', handler);
          watchers.delete(video);
        }
      };

      watchers.set(video, handler);
      video.addEventListener('timeupdate', handler);
    };

    const reset = (video) => {
      if (!video) return;
      const handler = watchers.get(video);
      if (handler) {
        video.removeEventListener('timeupdate', handler);
        watchers.delete(video);
      }
    };

    const events = [
      ['pointerdown', { passive: true }],
      ['pointerenter', false],
      ['touchstart', { passive: true }],
      ['focusin', false],
    ];

    events.forEach(([eventName, options]) => {
      const opts = typeof options === 'undefined' ? false : options;
      container.addEventListener(eventName, prime, opts);
    });

    return {
      mark,
      prime,
      monitor,
      reset,
    };
  };

  document.querySelectorAll('.hero-videos').forEach((container) => {
    const prefersReducedMotion = readMediaQuery(reduceMotionQuery);
    const isCoarsePointer = readMediaQuery(coarsePointerQuery);
    // Force continuous playback - ignore motion/touch preferences for hero videos
    const freezeCarousel = false;
    const autoPlayAllowed = true;

    // 1) Lire et valider la liste aléatoire + éventuelle vidéo principale
    let list = [];
    try {
      const raw = container.dataset.videos || '[]';
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        list = arr.filter((s) => typeof s === 'string' && s.trim() !== '');
      }
    } catch { /* ignore */ }

    const mainSrc = (container.dataset.main || '').trim();

    if (mainSrc && list.length === 0) {
      list = [mainSrc];
    } else if (!mainSrc && list.length === 0) {
      return;
    }

    // Helper de création <video>
    const makeVideo = (src, hidden = true) => {
      const v = document.createElement('video');
      v.src = src;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', ''); // iOS
      v.preload = 'metadata';
      v.autoplay = autoPlayAllowed;
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
          if (autoPlayAllowed && vid.paused) {
            vid.play().catch(() => {});
          }
          requestAnimationFrame(() => {
            vid.style.opacity = '1';
            vid.style.filter = 'blur(0)';
          });
        };
        if (vid.readyState >= 2) run();
        else vid.addEventListener('canplay', run, { once: true });
      };

      if (freezeCarousel) {
        current.loop = true;

        current.addEventListener('loadeddata', () => {
          if (autoPlayAllowed && current.paused) {
            current.play().catch(() => {});
          }
          showWhenReady(current);
        }, { once: true });

        current.addEventListener('ended', () => {
          if (autoPlayAllowed) {
            current.currentTime = 0;
            current.play().catch(() => {});
          }
        });

        setTimeout(() => {
          if (current.style.opacity !== '1') {
            showWhenReady(current);
          }
        }, 300);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && autoPlayAllowed && current.paused) {
            current.play().catch(() => {});
          }
        });

        return;
      }

      const lazy = createLazyManager({
        container,
        getNext: () => next,
        thresholdSeconds: LOAD_AHEAD_SECONDS,
      });

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
        lazy.mark(next);
        container.appendChild(next);
      };

      const goToNext = () => {
        if (!next) buildAndStageNextRandom();

        lazy.prime();

        const startTransition = () => {
          if (autoPlayAllowed) {
            next.play().catch(() => {});
          }
          requestAnimationFrame(() => {
            next.style.opacity = '1';
            next.style.filter = 'blur(0)';

            current.style.opacity = '0';
            current.style.filter = 'blur(8px)';

            const old = current;
            current = next;

            old.addEventListener('transitionend', () => {
              lazy.reset(old);
              if (old.parentNode) old.parentNode.removeChild(old);
              current.addEventListener('ended', goToNext, { once: true });
              if (current.paused) {
                current.addEventListener('playing', () => {
                  lazy.monitor(current);
                }, { once: true });
              } else {
                lazy.monitor(current);
              }
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
        lazy.monitor(current);
      }, { once: true });

      setTimeout(() => {
        if (current.style.opacity !== '1') {
          showWhenReady(current);
        }
      }, 300);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && autoPlayAllowed) {
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
        if (autoPlayAllowed && vid.paused) {
          vid.play().catch(() => {});
        }
        reveal();
      }, { once: true });

      // Filets de sécurité : si loop est ignoré (certains contextes/sommeil d’onglet)
      vid.addEventListener('ended', () => {
        vid.currentTime = 0;
        if (autoPlayAllowed) {
          vid.play().catch(() => {});
        }
      });

      vid.addEventListener('error', () => {
        setTimeout(() => {
          vid.load();
          if (autoPlayAllowed) {
            vid.play().catch(() => {});
          }
        }, 500);
      });

      container.appendChild(vid);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && autoPlayAllowed && vid.paused) {
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
        if (autoPlayAllowed && vid.paused) {
          vid.play().catch(() => {});
        }
        requestAnimationFrame(() => {
          vid.style.opacity = '1';
          vid.style.filter = 'blur(0)';
        });
      };
      if (vid.readyState >= 2) run();
      else vid.addEventListener('canplay', run, { once: true });
    };

    if (freezeCarousel) {
      current.loop = true;

      current.addEventListener('loadeddata', () => {
        if (autoPlayAllowed && current.paused) {
          current.play().catch(() => {});
        }
        showWhenReady(current);
      }, { once: true });

      current.addEventListener('ended', () => {
        if (autoPlayAllowed) {
          current.currentTime = 0;
          current.play().catch(() => {});
        }
      });

      setTimeout(() => {
        if (current.style.opacity !== '1') {
          showWhenReady(current);
        }
      }, 300);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && autoPlayAllowed && current.paused) {
          current.play().catch(() => {});
        }
      });

      return;
    }

    const lazy = createLazyManager({
      container,
      getNext: () => next,
      thresholdSeconds: LOAD_AHEAD_SECONDS,
    });

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
      lazy.mark(next);
      container.appendChild(next); // on l'ajoute cachée pour bufferiser
    };

    const goToNext = () => {
      if (!next) buildAndStageNext();

      lazy.prime();

      const startTransition = () => {
        if (autoPlayAllowed) {
          next.play().catch(() => {});
        }
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
            lazy.reset(old);
            if (old.parentNode) old.parentNode.removeChild(old);
            // Écouter la fin de la "nouvelle actuelle"
            current.addEventListener('ended', goToNext, { once: true });
            if (current.paused) {
              current.addEventListener('playing', () => {
                lazy.monitor(current);
              }, { once: true });
            } else {
              lazy.monitor(current);
            }
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
      lazy.monitor(current);
    }, { once: true });

    // Sécurité anti-écran vide si "playing" est lent/bloqué
    setTimeout(() => {
      if (current.style.opacity !== '1') {
        showWhenReady(current);
      }
    }, 300);

    // Reprise à retour d'onglet
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && autoPlayAllowed) {
        [current, next].forEach((v) => v && v.paused && v.play().catch(() => {}));
      }
    });

    // Protection supplémentaire : vérification périodique que les vidéos tournent
    setInterval(() => {
      if (document.visibilityState === 'visible' && autoPlayAllowed) {
        if (current && current.paused && !current.ended) {
          current.play().catch(() => {});
        }
      }
    }, 5000); // Check toutes les 5 secondes
  });
});
