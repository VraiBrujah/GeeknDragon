// hero-videos.js — rotation vidéo hero avec corrections "no flash"
// - 1 seule vidéo : un seul <video>, loop, aucun recréation DOM
// - plusieurs vidéos : on ne retire l’ancienne qu’une fois la suivante en lecture (évite le fond visible)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-videos').forEach((container) => {
    let list;
    try {
      list = JSON.parse(container.dataset.videos || '[]');
    } catch {
      list = [];
    }
    if (!Array.isArray(list) || list.length === 0) return;

    // S’assure que le conteneur empile bien les <video>
    if (!container.style.position) container.style.position = 'relative';

    // ---- Cas simple : une seule vidéo -> un élément, loop, pas de crossfade nécessaire
    if (list.length === 1) {
      const v = document.createElement('video');
      v.src = list[0];
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.autoplay = true;
      v.className = 'absolute inset-0 w-full h-full object-cover';
      container.appendChild(v);

      const tryPlay = () => v.play().catch(() => {});
      if (v.readyState >= 3) {
        tryPlay();
      } else {
        v.addEventListener('canplay', tryPlay, { once: true });
      }
      return; // fini pour le cas 1 vidéo
    }

    // ---- Cas multiple : crossfade sans flash de fond
    let current = null;
    let index = 1; // on amorce avec list[0], donc le prochain sera list[1]

    function createVideo(src) {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      // On démarre explicitement, pas via autoplay, pour mieux contrôler la transition
      video.autoplay = false;

      video.className = 'absolute inset-0 w-full h-full object-cover hero-fade fade-blur';
      // État initial masqué (pour le crossfade)
      video.style.opacity = '0';
      video.style.filter = 'blur(8px)';
      // On force une transition (fallback si les classes n’en définissent pas)
      video.style.transition = 'opacity 800ms ease, filter 800ms ease';
      return video;
    }

    function showNext() {
      const src = list[index];
      index = (index + 1) % list.length;

      const next = createVideo(src);
      container.appendChild(next);

      const doSwap = () => {
        // Affiche le nouveau
        next.style.opacity = '1';
        next.style.filter = 'blur(0)';

        // Cache puis retire l’ancien uniquement après la transition
        if (current) {
          const removeCurrent = () => current && current.remove();
          current.style.opacity = '0';
          current.style.filter = 'blur(8px)';
          current.addEventListener('transitionend', removeCurrent, { once: true });
          // Sécurité si 'transitionend' ne se déclenche pas
          setTimeout(removeCurrent, 900);
        }

        current = next;
        // Planifie la suite quand ce "current" se termine
        current.addEventListener('ended', showNext, { once: true });
      };

      const startPlay = () => next.play().catch(() => {});
      if (next.readyState >= 3) {
        startPlay();
        // On bascule une fois que la lecture démarre vraiment
        if (next.paused) {
          next.addEventListener('playing', doSwap, { once: true });
        } else {
          doSwap();
        }
      } else {
        next.addEventListener('canplay', startPlay, { once: true });
        next.addEventListener('playing', doSwap, { once: true });
      }
    }

    // Amorçage : première vidéo visible immédiatement (pas de fade-out au début)
    current = createVideo(list[0]);
    current.style.opacity = '1';
    current.style.filter = 'blur(0)';
    container.appendChild(current);

    const seed = () => {
      current.play().catch(() => {});
      current.addEventListener('ended', showNext, { once: true });
    };
    if (current.readyState >= 3) {
      seed();
    } else {
      current.addEventListener('canplay', seed, { once: true });
    }
  });
});
