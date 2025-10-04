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
      let shouldUpdatePromotions = false;

      for (const m of mutations) {
        if (m.type === 'childList') {
          // Traiter les lignes d'articles
          $$('.snipcart-item-line', m.target).forEach(processItemLine);

          // Vérifier si le résumé du panier a été modifié
          if (m.target.classList?.contains('snipcart-cart-summary') ||
              m.target.classList?.contains('snipcart-checkout__content--summary') ||
              m.target.classList?.contains('snipcart-summary') ||
              m.target.querySelector?.('.snipcart-cart-summary, .snipcart-checkout__content--summary, .snipcart-summary')) {
            shouldUpdatePromotions = true;
          }
        }
      }

      // Rafraîchir les promotions si le résumé a changé
      if (shouldUpdatePromotions) {
        setTimeout(displayPromotionsDynamically, 50);
      }
    });

    obs.observe(root, { subtree: true, childList: true });
    root.__observerMounted = true;
  }

  /**
   * Masque la ligne "Promotions" avec popup et affiche les détails
   */
  function hidePromotionsPopup() {
    // Masquer la ligne "Promotions" qui ouvre le popup
    const promoLines = $$('.snipcart-cart-summary-item, .snipcart-summary-fees__item');
    promoLines.forEach(line => {
      const text = line.textContent || '';
      if (text.includes('Promotions') || text.includes('Promotion')) {
        // Vérifier si c'est bien la ligne avec le montant total des promos
        const amountSpan = $('.snipcart-cart-summary-fees__amount', line) ||
                          $('.snipcart-summary-fees__amount', line);
        if (amountSpan && amountSpan.textContent.includes('-')) {
          line.style.display = 'none';
          line.setAttribute('data-gd-hidden', 'true');
        }
      }
    });

    // Masquer aussi le bouton/lien qui ouvre le popup
    $$('button, a').forEach(el => {
      const text = el.textContent || '';
      if (text.includes('Promotions') && el.closest('.snipcart-cart-summary-item')) {
        el.style.display = 'none';
      }
    });
  }

  /**
   * Affiche les promotions appliquées dynamiquement dans le panier
   * Les promotions sont extraites du panier et affichées les unes après les autres
   * sans popup, décalant automatiquement le sous-total, livraison, taxes et total
   */
  function displayPromotionsDynamically() {
    try {
      // Trouver la section résumé du panier avec TOUS les sélecteurs possibles
      const summarySection =
        $('.snipcart-cart-summary') ||
        $('.snipcart-checkout__content--summary') ||
        $('.snipcart-summary') ||
        $('.snipcart__box--summary') ||
        $('.snipcart-summary-fees') ||
        $('[class*="summary"]');

      if (!summarySection) {
        console.warn('⚠️ Section résumé du panier non trouvée');
        // Essayer de trouver n'importe quel élément contenant "sous-total"
        const allElements = $$('*');
        const foundElement = allElements.find(el => el.textContent?.toLowerCase().includes('sous-total'));
        if (foundElement) {
          console.log('✅ Élément contenant "sous-total" trouvé, utilisation du parent');
          return displayPromotionsDynamically.call(null, foundElement.closest('[class*="summary"]') || foundElement.parentElement);
        }
        return;
      }

      // Récupérer les données du panier via l'API Snipcart
      const cart = window.Snipcart?.store?.getState()?.cart;
      if (!cart) {
        console.warn('⚠️ Données du panier non disponibles');
        return;
      }

      // Extraire les promotions depuis les discount - SÉCURITÉ : vérifier que c'est un tableau
      let discounts = cart.discounts;

      // Debug : afficher la structure
      console.log('🔍 cart.discounts brut:', discounts);
      console.log('🔍 Type de discounts:', typeof discounts, 'IsArray:', Array.isArray(discounts));

      // Si discounts n'est pas un tableau, essayer de le convertir
      if (!Array.isArray(discounts)) {
        if (discounts && typeof discounts === 'object') {
          // Si c'est un objet avec une propriété items ou similar
          if (discounts.items && Array.isArray(discounts.items)) {
            discounts = discounts.items;
          } else if (discounts.discounts && Array.isArray(discounts.discounts)) {
            discounts = discounts.discounts;
          } else {
            // Sinon convertir l'objet en tableau
            discounts = Object.values(discounts);
          }
        } else {
          discounts = [];
        }
      }

      // Filtrer les éléments vides ou invalides
      discounts = discounts.filter(d => d && (d.name || d.amount || d.rate));

      // Trier les promotions : FixedAmount d'abord, puis Rate (%)
      // Cela reflète l'ordre d'application : réduction fixe puis % sur le prix réduit
      discounts.sort((a, b) => {
        const typeA = typeof a.type === 'function' ? a.type() : a.type;
        const typeB = typeof b.type === 'function' ? b.type() : b.type;

        // FixedAmount (0) avant Rate (1)
        const orderA = typeA === 'FixedAmount' ? 0 : 1;
        const orderB = typeB === 'FixedAmount' ? 0 : 1;

        return orderA - orderB;
      });

      console.log('🔍 Promotions après traitement et tri:', discounts);

      // Supprimer les promotions précédemment affichées
      $$('.__gd-promo-line').forEach(el => el.remove());

      // Masquer la ligne "Promotions" avec popup
      hidePromotionsPopup();

      if (discounts.length === 0) {
        console.log('ℹ️ Aucune promotion à afficher');
        return;
      }

      // Trouver la ligne du sous-total pour insérer les promotions avant
      const subtotalLine =
        $('.snipcart-cart-summary-item--subtotal', summarySection) ||
        $('.snipcart-summary-fees__item--subtotal', summarySection) ||
        $('.snipcart-cart-summary-item', summarySection) ||
        $('.snipcart-summary-fees__item', summarySection) ||
        Array.from($$('*', summarySection)).find(el => el.textContent?.toLowerCase().includes('sous-total'));

      if (!subtotalLine) {
        console.warn('⚠️ Ligne sous-total non trouvée');
        return;
      }

      // Créer une ligne pour chaque promotion
      discounts.forEach((discount, index) => {
        // Vue.js utilise des getters - extraire les valeurs réelles
        const name = typeof discount.name === 'function' ? discount.name() : discount.name;
        const type = typeof discount.type === 'function' ? discount.type() : discount.type;
        const amountSaved = typeof discount.amountSaved === 'function' ? discount.amountSaved() : discount.amountSaved;
        const value = typeof discount.value === 'function' ? discount.value() : discount.value;

        console.log(`🔍 Promotion ${index + 1}:`, {
          name,
          type,
          amountSaved,
          value,
          raw: discount
        });

        const promoLine = document.createElement('div');
        promoLine.className = '__gd-promo-line snipcart-cart-summary-item';
        promoLine.style.cssText = `
          display: flex !important;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--gd-border, rgba(255,255,255,0.1));
          color: var(--gd-success, #10b981);
          font-size: 0.95rem;
        `;

        // Nom de la promotion
        const nameSpan = document.createElement('span');
        nameSpan.className = '__gd-promo-name';
        nameSpan.textContent = name || `Promotion ${index + 1}`;
        nameSpan.style.cssText = `
          flex: 1;
          font-weight: 500;
          color: var(--gd-success, #10b981);
        `;

        // Montant de la réduction
        const amountSpan = document.createElement('span');
        amountSpan.className = '__gd-promo-amount';

        // Formater le montant selon le type de réduction - utiliser les valeurs extraites
        let discountText = '';

        console.log(`💰 Calcul montant promotion ${index + 1}:`, {
          amountSaved,
          value,
          type
        });

        if (type === 'FixedAmount' || amountSaved > 0) {
          discountText = `-${formatCurrency(amountSaved, cart.currency)}`;
        } else if (value > 0) {
          discountText = `-${(value * 100).toFixed(0)}%`;
        } else {
          // Fallback : afficher "Appliqué" si on ne trouve pas le montant
          discountText = 'Appliqué';
        }

        amountSpan.textContent = discountText;
        amountSpan.style.cssText = `
          font-weight: 600;
          color: var(--gd-success, #10b981);
        `;

        promoLine.appendChild(nameSpan);
        promoLine.appendChild(amountSpan);

        // Insérer la ligne de promotion avant le sous-total
        subtotalLine.parentNode.insertBefore(promoLine, subtotalLine);
      });

      console.log(`✅ ${discounts.length} promotion(s) affichée(s) dynamiquement`);
    } catch (error) {
      console.error('Erreur lors de l\'affichage des promotions:', error);
    }
  }

  /**
   * Formate un montant en devise
   * @param {number} amount - Montant à formater
   * @param {string} currency - Code devise (CAD, USD, EUR...)
   * @returns {string} Montant formaté
   */
  function formatCurrency(amount, currency = 'CAD') {
    try {
      return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      // Fallback simple si Intl échoue
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  // ============================================================================
  // SYSTÈME DE VARIATIONS DYNAMIQUES
  // ============================================================================

  /**
   * Construit le nom du produit avec ses variations (métal, multiplicateur)
   * @param {Object} item - Item du panier Snipcart
   * @returns {string} Nom avec variations entre parenthèses
   */
  function buildProductNameWithVariations(item) {
    // Nom de base (nettoyer les variations existantes)
    let baseName = typeof item.name === 'function' ? item.name() : item.name;
    baseName = baseName.replace(/\s*\([^)]+\)\s*$/, '').trim();

    const customFields = item.customFields || [];
    const variations = [];

    customFields.forEach(field => {
      const fieldName = (typeof field.name === 'function' ? field.name() : field.name) || '';
      const fieldValue = (typeof field.value === 'function' ? field.value() : field.value) || '';

      if (fieldName.toLowerCase().includes('métal') || fieldName.toLowerCase().includes('metal')) {
        variations.push(fieldValue);
      } else if (fieldName.toLowerCase().includes('multiplicateur') || fieldName.toLowerCase().includes('multiplier')) {
        variations.push(`×${fieldValue}`);
      }
    });

    return variations.length > 0 ? `${baseName} (${variations.join(' ')})` : baseName;
  }

  /**
   * Met à jour le nom d'un item dans le store Snipcart
   * @param {string} itemId - ID unique de l'item
   * @param {string} newName - Nouveau nom avec variations
   */
  function updateItemNameInStore(itemId, newName) {
    try {
      window.Snipcart?.api?.cart?.items?.update({
        uniqueId: itemId,
        name: newName
      });
      console.log(`✅ Nom mis à jour: ${newName}`);
    } catch (error) {
      console.warn('⚠️ Erreur mise à jour nom:', error);
    }
  }

  /**
   * Injecte les variations dans le DOM du sommaire (fallback visuel)
   */
  function injectVariationsInSummaryDOM() {
    const cart = window.Snipcart?.store?.getState()?.cart;
    if (!cart) return;

    const items = cart.items || [];

    // Sélecteurs pour les titres dans le sommaire
    const summaryItems = $$('.snipcart-summary-item__title, .snipcart__item__title, .snipcart-order-item__title');

    summaryItems.forEach(titleEl => {
      // Éviter de traiter deux fois
      if (titleEl.dataset.gdVariationsInjected === 'true') return;

      const titleText = titleEl.textContent.trim();

      // Trouver l'item correspondant
      const matchingItem = items.find(item => {
        const itemName = typeof item.name === 'function' ? item.name() : item.name;
        return itemName.includes(titleText) || titleText.includes(itemName);
      });

      if (!matchingItem) return;

      // Construire le nom complet avec variations
      const fullName = buildProductNameWithVariations(matchingItem);

      // Si le titre actuel ne contient pas les variations
      if (!titleText.includes('(') && fullName !== titleText) {
        const variationsMatch = fullName.match(/\(([^)]+)\)/);
        if (variationsMatch) {
          const variationsSpan = document.createElement('span');
          variationsSpan.className = 'gd-item-variations';
          variationsSpan.style.cssText = `
            color: #94a3b8;
            font-weight: 400;
            font-size: 0.9em;
            margin-left: 0.25rem;
          `;
          variationsSpan.textContent = ` (${variationsMatch[1]})`;

          titleEl.appendChild(variationsSpan);
          titleEl.dataset.gdVariationsInjected = 'true';
        }
      }
    });
  }

  /**
   * Initialise le système de variations dynamiques
   */
  function initDynamicVariations() {
    try {
      const events = window.Snipcart?.events;
      if (!events) {
        console.warn('⚠️ Events Snipcart non disponibles pour variations dynamiques');
        return;
      }

      // Écouter les changements d'items dans le panier
      events.on('item.updated', (item) => {
        const itemData = item.item || item;
        const uniqueId = typeof itemData.uniqueId === 'function' ? itemData.uniqueId() : itemData.uniqueId;
        const newName = buildProductNameWithVariations(itemData);
        const currentName = typeof itemData.name === 'function' ? itemData.name() : itemData.name;

        // Mettre à jour seulement si le nom a changé
        if (currentName !== newName) {
          updateItemNameInStore(uniqueId, newName);
        }
      });

      // Écouter l'ajout d'items
      events.on('item.added', (item) => {
        const itemData = item.item || item;
        const uniqueId = typeof itemData.uniqueId === 'function' ? itemData.uniqueId() : itemData.uniqueId;

        // Petit délai pour laisser Snipcart initialiser
        setTimeout(() => {
          const newName = buildProductNameWithVariations(itemData);
          updateItemNameInStore(uniqueId, newName);
        }, 100);
      });

      // Observer les changements de page (panier → checkout)
      events.on('page.change', () => {
        setTimeout(injectVariationsInSummaryDOM, 200);
      });

      // Quand le panier s'ouvre
      events.on('cart.opened', () => {
        setTimeout(injectVariationsInSummaryDOM, 200);
      });

      // MutationObserver pour détecter l'apparition du sommaire
      const snipcartContainer = document.getElementById('snipcart');
      if (snipcartContainer && !snipcartContainer.__gdVariationsObserverMounted) {
        const observer = new MutationObserver((mutations) => {
          let shouldUpdate = false;

          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              const summaryAdded = Array.from(mutation.addedNodes).some(node =>
                node.nodeType === 1 && (
                  node.classList?.contains('snipcart-summary') ||
                  node.classList?.contains('snipcart-checkout__content--summary') ||
                  node.querySelector?.('.snipcart-summary, .snipcart-checkout__content--summary')
                )
              );

              if (summaryAdded) {
                shouldUpdate = true;
                break;
              }
            }
          }

          if (shouldUpdate) {
            setTimeout(injectVariationsInSummaryDOM, 50);
          }
        });

        observer.observe(snipcartContainer, {
          childList: true,
          subtree: true
        });

        snipcartContainer.__gdVariationsObserverMounted = true;
      }

      // Injection initiale après un court délai
      setTimeout(injectVariationsInSummaryDOM, 500);

      console.log('🎨 Système de variations dynamiques initialisé');
    } catch (error) {
      console.error('💥 Erreur initialisation variations dynamiques:', error);
    }
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

      // Afficher les promotions dynamiquement
      displayPromotionsDynamically();

      // Initialiser le système de variations dynamiques
      initDynamicVariations();

      // Écoute des évènements Snipcart (pour rafraîchir la mise en forme)
      const ev = window.Snipcart?.events;
      if (ev?.on) {
        ['item.added', 'item.updated', 'cart.opened', 'cart.closed', 'cart.confirmed', 'discount.applied', 'discount.removed']
          .forEach(evt => {
            ev.on(evt, () => {
              processAll();
              // Rafraîchir l'affichage des promotions après un court délai
              setTimeout(displayPromotionsDynamically, 100);
            });
          });
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
