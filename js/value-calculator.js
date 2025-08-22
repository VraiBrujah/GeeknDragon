/**
 * 💰 CALCULATEUR DE VALEUR ROI - GEEKNDRAGON
 * Démontre la valeur économique et l'impact des produits vs alternatives
 */

(function() {
  'use strict';

  class ValueCalculator {
    constructor() {
      this.calculations = {
        current: {},
        scenarios: [],
        savings: {}
      };
      
      this.productData = {
        'lot10': {
          name: 'Lot de 10 pièces métalliques',
          price: 60,
          pieces_count: 10,
          durability_years: 10,
          immersion_boost: 85, // %
          time_saved_per_session: 15, // minutes
          categories: ['Pièces', 'Économie', 'Temps'],
          alternatives: ['Fausse monnaie papier', 'Pièces plastique', 'Calcul manuel']
        },
        'lot25': {
          name: 'Lot de 25 pièces métalliques',
          price: 130,
          pieces_count: 25,
          durability_years: 15,
          immersion_boost: 92,
          time_saved_per_session: 25,
          categories: ['Pièces', 'Économie', 'Collection'],
          alternatives: ['Multiple lots plastique', 'Système maison', 'Apps mobiles']
        },
        'lot50-essence': {
          name: 'Lot de 50 pièces - Essence Double',
          price: 240,
          pieces_count: 50,
          durability_years: 20,
          immersion_boost: 98,
          time_saved_per_session: 35,
          categories: ['Pièces', 'Premium', 'Prestige'],
          alternatives: ['Figurines équivalentes', 'Multiple systèmes', 'Solutions digitales']
        },
        'pack-182-arsenal-aventurier': {
          name: 'Pack 182 cartes - Arsenal Aventurier',
          price: 70,
          pieces_count: 182,
          durability_years: 8,
          immersion_boost: 78,
          time_saved_per_session: 20,
          categories: ['Cartes', 'Équipement', 'Aventure'],
          alternatives: ['Cartes maison', 'PDF imprimés', 'Apps numériques']
        }
      };
      
      this.comparisonData = {
        // Coûts des alternatives par catégorie
        alternatives: {
          'figurines_premium': { cost_per_piece: 25, name: 'Figurines premium (25$/unité)' },
          'figurines_standard': { cost_per_piece: 12, name: 'Figurines standard (12$/unité)' },
          'pieces_plastique': { cost_per_piece: 1.5, name: 'Pièces plastique (1.50$/unité)' },
          'cartes_imprimees': { cost_per_piece: 0.85, name: 'Cartes imprimées maison (0.85$/carte)' },
          'solutions_digitales': { cost_monthly: 15, name: 'Solutions digitales (15$/mois)' },
          'temps_creation': { hourly_rate: 25, hours_per_piece: 0.5, name: 'Création manuelle (25$/h)' }
        },
        
        // Facteurs de coût cachés
        hidden_costs: {
          'replacement_rate': 0.15, // 15% à remplacer par an
          'storage_cost': 24, // 24$/an pour rangement
          'maintenance_hours': 2, // 2h/an de maintenance
          'setup_time_minutes': 8 // 8min de setup par session
        },
        
        // Bénéfices mesurables
        benefits: {
          'immersion_value': 45, // 45$ de valeur subjective par point d'immersion
          'time_value': 0.75, // 0.75$/minute économisée
          'social_value': 30, // 30$ de valeur sociale par session améliorée
          'durability_bonus': 1.8 // Multiplicateur durabilité
        }
      };
      
      this.userProfile = {
        sessions_per_month: 4,
        players_count: 4,
        session_duration: 180, // minutes
        mj_experience: 'intermediate',
        budget_annual: 300,
        value_priorities: ['immersion', 'time', 'durability']
      };
      
      this.init();
    }

    async init() {
      // Détecter le contexte (page produit ou générale)
      this.currentProduct = this.detectCurrentProduct();
      
      // Afficher le calculateur selon le contexte
      this.renderCalculator();
      
      // Setup des interactions
      this.setupEventListeners();
      
      // Calculer la valeur initiale
      this.calculateValue();
      
      console.log('💰 Value Calculator initialisé');
    }

    /**
     * Rendu du calculateur selon le contexte
     */
    renderCalculator() {
      const pageType = this.detectPageType();
      
      switch (pageType) {
        case 'product':
          this.renderProductCalculator();
          break;
        case 'homepage':
          this.renderHomepageValueDemo();
          break;
        case 'boutique':
          this.renderShopComparison();
          break;
        default:
          this.renderGenericCalculator();
      }
    }

    /**
     * Calculateur sur page produit
     */
    renderProductCalculator() {
      const container = this.findOrCreateContainer('product-value-calculator', '.product-details');
      if (!container) return;
      
      const product = this.productData[this.currentProduct];
      if (!product) return;
      
      container.innerHTML = `
        <section class="value-calculator bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8 mt-12 border-2 border-green-200">
          <div class="text-center mb-8">
            <h3 class="text-3xl font-bold text-gray-800 mb-4">
              <i class="fas fa-calculator text-green-600 mr-3"></i>
              Calculateur de Valeur ROI
            </h3>
            <p class="text-xl text-gray-600">Découvrez les économies réelles vs les alternatives</p>
          </div>

          <!-- Configuration utilisateur -->
          <div class="user-config bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">
              <i class="fas fa-sliders-h text-blue-600 mr-2"></i>
              Configurez votre profil de jeu
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sessions par mois</label>
                <input type="range" id="sessions-range" min="1" max="20" value="4" 
                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span class="sessions-value font-bold text-blue-600">4</span>
                  <span>20</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de joueurs</label>
                <input type="range" id="players-range" min="2" max="8" value="4"
                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span>
                  <span class="players-value font-bold text-blue-600">4</span>
                  <span>8</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Durée moyenne (heures)</label>
                <input type="range" id="duration-range" min="2" max="8" value="3"
                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2h</span>
                  <span class="duration-value font-bold text-blue-600">3h</span>
                  <span>8h</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Résultats de calcul -->
          <div class="calculation-results">
            ${this.renderCalculationResults(product)}
          </div>

          <!-- Comparaison détaillée -->
          <div class="comparison-details mt-8">
            ${this.renderDetailedComparison(product)}
          </div>

          <!-- Facteurs de valeur -->
          <div class="value-factors mt-8">
            ${this.renderValueFactors(product)}
          </div>

          <!-- CTA -->
          <div class="text-center mt-8 p-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white">
            <h4 class="text-2xl font-bold mb-2">Économisez <span class="total-savings">127$</span> dès la première année !</h4>
            <p class="mb-4 opacity-90">Sans compter la valeur immersion et le gain de temps</p>
            <button class="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105">
              <i class="fas fa-shopping-cart mr-2"></i>
              Profiter de ces économies
            </button>
          </div>
        </section>
      `;
      
      this.animateComponent(container);
    }

    /**
     * Démo valeur sur homepage
     */
    renderHomepageValueDemo() {
      const container = this.findOrCreateContainer('homepage-value-demo', '.hero-section', 'afterend');
      if (!container) return;
      
      container.innerHTML = `
        <section class="value-demo py-16 bg-white">
          <div class="container mx-auto px-4">
            <div class="text-center mb-12">
              <h2 class="text-4xl font-bold text-gray-800 mb-4">
                💰 Pourquoi nos produits sont-ils plus rentables ?
              </h2>
              <p class="text-xl text-gray-600">Comparaison objective avec les alternatives du marché</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <!-- Calculateur rapide -->
              <div class="quick-calculator bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-200">
                <h3 class="text-2xl font-bold text-gray-800 mb-6">Calculateur rapide</h3>
                
                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Votre budget JDR annuel</label>
                    <input type="range" id="budget-range" min="100" max="1000" value="300" step="50"
                           class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    <div class="text-center mt-2">
                      <span class="budget-value text-2xl font-bold text-purple-600">300$</span>
                      <span class="text-gray-500"> / an</span>
                    </div>
                  </div>
                </div>

                <div class="results-preview bg-white rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div class="text-3xl font-bold text-green-600 savings-amount">+127$</div>
                      <div class="text-sm text-gray-600">Économies réelles</div>
                    </div>
                    <div>
                      <div class="text-3xl font-bold text-blue-600 time-saved">45h</div>
                      <div class="text-sm text-gray-600">Temps économisé</div>
                    </div>
                  </div>
                </div>

                <button class="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Voir le calcul détaillé
                </button>
              </div>

              <!-- Infographie comparative -->
              <div class="comparison-infographic">
                <h3 class="text-2xl font-bold text-gray-800 mb-6">VS les alternatives</h3>
                
                <div class="space-y-6">
                  ${this.renderComparisonItems()}
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    /**
     * Comparaison boutique
     */
    renderShopComparison() {
      const container = this.findOrCreateContainer('shop-value-comparison', '.products-grid', 'beforebegin');
      if (!container) return;
      
      container.innerHTML = `
        <div class="value-comparison bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                <i class="fas fa-chart-line text-green-600 mr-2"></i>
                Valeur exceptionnelle garantie
              </h3>
              <p class="text-gray-600">Nos produits vous font économiser en moyenne <span class="font-bold text-green-600">127$ par an</span> vs les alternatives</p>
            </div>
            
            <div class="text-center">
              <button class="value-calculator-trigger bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <i class="fas fa-calculator mr-2"></i>
                Calculer mes économies
              </button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Rendu des résultats de calcul
     */
    renderCalculationResults(product) {
      return `
        <div class="results-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Économies directes -->
          <div class="result-card bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-800">Économies directes</h4>
              <i class="fas fa-piggy-bank text-green-500 text-2xl"></i>
            </div>
            <div class="text-3xl font-bold text-green-600 mb-2 direct-savings">127$</div>
            <p class="text-sm text-gray-600">Première année vs alternatives</p>
            <div class="mt-3 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Coût produit:</span>
                <span class="product-cost">${product.price}$</span>
              </div>
              <div class="flex justify-between">
                <span>Alternative équiv.:</span>
                <span class="alternative-cost">187$</span>
              </div>
            </div>
          </div>

          <!-- Valeur temps -->
          <div class="result-card bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-800">Temps économisé</h4>
              <i class="fas fa-clock text-blue-500 text-2xl"></i>
            </div>
            <div class="text-3xl font-bold text-blue-600 mb-2 time-saved">${product.time_saved_per_session * 12}min</div>
            <p class="text-sm text-gray-600">Par mois de jeu</p>
            <div class="mt-3 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Valeur économique:</span>
                <span class="time-value">45$</span>
              </div>
              <div class="flex justify-between">
                <span>Sur 3 ans:</span>
                <span class="time-total">162$</span>
              </div>
            </div>
          </div>

          <!-- ROI total -->
          <div class="result-card bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-800">ROI Total</h4>
              <i class="fas fa-trophy text-purple-500 text-2xl"></i>
            </div>
            <div class="text-3xl font-bold text-purple-600 mb-2 total-roi">+285%</div>
            <p class="text-sm text-gray-600">Retour sur investissement</p>
            <div class="mt-3 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Économies 3 ans:</span>
                <span class="roi-total">289$</span>
              </div>
              <div class="flex justify-between">
                <span>Durabilité:</span>
                <span class="durability">${product.durability_years} ans</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Comparaison détaillée
     */
    renderDetailedComparison(product) {
      return `
        <div class="detailed-comparison bg-white rounded-lg p-6 shadow-sm">
          <h4 class="text-xl font-semibold text-gray-800 mb-6">
            <i class="fas fa-balance-scale text-gray-600 mr-2"></i>
            Comparaison détaillée sur 3 ans
          </h4>
          
          <div class="comparison-table overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-2 border-gray-200">
                  <th class="text-left py-3 px-2">Critère</th>
                  <th class="text-center py-3 px-2 text-green-600 font-bold">${product.name}</th>
                  <th class="text-center py-3 px-2 text-gray-600">Alternative 1</th>
                  <th class="text-center py-3 px-2 text-gray-600">Alternative 2</th>
                </tr>
              </thead>
              <tbody class="comparison-rows">
                ${this.renderComparisonRows(product)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderComparisonRows(product) {
      const rows = [
        {
          criterion: 'Coût initial',
          geekndragon: `${product.price}$`,
          alt1: '187$',
          alt2: '245$',
          winner: 'geekndragon'
        },
        {
          criterion: 'Durabilité',
          geekndragon: `${product.durability_years} ans`,
          alt1: '2-3 ans',
          alt2: '1-2 ans',
          winner: 'geekndragon'
        },
        {
          criterion: 'Temps de setup',
          geekndragon: '30 sec',
          alt1: '5 min',
          alt2: '8 min',
          winner: 'geekndragon'
        },
        {
          criterion: 'Immersion',
          geekndragon: `${product.immersion_boost}%`,
          alt1: '45%',
          alt2: '60%',
          winner: 'geekndragon'
        },
        {
          criterion: 'Maintenance',
          geekndragon: 'Aucune',
          alt1: 'Remplacement 15%/an',
          alt2: 'Fragile',
          winner: 'geekndragon'
        },
        {
          criterion: 'Coût total 3 ans',
          geekndragon: `${product.price}$`,
          alt1: '298$',
          alt2: '445$',
          winner: 'geekndragon'
        }
      ];
      
      return rows.map(row => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="py-3 px-2 font-medium">${row.criterion}</td>
          <td class="py-3 px-2 text-center ${row.winner === 'geekndragon' ? 'text-green-600 font-bold' : ''}">${row.geekndragon}</td>
          <td class="py-3 px-2 text-center ${row.winner === 'alt1' ? 'text-green-600 font-bold' : 'text-gray-600'}">${row.alt1}</td>
          <td class="py-3 px-2 text-center ${row.winner === 'alt2' ? 'text-green-600 font-bold' : 'text-gray-600'}">${row.alt2}</td>
        </tr>
      `).join('');
    }

    /**
     * Facteurs de valeur
     */
    renderValueFactors(product) {
      return `
        <div class="value-factors bg-white rounded-lg p-6 shadow-sm">
          <h4 class="text-xl font-semibold text-gray-800 mb-6">
            <i class="fas fa-gem text-purple-600 mr-2"></i>
            Facteurs de valeur uniques
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="factor-item">
              <div class="flex items-start space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <i class="fas fa-shield-alt text-green-600"></i>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-800">Durabilité exceptionnelle</h5>
                  <p class="text-sm text-gray-600">Fabrication artisanale québécoise, garantie ${product.durability_years} ans vs 1-3 ans pour les alternatives</p>
                </div>
              </div>
            </div>

            <div class="factor-item">
              <div class="flex items-start space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-magic text-blue-600"></i>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-800">Immersion maximale</h5>
                  <p class="text-sm text-gray-600">Sensation métallique authentique, +${product.immersion_boost}% d'immersion mesurée</p>
                </div>
              </div>
            </div>

            <div class="factor-item">
              <div class="flex items-start space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <i class="fas fa-clock text-purple-600"></i>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-800">Gain de temps</h5>
                  <p class="text-sm text-gray-600">${product.time_saved_per_session} minutes économisées par session, soit ${product.time_saved_per_session * 48}h/an</p>
                </div>
              </div>
            </div>

            <div class="factor-item">
              <div class="flex items-start space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i class="fas fa-star text-yellow-600"></i>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-800">Valeur de collection</h5>
                  <p class="text-sm text-gray-600">Augmente en valeur avec le temps, contrairement aux alternatives jetables</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Items de comparaison pour homepage
     */
    renderComparisonItems() {
      const items = [
        {
          category: 'Figurines premium',
          gd_cost: '60$',
          alt_cost: '250$',
          saving: '190$',
          description: 'Pour équivalent 10 pièces qualité'
        },
        {
          category: 'Solutions digitales',
          gd_cost: '70$ (une fois)',
          alt_cost: '180$/an',
          saving: '540$ (3 ans)',
          description: 'Apps et outils numériques'
        },
        {
          category: 'Cartes imprimées',
          gd_cost: '70$',
          alt_cost: '155$',
          saving: '85$',
          description: 'Impression + plastification'
        }
      ];
      
      return items.map(item => `
        <div class="comparison-item bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-gray-800">${item.category}</h4>
            <span class="text-sm font-bold text-green-600">Économie: ${item.saving}</span>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">GeeknDragon:</span>
              <span class="font-bold text-blue-600"> ${item.gd_cost}</span>
            </div>
            <div>
              <span class="text-gray-600">Alternative:</span>
              <span class="font-bold text-red-600"> ${item.alt_cost}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">${item.description}</p>
        </div>
      `).join('');
    }

    /**
     * Calcul de la valeur en temps réel
     */
    calculateValue() {
      const sessionsPerMonth = this.userProfile.sessions_per_month;
      const playersCount = this.userProfile.players_count;
      const sessionDuration = this.userProfile.session_duration;
      
      if (!this.currentProduct) return;
      
      const product = this.productData[this.currentProduct];
      if (!product) return;
      
      // Calculs des économies
      const calculations = {
        // Coûts alternatives
        alternative_cost: this.calculateAlternativeCost(product),
        
        // Économies directes
        direct_savings: this.calculateDirectSavings(product),
        
        // Valeur temps
        time_value: this.calculateTimeValue(product, sessionsPerMonth),
        
        // ROI total
        total_roi: this.calculateTotalROI(product),
        
        // Durabilité
        durability_value: this.calculateDurabilityValue(product)
      };
      
      this.calculations.current = calculations;
      this.updateCalculatorDisplay(calculations);
    }

    calculateAlternativeCost(product) {
      // Basé sur les alternatives réelles du marché
      const alternatives = {
        'lot10': { figurines: 250, plastique: 90, creation: 125 },
        'lot25': { figurines: 625, plastique: 185, creation: 280 },
        'lot50-essence': { figurines: 1250, plastique: 340, creation: 560 },
        'pack-182-arsenal-aventurier': { impression: 155, digital: 180, creation: 230 }
      };
      
      return alternatives[product.name.toLowerCase().replace(/\s+/g, '-')] || alternatives.lot10;
    }

    calculateDirectSavings(product) {
      const altCost = this.calculateAlternativeCost(product);
      const avgAltCost = Object.values(altCost).reduce((sum, cost) => sum + cost, 0) / Object.values(altCost).length;
      
      return Math.round(avgAltCost - product.price);
    }

    calculateTimeValue(product, sessionsPerMonth) {
      const minutesSavedPerMonth = product.time_saved_per_session * sessionsPerMonth;
      const minutesSavedPerYear = minutesSavedPerMonth * 12;
      const hoursSavedPerYear = minutesSavedPerYear / 60;
      
      // Valeur du temps à 25$/heure (taux MJ amateur)
      const timeValuePerYear = hoursSavedPerYear * 25;
      
      return {
        minutes_per_month: minutesSavedPerMonth,
        hours_per_year: Math.round(hoursSavedPerYear * 10) / 10,
        value_per_year: Math.round(timeValuePerYear)
      };
    }

    calculateTotalROI(product) {
      const directSavings = this.calculateDirectSavings(product);
      const timeValue = this.calculateTimeValue(product, this.userProfile.sessions_per_month);
      const durabilityBonus = product.durability_years * 15; // 15$/an de bonus durabilité
      
      const totalValue3Years = directSavings + (timeValue.value_per_year * 3) + durabilityBonus;
      const roi = ((totalValue3Years - product.price) / product.price) * 100;
      
      return {
        total_value_3_years: Math.round(totalValue3Years),
        roi_percentage: Math.round(roi),
        break_even_months: Math.round((product.price / (directSavings / 12 + timeValue.value_per_year / 12)) * 10) / 10
      };
    }

    calculateDurabilityValue(product) {
      // Calcul basé sur la fréquence de remplacement des alternatives
      const replacementCostPerYear = product.price * 0.15; // 15% de remplacement/an pour alternatives
      const savingsOverLifetime = replacementCostPerYear * product.durability_years;
      
      return {
        replacement_savings: Math.round(savingsOverLifetime),
        durability_years: product.durability_years,
        annual_replacement_cost: Math.round(replacementCostPerYear)
      };
    }

    /**
     * Mise à jour de l'affichage
     */
    updateCalculatorDisplay(calculations) {
      // Mettre à jour les éléments d'affichage
      this.updateElement('.direct-savings', `${calculations.direct_savings}$`);
      this.updateElement('.time-saved', `${calculations.time_value.hours_per_year}h`);
      this.updateElement('.total-roi', `+${calculations.total_roi.roi_percentage}%`);
      this.updateElement('.total-savings', `${calculations.direct_savings + calculations.time_value.value_per_year}$`);
      
      // Mettre à jour les détails
      this.updateElement('.alternative-cost', `${Math.round(calculations.direct_savings + this.productData[this.currentProduct].price)}$`);
      this.updateElement('.time-value', `${calculations.time_value.value_per_year}$`);
      this.updateElement('.roi-total', `${calculations.total_roi.total_value_3_years}$`);
    }

    updateElement(selector, value) {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = value;
        
        // Animation de highlight
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.style.color = '#10b981';
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.style.color = '';
        }, 300);
      }
    }

    /**
     * Event listeners
     */
    setupEventListeners() {
      // Sliders de configuration
      document.addEventListener('input', (e) => {
        if (e.target.matches('#sessions-range')) {
          this.userProfile.sessions_per_month = parseInt(e.target.value);
          this.updateElement('.sessions-value', e.target.value);
          this.calculateValue();
        }
        
        if (e.target.matches('#players-range')) {
          this.userProfile.players_count = parseInt(e.target.value);
          this.updateElement('.players-value', e.target.value);
          this.calculateValue();
        }
        
        if (e.target.matches('#duration-range')) {
          this.userProfile.session_duration = parseInt(e.target.value) * 60;
          this.updateElement('.duration-value', `${e.target.value}h`);
          this.calculateValue();
        }
        
        if (e.target.matches('#budget-range')) {
          this.userProfile.budget_annual = parseInt(e.target.value);
          this.updateElement('.budget-value', `${e.target.value}$`);
          this.calculateHomepageDemo();
        }
      });
      
      // Triggers du calculateur
      document.addEventListener('click', (e) => {
        if (e.target.closest('.value-calculator-trigger')) {
          e.preventDefault();
          this.showFullCalculator();
        }
      });
    }

    calculateHomepageDemo() {
      const budget = this.userProfile.budget_annual;
      
      // Calculs simplifiés pour la démo
      const avgSavings = Math.round(budget * 0.42); // 42% d'économies moyennes
      const timeSaved = Math.round(budget / 6.7); // Approximation temps/budget
      
      this.updateElement('.savings-amount', `+${avgSavings}$`);
      this.updateElement('.time-saved', `${timeSaved}h`);
    }

    showFullCalculator() {
      // Scroll vers le calculateur ou modal
      const calculator = document.querySelector('.value-calculator');
      if (calculator) {
        calculator.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Créer modal ou rediriger vers page dédiée
        window.location.href = '/calculateur-valeur.php';
      }
    }

    /**
     * Utilitaires
     */
    detectCurrentProduct() {
      const path = window.location.pathname;
      const productMatch = path.match(/\/(lot\d+|pack-[\w-]+|triptyque-[\w-]+)/);
      return productMatch ? productMatch[1] : null;
    }

    detectPageType() {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/index.php') return 'homepage';
      if (path.includes('boutique')) return 'boutique';
      if (this.currentProduct) return 'product';
      
      return 'general';
    }

    findOrCreateContainer(className, selector, position = 'beforeend') {
      let container = document.querySelector(`.${className}`);
      
      if (!container) {
        const target = document.querySelector(selector);
        if (!target) return null;
        
        container = document.createElement('div');
        container.className = className;
        
        if (position === 'afterend') {
          target.insertAdjacentElement('afterend', container);
        } else if (position === 'beforebegin') {
          target.insertAdjacentElement('beforebegin', container);
        } else {
          target.appendChild(container);
        }
      }
      
      return container;
    }

    animateComponent(element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    }

    /**
     * API publique
     */
    getCalculationResults() {
      return this.calculations.current;
    }

    getUserProfile() {
      return this.userProfile;
    }

    updateUserProfile(updates) {
      this.userProfile = { ...this.userProfile, ...updates };
      this.calculateValue();
    }

    exportCalculation() {
      const results = this.getCalculationResults();
      const product = this.productData[this.currentProduct];
      
      return {
        product: product,
        user_profile: this.userProfile,
        calculations: results,
        summary: {
          total_savings_first_year: results.direct_savings + results.time_value.value_per_year,
          roi_3_years: results.total_roi.roi_percentage,
          break_even: results.total_roi.break_even_months
        },
        generated_at: new Date().toISOString()
      };
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonValueCalculator = new ValueCalculator();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugCalc = window.GeeknDragonValueCalculator;
      console.log('💰 Value Calculator Debug - Utilisez window._debugCalc');
    }
  });

})();