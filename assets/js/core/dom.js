/* ========================================================================
   Geek & Dragon — DOM Utilities
   Helpers pour manipulation DOM et événements
   ===================================================================== */

import { qs, qsa, throttle, debounce } from './utils.js';

/**
 * Initialisation des événements de scroll avec animations
 */
export const initScrollAnimations = () => {
  // Fade-up elements
  qsa('.fade-up').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(el);
  });
};

/**
 * Smooth scroll pour les ancres
 */
export const initSmoothScroll = () => {
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!a) return;
    
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    
    e.preventDefault();
    
    // Import dynamique pour éviter les dépendances circulaires
    import('./utils.js').then(({ smoothScrollTo }) => {
      smoothScrollTo(target);
    });
    
    // Gestion navigation active
    if (a.matches('nav .nav-link')) {
      qsa('nav .nav-link.is-active').forEach((x) => x.classList.remove('is-active'));
      a.classList.add('is-active');
    }
  }, { passive: false });
};

/**
 * Navigation active et scroll spy
 */
export const initNavigation = () => {
  const clearActive = () => {
    qsa('nav .nav-link.is-active, nav .nav-link[aria-current="page"]').forEach((el) => {
      el.classList.remove('is-active');
      el.removeAttribute('aria-current');
    });
  };
  
  const setActive = (el) => {
    clearActive();
    if (el) {
      el.classList.add('is-active');
      el.setAttribute('aria-current', 'page');
    }
  };

  // Clic navigation
  qsa('nav .nav-link').forEach((el) => {
    el.addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      setActive(el);
    });
  });

  // Scroll spy
  const mapping = new Map();
  qsa('nav .nav-link[href*="#"]').forEach((a) => {
    const id = a.getAttribute('href').split('#')[1];
    const sec = id && document.getElementById(id);
    if (sec) mapping.set(sec, a);
  });
  
  if (mapping.size) {
    const io = new IntersectionObserver((entries) => {
      let best = null;
      for (const e of entries) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
          best = e;
        }
      }
      if (best) setActive(mapping.get(best.target));
    }, { 
      rootMargin: '0px 0px -55% 0px', 
      threshold: [0.25, 0.5, 0.75] 
    });
    
    mapping.forEach((_, sec) => io.observe(sec));
  }

  // Accessibilité sous-menus
  qsa('nav .relative.group').forEach((grp) => {
    const submenu = grp.querySelector('ul');
    if (!submenu) return;
    
    grp.addEventListener('focusin', () => submenu.classList.remove('hidden'));
    grp.addEventListener('focusout', (e) => {
      if (!grp.contains(e.relatedTarget)) submenu.classList.add('hidden');
    });
  });
};

/**
 * Header shrink effect
 */
export const initHeaderEffects = () => {
  const header = qs('header');
  if (!header) return;
  
  const onScroll = throttle(() => {
    const scrolled = window.pageYOffset > 8;
    header.classList.toggle('shadow-2xl', scrolled);
    header.classList.toggle('backdrop-blur-md', scrolled);
  }, 80);
  
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/**
 * Back to top button
 */
export const initBackToTop = () => {
  const back = document.getElementById('back-to-top');
  if (!back) return;
  
  back.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  const toggleBack = throttle(() => {
    const show = window.pageYOffset >= 500;
    back.classList.toggle('opacity-0', !show);
    back.classList.toggle('pointer-events-none', !show);
  }, 100);
  
  window.addEventListener('scroll', toggleBack, { passive: true });
  toggleBack();
};

/**
 * Accordéons/collapse
 */
export const initCollapse = () => {
  qsa('[data-collapse]').forEach((btn) => {
    const target = qs(btn.dataset.collapse);
    if (!target) return;
    
    btn.setAttribute('aria-expanded', 'false');
    target.hidden = true;

    const open = () => {
      target.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      target.style.height = 'auto';
      const h = `${target.clientHeight}px`;
      target.style.height = '0px';
      requestAnimationFrame(() => {
        target.style.height = h;
      });
      target.addEventListener('transitionend', () => {
        target.style.height = 'auto';
      }, { once: true });
    };
    
    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      target.style.height = `${target.clientHeight}px`;
      requestAnimationFrame(() => {
        target.style.height = '0px';
      });
      target.addEventListener('transitionend', () => {
        target.hidden = true;
        target.style.height = '';
      }, { once: true });
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      (btn.getAttribute('aria-expanded') === 'true' ? close : open)();
    });
  });
};

/**
 * Lazy loading des images (fallback)
 */
export const initLazyLoading = () => {
  if ('loading' in HTMLImageElement.prototype) return;
  
  const imgs = qsa('img[loading="lazy"]');
  if (!imgs.length) return;
  
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      
      const img = e.target;
      const { src } = img.dataset;
      const { srcset } = img.dataset;
      
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      
      obs.unobserve(img);
    });
  }, { rootMargin: '100px 0px' });
  
  imgs.forEach((img) => io.observe(img));
};