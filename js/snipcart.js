/* snipcart.js — overrides UI Snipcart
   - Corbeille à gauche du nom
   - Stepper -/+ sombre sur la quantité
   - Compatible rerenders Snipcart (MutationObserver + events)
*/

(function () {
  // Utilitaires
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Attendre Snipcart prêt avec stratégie d'attente plus patiente
  function whenSnipcartReady(cb) {
    // Vérification immédiate plus simple
    if (window.Snipcart && window.Snipcart.events) {
      return cb();
    }

    let retryCount = 0;
    const maxRetries = 100; // 10 secondes max (plus patient)
    let handlerRemoved = false;

    // Event listener pour snipcart.ready
    const readyHandler = () => {
      if (handlerRemoved) return;
      handlerRemoved = true;
      document.removeEventListener('snipcart.ready', readyHandler);
      if (t) clearInterval(t);
      cb();
    };
    
    document.addEventListener('snipcart.ready', readyHandler);

    // Polling simplifié
    const t = setInterval(() => {
      retryCount++;
      
      // Vérification plus simple
      if (window.Snipcart && window.Snipcart.events) {
        if (!handlerRemoved) {
          handlerRemoved = true;
          document.removeEventListener('snipcart.ready', readyHandler);
          clearInterval(t);
          cb();
        }
        return;
      }

      // Debug périodique
      if (retryCount % 20 === 0) { // Chaque 2 secondes
        console.log(`Snipcart: attente... (${retryCount/10}s)`, {
          snipcart: !!window.Snipcart,
          events: !!(window.Snipcart && window.Snipcart.events)
        });
      }

      if (retryCount >= maxRetries) {
        console.error('Snipcart: échec de chargement après 10s');
        if (!handlerRemoved) {
          handlerRemoved = true;
          document.removeEventListener('snipcart.ready', readyHandler);
          clearInterval(t);
        }
        
        // Dernière tentative sans conditions
        setTimeout(() => {
          console.warn('Snipcart: tentative d\'initialisation forcée...');
          cb();
        }, 500);
      }
    }, 100);
  }

  // Déplacer le bouton "supprimer" (corbeille) à gauche du titre
  function moveTrashLeft(itemLine) {
    if (!itemLine || itemLine.dataset.trashMoved === '1') return;

    // Titre (essayons plusieurs sélecteurs selon versions)
    const title =
      $('.snipcart-item-line__title', itemLine) ||
      $('.snipcart-item-line__information .snipcart__font--regular', itemLine) ||
      $('[data-item-name]', itemLine);

    // Bouton supprimer (plusieurs fallback)
    const removeBtn =
      $('.snipcart-item-line__actions button', itemLine) ||
      $('[data-action="item:remove"]', itemLine) ||
      $('button.snipcart__button--icon', itemLine) ||
      $('button[title="Remove item"]', itemLine);

    if (!title || !removeBtn) return;

    // Ensure the remove button doesn't keep an auto margin that pushes it to the right
    removeBtn.style.margin = '0';

    // Wrapper esthétique + petit espace
    let leftWrap = $('.__remove-left', itemLine);
    if (!leftWrap) {
      leftWrap = document.createElement('span');
      leftWrap.className = '__remove-left';
      leftWrap.style.display = 'inline-flex';
      leftWrap.style.alignItems = 'center';
      leftWrap.style.marginRight = '8px'; // petit espace
    }

    // Insérer juste avant le titre
    title.parentNode.insertBefore(leftWrap, title);
    leftWrap.appendChild(removeBtn);

    // Marqueur pour éviter les doublons
    itemLine.dataset.trashMoved = '1';
  }

  // Ajouter un stepper sombre - / + autour de l'input quantité
  function enhanceQuantity(itemLine) {
    if (!itemLine) return;

    // Bloc quantité
    const qtyBlock =
      $('.snipcart-item-line__quantity', itemLine) ||
      $('[data-item-quantity]', itemLine) ||
      itemLine;

    // Input quantité
    const input =
      $('input[type="number"]', qtyBlock) ||
      $('input[name="quantity"]', qtyBlock);

    if (!input || input.closest('.__qty-stepped')) return;

    // Wrapper
    const wrap = document.createElement('div');
    wrap.className = '__qty-stepped';
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';

    // Boutons - / +
    const mkBtn = (txt, aria) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = '__qty-btn gd-qty-button';
      b.setAttribute('aria-label', aria);
      b.textContent = txt;
      return b;
    };

    const minus = mkBtn('−', 'Diminuer la quantité');
    const plus  = mkBtn('+', 'Augmenter la quantité');

    input.classList.add('gd-qty-input');

    // Injection: [-][input][+]
    qtyBlock.insertBefore(wrap, input);
    wrap.appendChild(minus);
    wrap.appendChild(input);
    wrap.appendChild(plus);

    // Handlers
    const dispatchChange = () => {
      // Snipcart réagit au 'change'/'input'
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    minus.addEventListener('click', () => {
      const step = parseInt(input.step || '1', 10);
      const min  = parseInt((input.min ?? '1'), 10);
      const val  = Math.max(min, (parseInt(input.value || '1', 10) - step));
      input.value = String(val);
      dispatchChange();
    });

    plus.addEventListener('click', () => {
      const step = parseInt(input.step || '1', 10);
      const max  = input.max ? parseInt(input.max, 10) : null;
      let val    = parseInt(input.value || '1', 10) + step;
      if (max) val = Math.min(max, val);
      input.value = String(val);
      dispatchChange();
    });
  }

  // Traite une ligne d’article
  function processItemLine(line) {
    moveTrashLeft(line);
    enhanceQuantity(line);
  }


  // Traite toutes les lignes visibles du panier
  function processAll() {
    $$('.snipcart-item-line').forEach(processItemLine);
  }

  // Observer les re-renders de Snipcart
  function mountObserver() {
    const root = document.getElementById('snipcart');
    if (!root || root.__observerMounted) return;

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          $$('.snipcart-item-line', m.target).forEach(processItemLine);
        }
      }
    });

    obs.observe(root, { subtree: true, childList: true });
    root.__observerMounted = true;
  }

  // Fonction d'initialisation principale
  function initializeSnipcartCustomizations() {
    try {
      // Vérification de sécurité avant toute opération
      if (!window.Snipcart) {
        console.warn('⚠️ Snipcart non disponible lors de l\'initialisation des customizations');
        return;
      }

      // Langue depuis localStorage si besoin (cohérent avec snipcart-init.php)
      const lang = localStorage.getItem('snipcartLanguage');
      if (lang && window.Snipcart?.store) {
        // Certaines versions exposent locale via store; sinon la config au load suffit
        // window.Snipcart.store.dispatch('session:setLocale', lang); // garde en commentaire si non supporté
      }

      // 1er passage + observer
      processAll();
      mountObserver();

      // Écoute des évènements Snipcart (pour rafraîchir la mise en forme)
      const ev = window.Snipcart?.events;
      if (ev?.on) {
        ['item.added', 'item.updated', 'cart.opened', 'cart.closed', 'cart.confirmed']
          .forEach(evt => ev.on(evt, processAll));
      }

      // Debug info
      if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
        console.log('🎨 Snipcart customizations initialisées:', {
          api: !!window.Snipcart?.api,
          events: !!window.Snipcart?.events,
          store: !!window.Snipcart?.store
        });
      }
    } catch (error) {
      console.error('💥 Erreur lors de l\'initialisation des customizations Snipcart:', error);
      console.error('État Snipcart:', {
        snipcart: !!window.Snipcart,
        api: !!(window.Snipcart?.api),
        events: !!(window.Snipcart?.events)
      });
    }
  }

  // Initialisation principale
  whenSnipcartReady(initializeSnipcartCustomizations);

  // Réinitialisation lors des navigations (SPA-like behavior)
  if (typeof window.addEventListener !== 'undefined') {
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        if (window.Snipcart && window.Snipcart.events) {
          processAll();
        }
      }, 100);
    });
  }
})();
