// Geek&Dragon - Script principal avec fonctionnalités modernes
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des modules
    Navigation.init();
    ScrollEffects.init();
    Animations.init();
    Performance.init();
});

// Module Navigation
const Navigation = {
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveStates();
    },

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Fermer le menu mobile quand on clique sur un lien
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    },

    setupSmoothScrolling() {
        // Smooth scroll pour les liens d'ancrage
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    setupActiveStates() {
        // Header transparence au scroll
        const header = document.querySelector('.header');
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Effet de transparence
            if (scrollTop > 100) {
                header.style.background = 'rgba(26, 26, 26, 0.98)';
            } else {
                header.style.background = 'rgba(26, 26, 26, 0.95)';
            }

            // Auto-hide header sur mobile
            if (window.innerWidth <= 768) {
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }

            lastScrollTop = scrollTop;
        });
    }
};

// Module Effets de Scroll
const ScrollEffects = {
    init() {
        this.setupScrollTriggers();
        this.setupParallax();
        this.setupCounters();
    },

    setupScrollTriggers() {
        // Observer pour les animations au scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Démarrer les compteurs si c'est une section avec compteurs
                    if (entry.target.classList.contains('counter-section')) {
                        this.startCounters(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observer les éléments à animer
        const animatedElements = document.querySelectorAll('.fade-in');
        animatedElements.forEach(element => {
            observer.observe(element);
        });

        // Ajouter la classe fade-in aux cartes
        const cards = document.querySelectorAll('.feature-card, .product-category, .testimonial-card');
        cards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    },

    setupParallax() {
        // Effet parallax simple pour la vidéo hero
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                heroVideo.style.transform = `translateY(${rate}px)`;
            });
        }
    },

    setupCounters() {
        // Animation de compteur (à utiliser si vous ajoutez des statistiques)
        this.startCounters = function(section) {
            const counters = section.querySelectorAll('[data-count]');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 2 secondes
                const step = target / (duration / 16); // 60fps
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
            });
        };
    }
};

// Module Animations
const Animations = {
    init() {
        this.setupHoverEffects();
        this.setupLoadingStates();
        this.setupMicroInteractions();
    },

    setupHoverEffects() {
        // Effet de survol avancé pour les cartes
        const cards = document.querySelectorAll('.feature-card, .product-category, .testimonial-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('div');
                ripple.className = 'hover-ripple';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                card.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    },

    setupLoadingStates() {
        // États de chargement pour les interactions
        const buttons = document.querySelectorAll('.cta-primary, .cta-secondary');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Ajouter classe loading temporaire
                this.classList.add('loading');
                
                // Simuler un chargement (remplacer par vraie logique)
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            });
        });
    },

    setupMicroInteractions() {
        // Micro-interactions pour améliorer l'UX
        
        // Animation des liens avec délai
        const links = document.querySelectorAll('.nav-link, .category-link');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-1px)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0)';
            });
        });

        // Effet de focus amélioré
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.3)';
            });
            
            element.addEventListener('blur', () => {
                element.style.boxShadow = '';
            });
        });
    }
};

// Module Performance
const Performance = {
    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupErrorHandling();
    },

    setupLazyLoading() {
        // Lazy loading pour les images
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    },

    setupImageOptimization() {
        // Optimisation des images au chargement
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });

            img.addEventListener('error', () => {
                // Fallback image si l'image ne charge pas
                img.src = 'assets/images/placeholder.jpg';
                img.alt = 'Image non disponible';
            });
        });
    },

    setupErrorHandling() {
        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Erreur JavaScript:', e.error);
            // Optionnel: envoyer l'erreur à un service de monitoring
        });

        // Gestion des erreurs de ressources
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise rejetée:', e.reason);
        });
    }
};

// Utilitaires globaux
const Utils = {
    // Debounce pour optimiser les events de scroll/resize
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle pour les animations
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Animation fluide de valeurs
    animateValue(element, start, end, duration, callback) {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            if (callback) callback(current);
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    },

    // Détection de dispositif
    isMobile() {
        return window.innerWidth <= 768;
    },

    isTablet() {
        return window.innerWidth <= 1024 && window.innerWidth > 768;
    },

    // Gestion du local storage avec fallback
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage non disponible');
        }
    },

    getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage non disponible');
            return null;
        }
    }
};

// Optimisation des performances de scroll
window.addEventListener('scroll', Utils.throttle(() => {
    // Code optimisé pour le scroll
}, 16)); // ~60fps

// Optimisation des performances de resize
window.addEventListener('resize', Utils.debounce(() => {
    // Code pour le resize
    Navigation.setupActiveStates();
}, 250));

// Analytics et tracking (à personnaliser selon vos besoins)
const Analytics = {
    init() {
        // Placeholder pour Google Analytics, Hotjar, etc.
        this.trackPageView();
        this.setupEventTracking();
    },

    trackPageView() {
        // gtag('config', 'GA_TRACKING_ID', {
        //     page_title: document.title,
        //     page_location: window.location.href
        // });
    },

    trackEvent(action, category, label, value) {
        // gtag('event', action, {
        //     event_category: category,
        //     event_label: label,
        //     value: value
        // });
        console.log('Event tracked:', { action, category, label, value });
    },

    setupEventTracking() {
        // Tracking des clics sur les CTA
        const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.trackEvent('click', 'CTA', button.textContent);
            });
        });

        // Tracking du scroll profondeur
        let maxScroll = 0;
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // 25%, 50%, 75%, 100%
                    this.trackEvent('scroll', 'Depth', `${maxScroll}%`);
                }
            }
        }, 1000));
    }
};

// Initialiser analytics si nécessaire
// Analytics.init();

// Export pour utilisation dans d'autres modules
window.GeeknDragon = {
    Navigation,
    ScrollEffects,
    Animations,
    Performance,
    Utils,
    Analytics
};