/* ========================================================================
   Geek & Dragon — App Optimized
   Version modulaire et optimisée de l'application
   ===================================================================== */

/* global Swiper, Fancybox */

// Import des modules
import { 
  qs, qsa, log, throttle, debounce, createEl, 
  getLang, setLang, smoothScrollTo, getHeaderOffset, 
  focusTrap, whenSnipcart, updateHeaderVars, fullyVisible
} from './core/utils.js';

import { 
  initScrollAnimations, initSmoothScroll, initNavigation,
  initHeaderEffects, initBackToTop, initCollapse, initLazyLoading
} from './core/dom.js';

import { initI18n } from './core/i18n.js';

// Expose les utilitaires globalement pour compatibilité
window.GD = {
  qs, qsa, log, throttle, debounce, createEl,
  getLang, setLang, smoothScrollTo, getHeaderOffset, focusTrap
};
window.whenSnipcart = whenSnipcart;

/* ========================================================================
   INITIALISATION GLOBALE
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Variables CSS header
  const header = qs('header');
  if (header) {
    updateHeaderVars();
    new ResizeObserver(updateHeaderVars).observe(header);
    window.addEventListener('resize', updateHeaderVars);
  }

  // Initialisation des modules
  initI18n();
  initScrollAnimations();
  initSmoothScroll();
  initNavigation();
  initHeaderEffects();
  initBackToTop();
  initCollapse();
  initLazyLoading();

  // Mobile menu
  initMobileMenu();

  // Boutique
  initBoutique();

  // Snipcart
  initSnipcart();
});

/* ========================================================================
   MENU MOBILE
   ===================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  const closeBtn = document.getElementById('menu-close');
  
  if (!menuBtn || !mobileMenu || !overlay) return;

  const trap = focusTrap(mobileMenu);
  
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
    const first = mobileMenu.querySelector('a,button');
    if (first) first.focus();
  };
  
  const closeMenu = () => {
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    overlay.addEventListener('transitionend', () => overlay.classList.add('hidden'), { once: true });
    mobileMenu.addEventListener('transitionend', () => mobileMenu.classList.add('hidden'), { once: true });
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
}

/* ========================================================================
   BOUTIQUE
   ===================================================================== */
function initBoutique() {
  const stock = window.stock || {};

  const updatePlus = (id) => {
    const max = stock[id];
    const qty = parseInt(document.getElementById(`qty-${id}`)?.textContent || '1', 10);
    const plusBtn = qs(`.quantity-btn.plus[data-target="${id}"]`);
    const addBtn = qs(`.btn-shop[data-item-id="${id}"]`);
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

  // Gestion quantités
  qsa('.quantity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const qtySpan = document.getElementById(`qty-${id}`);
      if (!qtySpan) return;
      
      let qty = parseInt(qtySpan.textContent, 10) || 1;
      const max = stock[id];
      
      if (btn.classList.contains('minus')) {
        qty = Math.max(1, qty - 1);
      } else if (max == null || qty + 1 <= max) {
        qty += 1;
      }
      
      qtySpan.textContent = qty;
      const addBtn = qs(`.btn-shop[data-item-id="${id}"]`);
      if (addBtn) addBtn.setAttribute('data-item-quantity', String(qty));
      updatePlus(id);
    });
  });

  // Init quantités
  qsa('.quantity-selector').forEach((sel) => {
    updatePlus(sel.dataset.id);
  });

  qsa('.btn-shop[data-item-id]').forEach((btn) => {
    const id = btn.dataset.itemId;
    if (!qs(`.quantity-selector[data-id="${id}"]`)) {
      updatePlus(id);
    }
  });

  // Multiplicateurs
  qsa('.multiplier-select').forEach((sel) => {
    const id = sel.dataset.target;
    const addBtn = qs(`.btn-shop[data-item-id="${id}"]`);
    const update = () => {
      const qty = parseInt(document.getElementById(`qty-${id}`)?.textContent || '1', 10);
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
  qsa('.swiper').forEach((sw) => {
    if (sw.classList.contains('swiper-thumbs')) return;
    const container = sw.parentElement;
    const thumbsEl = container.querySelector('.swiper-thumbs');
    
    if (thumbsEl) {
      const thumbsSwiper = new Swiper(thumbsEl, { 
        slidesPerView: 4, 
        freeMode: true, 
        watchSlidesProgress: true 
      });
      
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        navigation: { 
          nextEl: sw.querySelector('.swiper-button-next'), 
          prevEl: sw.querySelector('.swiper-button-prev') 
        },
        thumbs: { swiper: thumbsSwiper },
      });
    } else {
      new Swiper(sw, {
        loop: true,
        autoplay: { delay: 5000 },
        navigation: { 
          nextEl: sw.querySelector('.swiper-button-next'), 
          prevEl: sw.querySelector('.swiper-button-prev') 
        },
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

  // Synchronisation Snipcart
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.dataset.itemId;

    // Quantité depuis l'UI
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

    // Multiplicateur
    const sel = qs(`.multiplier-select[data-target="${id}"]`);
    if (sel) btn.setAttribute('data-item-custom1-value', sel.value);
  }, false);
}

/* ========================================================================
   SNIPCART
   ===================================================================== */
function initSnipcart() {
  const cartBtns = qsa('.snipcart-checkout');
  const accountBtns = qsa('.snipcart-customer-signin');

  const cartVisible = () => window.Snipcart?.store?.getState()?.cart?.status === 'visible';
  const accountVisible = () => window.Snipcart?.store?.getState()?.customer?.status === 'visible';

  cartBtns.forEach((btn) => btn.addEventListener('click', (e) => {
    if (!window.Snipcart?.store || !window.Snipcart?.api?.theme) return;
    if (cartVisible()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.Snipcart.api.theme.cart.close();
      e.currentTarget.blur();
    }
  }));

  accountBtns.forEach((btn) => btn.addEventListener('click', (e) => {
    if (!window.Snipcart?.store || !window.Snipcart?.api?.theme) return;
    if (accountVisible()) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
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

  const hookStore = () => {
    try {
      const { store } = window.Snipcart;
      if (store) store.subscribe(() => setBtnState());
    } catch (_) {}
  };

  (function poll() {
    if (window.Snipcart && window.Snipcart.store) hookStore();
    else setTimeout(poll, 300);
  }());

  // Scroll lock pour le panier
  const toggleSnipcartScroll = () => {
    const root = document.getElementById('snipcart');
    const inOrder = !!root?.querySelector('.snipcart-order');
    const visible = cartVisible();
    document.body.classList.toggle('snipcart-open', visible && !inOrder);
  };

  window.addEventListener('snipcart.opened', toggleSnipcartScroll);
  window.addEventListener('snipcart.closed', toggleSnipcartScroll);
  window.addEventListener('snipcart.ready', () => {
    const root = document.getElementById('snipcart');
    if (root) {
      new MutationObserver(toggleSnipcartScroll).observe(root, { 
        childList: true, 
        subtree: true 
      });
    }
    toggleSnipcartScroll();
  });
}