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
      b.className = '__qty-btn';
      b.setAttribute('aria-label', aria);
      b.textContent = txt;
      // Styles sombres cohérents avec ton thème
      b.style.background = '#333333';
      b.style.color = '#ffffff';
      b.style.border = '1px solid #444';
      b.style.borderRadius = '6px';
      b.style.width = '32px';
      b.style.height = '32px';
      b.style.lineHeight = '30px';
      b.style.fontSize = '18px';
      b.style.cursor = 'pointer';
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

  // Fonction pour appliquer les traductions Snipcart
  function applySnipcartTranslations() {
    if (!window.i18n?.snipcart) return;
    
    const translations = window.i18n.snipcart;
    const lang = localStorage.getItem('lang') || 'fr';
    
    // Configuration des traductions Snipcart
    if (window.Snipcart?.api?.theme) {
      try {
        // Appliquer les traductions personnalisées
        window.Snipcart.api.theme.customization.registerTemplates({
          // Template pour les champs personnalisés
          'CartItem': `
            <div class="snipcart-item-line">
              <!-- Contenu standard -->
              {{#if customFields}}
                {{#each customFields}}
                  <div class="snipcart-item-line__custom-field">
                    <span class="snipcart-item-line__custom-field-name">
                      {{#if (equals name "multiplier")}}
                        ${translations.custom_fields?.multiplier || 'Multiplicateur'}
                      {{else if (equals name "language")}}
                        ${translations.custom_fields?.language || 'Langue'}
                      {{else}}
                        {{name}}
                      {{/if}}
                    </span>
                    <span class="snipcart-item-line__custom-field-value">{{value}}</span>
                  </div>
                {{/each}}
              {{/if}}
            </div>
          `
        });
        
        // Traduction via l'API si disponible
        if (window.Snipcart.api.localization) {
          window.Snipcart.api.localization.setLanguage(lang, {
            cart: translations.cart,
            checkout: translations.checkout,
            customer: translations.customer,
            errors: translations.errors
          });
        }
      } catch (e) {
        console.debug('[Snipcart] Customization API not available');
      }
    }
  }

  // Fonction pour masquer les noms de variables dans l'interface
  function hideVariableNames() {
    // Sélecteurs pour les éléments qui peuvent afficher des noms de variables
    const selectors = [
      '.snipcart-item-line__custom-field-name',
      '.snipcart-item-line__product-option-name',
      '[data-item-custom-field-name]',
      '.snipcart-product-option__name'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent?.trim();
        if (!text) return;
        
        // Remplacer les noms de variables par les traductions
        const translations = window.i18n?.snipcart?.custom_fields;
        if (translations) {
          if (text === 'multiplier' || text === 'Multiplier') {
            el.textContent = translations.multiplier;
          } else if (text === 'language' || text === 'Language') {
            el.textContent = translations.language;
          }
        }
      });
    });
  }

  whenSnipcartReady(() => {
    // Configuration de la langue
    try {
      const lang = localStorage.getItem('snipcartLanguage') || localStorage.getItem('lang') || 'fr';
      
      // Synchroniser avec Snipcart
      if (window.Snipcart?.api?.session) {
        window.Snipcart.api.session.setLanguage(lang);
      }
      
      // Appliquer nos traductions personnalisées
      applySnipcartTranslations();
      
    } catch (e) {
      console.debug('[Snipcart] Language configuration error:', e);
    }

    // 1er passage + observer
    processAll();
    hideVariableNames();
    mountObserver();

    // Observer pour les traductions
    const translationObserver = new MutationObserver(() => {
      hideVariableNames();
    });
    
    const snipcartRoot = document.getElementById('snipcart');
    if (snipcartRoot) {
      translationObserver.observe(snipcartRoot, {
        subtree: true,
        childList: true,
        characterData: true
      });
    }

    // Écoute des évènements Snipcart
    const ev = window.Snipcart.events;
    if (ev?.on) {
      ['item.added', 'item.updated', 'cart.opened', 'cart.closed', 'localization.ready']
        .forEach(evt => ev.on(evt, () => {
          processAll();
          hideVariableNames();
          applySnipcartTranslations();
        }));
    }
  });
})();
