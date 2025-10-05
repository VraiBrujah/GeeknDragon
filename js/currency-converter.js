/**
 * Convertisseur de monnaie D&D autonome avec optimisation algorithmique
 * 
 * REFACTORISATION MAJEURE v2.1.0 :
 * =====================================
 * - API complètement standardisée avec formats d'entrée/sortie uniformes
 * - Nomenclature française pour améliorer la lisibilité du code
 * - Documentation complète avec exemples concrets
 * - Méthodes de validation et nettoyage intégrées
 * - Cache optimisé pour les performances
 * 
 * RESPONSABILITÉS PRINCIPALES :
 * ==============================
 * - Conversion entre monnaies D&D avec multiplicateurs physiques (1x à 10000x)
 * - Optimisation du nombre minimal de pièces (métaheuristiques multi-stratégies)
 * - Intégration avec système de recommandations de lots CoinLotOptimizer
 * - Interface utilisateur réactive avec feedback temps réel
 * 
 * ARCHITECTURE PATTERNS :
 * ======================
 * - Strategy Pattern : Multiple algorithmes d'optimisation (glouton, équilibré, hybride)
 * - Observer Pattern : Callbacks pour notifications de changements
 * - Template Method : Structure commune, implémentations variables
 * - Factory Pattern : Génération d'objets formatés standardisés
 * 
 * FORMAT STANDARDISÉ API v2.1.0 :
 * ===============================
 * 
 * ENTRÉE (CoinData) :
 * {
 *   metal: string,           // 'copper', 'silver', 'electrum', 'gold', 'platinum'
 *   multiplicateur: number,  // 1, 10, 100, 1000, 10000
 *   quantite: number        // Nombre de pièces (>= 0)
 * }
 * 
 * SORTIE (ExtendedCoinData[]) :
 * [{
 *   metal: string,
 *   multiplicateur: number,
 *   quantite: number,
 *   valeurUnitaire: number,    // Valeur en cuivre de cette pièce
 *   valeurTotale: number,      // valeurUnitaire * quantite
 *   typeLot?: string           // 'single', 'trio', 'septuple'
 * }]
 * 
 * MÉTHODES PRINCIPALES API v2.1.0 :
 * =================================
 * - convertirMontant(montantCuivre, multiplicateurs?, conserverMetaux?)
 * - calculerTotalPieces(repartition)
 * - calculerValeurTotale(repartition)
 * - formaterPourAffichage(repartition, afficherMultiplicateurs?)
 * - obtenirRepartitionUtilisateur()
 * - validerDonnees(donnees, type)
 * - viderCache()
 * 
 * COMPATIBILITÉ :
 * ==============
 * Toutes les anciennes méthodes sont conservées avec des alias pour éviter
 * la casse du code existant. Migration progressive recommandée vers la nouvelle API.
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - API Standardisée et Refactorisée
 * @since 1.0.0 - Version initiale
 * @updated 2024-12-XX - Refactorisation majeure
 */
class CurrencyConverterPremium {
    /**
     * Initialise le convertisseur avec les taux de change D&D standard
     * et la configuration des multiplicateurs physiques disponibles
     */
    constructor() {
        // Configuration monétaire D&D standard (base cuivre)
        this.tauxChange = {
            copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000,
        };
        
        // Multiplicateurs physiques disponibles pour les pièces
        this.multiplicateursDisponibles = [1, 10, 100, 1000, 10000];
        
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
        this.donneesMetaux = {
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
        this.callbacksChangement = [];
        
        // Cache pour les calculs optimisés (amélioration performances)
        this.cacheCalculs = new Map();
        
        // Statistiques d'utilisation pour le débogage
        this.stats = {
            conversionsTotal: 0,
            cacheHits: 0,
            dernierCalcul: null
        };

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
            Object.keys(this.donneesMetaux).forEach((currency) => {
                const cardElement = document.getElementById(`${currency}-card`);
                if (cardElement) {
                    this.metalCards[currency] = cardElement;
                }
            });
        }
    }

    /**
     * Ajoute un callback pour les notifications de changement
     * 
     * @param {Function} callback - Fonction à exécuter lors des changements
     */
    ajouterCallbackChangement(callback) {
        if (typeof callback === 'function') {
            this.callbacksChangement.push(callback);
        }
    }

    /**
     * Notifie tous les callbacks enregistrés d'un changement
     * 
     * @param {Object} donnees - Données du changement
     */
    notifierChangement(donnees) {
        this.callbacksChangement.forEach((callback) => {
            try {
                callback(donnees);
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

    /**
     * Obtient le nom du métal dans la langue courante
     * 
     * @param {string} metal - Type de métal ('copper', 'silver', etc.)
     * @returns {string} Nom localisé du métal
     */
    obtenirNomMetal(metal) {
        const lang = this.getCurrentLang();
        const donneesMétal = this.donneesMetaux[metal];
        return lang === 'en' ? donneesMétal.nameEn : donneesMétal.name;
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
            this.mettreAJourDepuisSources();
            this.notifierChangement(this.obtenirValeursActuelles());
        }, 150);

        const debouncedUpdateMultipliers = debounce(() => {
            this.mettreAJourDepuisMultiplicateurs();
            this.notifierChangement(this.obtenirValeursActuelles());
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

    /**
     * ==================== API STANDARDISÉE ====================
     * Méthodes avec entrées/sorties uniformisées pour faciliter
     * la réutilisation et l'extension future
     * ========================================================
     */

    /**
     * Convertit un montant total en cuivre vers une répartition optimale de pièces
     * 
     * @param {number} montantCuivre - Montant total en pièces de cuivre
     * @param {Array<number>} multiplicateursDisponibles - Liste des multiplicateurs possibles
     * @param {boolean} conserverMetaux - Si true, conserve la répartition existante
     * @returns {Array<Object>} Répartition optimale par métal et multiplicateur
     * @throws {Error} Si le montant est négatif ou les multiplicateurs invalides
     * 
     * @example
     * const resultat = convertisseur.convertirMontant(1661, [1, 10, 100, 1000, 10000]);
     * // Retourne: [{metal: 'platinum', multiplicateur: 1, quantite: 1, ...}, ...]
     */
    convertirMontant(montantCuivre, multiplicateursDisponibles = this.multiplicateursDisponibles, conserverMetaux = false) {
        if (montantCuivre < 0) {
            throw new Error('Le montant ne peut pas être négatif');
        }
        
        if (!Array.isArray(multiplicateursDisponibles) || multiplicateursDisponibles.length === 0) {
            throw new Error('Les multiplicateurs doivent être un tableau non vide');
        }

        // Incrémenter les statistiques
        this.stats.conversionsTotal++;
        this.stats.dernierCalcul = new Date();

        // Utiliser le cache si disponible
        const cleCache = `${montantCuivre}_${multiplicateursDisponibles.join('_')}_${conserverMetaux}`;
        if (this.cacheCalculs.has(cleCache)) {
            this.stats.cacheHits++;
            return this.cacheCalculs.get(cleCache);
        }

        const resultat = this.calculerRepartitionOptimale(montantCuivre, multiplicateursDisponibles, conserverMetaux);
        
        // Mettre en cache pour 5 minutes
        setTimeout(() => this.cacheCalculs.delete(cleCache), 300000);
        this.cacheCalculs.set(cleCache, resultat);
        
        return resultat;
    }

    /**
     * Calcule la répartition optimale de pièces pour un montant donné
     * 
     * @param {number} montantCuivre - Montant en cuivre à convertir
     * @param {Array<number>} multiplicateurs - Multiplicateurs autorisés
     * @param {boolean} conserverMetaux - Conserver la répartition utilisateur
     * @returns {Array<Object>} Tableau de pièces optimales
     */
    calculerRepartitionOptimale(montantCuivre, multiplicateurs, conserverMetaux) {
        if (montantCuivre === 0) {
            return [];
        }

        if (conserverMetaux) {
            return this.obtenirRepartitionUtilisateur();
        }

        // Appliquer la stratégie d'optimisation actuelle
        const solutionBrute = this.findMinimalCoins(montantCuivre, false);
        return this.formaterSolutionStandard(solutionBrute);
    }

    /**
     * Convertit des données brutes vers le format standardisé uniforme
     * 
     * Transforme les résultats de l'algorithme d'optimisation en format standardisé
     * avec toutes les métadonnées nécessaires pour les calculs et l'affichage
     * 
     * @param {Array} donneesBrutes - Résultats bruts de l'algorithme d'optimisation
     * @returns {Array<Object>} Liste standardisée avec métadonnées complètes
     */
    formaterSolutionStandard(donneesBrutes) {
        if (!donneesBrutes || donneesBrutes.length === 0) {
            return [];
        }

        return donneesBrutes.map(element => ({
            metal: element.currency,
            multiplicateur: element.multiplier,
            quantite: element.quantity,
            valeurUnitaire: this.tauxChange[element.currency] * element.multiplier,
            valeurTotale: this.tauxChange[element.currency] * element.multiplier * element.quantity,
            typeLot: element.lotType || 'unitaire'
        }));
    }

    /**
     * Calcule le nombre total de pièces physiques pour une répartition donnée
     * 
     * @param {Array<Object>} repartition - Répartition au format standardisé
     * @returns {number} Nombre total de pièces physiques
     * 
     * @example
     * const total = convertisseur.calculerTotalPieces(repartition);
     * // Retourne: 4 (pour 1 platine + 1 or + 1 argent + 1 cuivre)
     */
    calculerTotalPieces(repartition) {
        if (!Array.isArray(repartition)) {
            return 0;
        }
        
        return repartition.reduce((total, piece) => {
            return total + (piece.quantite || 0);
        }, 0);
    }

    /**
     * Calcule la valeur totale en cuivre d'une répartition de pièces
     * 
     * @param {Array<Object>} repartition - Répartition au format standardisé
     * @returns {number} Valeur totale en cuivre
     */
    calculerValeurTotale(repartition) {
        if (!Array.isArray(repartition)) {
            return 0;
        }
        
        return repartition.reduce((total, piece) => {
            return total + (piece.valeurTotale || 0);
        }, 0);
    }

    /**
     * Formate une répartition de pièces pour l'affichage utilisateur
     * 
     * @param {Array<Object>} repartition - Répartition au format standardisé
     * @param {boolean} afficherMultiplicateurs - Inclure les multiplicateurs dans l'affichage
     * @returns {string} Texte formaté pour l'affichage
     * 
     * @example
     * const texte = convertisseur.formaterPourAffichage(repartition, true);
     * // Retourne: "1 💎 platine (×1), 1 🥇 or (×100) et 1 🥈 argent (×1)"
     */
    formaterPourAffichage(repartition, afficherMultiplicateurs = true) {
        if (!Array.isArray(repartition) || repartition.length === 0) {
            return '';
        }

        const elementsDeTexte = repartition.map(piece => {
            const informationsMétal = this.donneesMetaux[piece.metal];
            const nomMetal = this.obtenirNomMetal(piece.metal);
            const quantiteFormatee = this.nf.format(piece.quantite);
            
            let textePiece = `${quantiteFormatee} ${informationsMétal.emoji} ${nomMetal.toLowerCase()}`;
            
            // Ajouter le multiplicateur si nécessaire et demandé
            if (afficherMultiplicateurs && piece.multiplicateur !== 1) {
                textePiece += ` (×${this.nf.format(piece.multiplicateur)})`;
            }
            
            // Ajouter un indicateur visuel pour les lots groupés (trio, septuple)
            if (piece.typeLot === 'trio' || piece.typeLot === 'septuple') {
                textePiece += ' 📦';
            }
            
            return textePiece;
        });

        // Joindre avec "et" pour le dernier élément (grammaire française)
        if (elementsDeTexte.length > 1) {
            const dernierElement = elementsDeTexte.pop();
            return `${elementsDeTexte.join(', ')} ${this.getTranslation('shop.converter.and', 'et')} ${dernierElement}`;
        }

        return elementsDeTexte[0] || '';
    }

    /**
     * ==================== MÉTHODES HÉRITÉES ====================
     * Méthodes conservées pour compatibilité avec le code existant
     * Redirection vers les nouvelles méthodes standardisées
     * ====================================================
     */

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
    
    // Alias pour compatibilité
    obtenirValeursActuelles() {
        return this.getCurrentValues();
    }

    /**
     * Récupère la répartition de pièces saisie par l'utilisateur dans le tableau éditable
     * 
     * @returns {Array<Object>} Liste des pièces avec quantités au format standardisé
     * @example
     * // Si l'utilisateur a saisi 1 électrum ×1 et 1 argent ×1
     * // Retourne: [{metal: 'electrum', multiplicateur: 1, quantite: 1, ...}, ...]
     */
    obtenirRepartitionUtilisateur() {
        const donneesBrutes = this.getUserMultiplierBreakdown();
        return this.formaterSolutionStandard(donneesBrutes);
    }

    // Alias pour l'ancienne méthode
    onChange(callback) {
        this.ajouterCallbackChangement(callback);
    }

    // Alias pour l'ancienne méthode
    notifyChange(data) {
        this.notifierChangement(data);
    }

    // Alias pour l'ancienne méthode
    getCurrencyName(currency) {
        return this.obtenirNomMetal(currency);
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
            return sum + amount * this.tauxChange[currency];
        }, 0);
    }

    /**
     * Met à jour tous les affichages depuis les valeurs sources saisies
     */
    mettreAJourDepuisSources() {
        const valeurBase = this.getTotalBaseValue();

        // Mettre à jour le tableau multiplicateur avec optimisation
        this.updateMultiplierTableWithOptimization(valeurBase);

        this.updateMetalCards(valeurBase);
        this.updateOptimalRecommendationsFromUser(valeurBase);
        this.updateCoinLotsRecommendations(valeurBase, true);
    }
    
    // Alias pour compatibilité
    updateFromSources() {
        this.mettreAJourDepuisSources();
    }

    /**
     * Met à jour tous les affichages depuis les valeurs du tableau multiplicateur
     */
    mettreAJourDepuisMultiplicateurs() {
        // Calculer la valeur totale depuis les inputs multiplicateur
        let valeurTotale = 0;
        this.multiplierInputs.forEach((input) => {
            const { currency } = input.closest('tr').dataset;
            const multiplier = parseInt(input.dataset.multiplier);
            const quantity = parseInt(input.value.replace(/\s/g, '')) || 0;
            valeurTotale += quantity * this.tauxChange[currency] * multiplier;
        });

        // Vider les sources
        this.sourceInputs.forEach((input) => {
            input.value = '0';
        });

        // Redistribuer de manière optimale dans les sources
        this.distributeOptimally(valeurTotale);
        this.updateMetalCards(valeurTotale);
        this.updateOptimalRecommendationsFromUser(valeurTotale);
        this.updateCoinLotsRecommendations(valeurTotale, true);
    }
    
    // Alias pour compatibilité
    updateFromMultipliers() {
        this.mettreAJourDepuisMultiplicateurs();
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
            const taux = this.tauxChange[currency];
            const count = Math.floor(remaining / taux);
            if (count > 0) {
                input.value = count.toString();
                remaining -= count * taux;
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

        Object.keys(this.tauxChange).forEach((currency) => {
            if (!this.metalCards[currency]) return;

            const donneesMétal = this.donneesMetaux[currency];
            const taux = this.tauxChange[currency];
            const unitesTotales = Math.floor(baseValue / taux);

            if (unitesTotales === 0) {
                this.metalCards[currency].innerHTML = '';
                return;
            }

            // Calcul du nombre minimal de pièces avec multiplicateurs
            const piecesMinimales = this.getMinimalCoinsBreakdown(unitesTotales);
            const valeurReste = baseValue % taux;
            let texteReste = '';
            if (valeurReste > 0) {
                texteReste = this.getOptimalBreakdown(valeurReste);
            }

            this.metalCards[currency].innerHTML = `
        <div class="currency-total-card bg-gradient-to-br from-${donneesMétal.color}-900/20 to-${donneesMétal.color}-800/20 rounded-xl p-6 border border-${donneesMétal.color}-700/30">
          <div class="flex items-center justify-between mb-4">
            <h6 class="text-${donneesMétal.color}-300 font-bold text-lg">${donneesMétal.emoji} ${this.obtenirNomMetal(currency)}</h6>
            <span class="text-2xl font-bold text-${donneesMétal.color}-300">${this.nf.format(unitesTotales)}</span>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="text-sm">
              <span class="text-gray-300">${this.getTranslation('shop.converter.minimalCoins', 'Nombre minimal de pièces')}:</span>
            </div>
            ${piecesMinimales.map((item) => `
              <div class="flex justify-between text-sm pl-2">
                <span class="text-gray-300">${item.multiplier === 1 ? this.getTranslation('shop.converter.units', 'Unités') : `Multiplicateur ×${this.nf.format(item.multiplier)}`}:</span>
                <span class="text-${donneesMétal.color}-300 font-medium">${this.nf.format(item.quantity)}</span>
              </div>
            `).join('')}
            <div class="border-t border-${donneesMétal.color}-700/30 pt-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${this.getTranslation('shop.converter.totalCoins', 'Total pièces')}:</span>
                <span class="text-${donneesMétal.color}-300 font-bold">${this.nf.format(piecesMinimales.reduce((sum, item) => sum + item.quantity, 0))}</span>
              </div>
            </div>
          </div>
          
          ${texteReste ? `
            <div class="border-t border-${donneesMétal.color}-700/30 pt-3">
              <p class="text-xs text-gray-400">${this.getTranslation('shop.converter.remainder', 'Reste')}: ${texteReste}</p>
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
        this.multiplicateursDisponibles.slice().reverse().forEach((mult) => {
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

        // Mode conversion automatique : algorithme glouton optimal corrigé
        // CORRECTION MAJEURE : Créer toutes les dénominations et les trier par valeur décroissante
        const denominations = [];
        metalPriority.forEach((metal) => {
            // ORDRE INVERSÉ : Du plus grand multiplicateur au plus petit pour minimiser les pièces
            this.multiplicateursDisponibles.slice().reverse().forEach((multiplier) => {
                denominations.push({
                    currency: metal,
                    multiplier,
                    value: this.tauxChange[metal] * multiplier,
                });
            });
        });

        // Trier par valeur décroissante pour l'algorithme glouton optimal
        denominations.sort((a, b) => b.value - a.value);

        // Algorithme glouton pour minimisation du nombre de pièces
        denominations.forEach((denom) => {
            if (remaining >= denom.value) {
                const quantity = Math.floor(remaining / denom.value);
                if (quantity > 0) {
                    result.push({
                        currency: denom.currency,
                        multiplier: denom.multiplier,
                        quantity,
                        value: denom.value,
                    });
                    remaining -= quantity * denom.value;
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

        // CORRECTION : Utiliser l'algorithme glouton optimal identique
        const denominations = [];
        metalPriority.forEach((metal) => {
            // Du plus grand multiplicateur au plus petit pour minimiser les pièces
            this.multiplicateursDisponibles.slice().reverse().forEach((multiplier) => {
                denominations.push({
                    currency: metal,
                    multiplier,
                    value: this.tauxChange[metal] * multiplier,
                });
            });
        });

        // Trier par valeur décroissante pour l'algorithme glouton optimal
        denominations.sort((a, b) => b.value - a.value);

        // Algorithme glouton pour minimisation du nombre de pièces
        denominations.forEach((denom) => {
            if (remaining >= denom.value) {
                const quantity = Math.floor(remaining / denom.value);
                if (quantity > 0) {
                    result.push({
                        currency: denom.currency,
                        multiplier: denom.multiplier,
                        quantity,
                        value: denom.value,
                    });
                    remaining -= quantity * denom.value;
                }
            }
        });

        return result;
    }

    // NOUVELLE MÉTHODE: Optimiser quantité pour lots économiques
    optimizeQuantityForBulk(quantity, metal, multiplier) {
        const valeurPiece = this.tauxChange[metal] * multiplier;

        // Si quantité >= 7, privilégier les septuples
        if (quantity >= 7) {
            return {
                quantity,
                totalValue: quantity * valeurPiece,
                hasBulkDiscount: true,
            };
        }

        // Si quantité >= 3, privilégier les trios
        if (quantity >= 3) {
            return {
                quantity,
                totalValue: quantity * valeurPiece,
                hasBulkDiscount: true,
            };
        }

        return {
            quantity,
            totalValue: quantity * valeurPiece,
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
            this.multiplicateursDisponibles.forEach((multiplier) => {
                denoms.push({
                    currency,
                    multiplier,
                    value: this.tauxChange[currency] * multiplier,
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

        for (const multiplier of this.multiplicateursDisponibles.slice().reverse()) {
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
            const taux = this.tauxChange[currency];
            const count = Math.floor(remaining / taux);
            if (count > 0) {
                pieces += count;
                remaining -= count * taux;
            }
        });

        return pieces;
    }

    getRemainderBreakdown(remainderValue) {
        const breakdown = [];
        let remaining = remainderValue;
        const currencies = ['platinum', 'gold', 'electrum', 'silver'];

        currencies.forEach((currency) => {
            const taux = this.tauxChange[currency];
            const count = Math.floor(remaining / taux);
            if (count > 0) {
                const donneesMétal = this.donneesMetaux[currency];
                breakdown.push(`${count} ${donneesMétal.emoji} ${this.obtenirNomMetal(currency).toLowerCase()}`);
                remaining -= count * taux;
            }
        });

        if (remaining > 0) {
            breakdown.push(`${remaining} ${this.donneesMetaux.copper.emoji} ${this.getCurrencyName('copper').toLowerCase()}`);
        }

        return breakdown.join(', ');
    }

    // FONCTION updateOptimalRecommendations SUPPRIMÉE - Remplacée par updateOptimalRecommendationsFromUser partout

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
            const donneesMétal = this.donneesMetaux[item.currency];
            const hasLots = item.lotTypes.some((type) => type === 'trio' || type === 'septuple');
            const lotIndicator = hasLots ? '📦' : '';

            if (item.multiplier === 1) {
                return `${this.nf.format(item.totalQuantity)} ${donneesMétal.emoji} ${this.obtenirNomMetal(item.currency).toLowerCase()} ${lotIndicator}`;
            }
            return `${this.nf.format(item.totalQuantity)} ${donneesMétal.emoji} ${this.obtenirNomMetal(item.currency).toLowerCase()}(×${this.nf.format(item.multiplier)}) ${lotIndicator}`;
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
          <p class="text-gray-300 text-lg mb-2">Définissez votre trésor dans le convertisseur</p>
          <p class="text-gray-400 text-sm">pour découvrir les collections optimales</p>
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
          <p class="text-gray-300 text-lg mb-2">Aucune collection disponible</p>
          <p class="text-gray-400 text-sm">Modifiez votre trésor pour découvrir de nouvelles options</p>
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

    /**
     * ==================== MÉTHODES DE NETTOYAGE ====================
     * Méthodes pour la maintenance et l'optimisation des performances
     * ===========================================================
     */

    /**
     * Vide le cache des calculs pour libérer la mémoire
     */
    viderCache() {
        this.cacheCalculs.clear();
        this.stats.cacheHits = 0;
    }

    /**
     * Obtient les statistiques d'utilisation du convertisseur
     * 
     * @returns {Object} Statistiques d'utilisation
     */
    obtenirStatistiques() {
        return {
            ...this.stats,
            tailleCache: this.cacheCalculs.size,
            tauxCacheHit: this.stats.conversionsTotal > 0 
                ? (this.stats.cacheHits / this.stats.conversionsTotal * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Réinitialise toutes les statistiques
     */
    reinitialiserStatistiques() {
        this.stats = {
            conversionsTotal: 0,
            cacheHits: 0,
            dernierCalcul: null
        };
    }

    /**
     * Valide les données d'entrée avant traitement
     * 
     * @param {*} donnees - Données à valider
     * @param {string} typeAttendu - Type attendu ('number', 'array', etc.)
     * @returns {boolean} True si les données sont valides
     */
    validerDonnees(donnees, typeAttendu) {
        switch (typeAttendu) {
            case 'number':
                return typeof donnees === 'number' && !isNaN(donnees) && donnees >= 0;
            case 'array':
                return Array.isArray(donnees) && donnees.length > 0;
            case 'repartition':
                return Array.isArray(donnees) && donnees.every(item => 
                    item.metal && 
                    typeof item.multiplicateur === 'number' && 
                    typeof item.quantite === 'number'
                );
            default:
                return false;
        }
    }

    /**
     * ==================== MÉTHODES HÉRITÉES (COMPATIBILITÉ) ====================
     * Conservées pour la compatibilité avec le code existant
     * =======================================================
     */

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
                        value: this.tauxChange[currency] * multiplier,
                    });
                }
            });
        }

        return userBreakdown;
    }

    /**
     * Formate une répartition de pièces vers le format standardisé pour compatibilité
     * 
     * Convertit les anciennes données de répartition vers le nouveau format uniforme
     * tout en maintenant la compatibilité avec le code existant
     * 
     * @param {Array} repartitionAncienFormat - Répartition au format hérité
     * @returns {string} Texte formaté pour affichage utilisateur
     */
    formatBreakdownText(repartitionAncienFormat) {
        if (!repartitionAncienFormat || repartitionAncienFormat.length === 0) return '';

        const elementsFormmates = repartitionAncienFormat.map((element) => {
            const informationsMétal = this.donneesMetaux[element.currency];
            // Toujours afficher le multiplicateur pour cohérence avec les lots recommandés
            return `${this.nf.format(element.quantity)} ${informationsMétal.emoji} ${this.obtenirNomMetal(element.currency).toLowerCase()} (×${this.nf.format(element.multiplier)})`;
        });

        // Assembler avec "et" pour respecter la grammaire française
        if (elementsFormmates.length > 1) {
            const dernierElement = elementsFormmates.pop();
            return `${elementsFormmates.join(', ')} ${this.getTranslation('shop.converter.and', 'et')} ${dernierElement}`;
        }

        return elementsFormmates.join('');
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
        const goldValue = Math.floor(baseValue / this.tauxChange.gold);
        const goldRemainder = baseValue % this.tauxChange.gold;

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
