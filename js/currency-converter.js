/**
 * Convertisseur de monnaie D&D autonome avec optimisation algorithmique
 * 
 * Responsabilités :
 * - Conversion entre monnaies D&D avec multiplicateurs physiques
 * - Optimisation du nombre minimal de pièces (métaheuristiques)
 * - Intégration avec système de recommandations de lots
 * - Interface utilisateur réactive avec feedback temps réel
 * 
 * Architecture :
 * - Stratégie : Multiple algorithmes d'optimisation (glouton, équilibré, hybride)
 * - Observer : Callbacks pour notifications de changements
 * - Template Method : Structure commune, implémentations variables
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.0.0 - Production
 */
class CurrencyConverterPremium {
    /**
     * Initialise le convertisseur avec les taux de change D&D standard
     * et la configuration des multiplicateurs physiques disponibles
     */
    constructor() {
        // Configuration monétaire D&D standard (base cuivre)
        this.rates = {
            copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000,
        };
        
        // Multiplicateurs physiques disponibles pour les pièces
        this.multipliers = [1, 10, 100, 1000, 10000];
        
        // Formateur numérique français pour l'affichage
        this.nf = new Intl.NumberFormat('fr-FR');
        this.editMode = true;

        // Prix dynamiques des lots (chargés depuis products.json)
        this.productPrices = {
            single: 10, // coin-custom-single
            trio: 25, // coin-trio-customizable
            septuple: 50, // coin-septuple-free
        };

        // Références dynamiques aux éléments DOM (lazy loading)
        this.sourceInputs = null;
        this.multiplierInputs = null;
        this.bestDisplay = null;
        this.metalCards = {};

        // Configuration des métaux avec données d'affichage
        this.currencyData = {
            copper: {
                name: 'Cuivre', nameEn: 'Copper', emoji: '🪙', color: 'amber',
            },
            silver: {
                name: 'Argent', nameEn: 'Silver', emoji: '🥈', color: 'gray',
            },
            electrum: {
                name: 'Électrum', nameEn: 'Electrum', emoji: '⚡', color: 'yellow',
            },
            gold: {
                name: 'Or', nameEn: 'Gold', emoji: '🥇', color: 'yellow',
            },
            platinum: {
                name: 'Platine', nameEn: 'Platinum', emoji: '💎', color: 'cyan',
            },
        };

        // Pattern Observer : callbacks pour réactivité
        this.changeCallbacks = [];

        this.init();
    }

    init() {
        this.loadProductPrices(); // Chargement dynamique des prix
        this.addTranslationSupport(); // Support nouvelles traductions
        this.refreshDOMReferences();
        this.setupEventListeners();
        this.updateDisplay();

        // Afficher le message par défaut des recommandations dès l'initialisation
        this.displayDefaultRecommendationMessage();
    }

    /**
     * Charge les prix dynamiques depuis products.json de manière non-bloquante
     * Utilise les prix par défaut en cas d'échec
     */
    async loadProductPrices() {
        try {
            if (window.products) {
                this.productPrices.single = window.products['coin-custom-single']?.price || 10;
                this.productPrices.trio = window.products['coin-trio-customizable']?.price || 25;
                this.productPrices.septuple = window.products['coin-septuple-free']?.price || 50;
            }
        } catch (error) {
            // Prix par défaut utilisés en cas d'échec de chargement
        }
    }

    /**
     * Actualise les références DOM de manière paresseuse
     * Optimise les performances en évitant les requêtes inutiles
     */
    refreshDOMReferences() {
        const container = document.getElementById('currency-converter-premium');
        if (container) {
            this.sourceInputs = container.querySelectorAll('input[data-currency]');
            this.multiplierInputs = container.querySelectorAll('.multiplier-input');
            this.bestDisplay = document.getElementById('currency-best');

            // Référencement des cartes de métaux pour affichage
            Object.keys(this.currencyData).forEach((currency) => {
                const cardElement = document.getElementById(`${currency}-card`);
                if (cardElement) {
                    this.metalCards[currency] = cardElement;
                }
            });
        }
    }

    // Méthode pour ajouter des callbacks d'événements
    onChange(callback) {
        if (typeof callback === 'function') {
            this.changeCallbacks.push(callback);
        }
    }

    // Méthode pour notifier les changements
    notifyChange(data) {
        this.changeCallbacks.forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                // Gestion silencieuse des erreurs de callbacks pour éviter les logs en production
            }
        });
    }

    getCurrentLang() {
        return document.documentElement.lang || 'fr';
    }

    getTranslation(key, fallback = '') {
        if (window.i18n) {
            const keys = key.split('.');
            let value = window.i18n;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return fallback;
                }
            }
            return typeof value === 'string' ? value : fallback;
        }
        return fallback;
    }

    getCurrencyName(currency) {
        const lang = this.getCurrentLang();
        const data = this.currencyData[currency];
        return lang === 'en' ? data.nameEn : data.name;
    }

    setupEventListeners() {
    // Utilisation de la délégation d'événements pour réduire le nombre de listeners
        const converterContainer = document.getElementById('currency-converter-premium');
        if (!converterContainer) {
            return; // Container non disponible
        }

        // Débounce pour éviter les calculs trop fréquents
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        };

        const debouncedUpdateSources = debounce(() => {
            this.updateFromSources();
            this.notifyChange(this.getCurrentValues());
        }, 150);

        const debouncedUpdateMultipliers = debounce(() => {
            this.updateFromMultipliers();
            this.notifyChange(this.getCurrentValues());
        }, 150);

        // Délégation d'événements sur le container principal
        converterContainer.addEventListener('input', (e) => {
            if (e.target.matches('input[data-currency]')) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                debouncedUpdateSources();
            } else if (e.target.matches('.multiplier-input')) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                debouncedUpdateMultipliers();
            }
        }, { passive: true });

        converterContainer.addEventListener('focus', (e) => {
            if (e.target.matches('input[data-currency]') && e.target.value === '0') {
                e.target.value = '';
            }
        }, { passive: true });
    }

    // Méthode pour obtenir les valeurs actuelles du convertisseur
    getCurrentValues() {
        if (!this.sourceInputs) {
            this.refreshDOMReferences();
        }

        const values = {
            copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0,
        };
        const baseValue = this.getTotalBaseValue();

        if (this.sourceInputs) {
            this.sourceInputs.forEach((input) => {
                const { currency } = input.dataset;
                const amount = Math.max(0, parseInt(input.value) || 0);
                values[currency] = amount;
            });
        }

        return {
            values,
            baseValue,
            breakdown: this.getOptimalBreakdown(baseValue),
        };
    }

    getTotalBaseValue() {
        if (!this.sourceInputs) {
            this.refreshDOMReferences();
        }

        if (!this.sourceInputs || this.sourceInputs.length === 0) {
            return 0;
        }

        return Array.from(this.sourceInputs).reduce((sum, input) => {
            const { currency } = input.dataset;
            const amount = Math.max(0, parseInt(input.value) || 0);
            return sum + amount * this.rates[currency];
        }, 0);
    }

    updateFromSources() {
        const baseValue = this.getTotalBaseValue();

        // Mettre à jour le tableau multiplicateur avec les NOUVELLES RÈGLES d'optimisation
        // Priorité métal > multiplicateur + lots 3/7 pour conversions automatiques
        this.updateMultiplierTableWithOptimization(baseValue);

        this.updateMetalCards(baseValue);
        this.updateOptimalRecommendations(baseValue);
        this.updateCoinLotsRecommendations(baseValue);
    }

    updateFromMultipliers() {
    // Calculer la valeur totale depuis les inputs multiplicateur
        let totalValue = 0;
        this.multiplierInputs.forEach((input) => {
            const { currency } = input.closest('tr').dataset;
            const multiplier = parseInt(input.dataset.multiplier);
            const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;
            totalValue += quantity * this.rates[currency] * multiplier;
        });

        // Mettre à jour les sources
        this.sourceInputs.forEach((input) => {
            input.value = '0';
        });

        // COMPORTEMENT ORIGINAL RESTAURÉ : Garder les valeurs utilisateur du tableau multiplicateur
        // au lieu de les redistribuer de manière optimale
        this.distributeOptimally(totalValue);
        this.updateMetalCards(totalValue);

        // Utiliser les valeurs utilisateur pour les recommandations optimales
        this.updateOptimalRecommendationsFromUser(totalValue);
        this.updateCoinLotsRecommendations(totalValue, true); // true = utiliser valeurs utilisateur
    }

    // NOUVELLE MÉTHODE: Mise à jour tableau avec optimisations (conversions automatiques uniquement)
    updateMultiplierTableWithOptimization(baseValue) {
        if (baseValue === 0) {
            // Vider le tableau si pas de valeur
            this.multiplierInputs.forEach((input) => {
                input.value = '';
            });
            return;
        }

        // Appliquer les nouvelles règles d'optimisation pour conversion automatique
        const optimizedSolution = this.findMinimalCoins(baseValue, false); // false = conversion auto

        // D'abord, vider tout le tableau
        this.multiplierInputs.forEach((input) => {
            input.value = '';
        });

        // Puis, remplir avec la solution optimisée
        optimizedSolution.forEach((item) => {
            const targetInput = Array.from(this.multiplierInputs).find((input) => {
                const { currency } = input.closest('tr').dataset;
                const multiplier = parseInt(input.dataset.multiplier);
                return currency === item.currency && multiplier === item.multiplier;
            });

            if (targetInput && item.quantity > 0) {
                targetInput.value = this.nf.format(item.quantity);
            }
        });
    }

    distributeOptimally(totalValue) {
        let remaining = totalValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

        currencies.forEach((currency) => {
            const input = document.querySelector(`input[data-currency="${currency}"]`);
            const rate = this.rates[currency];
            const count = Math.floor(remaining / rate);
            if (count > 0) {
                input.value = count.toString();
                remaining -= count * rate;
            }
        });
    }

    updateMetalCards(baseValue) {
        if (baseValue === 0) {
            Object.keys(this.metalCards).forEach((currency) => {
                if (this.metalCards[currency]) {
                    this.metalCards[currency].innerHTML = '';
                }
            });
            return;
        }

        Object.keys(this.rates).forEach((currency) => {
            if (!this.metalCards[currency]) return;

            const data = this.currencyData[currency];
            const rate = this.rates[currency];
            const totalUnits = Math.floor(baseValue / rate);

            if (totalUnits === 0) {
                this.metalCards[currency].innerHTML = '';
                return;
            }

            // Calcul du nombre minimal de pièces avec multiplicateurs
            const minimalCoins = this.getMinimalCoinsBreakdown(totalUnits);
            const remainderValue = baseValue % rate;
            let remainderText = '';
            if (remainderValue > 0) {
                remainderText = this.getOptimalBreakdown(remainderValue);
            }

            this.metalCards[currency].innerHTML = `
        <div class="currency-total-card bg-gradient-to-br from-${data.color}-900/20 to-${data.color}-800/20 rounded-xl p-6 border border-${data.color}-700/30">
          <div class="flex items-center justify-between mb-4">
            <h6 class="text-${data.color}-300 font-bold text-lg">${data.emoji} ${this.getCurrencyName(currency)}</h6>
            <span class="text-2xl font-bold text-${data.color}-300">${this.nf.format(totalUnits)}</span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="text-sm">
              <span class="text-gray-300">${this.getTranslation('shop.converter.minimalCoins', 'Nombre minimal de pièces')}:</span>
            </div>
            ${minimalCoins.map((item) => `
              <div class="flex justify-between text-sm pl-2">
                <span class="text-gray-300">${item.multiplier === 1 ? this.getTranslation('shop.converter.units', 'Unités') : `Multiplicateur ×${this.nf.format(item.multiplier)}`}:</span>
                <span class="text-${data.color}-300 font-medium">${this.nf.format(item.quantity)}</span>
              </div>
            `).join('')}
            <div class="border-t border-${data.color}-700/30 pt-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${this.getTranslation('shop.converter.totalCoins', 'Total pièces')}:</span>
                <span class="text-${data.color}-300 font-bold">${this.nf.format(minimalCoins.reduce((sum, item) => sum + item.quantity, 0))}</span>
              </div>
            </div>
          </div>
          
          ${remainderText ? `
            <div class="border-t border-${data.color}-700/30 pt-3">
              <p class="text-xs text-gray-400">${this.getTranslation('shop.converter.remainder', 'Reste')}: ${remainderText}</p>
            </div>
          ` : ''}
        </div>
      `;
        });
    }

    getMinimalCoinsBreakdown(totalUnits) {
        const breakdown = [];
        let remaining = totalUnits;

        // Calcul de la répartition optimale par multiplicateur (du plus grand au plus petit)
        this.multipliers.slice().reverse().forEach((mult) => {
            const qty = Math.floor(remaining / mult);
            if (qty > 0) {
                breakdown.push({
                    multiplier: mult,
                    quantity: qty,
                });
                remaining -= qty * mult;
            }
        });

        return breakdown;
    }

    getOptimalBreakdown(value) {
        if (value <= 0) return '';

        // NOUVELLE LOGIQUE : Utiliser l'algorithme optimisé avec lots 3/7
        const bestSolution = this.findMinimalCoins(value, false);

        if (!bestSolution || bestSolution.length === 0) return '';

        // Utiliser la nouvelle méthode de formatage
        return this.formatSolutionForDisplay(bestSolution);
    }

    findMinimalCoins(targetValue, preserveMetals = false) {
    // NOUVELLE ARCHITECTURE: Priorité métal > multiplicateur + lots 3/7

        let bestSolution = null;
        let minCost = Infinity;

        // STRATÉGIE 1: Priorité métal > multiplicateur (PRINCIPALE)
        const metalPrioritySolution = this.findMetalPrioritySolution(targetValue, preserveMetals);
        if (metalPrioritySolution && metalPrioritySolution.length > 0) {
            const cost = this.calculateSolutionCost(metalPrioritySolution);
            if (cost < minCost) {
                minCost = cost;
                bestSolution = metalPrioritySolution;
            }
        }

        // STRATÉGIE 2: Optimisation coût avec lots 3/7 (secondaire)
        const costOptimalSolution = this.findCostOptimalSolution(targetValue, preserveMetals);
        if (costOptimalSolution && costOptimalSolution.length > 0) {
            const cost = this.calculateSolutionCost(costOptimalSolution);
            if (cost < minCost) {
                minCost = cost;
                bestSolution = costOptimalSolution;
            }
        }

        // STRATÉGIE 3: Fallback simple et fiable
        if (!bestSolution) {
            const fallbackSolution = this.findFallbackSolution(targetValue);
            if (fallbackSolution && fallbackSolution.length > 0) {
                bestSolution = fallbackSolution;
            }
        }

        return bestSolution;
    }

    // NOUVELLE MÉTHODE: Optimisation coût avec lots 3/7
    findCostOptimalSolution(targetValue, preserveMetals = false) {
        const breakdown = this.convertValueToCoins(targetValue, preserveMetals);

        // Appliquer la logique des lots 3/7 pour économiser
        const optimizedBreakdown = this.applyBulkDiscounts(breakdown);

        return optimizedBreakdown;
    }

    // NOUVELLE MÉTHODE: Priorité métal > multiplicateur
    findMetalPrioritySolution(targetValue, preserveMetals = false) {
        const result = [];
        let remaining = targetValue;

        // Ordre de priorité des métaux (plus précieux d'abord)
        const metalPriority = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

        if (preserveMetals) {
            // Mode tableau utilisateur : utiliser directement les valeurs saisies sans modification
            // L'utilisateur peut mettre plusieurs multiplicateurs pour le même métal
            return this.getUserMultiplierBreakdown();
        }

        // Mode conversion automatique : priorité métal > multiplicateur
        metalPriority.forEach((metal) => {
            if (remaining <= 0) return;

            const metalRate = this.rates[metal];

            // Essayer les multiplicateurs du plus petit au plus grand
            for (const multiplier of this.multipliers) {
                const coinValue = metalRate * multiplier;

                if (remaining >= coinValue) {
                    const quantity = Math.floor(remaining / coinValue);
                    if (quantity > 0) {
                        // Appliquer logique lots 3/7 avant d'ajouter
                        const optimizedQuantity = this.optimizeQuantityForBulk(quantity, metal, multiplier);

                        result.push({
                            currency: metal,
                            multiplier,
                            quantity: optimizedQuantity.quantity,
                            value: coinValue,
                        });

                        remaining -= optimizedQuantity.totalValue;
                        break; // Passer au métal suivant
                    }
                }
            }
        });

        return result;
    }

    // NOUVELLE MÉTHODE: Appliquer les remises sur les lots 3/7
    applyBulkDiscounts(breakdown) {
        const result = [];

        breakdown.forEach((item) => {
            const { currency, multiplier, quantity } = item;

            if (quantity >= 7) {
                // Logique lots de 7: 8→7+1, 10→7+3, etc.
                const septupleCount = Math.floor(quantity / 7);
                const remaining = quantity % 7;

                // Ajouter les septuples
                if (septupleCount > 0) {
                    result.push({
                        ...item,
                        quantity: septupleCount,
                        lotType: 'septuple',
                        economyGained: septupleCount * (7 * this.productPrices.single - this.productPrices.septuple),
                    });
                }

                // Traiter le reste avec logique trio si applicable
                if (remaining >= 3) {
                    const trioCount = Math.floor(remaining / 3);
                    const finalRemaining = remaining % 3;

                    if (trioCount > 0) {
                        result.push({
                            ...item,
                            quantity: trioCount,
                            lotType: 'trio',
                            economyGained: trioCount * (3 * this.productPrices.single - this.productPrices.trio),
                        });
                    }

                    if (finalRemaining > 0) {
                        result.push({ ...item, quantity: finalRemaining, lotType: 'single' });
                    }
                } else if (remaining > 0) {
                    result.push({ ...item, quantity: remaining, lotType: 'single' });
                }
            } else if (quantity >= 3) {
                // Logique lots de 3: 4→3+1, 6→3+3, etc.
                const trioCount = Math.floor(quantity / 3);
                const remaining = quantity % 3;

                result.push({
                    ...item,
                    quantity: trioCount,
                    lotType: 'trio',
                    economyGained: trioCount * (3 * this.productPrices.single - this.productPrices.trio),
                });

                if (remaining > 0) {
                    result.push({ ...item, quantity: remaining, lotType: 'single' });
                }
            } else {
                // Quantité < 3 : pièces unitaires
                result.push({ ...item, lotType: 'single' });
            }
        });

        return result;
    }

    // NOUVELLE MÉTHODE: Calcul du coût d'une solution avec lots
    calculateSolutionCost(solution) {
        return solution.reduce((total, item) => {
            const { quantity, lotType } = item;

            switch (lotType) {
            case 'septuple':
                return total + (quantity * this.productPrices.septuple);
            case 'trio':
                return total + (quantity * this.productPrices.trio);
            case 'single':
            default:
                return total + (quantity * this.productPrices.single);
            }
        }, 0);
    }

    // NOUVELLE MÉTHODE: Conversion valeur en pièces avec priorité métal
    convertValueToCoins(targetValue, preserveMetals = false) {
        const result = [];
        let remaining = targetValue;

        // Priorité métal > multiplicateur
        const metalPriority = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

        metalPriority.forEach((metal) => {
            if (remaining <= 0) return;

            const metalRate = this.rates[metal];

            // Pour chaque métal, utiliser le plus petit multiplicateur possible
            for (const multiplier of this.multipliers) {
                const coinValue = metalRate * multiplier;

                if (remaining >= coinValue) {
                    const quantity = Math.floor(remaining / coinValue);
                    if (quantity > 0) {
                        result.push({
                            currency: metal,
                            multiplier,
                            quantity,
                            value: coinValue,
                        });
                        remaining -= quantity * coinValue;
                        break; // Passer au métal suivant
                    }
                }
            }
        });

        return result;
    }

    // NOUVELLE MÉTHODE: Optimiser quantité pour lots économiques
    optimizeQuantityForBulk(quantity, metal, multiplier) {
        const coinValue = this.rates[metal] * multiplier;

        // Si quantité >= 7, privilégier les septuples
        if (quantity >= 7) {
            return {
                quantity,
                totalValue: quantity * coinValue,
                hasBulkDiscount: true,
            };
        }

        // Si quantité >= 3, privilégier les trios
        if (quantity >= 3) {
            return {
                quantity,
                totalValue: quantity * coinValue,
                hasBulkDiscount: true,
            };
        }

        return {
            quantity,
            totalValue: quantity * coinValue,
            hasBulkDiscount: false,
        };
    }

    // MÉTHODE AJOUTÉE: Support des nouvelles traductions
    addTranslationSupport() {
    // Ajouter les nouvelles clés de traduction si elles n'existent pas
        if (window.i18n && window.i18n.shop && window.i18n.shop.converter) {
            const { converter } = window.i18n.shop;
            if (!converter.cost) converter.cost = 'Coût';
            if (!converter.economy) converter.economy = 'Économie';
            if (!converter.bulkDiscount) converter.bulkDiscount = 'Remise sur quantité';
            if (!converter.lotType) converter.lotType = 'Type de lot';
        }
    }

    // Ancienne stratégie conservée pour fallback
    findFallbackSolution(targetValue) {
        const denoms = [];
        ['platinum', 'gold', 'electrum', 'silver', 'copper'].forEach((currency) => {
            this.multipliers.forEach((multiplier) => {
                denoms.push({
                    currency,
                    multiplier,
                    value: this.rates[currency] * multiplier,
                });
            });
        });

        denoms.sort((a, b) => b.value - a.value);

        return this.greedyFallback(targetValue, denoms);
    }

    greedyFallback(targetValue, denoms) {
        const result = [];
        let remaining = targetValue;

        denoms.forEach((denom) => {
            if (remaining >= denom.value) {
                const qty = Math.floor(remaining / denom.value);
                if (qty > 0) {
                    result.push({ ...denom, quantity: qty });
                    remaining -= qty * denom.value;
                }
            }
        });

        return result;
    }

    // Ancienne méthode conservée pour compatibilité
    balancedDistributionStrategy(targetValue, denoms) {
        const result = [];
        let remaining = targetValue;

        // Stratégie équilibrée : 1 pièce de chaque métal pour chaque multiplicateur
        // Traiter multiplicateur par multiplicateur, du plus grand au plus petit

        for (const multiplier of this.multipliers.slice().reverse()) {
            // Pour chaque multiplicateur, essayer d'ajouter 1 pièce de chaque métal
            const metalOrder = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

            for (const currency of metalOrder) {
                const denom = denoms.find((d) => d.currency === currency && d.multiplier === multiplier);
                if (denom && remaining >= denom.value) {
                    result.push({ ...denom, quantity: 1 });
                    remaining -= denom.value;
                }
            }
        }

        // Vérifier si cette distribution équilibrée est intéressante
        const balancedValue = result.reduce((sum, item) => sum + (item.value * item.quantity), 0);
        const coverageRatio = balancedValue / targetValue;

        // CORRECTION: Ne pas forcer la distribution équilibrée systématiquement
        // Elle doit être économiquement justifiée
        if (coverageRatio >= 0.9 && result.length >= 20 && targetValue >= 50000) {
            // Seulement pour de très gros montants où c'est vraiment avantageux

            // Compléter le reste avec l'algorithme glouton si nécessaire
            if (remaining > 0) {
                denoms.forEach((denom) => {
                    if (remaining >= denom.value) {
                        const qty = Math.floor(remaining / denom.value);
                        if (qty > 0) {
                            // Chercher si cette dénomination existe déjà
                            const existing = result.find((r) => r.currency === denom.currency && r.multiplier === denom.multiplier);
                            if (existing) {
                                existing.quantity += qty;
                            } else {
                                result.push({ ...denom, quantity: qty });
                            }
                            remaining -= qty * denom.value;
                        }
                    }
                });
            }

            return result;
        }

        // CORRECTION: Approche hybride seulement pour les très gros montants
        // Ne pas forcer la Quintessence pour des petits montants comme 150 cuivres
        if (targetValue >= 100000) { // Seuil beaucoup plus élevé
            const hybridResult = [];
            let hybridRemaining = targetValue;

            // Forcer 1 pièce de chaque métal × multiplicateur 1 (Quintessence de base)
            const baseQuintessence = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
            for (const currency of baseQuintessence) {
                const baseDenom = denoms.find((d) => d.currency === currency && d.multiplier === 1);
                if (baseDenom && hybridRemaining >= baseDenom.value) {
                    hybridResult.push({ ...baseDenom, quantity: 1 });
                    hybridRemaining -= baseDenom.value;
                }
            }

            // Puis essayer d'ajouter des multiplicateurs plus gros de manière équilibrée
            for (const multiplier of [100, 10000]) {
                let addedAny = false;
                for (const currency of baseQuintessence) {
                    const denom = denoms.find((d) => d.currency === currency && d.multiplier === multiplier);
                    if (denom && hybridRemaining >= denom.value) {
                        hybridResult.push({ ...denom, quantity: 1 });
                        hybridRemaining -= denom.value;
                        addedAny = true;
                    }
                }
                if (!addedAny) break; // Si on ne peut plus ajouter de ce multiplicateur, arrêter
            }

            // Compléter avec l'algorithme glouton
            denoms.forEach((denom) => {
                if (hybridRemaining >= denom.value) {
                    const qty = Math.floor(hybridRemaining / denom.value);
                    if (qty > 0) {
                        const existing = hybridResult.find((r) => r.currency === denom.currency && r.multiplier === denom.multiplier);
                        if (existing) {
                            existing.quantity += qty;
                        } else {
                            hybridResult.push({ ...denom, quantity: qty });
                        }
                        hybridRemaining -= qty * denom.value;
                    }
                }
            });

            return hybridResult;
        }

        // Sinon, retourner null pour laisser les autres stratégies prendre le relais
        return null;
    }

    calculateRemainderPieces(remainderValue) {
        let pieces = 0;
        let remaining = remainderValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver', 'copper'];

        currencies.forEach((currency) => {
            const rate = this.rates[currency];
            const count = Math.floor(remaining / rate);
            if (count > 0) {
                pieces += count;
                remaining -= count * rate;
            }
        });

        return pieces;
    }

    getRemainderBreakdown(remainderValue) {
        const breakdown = [];
        let remaining = remainderValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver'];

        currencies.forEach((currency) => {
            const rate = this.rates[currency];
            const count = Math.floor(remaining / rate);
            if (count > 0) {
                const data = this.currencyData[currency];
                breakdown.push(`${count} ${data.emoji} ${this.getCurrencyName(currency).toLowerCase()}`);
                remaining -= count * rate;
            }
        });

        if (remaining > 0) {
            breakdown.push(`${remaining} ${this.currencyData.copper.emoji} ${this.getCurrencyName('copper').toLowerCase()}`);
        }

        return breakdown.join(', ');
    }

    updateOptimalRecommendations(baseValue) {
        if (!this.bestDisplay) {
            this.refreshDOMReferences();
        }

        if (!this.bestDisplay) return;

        if (baseValue === 0) {
            const enterAmountsText = this.getTranslation('shop.converter.enterAmounts', 'Entrez des montants pour voir les recommandations optimales');
            this.bestDisplay.innerHTML = enterAmountsText;
            return;
        }

        // NOUVELLE LOGIQUE: Utiliser l'algorithme optimisé avec lots 3/7
        const optimalSolution = this.findMinimalCoins(baseValue, false); // false = conversion automatique
        const optimal = this.formatSolutionForDisplay(optimalSolution);
        const totalPieces = this.calculateTotalPiecesFromSolution(optimalSolution);
        const totalCost = this.calculateSolutionCost(optimalSolution);
        const economyGained = this.calculateEconomyGained(optimalSolution);

        // Calcul de la valeur en or avec reste
        const goldValue = Math.floor(baseValue / this.rates.gold);
        const goldRemainder = baseValue % this.rates.gold;

        let goldValueDisplay = '';
        if (goldValue > 0) {
            goldValueDisplay = `${this.nf.format(goldValue)} 🥇 ${this.getCurrencyName('gold').toLowerCase()}`;
            if (goldRemainder > 0) {
                const remainderBreakdown = this.getOptimalBreakdown(goldRemainder);
                goldValueDisplay += ` ${this.getTranslation('shop.converter.and', 'et')} ${remainderBreakdown}`;
            }
        } else {
            goldValueDisplay = this.getOptimalBreakdown(baseValue);
        }

        const optimalConversionText = this.getTranslation('shop.converter.optimalConversion', 'Conversion optimale');
        const totalText = this.getTranslation('shop.converter.total', 'Total');
        const costText = this.getTranslation('shop.converter.cost', 'Coût');
        const economyText = this.getTranslation('shop.converter.economy', 'Économie');
        const valueText = this.getTranslation('shop.converter.value', 'Valeur');

        let economyDisplay = '';
        if (economyGained > 0) {
            economyDisplay = `<p class="text-sm text-green-400">💰 ${economyText}: $${economyGained.toFixed(2)}</p>`;
        }

        this.bestDisplay.innerHTML = `
      <div class="text-center">
        <p class="text-lg mb-2"><strong>${optimalConversionText}:</strong> 🎯</p>
        <p class="text-indigo-300 font-medium mb-2">${optimal}</p>
        <p class="text-sm text-gray-400">${totalText}: ${this.nf.format(totalPieces)} ${this.getTranslation('shop.converter.coins', 'pièces')}</p>
        <p class="text-sm text-gray-400">${costText}: $${totalCost.toFixed(2)}</p>
        ${economyDisplay}
        <p class="text-sm text-gray-400"><br>${valueText}: ${goldValueDisplay}</p>
      </div>
    `;
    }

    // NOUVELLE MÉTHODE: Formater solution pour affichage
    formatSolutionForDisplay(solution) {
        if (!solution || solution.length === 0) return '';

        const grouped = {};

        solution.forEach((item) => {
            const key = `${item.currency}_${item.multiplier}`;
            if (!grouped[key]) {
                grouped[key] = {
                    currency: item.currency,
                    multiplier: item.multiplier,
                    totalQuantity: 0,
                    lotTypes: [],
                };
            }

            grouped[key].totalQuantity += item.quantity;
            if (item.lotType) {
                grouped[key].lotTypes.push(item.lotType);
            }
        });

        const formatted = Object.values(grouped).map((item) => {
            const data = this.currencyData[item.currency];
            const hasLots = item.lotTypes.some((type) => type === 'trio' || type === 'septuple');
            const lotIndicator = hasLots ? '📦' : '';

            if (item.multiplier === 1) {
                return `${this.nf.format(item.totalQuantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()} ${lotIndicator}`;
            }
            return `${this.nf.format(item.totalQuantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()}(×${this.nf.format(item.multiplier)}) ${lotIndicator}`;
        });

        if (formatted.length > 1) {
            const last = formatted.pop();
            return `${formatted.join(', ')} ${this.getTranslation('shop.converter.and', 'et')} ${last}`;
        }

        return formatted.join('');
    }

    // NOUVELLE MÉTHODE: Calculer nombre total de pièces depuis solution
    calculateTotalPiecesFromSolution(solution) {
        if (!solution || solution.length === 0) return 0;
        return solution.reduce((sum, item) => sum + item.quantity, 0);
    }

    // NOUVELLE MÉTHODE: Calculer économie gagnée avec lots
    calculateEconomyGained(solution) {
        if (!solution || solution.length === 0) return 0;
        return solution.reduce((sum, item) => sum + (item.economyGained || 0), 0);
    }

    calculateTotalPieces(baseValue) {
        if (baseValue <= 0) return 0;

        // Utiliser la nouvelle métaheuristique avec lots 3/7
        const bestSolution = this.findMinimalCoins(baseValue, false);

        if (!bestSolution || bestSolution.length === 0) return 0;

        return this.calculateTotalPiecesFromSolution(bestSolution);
    }

    // MÉTHODE COMMENTÉE - Conservée pour référence future
    // Les optimisations s'appliquent aux conversions automatiques, le tableau utilisateur reste libre

    updateCoinLotsRecommendations(baseValue, useUserValues = false) {
    // Logique déplacée vers CoinLotOptimizer pour séparation des responsabilités
        const recommendationsContainer = document.getElementById('coin-lots-recommendations');
        if (!recommendationsContainer) return;

        recommendationsContainer.style.display = 'block';

        if (baseValue === 0) {
            this.displayDefaultRecommendationMessage();
            return;
        }

        // Déléguer à CoinLotOptimizer si disponible
        if (window.CoinLotOptimizer) {
            this.showCalculatingIndicator();

            setTimeout(() => {
                try {
                    const needs = {};

                    if (useUserValues) {
                        // Utiliser les valeurs du tableau multiplicateur utilisateur (optimisées)
                        const userBreakdown = this.getUserMultiplierBreakdown();
                        userBreakdown.forEach((item) => {
                            const key = `${item.currency}_${item.multiplier}`;
                            needs[key] = (needs[key] || 0) + item.quantity;
                        });
                    } else {
                        // Utiliser la solution algorithmique nouvelle avec lots 3/7
                        const optimalSolution = this.findMinimalCoins(baseValue, false);
                        optimalSolution.forEach((item) => {
                            const key = `${item.currency}_${item.multiplier}`;
                            needs[key] = (needs[key] || 0) + item.quantity;
                        });
                    }

                    // Utiliser CoinLotOptimizer pour trouver les lots optimaux
                    const optimizer = new window.CoinLotOptimizer();
                    const recommendations = optimizer.findOptimalProductCombination(needs);

                    if (recommendations && recommendations.length > 0) {
                        this.displayRecommendations(recommendations);
                    } else {
                        this.displayNoRecommendationsMessage();
                    }
                } catch (error) {
                    this.displayNoRecommendationsMessage();
                } finally {
                    this.hideCalculatingIndicator();
                }
            }, 100);
        } else {
            this.displayNoRecommendationsMessage();
        }
    }

    // Méthodes d'affichage délégués vers CoinLotOptimizer
    showCalculatingIndicator() {
        const recommendationsContent = document.getElementById('coin-lots-content');
        if (!recommendationsContent) return;

        const lang = this.getCurrentLang();
        const calculatingText = lang === 'en' ? 'Calculating optimal lots...' : 'Calcul des lots optimaux...';

        recommendationsContent.innerHTML = `
      <div class="calculating-indicator flex items-center justify-center p-8">
        <div class="text-center">
          <div class="abacus-animation mb-4">
            <div class="text-6xl animate-bounce">🧮</div>
          </div>
          <p class="text-amber-300 font-medium">${calculatingText}</p>
          <div class="flex justify-center mt-2 space-x-1">
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    `;
    }

    displayDefaultRecommendationMessage() {
        const recommendationsContent = document.getElementById('coin-lots-content');
        const addToCartButton = document.getElementById('add-all-lots-to-cart');

        if (recommendationsContent) {
            recommendationsContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🪙</div>
          <p class="text-gray-300 text-lg mb-2">Entrez des montants dans le convertisseur</p>
          <p class="text-gray-400 text-sm">pour voir les lots de pièces recommandés</p>
        </div>
      `;
        }

        if (addToCartButton) {
            addToCartButton.style.display = 'none';
        }
    }

    displayNoRecommendationsMessage() {
        const recommendationsContent = document.getElementById('coin-lots-content');
        const addToCartButton = document.getElementById('add-all-lots-to-cart');

        if (recommendationsContent) {
            recommendationsContent.innerHTML = `
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-300 text-lg mb-2">Aucune recommandation trouvée</p>
          <p class="text-gray-400 text-sm">Essayez avec d'autres montants</p>
        </div>
      `;
        }

        if (addToCartButton) {
            addToCartButton.style.display = 'none';
        }
    }

    displayRecommendations(recommendations) {
    // Logique d'affichage déléguée vers un module dédié ou CoinLotOptimizer
    // Pour l'instant, affichage simple
        const recommendationsContent = document.getElementById('coin-lots-content');
        const addToCartButton = document.getElementById('add-all-lots-to-cart');

        if (!recommendationsContent) return;

        const lang = this.getCurrentLang();
        let html = '<div class="space-y-4">';
        let totalPrice = 0;

        recommendations.forEach((item, index) => {
            const totalItemPrice = item.totalCost || (item.price * item.quantity);
            totalPrice += totalItemPrice;

            html += `
        <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h6 class="font-medium text-gray-200">${item.displayName}</h6>
              <p class="text-sm text-gray-400">Quantité: ${item.quantity}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-400">$${totalItemPrice.toFixed(2)}</p>
              <p class="text-xs text-gray-400">$${item.price.toFixed(2)} / unité</p>
            </div>
          </div>
        </div>
      `;
        });

        html += `
      <div class="border-t border-gray-600/30 pt-4">
        <div class="flex justify-between items-center text-lg font-bold">
          <span class="text-gray-200">Total:</span>
          <span class="text-green-400">$${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>`;

        recommendationsContent.innerHTML = html;

        if (addToCartButton) {
            addToCartButton.style.display = 'block';
            addToCartButton.dataset.lotsData = JSON.stringify(recommendations);
            // Ne pas écraser le contenu HTML - le bouton a déjà l'image correcte définie dans le HTML
        }
    }

    hideCalculatingIndicator() {
    // L'indicateur sera remplacé par displayRecommendations()
    }

    updateDisplay() {
        this.updateFromSources();
    }

    // Méthode de nettoyage pour éviter les fuites mémoire
    destroy() {
        const converterContainer = document.getElementById('currency-converter-premium');
        if (converterContainer) {
            // Clone et replace pour supprimer tous les event listeners
            const newContainer = converterContainer.cloneNode(true);
            converterContainer.parentNode.replaceChild(newContainer, converterContainer);
        }
    }

    // Nouvelle méthode pour récupérer les valeurs du tableau multiplicateur utilisateur
    getUserMultiplierBreakdown() {
        if (!this.multiplierInputs) {
            this.refreshDOMReferences();
        }

        const userBreakdown = [];
        if (this.multiplierInputs) {
            this.multiplierInputs.forEach((input) => {
                const { currency } = input.closest('tr').dataset;
                const multiplier = parseInt(input.dataset.multiplier);
                const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;

                if (quantity > 0) {
                    userBreakdown.push({
                        currency,
                        multiplier,
                        quantity,
                        value: this.rates[currency] * multiplier,
                    });
                }
            });
        }

        return userBreakdown;
    }

    // Nouvelle méthode pour formater un breakdown en texte
    formatBreakdownText(breakdown) {
        if (!breakdown || breakdown.length === 0) return '';

        const formatted = breakdown.map((item) => {
            const data = this.currencyData[item.currency];
            if (item.multiplier === 1) {
                return `${this.nf.format(item.quantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()}`;
            }
            return `${this.nf.format(item.quantity)} ${data.emoji} ${this.getCurrencyName(item.currency).toLowerCase()}(×${this.nf.format(item.multiplier)})`;
        });

        // Joindre avec "et"
        if (formatted.length > 1) {
            const last = formatted.pop();
            return `${formatted.join(', ')} ${this.getTranslation('shop.converter.and', 'et')} ${last}`;
        }

        return formatted.join('');
    }

    // Méthode améliorée pour les recommandations depuis les valeurs utilisateur
    updateOptimalRecommendationsFromUser(baseValue) {
        if (!this.bestDisplay) {
            this.refreshDOMReferences();
        }

        if (!this.bestDisplay) return;

        if (baseValue === 0) {
            const enterAmountsText = this.getTranslation('shop.converter.enterAmounts', 'Entrez des montants pour voir les recommandations optimales');
            this.bestDisplay.innerHTML = enterAmountsText;
            return;
        }

        // Récupérer les valeurs du tableau multiplicateur (choix utilisateur optimisé)
        const userBreakdown = this.getUserMultiplierBreakdown();
        const userTotalCoins = userBreakdown.reduce((sum, item) => sum + item.quantity, 0);

        // Comparer avec l'algorithme optimal avec lots 3/7
        const algorithmBreakdown = this.findMinimalCoins(baseValue, false);
        const algorithmTotalCoins = algorithmBreakdown ? algorithmBreakdown.reduce((sum, item) => sum + item.quantity, 0) : Infinity;

        // Utiliser les valeurs utilisateur si elles sont équivalentes ou meilleures
        let finalBreakdown; let finalTotalCoins; let
            source;
        if (userTotalCoins > 0 && userTotalCoins <= algorithmTotalCoins) {
            finalBreakdown = userBreakdown;
            finalTotalCoins = userTotalCoins;
            source = 'user';
        } else if (algorithmBreakdown) {
            finalBreakdown = algorithmBreakdown;
            finalTotalCoins = algorithmTotalCoins;
            source = 'algorithm';
        } else {
            // Fallback si aucun algorithme ne fonctionne
            finalBreakdown = userBreakdown.length > 0 ? userBreakdown : [];
            finalTotalCoins = userTotalCoins;
            source = 'user';
        }

        const finalBreakdownText = this.formatBreakdownText(finalBreakdown);
        const sourceIndicator = source === 'user'
            ? '<span class="text-blue-600">✏️</span>'
            : '<span class="text-green-600">🤖</span>';

        // Calcul de la valeur en or avec reste (comme dans la méthode originale)
        const goldValue = Math.floor(baseValue / this.rates.gold);
        const goldRemainder = baseValue % this.rates.gold;

        let goldValueDisplay = '';
        if (goldValue > 0) {
            goldValueDisplay = `${this.nf.format(goldValue)} 🥇 ${this.getCurrencyName('gold').toLowerCase()}`;
            if (goldRemainder > 0) {
                const remainderBreakdown = this.getOptimalBreakdown(goldRemainder);
                goldValueDisplay += ` ${this.getTranslation('shop.converter.and', 'et')} ${remainderBreakdown}`;
            }
        } else {
            goldValueDisplay = this.getOptimalBreakdown(baseValue);
        }

        const optimalConversionText = this.getTranslation('shop.converter.optimalConversion', 'Conversion optimale');
        const totalText = this.getTranslation('shop.converter.total', 'Total');
        const valueText = this.getTranslation('shop.converter.value', 'Valeur');

        this.bestDisplay.innerHTML = `
      <div class="text-center">
        <p class="text-lg mb-2"><strong>${optimalConversionText}:</strong> ${sourceIndicator}</p>
        <p class="text-indigo-300 font-medium mb-2">${finalBreakdownText}</p>
        <p class="text-sm text-gray-400">${totalText}: ${this.nf.format(finalTotalCoins)} ${this.getTranslation('shop.converter.coins', 'pièces')}</p>
        <p class="text-sm text-gray-400"><br>${valueText}: ${goldValueDisplay}</p>
      </div>
    `;
    }
}

// Nettoyage automatique à la fermeture de page
window.addEventListener('beforeunload', () => {
    if (window.converterInstance && typeof window.converterInstance.destroy === 'function') {
        window.converterInstance.destroy();
    }
});


// Initialisation paresseuse du convertisseur - ne charge que si l'utilisateur interagit
let converterInitialized = false;

const initConverter = () => {
    if (converterInitialized) return;
    converterInitialized = true;

    // Petite priorité au héro - délai de 100ms
    setTimeout(() => {
        if (document.getElementById('currency-converter-premium')) {
            window.converterInstance = new CurrencyConverterPremium();
            // Référence globale simplifiée pour les boutons
            window.currencyConverter = window.converterInstance;
        }
    }, 100);
};

// Observateur d'intersection pour charger le convertisseur quand il devient visible
document.addEventListener('DOMContentLoaded', () => {
    const converterElement = document.getElementById('currency-converter-premium');
    if (!converterElement) return;

    // Chargement paresseux quand la section devient visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                initConverter();
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(converterElement);

    // Fallback : chargement après interaction utilisateur
    ['click', 'scroll', 'touchstart'].forEach((event) => {
        document.addEventListener(event, () => {
            setTimeout(initConverter, 500);
        }, { once: true, passive: true });
    });
});
