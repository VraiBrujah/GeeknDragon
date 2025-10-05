/**
 * Chargeur asynchrone pour boutique - Performance optimale
 * Charge les produits en arrière-plan sans bloquer l'affichage hero
 */

class BoutiqueAsyncLoader {
    constructor() {
        this.apiEndpoint = '/api/products-async.php';
        this.loadedSections = new Set();
        this.loading = false;

        // Configuration
        this.retryAttempts = 3;
        this.retryDelay = 1000;

        this.init();
    }

    init() {
        // Démarrer le chargement dès que possible
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startLoading());
        } else {
            this.startLoading();
        }
    }

    async startLoading() {
        if (this.loading) return;
        this.loading = true;

        // Production: log supprimé

        try {
            // Obtenir la langue actuelle
            const lang = document.documentElement.lang || 'fr';

            // Lancer le chargement de toutes les catégories
            const response = await this.fetchWithRetry(`${this.apiEndpoint}?category=all&lang=${lang}`);

            if (response.error) {
                throw new Error(response.error);
            }

            // Injecter le contenu dans les sections (avec IDs français corrects)
            this.injectProducts('pieces', response.pieces, response.counts.pieces);
            this.injectProducts('cartes', response.cards, response.counts.cards);
            this.injectProducts('triptyques', response.triptychs, response.counts.triptychs);

            // Initialiser les fonctionnalités après injection
            this.initializeFeatures();

            // Production: log succès supprimé
        } catch (error) {
            // Erreur chargement silencieuse en production
            this.showErrorState();
        } finally {
            this.loading = false;
        }
    }

    async fetchWithRetry(url, attempt = 1) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt < this.retryAttempts) {
                // Production: log retry supprimé
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }

    injectProducts(category, html, count) {
        const container = document.querySelector(`#${category} .shop-grid`);

        if (!container) {
            // Production: warning container supprimé
            return;
        }

        // Injecter le HTML directement
        container.innerHTML = html;

        // Animation d'apparition simple
        this.animateProductsIn(container);

        // Marquer comme chargé
        this.loadedSections.add(category);

        // Production: log injection supprimé
    }

    animateProductsIn(container) {
        const products = container.querySelectorAll('.product-card');

        products.forEach((product, index) => {
            // Animation échelonnée
            product.style.opacity = '0';
            product.style.transform = 'translateY(20px)';

            setTimeout(() => {
                product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, index * 50); // Délai échelonné de 50ms
        });
    }

    initializeFeatures() {
        // Réinitialiser les fonctionnalités qui dépendent du DOM

        // 1. Sélecteurs de quantité
        this.initQuantitySelectors();

        // 2. Sélecteurs de métal/multiplicateur
        this.initCustomSelectors();

        // 3. Boutons d'ajout au panier (si Snipcart est chargé)
        this.initSnipcartButtons();

        // 4. Stock asynchrone
        this.initAsyncStock();

        // 5. Traductions
        this.initTranslations();

        // 6. Scroll horizontal avec molette
        this.initHorizontalScroll();
    }

    initHorizontalScroll() {
        document.querySelectorAll('.shop-grid').forEach((grid) => {
            grid.scrollLeft = 0;

            // Détection du type d'appareil
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            if (isTouchDevice) {
                // Mobile/Tablette : scroll natif tactile (horizontal/vertical automatique selon le geste)
                // Pas besoin d'intervention JavaScript, le CSS overflow gère tout
                return;
            }

            // Desktop uniquement : scroll horizontal avec molette après délai
            let scrollEnabled = false;
            let hoverTimeout = null;

            // Activer le scroll horizontal après 1 seconde de survol (PC seulement)
            grid.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => {
                    scrollEnabled = true;
                }, 1000);
            });

            // Désactiver immédiatement quand on quitte la zone
            grid.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                scrollEnabled = false;
            });

            grid.addEventListener('wheel', (e) => {
                if (scrollEnabled && Math.abs(e.deltaY) > 0) {
                    e.preventDefault();

                    // Scroll direct sans animation pour éviter les saccades
                    grid.scrollBy({
                        left: e.deltaY,
                        behavior: 'auto', // Pas de smooth, c'est plus fluide
                    });
                }
            }, { passive: false });
        });
    }

    initQuantitySelectors() {
        const selectors = document.querySelectorAll('.quantity-selector');
        selectors.forEach((selector) => {
            const minusBtn = selector.querySelector('.minus');
            const plusBtn = selector.querySelector('.plus');
            const valueSpan = selector.querySelector('.qty-value');

            if (minusBtn && plusBtn && valueSpan) {
                // Retirer les anciens event listeners pour éviter les doublons
                minusBtn.replaceWith(minusBtn.cloneNode(true));
                plusBtn.replaceWith(plusBtn.cloneNode(true));

                // Ajouter les nouveaux listeners
                const newMinusBtn = selector.querySelector('.minus');
                const newPlusBtn = selector.querySelector('.plus');

                newMinusBtn.addEventListener('click', () => {
                    const value = parseInt(valueSpan.textContent) || 1;
                    if (value > 1) {
                        valueSpan.textContent = value - 1;
                    }
                });

                newPlusBtn.addEventListener('click', () => {
                    const value = parseInt(valueSpan.textContent) || 1;
                    if (value < 999) {
                        valueSpan.textContent = value + 1;
                    }
                });
            }
        });
    }

    initCustomSelectors() {
        // Synchronisation exacte comme dans product.php
        this.syncSelectsWithSnipcart();
    }

    syncSelectsWithSnipcart() {
        // Fonction pour synchroniser un select spécifique (copie exacte de app.js)
        const syncSelect = (select) => {
            const targetId = select.dataset.target;
            const { customIndex } = select.dataset;
            const snipcartBtn = document.querySelector(`.snipcart-add-item[data-item-id="${targetId}"]`);

            if (snipcartBtn && customIndex) {
                snipcartBtn.setAttribute(`data-item-custom${customIndex}-value`, select.value);
                // Production: log sync supprimé
            }
        };

        // Synchroniser au changement et initialiser avec valeurs par défaut
        document.querySelectorAll('select[data-target][data-custom-index]').forEach((select) => {
            select.addEventListener('change', () => syncSelect(select));
            // Synchroniser immédiatement avec la valeur par défaut
            syncSelect(select);
        });

        // Note: Snipcart utilise automatiquement les valeurs des attributs data-item-custom*-value
        // La synchronisation se fait déjà au changement des selects

        // Production: log init sync supprimé
    }

    // Méthode obsolète supprimée - La synchronisation se fait directement via syncSelectsWithSnipcart()

    initSnipcartButtons() {
        // Laisser Snipcart gérer les boutons directement selon la documentation officielle
        // Snipcart détecte automatiquement la classe .snipcart-add-item et gère les variations
        const snipcartButtons = document.querySelectorAll('.snipcart-add-item');

        // Ajouter le son sur tous les boutons Snipcart
        snipcartButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.playSound('media/sounds/coin-drop.mp3', 0.5);
            });
        });
    }

    /**
     * Joue un effet sonore avec gestion d'erreurs
     *
     * @param {string} soundPath - Chemin vers le fichier audio
     * @param {number} volume - Volume de lecture (0.0 à 1.0)
     */
    playSound(soundPath, volume = 0.5) {
        try {
            const audio = new Audio(soundPath);
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.play().catch(() => {
                // Gestion silencieuse des erreurs d'autoplay
            });
        } catch (error) {
            // Gestion silencieuse des erreurs audio
        }
    }

    initAsyncStock() {
        // Démarrer le chargement du stock en arrière-plan
        if (window.asyncStockLoader) {
            window.asyncStockLoader.initAutoLoad();
        }
    }

    initTranslations() {
        // Réappliquer les traductions si nécessaire
        if (window.i18n && window.i18n.applyTranslations) {
            window.i18n.applyTranslations();
        }
    }

    showErrorState() {
        const sections = ['pieces', 'cartes', 'triptyques'];

        sections.forEach((category) => {
            const container = document.querySelector(`#${category} .shop-grid`);

            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-8 text-gray-400">
                        <div class="text-4xl mb-4">⚠️</div>
                        <p>Erreur lors du chargement</p>
                        <button onclick="window.boutiqueLoader.startLoading()"
                                class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            Réessayer
                        </button>
                    </div>
                `;
            }
        });
    }
}

// Instance globale
window.boutiqueLoader = new BoutiqueAsyncLoader();

// Production: log initialisation supprimé
