/* Header scroll animation - Navigation icônes */
(function() {
  function initHeaderScroll() {
    const iconNav = document.getElementById('icon-nav');
    if (!iconNav) return;

    let lastScrollY = window.scrollY;
    let isHidden = false;
    let ticking = false;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 80;

      if (scrollingDown && currentScrollY > scrollThreshold && !isHidden) {
        // Scroll vers le bas - ajouter classe pour cacher
        iconNav.classList.add('hidden-nav');
        isHidden = true;
      } else if (!scrollingDown && isHidden) {
        // Scroll vers le haut - retirer classe pour montrer
        iconNav.classList.remove('hidden-nav');
        isHidden = false;
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
  } else {
    initHeaderScroll();
  }
})();
