/* snipcart.js — overrides UI Snipcart
   - Corbeille à gauche du nom
   - Stepper -/+ sombre sur la quantité
   - Compatible rerenders Snipcart (MutationObserver + events)
*/

(function () {
  // Utilitaires
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Attendre Snipcart prêt (robuste)
  function whenSnipcartReady(cb) {
    if (window.Snipcart && window.Snipcart.events) return cb();
    document.addEventListener('snipcart.ready', cb, { once: true });
    const t = setInterval(() => {
      if (window.Snipcart && window.Snipcart.events) {
        clearInterval(t);
        cb();
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

  // Ajoute un champ code promo dans le panier
  function addPromoCodeField() {
    // Cherche le container du panier où ajouter le champ promo
    const cartContent = $('.snipcart-cart__content') || $('.snipcart__box--cart-summary') || $('.snipcart-cart');
    const existingPromo = $('.custom-promo-field');
    
    if (!cartContent || existingPromo) return;

    // Crée le champ code promo
    const promoSection = document.createElement('div');
    promoSection.className = 'custom-promo-field snipcart__box';
    promoSection.style.cssText = `
      margin: 16px 0;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #f9f9f9;
    `;

    promoSection.innerHTML = `
      <div style="margin-bottom: 8px;">
        <label for="promo-code-input" style="font-weight: bold; color: #333;">Code promo :</label>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input 
          type="text" 
          id="promo-code-input" 
          placeholder="Entrez votre code promo"
          style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
        />
        <button 
          type="button" 
          id="apply-promo-btn"
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; white-space: nowrap;"
        >
          Appliquer
        </button>
      </div>
      <div id="promo-message" style="margin-top: 8px; font-size: 12px; display: none;"></div>
    `;

    // Insère le champ avant le total ou à la fin du contenu
    const totalSection = $('.snipcart-cart__footer') || $('.snipcart__box--cart-summary');
    if (totalSection) {
      cartContent.insertBefore(promoSection, totalSection);
    } else {
      cartContent.appendChild(promoSection);
    }

    // Gestion de l'application du code promo
    const input = promoSection.querySelector('#promo-code-input');
    const button = promoSection.querySelector('#apply-promo-btn');
    const message = promoSection.querySelector('#promo-message');

    const applyPromoCode = async () => {
      const code = input.value.trim();
      if (!code) {
        showMessage('Veuillez entrer un code promo', 'error');
        return;
      }

      button.disabled = true;
      button.textContent = 'Application...';

      try {
        // Utilise l'API Snipcart pour appliquer le code promo
        if (window.Snipcart && window.Snipcart.api && window.Snipcart.api.cart) {
          await window.Snipcart.api.cart.setDiscountCode(code);
          showMessage('Code promo appliqué avec succès !', 'success');
          input.value = '';
        } else {
          throw new Error('API Snipcart non disponible');
        }
      } catch (error) {
        console.error('Erreur lors de l\'application du code promo:', error);
        showMessage('Code promo invalide ou erreur d\'application', 'error');
      } finally {
        button.disabled = false;
        button.textContent = 'Appliquer';
      }
    };

    const showMessage = (text, type) => {
      message.textContent = text;
      message.style.display = 'block';
      message.style.color = type === 'success' ? '#28a745' : '#dc3545';
      setTimeout(() => {
        message.style.display = 'none';
      }, 5000);
    };

    button.addEventListener('click', applyPromoCode);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyPromoCode();
      }
    });
  }

  // Traite toutes les lignes visibles du panier
  function processAll() {
    $$('.snipcart-item-line').forEach(processItemLine);
    addPromoCodeField();
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

  whenSnipcartReady(() => {
    // Langue depuis localStorage si besoin (cohérent avec snipcart-init.php)
    try {
      const lang = localStorage.getItem('snipcartLanguage');
      if (lang && window.Snipcart?.store) {
        // Certaines versions exposent locale via store; sinon la config au load suffit
        // window.Snipcart.store.dispatch('session:setLocale', lang); // garde en commentaire si non supporté
      }
    } catch (e) {}

    // 1er passage + observer
    processAll();
    mountObserver();

    // Écoute des évènements Snipcart (pour rafraîchir la mise en forme)
    const ev = window.Snipcart.events;
    if (ev?.on) {
      ['item.added', 'item.updated', 'cart.opened', 'cart.closed']
        .forEach(evt => ev.on(evt, processAll));
    }
  });
})();
