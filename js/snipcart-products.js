/**
        // Remplacer le texte du bouton
        try {
            button.textContent = (this.currentLanguage === 'fr') ? 'Ajouter à l\\'inventaire' : 'Add to Inventory';
        } catch (e) {}
 * avec personnalisation complÃ¨te selon le thÃ¨me D&D.
 */

class GeeknDragonProducts {
    constructor() {
        this.products = null;
        this.currentLanguage = 'fr';
        
        this.init();
    }

    async init() {
        try {
            // Charger les donnÃ©es produits
            await this.loadProducts();
            
            // Transformer les boutons existants
            this.transformProductButtons();
            
            // Configurer les attributs Snipcart sur tous les produits
            this.setupSnipcartAttributes();
            
            console.log('ð GeeknDragon Products initialized');
        } catch (error) {
            console.error('â Erreur lors de l\'initialisation des produits:', error);
        }
    }

    /**
     * Charge les donnÃ©es produits depuis le JSON
     */
    async loadProducts() {
        const response = await fetch('/data/products.json');
        this.products = await response.json();
    }

    /**
     * Transforme les boutons existants en boutons Snipcart
     */
    transformProductButtons() {
        // Transformer les boutons "DÃ©couvrir" en "Ajouter au Panier"
        const productButtons = document.querySelectorAll('.btn-primary[href="#"]');
        
        productButtons.forEach(button => {
            const productCard = button.closest('.product-card');
            if (productCard) {
                const productId = this.getProductIdFromCard(productCard);
                if (productId && this.products[productId]) {
                    this.convertToSnipcartButton(button, productId);
                }
            }
        });
    }

    /**
     * Identifie le produit depuis sa carte
     */
    getProductIdFromCard(card) {
        // Chercher l'ID via data-product-id ou via le contenu
        const dataId = card.dataset.productId;
        if (dataId) return dataId;

        // Identification par nom de produit
        const nameElement = card.querySelector('.product-name, h3, h4');
        if (nameElement) {
            const name = nameElement.textContent.trim();
            return this.findProductByName(name);
        }

        // Identification par prix
        const priceElement = card.querySelector('.price');
        if (priceElement) {
            const price = this.extractPrice(priceElement.textContent);
            return this.findProductByPrice(price);
        }

        return null;
    }

    /**
     * Trouve un produit par son nom
     */
    findProductByName(name) {
        for (const [id, product] of Object.entries(this.products)) {
            if (name.includes(product.name) || name.includes(product.name_en)) {
                return id;
            }
        }
        return null;
    }

    /**
     * Trouve un produit par son prix
     */
    findProductByPrice(price) {
        for (const [id, product] of Object.entries(this.products)) {
            if (Math.abs(product.price - price) < 0.01) {
                return id;
            }
        }
        return null;
    }

    /**
     * Extrait le prix numÃ©rique d'une chaÃ®ne
     */
    extractPrice(priceText) {
        const match = priceText.match(/(\d+(?:\.\d{2})?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    /**
     * Convertit un bouton standard en bouton Snipcart
     */
    convertToSnipcartButton(button, productId) {
        const product = this.products[productId];
        const lang = this.currentLanguage;

        // Remplacer le texte du bouton
        button.textContent = lang === 'fr' ? 
            'âï¸ Ajouter Ã  mon Sac' : 
            'âï¸ Add to my Bag';
        
        // Supprimer href et ajouter les attributs Snipcart
        button.removeAttribute('href');
        button.classList.add('snipcart-add-item');
        
        // Attributs Snipcart de base
        this.setSnipcartAttributes(button, productId, product);
        
        // Ajouter classe pour styling personnalisÃ©
        button.classList.add('gd-add-to-cart');
        
        // Event listener pour tracking
        button.addEventListener('click', (e) => {
            this.trackAddToCart(productId, product);
        });
    }

    /**
     * Configure les attributs Snipcart sur un Ã©lÃ©ment
     */
    setSnipcartAttributes(element, productId, product) {
        const lang = this.currentLanguage;
        const name = lang === 'fr' ? product.name : product.name_en;
        const description = lang === 'fr' ? product.description : product.description_en;
        
        // Attributs obligatoires
        element.setAttribute('data-item-id', productId);
        element.setAttribute('data-item-price', product.price.toFixed(2));
        element.setAttribute('data-item-url', window.location.origin + '/api/products/' + productId);
        element.setAttribute('data-item-name', name);
        
        // Attributs optionnels
        if (description) {
            // Nettoyer la description HTML pour Snipcart
            const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 200);
            element.setAttribute('data-item-description', cleanDesc);
        }
        
        if (product.images && product.images.length > 0) {
            element.setAttribute('data-item-image', window.location.origin + product.images[0]);
        }
        
        element.setAttribute('data-item-currency', 'CAD');
        element.setAttribute('data-item-weight', this.getProductWeight(productId));
        element.setAttribute('data-item-shipping', this.getShippingCategory(productId));
        
        // Variantes personnalisÃ©es (multiplicateurs, langues, etc.)
        this.addCustomFields(element, product);
    }

    /**
     * Ajoute les champs personnalisÃ©s (variantes) Ã  un produit
     */
    addCustomFields(element, product) {
        let customFields = [];

        // Multiplicateurs pour les piÃ¨ces
        if (product.multipliers && product.multipliers.length > 0) {
            element.setAttribute('data-item-custom1-name', 'Multiplicateur');
            element.setAttribute('data-item-custom1-options', 
                product.multipliers.join('|'));
            element.setAttribute('data-item-custom1-value', product.multipliers[0]);
        }

        // Choix de langue pour les cartes
        if (product.languages && product.languages.length > 0) {
            const langField = product.multipliers ? 'custom2' : 'custom1';
            element.setAttribute(`data-item-${langField}-name`, 'Langue');
            element.setAttribute(`data-item-${langField}-options`, 
                product.languages.join('|'));
            element.setAttribute(`data-item-${langField}-value`, product.languages[0]);
        }

        // CatÃ©gorie pour l'organisation
        if (product.category) {
            element.setAttribute('data-item-categories', product.category);
        }
    }

    /**
     * DÃ©termine le poids d'un produit pour les frais de port
     */
    getProductWeight(productId) {
        const weights = {
            'lot10': 150,        // 10 piÃ¨ces mÃ©talliques
            'lot25': 350,        // 25 piÃ¨ces mÃ©talliques
            'lot50-essence': 700, // 50 piÃ¨ces mÃ©talliques
            'lot50-tresorerie': 700, // 50 piÃ¨ces mÃ©talliques
            'pack-182-arsenal-aventurier': 300,    // 182 cartes
            'pack-182-butins-ingenieries': 300,    // 182 cartes
            'pack-182-routes-services': 300,       // 182 cartes
            'triptyque-aleatoire': 200 // Triptyques + cartes + piÃ¨ces
        };
        
        return weights[productId] || 100; // Poids par dÃ©faut 100g
    }

    /**
     * DÃ©termine la catÃ©gorie d'expÃ©dition
     */
    getShippingCategory(productId) {
        if (productId.startsWith('lot')) {
            return 'coins'; // PiÃ¨ces mÃ©talliques
        } else if (productId.startsWith('pack-182')) {
            return 'cards'; // Cartes
        } else if (productId.startsWith('triptyque')) {
            return 'triptychs'; // Triptyques
        }
        return 'standard';
    }

    /**
     * Configure tous les attributs Snipcart sur la page
     */
    setupSnipcartAttributes() {
        // Ajouter l'API key et la configuration de base
        if (!document.querySelector('script[data-api-key]')) {
            this.addSnipcartScript();
        }

        // Configurer les variantes de produits existantes
        this.setupProductVariants();
        
        // Configurer les liens directs vers les produits
        this.setupDirectProductLinks();
    }

    /**
     * Ajoute le script Snipcart si pas dÃ©jÃ  prÃ©sent
     */
    addSnipcartScript() {
        // Variables d'environnement (Ã  dÃ©finir dans votre .env)
        const apiKey = window.SNIPCART_API_KEY || 'pk_test_your_key_here';
        
        // Div hidden pour Snipcart
        let snipcartDiv = document.getElementById('snipcart');
        if (!snipcartDiv) {
            snipcartDiv = document.createElement('div');
            snipcartDiv.id = 'snipcart';
            snipcartDiv.setAttribute('data-api-key', apiKey);
            snipcartDiv.setAttribute('data-config-modal-style', 'side');
            snipcartDiv.setAttribute('data-config-add-product-behavior', 'none');
            snipcartDiv.style.display = 'none';
            document.body.appendChild(snipcartDiv);
        }
    }

    /**
     * Configure les variantes de produits
     */
    setupProductVariants() {
        // Gestion des sÃ©lecteurs de multiplicateurs
        const multiplierSelects = document.querySelectorAll('[data-product-multiplier]');
        multiplierSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateProductVariant(e.target);
            });
        });

        // Gestion des sÃ©lecteurs de langue
        const languageSelects = document.querySelectorAll('[data-product-language]');
        languageSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateProductLanguage(e.target);
            });
        });
    }

    /**
     * Met Ã  jour les variantes d'un produit
     */
    updateProductVariant(selectElement) {
        const productCard = selectElement.closest('.product-card');
        const addButton = productCard?.querySelector('.snipcart-add-item');
        
        if (addButton) {
            const newValue = selectElement.value;
            addButton.setAttribute('data-item-custom1-value', newValue);
        }
    }

    /**
     * Met Ã  jour la langue d'un produit
     */
    updateProductLanguage(selectElement) {
        const productCard = selectElement.closest('.product-card');
        const addButton = productCard?.querySelector('.snipcart-add-item');
        
        if (addButton) {
            const newLanguage = selectElement.value;
            const customField = addButton.hasAttribute('data-item-custom1-name') ? 'custom2' : 'custom1';
            addButton.setAttribute(`data-item-${customField}-value`, newLanguage);
        }
    }

    /**
     * Retrouve l'identifiant produit à partir d'un slug public
     *
     * @param {string|null} slug Slug provenant de l'URL
     * @returns {string|null} Identifiant du produit si trouvé
     */
    findProductIdBySlug(slug) {
        if (!slug || !this.products) {
            return null;
        }

        const normalizedSlug = slug.toLowerCase();

        for (const [id, product] of Object.entries(this.products)) {
            const productSlug = (product.slug || '').toLowerCase();
            if (productSlug === normalizedSlug) {
                return id;
            }

            const legacySlugs = Array.isArray(product.legacy_slugs) ? product.legacy_slugs : [];
            for (const legacySlug of legacySlugs) {
                if (String(legacySlug).toLowerCase() === normalizedSlug) {
                    return id;
                }
            }
        }

        return null;
    }

    /**
     * Configure les liens directs vers les pages de produits
     */
    setupDirectProductLinks() {
        const currentUrl = new URL(window.location.href);
        const normalizedPath = currentUrl.pathname.replace(/\/+$/, '') || '/';
        let productId = null;

        // Pages dynamiques actuelles
        if (normalizedPath === '/product' || normalizedPath === '/product.php') {
            productId = currentUrl.searchParams.get('id');
        }

        // Routes raccourcies de type /lot10
        if (!productId) {
            const directCandidate = normalizedPath.replace(/^\/+/, '');
            if (directCandidate && this.products && this.products[directCandidate]) {
                productId = directCandidate;
            }
        }

        // Alias générés produit-<slug>
        if (!productId) {
            const slugMatch = normalizedPath.match(/^\/produit-([a-z0-9-]+)(?:\.php)?$/i);
            if (slugMatch) {
                productId = this.findProductIdBySlug(slugMatch[1]);
            }
        }

        // Compatibilité résiduelle avec les anciens fichiers .php ou .html
        if (!productId) {
            const legacyMatch = normalizedPath.match(/^\/([a-z0-9-]+)\.(?:php|html)$/i);
            if (legacyMatch) {
                const candidate = legacyMatch[1];
                if (this.products && this.products[candidate]) {
                    productId = candidate;
                } else {
                    productId = this.findProductIdBySlug(candidate);
                }
            }
        }

        if (productId && this.products && this.products[productId]) {
            this.setupSingleProductPage(productId);
        }
    }

    /**
     * Configure une page de produit individuelle
     */
    setupSingleProductPage(productId) {
        const product = this.products[productId];
        if (!product) return;

        // Remplacer tous les boutons d'achat sur la page
        const buyButtons = document.querySelectorAll('.btn-primary, .cta-primary');
        buyButtons.forEach(button => {
            if (button.textContent.includes('Acheter') || 
                button.textContent.includes('Commander') ||
                button.textContent.includes('Ajouter')) {
                
                this.convertToSnipcartButton(button, productId);
            }
        });

        // Mettre Ã  jour les mÃ©tadonnÃ©es de la page
        this.updatePageMeta(product);
    }

    /**
     * Met Ã  jour les mÃ©tadonnÃ©es de la page
     */
    updatePageMeta(product) {
        const lang = this.currentLanguage;
        
        // Structured data pour SEO
        const structuredData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": lang === 'fr' ? product.name : product.name_en,
            "description": lang === 'fr' ? product.summary : product.summary_en,
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "CAD",
                "price": product.price,
                "availability": "https://schema.org/InStock"
            },
            "brand": {
                "@type": "Brand",
                "name": "Geek&Dragon"
            }
        };

        if (product.images && product.images.length > 0) {
            structuredData.image = product.images.map(img => 
                img.startsWith('http') ? img : window.location.origin + img
            );
        }

        // Injecter le script JSON-LD
        let scriptElement = document.getElementById('product-structured-data');
        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = 'product-structured-data';
            scriptElement.type = 'application/ld+json';
            document.head.appendChild(scriptElement);
        }
        
        scriptElement.textContent = JSON.stringify(structuredData, null, 2);
    }

    /**
     * Tracking des ajouts au panier
     */
    trackAddToCart(productId, product) {
        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'add_to_cart', {
                currency: 'CAD',
                value: product.price,
                items: [{
                    item_id: productId,
                    item_name: product.name,
                    item_category: product.category || 'accessories',
                    price: product.price,
                    quantity: 1
                }]
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'AddToCart', {
                content_ids: [productId],
                content_type: 'product',
                value: product.price,
                currency: 'CAD'
            });
        }

        console.log(`ð Produit ajoutÃ© au panier: ${product.name} - ${product.price}$ CAD`);
    }

    /**
     * Changer la langue de l'interface
     */
    switchLanguage(newLang) {
        if (newLang !== this.currentLanguage) {
            this.currentLanguage = newLang;
            this.refreshProductDisplay();
        }
    }

    /**
     * RafraÃ®chit l'affichage des produits selon la langue
     */
    refreshProductDisplay() {
        // Re-transformer les boutons avec la nouvelle langue
        this.transformProductButtons();
        
        // Mettre Ã  jour les textes de boutons existants
        const cartButtons = document.querySelectorAll('.gd-add-to-cart');
        cartButtons.forEach(button => {
            button.textContent = this.currentLanguage === 'fr' ? 
                'âï¸ Ajouter Ã  mon Sac' : 
                'âï¸ Add to my Bag';
        });
    }
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.geeknDragonProducts = new GeeknDragonProducts();
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeeknDragonProducts;
}
