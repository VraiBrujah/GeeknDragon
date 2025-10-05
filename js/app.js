/**
 * Application Principale Geek & Dragon - Standards v2.1.0
 * 
 * REFACTORISATION v2.1.0 - Format Standardisé :
 * ===============================================
 * - Documentation française complète avec JSDoc
 * - Nomenclature française pour améliorer la lisibilité
 * - Architecture modulaire avec patterns standards
 * - Intégration optimisée des composants e-commerce
 * 
 * RESPONSABILITÉS PRINCIPALES :
 * =============================
 * - Gestion de la navigation et interface utilisateur principale
 * - Internationalisation français/anglais dynamique
 * - Intégration Swiper pour carousels produits immersifs
 * - Système de vidéos séquentielles pour contenu héroïque
 * - Utilitaires DOM réutilisables haute performance
 * - Intégration CMP pour conformité RGPD/CCPA
 * 
 * ARCHITECTURE PATTERNS :
 * ======================
 * - Module Pattern : Encapsulation des fonctionnalités
 * - Observer Pattern : Gestion des événements DOM
 * - Strategy Pattern : Multiple stratégies d'affichage (mobile/desktop)
 * - Factory Pattern : Création d'éléments DOM optimisée
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Standards Français
 * @since 1.0.0
 * @category Application
 * @package GeeknDragon\JavaScript
 */

/* global Swiper, Fancybox */
/* eslint-disable */

/* ========================================================================
   UTILITAIRES GÉNÉRIQUES HAUTE PERFORMANCE
   ===================================================================== */
(() => {
  /**
   * Sélecteurs DOM optimisés pour performance
   * Encapsulent querySelector avec gestion d'erreurs intégrée
   */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /**
   * Throttle - Limite la fréquence d'exécution d'une fonction
   * Optimisé pour les événements haute fréquence (scroll, resize)
   * 
   * @param {Function} fn Fonction à throttler
   * @param {number} wait Délai minimum en millisecondes
   * @returns {Function} Fonction throttlée
   */
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

  // Normalisation des champs personnalisés Snipcart (langue, multiplicateur, ...)
  const CUSTOM_FIELD_INDEXES = Object.freeze({
    language: 1,
    multiplier: 2,
  });

  const normalizeCustomRole = (role) => (typeof role === 'string' ? role.trim().toLowerCase() : '');

  const findCustomFieldIndexOnButton = (button, role) => {
    const normalizedRole = normalizeCustomRole(role);
    if (!button || !normalizedRole) return null;

    const attrs = Array.from(button.attributes || []);
    for (const attr of attrs) {
      const match = /^data-item-custom(\d+)-role$/i.exec(attr.name);
      if (!match) continue;
      if (normalizeCustomRole(attr.value) !== normalizedRole) continue;
      const parsed = parseInt(match[1], 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  };

  const resolveCustomFieldIndex = (element, { button = null, fallbackIndexes = [], position = 0 } = {}) => {
    if (!element) return null;

    const attrIndex = parseInt(element.dataset?.customIndex ?? '', 10);
    if (Number.isFinite(attrIndex) && attrIndex > 0) {
      return attrIndex;
    }

    const roleFromElement = normalizeCustomRole(
      (element.dataset?.itemCustomRole ?? element.dataset?.customRole) || '',
    );
    if (roleFromElement) {
      const buttonIndex = findCustomFieldIndexOnButton(button, roleFromElement);
      if (Number.isFinite(buttonIndex) && buttonIndex > 0) {
        return buttonIndex;
      }
      const defaultIndex = CUSTOM_FIELD_INDEXES[roleFromElement];
      if (Number.isFinite(defaultIndex) && defaultIndex > 0) {
        return defaultIndex;
      }
    }

    if (Array.isArray(fallbackIndexes) && fallbackIndexes.length > 0) {
      const candidate = fallbackIndexes[position];
      if (Number.isFinite(candidate) && candidate > 0) {
        return candidate;
      }
      const last = fallbackIndexes[fallbackIndexes.length - 1];
      if (Number.isFinite(last) && last > 0) {
        return last;
      }
    }

    return null;
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
    localStorage.setItem('snipcartLanguage', safe);
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

  // Snipcart ready (polling léger)
  const whenSnipcart = (cb) => {
    if (window.Snipcart && window.Snipcart.store && window.Snipcart.api) { cb(); return; }
    const int = setInterval(() => {
      if (window.Snipcart && window.Snipcart.store && window.Snipcart.api) {
        clearInterval(int); cb();
      }
    }, 200);
  };
  window.whenSnipcart = whenSnipcart;

  // Expose utilitaires
  window.GD = Object.assign(window.GD || {}, {
    qs,
    qsa,
    throttle,
    debounce,
    createEl,
    getLang,
    setLang,
    smoothScrollTo,
    getHeaderOffset,
    focusTrap,
    customFields: {
      indexesByRole: CUSTOM_FIELD_INDEXES,
      normalizeRole: normalizeCustomRole,
      findIndexOnButton: findCustomFieldIndexOnButton,
      resolveIndex: resolveCustomFieldIndex,
    },
  });
})();

/* ========================================================================
   HAUTEUR D’EN-TÊTE → variables CSS (global + Snipcart)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;
  const setHeaderVars = () => {
    const h = header.getBoundingClientRect().height || 96;
    // utilisé par ton site
    document.documentElement.style.setProperty('--header-height', `${h}px`);
    // utilisé par snipcart-custom.css (modal/summary sticky)
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
  whenSnipcart(() => window.Snipcart.api.session.setLanguage(lang));

  document.querySelectorAll('.flag-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const picked = btn.dataset.lang;
      // Sauvegarder la langue choisie
      window.GD.setLang(picked);
      
      // Construire la nouvelle URL avec la bonne langue
      let newUrl = window.location.pathname;
      if (picked !== 'fr') {
        // Ajouter le paramètre lang pour les langues autres que français
        const params = new URLSearchParams(window.location.search);
        params.set('lang', picked);
        newUrl += '?' + params.toString();
      }
      // Ajouter le fragment s'il existe
      if (window.location.hash) {
        newUrl += window.location.hash;
      }
      
      // Naviguer vers la nouvelle URL
      window.location.href = newUrl;
    });
  });

  function loadTranslations(current) {
    fetch(`/lang/${current}.json`)
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
          // On garde le HTML déjà converti, pas besoin de traduction côté JS
          // Le PHP gère déjà la traduction avec le bon format HTML
        });
        document.querySelectorAll('[data-alt-fr]').forEach((el) => {
          const target = current === 'en' ? el.dataset.altEn : el.dataset.altFr;
          if (target) el.setAttribute('alt', target);
        });

        // Boutons Snipcart (nom/description + libellé custom)
        const multiplierLabelPattern = /(multiplicat(eur|or)|multiplier)/i;
        const customFieldHelpers = window.GD?.customFields || {};
        const findCustomIndexByRole =
          typeof customFieldHelpers.findIndexOnButton === 'function'
            ? customFieldHelpers.findIndexOnButton
            : (() => null);

        document.querySelectorAll('.snipcart-add-item').forEach((btn) => {
          if (current === 'en') {
            if (btn.dataset.itemNameEn) btn.setAttribute('data-item-name', btn.dataset.itemNameEn);
            if (btn.dataset.itemDescriptionEn) {
              btn.dataset.itemDescription = btn.dataset.itemDescriptionEn;
              btn.setAttribute('data-item-description', btn.dataset.itemDescriptionEn);
            }
          } else {
            if (btn.dataset.itemNameFr) btn.setAttribute('data-item-name', btn.dataset.itemNameFr);
            if (btn.dataset.itemDescriptionFr) {
              btn.dataset.itemDescription = btn.dataset.itemDescriptionFr;
              btn.setAttribute('data-item-description', btn.dataset.itemDescriptionFr);
            }
          }
          const rawMultiplierIndex = findCustomIndexByRole(btn, 'multiplier');
          const multiplierIndex = (() => {
            const parsed = Number.parseInt(rawMultiplierIndex, 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
          })();
          const hasCustom =
            multiplierIndex !== null
            && btn.hasAttribute(`data-item-custom${multiplierIndex}-name`)
            && data?.product?.multiplier;
          if (hasCustom) {
            const currentLabel = btn.getAttribute(`data-item-custom${multiplierIndex}-name`) || '';
            const datasetRole = btn.dataset[`itemCustom${multiplierIndex}Role`] || '';
            const explicitMultiplierFlag =
              (datasetRole && datasetRole.toLowerCase() === 'multiplier')
              || btn.hasAttribute('data-multiplier-label')
              || (btn.dataset.multiplierLabel
                && ['1', 'true', 'yes', 'oui'].includes(btn.dataset.multiplierLabel.toLowerCase()));
            const labelLooksLikeMultiplier = multiplierLabelPattern.test(currentLabel);

            // On ne remplace le libellé que s'il est explicitement identifié comme un multiplicateur
            // afin d'éviter d'écraser d'autres champs personnalisés (ex. sélecteur de langue).
            if (explicitMultiplierFlag || labelLooksLikeMultiplier) {
              btn.setAttribute(`data-item-custom${multiplierIndex}-name`, data.product.multiplier);
            }
          }
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
document.addEventListener('DOMContentLoaded', () => {
  // EXCLUSION EXPLICITE : Ignorer les vidéos hero gérées par hero-videos.js
  const videos = ['video1', 'video2', 'video3']
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .filter(video => {
      // Exclure les vidéos qui sont dans un container .hero-videos
      return !video.closest('.hero-videos');
    });
  let current = 0;
  let audioOK = false;
  let playSeq;

  videos.forEach((vid) => {
    // DOUBLE PROTECTION : Vérifier que ce n'est pas une vidéo hero
    if (vid.closest('.hero-videos')) {
      log('Skipping hero video from app.js management:', vid);
      return;
    }
    
    vid.dataset.userPaused = 'false';
    vid.dataset.autoPaused = 'false';
    const addClass = () => vid.classList.add('scale-105', 'z-10');
    const removeClass = () => vid.classList.remove('scale-105', 'z-10');
    vid.addEventListener('play', () => { addClass(); vid.dataset.userPaused = 'false'; vid.dataset.autoPaused = 'false'; });
    vid.addEventListener('playing', addClass);
    vid.addEventListener('pause', () => { removeClass(); if (vid.dataset.autopausing === 'true') { vid.dataset.autopausing = 'false'; } else { vid.dataset.userPaused = 'true'; } });
    vid.addEventListener('ended', removeClass);
  });

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const vid = entry.target;
      
      // PROTECTION : Ignorer les vidéos gérées par hero-videos.js
      if (vid.closest('[data-managed-by="hero-videos"]')) {
        return;
      }
      
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
  // Observer seulement les vidéos non-hero (protection supplémentaire)
  videos.forEach((vid) => {
    if (!vid.closest('[data-managed-by="hero-videos"]') && !vid.closest('.hero-videos')) {
      visibilityObserver.observe(vid);
    }
  });

  function updateBtn(vid) {
    const b = document.querySelector(`.mute-btn[data-video="${vid.id}"]`);
    if (b) b.textContent = vid.muted ? '🔇' : '🔊';
  }

  const enableAudio = () => {
    if (audioOK) return;
    audioOK = true;
    const v = videos[current];
    if (v && !v.paused) { v.muted = false; updateBtn(v); }
  };
  ['click', 'touchstart', 'keydown', 'wheel'].forEach((evt) => window.addEventListener(evt, enableAudio, { once: true, passive: true }));
  document.querySelectorAll('.mute-btn').forEach((btn) => {
    const vid = videos.find((v) => v.id === btn.dataset.video);
    if (!vid) return;
    btn.addEventListener('click', (e) => { e.stopPropagation(); vid.muted = !vid.muted; updateBtn(vid); });
  });

  function start(vid) {
    vid.muted = !audioOK;
    vid.currentTime = 0;
    vid.play().then(() => { if (audioOK) vid.muted = false; updateBtn(vid); })
      .catch(() => { vid.muted = true; vid.play(); updateBtn(vid); });
    vid.onended = () => { current += 1; if (current < videos.length) playSeq(current); };
  }

  playSeq = (idx) => {
    const vid = videos[idx];
    if (!vid) return;
    videos.forEach((v, i) => { if (i !== idx) { v.pause(); v.currentTime = 0; } });
    const io = new IntersectionObserver((ent) => {
      if (ent[0].isIntersecting && fullyVisible(vid)) { io.disconnect(); start(vid); }
    }, { threshold: 1 });
    io.observe(vid);
  };

  videos.forEach((vid, idx) => {
    vid.addEventListener('click', () => {
      if (vid.paused) { if (!audioOK) enableAudio(); current = idx; start(vid); } else { vid.pause(); }
    });
  });

  if (videos.length) playSeq(current);
});

/* ========================================================================
   BOUTIQUE — quantités + multiplicateur + Swiper + Fancybox
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const stock = window.stock || {};

  const toPositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const customFieldHelpers = window.GD?.customFields || {};
  const resolveCustomIndex =
    typeof customFieldHelpers.resolveIndex === 'function'
      ? customFieldHelpers.resolveIndex
      : null;

  const updatePlus = (id) => {
    const max = stock[id];
    const qty = parseInt(document.getElementById(`qty-${id}`)?.textContent || '1', 10);
    const plusBtn = document.querySelector(`.quantity-btn.plus[data-target="${id}"]`);
    const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
    const over = max != null && (max <= 0 || qty >= max);
    const hidePrice = addBtn?.dataset.hidePrice !== undefined;
    const unitPrice = addBtn ? parseFloat(addBtn.dataset.itemPrice || '0') : 0;
    const tr = window.i18n?.product || {};
    const addText = tr.add || 'Ajouter';
    const insufficientText = tr.insufficientStock || 'Stock insuffisant';

    if (plusBtn) {
      const nextQty = qty + 1;
      plusBtn.disabled = max != null && (max <= 0 || nextQty > max);
      plusBtn.title = plusBtn.disabled ? insufficientText : '';
    }
    if (addBtn) {
      const label = addBtn.querySelector('[data-i18n="product.add"]');
      let priceSpan = addBtn.querySelector('.price-text');
      if (!priceSpan) {
        priceSpan = document.createElement('span');
        priceSpan.className = 'price-text';
        addBtn.append(' ', priceSpan);
      }
      addBtn.disabled = over;
      addBtn.title = over ? insufficientText : '';
      if (label) label.textContent = over ? insufficientText : addText;
      priceSpan.textContent = (over || hidePrice || !unitPrice) ? '' : `— ${unitPrice * qty} $`;
    }
  };
  window.updatePlus = updatePlus;

  // +/- quantité
  document.querySelectorAll('.quantity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const qtySpan = document.getElementById(`qty-${id}`);
      if (!qtySpan) return;
      let qty = parseInt(qtySpan.textContent, 10) || 1;
      const max = stock[id];
      if (btn.classList.contains('minus')) qty = Math.max(1, qty - 1);
      else if (max == null || qty + 1 <= max) qty += 1;
      qtySpan.textContent = qty;
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

  // Synchronise les sélecteurs (multiplicateur, langue, ...)
  const bindCustomSelect = (selector, { onUpdate } = {}) => {
    document.querySelectorAll(selector).forEach((sel) => {
      const id = sel.dataset.target;
      if (!id) return;
      const addBtn = document.querySelector(`.btn-shop[data-item-id="${id}"]`);
      const resolvedIndex = resolveCustomIndex ? resolveCustomIndex(sel, { button: addBtn }) : null;
      let fieldIndex = toPositiveInt(resolvedIndex);
      if (!fieldIndex) {
        fieldIndex = toPositiveInt(sel.dataset.customIndex) ?? 1;
      }
      sel.dataset.customIndex = String(fieldIndex);
      const update = () => {
        const qty = parseInt(document.getElementById(`qty-${id}`)?.textContent || '1', 10);
        if (addBtn) {
          addBtn.setAttribute(`data-item-custom${fieldIndex}-value`, sel.value);
          addBtn.setAttribute('data-item-quantity', String(qty));
          if (typeof onUpdate === 'function') {
            onUpdate({ id, addBtn, select: sel, value: sel.value, index: fieldIndex });
          }
        }
        updatePlus(id);
      };
      update();
      sel.addEventListener('change', update);
    });
  };

  bindCustomSelect('.multiplier-select', {
    onUpdate: ({ addBtn }) => {
      const lang = document.documentElement.lang;
      const datasetKey = lang === 'en' ? 'itemNameEn' : 'itemNameFr';
      // On conserve le libellé de base pour Snipcart tout en le stockant pour des usages futurs.
      const storedBase = addBtn.dataset.gdBaseName || addBtn.getAttribute('data-item-name') || '';
      if (!addBtn.dataset.gdBaseName && storedBase) {
        addBtn.dataset.gdBaseName = storedBase;
      }
      const localizedBaseName = addBtn.dataset[datasetKey] || addBtn.dataset.gdBaseName || storedBase;
      if (localizedBaseName) {
        addBtn.setAttribute('data-item-name', localizedBaseName);
      }
    },
  });

  bindCustomSelect('.language-select');
  bindCustomSelect('.triptych-select');

  // Swiper
  document.querySelectorAll('.swiper').forEach((sw) => {
    if (sw.classList.contains('swiper-thumbs')) return;
    const container = sw.parentElement;
    const thumbsEl = container.querySelector('.swiper-thumbs');
    if (thumbsEl) {
      const thumbsSwiper = new Swiper(thumbsEl, { slidesPerView: 4, freeMode: true, watchSlidesProgress: true });
      // eslint-disable-next-line no-new
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        navigation: { nextEl: sw.querySelector('.swiper-button-next'), prevEl: sw.querySelector('.swiper-button-prev') },
        thumbs: { swiper: thumbsSwiper },
      });
    } else {
      // eslint-disable-next-line no-new
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        navigation: { nextEl: sw.querySelector('.swiper-button-next'), prevEl: sw.querySelector('.swiper-button-prev') },
      });
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
   SNIPCART — évite double ouverture + badges actifs
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const cartBtns = document.querySelectorAll('.snipcart-checkout');
  const accountBtns = document.querySelectorAll('.snipcart-customer-signin');

  const cartVisible = () => window.Snipcart?.store?.getState()?.cart?.status === 'visible';
  const accountVisible = () => window.Snipcart?.store?.getState()?.customer?.status === 'visible';

  cartBtns.forEach((btn) => btn.addEventListener('click', (e) => {
    if (!window.Snipcart?.store || !window.Snipcart?.api?.theme) return;
    if (cartVisible()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      window.Snipcart.api.theme.cart.close();
      e.currentTarget.blur();
    }
  }));
  accountBtns.forEach((btn) => btn.addEventListener('click', (e) => {
    if (!window.Snipcart?.store || !window.Snipcart?.api?.theme) return;
    if (accountVisible()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      window.Snipcart.api.theme.customer.close();
      e.currentTarget.blur();
    }
  }));

  const setBtnState = () => {
    const cv = cartVisible();
    const av = accountVisible();
    cartBtns.forEach((b) => b.classList.toggle('is-active', cv));
    accountBtns.forEach((b) => b.classList.toggle('is-active', av));
  };
  window.addEventListener('snipcart.ready', setBtnState);
  window.addEventListener('snipcart.opened', setBtnState);
  window.addEventListener('snipcart.closed', setBtnState);

  const hookStore = () => { try { const { store } = window.Snipcart; if (store) store.subscribe(() => setBtnState()); } catch (_) {} };
  (function poll() { if (window.Snipcart && window.Snipcart.store) hookStore(); else setTimeout(poll, 300); }());
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

/* ========================================================================
   HEADER MODERNE — Animation navigation icônes au scroll
   ===================================================================== */
(() => {
  const iconNav = document.getElementById('icon-nav');
  if (!iconNav) return;

  let lastScrollY = window.scrollY;
  let isHidden = false;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollThreshold = 100; // Commence à cacher après 100px

    if (scrollingDown && currentScrollY > scrollThreshold && !isHidden) {
      // Scroll vers le bas - cacher la nav
      iconNav.style.maxHeight = '0';
      iconNav.style.opacity = '0';
      iconNav.style.paddingTop = '0';
      iconNav.style.paddingBottom = '0';
      isHidden = true;
    } else if (!scrollingDown && isHidden) {
      // Scroll vers le haut - montrer la nav
      iconNav.style.maxHeight = '100px';
      iconNav.style.opacity = '1';
      iconNav.style.paddingTop = '';
      iconNav.style.paddingBottom = '';
      isHidden = false;
    }

    lastScrollY = currentScrollY;
  };

  const throttledScroll = window.GD.throttle(handleScroll, 100);
  window.addEventListener('scroll', throttledScroll, { passive: true });
});

/* ========================================================================
   SNIPCART — synchronisation au clic "Ajouter au panier"
   ===================================================================== */
(() => {
  const parseIndex = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const customFieldHelpers = window.GD?.customFields || {};
  const resolveCustomIndex =
    typeof customFieldHelpers.resolveIndex === 'function'
      ? customFieldHelpers.resolveIndex
      : null;

  const collectCustomFieldIndexes = (btn) => {
    const indexes = [];
    Array.from(btn.attributes).forEach((attr) => {
      const match = /^data-item-custom(\d+)-/i.exec(attr.name);
      if (!match) return;
      const parsed = parseInt(match[1], 10);
      if (Number.isFinite(parsed)) {
        indexes.push(parsed);
      }
    });
    return indexes.sort((a, b) => a - b);
  };

  const ensureSnipcartQtyPatch = () => {
    if (window.__snipcartQtyPatch === true) return;

    document.addEventListener('click', (event) => {
      const btn = event.target.closest('.snipcart-add-item');
      if (!btn) return;

      const id = btn.getAttribute('data-item-id') || btn.dataset.itemId;
      if (!id) return;

      const qtyEl = document.getElementById(`qty-${id}`);
      if (qtyEl) {
        const qty = parseInt(qtyEl.textContent, 10);
        if (!Number.isNaN(qty) && qty > 0) {
          btn.setAttribute('data-item-quantity', String(qty));
        }
      }

      const selects = Array.from(document.querySelectorAll('select[data-target]'))
        .filter((selectEl) => selectEl.dataset.target === id);

      if (selects.length) {
        const indexes = collectCustomFieldIndexes(btn);
        const baseNameFallback = btn.getAttribute('data-item-name') || '';
        const baseNameFr = btn.dataset.itemNameFr || baseNameFallback;
        const baseNameEn = btn.dataset.itemNameEn || baseNameFallback;

        selects.forEach((selectEl, position) => {
          let fieldIndex = null;
          if (resolveCustomIndex) {
            fieldIndex = resolveCustomIndex(selectEl, {
              button: btn,
              fallbackIndexes: indexes,
              position,
            });
          }
          if (!Number.isFinite(fieldIndex) || fieldIndex <= 0) {
            const attrIndex = parseIndex(selectEl.dataset.customIndex || '');
            fieldIndex = attrIndex
              ?? indexes[position]
              ?? indexes[indexes.length - 1]
              ?? (position + 1);
          }
          selectEl.dataset.customIndex = String(fieldIndex);
          const rawValue = selectEl.value == null ? '' : `${selectEl.value}`;
          let customValue = rawValue;

          if (selectEl.classList.contains('multiplier-select')) {
            const normalizedValue = rawValue && `${rawValue}`.trim() !== '' ? `${rawValue}` : '1';
            customValue = normalizedValue;

            if (baseNameFr && !btn.dataset.gdBaseNameFr) {
              btn.dataset.gdBaseNameFr = baseNameFr;
            }
            if (baseNameEn && !btn.dataset.gdBaseNameEn) {
              btn.dataset.gdBaseNameEn = baseNameEn;
            }

            const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
            const localizedBase = lang === 'en'
              ? (btn.dataset.gdBaseNameEn || baseNameEn)
              : (btn.dataset.gdBaseNameFr || baseNameFr);
            const storedBase = localizedBase
              || btn.dataset.gdBaseName
              || baseNameFallback
              || btn.getAttribute('data-item-name')
              || '';

            if (storedBase) {
              if (!btn.dataset.gdBaseName) {
                btn.dataset.gdBaseName = storedBase;
              }
              // On restaure systématiquement le nom de base pour Snipcart : le multiplicateur reste dans le champ personnalisé.
              btn.setAttribute('data-item-name', storedBase);
            }

            btn.dataset.gdMultiplier = normalizedValue;
          }

          btn.setAttribute(`data-item-custom${fieldIndex}-value`, customValue);
        });
      }
    }, { passive: true });

    window.__snipcartQtyPatch = true;
  };

  window.__ensureSnipcartQtyPatch = ensureSnipcartQtyPatch;

  // Synchronisation des selects avec les attributs Snipcart
  const syncSelectsWithSnipcart = () => {
    // Fonction pour synchroniser un select spécifique
    const syncSelect = (select) => {
      const targetId = select.dataset.target;
      const customIndex = select.dataset.customIndex;
      const snipcartBtn = document.querySelector(`.snipcart-add-item[data-item-id="${targetId}"]`);
      
      if (snipcartBtn && customIndex) {
        snipcartBtn.setAttribute(`data-item-custom${customIndex}-value`, select.value);
        // Synchronisation réussie des champs personnalisés
      }
    };

    // Synchroniser au changement
    document.querySelectorAll('select[data-target][data-custom-index]').forEach(select => {
      select.addEventListener('change', () => syncSelect(select));
      // Synchroniser aussi immédiatement pour la valeur par défaut
      syncSelect(select);
    });

    // Synchroniser avant chaque ajout au panier
    document.querySelectorAll('.snipcart-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.dataset.itemId || btn.getAttribute('data-item-id');
        const selects = document.querySelectorAll(`select[data-target="${targetId}"]`);
        selects.forEach(select => syncSelect(select));
        // Pré-synchronisation des champs avant ajout au panier
      });
    });
  };

  // Initialiser la synchronisation au chargement
  document.addEventListener('DOMContentLoaded', syncSelectsWithSnipcart);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureSnipcartQtyPatch, { once: true });
  } else {
    ensureSnipcartQtyPatch();
  }
})();

/* ========================================================================
   SNIPCART — cacher UNIQUEMENT "Multiplicateur/Multiplier" dans le panier
   (la quantité reste affichée)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('snipcart');
  if (!root) return;
});

// Verrouille le scroll de la page uniquement pour le panier/checkout (pas pour la facture)
const toggleSnipcartScroll = () => {
  const root = document.getElementById('snipcart');
  const inOrder = !!root?.querySelector('.snipcart-order');
  const visible = window.Snipcart?.store?.getState()?.cart?.status === 'visible';
  document.body.classList.toggle('snipcart-open', visible && !inOrder);
};

window.addEventListener('snipcart.opened', toggleSnipcartScroll);
window.addEventListener('snipcart.closed', toggleSnipcartScroll);
window.addEventListener('snipcart.ready', () => {
  const root = document.getElementById('snipcart');
  if (root) {
    new MutationObserver(toggleSnipcartScroll).observe(root, { childList: true, subtree: true });
  }
  toggleSnipcartScroll();
});

/* ========================================================================
   CMP (CONSENT MANAGEMENT PLATFORM) — Intégration e-commerce
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier le statut du CMP et ajuster les fonctionnalités
  const checkCmpStatus = () => {
    const htmlElement = document.documentElement;
    const cmpStatus = htmlElement.getAttribute('data-cmp-status');
    
    // Traitement silencieux des statuts CMP
    // Note: Status traités de manière silencieuse pour optimiser les performances
  };
  
  // Configuration des cookies e-commerce essentiels
  const ensureEssentialCookies = () => {
    // Ces cookies restent toujours disponibles pour le fonctionnement e-commerce
    const essentialCookies = [
      'snipcart_*', // Panier Snipcart
      'PHPSESSID', // Session PHP
      'lang_preference', // Langue utilisateur
      'cart_session' // Session panier local
    ];
    
    // Marquer les cookies essentiels comme exemptés
    essentialCookies.forEach(cookieName => {
      document.documentElement.setAttribute(`data-cookie-essential-${cookieName.replace('*', 'all')}`, 'true');
    });
  };
  
  // Gestionnaire de consentement personnalisé pour e-commerce
  const handleConsentUpdate = (event) => {
    const purposes = event.detail?.purposes || {};
    
    // Log silencieux - consentements mis à jour
    
    // Analytics (Google Analytics)
    if (purposes.analytics) {
      // Analytics autorisé
      // Le gtag sera mis à jour automatiquement via l'événement
    } else {
      // Analytics refusé
    }
    
    // Marketing (publicité, remarketing)
    if (purposes.marketing) {
      // Marketing autorisé
      // Activer les pixels Facebook/Google Ads si nécessaires
    } else {
      // Marketing refusé
    }
    
    // Fonctionnel (toujours accepté pour e-commerce)
    // Cookies fonctionnels maintenus pour e-commerce (silencieux)
    
    // Déclencher événement personnalisé pour d'autres modules
    document.dispatchEvent(new CustomEvent('gdConsentUpdate', {
      detail: { purposes, timestamp: Date.now() }
    }));
  };
  
  // Écouteur d'événements CMP
  document.addEventListener('cmpConsentUpdate', handleConsentUpdate);
  
  // Initialisation
  checkCmpStatus();
  ensureEssentialCookies();
  
  // Vérification périodique du statut CMP (au cas où)
  const statusInterval = setInterval(() => {
    const status = document.documentElement.getAttribute('data-cmp-status');
    if (status && status !== 'unknown') {
      clearInterval(statusInterval);
      checkCmpStatus();
    }
  }, 500);
  
  // Arrêter la vérification après 10 secondes max
  setTimeout(() => clearInterval(statusInterval), 10000);
});

/* ========================================================================
   EFFET TYPEWRITER POUR TITRES HERO (réutilisable)
   ===================================================================== */
(() => {
  /**
   * Initialise l'effet typewriter sur un titre hero
   * @param {string} selector - Sélecteur CSS du titre (défaut: '.hero-text h1')
   * @param {number} charDelay - Délai entre chaque caractère en ms (défaut: 50)
   * @param {number} startDelay - Délai avant le début de l'animation en ms (défaut: 500)
   */
  function initTypewriterTitle(selector = '.hero-text h1', charDelay = 50, startDelay = 500) {
    const heroTitle = document.querySelector(selector);
    if (heroTitle && !heroTitle.dataset.typed) {
      const text = heroTitle.textContent.trim();
      heroTitle.textContent = '';
      heroTitle.dataset.typed = 'true';

      // Sauvegarder l'attribut data-i18n original avant de le retirer
      if (heroTitle.hasAttribute('data-i18n')) {
        heroTitle.dataset.originalI18n = heroTitle.getAttribute('data-i18n');
        heroTitle.removeAttribute('data-i18n');
      }

      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          heroTitle.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, charDelay);
        }
      };

      setTimeout(typeWriter, startDelay);
    }
  }

  // Initialiser au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTypewriterTitle());
  } else {
    initTypewriterTitle();
  }

  // Relancer l'animation lors des changements de langue
  document.addEventListener('languageChanged', () => {
    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) {
      heroTitle.dataset.typed = false;

      // Restaurer l'attribut data-i18n original
      if (heroTitle.dataset.originalI18n) {
        heroTitle.setAttribute('data-i18n', heroTitle.dataset.originalI18n);
      }

      // Attendre que i18n mette à jour le contenu
      setTimeout(() => initTypewriterTitle(), 100);
    }
  });

  // Exporter la fonction pour utilisation manuelle si nécessaire
  window.initTypewriterTitle = initTypewriterTitle;
})();

/* ========================================================================
   STICKY NAVIGATION BOUTIQUE (shop-quick-links)
   Rend la navigation collante après scroll du hero pour améliorer la découverte
   ===================================================================== */
(() => {
  /**
   * Gère la navigation sticky pour shop-quick-links
   * - Devient fixe en haut après scroll du hero
   * - Animation slide-down fluide
   * - Indicateur de section active
   */
  class StickyShopNav {
    constructor() {
      this.nav = document.querySelector('.shop-quick-links');
      this.hero = document.querySelector('section.min-h-screen');
      this.links = this.nav ? Array.from(this.nav.querySelectorAll('a[href^="#"]')) : [];
      this.sections = [];
      this.isSticky = false;
      this.scrollThreshold = 0;

      if (!this.nav || !this.hero) return;

      this.init();
    }

    init() {
      // Calculer le seuil de déclenchement (hauteur du hero)
      this.updateScrollThreshold();

      // Collecter les sections ciblées par les liens
      this.links.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        const section = document.getElementById(targetId);
        if (section) {
          this.sections.push({ id: targetId, element: section, link });
        }
      });

      // Écouteurs d'événements
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
      window.addEventListener('resize', this.debounce(() => this.updateScrollThreshold(), 200));

      // Gestion des clics pour smooth scroll
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            const offsetTop = target.offsetTop - (this.isSticky ? this.nav.offsetHeight + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0') : 0);
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
          }
        });
      });

      // Vérification initiale
      this.handleScroll();
    }

    updateScrollThreshold() {
      if (this.hero) {
        this.scrollThreshold = this.hero.offsetHeight - 100; // Déclenche 100px avant la fin du hero
      }
    }

    handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset;

      // Toggle sticky state
      if (scrollY > this.scrollThreshold && !this.isSticky) {
        this.nav.classList.add('sticky-active');
        this.isSticky = true;
      } else if (scrollY <= this.scrollThreshold && this.isSticky) {
        this.nav.classList.remove('sticky-active');
        this.isSticky = false;
      }

      // Mise à jour de la section active
      if (this.isSticky) {
        this.updateActiveSection(scrollY);
      }
    }

    updateActiveSection(scrollY) {
      // Trouver la section actuellement visible
      let activeSection = null;
      const offset = this.nav.offsetHeight + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0') + 50;

      for (let i = this.sections.length - 1; i >= 0; i--) {
        const section = this.sections[i];
        if (scrollY >= section.element.offsetTop - offset) {
          activeSection = section;
          break;
        }
      }

      // Mettre à jour les classes actives
      this.links.forEach(link => link.classList.remove('active'));
      if (activeSection) {
        activeSection.link.classList.add('active');
      }
    }

    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  }

  // Initialisation après chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new StickyShopNav());
  } else {
    new StickyShopNav();
  }
})();

/* ========================================================================
   COPY EMAIL TO CLIPBOARD - Aide-jeux
   Fonction pour copier l'email dans le presse-papiers avec feedback visuel
   ===================================================================== */
function copyEmailToClipboard(email, buttonElement) {
  'use strict';

  // Utiliser l'API Clipboard moderne
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email)
      .then(() => {
        showCopyFeedback(buttonElement, true);
      })
      .catch((err) => {
        fallbackCopyEmail(email, buttonElement);
      });
  } else {
    // Fallback pour navigateurs anciens
    fallbackCopyEmail(email, buttonElement);
  }
}

/**
 * Méthode fallback pour copier l'email (navigateurs anciens)
 */
function fallbackCopyEmail(email, buttonElement) {
  'use strict';

  const textarea = document.createElement('textarea');
  textarea.value = email;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    showCopyFeedback(buttonElement, successful);
  } catch (err) {
    showCopyFeedback(buttonElement, false);
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Affiche le feedback visuel de copie
 */
function showCopyFeedback(buttonElement, success) {
  'use strict';

  const feedback = buttonElement.querySelector('.copy-feedback');
  if (!feedback) return;

  if (success) {
    feedback.classList.remove('hidden');
    feedback.classList.add('animate-pulse');

    // Masquer après 2 secondes
    setTimeout(() => {
      feedback.classList.add('hidden');
      feedback.classList.remove('animate-pulse');
    }, 2000);
  } else {
    // En cas d'échec, afficher un message d'erreur
    const originalText = feedback.textContent;
    feedback.textContent = '✗ Erreur';
    feedback.classList.remove('hidden', 'bg-green-600');
    feedback.classList.add('bg-red-600');

    setTimeout(() => {
      feedback.textContent = originalText;
      feedback.classList.add('hidden', 'bg-green-600');
      feedback.classList.remove('bg-red-600');
    }, 2000);
  }
}

// Export global pour utilisation dans onclick
window.copyEmailToClipboard = copyEmailToClipboard;

/* ========================================================================
   EFFETS SONORES - AJOUT AU PANIER GLOBAL
   ===================================================================== */

/**
 * Joue un effet sonore avec gestion d'erreurs
 *
 * @param {string} soundPath - Chemin vers le fichier audio
 * @param {number} volume - Volume de lecture (0.0 à 1.0)
 */
function playSound(soundPath, volume = 0.5) {
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(error => {
      // Gestion silencieuse des erreurs d'autoplay
      console.debug('Audio autoplay bloqué:', error);
    });
  } catch (error) {
    console.debug('Erreur lecture audio:', error);
  }
}

/**
 * Event listener global pour les boutons Snipcart
 * Utilise l'API Snipcart pour détecter l'ajout réel au panier
 */
document.addEventListener('DOMContentLoaded', () => {
  // Méthode 1: Événement Snipcart natif (quand Snipcart est prêt)
  document.addEventListener('snipcart.ready', () => {
    window.Snipcart.events.on('item.added', (item) => {
      // DEBUG: Logger l'item ajouté depuis TOUTES les sources
      console.log('=== SNIPCART ITEM.ADDED EVENT ===');
      console.log('Item reçu par Snipcart:', JSON.stringify(item, null, 2));
      console.log('Page source:', window.location.pathname);

      playSound('media/sounds/coin-drop.mp3', 0.5);
    });
  });

  // Méthode 2: Fallback pour clic direct (si Snipcart pas encore chargé)
  document.addEventListener('click', (event) => {
    const snipcartButton = event.target.closest('.snipcart-add-item');
    if (snipcartButton) {
      // Petit délai pour s'assurer que le son joue avant l'ouverture du panier
      setTimeout(() => {
        playSound('media/sounds/coin-drop.mp3', 0.5);
      }, 50);
    }
  });
});
