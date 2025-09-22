/**
 * Gestionnaire des lots de pièces recommandés par le convertisseur.
 *
 * Le module charge le catalogue des produits de pièces, observe le convertisseur
 * existant et propose automatiquement la combinaison de lots permettant de
 * couvrir la répartition calculée (multiplicateurs inclus). Un bouton dédié
 * ajoute l'ensemble au panier via Snipcart.
 */
(() => {
  const SECTION_ID = 'currency-lot-recommendations';
  const LIST_ID = 'currency-lot-recommendations-list';
  const EMPTY_ID = 'currency-lot-recommendations-empty';
  const SUMMARY_ID = 'currency-lot-recommendations-summary';
  const BUTTON_ID = 'currency-lot-recommendations-button';
  const ERROR_ID = 'currency-lot-recommendations-error';
  const DEFAULT_MULTIPLIERS = Object.freeze([1, 10, 100, 1000, 10000]);

  const sanitizeInteger = (value) => {
    if (value == null) {
      return 0;
    }
    const cleaned = String(value).replace(/[^\d]/gu, '');
    if (cleaned === '') {
      return 0;
    }
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const deepGet = (obj, path) => {
    if (!obj) {
      return undefined;
    }
    const segments = Array.isArray(path) ? path : String(path).split('.');
    return segments.reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  const translate = (path, fallback) => {
    const value = deepGet(window.i18n, path);
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
  };

  class CurrencyLotRecommender {
    constructor() {
      this.section = document.getElementById(SECTION_ID);
      this.list = document.getElementById(LIST_ID);
      this.emptyMessage = document.getElementById(EMPTY_ID);
      this.summary = document.getElementById(SUMMARY_ID);
      this.button = document.getElementById(BUTTON_ID);
      this.error = document.getElementById(ERROR_ID);
      this.lang = (document.documentElement.lang || 'fr').toLowerCase();
      this.numberFormatter = new Intl.NumberFormat(this.lang.startsWith('en') ? 'en-US' : 'fr-FR');
      this.origin = window.location.origin
        || `${window.location.protocol}//${window.location.host}`;

      this.converter = null;
      this.rawProductData = null;
      this.productsData = { singlesByMultiplier: new Map(), bundles: [], products: [] };
      this.multipliers = [...DEFAULT_MULTIPLIERS];
      this.recommendations = [];
      this.loading = false;
      this.productLoadError = false;

      if (this.button) {
        this.button.addEventListener('click', () => {
          this.handleAddAll();
        });
      }
    }

    init() {
      if (!this.section) {
        return;
      }
      this.loadProducts();
      this.observeConverter();
    }

    loadProducts() {
      fetch('/data/products.json', { credentials: 'same-origin' })
        .then((response) => {
          if (!response || !response.ok) {
            throw new Error('Produit introuvable');
          }
          return response.json();
        })
        .then((data) => {
          this.rawProductData = data;
          this.productsData = this.parseProducts(data);
          this.refreshIfReady();
        })
        .catch((error) => {
          this.productLoadError = true;
          if (this.error) {
            this.showError(translate('gameHelp.currencyLots.error',
              "Impossible d'ajouter les lots recommandés pour le moment. Veuillez réessayer."));
          }
          console.error('[GD] Échec du chargement des produits de pièces :', error);
        });
    }

    observeConverter() {
      const attemptAttach = () => {
        const converter = window.converterInstance;
        if (!converter || typeof converter.getTotalBaseValue !== 'function') {
          return false;
        }
        this.attachConverter(converter);
        return true;
      };

      if (attemptAttach()) {
        return;
      }

      const interval = window.setInterval(() => {
        if (attemptAttach()) {
          window.clearInterval(interval);
        }
      }, 200);
    }

    attachConverter(converter) {
      if (!converter || this.converter === converter) {
        return;
      }

      this.converter = converter;
      if (Array.isArray(converter.multipliers) && converter.multipliers.length > 0) {
        this.multipliers = converter.multipliers
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => a - b);
      }

      if (this.rawProductData) {
        this.productsData = this.parseProducts(this.rawProductData);
      }

      if (converter.__lotRecommenderPatched) {
        this.refreshIfReady();
        return;
      }

      const originalUpdate = typeof converter.updateOptimalRecommendations === 'function'
        ? converter.updateOptimalRecommendations.bind(converter)
        : null;

      converter.updateOptimalRecommendations = (baseValue) => {
        if (originalUpdate) {
          originalUpdate(baseValue);
        }
        const numericBase = Number.isFinite(baseValue) ? baseValue : converter.getTotalBaseValue();
        this.handleUpdate(numericBase);
      };

      Object.defineProperty(converter, '__lotRecommenderPatched', {
        value: true,
        configurable: true,
        enumerable: false,
        writable: false,
      });

      this.handleUpdate(converter.getTotalBaseValue());
    }

    parseProducts(data) {
      const result = {
        singlesByMultiplier: new Map(),
        bundles: [],
        products: [],
      };

      const multipliers = this.getMultipliers();
      multipliers.forEach((mult) => {
        result.singlesByMultiplier.set(mult, []);
      });

      if (!data || typeof data !== 'object') {
        return result;
      }

      let orderCounter = 0;

      Object.entries(data).forEach(([id, product]) => {
        if (typeof id !== 'string' || !/^lot/iu.test(id) || !product || typeof product !== 'object') {
          return;
        }

        const names = {
          fr: typeof product.name === 'string' ? product.name : '',
          en: typeof product.name_en === 'string' ? product.name_en : (
            typeof product.name === 'string' ? product.name : ''
          ),
        };
        const price = Number.parseFloat(product.price);
        const normalizedPrice = Number.isFinite(price) ? price : 0;
        const url = `${this.origin}/product.php?id=${encodeURIComponent(id)}`;
        const selectableMultipliers = Array.isArray(product.multipliers)
          ? product.multipliers
            .map((value) => Number.parseInt(value, 10))
            .filter((value) => Number.isFinite(value))
          : [];

        const coinBreakdown = this.buildCoinBreakdown(product);

        if (selectableMultipliers.length > 0) {
          selectableMultipliers.forEach((multiplier) => {
            const entry = coinBreakdown.get(multiplier);
            if (!entry || !Number.isFinite(entry.total) || entry.total <= 0) {
              return;
            }

            const variant = {
              productId: id,
              names,
              price: normalizedPrice,
              url,
              totalCoins: entry.total,
              type: 'single',
              multiplier,
              coverage: new Map([[multiplier, entry.total]]),
              breakdown: new Map([[multiplier, entry]]),
              order: orderCounter,
            };
            orderCounter += 1;

            if (!result.singlesByMultiplier.has(multiplier)) {
              result.singlesByMultiplier.set(multiplier, []);
            }
            result.singlesByMultiplier.get(multiplier).push(variant);
            result.products.push(variant);
          });
          return;
        }

        if (coinBreakdown.size === 0) {
          return;
        }

        const breakdownEntries = Array.from(coinBreakdown.entries())
          .filter(([, entry]) => Number.isFinite(entry?.total) && entry.total > 0);
        if (breakdownEntries.length === 0) {
          return;
        }

        const coverage = new Map();
        let totalCoins = 0;
        breakdownEntries.forEach(([multiplier, entry]) => {
          coverage.set(multiplier, entry.total);
          totalCoins += entry.total;
        });

        if (totalCoins <= 0) {
          return;
        }

        const bundle = {
          productId: id,
          names,
          price: normalizedPrice,
          url,
          totalCoins,
          type: 'bundle',
          coverage,
          breakdown: new Map(breakdownEntries),
          order: orderCounter,
        };
        orderCounter += 1;

        result.products.push(bundle);
        result.bundles.push(bundle);
      });

      result.singlesByMultiplier.forEach((options) => {
        options.sort((a, b) => b.totalCoins - a.totalCoins);
      });
      result.bundles.sort((a, b) => b.totalCoins - a.totalCoins);

      return result;
    }

    /**
     * Construit la répartition des pièces décrite dans le produit.
     * @param {object} product Données brutes du produit.
     * @returns {Map<number, {total: number, metals: Record<string, number>}>}
     * Map des multiplicateurs vers les quantités correspondantes.
     */
    buildCoinBreakdown(product) {
      const breakdown = new Map();
      if (!product || typeof product !== 'object') {
        return breakdown;
      }

      const rawBreakdown = product.coin_breakdown;
      if (!rawBreakdown || typeof rawBreakdown !== 'object') {
        return breakdown;
      }

      const perMultiplier = rawBreakdown.per_multiplier || rawBreakdown.perMultiplier;
      if (!perMultiplier || typeof perMultiplier !== 'object') {
        return breakdown;
      }

      Object.entries(perMultiplier).forEach(([multiplierKey, entry]) => {
        const multiplier = Number.parseInt(multiplierKey, 10);
        if (!Number.isFinite(multiplier)) {
          return;
        }
        const sanitized = this.sanitizeCoinBreakdownEntry(entry);
        if (!sanitized) {
          return;
        }
        breakdown.set(multiplier, sanitized);
      });

      return breakdown;
    }

    /**
     * Nettoie les détails d'un multiplicateur pour n'en conserver que les valeurs entières.
     * @param {object} entry Détail brut.
     * @returns {{total: number, metals: Record<string, number>}|null} Données nettoyées.
     */
    sanitizeCoinBreakdownEntry(entry) {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const cleanedMetals = {};
      let metalsTotal = 0;
      if (entry.metals && typeof entry.metals === 'object') {
        Object.entries(entry.metals).forEach(([metal, quantity]) => {
          const parsed = Number.parseInt(quantity, 10);
          if (Number.isFinite(parsed) && parsed > 0) {
            cleanedMetals[metal] = parsed;
            metalsTotal += parsed;
          }
        });
      }

      let total = Number.parseInt(entry.total, 10);
      if (!Number.isFinite(total) || total <= 0) {
        total = metalsTotal;
      }

      if (!Number.isFinite(total) || total <= 0) {
        return null;
      }

      return {
        total,
        metals: cleanedMetals,
      };
    }

    /**
     * Liste les multiplicateurs couverts par un produit avec leurs quantités.
     * @param {object} product Produit enrichi par parseProducts.
     * @returns {Array<[number, number]>} Paires multiplicateur/quantité triées.
     */
    getCoverageEntries(product) {
      if (!product || !(product.coverage instanceof Map)) {
        return [];
      }
      return Array.from(product.coverage.entries())
        .filter(([, value]) => Number.isFinite(value) && value > 0)
        .sort((a, b) => a[0] - b[0]);
    }

    /**
     * Produit une description lisible de la couverture d'un bundle.
     * @param {object} product Produit considéré.
     * @param {string} perMultiplierLabel Libellé « pièces par multiplicateur ».
     * @returns {string} Description prête à afficher.
     */
    describeBundleCoverage(product, perMultiplierLabel) {
      const entries = this.getCoverageEntries(product);
      if (!entries.length) {
        return '';
      }
      const values = entries.map(([, value]) => value);
      const allEqual = values.every((value) => value === values[0]);
      if (allEqual) {
        return `${this.numberFormatter.format(values[0])} ${perMultiplierLabel}`;
      }
      return entries
        .map(([multiplier, value]) => {
          const multiplierText = `×${this.numberFormatter.format(multiplier)}`;
          const valueText = this.numberFormatter.format(value);
          return `${multiplierText} : ${valueText}`;
        })
        .join(' • ');
    }

    getMultipliers() {
      if (!Array.isArray(this.multipliers) || this.multipliers.length === 0) {
        return [...DEFAULT_MULTIPLIERS];
      }
      return [...this.multipliers];
    }

    refreshIfReady() {
      if (!this.converter || !this.productsData) {
        return;
      }
      this.handleUpdate(this.converter.getTotalBaseValue());
    }

    buildRequirements() {
      const requirements = new Map();
      const inputs = this.converter?.sourceInputs ? Array.from(this.converter.sourceInputs) : [];
      const multiplierInputs = this.converter?.multiplierInputs
        ? Array.from(this.converter.multiplierInputs)
        : [];

      const manualMultiplierNeeds = new Map();

      // Les cases multiplicateurs saisies manuellement (> ×1) doivent être prises en compte
      // explicitement afin d'ajouter les lots correspondants en recommandation.

      multiplierInputs.forEach((input) => {
        if (!input || input.dataset?.userEdited !== 'true') {
          return;
        }

        const multiplier = Number.parseInt(input.dataset?.multiplier, 10);
        if (!Number.isFinite(multiplier) || multiplier <= 1) {
          return;
        }

        const quantity = sanitizeInteger(input.value);
        if (quantity <= 0) {
          return;
        }

        const previous = manualMultiplierNeeds.get(multiplier) || 0;
        manualMultiplierNeeds.set(multiplier, previous + quantity);
      });

      manualMultiplierNeeds.forEach((quantity, multiplier) => {
        requirements.set(multiplier, quantity);
      });

      inputs.forEach((input) => {
        const value = sanitizeInteger(input?.value);
        if (value <= 0) {
          return;
        }
        const breakdown = this.converter.getMinimalCoinsBreakdown(value) || [];
        breakdown.forEach((item) => {
          const multiplier = Number.parseInt(item?.multiplier, 10);
          const quantity = Number.parseInt(item?.quantity, 10);
          if (!Number.isFinite(multiplier) || !Number.isFinite(quantity) || quantity <= 0) {
            return;
          }
          const previous = requirements.get(multiplier) || 0;
          requirements.set(multiplier, previous + quantity);
        });
      });

      return requirements;
    }

    computeRecommendations(requirements) {
      const positiveRequirements = Array.from(requirements.entries())
        .filter(([, quantity]) => Number.isFinite(quantity) && quantity > 0)
        .sort((a, b) => a[0] - b[0]);

      if (positiveRequirements.length === 0) {
        return [];
      }

      const multipliers = positiveRequirements.map(([multiplier]) => multiplier);
      const targets = positiveRequirements.map(([, quantity]) => quantity);

      const products = Array.isArray(this.productsData?.products)
        ? this.productsData.products
        : [];
      if (!products.length) {
        return [];
      }

      const candidateProducts = [];
      const coverageVectors = [];

      products.forEach((product) => {
        if (!(product?.coverage instanceof Map)) {
          return;
        }
        const vector = multipliers.map((multiplier) => {
          const value = product.coverage.get(multiplier);
          return Number.isFinite(value) && value > 0 ? value : 0;
        });
        if (vector.every((value) => value === 0)) {
          return;
        }
        candidateProducts.push(product);
        coverageVectors.push(vector);
      });

      if (!candidateProducts.length) {
        return [];
      }

      const impossible = multipliers.some((multiplier, index) => coverageVectors
        .every((vector) => vector[index] === 0));
      if (impossible) {
        return [];
      }

      const startCoverage = targets.map(() => 0);
      const startKey = startCoverage.join('|');
      const goalKey = targets.join('|');

      const queue = [{
        key: startKey,
        coverage: startCoverage,
        cost: 0,
        totalCoins: 0,
      }];
      const visited = new Map([[startKey, { cost: 0, totalCoins: 0 }]]);
      const parents = new Map();

      while (queue.length > 0) {
        let bestIndex = 0;
        for (let i = 1; i < queue.length; i += 1) {
          const candidate = queue[i];
          const best = queue[bestIndex];
          if (candidate.cost < best.cost
            || (candidate.cost === best.cost && candidate.totalCoins < best.totalCoins)) {
            bestIndex = i;
          }
        }

        const current = queue.splice(bestIndex, 1)[0];

        if (current.key === goalKey) {
          break;
        }

        candidateProducts.forEach((product, productIndex) => {
          const vector = coverageVectors[productIndex];
          let contributes = false;
          const newCoverage = current.coverage.map((value, idx) => {
            const addition = vector[idx];
            if (addition > 0) {
              contributes = true;
              const target = targets[idx];
              const updated = value + addition;
              return updated >= target ? target : updated;
            }
            return value;
          });

          if (!contributes) {
            return;
          }

          const newKey = newCoverage.join('|');
          if (newKey === current.key) {
            return;
          }

          const productPrice = Number.isFinite(product.price) ? product.price : 0;
          const newCost = current.cost + productPrice;
          const productCoins = Number.isFinite(product.totalCoins) ? product.totalCoins : 0;
          const newTotalCoins = current.totalCoins + productCoins;

          const existing = visited.get(newKey);
          if (existing && (existing.cost < newCost
            || (existing.cost === newCost && existing.totalCoins <= newTotalCoins))) {
            return;
          }

          visited.set(newKey, { cost: newCost, totalCoins: newTotalCoins });
          parents.set(newKey, { prevKey: current.key, productIndex });
          queue.push({
            key: newKey,
            coverage: newCoverage,
            cost: newCost,
            totalCoins: newTotalCoins,
          });
        });
      }

      if (!visited.has(goalKey)) {
        return [];
      }

      const counts = new Map();
      let cursor = goalKey;

      while (cursor !== startKey) {
        const step = parents.get(cursor);
        if (!step) {
          return [];
        }
        counts.set(step.productIndex, (counts.get(step.productIndex) || 0) + 1);
        cursor = step.prevKey;
      }

      const recommendations = Array.from(counts.entries())
        .map(([index, quantity]) => {
          const product = candidateProducts[index];
          const normalizedQuantity = Number.isFinite(quantity) ? quantity : 0;
          if (!product || normalizedQuantity <= 0) {
            return null;
          }
          const item = {
            type: product.type,
            product,
            quantity: normalizedQuantity,
          };
          if (product.type === 'single' && Number.isFinite(product.multiplier)) {
            item.multiplier = product.multiplier;
          }
          return item;
        })
        .filter((item) => item);

      recommendations.sort((a, b) => {
        const orderA = Number.isFinite(a.product?.order) ? a.product.order : 0;
        const orderB = Number.isFinite(b.product?.order) ? b.product.order : 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const priceA = Number.isFinite(a.product?.price) ? a.product.price : 0;
        const priceB = Number.isFinite(b.product?.price) ? b.product.price : 0;
        if (priceA !== priceB) {
          return priceA - priceB;
        }
        return 0;
      });

      return recommendations;
    }

    handleUpdate(baseValue) {
      if (!this.section || !this.converter) {
        return;
      }

      if (!Number.isFinite(baseValue) || baseValue <= 0) {
        this.reset();
        return;
      }

      if (this.productLoadError) {
        this.section.classList.remove('hidden');
        this.section.hidden = false;
        this.section.setAttribute('aria-hidden', 'false');
        this.recommendations = [];
        this.updateButtonAvailability();
        return;
      }

      const requirements = this.buildRequirements();
      const totalNeeded = Array.from(requirements.values()).reduce((sum, value) => sum + value, 0);
      if (totalNeeded <= 0) {
        this.reset();
        return;
      }

      const recommendations = this.computeRecommendations(requirements);
      this.recommendations = recommendations;

      if (!recommendations.length) {
        this.showEmpty();
        return;
      }

      this.hideError();
      this.render(recommendations);
    }

    render(recommendations) {
      if (!this.section || !this.list) {
        return;
      }

      this.section.classList.remove('hidden');
      this.section.hidden = false;
      this.section.setAttribute('aria-hidden', 'false');

      this.list.innerHTML = '';
      if (this.emptyMessage) {
        this.emptyMessage.hidden = true;
        this.emptyMessage.classList.add('hidden');
      }

      const multiplierLabel = translate('gameHelp.currencyLots.multiplierLabel', 'Multiplicateur');
      const bundleLabel = translate('gameHelp.currencyLots.bundleLabel', 'Couvre tous les multiplicateurs');
      const perMultiplierLabel = translate('gameHelp.currencyLots.perMultiplier', 'pièces par multiplicateur');
      const lotCountLabel = translate('gameHelp.currencyLots.lotCount', 'Lots');
      const coinsLabel = translate('gameHelp.currencyLots.coinsLabel', 'Pièces');

      recommendations.forEach((item) => {
        const name = this.getProductName(item.product);
        const totalCoins = item.product.totalCoins * item.quantity;

        const wrapper = document.createElement('li');
        wrapper.className = 'bg-gray-900/60 border border-indigo-700/30 rounded-lg p-4';

        const container = document.createElement('div');
        container.className = 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between';

        const info = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'text-gray-100 font-semibold';
        title.textContent = name;

        const details = document.createElement('p');
        details.className = 'text-sm text-gray-400';
        const detailParts = [];
        if (item.type === 'single' && Number.isFinite(item.multiplier)) {
          detailParts.push(`${multiplierLabel} ×${this.numberFormatter.format(item.multiplier)}`);
          detailParts.push(`${this.numberFormatter.format(item.product.totalCoins)} ${coinsLabel}/lot`);
        } else if (item.type === 'bundle') {
          detailParts.push(bundleLabel);
          const coverageDetail = this.describeBundleCoverage(item.product, perMultiplierLabel);
          if (coverageDetail) {
            detailParts.push(coverageDetail);
          }
        }
        details.textContent = detailParts.join(' • ');

        info.appendChild(title);
        info.appendChild(details);

        const qty = document.createElement('div');
        qty.className = 'text-sm text-indigo-300 font-semibold md:text-right';
        const lotText = document.createElement('span');
        lotText.textContent = `${lotCountLabel} : ${this.numberFormatter.format(item.quantity)}`;
        const totalText = document.createElement('span');
        totalText.className = 'block text-xs text-gray-300';
        totalText.textContent = `${this.numberFormatter.format(totalCoins)} ${coinsLabel}`;
        qty.appendChild(lotText);
        qty.appendChild(totalText);

        container.appendChild(info);
        container.appendChild(qty);
        wrapper.appendChild(container);
        this.list.appendChild(wrapper);
      });

      if (this.summary) {
        const summaryLabel = translate('gameHelp.currencyLots.summary', 'Total de pièces recommandées');
        const totalCoins = this.getTotalCoins(recommendations);
        this.summary.textContent = `${summaryLabel} : ${this.numberFormatter.format(totalCoins)}`;
      }

      this.updateButtonAvailability();
    }

    showEmpty() {
      if (!this.section) {
        return;
      }
      this.section.classList.remove('hidden');
      this.section.hidden = false;
      this.section.setAttribute('aria-hidden', 'false');
      if (this.list) {
        this.list.innerHTML = '';
      }
      if (this.summary) {
        this.summary.textContent = '';
      }
      if (this.emptyMessage) {
        this.emptyMessage.hidden = false;
        this.emptyMessage.classList.remove('hidden');
      }
      this.recommendations = [];
      this.updateButtonAvailability();
    }

    reset() {
      if (this.section) {
        this.section.classList.add('hidden');
        this.section.hidden = true;
        this.section.setAttribute('aria-hidden', 'true');
      }
      if (this.list) {
        this.list.innerHTML = '';
      }
      if (this.summary) {
        this.summary.textContent = '';
      }
      if (this.emptyMessage) {
        this.emptyMessage.hidden = true;
        this.emptyMessage.classList.add('hidden');
      }
      this.recommendations = [];
      this.updateButtonAvailability();
      this.hideError();
    }

    updateButtonAvailability() {
      if (!this.button) {
        return;
      }
      if (this.loading) {
        this.button.disabled = true;
        return;
      }
      this.button.disabled = this.recommendations.length === 0;
    }

    setButtonLoading(isLoading) {
      if (!this.button) {
        return;
      }
      this.loading = Boolean(isLoading);
      if (isLoading) {
        this.button.disabled = true;
        this.button.setAttribute('aria-busy', 'true');
        this.button.classList.add('opacity-70');
      } else {
        this.button.removeAttribute('aria-busy');
        this.button.classList.remove('opacity-70');
        this.updateButtonAvailability();
      }
    }

    hideError() {
      if (!this.error) {
        return;
      }
      this.error.classList.add('hidden');
      this.error.hidden = true;
    }

    showError(message) {
      if (!this.error) {
        return;
      }
      const fallback = translate('gameHelp.currencyLots.error',
        "Impossible d'ajouter les lots recommandés pour le moment. Veuillez réessayer.");
      this.error.textContent = message || fallback;
      this.error.classList.remove('hidden');
      this.error.hidden = false;
    }

    handleAddAll() {
      if (!this.recommendations.length || this.loading) {
        return;
      }

      const isSnipcartReady = () => window.Snipcart && window.Snipcart.api
        && window.Snipcart.api.cart && window.Snipcart.api.cart.items
        && typeof window.Snipcart.api.cart.items.add === 'function';

      const fallbackMessage = translate('gameHelp.currencyLots.error',
        "Impossible d'ajouter les lots recommandés pour le moment. Veuillez réessayer.");

      const runAddition = async () => {
        try {
          for (const recommendation of this.recommendations) {
            const payload = this.buildSnipcartPayload(recommendation);
            // eslint-disable-next-line no-await-in-loop
            await window.Snipcart.api.cart.items.add(payload);
          }
        } catch (error) {
          console.error("[GD] Impossible d'ajouter les lots recommandés :", error);
          this.showError(error?.message || fallbackMessage);
        } finally {
          this.setButtonLoading(false);
        }
      };

      this.hideError();
      this.setButtonLoading(true);

      if (isSnipcartReady()) {
        runAddition();
        return;
      }

      if (typeof window.whenSnipcart === 'function') {
        window.whenSnipcart(() => {
          if (isSnipcartReady()) {
            runAddition();
          } else {
            this.setButtonLoading(false);
            this.showError(fallbackMessage);
          }
        });
        return;
      }

      this.setButtonLoading(false);
      this.showError(fallbackMessage);
    }

    buildSnipcartPayload(recommendation) {
      const { product, quantity } = recommendation;
      const payload = {
        id: product.productId,
        name: this.getProductName(product),
        price: Number.isFinite(product.price) ? product.price : 0,
        url: product.url,
        quantity,
        metadata: {
          recommendedBy: 'currency-converter',
        },
      };

      if (recommendation.type === 'single' && Number.isFinite(recommendation.multiplier)) {
        const label = translate('product.multiplier', 'Multiplicateur');
        payload.customFields = [
          {
            name: label,
            value: String(recommendation.multiplier),
          },
        ];
      }

      return payload;
    }

    getProductName(product) {
      if (!product || !product.names) {
        return '';
      }
      const isEnglish = this.lang.startsWith('en');
      if (isEnglish) {
        return product.names.en || product.names.fr || '';
      }
      return product.names.fr || product.names.en || '';
    }

    getTotalCoins(recommendations) {
      return recommendations.reduce((sum, item) => sum + (item.product.totalCoins * item.quantity), 0);
    }
  }

  const start = () => {
    const manager = new CurrencyLotRecommender();
    manager.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
