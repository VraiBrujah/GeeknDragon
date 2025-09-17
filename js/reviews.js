/**
 * Système de gestion des avis produits
 * Gère la soumission, l'affichage et les statistiques des avis
 */

class ReviewsManager {
    constructor() {
        this.apiBaseUrl = '/api/reviews-handler.php';
        this.currentProductId = null;
        this.init();
    }

    /**
     * Initialisation du système d'avis
     */
    init() {
        // Récupérer l'ID du produit depuis la page
        this.currentProductId = this.extractProductId();
        
        if (this.currentProductId) {
            this.loadReviewStats();
            this.loadReviews();
            this.setupReviewForm();
            this.setupStarRating();
        }
    }

    /**
     * Extrait l'ID du produit depuis l'URL ou les attributs data
     */
    extractProductId() {
        // Essayer de récupérer depuis les données Snipcart
        const snipcartBtn = document.querySelector('.snipcart-add-item');
        if (snipcartBtn) {
            return snipcartBtn.getAttribute('data-item-id');
        }
        
        // Fallback : extraire depuis l'URL
        const path = window.location.pathname;
        const match = path.match(/produit-([^\.]+)/);
        return match ? match[1] : null;
    }

    /**
     * Configure le système de notation par étoiles
     */
    setupStarRating() {
        const starInputs = document.querySelectorAll('.star-rating input[type="radio"]');
        const starLabels = document.querySelectorAll('.star-rating label');
        
        starLabels.forEach((label, index) => {
            label.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
            
            label.addEventListener('click', () => {
                this.selectStars(index + 1);
            });
        });
        
        // Restaurer l'état au départ de la souris
        document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
            const checkedValue = document.querySelector('.star-rating input:checked')?.value;
            this.highlightStars(checkedValue || 0);
        });
    }

    /**
     * Met en surbrillance les étoiles
     */
    highlightStars(rating) {
        const labels = document.querySelectorAll('.star-rating label');
        labels.forEach((label, index) => {
            if (index < rating) {
                label.style.color = 'var(--secondary-color)';
            } else {
                label.style.color = 'var(--border-color)';
            }
        });
    }

    /**
     * Sélectionne une note
     */
    selectStars(rating) {
        const input = document.querySelector(`.star-rating input[value="${rating}"]`);
        if (input) {
            input.checked = true;
        }
        this.highlightStars(rating);
    }

    /**
     * Configure le formulaire d'avis
     */
    setupReviewForm() {
        const form = document.getElementById('reviewForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });
    }

    /**
     * Soumet un nouvel avis
     */
    async submitReview() {
        const form = document.getElementById('reviewForm');
        const submitBtn = form.querySelector('.btn-submit-review');
        const messageDiv = document.getElementById('reviewMessage');
        
        // Désactiver le bouton pendant l'envoi
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        
        try {
            // Collecter les données du formulaire
            const formData = new FormData(form);
            const reviewData = {
                product_id: this.currentProductId,
                name: formData.get('name'),
                email: formData.get('email'),
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment')
            };

            // Validation côté client
            const errors = this.validateReviewData(reviewData);
            if (errors.length > 0) {
                this.showMessage(errors.join('<br>'), 'error');
                return;
            }

            // Envoyer à l'API
            const response = await fetch(`${this.apiBaseUrl}?action=submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                form.reset();
                this.highlightStars(0);
                
                // Masquer le formulaire et afficher un message de remerciement
                setTimeout(() => {
                    form.style.display = 'none';
                    this.showThankYouMessage();
                }, 2000);
                
            } else {
                this.showMessage(result.errors?.join('<br>') || result.message, 'error');
            }

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'avis:', error);
            this.showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = 'Soumettre mon avis';
        }
    }

    /**
     * Valide les données d'un avis côté client
     */
    validateReviewData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
            errors.push('Adresse email invalide');
        }
        
        if (!data.rating || data.rating < 1 || data.rating > 5) {
            errors.push('Veuillez sélectionner une note');
        }
        
        if (!data.comment || data.comment.trim().length < 10) {
            errors.push('Le commentaire doit contenir au moins 10 caractères');
        }
        
        return errors;
    }

    /**
     * Affiche un message à l'utilisateur
     */
    showMessage(message, type = 'info') {
        let messageDiv = document.getElementById('reviewMessage');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'reviewMessage';
            const form = document.getElementById('reviewForm');
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
        }
        
        messageDiv.className = type === 'success' ? 'review-success' : 
                              type === 'error' ? 'review-error' : 'review-info';
        messageDiv.innerHTML = message;
        messageDiv.style.display = 'block';
        
        // Faire défiler vers le message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Affiche un message de remerciement
     */
    showThankYouMessage() {
        const container = document.querySelector('.review-form').parentNode;
        const thankYouDiv = document.createElement('div');
        thankYouDiv.className = 'review-success';
        thankYouDiv.innerHTML = `
            <h4>🙏 Merci pour votre avis !</h4>
            <p>Votre retour est précieux pour nous et pour les autres aventuriers. 
            Il sera publié après validation par notre équipe.</p>
        `;
        container.appendChild(thankYouDiv);
    }

    /**
     * Charge les statistiques des avis
     */
    async loadReviewStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=stats&product_id=${this.currentProductId}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateReviewStats(result.stats);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    /**
     * Met à jour l'affichage des statistiques
     */
    updateReviewStats(stats) {
        // Mettre à jour la note moyenne dans le header produit
        const ratingElement = document.querySelector('.product-rating .rating-text');
        if (ratingElement) {
            if (stats.total > 0) {
                ratingElement.textContent = `(${stats.average}/5 - ${stats.total} avis)`;
            } else {
                ratingElement.textContent = '(0/5 - 0 avis)';
            }
        }

        // Mettre à jour les étoiles visuelles dans le header produit
        const starsElement = document.querySelector('.product-rating .stars');
        if (starsElement && stats.total > 0) {
            const fullStars = Math.floor(stats.average);
            const hasHalfStar = stats.average % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            
            let starsHtml = '★'.repeat(fullStars);
            if (hasHalfStar) starsHtml += '☆'; // Ou utiliser un caractère demi-étoile si disponible
            starsHtml += '☆'.repeat(emptyStars);
            
            starsElement.textContent = starsHtml;
        }
        
        // Mettre à jour le score dans la section avis
        const ratingScore = document.querySelector('.rating-score');
        if (ratingScore) {
            ratingScore.textContent = stats.total > 0 ? stats.average.toFixed(1) : '0.0';
        }
        
        // Mettre à jour le compteur dans l'onglet
        const reviewsTab = document.querySelector('.tab-btn[onclick*="reviews"]');
        if (reviewsTab) {
            reviewsTab.textContent = `Avis (${stats.total})`;
        }
        
        // Mettre à jour les barres de progression
        this.updateRatingBars(stats.distribution, stats.total);
    }

    /**
     * Met à jour les barres de distribution des notes
     */
    updateRatingBars(distribution, total) {
        for (let rating = 1; rating <= 5; rating++) {
            const count = distribution[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            const barElement = document.querySelector(`.rating-bar[data-rating="${rating}"] .fill`);
            const countElement = document.querySelector(`.rating-bar[data-rating="${rating}"] .count`);
            
            if (barElement) {
                barElement.style.width = `${percentage}%`;
            }
            if (countElement) {
                countElement.textContent = count;
            }
        }
    }

    /**
     * Charge et affiche les avis approuvés
     */
    async loadReviews() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=list&product_id=${this.currentProductId}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayReviews(result.reviews);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des avis:', error);
        }
    }

    /**
     * Affiche la liste des avis
     */
    displayReviews(reviews) {
        const container = document.querySelector('.reviews-list');
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = '<p class="no-reviews">Aucun avis pour le moment. Soyez le premier à laisser votre avis !</p>';
            return;
        }
        
        const reviewsHTML = reviews.map(review => this.createReviewHTML(review)).join('');
        container.innerHTML = reviewsHTML;
    }

    /**
     * Crée le HTML pour un avis
     */
    createReviewHTML(review) {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date = new Date(review.approved_at || review.submitted_at).toLocaleDateString('fr-FR');
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <strong>${this.escapeHtml(review.name)}</strong>
                        ${review.verified_purchase ? '<span class="reviewer-title">✓ Achat vérifié</span>' : ''}
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <div class="review-text">${this.escapeHtml(review.comment)}</div>
                <div class="review-meta">
                    <span>Publié le ${date}</span>
                </div>
            </div>
        `;
    }

    /**
     * Échappe les caractères HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser le système d'avis au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    new ReviewsManager();
});