/**
 * Chargement Conditionnel Intelligent
 * Charge les ressources selon le contexte de la page
 */
class ConditionalLoader {
    constructor() {
        this.pageType = this.detectPageType();
        this.userAgent = this.detectUserAgent();
        this.connection = this.detectConnection();
    }

    detectPageType() {
        const path = window.location.pathname;
        if (path.includes('boutique')) return 'shop';
        if (path.includes('aide-jeux')) return 'tools';
        if (path.includes('product')) return 'product';
        return 'home';
    }

    detectUserAgent() {
        const ua = navigator.userAgent.toLowerCase();
        return {
            isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua),
            isTablet: /ipad|android(?!.*mobile)/i.test(ua),
            isDesktop: !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
        };
    }

    detectConnection() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                saveData: conn.saveData
            };
        }
        return { effectiveType: '4g' }; // Défaut optimiste
    }

    shouldLoadFeature(feature) {
        const loadingRules = {
            'currency-converter': () => this.pageType === 'tools' || this.pageType === 'shop',
            'coin-optimizer': () => this.pageType === 'tools',
            'boutique-loader': () => this.pageType === 'shop',
            'music-player': () => !this.userAgent.isMobile || this.connection.effectiveType !== '2g',
            'animations': () => this.userAgent.isDesktop && !this.connection.saveData,
            'premium-effects': () => this.userAgent.isDesktop && this.connection.effectiveType === '4g'
        };

        return loadingRules[feature] ? loadingRules[feature]() : true;
    }

    loadCriticalFeatures() {
        // Chargement prioritaire selon le type de page
        const criticalFeatures = {
            'shop': ['snipcart-utils', 'async-stock-loader'],
            'tools': ['currency-converter', 'coin-lot-optimizer'],
            'product': ['snipcart-utils'],
            'home': ['hero-videos']
        };

        const features = criticalFeatures[this.pageType] || [];
        
        features.forEach(feature => {
            if (this.shouldLoadFeature(feature)) {
                const fileName = `${feature}.min.js`;
                window.lazyLoader?.loadModule(feature, fileName);
            }
        });
    }
}

// Démarrage automatique
if (typeof window !== 'undefined') {
    window.conditionalLoader = new ConditionalLoader();
    window.conditionalLoader.loadCriticalFeatures();
}