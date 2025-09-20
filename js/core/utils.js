/* ========================================================================
   Geek & Dragon — Core Utilities
   Utilitaires centralisés réutilisables
   ===================================================================== */

/**
 * Sélecteurs rapides
 */
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Console logging sécurisé
 */
export const log = (...args) => {
  try { 
    console.log('[GD]', ...args); 
  } catch (_) {}
};

/**
 * Throttle function - version optimisée unique
 */
export const throttle = (fn, wait = 100) => {
  let last = 0;
  let timer = null;
  
  return function throttled(...args) {
    const now = Date.now();
    
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, wait - (now - last));
    }
  };
};

/**
 * Debounce function
 */
export const debounce = (fn, wait = 120) => {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
};

/**
 * Créateur d'éléments DOM
 */
export const createEl = (tag, attrs = {}, children = []) => {
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

/**
 * Gestion des cookies
 */
export const setCookie = (name, value, maxAge = 31536000) => {
  try { 
    document.cookie = `${name}=${value};path=/;max-age=${maxAge}`; 
  } catch (_) {}
};

export const getCookie = (name) => {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    return m ? m[1] : null;
  } catch (_) { 
    return null; 
  }
};

/**
 * Gestion de la langue
 */
const LANGS = ['fr', 'en'];
const DEFAULT_LANG = 'fr';

export const getLang = () => {
  const fromStorage = localStorage.getItem('lang');
  const fromCookie = getCookie('lang');
  const fromHtml = document.documentElement.lang;
  const lang = (fromStorage || fromCookie || fromHtml || DEFAULT_LANG).toLowerCase();
  return LANGS.includes(lang) ? lang : DEFAULT_LANG;
};

export const setLang = (lang) => {
  const safe = LANGS.includes(lang) ? lang : DEFAULT_LANG;
  localStorage.setItem('lang', safe);
  localStorage.setItem('snipcartLanguage', safe);
  setCookie('lang', safe);
  document.documentElement.lang = safe;
  return safe;
};

/**
 * Smooth scroll avec offset header
 */
export const getHeaderOffset = () => {
  const header = qs('header');
  return header ? header.offsetHeight : 0;
};

export const smoothScrollTo = (target, options = {}) => {
  const prefersNoMotion = window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const top = Math.max(0, 
    target.getBoundingClientRect().top + 
    window.pageYOffset - 
    (options.offset ?? getHeaderOffset() + 12)
  );
  
  if (prefersNoMotion) { 
    window.scrollTo(0, top); 
    return; 
  }
  
  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Focus trap pour accessibilité
 */
export const focusTrap = (container) => {
  const focusableSel = 'a[href], button:not([disabled]), select, textarea, input, [tabindex]:not([tabindex="-1"])';
  let nodes = [];
  let first = null;
  let last = null;
  
  const set = () => {
    nodes = qsa(focusableSel, container);
    [first] = nodes;
    last = nodes[nodes.length - 1];
  };
  
  const handler = (e) => {
    if (e.key !== 'Tab' || !nodes.length) return;
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  
  return {
    mount() {
      set();
      container.addEventListener('keydown', handler);
    },
    unmount() {
      container.removeEventListener('keydown', handler);
    },
  };
};

/**
 * Attente de Snipcart (polling léger)
 */
export const whenSnipcart = (cb) => {
  if (window.Snipcart && window.Snipcart.store && window.Snipcart.api) {
    cb();
    return;
  }
  
  const interval = setInterval(() => {
    if (window.Snipcart && window.Snipcart.store && window.Snipcart.api) {
      clearInterval(interval);
      cb();
    }
  }, 200);
};

/**
 * Gestion des variables CSS header
 */
export const updateHeaderVars = () => {
  const header = qs('header');
  if (!header) return;
  
  const h = header.getBoundingClientRect().height || 96;
  document.documentElement.style.setProperty('--header-height', `${h}px`);
  document.documentElement.style.setProperty('--gd-header-h', `${h}px`);
};

/**
 * Helper pour vérifier si un élément est entièrement visible
 */
export const fullyVisible = (el) => {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.left >= 0 &&
         r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
         r.right <= (window.innerWidth || document.documentElement.clientWidth);
};