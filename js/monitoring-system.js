/**
 * Système de Monitoring Client - Geek & Dragon
 *
 * Monitoring côté client autonome sans dépendances externes.
 * Conforme aux directives : offline, français, extensible, pas de tracking externe.
 *
 * @author Brujah
 * @version 1.0.0
 * @since 2025-09-27
 */

/**
 * Gestionnaire principal du monitoring côté client
 *
 * Fonctionnalités :
 * - Métriques de performance (temps de chargement, interactions)
 * - Détection d'erreurs JavaScript avec contexte
 * - Monitoring UX (clics, conversions, abandon panier)
 * - Stockage local avec synchronisation différée
 * - Tableaux de bord temps réel
 */
class MonitoringSystemeGeekDragon {

    /**
     * Constructeur du système de monitoring
     *
     * @param {Object} configuration - Configuration du système
     */
    constructor(configuration = {}) {
        this.configuration = {
            // Endpoint de synchronisation avec le serveur
            urlSynchronisation: configuration.urlSynchronisation || '/api/monitoring/sync',

            // Stockage local des métriques
            cleStockageLocal: configuration.cleStockageLocal || 'gd_monitoring_metriques',

            // Fréquence de synchronisation (ms)
            intervaleSynchronisation: configuration.intervaleSynchronisation || 30000, // 30s

            // Taille maximale du buffer local
            tailleMaximaleBuffer: configuration.tailleMaximaleBuffer || 1000,

            // Mode debug
            modeDebug: configuration.modeDebug || false,

            // Métriques activées
            metriquesActivees: configuration.metriquesActivees || {
                performance: true,
                erreurs: true,
                interactions: true,
                conversion: true,
                technique: true
            }
        };

        // État interne
        this.bufferMetriques = [];
        this.sessionId = this.genererIdSession();
        this.tempsDebutSession = performance.now();
        this.derniereSync = Date.now();

        // Métriques de performance
        this.metriquesPerformance = {
            tempsChargementInitial: null,
            tempsInteractivite: null,
            nombreRequetesAjax: 0,
            erreurs: []
        };

        // Initialisation
        this.initialiser();
    }

    /**
     * Initialise le système de monitoring
     *
     * @private
     * @returns {void}
     */
    initialiser() {
        this.debug('🔍 Initialisation du système de monitoring Geek & Dragon');

        // Métriques de performance du navigateur
        if (this.configuration.metriquesActivees.performance) {
            this.initialiserMonitoringPerformance();
        }

        // Gestionnaire d'erreurs global
        if (this.configuration.metriquesActivees.erreurs) {
            this.initialiserGestionnaireErreurs();
        }

        // Monitoring des interactions utilisateur
        if (this.configuration.metriquesActivees.interactions) {
            this.initialiserMonitoringInteractions();
        }

        // Monitoring e-commerce
        if (this.configuration.metriquesActivees.conversion) {
            this.initialiserMonitoringEcommerce();
        }

        // Métriques techniques
        if (this.configuration.metriquesActivees.technique) {
            this.initialiserMonitoringTechnique();
        }

        // Synchronisation périodique
        this.demarrerSynchronisationPeriodique();

        // Récupération des métriques du stockage local
        this.recupererMetriquesLocales();

        // Marqueur de session démarrée
        this.enregistrerMetrique('session_demarree', 1, 'count', {
            user_agent: navigator.userAgent,
            langue: navigator.language,
            taille_ecran: `${screen.width}x${screen.height}`,
            pixels_ratio: window.devicePixelRatio
        });
    }

    /**
     * Enregistre une métrique avec contexte enrichi
     *
     * @param {string} nom - Nom de la métrique
     * @param {number} valeur - Valeur de la métrique
     * @param {string} unite - Unité de mesure
     * @param {Object} tags - Tags additionnels
     * @returns {void}
     */
    enregistrerMetrique(nom, valeur, unite = '', tags = {}) {
        const metrique = {
            nom,
            valeur,
            unite,
            tags: {
                ...tags,
                session_id: this.sessionId,
                page: window.location.pathname,
                referrer: document.referrer || 'direct',
                timestamp: Date.now(),
                temps_session: Math.round(performance.now() - this.tempsDebutSession)
            }
        };

        // Ajouter au buffer local
        this.bufferMetriques.push(metrique);

        // Maintenir la taille du buffer
        if (this.bufferMetriques.length > this.configuration.tailleMaximaleBuffer) {
            this.bufferMetriques.shift();
        }

        // Sauvegarder en local
        this.sauvegarderMetriquesLocales();

        this.debug(`📊 Métrique enregistrée: ${nom} = ${valeur} ${unite}`, metrique);
    }

    /**
     * Enregistre une erreur JavaScript avec contexte complet
     *
     * @param {Error|string} erreur - Erreur à enregistrer
     * @param {Object} contexte - Contexte additionnel
     * @returns {void}
     */
    enregistrerErreur(erreur, contexte = {}) {
        const detailsErreur = {
            message: erreur.message || erreur.toString(),
            stack: erreur.stack || 'Non disponible',
            type: erreur.name || 'JavaScriptError',
            ligne: erreur.lineno || 'inconnue',
            colonne: erreur.colno || 'inconnue',
            source: erreur.filename || window.location.href,
            ...contexte
        };

        this.metriquesPerformance.erreurs.push(detailsErreur);

        this.enregistrerMetrique('erreur_javascript', 1, 'count', {
            erreur_type: detailsErreur.type,
            erreur_message: detailsErreur.message.substring(0, 100), // Limiter la taille
            source: detailsErreur.source
        });

        console.error('❌ Erreur capturée par le monitoring:', detailsErreur);
    }

    /**
     * Mesure la performance d'une opération
     *
     * @param {string} nom - Nom de l'opération
     * @param {Function} operation - Fonction à mesurer
     * @returns {Promise<any>} Résultat de l'opération
     */
    async mesurerPerformance(nom, operation) {
        const debut = performance.now();

        try {
            const resultat = await operation();
            const duree = performance.now() - debut;

            this.enregistrerMetrique(`performance_${nom}`, duree, 'ms', {
                statut: 'succes'
            });

            return resultat;
        } catch (erreur) {
            const duree = performance.now() - debut;

            this.enregistrerMetrique(`performance_${nom}`, duree, 'ms', {
                statut: 'erreur'
            });

            this.enregistrerErreur(erreur, { operation: nom });
            throw erreur;
        }
    }

    /**
     * Surveille les métriques de l'API Web Vitals
     *
     * @private
     * @returns {void}
     */
    initialiserMonitoringPerformance() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            this.enregistrerMetrique('fcp', entry.startTime, 'ms');
                        }
                    }
                });
                observer.observe({ entryTypes: ['paint'] });
            } catch (erreur) {
                this.debug('Observer paint non supporté:', erreur);
            }
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const derniere = entries[entries.length - 1];
                    if (derniere) {
                        this.enregistrerMetrique('lcp', derniere.startTime, 'ms');
                    }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (erreur) {
                this.debug('Observer LCP non supporté:', erreur);
            }
        }

        // Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.enregistrerMetrique('cls', clsValue, 'score');
                });
                observer.observe({ entryTypes: ['layout-shift'] });
            } catch (erreur) {
                this.debug('Observer CLS non supporté:', erreur);
            }
        }

        // Métriques de navigation
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.enregistrerMetrique('temps_chargement_dom', navigation.domContentLoadedEventEnd - navigation.navigationStart, 'ms');
                    this.enregistrerMetrique('temps_chargement_complet', navigation.loadEventEnd - navigation.navigationStart, 'ms');
                    this.enregistrerMetrique('temps_reponse_serveur', navigation.responseEnd - navigation.requestStart, 'ms');
                }
            }, 1000);
        });
    }

    /**
     * Configure le gestionnaire d'erreurs global
     *
     * @private
     * @returns {void}
     */
    initialiserGestionnaireErreurs() {
        // Erreurs JavaScript globales
        window.addEventListener('error', (event) => {
            this.enregistrerErreur(event.error || event, {
                type: 'erreur_javascript_globale',
                ligne: event.lineno,
                colonne: event.colno,
                source: event.filename
            });
        });

        // Promesses rejetées non capturées
        window.addEventListener('unhandledrejection', (event) => {
            this.enregistrerErreur(event.reason, {
                type: 'promesse_rejetee',
                promise: 'non_capturee'
            });
        });

        // Erreurs de ressources (images, scripts, etc.)
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.enregistrerMetrique('erreur_ressource', 1, 'count', {
                    type_ressource: event.target.tagName.toLowerCase(),
                    source: event.target.src || event.target.href || 'inconnue',
                    erreur_type: 'chargement_impossible'
                });
            }
        }, true);
    }

    /**
     * Configure le monitoring des interactions utilisateur
     *
     * @private
     * @returns {void}
     */
    initialiserMonitoringInteractions() {
        // Clics sur les éléments importants
        document.addEventListener('click', (event) => {
            const element = event.target.closest('[data-monitoring]') || event.target.closest('.btn') || event.target.closest('a');

            if (element) {
                const nom = element.dataset.monitoring || element.textContent.trim().substring(0, 50);
                this.enregistrerMetrique('clic_element', 1, 'count', {
                    element_type: element.tagName.toLowerCase(),
                    element_nom: nom,
                    element_classe: element.className,
                    position_x: event.clientX,
                    position_y: event.clientY
                });
            }
        });

        // Temps passé sur la page
        let tempsVisible = 0;
        let dernierVisible = Date.now();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                tempsVisible += Date.now() - dernierVisible;
                this.enregistrerMetrique('temps_visible_page', tempsVisible, 'ms');
            } else {
                dernierVisible = Date.now();
            }
        });

        // Avant fermeture/navigation
        window.addEventListener('beforeunload', () => {
            if (!document.hidden) {
                tempsVisible += Date.now() - dernierVisible;
            }
            this.enregistrerMetrique('temps_visible_total', tempsVisible, 'ms');
            this.synchroniserImmediatement();
        });

        // Défilement de page
        let dernierePositionScroll = 0;
        let maxScroll = 0;

        window.addEventListener('scroll', this.debounce(() => {
            const position = window.pageYOffset;
            const hauteurPage = document.body.scrollHeight - window.innerHeight;
            const pourcentageScroll = Math.round((position / hauteurPage) * 100);

            if (pourcentageScroll > maxScroll) {
                maxScroll = pourcentageScroll;
                this.enregistrerMetrique('scroll_max_atteint', maxScroll, 'percent');
            }

            dernierePositionScroll = position;
        }, 500));
    }

    /**
     * Configure le monitoring spécifique e-commerce
     *
     * @private
     * @returns {void}
     */
    initialiserMonitoringEcommerce() {
        // Surveillance des boutons Snipcart
        document.addEventListener('click', (event) => {
            if (event.target.closest('.snipcart-add-item')) {
                const bouton = event.target.closest('.snipcart-add-item');
                this.enregistrerMetrique('ajout_panier_tentative', 1, 'count', {
                    produit_id: bouton.dataset.itemId,
                    produit_nom: bouton.dataset.itemName,
                    prix: bouton.dataset.itemPrice,
                    source_page: window.location.pathname
                });
            }
        });

        // Écouteurs Snipcart si disponible
        if (window.Snipcart && window.Snipcart.events) {
            // Produit ajouté au panier
            window.Snipcart.events.on('item.added', (item) => {
                this.enregistrerMetrique('ajout_panier_succes', 1, 'count', {
                    produit_id: item.id,
                    produit_nom: item.name,
                    prix: item.price,
                    quantite: item.quantity
                });
            });

            // Commande terminée
            window.Snipcart.events.on('order.completed', (order) => {
                this.enregistrerMetrique('commande_completee', 1, 'count', {
                    total: order.finalGrandTotal,
                    nombre_articles: order.items.length,
                    methode_paiement: order.paymentMethod
                });

                this.enregistrerMetrique('revenus', order.finalGrandTotal, 'cad');
            });
        }

        // Monitoring du convertisseur de monnaie
        if (window.CurrencyConverterPremium) {
            // Surveiller les calculs du convertisseur
            const convertisseurOriginal = window.CurrencyConverterPremium.prototype.updateCalculations;
            if (convertisseurOriginal) {
                window.CurrencyConverterPremium.prototype.updateCalculations = function() {
                    const debut = performance.now();
                    const resultat = convertisseurOriginal.call(this);
                    const duree = performance.now() - debut;

                    // Utiliser l'instance globale de monitoring
                    if (window.monitoringGD) {
                        window.monitoringGD.enregistrerMetrique('convertisseur_calcul', duree, 'ms');
                    }

                    return resultat;
                };
            }
        }
    }

    /**
     * Configure le monitoring technique du navigateur
     *
     * @private
     * @returns {void}
     */
    initialiserMonitoringTechnique() {
        // Informations du navigateur et device
        this.enregistrerMetrique('info_technique', 1, 'count', {
            navigateur: this.detecterNavigateur(),
            version_navigateur: navigator.userAgent,
            os: this.detecterOs(),
            taille_ecran: `${screen.width}x${screen.height}`,
            taille_viewport: `${window.innerWidth}x${window.innerHeight}`,
            ratio_pixels: window.devicePixelRatio,
            cookies_actives: navigator.cookieEnabled,
            langue_navigateur: navigator.language,
            langues_acceptees: navigator.languages ? navigator.languages.join(',') : 'inconnue',
            connexion_type: this.detecterTypeConnexion()
        });

        // Mémoire utilisée (si disponible)
        if ('memory' in performance) {
            setInterval(() => {
                this.enregistrerMetrique('memoire_utilisee', performance.memory.usedJSHeapSize, 'bytes');
                this.enregistrerMetrique('memoire_totale', performance.memory.totalJSHeapSize, 'bytes');
            }, 30000); // Toutes les 30 secondes
        }

        // Monitoring des WebWorkers si utilisés
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                this.enregistrerMetrique('service_worker_actif', 1, 'count');
            });
        }
    }

    /**
     * Démarre la synchronisation périodique avec le serveur
     *
     * @private
     * @returns {void}
     */
    demarrerSynchronisationPeriodique() {
        setInterval(() => {
            this.synchroniserAvecServeur();
        }, this.configuration.intervaleSynchronisation);

        // Synchronisation lors de la perte de focus (navigation vers autre onglet)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.synchroniserAvecServeur();
            }
        });
    }

    /**
     * Synchronise les métriques avec le serveur
     *
     * @private
     * @returns {Promise<void>}
     */
    async synchroniserAvecServeur() {
        if (this.bufferMetriques.length === 0) {
            return;
        }

        const metriquesAEnvoyer = [...this.bufferMetriques];

        try {
            const reponse = await fetch(this.configuration.urlSynchronisation, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    metriques: metriquesAEnvoyer,
                    timestamp: Date.now()
                })
            });

            if (reponse.ok) {
                // Supprimer les métriques envoyées du buffer
                this.bufferMetriques = this.bufferMetriques.slice(metriquesAEnvoyer.length);
                this.derniereSync = Date.now();
                this.sauvegarderMetriquesLocales();

                this.debug(`✅ ${metriquesAEnvoyer.length} métriques synchronisées avec succès`);
            } else {
                this.debug(`❌ Erreur de synchronisation: ${reponse.status}`);
            }
        } catch (erreur) {
            this.debug('❌ Erreur lors de la synchronisation:', erreur);
            // Les métriques restent dans le buffer pour un prochain essai
        }
    }

    /**
     * Force une synchronisation immédiate
     *
     * @returns {Promise<void>}
     */
    async synchroniserImmediatement() {
        await this.synchroniserAvecServeur();
    }

    /**
     * Sauvegarde les métriques dans le stockage local
     *
     * @private
     * @returns {void}
     */
    sauvegarderMetriquesLocales() {
        try {
            const donnees = {
                session_id: this.sessionId,
                metriques: this.bufferMetriques,
                derniere_sync: this.derniereSync,
                timestamp: Date.now()
            };

            localStorage.setItem(this.configuration.cleStockageLocal, JSON.stringify(donnees));
        } catch (erreur) {
            this.debug('❌ Erreur sauvegarde locale:', erreur);
        }
    }

    /**
     * Récupère les métriques depuis le stockage local
     *
     * @private
     * @returns {void}
     */
    recupererMetriquesLocales() {
        try {
            const donnees = localStorage.getItem(this.configuration.cleStockageLocal);
            if (donnees) {
                const parsed = JSON.parse(donnees);

                // Récupérer les métriques non synchronisées
                if (parsed.metriques && Array.isArray(parsed.metriques)) {
                    this.bufferMetriques = [...parsed.metriques, ...this.bufferMetriques];
                    this.derniereSync = parsed.derniere_sync || Date.now();
                }
            }
        } catch (erreur) {
            this.debug('❌ Erreur récupération locale:', erreur);
        }
    }

    /**
     * Obtient les statistiques actuelles du monitoring
     *
     * @returns {Object} Statistiques complètes
     */
    obtenirStatistiques() {
        return {
            session: {
                id: this.sessionId,
                duree_ms: Math.round(performance.now() - this.tempsDebutSession),
                derniere_sync: new Date(this.derniereSync).toISOString()
            },
            buffer: {
                taille_actuelle: this.bufferMetriques.length,
                taille_maximale: this.configuration.tailleMaximaleBuffer,
                pourcentage_utilise: Math.round((this.bufferMetriques.length / this.configuration.tailleMaximaleBuffer) * 100)
            },
            performance: this.metriquesPerformance,
            configuration: {
                ...this.configuration,
                // Masquer les URLs sensibles en production
                urlSynchronisation: this.configuration.modeDebug ? this.configuration.urlSynchronisation : '[MASKED]'
            }
        };
    }

    /**
     * Active ou désactive le mode debug
     *
     * @param {boolean} actif - État du mode debug
     * @returns {void}
     */
    setModeDebug(actif) {
        this.configuration.modeDebug = actif;
        this.debug(`🔧 Mode debug ${actif ? 'activé' : 'désactivé'}`);
    }

    // === MÉTHODES UTILITAIRES ===

    /**
     * Génère un ID de session unique
     *
     * @private
     * @returns {string} ID de session
     */
    genererIdSession() {
        return 'gd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Détecte le navigateur utilisé
     *
     * @private
     * @returns {string} Nom du navigateur
     */
    detecterNavigateur() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return 'Autre';
    }

    /**
     * Détecte le système d'exploitation
     *
     * @private
     * @returns {string} Nom de l'OS
     */
    detecterOs() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Autre';
    }

    /**
     * Détecte le type de connexion si disponible
     *
     * @private
     * @returns {string} Type de connexion
     */
    detecterTypeConnexion() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'inconnue';
        }
        return 'non_disponible';
    }

    /**
     * Fonction de debounce pour limiter les appels
     *
     * @private
     * @param {Function} func - Fonction à debouncer
     * @param {number} delai - Délai en millisecondes
     * @returns {Function} Fonction debouncée
     */
    debounce(func, delai) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delai);
        };
    }

    /**
     * Affiche un message de debug si le mode est activé
     *
     * @private
     * @param {...any} args - Arguments à afficher
     * @returns {void}
     */
    debug(...args) {
        if (this.configuration.modeDebug) {
            console.log('[🔍 Monitoring GD]', ...args);
        }
    }
}

// === INITIALISATION GLOBALE ===

/**
 * Instance globale du système de monitoring
 * Accessible via window.monitoringGD
 */
window.monitoringGD = null;

/**
 * Initialise le système de monitoring avec la configuration
 *
 * @param {Object} configuration - Configuration personnalisée
 * @returns {MonitoringSystemeGeekDragon} Instance du système
 */
function initMonitoringGeekDragon(configuration = {}) {
    if (window.monitoringGD) {
        console.warn('⚠️ Système de monitoring déjà initialisé');
        return window.monitoringGD;
    }

    // Configuration par défaut basée sur l'environnement
    const configDefaut = {
        modeDebug: window.location.hostname === 'localhost' || window.location.search.includes('debug=1'),
        urlSynchronisation: '/api/monitoring/sync',
        ...configuration
    };

    window.monitoringGD = new MonitoringSystemeGeekDragon(configDefaut);

    // Exposer pour debugging en développement
    if (configDefaut.modeDebug) {
        window.monitoringDebugGD = {
            obtenirStatistiques: () => window.monitoringGD.obtenirStatistiques(),
            synchroniser: () => window.monitoringGD.synchroniserImmediatement(),
            enregistrerTest: (nom, valeur) => window.monitoringGD.enregistrerMetrique(nom, valeur, 'test')
        };

        console.log('🔧 Mode debug monitoring activé. Utilisez window.monitoringDebugGD pour le debugging.');
    }

    return window.monitoringGD;
}

/**
 * Fonctions globales de commodité pour l'usage dans les autres scripts
 */
window.gdMetric = function(nom, valeur, unite = '', tags = {}) {
    if (window.monitoringGD) {
        window.monitoringGD.enregistrerMetrique(nom, valeur, unite, tags);
    }
};

window.gdError = function(erreur, contexte = {}) {
    if (window.monitoringGD) {
        window.monitoringGD.enregistrerErreur(erreur, contexte);
    }
};

window.gdMeasure = function(nom, operation) {
    if (window.monitoringGD) {
        return window.monitoringGD.mesurerPerformance(nom, operation);
    }
    return operation();
};

// Auto-initialisation si DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMonitoringGeekDragon();
    });
} else {
    // DOM déjà chargé
    initMonitoringGeekDragon();
}