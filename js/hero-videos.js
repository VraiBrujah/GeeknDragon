document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('video.hero-video').forEach((video) => {
    let playlist;
    try {
      playlist = JSON.parse(video.dataset.playlist || '[]');
    } catch (e) {
      playlist = [];
    }
    if (!Array.isArray(playlist) || playlist.length === 0) return;
    let index = 0;
    const loadCurrent = () => {
      // eslint-disable-next-line no-param-reassign
      video.src = playlist[index];
      video.load();
    };
    const playVideo = () => {
      video.play().catch(() => {});
    };
    video.addEventListener('ended', () => {
      video.classList.add('is-fading');
      setTimeout(() => {
        index = (index + 1) % playlist.length;
        loadCurrent();
        video.addEventListener('loadeddata', () => {
          playVideo();
          video.classList.remove('is-fading');
        }, { once: true });
      }, 1000);
    });
    if (playlist.length === 1) {
      // eslint-disable-next-line no-param-reassign
      video.loop = true;
    }
    const start = () => {
      loadCurrent();
      playVideo();
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
            observer.unobserve(video);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(video);
    } else {
      start();
    }
  });
});
