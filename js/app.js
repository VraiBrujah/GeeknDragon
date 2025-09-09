/* ========================================================================
   Geek & Dragon — app.js (full)
   Dernière mise à jour : Header/Nav fixes + i18n + mobile panel + boutique
   + vidéos séquentielles + Swiper/Fancybox + helpers utilitaires.
   ===================================================================== */

/* global Swiper, Fancybox */
/* eslint-disable */

/* ========================================================================
   UTILITAIRES GÉNÉRIQUES
   ===================================================================== */
(() => {
  // Sélecteurs rapides
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Logging sécurisé avec fallback
  const log = (...args) => { 
    try { 
      if (typeof console !== 'undefined' && console.log) {
        console.log('[GD]', ...args); 
      }
    } catch (error) {
      // En mode développement, on peut vouloir voir l'erreur
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('[GD] Logging error:', error);
      }
    }
  };

  // Throttle / Debounce
  const throttle = (fn, wait = 100) => {
    let last = 0; let
      timer = null;
    return function throttled(...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now; fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => { last = Date.now(); timer = null; fn.apply(this, args); }, wait - (now - last));
      }
    };
  };
  const debounce = (fn, wait = 120) => {
    let t; return function debounced(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  };

  // Helpers DOM
  const createEl = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'style') Object.assign(el.style, v);
      else if (v !== null && v !== undefined) el.setAttribute(k, v);
    });
    [].concat(children).forEach((c) => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else if (c) el.appendChild(c);
    });
    return el;
  };

  // Cookies
  const setCookie = (name, value, maxAge = 31536000) => {
    try { document.cookie = `${name}=${value};path=/;max-age=${maxAge}`; } catch (_) {}
  };
  const getCookie = (name) => {
    try {
      const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
      return m ? m[1] : null;
    } catch (_) { return null; }
  };

  // Langue
  const LANGS = ['fr', 'en'];
  const DEFAULT_LANG = 'fr';
  const getLang = () => {
    const fromStorage = localStorage.getItem('lang');
    const fromCookie = getCookie('lang');
    const fromHtml = document.documentElement.lang;
    const lang = (fromStorage || fromCookie || fromHtml || DEFAULT_LANG).toLowerCase();
    return LANGS.includes(lang) ? lang : DEFAULT_LANG;
  };
  const setLang = (lang) => {
    const safe = LANGS.includes(lang) ? lang : DEFAULT_LANG;
    localStorage.setItem('lang', safe);
    setCookie('lang', safe);
    document.documentElement.lang = safe;
    return safe;
  };

  // Smooth scroll + offset du header
  const prefersNoMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const getHeaderOffset = () => {
    const header = qs('header');
    return header ? header.offsetHeight : 0;
  };
  const smoothScrollTo = (target, options = {}) => {
    const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - (options.offset ?? getHeaderOffset() + 12));
    if (prefersNoMotion) { window.scrollTo(0, top); return; }
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Focus trap
  const focusTrap = (container) => {
    const focusableSel = 'a[href], button:not([disabled]), select, textarea, input, [tabindex]:not([tabindex="-1"])';
    let nodes = []; let first = null; let last = null;
    const set = () => { nodes = qsa(focusableSel, container); [first] = nodes; last = nodes[nodes.length - 1]; };
    const handler = (e) => {
      if (e.key !== 'Tab' || !nodes.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    return {
      mount() { set(); container.addEventListener('keydown', handler); },
      unmount() { container.removeEventListener('keydown', handler); },
    };
  };

  // Expose utilitaires
  window.GD = Object.assign(window.GD || {}, {
    qs,
    qsa,
    log,
    throttle,
    debounce,
    createEl,
    getLang,
    setLang,
    smoothScrollTo,
    getHeaderOffset,
    focusTrap,
  });
})();

/* ========================================================================
   HAUTEUR D’EN-TÊTE → variables CSS (global + panier)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;
  const setHeaderVars = () => {
    const h = header.getBoundingClientRect().height || 80;
    // utilisé par ton site
    document.documentElement.style.setProperty('--header-height', `${h}px`);
    // utilisé par les éléments e-commerce (modales, résumés, etc.)
    document.documentElement.style.setProperty('--gd-header-h', `${h}px`);
  };
  setHeaderVars();
  new ResizeObserver(setHeaderVars).observe(header);
  window.addEventListener('resize', setHeaderVars);
});

/* ========================================================================
   I18N — Drapeaux + chargement JSON + mise à jour dynamique
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const switcher = document.getElementById('lang-switcher');
  const defaultLang = 'fr';
  const available = ['fr', 'en'];

  let lang = window.GD.getLang();
  if (!available.includes(lang)) lang = defaultLang;
  lang = window.GD.setLang(lang);

  const setCurrent = (cur) => {
    document.querySelectorAll('.flag-btn[data-lang]').forEach((btn) => {
      if (btn.dataset.lang === cur) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  };
  setCurrent(lang);

  document.querySelectorAll('.flag-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const picked = btn.dataset.lang;
      window.GD.setLang(picked);
      setCurrent(picked);
      loadTranslations(picked);
    });
  });

  function loadTranslations(current) {
    fetch(`/translations/${current}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        window.i18n = data;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const keys = el.dataset.i18n.split('.');
          let text = data; keys.forEach((k) => { if (text) text = text[k]; });
          if (text != null) el.innerHTML = text;
        });

        // Champs produits (nom/desc/alt)
        document.querySelectorAll('[data-name-fr]').forEach((el) => {
          const target = current === 'en' ? el.dataset.nameEn : el.dataset.nameFr;
          if (target) el.innerHTML = target;
        });
        document.querySelectorAll('[data-desc-fr]').forEach((el) => {
          const target = current === 'en' ? el.dataset.descEn : el.dataset.descFr;
          if (target) el.innerHTML = target;
        });
        document.querySelectorAll('[data-alt-fr]').forEach((el) => {
          const target = current === 'en' ? el.dataset.altEn : el.dataset.altFr;
          if (target) el.setAttribute('alt', target);
        });

        // affiche uniquement le sélecteur FR/EN correspondant (si tu en as deux)
        document.querySelectorAll('[data-role^="multiplier-"]').forEach((sel) => {
          const { role } = sel.dataset; // multiplier-fr / multiplier-en
          const isFor = role?.split('-')[1];
          if (!isFor) return;
          sel.closest('.multiplier-wrapper')?.classList.toggle('hidden', isFor !== current);
        });

        if (typeof window.updatePlus === 'function') {
          document.querySelectorAll('.btn-shop[data-item-id]').forEach((btn) => {
            window.updatePlus(btn.dataset.itemId);
          });
        }
      })
      .catch(() => {
        if (switcher) switcher.classList.add('hidden');
      });
  }
  loadTranslations(lang);
});

/* ========================================================================
   SCROLL ANIMS (fade-up) + SMOOTH ANCHOR
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-up').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('animate'); });
    }, { threshold: 0.1 });
    observer.observe(el);
  });

  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"])');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    window.GD.smoothScrollTo(target);
    if (a.matches('nav .nav-link')) {
      document.querySelectorAll('nav .nav-link.is-active').forEach((x) => x.classList.remove('is-active'));
      a.classList.add('is-active');
    }
  }, { passive: false });
});

/* ========================================================================
   MENU MOBILE (panneau + overlay + focus trap)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  const closeBtn = document.getElementById('menu-close');
  if (!menuBtn || !mobileMenu || !overlay) return;

  const trap = window.GD.focusTrap(mobileMenu);
  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    trap.mount();
    const first = mobileMenu.querySelector('a,button'); if (first) first.focus();
  };
  const closeMenu = () => {
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    overlay.addEventListener('transitionend', () => overlay.classList.add('hidden'), { once: true });
    mobileMenu.addEventListener('transitionend', () => { mobileMenu.classList.add('hidden'); }, { once: true });
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    trap.unmount();
    menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => {
    menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  overlay.addEventListener('click', closeMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') closeMenu();
  });
});

/* ========================================================================
   NAV — Surbrillance au clic + Scroll-Spy
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const clearActive = () => {
    document.querySelectorAll('nav .nav-link.is-active, nav .nav-link[aria-current="page"]').forEach((el) => {
      el.classList.remove('is-active'); el.removeAttribute('aria-current');
    });
  };
  const setActive = (el) => {
    clearActive();
    if (el) { el.classList.add('is-active'); el.setAttribute('aria-current', 'page'); }
  };

  document.querySelectorAll('nav .nav-link').forEach((el) => {
    el.addEventListener('click', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      setActive(el);
    });
  });

  const mapping = new Map();
  document.querySelectorAll('nav .nav-link[href*="#"]').forEach((a) => {
    const id = a.getAttribute('href').split('#')[1];
    const sec = id && document.getElementById(id);
    if (sec) mapping.set(sec, a);
  });
  if (mapping.size) {
    const io = new IntersectionObserver((entries) => {
      let best = null;
      for (const e of entries) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      }
      if (best) setActive(mapping.get(best.target));
    }, { rootMargin: '0px 0px -55% 0px', threshold: [0.25, 0.5, 0.75] });
    mapping.forEach((_, sec) => io.observe(sec));
  }

  // Accessibilité : sous-menu “Boutique”
  document.querySelectorAll('nav .relative.group').forEach((grp) => {
    const submenu = grp.querySelector('ul');
    if (!submenu) return;
    grp.addEventListener('focusin', () => submenu.classList.remove('hidden'));
    grp.addEventListener('focusout', (e) => {
      if (!grp.contains(e.relatedTarget)) submenu.classList.add('hidden');
    });
  });
});

/* ========================================================================
   VIDÉOS SÉQUENTIELLES + AUDIO AU GESTE
   ===================================================================== */
function fullyVisible(el) {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.left >= 0
         && r.bottom <= (window.innerHeight || document.documentElement.clientHeight)
         && r.right <= (window.innerWidth || document.documentElement.clientWidth);
}
// Fonction universelle de gestion des vidéos
function initVideoManager(videoIds) {
  const videos = videoIds.map((id) => document.getElementById(id)).filter(Boolean);
  if (videos.length === 0) return;
  
  let current = 0;
  let audioOK = false;
  let playSeq;
  const isSequenceMode = videos.length > 1;

  videos.forEach((vid) => {
    vid.dataset.userPaused = 'false';
    vid.dataset.autoPaused = 'false';
    
    // Créer un wrapper pour la vidéo et son titre (si pas déjà fait)
    let wrapper = vid.closest('.video-section-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'video-section-wrapper';
      wrapper.style.cssText = `
        background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 16px;
        padding: 20px;
        margin: 16px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      `;
      
      // Structure actuelle : div.relative.group > video + button + p
      const currentContainer = vid.parentNode; // div.relative.group
      const grandParent = currentContainer.parentNode;
      
      // Insérer le wrapper avant le container actuel
      grandParent.insertBefore(wrapper, currentContainer);
      
      // Déplacer le container dans le wrapper
      wrapper.appendChild(currentContainer);
      
      // Chercher le titre qui suit
      let titleElement = wrapper.nextElementSibling;
      while (titleElement) {
        if (titleElement.tagName === 'P' && titleElement.classList.contains('text-center')) {
          // Déplacer le titre dans le wrapper
          wrapper.appendChild(titleElement);
          titleElement.style.marginTop = '24px';
          titleElement.style.marginBottom = '0';
          titleElement.style.paddingTop = '12px';
          titleElement.style.borderTop = '1px solid rgba(139, 92, 246, 0.1)';
          
          // Réappliquer les traductions sur le titre déplacé
          if (titleElement.hasAttribute('data-i18n')) {
            // Déclencher la retraduction via le système existant
            if (window.updateTranslations && typeof window.updateTranslations === 'function') {
              window.updateTranslations();
            } else if (window.i18n && window.i18n.update) {
              window.i18n.update();
            } else {
              // Fallback : déclencher un événement pour forcer la retraduction
              document.dispatchEvent(new CustomEvent('translatePage'));
            }
          }
          break;
        }
        titleElement = titleElement.nextElementSibling;
      }
    }
    
    // Style pour la vidéo
    vid.style.border = '1px solid rgba(139, 92, 246, 0.3)';
    vid.style.borderRadius = '12px';
    vid.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
    vid.style.transition = 'all 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
    vid.style.width = '100%';
    vid.style.display = 'block';
    
    const addClass = () => {
      vid.classList.add('scale-105', 'z-10');
      vid.style.borderColor = 'rgba(139, 92, 246, 0.6)';
      vid.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.3)';
      // Effet sur le wrapper aussi
      const wrapper = vid.closest('.video-section-wrapper');
      if (wrapper) {
        wrapper.style.borderColor = 'rgba(139, 92, 246, 0.4)';
        wrapper.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.2)';
      }
    };
    const removeClass = () => {
      vid.classList.remove('scale-105', 'z-10');
      vid.style.borderColor = 'rgba(139, 92, 246, 0.3)';
      vid.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      // Restaurer le wrapper
      const wrapper = vid.closest('.video-section-wrapper');
      if (wrapper) {
        wrapper.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        wrapper.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      }
    };
    
    vid.addEventListener('play', () => { 
      addClass(); 
      vid.dataset.userPaused = 'false'; 
      vid.dataset.autoPaused = 'false'; 
    });
    vid.addEventListener('playing', addClass);
    vid.addEventListener('pause', () => { 
      removeClass(); 
      if (vid.dataset.autopausing === 'true') { 
        vid.dataset.autopausing = 'false'; 
      } else { 
        vid.dataset.userPaused = 'true'; 
      } 
    });
    vid.addEventListener('ended', removeClass);
  });

  // Observer pour la visibilité
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const vid = entry.target;
      if (!entry.isIntersecting) {
        if (!vid.paused) {
          vid.dataset.autopausing = 'true';
          vid.dataset.autoPaused = 'true';
          vid.pause();
          vid.classList.remove('scale-105', 'z-10');
        }
      } else if (vid.dataset.autoPaused === 'true' && vid.dataset.userPaused !== 'true') {
        vid.play();
        vid.dataset.autoPaused = 'false';
      }
    });
  }, { threshold: 0.2 });
  
  videos.forEach((vid) => visibilityObserver.observe(vid));

  function updateBtn(vid) {
    const b = document.querySelector(`.mute-btn[data-video="${vid.id}"]`);
    if (b) b.innerHTML = vid.muted ? '🔇' : '🔊';
  }

  const enableAudio = () => {
    if (audioOK) return;
    audioOK = true;
    // En mode boucle, on utilise la première vidéo
    const v = isSequenceMode ? videos[current] : videos[0];
    if (v && !v.paused) { 
      v.muted = false; 
      updateBtn(v); 
    }
  };

  ['click', 'touchstart', 'keydown', 'wheel'].forEach((evt) => {
    window.addEventListener(evt, enableAudio, { once: true, passive: true });
  });

  // Gestion des boutons mute
  document.querySelectorAll('.mute-btn').forEach((btn) => {
    const vid = videos.find((v) => v.id === btn.dataset.video);
    if (!vid) return;
    btn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      vid.muted = !vid.muted; 
      updateBtn(vid); 
    });
  });

  function start(vid) {
    vid.muted = !audioOK;
    vid.currentTime = 0;
    vid.play().then(() => { 
      if (audioOK) vid.muted = false; 
      updateBtn(vid); 
    }).catch(() => { 
      vid.muted = true; 
      vid.play(); 
      updateBtn(vid); 
    });
    
    // Mode boucle pour vidéo unique, séquence pour multiple
    if (isSequenceMode) {
      vid.onended = () => { 
        current += 1; 
        if (current < videos.length) playSeq(current); 
      };
    } else {
      vid.loop = true;
      vid.onended = null;
    }
  }

  if (isSequenceMode) {
    // Mode séquence : jouer les vidéos l'une après l'autre
    playSeq = (idx) => {
      const vid = videos[idx];
      if (!vid) return;
      videos.forEach((v, i) => { if (i !== idx) { v.pause(); v.currentTime = 0; } });
      const io = new IntersectionObserver((ent) => {
        if (ent[0].isIntersecting && fullyVisible(vid)) { 
          io.disconnect(); 
          start(vid); 
        }
      }, { threshold: 1 });
      io.observe(vid);
    };

    videos.forEach((vid, idx) => {
      vid.addEventListener('click', () => {
        if (vid.paused) { 
          if (!audioOK) enableAudio(); 
          current = idx; 
          start(vid); 
        } else { 
          vid.pause(); 
        }
      });
    });

    if (videos.length) playSeq(current);
  } else {
    // Mode boucle : démarrer la vidéo unique quand visible
    const vid = videos[0];
    
    // Ajouter l'événement click
    vid.addEventListener('click', () => {
      if (vid.paused) { 
        if (!audioOK) enableAudio(); 
        start(vid); 
      } else { 
        vid.pause(); 
      }
    });
    
    // Observer pour démarrer automatiquement quand visible
    const startObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        startObserver.disconnect();
        start(vid);
      }
    }, { threshold: 0.1 });
    
    startObserver.observe(vid);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Vidéos de es-tu-game.php (séquence)
  initVideoManager(['video1', 'video2', 'video3']);
  
  // Vidéo de boutique.php (boucle)
  initVideoManager(['video4']);
});

/* ========================================================================
   BOUTIQUE — quantités + multiplicateur + Swiper + Fancybox
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const updatePlus = (id) => {
    const qty = parseInt(document.getElementById(`qty-${id}`)?.innerHTML || '1', 10);
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const hidePrice = addBtn?.dataset.hidePrice !== undefined;
    const unitPrice = addBtn ? parseFloat(addBtn.dataset.itemPrice || '0') : 0;
    const tr = window.i18n?.product || {};
    const addText = tr.add || 'Ajouter au panier';

    if (addBtn) {
      const label = addBtn.querySelector('[data-i18n="product.add"]');
      let priceSpan = addBtn.querySelector('.price-text');
      if (!priceSpan) {
        priceSpan = document.createElement('span');
        priceSpan.className = 'price-text';
        addBtn.append(' ', priceSpan);
      }
      addBtn.disabled = false;
      addBtn.title = '';
      if (label) label.innerHTML = addText;
      priceSpan.innerHTML = (hidePrice || !unitPrice) ? '' : `— ${unitPrice * qty} $`;
    }
  };
  window.updatePlus = updatePlus;

  // +/- quantité
  document.querySelectorAll('.quantity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const qtySpan = document.getElementById(`qty-${id}`);
      if (!qtySpan) return;
      let qty = parseInt(qtySpan.innerHTML, 10) || 1;
      if (btn.classList.contains('minus')) qty = Math.max(1, qty - 1);
      else qty += 1;
      qtySpan.innerHTML = qty;
      const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
      if (addBtn) addBtn.setAttribute('data-item-quantity', String(qty));
      updatePlus(id);
    });
  });

  // Init par carte
  document.querySelectorAll('.quantity-selector').forEach((sel) => {
    updatePlus(sel.dataset.id);
  });

  // Produits sans sélecteur de quantité
  document.querySelectorAll('.btn-shop[data-item-id]').forEach((btn) => {
    const id = btn.dataset.itemId;
    if (!document.querySelector(`.quantity-selector[data-id="${id}"]`)) {
      updatePlus(id);
    }
  });

  // Sélecteurs de multiplicateur (sur fiche produit)
  document.querySelectorAll('.multiplier-select').forEach((sel) => {
    const id = sel.dataset.target;
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const update = () => {
      const qty = parseInt(document.getElementById(`qty-${id}`)?.innerHTML || '1', 10);
      if (addBtn) {
        addBtn.setAttribute('data-item-custom1-value', sel.value);
        addBtn.setAttribute('data-item-quantity', String(qty));
      }
      updatePlus(id);
    };
    update();
    sel.addEventListener('change', update);
  });

  // Swiper
  document.querySelectorAll('.swiper').forEach((sw) => {
    if (sw.classList.contains('swiper-thumbs')) return;
    const container = sw.parentElement;
    const thumbsEl = container.querySelector('.swiper-thumbs');
    const opts = {
      loop: true,
      autoplay: { delay: 5000 },
      pagination: { el: sw.querySelector('.swiper-pagination'), clickable: true },
      navigation: { nextEl: sw.querySelector('.swiper-button-next'), prevEl: sw.querySelector('.swiper-button-prev') },
      on: {
        slideChange() {
          const videos = this.slides.map((s) => s.querySelector('video')).filter(Boolean);
          videos.forEach((v) => { v.pause(); v.currentTime = 0; });
          const active = this.slides[this.activeIndex].querySelector('video');
          if (active) {
            this.autoplay.stop();
            active.play();
            active.onended = () => { this.autoplay.start(); };
          } else if (this.autoplay) {
            this.autoplay.start();
          }
        },
      },
    };
    if (thumbsEl) {
      const thumbsSwiper = new Swiper(thumbsEl, { slidesPerView: 4, freeMode: true, watchSlidesProgress: true });
      opts.thumbs = { swiper: thumbsSwiper };
    }
    const swiper = new Swiper(sw, opts);
    swiper.emit('slideChange');
  });

  // Orientation for media
  const setOrientation = (el) => {
    const w = el.videoWidth || el.naturalWidth;
    const h = el.videoHeight || el.naturalHeight;
    if (!w || !h) return;
    if (w < h) el.classList.add('portrait');
  };
  document.querySelectorAll('.product-media').forEach((el) => {
    if (el.tagName === 'VIDEO') {
      el.addEventListener('loadedmetadata', () => setOrientation(el), { once: true });
    } else if (el.complete) {
      setOrientation(el);
    } else {
      el.addEventListener('load', () => setOrientation(el), { once: true });
    }
  });

  // Fancybox
  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      backdrop: 'blur',
      dragToClose: true,
      closeButton: 'top',
      placeFocusBack: true,
      on: { close: () => window.history.back() },
    });
  }
});

/* ========================================================================
   LAZYLOAD IMG
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (!('loading' in HTMLImageElement.prototype)) {
    const imgs = document.querySelectorAll('img[loading="lazy"]');
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
  }
});

/* ========================================================================
   BACK TO TOP + COLLAPSE
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const back = document.getElementById('back-to-top');
  if (back) {
    back.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const toggleBack = throttle(() => {
      back.classList.toggle('opacity-0', window.pageYOffset < 500);
      back.classList.toggle('pointer-events-none', window.pageYOffset < 500);
    }, 100);
    window.addEventListener('scroll', toggleBack, { passive: true });
    toggleBack();
  }

  // Accordéons “data-collapse”
  document.querySelectorAll('[data-collapse]').forEach((btn) => {
    const target = document.querySelector(btn.dataset.collapse);
    if (!target) return;
    btn.setAttribute('aria-expanded', 'false');
    target.hidden = true;

    const open = () => {
      target.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      target.style.height = 'auto';
      const h = `${target.clientHeight}px`;
      target.style.height = '0px';
      requestAnimationFrame(() => { target.style.height = h; });
      target.addEventListener('transitionend', () => { target.style.height = 'auto'; }, { once: true });
    };
    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      target.style.height = `${target.clientHeight}px`;
      requestAnimationFrame(() => { target.style.height = '0px'; });
      target.addEventListener('transitionend', () => { target.hidden = true; target.style.height = ''; }, { once: true });
    };

    btn.addEventListener('click', (e) => { e.preventDefault(); (btn.getAttribute('aria-expanded') === 'true' ? close : open)(); });
  });
});

/* ========================================================================
   HEADER SHRINK (ombre/flou au scroll)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = (() => {
    const throttled = (fn, wait = 80) => {
      let t = 0; return () => { const n = Date.now(); if (n - t > wait) { t = n; fn(); } };
    };
    return throttled(() => {
      header.classList.toggle('shadow-2xl', window.pageYOffset > 8);
      header.classList.toggle('backdrop-blur-md', window.pageYOffset > 8);
    });
  })();
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});



