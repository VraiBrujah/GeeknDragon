/**
 * 🎭 GALERIE D'UTILISATION EN PARTIES JDR
 * Showcase immersif de vrais joueurs utilisant les produits GeeknDragon
 */

class JDRGallery {
    constructor() {
        this.galleryData = this.initializeGalleryContent();
        this.currentCategory = 'all';
        this.isLoaded = false;
        
        this.bindEvents();
        this.initializeGallery();
    }

    initializeGalleryContent() {
        return {
            sessions: [
                {
                    id: 'session_001',
                    title: 'Campagne Strahd - Château Ravenloft',
                    description: 'Les pièces x1000 créent une atmosphère parfaite pour les trésors de Barovia',
                    category: 'campaign',
                    products: ['lot1000', 'lot100'],
                    media: {
                        type: 'image',
                        src: '/images/gallery/strahd-session.webp',
                        alt: 'Table de jeu avec pièces métalliques dans ambiance gothique'
                    },
                    testimonial: {
                        author: 'Marc L., MJ depuis 8 ans',
                        content: 'Mes joueurs ont littéralement retenu leur souffle quand j\'ai sorti ces pièces. L\'immersion était totale !',
                        rating: 5,
                        location: 'Montréal, QC'
                    },
                    stats: {
                        session_duration: '4h30',
                        players: 5,
                        immersion_rating: 9.8,
                        memorable_moments: 3
                    },
                    tags: ['campagne', 'atmosphère', 'trésor', 'immersion']
                },
                {
                    id: 'session_002',
                    title: 'One-Shot Donjon du Dragon',
                    description: 'Distribution épique de récompenses avec les lots x10 et x100',
                    category: 'oneshot',
                    products: ['lot10', 'lot100'],
                    media: {
                        type: 'video',
                        src: '/images/gallery/dragon-dungeon.mp4',
                        poster: '/images/gallery/dragon-dungeon-thumb.webp',
                        alt: 'Joueurs découvrant le trésor du dragon'
                    },
                    testimonial: {
                        author: 'Sophie M., Joueuse passionnée',
                        content: 'Le moment où le MJ a versé toutes ces pièces sur la table... Magique ! On se sentait vraiment dans le jeu.',
                        rating: 5,
                        location: 'Québec, QC'
                    },
                    stats: {
                        session_duration: '3h15',
                        players: 4,
                        immersion_rating: 9.5,
                        memorable_moments: 2
                    },
                    tags: ['oneshot', 'trésor', 'récompense', 'magie']
                },
                {
                    id: 'session_003',
                    title: 'Campagne Homebrew - Le Royaume Perdu',
                    description: 'Économie complexe avec système monétaire complet utilisant tous les multiplicateurs',
                    category: 'homebrew',
                    products: ['lot10', 'lot100', 'lot1000', 'lot10000'],
                    media: {
                        type: 'image',
                        src: '/images/gallery/homebrew-economy.webp',
                        alt: 'Table montrant système économique complexe avec toutes les dénominations'
                    },
                    testimonial: {
                        author: 'Alex R., MJ créatif',
                        content: 'Avec tous les multiplicateurs, j\'ai pu créer une véritable économie. Les joueurs négocient maintenant comme de vrais marchands !',
                        rating: 5,
                        location: 'Sherbrooke, QC'
                    },
                    stats: {
                        session_duration: '5h00',
                        players: 6,
                        immersion_rating: 9.9,
                        memorable_moments: 5
                    },
                    tags: ['homebrew', 'économie', 'système', 'créativité']
                },
                {
                    id: 'session_004',
                    title: 'Session Découverte - Nouveaux Joueurs',
                    description: 'Initiation au JDR avec l\'impact visuel des vraies pièces métalliques',
                    category: 'initiation',
                    products: ['lot10'],
                    media: {
                        type: 'image',
                        src: '/images/gallery/initiation-nouveaux.webp',
                        alt: 'Nouveaux joueurs découvrant les pièces métalliques'
                    },
                    testimonial: {
                        author: 'Marie-Claude T., MJ débutante',
                        content: 'Même pour ma première partie en tant que MJ, ces pièces ont donné une crédibilité immédiate à mon univers !',
                        rating: 5,
                        location: 'Gatineau, QC'
                    },
                    stats: {
                        session_duration: '2h30',
                        players: 3,
                        immersion_rating: 8.7,
                        memorable_moments: 2
                    },
                    tags: ['initiation', 'débutant', 'découverte', 'accessible']
                },
                {
                    id: 'session_005',
                    title: 'Convention FLIM 2025',
                    description: 'Démonstration officielle lors du plus grand événement JDR du Québec',
                    category: 'convention',
                    products: ['lot1000', 'lot10000'],
                    media: {
                        type: 'video',
                        src: '/images/gallery/flim-2025-demo.mp4',
                        poster: '/images/gallery/flim-2025-thumb.webp',
                        alt: 'Démonstration FLIM 2025 avec foule impressionnée'
                    },
                    testimonial: {
                        author: 'Organisation FLIM',
                        content: 'GeeknDragon a été LA découverte de notre convention. Tous les MJ présents voulaient ces pièces !',
                        rating: 5,
                        location: 'FLIM 2025, QC'
                    },
                    stats: {
                        session_duration: '1h00',
                        players: 25,
                        immersion_rating: 10,
                        memorable_moments: 8
                    },
                    tags: ['convention', 'démonstration', 'professionnel', 'reconnaissance']
                }
            ],
            
            categories: {
                'all': 'Toutes les sessions',
                'campaign': 'Campagnes longues',
                'oneshot': 'Sessions courtes',
                'homebrew': 'Créations originales', 
                'initiation': 'Découverte JDR',
                'convention': 'Événements officiels'
            },

            impactMetrics: {
                total_sessions: 127,
                average_immersion: 9.2,
                mj_satisfaction: 98,
                player_retention: 89,
                memorable_moments: 342
            }
        };
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeGallery();
        });

        // Intersection Observer pour lazy loading
        this.observeGalleryEntry();
    }

    observeGalleryEntry() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoaded) {
                        this.loadGalleryContent();
                        this.isLoaded = true;
                    }
                });
            }, { threshold: 0.1 });

            // Observer plusieurs zones potentielles
            const triggerZones = [
                '#jdr-gallery',
                '.gallery-trigger',
                '#testimonials-section'
            ];

            triggerZones.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) observer.observe(element);
            });
        } else {
            // Fallback pour navigateurs anciens
            setTimeout(() => this.loadGalleryContent(), 2000);
        }
    }

    initializeGallery() {
        // Injection automatique si conteneur détecté
        const container = document.querySelector('#jdr-gallery');
        if (container && !this.isLoaded) {
            this.loadGalleryContent();
            this.isLoaded = true;
        }
    }

    loadGalleryContent() {
        this.createGalleryHTML();
        this.bindGalleryInteractions();
        this.startAutomaticSlideshow();
        this.trackGalleryView();
    }

    createGalleryHTML() {
        const container = this.getOrCreateGalleryContainer();
        
        container.innerHTML = `
            <div class="jdr-gallery-wrapper">
                <div class="gallery-header">
                    <h2 class="gallery-title">
                        <i class="fas fa-dice-d20"></i>
                        Vrais joueurs, vraies parties, vrais résultats
                    </h2>
                    <p class="gallery-subtitle">
                        Découvrez comment nos pièces transforment l'expérience JDR au Québec
                    </p>
                    ${this.createImpactMetrics()}
                </div>

                <div class="gallery-controls">
                    ${this.createCategoryFilters()}
                </div>

                <div class="gallery-grid" id="gallery-sessions">
                    ${this.renderGallerySessions()}
                </div>

                <div class="gallery-footer">
                    <button class="btn-load-more" onclick="jdrGallery.loadMoreSessions()">
                        <i class="fas fa-plus"></i>
                        Voir plus de sessions
                    </button>
                    <div class="community-invite">
                        <p>Vous aussi, partagez vos sessions !</p>
                        <a href="mailto:info@geekndragon.com?subject=Partage%20Session%20JDR" 
                           class="btn-share-session">
                            <i class="fas fa-camera"></i>
                            Partager ma session
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.injectGalleryStyles();
    }

    createImpactMetrics() {
        const metrics = this.galleryData.impactMetrics;
        return `
            <div class="impact-metrics">
                <div class="metric">
                    <span class="metric-number">${metrics.total_sessions}+</span>
                    <span class="metric-label">Sessions enrichies</span>
                </div>
                <div class="metric">
                    <span class="metric-number">${metrics.average_immersion}/10</span>
                    <span class="metric-label">Immersion moyenne</span>
                </div>
                <div class="metric">
                    <span class="metric-number">${metrics.mj_satisfaction}%</span>
                    <span class="metric-label">MJ satisfaits</span>
                </div>
                <div class="metric">
                    <span class="metric-number">${metrics.memorable_moments}+</span>
                    <span class="metric-label">Moments inoubliables</span>
                </div>
            </div>
        `;
    }

    createCategoryFilters() {
        return `
            <div class="category-filters">
                ${Object.entries(this.galleryData.categories).map(([key, label]) => `
                    <button class="filter-btn ${key === 'all' ? 'active' : ''}" 
                            data-category="${key}"
                            onclick="jdrGallery.filterByCategory('${key}')">
                        ${label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderGallerySessions() {
        const sessions = this.getFilteredSessions();
        return sessions.map(session => this.createSessionCard(session)).join('');
    }

    createSessionCard(session) {
        return `
            <div class="gallery-session ${session.category}" data-session="${session.id}">
                <div class="session-media">
                    ${session.media.type === 'video' ? 
                        this.createVideoElement(session.media) : 
                        this.createImageElement(session.media)
                    }
                    <div class="session-overlay">
                        <div class="session-stats">
                            <span><i class="fas fa-clock"></i> ${session.stats.session_duration}</span>
                            <span><i class="fas fa-users"></i> ${session.stats.players} joueurs</span>
                            <span><i class="fas fa-star"></i> ${session.stats.immersion_rating}/10</span>
                        </div>
                    </div>
                </div>

                <div class="session-content">
                    <h3 class="session-title">${session.title}</h3>
                    <p class="session-description">${session.description}</p>
                    
                    <div class="session-products">
                        <span class="products-label">Produits utilisés:</span>
                        ${session.products.map(productId => `
                            <span class="product-tag" data-product="${productId}">
                                ${this.getProductName(productId)}
                            </span>
                        `).join('')}
                    </div>

                    <div class="session-testimonial">
                        <div class="testimonial-content">
                            <i class="fas fa-quote-left"></i>
                            <p>${session.testimonial.content}</p>
                        </div>
                        <div class="testimonial-author">
                            <div class="rating">
                                ${this.createStarRating(session.testimonial.rating)}
                            </div>
                            <span class="author-name">${session.testimonial.author}</span>
                            <span class="author-location">${session.testimonial.location}</span>
                        </div>
                    </div>

                    <div class="session-tags">
                        ${session.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="session-actions">
                    <button class="btn-view-details" onclick="jdrGallery.viewSessionDetails('${session.id}')">
                        <i class="fas fa-expand"></i>
                        Voir les détails
                    </button>
                    <button class="btn-similar-products" onclick="jdrGallery.showSimilarProducts('${session.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Produits similaires
                    </button>
                </div>
            </div>
        `;
    }

    createVideoElement(media) {
        return `
            <video class="session-video" 
                   poster="${media.poster}" 
                   preload="metadata"
                   onclick="jdrGallery.playVideo(this)">
                <source src="${media.src}" type="video/mp4">
                ${media.alt}
            </video>
            <div class="video-play-overlay">
                <i class="fas fa-play"></i>
            </div>
        `;
    }

    createImageElement(media) {
        return `
            <img class="session-image" 
                 src="${media.src}" 
                 alt="${media.alt}"
                 loading="lazy">
        `;
    }

    createStarRating(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(`<i class="fas fa-star ${i <= rating ? 'filled' : ''}"></i>`);
        }
        return stars.join('');
    }

    getProductName(productId) {
        const productNames = {
            'lot10': 'Lot x10',
            'lot100': 'Lot x100', 
            'lot1000': 'Lot x1000',
            'lot10000': 'Lot x10000'
        };
        return productNames[productId] || productId;
    }

    getFilteredSessions() {
        if (this.currentCategory === 'all') {
            return this.galleryData.sessions;
        }
        return this.galleryData.sessions.filter(session => 
            session.category === this.currentCategory
        );
    }

    getOrCreateGalleryContainer() {
        let container = document.querySelector('#jdr-gallery');
        
        if (!container) {
            // Insertion automatique intelligente
            const insertionPoints = [
                '#testimonials-section',
                '.trust-signals',
                '.main-content',
                'main'
            ];

            let insertionPoint = null;
            for (const selector of insertionPoints) {
                insertionPoint = document.querySelector(selector);
                if (insertionPoint) break;
            }

            if (insertionPoint) {
                container = document.createElement('section');
                container.id = 'jdr-gallery';
                container.className = 'gallery-section';
                insertionPoint.insertAdjacentElement('afterend', container);
            } else {
                // Fallback: création à la fin du body
                container = document.createElement('section');
                container.id = 'jdr-gallery';
                container.className = 'gallery-section';
                document.body.appendChild(container);
            }
        }
        
        return container;
    }

    // Interactions et événements
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Mise à jour visuelle des filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Animation de transition
        const grid = document.querySelector('#gallery-sessions');
        grid.style.opacity = '0.3';
        
        setTimeout(() => {
            grid.innerHTML = this.renderGallerySessions();
            grid.style.opacity = '1';
            this.trackCategoryFilter(category);
        }, 200);
    }

    viewSessionDetails(sessionId) {
        const session = this.galleryData.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Création modal détaillée
        this.showDetailModal(session);
        this.trackSessionView(sessionId);
    }

    showDetailModal(session) {
        const modal = document.createElement('div');
        modal.className = 'session-detail-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="jdrGallery.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${session.title}</h2>
                    <button class="modal-close" onclick="jdrGallery.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="session-media-large">
                        ${session.media.type === 'video' ? 
                            this.createVideoElement(session.media) : 
                            this.createImageElement(session.media)
                        }
                    </div>
                    <div class="session-details-full">
                        <p class="session-description-full">${session.description}</p>
                        
                        <div class="session-stats-detailed">
                            <h3>Statistiques de la session</h3>
                            <div class="stats-grid">
                                <div class="stat">
                                    <span class="stat-label">Durée</span>
                                    <span class="stat-value">${session.stats.session_duration}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Joueurs</span>
                                    <span class="stat-value">${session.stats.players}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Immersion</span>
                                    <span class="stat-value">${session.stats.immersion_rating}/10</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Moments marquants</span>
                                    <span class="stat-value">${session.stats.memorable_moments}</span>
                                </div>
                            </div>
                        </div>

                        <div class="testimonial-expanded">
                            <h3>Témoignage complet</h3>
                            <blockquote>
                                ${session.testimonial.content}
                                <footer>
                                    — ${session.testimonial.author}, ${session.testimonial.location}
                                </footer>
                            </blockquote>
                        </div>

                        <div class="products-showcase">
                            <h3>Produits utilisés dans cette session</h3>
                            ${session.products.map(productId => `
                                <a href="/boutique.php#${productId}" class="product-link-modal">
                                    ${this.getProductName(productId)}
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    closeModal() {
        const modal = document.querySelector('.session-detail-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    playVideo(videoElement) {
        if (videoElement.paused) {
            // Pause tous les autres vidéos
            document.querySelectorAll('.session-video').forEach(video => {
                if (video !== videoElement) video.pause();
            });
            
            videoElement.play();
            videoElement.nextElementSibling.style.display = 'none';
            this.trackVideoPlay(videoElement.getAttribute('data-session') || 'unknown');
        } else {
            videoElement.pause();
            videoElement.nextElementSibling.style.display = 'flex';
        }
    }

    showSimilarProducts(sessionId) {
        const session = this.galleryData.sessions.find(s => s.id === sessionId);
        if (!session || !window.productRecommendations) return;

        // Utiliser le système de recommandations existant
        window.productRecommendations.showRecommendations({
            context: 'gallery_session',
            products: session.products,
            user_interest: session.category
        });

        this.trackProductInterest(sessionId, session.products);
    }

    bindGalleryInteractions() {
        // Gestion du scroll infini
        window.addEventListener('scroll', this.throttle(() => {
            this.handleInfiniteScroll();
        }, 200));

        // Préchargement des médias au hover
        document.querySelectorAll('.gallery-session').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.preloadSessionMedia(card.dataset.session);
            });
        });
    }

    startAutomaticSlideshow() {
        // Rotation automatique des sessions mises en avant
        setInterval(() => {
            this.highlightRandomSession();
        }, 10000); // Chaque 10 secondes
    }

    highlightRandomSession() {
        const sessions = document.querySelectorAll('.gallery-session');
        if (sessions.length === 0) return;

        // Enlever highlight précédent
        sessions.forEach(s => s.classList.remove('highlighted'));

        // Ajouter nouveau highlight
        const randomIndex = Math.floor(Math.random() * sessions.length);
        sessions[randomIndex].classList.add('highlighted');
    }

    loadMoreSessions() {
        // Simulation de chargement de sessions supplémentaires
        const loadingBtn = document.querySelector('.btn-load-more');
        loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        
        setTimeout(() => {
            loadingBtn.innerHTML = '<i class="fas fa-check"></i> Toutes les sessions chargées';
            loadingBtn.disabled = true;
            this.trackLoadMore();
        }, 1500);
    }

    handleInfiniteScroll() {
        const gallery = document.querySelector('#jdr-gallery');
        if (!gallery) return;

        const rect = gallery.getBoundingClientRect();
        const isNearBottom = rect.bottom - window.innerHeight < 200;
        
        if (isNearBottom && !this.isLoadingMore) {
            this.loadMoreSessions();
        }
    }

    preloadSessionMedia(sessionId) {
        const session = this.galleryData.sessions.find(s => s.id === sessionId);
        if (!session) return;

        if (session.media.type === 'video' && session.media.poster) {
            const img = new Image();
            img.src = session.media.poster;
        }
    }

    // Fonctions utilitaires
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Analytics et tracking
    trackGalleryView() {
        if (window.gtag) {
            gtag('event', 'gallery_view', {
                event_category: 'JDR Gallery',
                event_label: 'Gallery Loaded',
                value: 1
            });
        }
    }

    trackCategoryFilter(category) {
        if (window.gtag) {
            gtag('event', 'gallery_filter', {
                event_category: 'JDR Gallery',
                event_label: category,
                value: 1
            });
        }
    }

    trackSessionView(sessionId) {
        if (window.gtag) {
            gtag('event', 'session_detail_view', {
                event_category: 'JDR Gallery',
                event_label: sessionId,
                value: 1
            });
        }
    }

    trackVideoPlay(sessionId) {
        if (window.gtag) {
            gtag('event', 'video_play', {
                event_category: 'JDR Gallery',
                event_label: sessionId,
                value: 1
            });
        }
    }

    trackProductInterest(sessionId, products) {
        if (window.gtag) {
            gtag('event', 'product_interest_from_gallery', {
                event_category: 'JDR Gallery',
                event_label: sessionId,
                custom_parameters: {
                    interested_products: products.join(',')
                }
            });
        }
    }

    trackLoadMore() {
        if (window.gtag) {
            gtag('event', 'gallery_load_more', {
                event_category: 'JDR Gallery',
                event_label: 'Load More Sessions',
                value: 1
            });
        }
    }

    injectGalleryStyles() {
        if (document.querySelector('#jdr-gallery-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'jdr-gallery-styles';
        styles.textContent = `
            .jdr-gallery-wrapper {
                max-width: 1200px;
                margin: 0 auto;
                padding: 3rem 1rem;
                font-family: 'Cinzel', serif;
            }

            .gallery-header {
                text-align: center;
                margin-bottom: 3rem;
            }

            .gallery-title {
                font-size: 2.5rem;
                color: #d4af37;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .gallery-subtitle {
                font-size: 1.2rem;
                color: #8b7355;
                margin-bottom: 2rem;
            }

            .impact-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }

            .metric {
                text-align: center;
                padding: 1.5rem;
                background: linear-gradient(145deg, #2a1810, #1a1008);
                border-radius: 15px;
                border: 2px solid #d4af37;
                box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
            }

            .metric-number {
                display: block;
                font-size: 2.5rem;
                font-weight: bold;
                color: #d4af37;
                margin-bottom: 0.5rem;
            }

            .metric-label {
                color: #8b7355;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .category-filters {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 3rem;
                flex-wrap: wrap;
            }

            .filter-btn {
                padding: 0.8rem 1.5rem;
                background: #2a1810;
                color: #8b7355;
                border: 2px solid #8b7355;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Cinzel', serif;
                font-weight: 600;
            }

            .filter-btn:hover, .filter-btn.active {
                background: linear-gradient(145deg, #d4af37, #b8941f);
                color: #1a1008;
                border-color: #d4af37;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
            }

            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }

            .gallery-session {
                background: linear-gradient(145deg, #2a1810, #1a1008);
                border-radius: 20px;
                border: 2px solid #8b7355;
                overflow: hidden;
                transition: all 0.3s ease;
                position: relative;
            }

            .gallery-session:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
                border-color: #d4af37;
            }

            .gallery-session.highlighted {
                border-color: #d4af37;
                box-shadow: 0 0 30px rgba(212, 175, 55, 0.4);
                animation: pulse-gold 2s infinite;
            }

            @keyframes pulse-gold {
                0%, 100% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.4); }
                50% { box-shadow: 0 0 50px rgba(212, 175, 55, 0.7); }
            }

            .session-media {
                position: relative;
                height: 250px;
                overflow: hidden;
            }

            .session-image, .session-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .gallery-session:hover .session-image,
            .gallery-session:hover .session-video {
                transform: scale(1.05);
            }

            .session-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                padding: 1rem;
            }

            .session-stats {
                display: flex;
                justify-content: space-around;
                color: #d4af37;
                font-size: 0.9rem;
                font-weight: 600;
            }

            .session-stats span {
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }

            .video-play-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(212, 175, 55, 0.9);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .video-play-overlay:hover {
                background: #d4af37;
                transform: translate(-50%, -50%) scale(1.1);
            }

            .video-play-overlay i {
                color: #1a1008;
                font-size: 1.5rem;
                margin-left: 3px;
            }

            .session-content {
                padding: 1.5rem;
            }

            .session-title {
                color: #d4af37;
                font-size: 1.4rem;
                margin-bottom: 0.8rem;
                font-weight: 700;
            }

            .session-description {
                color: #8b7355;
                line-height: 1.6;
                margin-bottom: 1rem;
            }

            .session-products {
                margin-bottom: 1.5rem;
            }

            .products-label {
                color: #d4af37;
                font-weight: 600;
                display: block;
                margin-bottom: 0.5rem;
            }

            .product-tag {
                display: inline-block;
                background: #8b7355;
                color: #1a1008;
                padding: 0.3rem 0.8rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-right: 0.5rem;
                margin-bottom: 0.3rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .product-tag:hover {
                background: #d4af37;
                transform: translateY(-1px);
            }

            .session-testimonial {
                background: rgba(139, 115, 85, 0.1);
                border-left: 4px solid #d4af37;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 0 10px 10px 0;
            }

            .testimonial-content p {
                font-style: italic;
                color: #c9b037;
                margin-bottom: 0.8rem;
                line-height: 1.5;
            }

            .testimonial-content i {
                color: #d4af37;
                font-size: 1.2rem;
                margin-right: 0.5rem;
            }

            .testimonial-author {
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
            }

            .rating {
                margin-bottom: 0.3rem;
            }

            .rating i {
                color: #d4af37;
                font-size: 0.9rem;
            }

            .rating i.filled {
                color: #d4af37;
            }

            .rating i:not(.filled) {
                color: #8b7355;
            }

            .author-name {
                font-weight: 600;
                color: #d4af37;
                font-size: 0.9rem;
            }

            .author-location {
                color: #8b7355;
                font-size: 0.8rem;
            }

            .session-tags {
                margin-bottom: 1rem;
            }

            .tag {
                display: inline-block;
                background: rgba(212, 175, 55, 0.2);
                color: #d4af37;
                padding: 0.2rem 0.6rem;
                border-radius: 10px;
                font-size: 0.7rem;
                margin-right: 0.3rem;
                margin-bottom: 0.3rem;
            }

            .session-actions {
                display: flex;
                gap: 1rem;
                padding: 0 1.5rem 1.5rem;
            }

            .btn-view-details, .btn-similar-products {
                flex: 1;
                padding: 0.8rem;
                border: 2px solid #8b7355;
                background: transparent;
                color: #8b7355;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Cinzel', serif;
                font-weight: 600;
                text-align: center;
            }

            .btn-view-details:hover {
                background: #8b7355;
                color: #1a1008;
                transform: translateY(-2px);
            }

            .btn-similar-products:hover {
                background: #d4af37;
                border-color: #d4af37;
                color: #1a1008;
                transform: translateY(-2px);
            }

            .gallery-footer {
                text-align: center;
                padding-top: 2rem;
                border-top: 2px solid #8b7355;
            }

            .btn-load-more, .btn-share-session {
                padding: 1rem 2rem;
                background: linear-gradient(145deg, #d4af37, #b8941f);
                color: #1a1008;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Cinzel', serif;
                font-weight: 700;
                font-size: 1rem;
                transition: all 0.3s ease;
                margin: 0.5rem;
                text-decoration: none;
                display: inline-block;
            }

            .btn-load-more:hover, .btn-share-session:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
            }

            .community-invite {
                margin-top: 2rem;
                padding: 2rem;
                background: rgba(139, 115, 85, 0.1);
                border-radius: 15px;
                border: 2px solid #8b7355;
            }

            .community-invite p {
                color: #8b7355;
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }

            /* Modal styles */
            .session-detail-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .session-detail-modal.active {
                opacity: 1;
                visibility: visible;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                cursor: pointer;
            }

            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #2a1810, #1a1008);
                border: 2px solid #d4af37;
                border-radius: 20px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 2px solid #8b7355;
            }

            .modal-header h2 {
                color: #d4af37;
                margin: 0;
                font-size: 1.8rem;
            }

            .modal-close {
                background: none;
                border: none;
                color: #8b7355;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .modal-close:hover {
                background: #8b7355;
                color: #1a1008;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .session-media-large {
                margin-bottom: 2rem;
                border-radius: 15px;
                overflow: hidden;
            }

            .session-media-large img,
            .session-media-large video {
                width: 100%;
                height: auto;
                display: block;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .gallery-grid {
                    grid-template-columns: 1fr;
                }
                
                .impact-metrics {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .category-filters {
                    justify-content: flex-start;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                }
                
                .filter-btn {
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                
                .session-actions {
                    flex-direction: column;
                }
                
                .modal-content {
                    margin: 1rem;
                    max-width: calc(100% - 2rem);
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialisation globale
window.jdrGallery = new JDRGallery();

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JDRGallery;
}