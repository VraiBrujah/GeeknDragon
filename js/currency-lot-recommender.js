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
      this.productsData = { singlesByMultiplier: new Map(), bundles: [] };
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
      };

      const multipliers = this.getMultipliers();
      multipliers.forEach((mult) => {
        result.singlesByMultiplier.set(mult, []);
      });

      if (!data || typeof data !== 'object') {
        return result;
      }

      Object.entries(data).forEach(([id, product]) => {
        if (typeof id !== 'string' || !/^lot/iu.test(id) || !product || typeof product !== 'object') {
          return;
        }

        const totalCoins = this.extractTotalCoins(product);
        if (!Number.isFinite(totalCoins) || totalCoins <= 0) {
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
        const rawMultipliers = Array.isArray(product.multipliers) ? product.multipliers : [];
        const selectableMultipliers = rawMultipliers
          .map((value) => Number.parseInt(value, 10))
          .filter((value) => Number.isFinite(value));

        if (selectableMultipliers.length > 0) {
          const baseInfo = {
            productId: id,
            names,
            price: normalizedPrice,
            url,
            totalCoins,
            coinsPerMultiplier: totalCoins,
            type: 'single',
          };
          selectableMultipliers.forEach((mult) => {
            if (!result.singlesByMultiplier.has(mult)) {
              result.singlesByMultiplier.set(mult, []);
            }
            result.singlesByMultiplier.get(mult).push({
              ...baseInfo,
              multiplier: mult,
            });
          });
        } else {
          const perMultiplierCoins = totalCoins / multipliers.length;
          if (!Number.isFinite(perMultiplierCoins) || perMultiplierCoins <= 0) {
            return;
          }
          result.bundles.push({
            productId: id,
            names,
            price: normalizedPrice,
            url,
            totalCoins,
            coinsPerMultiplier: perMultiplierCoins,
            type: 'bundle',
          });
        }
      });

      result.singlesByMultiplier.forEach((options) => {
        options.sort((a, b) => b.totalCoins - a.totalCoins);
      });
      result.bundles.sort((a, b) => b.coinsPerMultiplier - a.coinsPerMultiplier);

      return result;
    }

    extractTotalCoins(product) {
      const patterns = [
        /(\d+(?:[\s\u00A0]\d{3})*)\s*pi[eè]ces?/iu,
        /(\d+(?:[\s\u00A0]\d{3})*)\s*coins?/iu,
      ];
      const sources = [
        product.summary,
        product.summary_en,
        product.description,
        product.description_en,
        product.name,
        product.name_en,
      ];

      for (const source of sources) {
        if (typeof source !== 'string') {
          continue;
        }
        for (const pattern of patterns) {
          const match = pattern.exec(source);
          if (match && match[1]) {
            const normalized = match[1].replace(/[\s\u00A0]/gu, '');
            const parsed = Number.parseInt(normalized, 10);
            if (Number.isFinite(parsed)) {
              return parsed;
            }
          }
        }
      }
      return null;
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
      const multipliers = Array.from(new Set([
        ...this.getMultipliers(),
        ...requirements.keys(),
      ]))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => a - b);

      const remaining = new Map();
      multipliers.forEach((mult) => {
        const qty = requirements.get(mult) || 0;
        remaining.set(mult, qty);
        if (!this.productsData.singlesByMultiplier.has(mult)) {
          this.productsData.singlesByMultiplier.set(mult, []);
        }
      });

      const selected = [];

      this.productsData.bundles.forEach((bundle) => {
        const coinsPerMultiplier = bundle.coinsPerMultiplier;
        if (!Number.isFinite(coinsPerMultiplier) || coinsPerMultiplier <= 0) {
          return;
        }
        const minimalNeed = multipliers.reduce((min, mult) => {
          const current = remaining.get(mult) || 0;
          return Math.min(min, current);
        }, Number.POSITIVE_INFINITY);
        if (!Number.isFinite(minimalNeed) || minimalNeed < coinsPerMultiplier) {
          return;
        }
        const count = Math.floor(minimalNeed / coinsPerMultiplier);
        if (count <= 0) {
          return;
        }
        selected.push({
          type: 'bundle',
          product: bundle,
          quantity: count,
        });
        multipliers.forEach((mult) => {
          const current = remaining.get(mult) || 0;
          const updated = Math.max(0, current - (coinsPerMultiplier * count));
          remaining.set(mult, updated);
        });
      });

      multipliers.forEach((mult) => {
        let needed = remaining.get(mult) || 0;
        if (needed <= 0) {
          return;
        }
        const options = this.productsData.singlesByMultiplier.get(mult) || [];
        if (options.length === 0) {
          return;
        }

        const localSelections = [];
        options.forEach((option) => {
          if (needed < option.totalCoins) {
            return;
          }
          const count = Math.floor(needed / option.totalCoins);
          if (count > 0) {
            localSelections.push({ option, count });
            needed -= option.totalCoins * count;
          }
        });

        if (needed > 0) {
          const fallback = options[options.length - 1];
          if (fallback) {
            localSelections.push({ option: fallback, count: 1 });
            needed = Math.max(0, needed - fallback.totalCoins);
          }
        }

        localSelections.forEach(({ option, count }) => {
          if (!option || count <= 0) {
            return;
          }
          selected.push({
            type: 'single',
            product: option,
            multiplier: option.multiplier,
            quantity: count,
          });
          const current = remaining.get(mult) || 0;
          remaining.set(mult, Math.max(0, current - (option.totalCoins * count)));
        });
      });

      return selected;
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
          detailParts.push(`${this.numberFormatter.format(item.product.coinsPerMultiplier)} ${perMultiplierLabel}`);
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
