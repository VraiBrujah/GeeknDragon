// Hero videos rotation with fade-blur transition
// Correction: ne pas recréer de <video> si une seule source (loop=true)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-videos').forEach((container) => {
    let list;
    try {
      list = JSON.parse(container.dataset.videos || '[]');
    } catch {
      list = [];
    }
    if (!Array.isArray(list) || list.length === 0) return;

    // Utilitaire: création d'un <video> stylé pour le hero
    function createVideo(src, { loop = false } = {}) {
      const video = document.createElement('video');
      video.src = src;
      video.dataset.src = src; // pour comparaisons éventuelles
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.autoplay = true;
      video.loop = !!loop;
      video.className = 'absolute inset-0 w-full h-full object-cover hero-fade fade-blur';
      video.style.opacity = '0';
      video.style.filter = 'blur(8px)';
      return video;
    }

    // CAS SIMPLE: une seule vidéo -> un seul élément en boucle, pas de recréation
    if (list.length === 1) {
      const solo = createVideo(list[0], { loop: true });
      container.appendChild(solo);

      const reveal = () => {
        // évite les flashes initiaux
        requestAnimationFrame(() => {
          solo.style.opacity = '1';
          solo.style.filter = 'blur(0)';
        });
      };

      // Démarrage fiable selon l’état de buffering
      solo.addEventListener('canplay', () => {
        solo.play().catch(() => {});
        reveal();
      }, { once: true });

      // fallback si canplay ne se déclenche pas (certaines plateformes)
      solo.play().then(reveal).catch(() => {});

      return; // rien d’autre à faire
    }

    // CAS ROTATION: 2+ vidéos -> crossfade comme avant
    let index = -1;
    let current = null;

    function playNext() {
      index = (index + 1) % list.length;

      const next = createVideo(list[index], { loop: false });

      // Quand la vidéo se termine, passer à la suivante
      next.addEventListener('ended', playNext);

      container.appendChild(next);

      // Démarrer proprement puis lancer le crossfade
      const startAndFade = () => {
        next.play().catch(() => {});
        requestAnimationFrame(() => {
          // Fade in du nouveau
          next.style.opacity = '1';
          next.style.filter = 'blur(0)';

          // Fade out de l’ancien puis retrait
          if (current) {
            current.style.opacity = '0';
            current.style.filter = 'blur(8px)';
            current.addEventListener(
              'transitionend',
              () => current && current.remove(),
              { once: true }
            );
          }

          current = next;
        });
      };

      if (next.readyState >= 2) {
        // Assez de données pour lancer
        startAndFade();
      } else {
        next.addEventListener('canplay', startAndFade, { once: true });
      }
    }

    playNext();
  });
});
