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

  // Pas d’erreurs si console absente
  const log = (...args) => { try { console.log('[GD]', ...args); } catch (_) {} };

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
      window.GD.setLang(picked);
      setCurrent(picked);
      whenSnipcart(() => window.Snipcart.api.session.setLanguage(picked));
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
          // On garde le HTML déjà converti, pas besoin de traduction côté JS
          // Le PHP gère déjà la traduction avec le bon format HTML
        });
        document.querySelectorAll('[data-alt-fr]').forEach((el) => {
          const target = current === 'en' ? el.dataset.altEn : el.dataset.altFr;
          if (target) el.setAttribute('alt', target);
        });

        // Boutons Snipcart (nom/description + libellé custom)
        const MULTIPLIER_LABEL_PATTERN = /(multiplicateur|multiplier)s?/i;
        // Traduction sécurisée du libellé multiplicateur : on garde la valeur initiale pour vérifier qu'il s'agit bien d'un champ dédié.
        const multiplierLabel = typeof data?.product?.multiplier === 'string' ? data.product.multiplier : '';
        const multiplierFieldMap = new Map();
        if (multiplierLabel) {
          document.querySelectorAll('.multiplier-select[data-target]').forEach((sel) => {
            // On mémorise les sélecteurs multiplicateurs pour repérer l'index exact du champ custom.
            const target = sel.dataset.target;
            if (!target) return;
            const indexValue = String(sel.dataset.customIndex || '1');
            if (!multiplierFieldMap.has(target)) multiplierFieldMap.set(target, new Set());
            multiplierFieldMap.get(target).add(indexValue);
          });
        }

        const hasExplicitMultiplierMarker = (button, fieldIndex, totalCustomFields) => {
          // Ce helper vérifie si un attribut spécifique signale que le champ courant est bien un multiplicateur.
          const indexValue = String(fieldIndex);
          const rawMarker = button.getAttribute('data-multiplier-field');
          if (typeof rawMarker === 'string' && rawMarker.trim() !== '') {
            const tokens = rawMarker.split(/[,|]/)
              .map((token) => token.trim().toLowerCase())
              .filter(Boolean);
            if (tokens.some((token) => token === indexValue || token === `custom${indexValue}`)) return true;
            if (totalCustomFields === 1 && tokens.some((token) => ['true', 'yes', '1', 'multiplicateur', 'multiplier'].includes(token))) return true;
          } else if (button.hasAttribute('data-multiplier-field') && totalCustomFields === 1) {
            return true;
          }

          const targetId = button.dataset.itemId;
          if (targetId && multiplierFieldMap.get(targetId)?.has(indexValue)) return true;

          const hintAttrs = [
            button.getAttribute(`data-item-custom${indexValue}-role`),
            button.getAttribute(`data-item-custom${indexValue}-type`),
            button.getAttribute(`data-item-custom${indexValue}-flag`),
          ];
          return hintAttrs.some((hint) => /multiplier/i.test(hint || ''));
        };

        document.querySelectorAll('.snipcart-add-item').forEach((btn) => {
          if (current === 'en') {
            if (btn.dataset.itemNameEn) btn.setAttribute('data-item-name', btn.dataset.itemNameEn);
            if (btn.dataset.itemDescriptionEn) btn.setAttribute('data-item-description', btn.dataset.itemDescriptionEn);
          } else {
            if (btn.dataset.itemNameFr) btn.setAttribute('data-item-name', btn.dataset.itemNameFr);
            if (btn.dataset.itemDescriptionFr) btn.setAttribute('data-item-description', btn.dataset.itemDescriptionFr);
          }

          if (!multiplierLabel) return; // Aucun libellé de multiplicateur : on ne touche pas aux champs custom.

          const customNameAttrs = Array.from(btn.attributes).filter((attr) => /^data-item-custom\d+-name$/i.test(attr.name));
          const totalCustomFields = customNameAttrs.length;

          customNameAttrs.forEach((attr) => {
            const match = attr.name.match(/^data-item-custom(\d+)-name$/i);
            if (!match) return;
            const fieldIndex = match[1];
            const currentLabel = (attr.value || '').trim();
            const shouldOverride = MULTIPLIER_LABEL_PATTERN.test(currentLabel) || hasExplicitMultiplierMarker(btn, fieldIndex, totalCustomFields);
            if (shouldOverride) btn.setAttribute(attr.name, multiplierLabel);
          });
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
  const videos = ['video1', 'video2', 'video3']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  let current = 0;
  let audioOK = false;
  let playSeq;

  videos.forEach((vid) => {
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
      const indexAttr = parseInt(sel.dataset.customIndex || '1', 10);
      const fieldIndex = Number.isFinite(indexAttr) && indexAttr > 0 ? indexAttr : 1;
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
    onUpdate: ({ addBtn, value }) => {
      const lang = document.documentElement.lang;
      const baseName = lang === 'en'
        ? (addBtn.dataset.itemNameEn || addBtn.getAttribute('data-item-name'))
        : (addBtn.dataset.itemNameFr || addBtn.getAttribute('data-item-name'));
      addBtn.setAttribute('data-item-name', value !== '1' ? `${baseName} x${value}` : baseName);
    },
  });

  bindCustomSelect('.language-select');

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
   SNIPCART — synchronisation au clic "Ajouter au panier"
   ===================================================================== */
(() => {
  const parseIndex = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

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
          const attrIndex = parseIndex(selectEl.dataset.customIndex || '');
          let fieldIndex = attrIndex ?? indexes[position];
          if (!fieldIndex) {
            fieldIndex = indexes[indexes.length - 1] ?? (position + 1);
          }
          const value = `${selectEl.value ?? ''}`;

          btn.setAttribute(`data-item-custom${fieldIndex}-value`, value);

          if (selectEl.classList.contains('multiplier-select')) {
            const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
            const baseName = lang === 'en' ? baseNameEn : baseNameFr;
            if (baseName) {
              btn.setAttribute('data-item-name', value && value !== '1' ? `${baseName} x${value}` : baseName);
            }
          }
        });
      }
    }, { passive: true });

    window.__snipcartQtyPatch = true;
  };

  window.__ensureSnipcartQtyPatch = ensureSnipcartQtyPatch;

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
