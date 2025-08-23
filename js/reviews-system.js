/**
 * 📝 SYSTÈME DE REVIEWS ET TÉMOIGNAGES - GEEKNDRAGON
 * Interface utilisateur pour soumission et affichage des avis clients
 */

(function() {
  'use strict';

  class ReviewsSystem {
    constructor() {
      this.currentProduct = this.detectCurrentProduct();
      this.displayedReviews = [];
      this.reviewsStats = {};
      this.userInteractions = {
        helpful_votes: new Set(),
        unhelpful_votes: new Set(),
        submitted_reviews: new Set()
      };
      
      this.config = {
        maxReviewLength: 2000,
        minReviewLength: 10,
        autoLoadMore: true,
        animationDuration: 300,
        rateLimitMinutes: 60
      };
      
      this.init();
    }

    async init() {
      // Charger les reviews existantes
      await this.loadReviews();
      
      // Afficher les composants selon la page
      this.renderReviewComponents();
      
      // Setup des event listeners
      this.setupEventListeners();
      
      // Charger les interactions utilisateur
      this.loadUserInteractions();
      
      console.log('📝 Reviews System initialisé');
    }

    /**
     * Chargement des reviews depuis l'API
     */
    async loadReviews(filters = {}) {
      const defaultFilters = {
        product_id: this.currentProduct,
        limit: 10,
        offset: 0,
        sort_by: 'recent'
      };
      
      const requestFilters = { ...defaultFilters, ...filters };
      
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ filters: requestFilters })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (filters.offset === 0) {
            this.displayedReviews = data.reviews;
            this.reviewsStats = {
              total_count: data.total_count,
              average_rating: data.average_rating,
              rating_distribution: data.rating_distribution,
              pagination: data.pagination
            };
          } else {
            this.displayedReviews = [...this.displayedReviews, ...data.reviews];
            this.reviewsStats.pagination = data.pagination;
          }
          
          console.log(`📝 ${data.reviews.length} reviews chargées`);
          return data;
        } else {
          console.warn('Erreur chargement reviews:', response.status);
          return null;
        }
      } catch (error) {
        console.error('Erreur API reviews:', error);
        return null;
      }
    }

    /**
     * Rendu des composants selon la page
     */
    renderReviewComponents() {
      const pageType = this.detectPageType();
      
      switch (pageType) {
        case 'product':
          this.renderProductPageReviews();
          break;
        case 'homepage':
          this.renderHomepageTestimonials();
          break;
        case 'boutique':
          this.renderShopReviewsSummary();
          break;
        default:
          this.renderGenericReviews();
      }
    }

    /**
     * Reviews sur page produit
     */
    renderProductPageReviews() {
      const container = this.findOrCreateContainer('product-reviews', '.product-details');
      if (!container) return;
      
      container.innerHTML = `
        <section class="product-reviews bg-white rounded-xl shadow-lg p-8 mt-12">
          <!-- Header avec statistiques -->
          <div class="reviews-header mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-star text-yellow-400 mr-2"></i>
                Avis clients
              </h3>
              <button class="write-review-btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <i class="fas fa-pen mr-2"></i>
                Écrire un avis
              </button>
            </div>
            
            <div class="reviews-stats-container">
              ${this.renderReviewsStats()}
            </div>
          </div>

          <!-- Formulaire de soumission (masqué par défaut) -->
          <div class="review-form-container hidden mb-8">
            ${this.renderReviewForm()}
          </div>

          <!-- Filtres et tri -->
          <div class="reviews-controls mb-6">
            ${this.renderReviewControls()}
          </div>

          <!-- Liste des reviews -->
          <div class="reviews-list">
            ${this.renderReviewsList()}
          </div>

          <!-- Bouton charger plus -->
          <div class="load-more-container text-center mt-8">
            ${this.renderLoadMoreButton()}
          </div>
        </section>
      `;
      
      this.animateComponent(container);
    }

    /**
     * Témoignages sur homepage
     */
    renderHomepageTestimonials() {
      const container = this.findOrCreateContainer('homepage-testimonials', '.hero-section', 'afterend');
      if (!container) return;
      
      // Sélectionner les meilleures reviews pour homepage
      const featuredReviews = this.displayedReviews
        .filter(review => review.rating >= 4)
        .sort((a, b) => b.helpful_score - a.helpful_score)
        .slice(0, 3);
      
      container.innerHTML = `
        <section class="homepage-testimonials py-16 bg-gradient-to-r from-purple-50 to-blue-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-12">
              <h2 class="text-4xl font-bold text-gray-800 mb-4">
                <i class="fas fa-quote-left text-purple-600 mr-3"></i>
                Ce que disent nos joueurs
              </h2>
              <p class="text-xl text-gray-600">Plus de ${this.reviewsStats.total_count || 0} avis clients authentiques</p>
              
              <div class="flex justify-center items-center mt-6 space-x-4">
                <div class="flex items-center">
                  ${this.renderStarRating(this.reviewsStats.average_rating)}
                  <span class="ml-2 text-2xl font-bold text-gray-800">
                    ${(this.reviewsStats.average_rating || 0).toFixed(1)}/5
                  </span>
                </div>
                <span class="text-gray-400">|</span>
                <span class="text-gray-600">Note moyenne sur tous nos produits</span>
              </div>
            </div>
            
            <div class="testimonials-carousel">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${featuredReviews.map((review, index) => this.renderTestimonialCard(review, index)).join('')}
              </div>
            </div>
            
            <div class="text-center mt-12">
              <a href="/boutique.php" class="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Découvrir nos produits
                <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </section>
      `;
    }

    /**
     * Résumé reviews sur page boutique
     */
    renderShopReviewsSummary() {
      const container = this.findOrCreateContainer('shop-reviews-summary', '.products-grid', 'beforebegin');
      if (!container) return;
      
      container.innerHTML = `
        <div class="shop-reviews-summary bg-white border-2 border-purple-200 rounded-xl p-6 mb-8 shadow-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">${(this.reviewsStats.average_rating || 0).toFixed(1)}</div>
                <div class="flex justify-center mt-1">
                  ${this.renderStarRating(this.reviewsStats.average_rating)}
                </div>
                <div class="text-sm text-gray-600 mt-1">${this.reviewsStats.total_count || 0} avis</div>
              </div>
              
              <div class="border-l border-gray-200 pl-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                  <i class="fas fa-award text-yellow-500 mr-2"></i>
                  Qualité reconnue par nos clients
                </h3>
                <p class="text-gray-600">
                  ${Math.round((this.reviewsStats.average_rating || 0) / 5 * 100)}% de satisfaction • 
                  Fabrication québécoise certifiée FLIM 2025
                </p>
              </div>
            </div>
            
            <div class="text-center">
              <button class="write-review-btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                <i class="fas fa-pen mr-2"></i>
                Partager votre avis
              </button>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Rendu du formulaire de soumission
     */
    renderReviewForm() {
      return `
        <div class="review-form bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
          <h4 class="text-xl font-semibold text-gray-800 mb-6">
            <i class="fas fa-edit text-purple-600 mr-2"></i>
            Partagez votre expérience
          </h4>
          
          <form class="review-submission-form space-y-6">
            <input type="hidden" name="product_id" value="${this.currentProduct || ''}">
            
            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Votre note <span class="text-red-500">*</span>
              </label>
              <div class="star-rating-input flex items-center space-x-1">
                ${Array.from({length: 5}, (_, i) => `
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${i + 1}">
                    <i class="fas fa-star"></i>
                  </button>
                `).join('')}
                <span class="ml-4 text-sm text-gray-600 rating-text">Cliquez sur les étoiles</span>
              </div>
              <input type="hidden" name="rating" class="rating-input" required>
            </div>

            <!-- Nom -->
            <div>
              <label for="author_name" class="block text-sm font-medium text-gray-700 mb-2">
                Votre nom <span class="text-red-500">*</span>
              </label>
              <input type="text" id="author_name" name="author_name" required maxlength="100"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="Entrez votre nom ou pseudonyme">
            </div>

            <!-- Email (optionnel) -->
            <div>
              <label for="author_email" class="block text-sm font-medium text-gray-700 mb-2">
                Email (optionnel)
              </label>
              <input type="email" id="author_email" name="author_email" maxlength="200"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     placeholder="Pour être notifié de la validation">
              <p class="text-xs text-gray-500 mt-1">Ne sera pas affiché publiquement</p>
            </div>

            <!-- Contenu -->
            <div>
              <label for="review_content" class="block text-sm font-medium text-gray-700 mb-2">
                Votre avis <span class="text-red-500">*</span>
              </label>
              <textarea id="review_content" name="content" required 
                        minlength="${this.config.minReviewLength}" 
                        maxlength="${this.config.maxReviewLength}"
                        rows="5"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="Partagez votre expérience avec ce produit... Qu'est-ce qui vous a plu ? Comment l'utilisez-vous dans vos parties ?"></textarea>
              <div class="flex justify-between mt-2">
                <span class="text-xs text-gray-500">Minimum ${this.config.minReviewLength} caractères</span>
                <span class="text-xs text-gray-500 char-counter">0/${this.config.maxReviewLength}</span>
              </div>
            </div>

            <!-- Boutons -->
            <div class="flex items-center justify-between pt-4">
              <button type="button" class="cancel-review-btn text-gray-600 hover:text-gray-800 font-medium transition-colors">
                <i class="fas fa-times mr-1"></i>
                Annuler
              </button>
              
              <button type="submit" class="submit-review-btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-paper-plane mr-2"></i>
                Envoyer mon avis
              </button>
            </div>
          </form>
        </div>
      `;
    }

    /**
     * Rendu des statistiques de reviews
     */
    renderReviewsStats() {
      if (!this.reviewsStats.rating_distribution) {
        return '<div class="text-center text-gray-500">Aucun avis pour le moment</div>';
      }
      
      const total = this.reviewsStats.total_count;
      
      return `
        <div class="reviews-stats grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Note moyenne -->
          <div class="text-center">
            <div class="text-5xl font-bold text-purple-600 mb-2">
              ${(this.reviewsStats.average_rating || 0).toFixed(1)}
            </div>
            <div class="flex justify-center mb-2">
              ${this.renderStarRating(this.reviewsStats.average_rating)}
            </div>
            <p class="text-gray-600">Basé sur ${total} avis</p>
          </div>
          
          <!-- Distribution des notes -->
          <div class="rating-distribution space-y-2">
            ${Array.from({length: 5}, (_, i) => {
              const stars = 5 - i;
              const count = this.reviewsStats.rating_distribution[stars] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return `
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium w-16">${stars} étoile${stars > 1 ? 's' : ''}</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                         style="width: ${percentage}%"></div>
                  </div>
                  <span class="text-sm text-gray-600 w-12">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    /**
     * Contrôles de filtrage et tri
     */
    renderReviewControls() {
      return `
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Trier par:</span>
            <select class="sort-select border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500">
              <option value="recent">Plus récents</option>
              <option value="rating_high">Note élevée</option>
              <option value="rating_low">Note faible</option>
              <option value="helpful">Plus utiles</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Filtrer par note:</span>
            <div class="flex space-x-1">
              <button class="rating-filter-btn px-3 py-1 rounded text-sm border transition-colors hover:bg-purple-50" data-rating="all">
                Tous
              </button>
              ${Array.from({length: 5}, (_, i) => `
                <button class="rating-filter-btn px-3 py-1 rounded text-sm border transition-colors hover:bg-purple-50" data-rating="${5-i}">
                  ${5-i}★
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Liste des reviews
     */
    renderReviewsList() {
      if (this.displayedReviews.length === 0) {
        return `
          <div class="empty-reviews text-center py-12">
            <i class="fas fa-comment-slash text-6xl text-gray-300 mb-4"></i>
            <h4 class="text-xl font-semibold text-gray-600 mb-2">Aucun avis pour le moment</h4>
            <p class="text-gray-500 mb-6">Soyez le premier à partager votre expérience !</p>
            <button class="write-review-btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              <i class="fas fa-pen mr-2"></i>
              Écrire le premier avis
            </button>
          </div>
        `;
      }
      
      return `
        <div class="reviews-container space-y-6">
          ${this.displayedReviews.map((review, index) => this.renderReviewCard(review, index)).join('')}
        </div>
      `;
    }

    /**
     * Carte de review individuelle
     */
    renderReviewCard(review, index) {
      return `
        <div class="review-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300" 
             data-review-id="${review.review_id}"
             style="animation-delay: ${index * 100}ms">
          
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                ${review.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-800">
                  ${review.display_name}
                  ${review.is_verified ? '<i class="fas fa-check-circle text-green-500 ml-1" title="Acheteur vérifié"></i>' : ''}
                </p>
                <p class="text-sm text-gray-500">${review.time_ago}</p>
              </div>
            </div>
            
            <div class="text-right">
              <div class="flex items-center mb-1">
                ${this.renderStarRating(review.rating)}
              </div>
              <span class="text-sm font-medium text-gray-600">${review.rating}/5</span>
            </div>
          </div>
          
          <!-- Contenu -->
          <div class="mb-4">
            <p class="text-gray-800 leading-relaxed">
              ${this.formatReviewContent(review.content)}
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center space-x-4">
              <button class="helpful-btn flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors ${this.userInteractions.helpful_votes.has(review.review_id) ? 'text-green-600' : ''}" 
                      data-review-id="${review.review_id}" 
                      data-action="helpful">
                <i class="fas fa-thumbs-up"></i>
                <span>Utile</span>
                <span class="helpful-count">(${review.helpful_votes || 0})</span>
              </button>
              
              <button class="unhelpful-btn flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors ${this.userInteractions.unhelpful_votes.has(review.review_id) ? 'text-red-600' : ''}" 
                      data-review-id="${review.review_id}" 
                      data-action="unhelpful">
                <i class="fas fa-thumbs-down"></i>
                <span>Pas utile</span>
                <span class="unhelpful-count">(${review.unhelpful_votes || 0})</span>
              </button>
            </div>
            
            <button class="flag-btn text-gray-400 hover:text-red-500 text-sm transition-colors" 
                    data-review-id="${review.review_id}">
              <i class="fas fa-flag mr-1"></i>
              Signaler
            </button>
          </div>
        </div>
      `;
    }

    /**
     * Carte témoignage pour homepage
     */
    renderTestimonialCard(review, index) {
      return `
        <div class="testimonial-card bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-2"
             style="animation-delay: ${index * 200}ms">
          
          <div class="flex items-center mb-4">
            ${this.renderStarRating(review.rating)}
            <span class="ml-2 font-bold text-purple-600">${review.rating}/5</span>
          </div>
          
          <blockquote class="text-gray-700 text-lg leading-relaxed mb-6 italic">
            "${this.truncateText(review.content, 150)}"
          </blockquote>
          
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg mr-4">
              ${review.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-semibold text-gray-800">
                ${review.display_name}
                ${review.is_verified ? '<i class="fas fa-check-circle text-green-500 ml-1" title="Acheteur vérifié"></i>' : ''}
              </p>
              <p class="text-sm text-gray-500">${review.time_ago}</p>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Bouton charger plus
     */
    renderLoadMoreButton() {
      if (!this.reviewsStats.pagination || !this.reviewsStats.pagination.has_next) {
        return '';
      }
      
      return `
        <button class="load-more-btn bg-purple-100 hover:bg-purple-200 text-purple-700 px-8 py-3 rounded-lg font-semibold transition-colors">
          <i class="fas fa-chevron-down mr-2"></i>
          Charger plus d'avis
        </button>
      `;
    }

    /**
     * Setup des event listeners
     */
    setupEventListeners() {
      // Bouton écrire un avis
      document.addEventListener('click', (e) => {
        if (e.target.closest('.write-review-btn')) {
          e.preventDefault();
          this.toggleReviewForm();
        }
      });
      
      // Formulaire de soumission
      document.addEventListener('submit', (e) => {
        if (e.target.matches('.review-submission-form')) {
          e.preventDefault();
          this.submitReview(e.target);
        }
      });
      
      // Rating input
      document.addEventListener('click', (e) => {
        if (e.target.closest('.star-btn')) {
          e.preventDefault();
          this.handleStarRating(e.target.closest('.star-btn'));
        }
      });
      
      // Caractères restants
      document.addEventListener('input', (e) => {
        if (e.target.matches('#review_content')) {
          this.updateCharacterCounter(e.target);
        }
      });
      
      // Actions sur reviews (helpful, flag, etc.)
      document.addEventListener('click', (e) => {
        if (e.target.closest('.helpful-btn, .unhelpful-btn')) {
          e.preventDefault();
          this.handleReviewVote(e.target.closest('.helpful-btn, .unhelpful-btn'));
        }
        
        if (e.target.closest('.flag-btn')) {
          e.preventDefault();
          this.handleReviewFlag(e.target.closest('.flag-btn'));
        }
      });
      
      // Tri et filtres
      document.addEventListener('change', (e) => {
        if (e.target.matches('.sort-select')) {
          this.handleSort(e.target.value);
        }
      });
      
      document.addEventListener('click', (e) => {
        if (e.target.matches('.rating-filter-btn')) {
          e.preventDefault();
          this.handleRatingFilter(e.target);
        }
      });
      
      // Charger plus
      document.addEventListener('click', (e) => {
        if (e.target.closest('.load-more-btn')) {
          e.preventDefault();
          this.loadMoreReviews();
        }
      });
      
      // Annuler review
      document.addEventListener('click', (e) => {
        if (e.target.matches('.cancel-review-btn')) {
          e.preventDefault();
          this.hideReviewForm();
        }
      });
    }

    /**
     * Toggle formulaire de review
     */
    toggleReviewForm() {
      const container = document.querySelector('.review-form-container');
      if (!container) return;
      
      if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        this.animateComponent(container);
        
        // Scroll vers le formulaire
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus sur le premier champ
        setTimeout(() => {
          const firstInput = container.querySelector('#author_name');
          if (firstInput) firstInput.focus();
        }, 300);
      } else {
        this.hideReviewForm();
      }
    }

    hideReviewForm() {
      const container = document.querySelector('.review-form-container');
      if (container) {
        container.classList.add('hidden');
        
        // Reset du formulaire
        const form = container.querySelector('.review-submission-form');
        if (form) {
          form.reset();
          this.resetStarRating();
          this.updateCharacterCounter(container.querySelector('#review_content'));
        }
      }
    }

    /**
     * Gestion du rating par étoiles
     */
    handleStarRating(starBtn) {
      const rating = parseInt(starBtn.dataset.rating);
      const container = starBtn.closest('.star-rating-input');
      const hiddenInput = container.parentElement.querySelector('.rating-input');
      const ratingText = container.querySelector('.rating-text');
      
      // Mettre à jour les étoiles visuelles
      const stars = container.querySelectorAll('.star-btn');
      stars.forEach((star, index) => {
        const starIcon = star.querySelector('i');
        if (index < rating) {
          starIcon.className = 'fas fa-star text-yellow-400';
        } else {
          starIcon.className = 'fas fa-star text-gray-300';
        }
      });
      
      // Mettre à jour la valeur
      hiddenInput.value = rating;
      
      // Mettre à jour le texte
      const ratingTexts = ['', 'Décevant', 'Passable', 'Correct', 'Très bien', 'Excellent'];
      ratingText.textContent = ratingTexts[rating];
    }

    resetStarRating() {
      const container = document.querySelector('.star-rating-input');
      if (!container) return;
      
      const stars = container.querySelectorAll('.star-btn i');
      stars.forEach(star => {
        star.className = 'fas fa-star text-gray-300';
      });
      
      const hiddenInput = container.parentElement.querySelector('.rating-input');
      const ratingText = container.querySelector('.rating-text');
      
      if (hiddenInput) hiddenInput.value = '';
      if (ratingText) ratingText.textContent = 'Cliquez sur les étoiles';
    }

    /**
     * Compteur de caractères
     */
    updateCharacterCounter(textarea) {
      if (!textarea) return;
      
      const counter = textarea.parentElement.querySelector('.char-counter');
      if (!counter) return;
      
      const current = textarea.value.length;
      const max = this.config.maxReviewLength;
      
      counter.textContent = `${current}/${max}`;
      
      // Changer la couleur selon la proximité de la limite
      if (current > max * 0.9) {
        counter.className = 'text-xs text-red-500 char-counter';
      } else if (current > max * 0.75) {
        counter.className = 'text-xs text-yellow-500 char-counter';
      } else {
        counter.className = 'text-xs text-gray-500 char-counter';
      }
    }

    /**
     * Soumission de review
     */
    async submitReview(form) {
      const submitBtn = form.querySelector('.submit-review-btn');
      const originalText = submitBtn.innerHTML;
      
      // Vérification rate limiting côté client
      if (this.isRateLimited()) {
        this.showMessage('Vous devez attendre avant de soumettre un nouvel avis.', 'warning');
        return;
      }
      
      // Désactiver le bouton
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';
      
      try {
        const formData = new FormData(form);
        const reviewData = Object.fromEntries(formData.entries());
        
        const response = await fetch('/api/reviews/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(reviewData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showMessage(result.message || 'Merci pour votre avis ! Il sera publié après validation.', 'success');
          
          // Cacher le formulaire et réinitialiser
          this.hideReviewForm();
          
          // Enregistrer la soumission pour rate limiting
          this.recordReviewSubmission();
          
          // Analytics
          if (window.GeeknDragonAnalytics) {
            window.GeeknDragonAnalytics.trackEvent('review_submitted', {
              product_id: reviewData.product_id,
              rating: reviewData.rating,
              status: result.status
            });
          }
          
        } else {
          this.showMessage(result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        }
        
      } catch (error) {
        console.error('Erreur soumission review:', error);
        this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
      } finally {
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }

    /**
     * Vote utile/pas utile
     */
    async handleReviewVote(btn) {
      const reviewId = btn.dataset.reviewId;
      const action = btn.dataset.action;
      
      // Vérifier si déjà voté
      const voteSet = action === 'helpful' ? this.userInteractions.helpful_votes : this.userInteractions.unhelpful_votes;
      const oppositeSet = action === 'helpful' ? this.userInteractions.unhelpful_votes : this.userInteractions.helpful_votes;
      
      if (voteSet.has(reviewId)) {
        this.showMessage('Vous avez déjà voté pour cet avis.', 'info');
        return;
      }
      
      try {
        const response = await fetch('/api/reviews/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            review_id: reviewId,
            action: action
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Mettre à jour l'interface
          voteSet.add(reviewId);
          oppositeSet.delete(reviewId); // Retirer vote opposé si existant
          
          btn.classList.add(action === 'helpful' ? 'text-green-600' : 'text-red-600');
          
          const counter = btn.querySelector(`.${action}-count`);
          if (counter) {
            const currentCount = parseInt(counter.textContent.replace(/[()]/g, ''));
            counter.textContent = `(${currentCount + 1})`;
          }
          
          // Sauvegarder les interactions
          this.saveUserInteractions();
          
          // Analytics
          if (window.GeeknDragonAnalytics) {
            window.GeeknDragonAnalytics.trackEvent('review_voted', {
              review_id: reviewId,
              vote_type: action
            });
          }
        }
        
      } catch (error) {
        console.error('Erreur vote review:', error);
        this.showMessage('Erreur lors du vote.', 'error');
      }
    }

    /**
     * Signalement de review
     */
    async handleReviewFlag(btn) {
      const reviewId = btn.dataset.reviewId;
      
      // Demander confirmation avec raison
      const reason = prompt('Pourquoi signalez-vous cet avis ?\n\n1. Contenu inapproprié\n2. Faux avis\n3. Spam\n4. Autre\n\nEntrez le numéro ou décrivez la raison:');
      
      if (!reason || reason.trim() === '') {
        return;
      }
      
      try {
        const response = await fetch('/api/reviews/flag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            review_id: reviewId,
            reason: reason.trim()
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.showMessage('Signalement enregistré. Merci de nous aider à maintenir la qualité.', 'success');
          
          // Désactiver le bouton de signalement
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-check mr-1"></i>Signalé';
          btn.classList.add('text-gray-400');
          
          // Analytics
          if (window.GeeknDragonAnalytics) {
            window.GeeknDragonAnalytics.trackEvent('review_flagged', {
              review_id: reviewId,
              reason: reason
            });
          }
        } else {
          this.showMessage(result.error || 'Erreur lors du signalement.', 'error');
        }
        
      } catch (error) {
        console.error('Erreur signalement review:', error);
        this.showMessage('Erreur de connexion.', 'error');
      }
    }

    /**
     * Tri des reviews
     */
    async handleSort(sortBy) {
      const currentOffset = this.displayedReviews.length;
      
      // Recharger avec nouveau tri
      await this.loadReviews({
        offset: 0,
        sort_by: sortBy
      });
      
      // Réafficher
      const container = document.querySelector('.reviews-list');
      if (container) {
        container.innerHTML = this.renderReviewsList();
        this.animateComponent(container);
      }
      
      // Mettre à jour le bouton load more
      const loadMoreContainer = document.querySelector('.load-more-container');
      if (loadMoreContainer) {
        loadMoreContainer.innerHTML = this.renderLoadMoreButton();
      }
    }

    /**
     * Filtrage par note
     */
    handleRatingFilter(btn) {
      const rating = btn.dataset.rating;
      
      // Mettre à jour l'apparence des boutons
      document.querySelectorAll('.rating-filter-btn').forEach(b => {
        b.classList.remove('bg-purple-100', 'text-purple-700', 'border-purple-300');
        b.classList.add('bg-white', 'text-gray-600', 'border-gray-300');
      });
      
      btn.classList.remove('bg-white', 'text-gray-600', 'border-gray-300');
      btn.classList.add('bg-purple-100', 'text-purple-700', 'border-purple-300');
      
      // Filtrer les reviews affichées
      const reviewCards = document.querySelectorAll('.review-card');
      
      reviewCards.forEach(card => {
        const reviewId = card.dataset.reviewId;
        const review = this.displayedReviews.find(r => r.review_id === reviewId);
        
        if (rating === 'all' || (review && review.rating == rating)) {
          card.style.display = 'block';
          this.animateComponent(card);
        } else {
          card.style.display = 'none';
        }
      });
    }

    /**
     * Charger plus de reviews
     */
    async loadMoreReviews() {
      const currentOffset = this.displayedReviews.length;
      
      const data = await this.loadReviews({
        offset: currentOffset
      });
      
      if (data && data.reviews.length > 0) {
        // Ajouter à la liste existante
        const reviewsContainer = document.querySelector('.reviews-container');
        if (reviewsContainer) {
          const newReviewsHTML = data.reviews.map((review, index) => 
            this.renderReviewCard(review, currentOffset + index)
          ).join('');
          
          reviewsContainer.insertAdjacentHTML('beforeend', newReviewsHTML);
        }
        
        // Mettre à jour le bouton load more
        const loadMoreContainer = document.querySelector('.load-more-container');
        if (loadMoreContainer) {
          loadMoreContainer.innerHTML = this.renderLoadMoreButton();
        }
      }
    }

    /**
     * Utilitaires
     */
    detectCurrentProduct() {
      // Détecter le produit actuel depuis l'URL ou attributs data
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

    renderStarRating(rating, maxStars = 5) {
      if (!rating) rating = 0;
      
      return Array.from({length: maxStars}, (_, i) => {
        const starClass = i < Math.floor(rating) ? 'fas fa-star text-yellow-400' : 
                         i < Math.ceil(rating) ? 'fas fa-star-half-alt text-yellow-400' : 
                         'fas fa-star text-gray-300';
        return `<i class="${starClass}"></i>`;
      }).join('');
    }

    formatReviewContent(content) {
      // Formater le contenu (liens, mentions, etc.)
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
    }

    animateComponent(element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 50);
    }

    showMessage(message, type = 'info') {
      // Créer notification toast
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg text-white transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
      }`;
      
      toast.innerHTML = `
        <div class="flex items-center space-x-2">
          <i class="fas ${
            type === 'success' ? 'fa-check-circle' : 
            type === 'error' ? 'fa-exclamation-circle' : 
            type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
          }"></i>
          <span>${message}</span>
          <button class="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(toast);
      
      // Animation d'entrée
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 100);
      
      // Fermeture
      const closeBtn = toast.querySelector('button');
      const closeToast = () => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      };
      
      closeBtn.addEventListener('click', closeToast);
      setTimeout(closeToast, 5000); // Auto-close après 5s
    }

    // Rate limiting
    isRateLimited() {
      const lastSubmission = localStorage.getItem('gd_last_review_submission');
      if (!lastSubmission) return false;
      
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
      const rateLimitMs = this.config.rateLimitMinutes * 60 * 1000;
      
      return timeSinceLastSubmission < rateLimitMs;
    }

    recordReviewSubmission() {
      localStorage.setItem('gd_last_review_submission', Date.now().toString());
    }

    // Interactions utilisateur
    loadUserInteractions() {
      const stored = localStorage.getItem('gd_review_interactions');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.userInteractions.helpful_votes = new Set(data.helpful_votes || []);
          this.userInteractions.unhelpful_votes = new Set(data.unhelpful_votes || []);
          this.userInteractions.submitted_reviews = new Set(data.submitted_reviews || []);
        } catch (e) {
          console.warn('Erreur chargement interactions:', e);
        }
      }
    }

    saveUserInteractions() {
      const data = {
        helpful_votes: Array.from(this.userInteractions.helpful_votes),
        unhelpful_votes: Array.from(this.userInteractions.unhelpful_votes),
        submitted_reviews: Array.from(this.userInteractions.submitted_reviews)
      };
      
      localStorage.setItem('gd_review_interactions', JSON.stringify(data));
    }

    // API publique
    getReviewsStats() {
      return {
        total_reviews: this.displayedReviews.length,
        average_rating: this.reviewsStats.average_rating,
        current_product: this.currentProduct,
        user_interactions: {
          helpful_votes: this.userInteractions.helpful_votes.size,
          unhelpful_votes: this.userInteractions.unhelpful_votes.size,
          submitted_reviews: this.userInteractions.submitted_reviews.size
        }
      };
    }

    refreshReviews() {
      return this.loadReviews({ offset: 0 });
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonReviews = new ReviewsSystem();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugReviews = window.GeeknDragonReviews;
      console.log('📝 Reviews Debug - Utilisez window._debugReviews');
    }
  });

})();