// Hero videos rotation with fade-blur transition

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-videos').forEach((container) => {
    let list;
    try {
      list = JSON.parse(container.dataset.videos || '[]');
    } catch {
      list = [];
    }
    if (!Array.isArray(list) || list.length === 0) return;

    let index = 0;
    let current;

    function createVideo(src) {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.autoplay = true;
      video.className = 'absolute inset-0 w-full h-full object-cover hero-fade fade-blur';
      video.style.opacity = '0';
      video.style.filter = 'blur(8px)';
      return video;
    }

    function playNext() {
      index = (index + 1) % list.length;
      const next = createVideo(list[index]);
      next.addEventListener('ended', playNext);
      container.appendChild(next);
      requestAnimationFrame(() => {
        next.style.opacity = '1';
        next.style.filter = 'blur(0)';
        if (current) {
          current.style.opacity = '0';
          current.style.filter = 'blur(8px)';
          current.addEventListener('transitionend', () => {
            current.remove();
          }, { once: true });
        }
      });
      current = next;
    }

    current = createVideo(list[0]);
    current.addEventListener('ended', playNext);
    container.appendChild(current);
    requestAnimationFrame(() => {
      current.style.opacity = '1';
      current.style.filter = 'blur(0)';
    });
  });
});
