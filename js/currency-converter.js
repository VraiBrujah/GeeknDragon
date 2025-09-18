(() => {
  // Conversion rates in copper pieces
  const rates = {
    copper: 1,
    silver: 10,
    electrum: 50,
    gold: 100,
    platinum: 1000,
  };

  const sources = document.querySelectorAll('#currency-sources input:not([data-multiplier])');
  const advancedInputs = document.querySelectorAll('.advanced-group input');
  const advancedGroups = document.querySelectorAll('.advanced-group');
  const advancedToggle = document.getElementById('currency-advanced-toggle');
  const totalBreakdown = document.getElementById('currency-total-breakdown');
  const totalGold = document.getElementById('currency-total-gold');
  const totalPiecesEl = document.getElementById('currency-total-pieces');
  const equivContainer = document.getElementById('currency-equivalences');
  const equivTable = document.getElementById('currency-equivalences-list');
  const equivBody = equivTable?.querySelector('tbody');
  const equivFoot = equivTable?.querySelector('tfoot');

  if (
    !sources.length ||
    !totalBreakdown ||
    !totalGold ||
    !totalPiecesEl ||
    !equivContainer ||
    !equivTable ||
    !equivBody ||
    !equivFoot
  )
    return;

  const multipliers = [1, 10, 100, 1000, 10000];
  const coins = Object.keys(rates).sort((a, b) => rates[b] - rates[a]);

  const locale =
    window?.i18n?.lang ||
    document.documentElement?.lang ||
    window.navigator?.language ||
    'fr-FR';
  const nf = new Intl.NumberFormat(locale);

  const denominations = multipliers
    .flatMap((multiplier) => coins.map((coin) => ({
      coin,
      multiplier,
      value: rates[coin] * multiplier,
    })))
    .sort((a, b) => b.value - a.value);

  const formatItemsText = (items, currencyNames, andText) => {
    const parts = items.map(({ coin, multiplier, qty }) => {
      const label = currencyNames[coin].replace(
        /^pièce/,
        qty > 1 ? 'pièces' : 'pièce',
      );
      return multiplier === 1
        ? `${nf.format(qty)} ${label}`
        : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
    });

    let text = '';
    if (parts.length === 1) {
      [text] = parts;
    } else if (parts.length > 1) {
      const groups = [];
      for (let i = 0; i < parts.length; i += 3) {
        groups.push(parts.slice(i, i + 3));
      }
      const lastGroup = groups[groups.length - 1];
      const lastItem = lastGroup.pop();
      const lastGroupText = lastGroup.length
        ? `${lastGroup.join(', ')} ${andText} ${lastItem}`
        : `${andText} ${lastItem}`;
      groups[groups.length - 1] = lastGroupText;
      text = groups
        .map((g) => (Array.isArray(g) ? g.join(', ') : g))
        .join(',<br>');
    }
    return text;
  };

  const minimalParts = (value, currencyNames, andText) => {
    let remaining = value;
    const items = [];
    denominations.forEach(({ coin, multiplier, value: val }) => {
      if (remaining <= 0) return;
      const qty = Math.floor(remaining / val);
      if (qty > 0) {
        remaining -= qty * val;
        items.push({ coin, multiplier, qty });
      }
    });
    const text = formatItemsText(items, currencyNames, andText);

    return { text, remaining, items };
  };

  const goldEquivalent = (value, currencyNames, andText) => {
    const items = [];
    const goldQty = Math.floor(value / rates.gold);
    if (goldQty > 0) items.push({ coin: 'gold', multiplier: 1, qty: goldQty });
    const remainder = value % rates.gold;
    if (remainder > 0) {
      items.push(...minimalParts(remainder, currencyNames, andText).items);
    }
    const text = formatItemsText(items, currencyNames, andText);
    return { items, text };
  };

  const updateBaseFromAdvanced = (currency) => {
    const total = Array.from(advancedInputs)
      .filter((input) => input.dataset.currency === currency)
      .reduce((sum, input) => {
        const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
        const mult = parseInt(input.dataset.multiplier, 10);
        return sum + amount * mult;
      }, 0);
    const source = document.querySelector(
      `#currency-sources input[data-currency="${currency}"]`
    );
    if (source) source.value = total;
  };

  const updateAdvancedFromBase = (currency) => {
    const source = document.querySelector(
      `#currency-sources input[data-currency="${currency}"]`
    );
    if (!source) return;
    let value = Math.max(0, Math.floor(parseFloat(source.value) || 0));
    multipliers
      .slice()
      .reverse()
      .forEach((mult) => {
        const field = document.querySelector(
          `.advanced-group input[data-currency="${currency}"][data-multiplier="${mult}"]`
        );
        if (field) {
          const qty = Math.floor(value / mult);
          field.value = qty;
          value -= qty * mult;
        }
      });
  };

  /**
   * Render converted values for all currencies.
   */
  const render = () => {
    const tr = window.i18n?.shop?.converter || {};
    const currencyNames = {
      copper: tr.copper || 'pièce de cuivre',
      silver: tr.silver || 'pièce d’argent',
      electrum: tr.electrum || 'pièce d’électrum',
      gold: tr.gold || 'pièce d’or',
      platinum: tr.platinum || 'pièce de platine',
    };
    const localeConjunction =
      new Intl.ListFormat(locale, { type: 'conjunction' })
        .formatToParts(['a', 'b'])
        .find((p) => p.type === 'literal')
        ?.value.trim() || 'and';
    const andText = tr.and || localeConjunction;

    const calculateTotals = (copperValue) => {
      const minimal = minimalParts(copperValue, currencyNames, andText);
      const goldTotal = goldEquivalent(copperValue, currencyNames, andText);
      const perCoinCounts = {};
      const remainderItems = {};

      coins.forEach((coin) => {
        const base = rates[coin];
        const units = Math.floor(copperValue / base);
        const parts = [];
        if (units > 0) {
          let rest = units;
          multipliers
            .slice()
            .reverse()
            .forEach((mult) => {
              const qty = Math.floor(rest / mult);
              if (qty > 0) {
                parts.push({ qty, mult });
                rest -= qty * mult;
              }
            });
        }
        perCoinCounts[coin] = parts;
        const remainder = copperValue % base;
        remainderItems[coin] =
          remainder > 0
            ? minimalParts(remainder, currencyNames, andText).items
            : [];
      });

      return {
        minimalText: minimal.text,
        minimalItems: minimal.items,
        goldText: goldTotal.text,
        goldItems: goldTotal.items,
        perCoinCounts,
        remainderItems,
      };
    };

    const baseSources = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
      return sum + amount * rates[currency];
    }, 0);
    const baseValue = baseSources;

    const totalsData = calculateTotals(baseValue);
    totalBreakdown.innerHTML = totalsData.minimalText;
    totalGold.innerHTML = totalsData.goldText;
    const totalPiecesCount = totalsData.minimalItems.reduce(
      (sum, { qty }) => sum + qty,
      0,
    );
    totalPiecesEl.textContent = nf.format(totalPiecesCount);
    const showTotals = totalsData.minimalText || totalsData.goldText;
    equivFoot.classList.toggle('hidden', !showTotals);

    equivBody.innerHTML = '';
    let hasEquiv = false;
    coins.forEach((coin) => {
      const parts = totalsData.perCoinCounts[coin];
      if (!parts.length) return;
      const summaryParts = parts.map(({ qty, mult }) => {
        const label = currencyNames[coin].replace(
          /^pièce/,
          qty > 1 ? 'pièces' : 'pièce',
        );
        return mult === 1
          ? `${nf.format(qty)} ${label}`
          : `${nf.format(qty)} ${label} x${nf.format(mult)}`;
      });
      const remainderItems = totalsData.remainderItems[coin];
      const remainderLines = remainderItems.map(
        ({ coin: rCoin, multiplier, qty }) => {
          const label = currencyNames[rCoin].replace(
            /^pièce/,
            qty > 1 ? 'pièces' : 'pièce',
          );
          return multiplier === 1
            ? `${nf.format(qty)} ${label}`
            : `${nf.format(qty)} ${label} x${nf.format(multiplier)}`;
        }
      );
      const remainderText = remainderLines.join('<br>');
      const totalRowPieces = Math.floor(
        parts.reduce((sum, { qty }) => sum + qty, 0) +
          remainderItems.reduce((sum, { qty }) => sum + qty, 0),
      );
      const base = rates[coin];
      const totalValue = Math.floor(
        parts.reduce((sum, { qty, mult: m }) => sum + qty * m, 0) +
          remainderItems.reduce(
            (sum, { coin: rCoin, multiplier, qty }) =>
              sum + (qty * multiplier * rates[rCoin]) / base,
            0,
          ),
      );
      const label = currencyNames[coin].replace(
        /^pièce/,
        totalValue > 1 ? 'pièces' : 'pièce',
      );
      const summary = `${summaryParts.join('<br>')}<hr>${
        tr.equivTotalValue || 'Total:'
      } ${nf.format(totalValue)} ${label}`;
      const row = document.createElement('tr');
      const coinTitle = currencyNames[coin]
        .replace(/^pièces?\s+(?:de|d['’])\s*/i, '')
        .replace(/^./, (ch) => ch.toUpperCase());
      row.innerHTML = `<th>${coinTitle}</th><td>${summary}</td><td>${remainderText}</td><td>${nf.format(
        totalRowPieces,
      )}</td>`;
      equivBody.appendChild(row);
      hasEquiv = true;
    });
    equivContainer.classList.toggle('hidden', !hasEquiv && !showTotals);
  };

  const addHandlers = (inputEl, onInput) => {
    const el = inputEl;
    el.addEventListener('focus', () => {
      if (el.value === '0') el.value = '';
    });
    el.addEventListener('input', () => {
      el.value = el.value.replace(/[^0-9.-]/g, '');
      const value = parseFloat(el.value);
      const invalid = Number.isFinite(value) && (value < 0 || !Number.isInteger(value));
      el.setCustomValidity(invalid ? 'Veuillez saisir un entier positif' : '');
      if (invalid) el.reportValidity();
      if (typeof onInput === 'function') onInput(el);
      render();
    });
  };

  sources.forEach((input) =>
    addHandlers(input, (el) => updateAdvancedFromBase(el.dataset.currency))
  );
  advancedInputs.forEach((input) =>
    addHandlers(input, (el) => updateBaseFromAdvanced(el.dataset.currency))
  );

  advancedToggle?.addEventListener('click', () => {
    advancedGroups.forEach((group) => group.classList.toggle('hidden'));
    // Ensure freshly revealed fields get their translated labels
    if (window.i18n?.apply) window.i18n.apply();
  });

  // Initial render
  render();

  // =============================================
  // CALCULATEUR INTELLIGENT GEEKNDRAGON
  // =============================================
  
  // Configuration des lots GeeknDragon
  const geeknDragonLots = {
    'lot10': {
      id: 'lot10',
      name: "L'Offrande du Voyageur",
      price: 60,
      pieces: { copper: 2, silver: 2, electrum: 2, gold: 2, platinum: 2 },
      multiplierChoice: true, // Un seul multiplicateur pour tout le lot
      maxMultiplier: 10000,
      url: '/produit-offrande-voyageur.php'
    },
    'lot25': {
      id: 'lot25', 
      name: "La Monnaie des Cinq Royaumes",
      price: 145,
      pieces: { copper: 5, silver: 5, electrum: 5, gold: 5, platinum: 5 }, // 1 de chaque métal/multiplicateur
      multiplierChoice: false, // Tout inclus
      maxMultiplier: 10000,
      url: '/produit-monnaie-cinq-royaumes.php'
    },
    'lot50-essence': {
      id: 'lot50-essence',
      name: "L'Essence du Marchand", 
      price: 275,
      pieces: { copper: 10, silver: 10, electrum: 10, gold: 10, platinum: 10 }, // 2 de chaque métal/multiplicateur
      multiplierChoice: false, // Tout inclus
      maxMultiplier: 10000,
      url: '/produit-essence-marchand.php'
    },
    'lot50-tresorerie': {
      id: 'lot50-tresorerie',
      name: "La Trésorerie du Seigneur",
      price: 275,
      pieces: { copper: 10, silver: 10, electrum: 10, gold: 10, platinum: 10 },
      multiplierChoice: true, // Un seul multiplicateur pour tout le lot
      maxMultiplier: 10000,
      url: '/produit-tresorerie-seigneur.php'
    }
  };

  // Configuration des recommandations
  const recommendationConfig = {
    safetyMargin: 0.20, // +20% par défaut
    maxRecommendations: 3,
    prioritizePrice: true
  };

  /**
   * Calcule la capacité maximale d'un lot pour un multiplicateur donné
   */
  const calculateLotCapacity = (lot, multiplier = null) => {
    if (lot.multiplierChoice && multiplier) {
      // Lot avec choix de multiplicateur unique
      return lot.pieces.platinum * rates.platinum * multiplier;
    } else if (!lot.multiplierChoice) {
      // Lot avec tous les multiplicateurs inclus
      return lot.pieces.platinum * rates.platinum * lot.maxMultiplier;
    } else {
      // Capacité maximale théorique
      return lot.pieces.platinum * rates.platinum * lot.maxMultiplier;
    }
  };

  /**
   * Calcule la décomposition optimale pour un montant donné avec un lot
   */
  const calculateOptimalBreakdown = (lot, targetValueCopper, multiplier = null) => {
    let remaining = targetValueCopper;
    const breakdown = [];
    const availableMultipliers = multiplier ? [multiplier] : [10000, 1000, 100, 10, 1];
    
    // Garder une trace des pièces utilisées par type
    const usedPieces = {};
    coins.forEach(coin => usedPieces[coin] = 0);

    // Pour chaque multiplicateur (du plus élevé au plus faible)
    availableMultipliers.forEach(mult => {
      if (remaining <= 0) return;
      
      // Pour chaque métal (du plus précieux au moins précieux)
      coins.forEach(coin => {
        if (remaining <= 0) return;
        
        const coinRate = rates[coin];
        const availablePieces = (lot.pieces[coin] || 0) - usedPieces[coin];
        
        if (availablePieces <= 0) return;

        const coinValue = coinRate * mult;
        const maxUsable = Math.min(availablePieces, Math.floor(remaining / coinValue));
        
        if (maxUsable > 0) {
          breakdown.push({
            coin,
            multiplier: mult,
            quantity: maxUsable,
            value: maxUsable * coinValue
          });
          remaining -= maxUsable * coinValue;
          usedPieces[coin] += maxUsable;
        }
      });
    });

    return {
      breakdown,
      remainingValue: remaining,
      coverage: targetValueCopper > 0 ? ((targetValueCopper - remaining) / targetValueCopper) * 100 : 0
    };
  };

  /**
   * Génère les recommandations GeeknDragon
   */
  const generateGeeknDragonRecommendations = (copperValue) => {
    if (copperValue <= 0) return [];

    const targetWithMargin = copperValue * (1 + recommendationConfig.safetyMargin);
    const recommendations = [];

    // Analyser chaque lot
    Object.values(geeknDragonLots).forEach(lot => {
      if (lot.multiplierChoice) {
        // Tester chaque multiplicateur possible
        [1, 10, 100, 1000, 10000].forEach(mult => {
          const capacity = calculateLotCapacity(lot, mult);
          
          if (capacity >= copperValue) {
            const breakdown = calculateOptimalBreakdown(lot, copperValue, mult);
            const efficiency = breakdown.coverage;
            
            recommendations.push({
              lot,
              multiplier: mult,
              capacity,
              breakdown,
              efficiency,
              marginPercent: ((capacity - copperValue) / copperValue) * 100,
              priceEfficiency: copperValue / lot.price, // Valeur couverte par dollar
              label: `${lot.name} (x${nf.format(mult)})`
            });
          }
        });
      } else {
        // Lot avec tous multiplicateurs inclus
        const capacity = calculateLotCapacity(lot);
        
        if (capacity >= copperValue) {
          const breakdown = calculateOptimalBreakdown(lot, copperValue);
          const efficiency = breakdown.coverage;
          
          recommendations.push({
            lot,
            multiplier: null,
            capacity,
            breakdown,
            efficiency,
            marginPercent: ((capacity - copperValue) / copperValue) * 100,
            priceEfficiency: copperValue / lot.price,
            label: lot.name
          });
        }
      }
    });

    // Trier par prix (priorité définie) puis par efficacité
    recommendations.sort((a, b) => {
      if (recommendationConfig.prioritizePrice) {
        if (a.lot.price !== b.lot.price) return a.lot.price - b.lot.price;
        return b.efficiency - a.efficiency;
      } else {
        if (Math.abs(a.efficiency - b.efficiency) > 5) return b.efficiency - a.efficiency;
        return a.lot.price - b.lot.price;
      }
    });

    // Limiter aux meilleures recommandations
    return recommendations.slice(0, recommendationConfig.maxRecommendations);
  };

  /**
   * Formate la décomposition pour affichage
   */
  const formatBreakdown = (breakdown, currencyNames, andText) => {
    if (!breakdown || breakdown.length === 0) return '';
    
    const parts = breakdown.map(({ coin, multiplier, quantity }) => {
      const label = currencyNames[coin].replace(/^pièce/, quantity > 1 ? 'pièces' : 'pièce');
      return multiplier === 1 
        ? `${nf.format(quantity)} ${label}`
        : `${nf.format(quantity)} ${label} x${nf.format(multiplier)}`;
    });

    return parts.join(', ');
  };

  /**
   * Met à jour l'affichage des recommandations
   */
  const updateRecommendationsDisplay = (copperValue) => {
    const container = document.getElementById('gd-recommendations');
    if (!container) return;

    if (copperValue <= 0) {
      container.classList.add('hidden');
      return;
    }

    const recommendations = generateGeeknDragonRecommendations(copperValue);
    const content = container.querySelector('.gd-recommendations-content');
    
    if (!content || recommendations.length === 0) {
      container.classList.add('hidden');
      return;
    }

    const tr = window.i18n?.shop?.converter || {};
    const currencyNames = {
      copper: tr.copper || 'pièce de cuivre',
      silver: tr.silver || 'pièce d\'argent', 
      electrum: tr.electrum || 'pièce d\'électrum',
      gold: tr.gold || 'pièce d\'or',
      platinum: tr.platinum || 'pièce de platine',
    };
    const andText = tr.and || 'et';

    // Générer le HTML des recommandations
    const recommendationsHTML = recommendations.map((rec, index) => {
      const goldEquivalent = Math.floor(copperValue / rates.gold);
      const isOptimal = index === 0;
      const breakdownText = formatBreakdown(rec.breakdown.breakdown, currencyNames, andText);
      
      return `
        <div class="gd-recommendation-card ${isOptimal ? 'optimal' : ''}">
          <div class="recommendation-header">
            ${isOptimal ? '<span class="badge recommended">✨ Recommandé</span>' : ''}
            <h4>${rec.label}</h4>
            <div class="price">${rec.lot.price}$ CAD</div>
          </div>
          <div class="recommendation-details">
            <div class="capacity">
              <strong>Représente jusqu'à :</strong> ${nf.format(Math.floor(rec.capacity / rates.gold))} po
              <span class="margin">(+${rec.marginPercent.toFixed(0)}% de marge)</span>
            </div>
            <div class="efficiency">
              <strong>Efficacité :</strong> ${rec.efficiency.toFixed(1)}% des pièces utilisées
            </div>
            ${breakdownText ? `
              <div class="breakdown">
                <strong>Décomposition optimale :</strong> ${breakdownText}
              </div>
            ` : ''}
          </div>
          <div class="recommendation-actions">
            <a href="${rec.lot.url}" class="btn-secondary">📖 Voir Détails</a>
          </div>
        </div>
      `;
    }).join('');

    // Ajouter un bouton pour ajouter toutes les recommandations
    const addAllButton = recommendations.length > 0 ? `
      <div class="gd-add-all-recommendations">
        <button class="btn-primary gd-add-all-button" style="width: 100%; margin-bottom: 1.5rem; font-size: 1.1rem; padding: 1rem;">
          ⚔️ Ajouter Toutes les Recommandations à l'Inventaire (${recommendations.reduce((sum, rec) => sum + rec.lot.price, 0).toFixed(2)}$ CAD)
        </button>
      </div>
    ` : '';

    content.innerHTML = addAllButton + recommendationsHTML;
    container.classList.remove('hidden');
    
    // Ajouter l'event listener pour le bouton "Ajouter tout"
    if (recommendations.length > 0) {
      setupAddAllButton(recommendations);
    }
  };

  /**
   * Configure les event listeners pour les boutons d'ajout au panier des recommandations
   */
  const setupRecommendationCartButtons = () => {
    const cartButtons = document.querySelectorAll('.gd-add-to-cart-recommendation');
    
    cartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        handleRecommendationAddToCart(button);
      });
    });
  };

  /**
   * Gère l'ajout au panier depuis une recommandation
   */
  const handleRecommendationAddToCart = (button) => {
    const itemData = {
      id: button.getAttribute('data-item-id'),
      name: button.getAttribute('data-item-name'),
      price: parseFloat(button.getAttribute('data-item-price')),
      url: button.getAttribute('data-item-url'),
      description: button.getAttribute('data-item-description'),
      currency: button.getAttribute('data-item-currency') || 'CAD',
      weight: button.getAttribute('data-item-weight') || '150',
      shipping: button.getAttribute('data-item-shipping') || 'coins'
    };

    // Ajouter les variantes personnalisées si présentes
    const customFields = {};
    if (button.getAttribute('data-item-custom1-name')) {
      customFields.custom1 = {
        name: button.getAttribute('data-item-custom1-name'),
        value: button.getAttribute('data-item-custom1-value')
      };
    }

    // Vérifier si Snipcart est disponible
    if (typeof window.Snipcart !== 'undefined' && window.Snipcart.api) {
      // Méthode Snipcart standard
      window.Snipcart.api.cart.items.add({
        id: itemData.id,
        name: itemData.name,
        price: itemData.price,
        url: itemData.url,
        description: itemData.description,
        currency: itemData.currency,
        weight: parseInt(itemData.weight),
        categories: [itemData.shipping],
        customFields: customFields
      });

      // Feedback visuel
      showAddToCartFeedback(button, itemData);
    } else {
      // Fallback : créer un élément Snipcart temporaire et le cliquer
      const tempButton = document.createElement('button');
      tempButton.className = 'snipcart-add-item';
      tempButton.setAttribute('data-item-id', itemData.id);
      tempButton.setAttribute('data-item-name', itemData.name);
      tempButton.setAttribute('data-item-price', itemData.price);
      tempButton.setAttribute('data-item-url', itemData.url);
      tempButton.setAttribute('data-item-description', itemData.description);
      tempButton.setAttribute('data-item-currency', itemData.currency);
      tempButton.setAttribute('data-item-weight', itemData.weight);
      tempButton.setAttribute('data-item-categories', itemData.shipping);
      
      if (customFields.custom1) {
        tempButton.setAttribute('data-item-custom1-name', customFields.custom1.name);
        tempButton.setAttribute('data-item-custom1-value', customFields.custom1.value);
      }
      
      tempButton.style.display = 'none';
      document.body.appendChild(tempButton);
      tempButton.click();
      document.body.removeChild(tempButton);

      // Feedback visuel
      showAddToCartFeedback(button, itemData);
    }

    // Analytics tracking
    trackRecommendationAddToCart(itemData, customFields);
  };

  /**
   * Affiche un feedback visuel lors de l'ajout au panier
   */
  const showAddToCartFeedback = (button, itemData) => {
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Ajouté !';
    button.classList.add('success');
    button.disabled = true;

    // Animation du bouton
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    // Restaurer le bouton après 3 secondes
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('success');
      button.disabled = false;
    }, 3000);

    // Notification toast (optionnelle)
    showRecommendationToast(itemData);
  };

  /**
   * Affiche une notification toast pour l'ajout au panier
   */
  const showRecommendationToast = (itemData) => {
    // Vérifier si une notification existe déjà
    const existingToast = document.querySelector('.gd-recommendation-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'gd-recommendation-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">🎒</div>
        <div class="toast-message">
          <strong>${itemData.name}</strong><br>
          ajouté à votre inventaire d'aventurier !
        </div>
      </div>
    `;

    // Styles inline pour la notification
    Object.assign(toast.style, {
      position: 'fixed',
      top: '100px',
      right: '20px',
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
      color: 'var(--parchment)',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '2px solid var(--secondary-color)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
      zIndex: '10001',
      fontFamily: 'var(--font-heading)',
      fontWeight: '600',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'gdSlideInRight 0.5s ease-out forwards'
    });

    document.body.appendChild(toast);

    // Supprimer après 4 secondes
    setTimeout(() => {
      toast.style.animation = 'gdSlideOutRight 0.5s ease-in forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 4000);
  };

  /**
   * Tracking analytics pour les ajouts au panier depuis les recommandations
   */
  const trackRecommendationAddToCart = (itemData, customFields) => {
    // Google Analytics 4
    if (window.gtag) {
      gtag('event', 'add_to_cart_recommendation', {
        currency: itemData.currency,
        value: itemData.price,
        items: [{
          item_id: itemData.id,
          item_name: itemData.name,
          item_category: 'recommendation',
          price: itemData.price,
          quantity: 1,
          custom_parameters: customFields
        }]
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      fbq('track', 'AddToCart', {
        content_ids: [itemData.id],
        content_type: 'product',
        value: itemData.price,
        currency: itemData.currency,
        source: 'recommendation_calculator'
      });
    }

    console.log(`🎯 Recommandation ajoutée au panier: ${itemData.name} - ${itemData.price}$ ${itemData.currency}`);
  };

  /**
   * Configure le bouton "Ajouter toutes les recommandations"
   */
  const setupAddAllButton = (recommendations) => {
    const addAllButton = document.querySelector('.gd-add-all-button');
    if (!addAllButton) return;

    addAllButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleAddAllRecommendations(recommendations, addAllButton);
    });
  };

  /**
   * Ajoute toutes les recommandations au panier en une fois
   */
  const handleAddAllRecommendations = (recommendations, button) => {
    const originalText = button.innerHTML;
    let addedCount = 0;
    const totalItems = recommendations.length;

    // Feedback visuel immédiat
    button.innerHTML = '⏳ Ajout en cours...';
    button.disabled = true;

    // Ajouter chaque recommandation avec un délai pour éviter les conflits Snipcart
    recommendations.forEach((rec, index) => {
      setTimeout(() => {
        const itemData = {
          id: rec.lot.id,
          name: rec.lot.name,
          price: rec.lot.price,
          url: rec.lot.url,
          description: `Lot recommandé par le calculateur GeeknDragon`,
          currency: 'CAD',
          weight: '150',
          shipping: 'coins'
        };

        // Ajouter les variantes personnalisées si présentes
        const customFields = {};
        if (rec.multiplier) {
          customFields.custom1 = {
            name: 'Multiplicateur',
            value: `x${rec.multiplier}`
          };
        }

        // Ajouter à Snipcart
        if (typeof window.Snipcart !== 'undefined' && window.Snipcart.api) {
          window.Snipcart.api.cart.items.add({
            id: itemData.id,
            name: itemData.name,
            price: itemData.price,
            url: itemData.url,
            description: itemData.description,
            currency: itemData.currency,
            weight: parseInt(itemData.weight),
            categories: [itemData.shipping],
            customFields: customFields
          });
        } else {
          // Fallback
          const tempButton = document.createElement('button');
          tempButton.className = 'snipcart-add-item';
          tempButton.setAttribute('data-item-id', itemData.id);
          tempButton.setAttribute('data-item-name', itemData.name);
          tempButton.setAttribute('data-item-price', itemData.price);
          tempButton.setAttribute('data-item-url', itemData.url);
          tempButton.setAttribute('data-item-description', itemData.description);
          tempButton.setAttribute('data-item-currency', itemData.currency);
          tempButton.setAttribute('data-item-weight', itemData.weight);
          tempButton.setAttribute('data-item-categories', itemData.shipping);
          
          if (customFields.custom1) {
            tempButton.setAttribute('data-item-custom1-name', customFields.custom1.name);
            tempButton.setAttribute('data-item-custom1-value', customFields.custom1.value);
          }
          
          tempButton.style.display = 'none';
          document.body.appendChild(tempButton);
          tempButton.click();
          document.body.removeChild(tempButton);
        }

        addedCount++;

        // Tracking individual
        trackRecommendationAddToCart(itemData, customFields);

        // Feedback final quand tous les items sont ajoutés
        if (addedCount === totalItems) {
          button.innerHTML = `✅ ${totalItems} Lots Ajoutés !`;
          button.classList.add('success');

          // Notification toast globale
          showAllRecommendationsToast(recommendations);

          // Tracking global
          trackAllRecommendationsAddToCart(recommendations);

          // Restaurer le bouton après 5 secondes
          setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
            button.disabled = false;
          }, 5000);
        }
      }, index * 300); // Délai de 300ms entre chaque ajout
    });
  };

  /**
   * Notification toast pour l'ajout de toutes les recommandations
   */
  const showAllRecommendationsToast = (recommendations) => {
    const existingToast = document.querySelector('.gd-recommendation-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const totalPrice = recommendations.reduce((sum, rec) => sum + rec.lot.price, 0);

    const toast = document.createElement('div');
    toast.className = 'gd-recommendation-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">🎒✨</div>
        <div class="toast-message">
          <strong>${recommendations.length} Lots Recommandés</strong><br>
          ajoutés à votre inventaire d'aventurier !<br>
          <small>Total: ${totalPrice.toFixed(2)}$ CAD</small>
        </div>
      </div>
    `;

    // Styles avec version étendue
    Object.assign(toast.style, {
      position: 'fixed',
      top: '100px',
      right: '20px',
      background: 'linear-gradient(135deg, var(--mystical-purple) 0%, var(--dragon-red) 50%, var(--forest-green) 100%)',
      color: 'var(--parchment)',
      padding: '20px 24px',
      borderRadius: '12px',
      border: '3px solid var(--secondary-color)',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.4)',
      zIndex: '10001',
      fontFamily: 'var(--font-heading)',
      fontWeight: '600',
      minWidth: '350px',
      maxWidth: '450px',
      animation: 'gdSlideInRight 0.7s ease-out forwards'
    });

    document.body.appendChild(toast);

    // Supprimer après 6 secondes
    setTimeout(() => {
      toast.style.animation = 'gdSlideOutRight 0.7s ease-in forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 700);
    }, 6000);
  };

  /**
   * Tracking analytics pour l'ajout de toutes les recommandations
   */
  const trackAllRecommendationsAddToCart = (recommendations) => {
    const totalValue = recommendations.reduce((sum, rec) => sum + rec.lot.price, 0);

    // Google Analytics 4
    if (window.gtag) {
      gtag('event', 'add_all_recommendations_to_cart', {
        currency: 'CAD',
        value: totalValue,
        items: recommendations.map(rec => ({
          item_id: rec.lot.id,
          item_name: rec.lot.name,
          item_category: 'recommendation_bulk',
          price: rec.lot.price,
          quantity: 1
        }))
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      fbq('track', 'AddToCart', {
        content_ids: recommendations.map(rec => rec.lot.id),
        content_type: 'product',
        value: totalValue,
        currency: 'CAD',
        num_items: recommendations.length,
        source: 'recommendation_calculator_bulk'
      });
    }

    console.log(`🎯 ${recommendations.length} recommandations ajoutées en lot au panier - Total: ${totalValue.toFixed(2)}$ CAD`);
  };

  // Intégrer les recommandations dans le rendu principal
  const originalRender = render;
  render = () => {
    originalRender();
    
    // Calculer la valeur totale en cuivre
    const baseSources = Array.from(sources).reduce((sum, input) => {
      const { currency } = input.dataset;
      const amount = Math.max(0, Math.floor(parseFloat(input.value) || 0));
      return sum + amount * rates[currency];
    }, 0);
    
    // Mettre à jour les recommandations
    updateRecommendationsDisplay(baseSources);
  };

})();
