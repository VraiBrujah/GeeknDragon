/**
 * 🚀 SEO AVANCÉ ET ACCESSIBILITÉ - GEEKNDRAGON
 * Optimisation intelligente pour les moteurs de recherche et expérience utilisateur inclusive
 */

(function() {
  'use strict';

  class AdvancedSEOAccessibility {
    constructor() {
      this.config = {
        enableStructuredData: true,
        enableBreadcrumbs: true,
        enableSkipLinks: true,
        enableAriaEnhancements: true,
        enableFocusManagement: true,
        enableScreenReaderOptimizations: true,
        enableKeyboardNavigation: true,
        enableLanguageManagement: true,
        enableSocialSharing: true,
        autoGenerateAltText: true
      };

      this.structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Geek & Dragon',
        'url': 'https://geekndragon.com',
        'logo': 'https://geekndragon.com/images/optimized-modern/webp/brand-geekndragon-main.webp',
        'description': 'Aides de jeu physiques pour D&D : pièces métalliques, cartes d\'équipement et triptyques de personnage. Fabriqué au Québec.',
        'foundingDate': '2024',
        'foundingLocation': {
          '@type': 'Place',
          'name': 'Québec, Canada'
        },
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+1-438-764-2612',
          'contactType': 'Customer Service',
          'email': 'contact@geekndragon.com',
          'availableLanguage': ['French', 'English']
        },
        'sameAs': [
          'https://discord.gg/VaPZtZFC'
        ],
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Aides de jeu D&D',
          'itemListElement': []
        }
      };

      this.breadcrumbPath = [];
      this.focusHistory = [];
      this.currentLanguage = 'fr';
      
      this.init();
    }

    async init() {
      // Détection de la langue actuelle
      this.detectCurrentLanguage();
      
      // Génération du JSON-LD structuré
      this.generateStructuredData();
      
      // Amélioration des méta-données
      this.enhanceMetadata();
      
      // Génération des breadcrumbs
      this.generateBreadcrumbs();
      
      // Liens de saut d'accessibilité
      this.addSkipLinks();
      
      // Améliorations ARIA
      this.enhanceARIA();
      
      // Gestion du focus et navigation clavier
      this.setupFocusManagement();
      
      // Optimisations pour lecteurs d'écran
      this.setupScreenReaderOptimizations();
      
      // Amélioration des images (alt text automatique)
      this.enhanceImages();
      
      // Partage social optimisé
      this.setupSocialSharing();
      
      // Monitoring des métriques SEO
      this.startSEOMonitoring();

      console.log('🚀 SEO Avancé et Accessibilité initialisés');
    }

    detectCurrentLanguage() {
      // Détecter depuis l'attribut lang ou URL
      this.currentLanguage = document.documentElement.lang || 
                            (window.location.pathname.includes('/en/') ? 'en' : 'fr');
    }

    generateStructuredData() {
      if (!this.config.enableStructuredData) return;

      // Schema Organization de base
      this.addStructuredData('organization', this.structuredData);

      // Schema spécifique selon la page
      const path = window.location.pathname;
      
      if (path === '/' || path === '/index.php') {
        this.addWebsiteSchema();
      } else if (path.includes('boutique')) {
        this.addShopSchema();
      } else if (path.includes('product') || this.isProductPage()) {
        this.addProductSchema();
      }

      // FAQ Schema si applicable
      this.addFAQSchema();
      
      // BreadcrumbList Schema
      this.addBreadcrumbSchema();
    }

    addStructuredData(type, data) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data, null, 2);
      document.head.appendChild(script);
      
      console.log(`📋 Schema ${type} ajouté`);
    }

    addWebsiteSchema() {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Geek & Dragon',
        'url': 'https://geekndragon.com',
        'description': 'Aides de jeu physiques pour D&D fabriquées au Québec',
        'inLanguage': ['fr-CA', 'en-CA'],
        'potentialAction': [
          {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': 'https://geekndragon.com/boutique.php?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
          }
        ],
        'publisher': this.structuredData
      };

      this.addStructuredData('website', websiteSchema);
    }

    addShopSchema() {
      const products = this.extractProductsFromPage();
      
      const catalogSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': this.currentLanguage === 'fr' ? 'Boutique - Aides de jeu D&D' : 'Shop - D&D Game Aids',
        'description': this.currentLanguage === 'fr' ? 
          'Découvrez notre collection de pièces métalliques, cartes d\'équipement et triptyques pour vos parties de D&D' :
          'Discover our collection of metal coins, equipment cards and triptychs for your D&D games',
        'url': window.location.href,
        'mainEntity': {
          '@type': 'ItemList',
          'itemListElement': products.map((product, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': product
          }))
        }
      };

      this.addStructuredData('catalog', catalogSchema);
    }

    addProductSchema() {
      const productData = this.extractCurrentProductData();
      if (!productData) return;

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': productData.name,
        'description': productData.description,
        'image': productData.images,
        'sku': productData.id,
        'brand': {
          '@type': 'Brand',
          'name': 'Geek & Dragon'
        },
        'manufacturer': {
          '@type': 'Organization',
          'name': 'Geek & Dragon',
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'CA',
            'addressRegion': 'QC'
          }
        },
        'offers': {
          '@type': 'Offer',
          'price': productData.price,
          'priceCurrency': 'CAD',
          'availability': productData.availability,
          'seller': this.structuredData,
          'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        'category': 'Tabletop Gaming Accessories',
        'audience': {
          '@type': 'Audience',
          'name': 'Tabletop RPG Players'
        },
        'additionalProperty': [
          {
            '@type': 'PropertyValue',
            'name': 'Made In',
            'value': 'Quebec, Canada'
          },
          {
            '@type': 'PropertyValue',
            'name': 'Game System',
            'value': 'Dungeons & Dragons'
          }
        ]
      };

      // Ajouter les variations si applicable
      if (productData.variations && productData.variations.length > 0) {
        productSchema.model = productData.variations.map(variation => ({
          '@type': 'ProductModel',
          'name': `${productData.name} - ${variation.name}`,
          'offers': {
            '@type': 'Offer',
            'price': productData.price + (variation.priceModifier || 0),
            'priceCurrency': 'CAD',
            'availability': productData.availability
          }
        }));
      }

      this.addStructuredData('product', productSchema);
    }

    addFAQSchema() {
      // FAQ communes pour le site
      const faqs = [
        {
          question: this.currentLanguage === 'fr' ? 
            'Qu\'est-ce que les multiplicateurs sur les pièces ?' :
            'What are the multipliers on the coins?',
          answer: this.currentLanguage === 'fr' ?
            'Les multiplicateurs (x10, x100, x1000, x10000) sont gravés sur les pièces pour faciliter les calculs monétaires en jeu, tout en gardant l\'immersion physique.' :
            'Multipliers (x10, x100, x1000, x10000) are engraved on coins to facilitate monetary calculations in-game while maintaining physical immersion.'
        },
        {
          question: this.currentLanguage === 'fr' ?
            'Les produits sont-ils vraiment fabriqués au Québec ?' :
            'Are the products really made in Quebec?',
          answer: this.currentLanguage === 'fr' ?
            'Oui, tous nos produits sont conçus et fabriqués au Québec avec des matériaux de qualité premium.' :
            'Yes, all our products are designed and manufactured in Quebec with premium quality materials.'
        },
        {
          question: this.currentLanguage === 'fr' ?
            'Combien de temps prend la livraison ?' :
            'How long does shipping take?',
          answer: this.currentLanguage === 'fr' ?
            'Nous expédions sous 48h partout au Canada avec suivi en temps réel.' :
            'We ship within 48h across Canada with real-time tracking.'
        }
      ];

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      };

      this.addStructuredData('faq', faqSchema);
    }

    addBreadcrumbSchema() {
      if (this.breadcrumbPath.length === 0) return;

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': this.breadcrumbPath.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'item': item.url
        }))
      };

      this.addStructuredData('breadcrumb', breadcrumbSchema);
    }

    enhanceMetadata() {
      // Améliorer les meta tags existants
      this.optimizeMetaTags();
      
      // Ajouter les meta tags manquants
      this.addMissingMetaTags();
      
      // Optimiser les Open Graph tags
      this.optimizeOpenGraph();
      
      // Ajouter les Twitter Card tags
      this.optimizeTwitterCards();
    }

    optimizeMetaTags() {
      // Meta description optimisée selon la page
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && !metaDescription.content) {
        metaDescription.content = this.generatePageDescription();
      }

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = this.getCanonicalURL();
        document.head.appendChild(canonical);
      }
    }

    addMissingMetaTags() {
      const metaTags = [
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },
        { name: 'author', content: 'Geek & Dragon' },
        { name: 'theme-color', content: '#8b5cf6' },
        { name: 'msapplication-TileColor', content: '#8b5cf6' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }
      ];

      metaTags.forEach(tag => {
        const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[http-equiv="${tag['http-equiv']}"]`;
        if (!document.querySelector(selector)) {
          const meta = document.createElement('meta');
          if (tag.name) meta.name = tag.name;
          if (tag['http-equiv']) meta.setAttribute('http-equiv', tag['http-equiv']);
          meta.content = tag.content;
          document.head.appendChild(meta);
        }
      });
    }

    optimizeOpenGraph() {
      const ogTags = {
        'og:site_name': 'Geek & Dragon',
        'og:locale': this.currentLanguage === 'fr' ? 'fr_CA' : 'en_CA',
        'og:type': this.isProductPage() ? 'product' : 'website'
      };

      // Ajouter des tags spécifiques aux produits
      if (this.isProductPage()) {
        const productData = this.extractCurrentProductData();
        if (productData) {
          ogTags['product:brand'] = 'Geek & Dragon';
          ogTags['product:availability'] = 'in stock';
          ogTags['product:condition'] = 'new';
          ogTags['product:price:amount'] = productData.price;
          ogTags['product:price:currency'] = 'CAD';
        }
      }

      Object.entries(ogTags).forEach(([property, content]) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          meta.content = content;
          document.head.appendChild(meta);
        } else if (!meta.content) {
          meta.content = content;
        }
      });
    }

    optimizeTwitterCards() {
      const twitterTags = {
        'twitter:site': '@GeekAndDragon',
        'twitter:creator': '@GeekAndDragon',
        'twitter:domain': 'geekndragon.com'
      };

      Object.entries(twitterTags).forEach(([name, content]) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
        }
      });
    }

    generateBreadcrumbs() {
      if (!this.config.enableBreadcrumbs) return;

      const path = window.location.pathname;
      this.breadcrumbPath = [
        { name: this.currentLanguage === 'fr' ? 'Accueil' : 'Home', url: '/' }
      ];

      if (path.includes('boutique')) {
        this.breadcrumbPath.push({
          name: this.currentLanguage === 'fr' ? 'Boutique' : 'Shop',
          url: '/boutique.php'
        });
      }

      if (this.isProductPage()) {
        const productData = this.extractCurrentProductData();
        if (productData) {
          this.breadcrumbPath.push({
            name: productData.name,
            url: window.location.pathname
          });
        }
      }

      // Générer le HTML des breadcrumbs
      this.renderBreadcrumbs();
    }

    renderBreadcrumbs() {
      if (this.breadcrumbPath.length <= 1) return;

      const breadcrumbContainer = document.createElement('nav');
      breadcrumbContainer.setAttribute('aria-label', 
        this.currentLanguage === 'fr' ? 'Fil d\'Ariane' : 'Breadcrumb');
      breadcrumbContainer.className = 'breadcrumb-navigation';
      
      const breadcrumbList = document.createElement('ol');
      breadcrumbList.className = 'breadcrumb-list';

      this.breadcrumbPath.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';

        if (index === this.breadcrumbPath.length - 1) {
          // Dernier élément (page actuelle)
          listItem.innerHTML = `<span aria-current="page">${item.name}</span>`;
        } else {
          listItem.innerHTML = `<a href="${item.url}">${item.name}</a>`;
          if (index < this.breadcrumbPath.length - 1) {
            listItem.innerHTML += `<span class="breadcrumb-separator" aria-hidden="true"> / </span>`;
          }
        }

        breadcrumbList.appendChild(listItem);
      });

      breadcrumbContainer.appendChild(breadcrumbList);

      // Insérer après le header
      const main = document.querySelector('main');
      if (main) {
        main.insertBefore(breadcrumbContainer, main.firstChild);
      }
    }

    addSkipLinks() {
      if (!this.config.enableSkipLinks) return;

      const skipLinks = [
        { href: '#main', text: this.currentLanguage === 'fr' ? 'Aller au contenu principal' : 'Skip to main content' },
        { href: '#navigation', text: this.currentLanguage === 'fr' ? 'Aller à la navigation' : 'Skip to navigation' },
        { href: '#footer', text: this.currentLanguage === 'fr' ? 'Aller au pied de page' : 'Skip to footer' }
      ];

      const skipContainer = document.createElement('div');
      skipContainer.className = 'skip-links';
      skipContainer.setAttribute('aria-label', 
        this.currentLanguage === 'fr' ? 'Liens de navigation rapide' : 'Skip navigation links');

      skipLinks.forEach(link => {
        const skipLink = document.createElement('a');
        skipLink.href = link.href;
        skipLink.className = 'skip-link';
        skipLink.textContent = link.text;
        skipContainer.appendChild(skipLink);
      });

      document.body.insertBefore(skipContainer, document.body.firstChild);
    }

    enhanceARIA() {
      if (!this.config.enableAriaEnhancements) return;

      // Améliorer les landmarks
      this.enhanceLandmarks();
      
      // Améliorer les formulaires
      this.enhanceForms();
      
      // Améliorer les boutons et liens
      this.enhanceInteractiveElements();
      
      // Améliorer la navigation
      this.enhanceNavigation();
      
      // États et propriétés ARIA dynamiques
      this.setupDynamicARIA();
    }

    enhanceLandmarks() {
      // S'assurer que tous les landmarks ont des labels appropriés
      const landmarks = {
        'header': this.currentLanguage === 'fr' ? 'En-tête principal' : 'Main header',
        'nav': this.currentLanguage === 'fr' ? 'Navigation principale' : 'Main navigation',
        'main': this.currentLanguage === 'fr' ? 'Contenu principal' : 'Main content',
        'footer': this.currentLanguage === 'fr' ? 'Pied de page' : 'Footer',
        'aside': this.currentLanguage === 'fr' ? 'Contenu complémentaire' : 'Complementary content'
      };

      Object.entries(landmarks).forEach(([tag, label]) => {
        const elements = document.querySelectorAll(tag);
        elements.forEach((element, index) => {
          if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            element.setAttribute('aria-label', 
              elements.length > 1 ? `${label} ${index + 1}` : label);
          }
        });
      });
    }

    enhanceForms() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        // Ajouter des labels manquants
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (!input.getAttribute('aria-label') && 
              !input.getAttribute('aria-labelledby') && 
              !form.querySelector(`label[for="${input.id}"]`)) {
            
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
              input.setAttribute('aria-label', placeholder);
            }
          }

          // Ajouter des descriptions d'erreur
          if (input.hasAttribute('required') && !input.getAttribute('aria-describedby')) {
            const errorId = `${input.id || 'input'}-error`;
            input.setAttribute('aria-describedby', errorId);
            
            // Créer l'élément d'erreur s'il n'existe pas
            if (!document.getElementById(errorId)) {
              const errorDiv = document.createElement('div');
              errorDiv.id = errorId;
              errorDiv.className = 'sr-only error-message';
              errorDiv.setAttribute('aria-live', 'polite');
              input.parentNode.appendChild(errorDiv);
            }
          }
        });
      });
    }

    enhanceInteractiveElements() {
      // Améliorer les boutons sans texte
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        if (!button.textContent.trim() && 
            !button.getAttribute('aria-label') && 
            !button.getAttribute('aria-labelledby')) {
          
          // Essayer de déduire le label du contexte
          const icon = button.querySelector('svg, .icon');
          if (icon) {
            const action = button.classList.contains('close') ? 
              (this.currentLanguage === 'fr' ? 'Fermer' : 'Close') :
              button.classList.contains('menu') ?
              (this.currentLanguage === 'fr' ? 'Menu' : 'Menu') :
              (this.currentLanguage === 'fr' ? 'Bouton' : 'Button');
            
            button.setAttribute('aria-label', action);
          }
        }
      });

      // Améliorer les liens sans texte
      const links = document.querySelectorAll('a:empty, a:not([aria-label]):not([aria-labelledby])');
      links.forEach(link => {
        if (!link.textContent.trim()) {
          const img = link.querySelector('img');
          if (img && img.alt) {
            link.setAttribute('aria-label', img.alt);
          }
        }
      });
    }

    enhanceNavigation() {
      // Marquer les liens de navigation actuels
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('nav a');
      
      navLinks.forEach(link => {
        if (link.pathname === currentPath) {
          link.setAttribute('aria-current', 'page');
        }
      });

      // Améliorer les menus déroulants
      const dropdownTriggers = document.querySelectorAll('[data-dropdown], .dropdown-trigger');
      dropdownTriggers.forEach(trigger => {
        if (!trigger.getAttribute('aria-haspopup')) {
          trigger.setAttribute('aria-haspopup', 'menu');
        }
        if (!trigger.getAttribute('aria-expanded')) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    setupDynamicARIA() {
      // Observer les changements d'état pour mettre à jour ARIA
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            this.updateARIAStates(mutation.target);
          }
        });
      });

      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'hidden']
      });
    }

    updateARIAStates(element) {
      // Mettre à jour aria-expanded pour les éléments avec toggles
      if (element.classList.contains('open') || element.classList.contains('active')) {
        if (element.hasAttribute('aria-expanded')) {
          element.setAttribute('aria-expanded', 'true');
        }
      } else if (element.hasAttribute('aria-expanded')) {
        element.setAttribute('aria-expanded', 'false');
      }

      // Mettre à jour aria-hidden pour les éléments masqués
      if (element.style.display === 'none' || element.hidden) {
        element.setAttribute('aria-hidden', 'true');
      } else if (element.hasAttribute('aria-hidden')) {
        element.removeAttribute('aria-hidden');
      }
    }

    setupFocusManagement() {
      if (!this.config.enableFocusManagement) return;

      // Gestion du focus pour les modals
      this.setupModalFocusTraps();
      
      // Navigation au clavier améliorée
      this.setupKeyboardNavigation();
      
      // Indicateurs de focus visuels
      this.setupFocusIndicators();
      
      // Historique du focus pour les modals
      this.trackFocusHistory();
    }

    setupModalFocusTraps() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const modal = document.querySelector('.gd-product-customizer.active, .modal.active');
          if (modal) {
            this.trapFocus(e, modal);
          }
        }
      });
    }

    trapFocus(event, container) {
      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    setupKeyboardNavigation() {
      // Navigation avec les flèches dans les grilles de produits
      document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          const productGrid = e.target.closest('.products-grid, .multiplier-grid');
          if (productGrid) {
            this.handleGridNavigation(e, productGrid);
          }
        }

        // Raccourcis clavier globaux
        if (e.altKey) {
          switch (e.key) {
            case 's':
              e.preventDefault();
              window.location.href = '/boutique.php';
              break;
            case 'h':
              e.preventDefault();
              window.location.href = '/';
              break;
          }
        }
      });
    }

    handleGridNavigation(event, grid) {
      const items = Array.from(grid.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'));
      const currentIndex = items.indexOf(document.activeElement);
      
      if (currentIndex === -1) return;

      const columns = this.getGridColumns(grid);
      let newIndex;

      switch (event.key) {
        case 'ArrowLeft':
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
          newIndex = currentIndex - columns;
          if (newIndex < 0) newIndex = currentIndex;
          break;
        case 'ArrowDown':
          newIndex = currentIndex + columns;
          if (newIndex >= items.length) newIndex = currentIndex;
          break;
      }

      if (newIndex !== undefined && items[newIndex]) {
        event.preventDefault();
        items[newIndex].focus();
      }
    }

    setupFocusIndicators() {
      // Styles de focus améliorés via CSS
      const focusStyles = `
        <style>
        /* Focus indicators améliorés */
        .enhanced-focus-indicators {
          --focus-color: #8b5cf6;
          --focus-width: 2px;
          --focus-offset: 2px;
        }

        .enhanced-focus-indicators *:focus {
          outline: var(--focus-width) solid var(--focus-color);
          outline-offset: var(--focus-offset);
          position: relative;
          z-index: 1;
        }

        .enhanced-focus-indicators button:focus,
        .enhanced-focus-indicators .btn:focus {
          outline: none;
          box-shadow: 0 0 0 var(--focus-width) var(--focus-color),
                      0 0 0 calc(var(--focus-width) + 2px) rgba(139, 92, 246, 0.2);
        }

        .enhanced-focus-indicators .product-card:focus-within {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
                      0 0 0 2px var(--focus-color);
        }

        /* Skip links */
        .skip-link {
          position: absolute;
          top: -100px;
          left: 8px;
          background: var(--focus-color);
          color: white;
          padding: 8px 12px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          z-index: 9999;
          transition: top 0.2s ease;
        }

        .skip-link:focus {
          top: 8px;
        }

        /* Breadcrumbs */
        .breadcrumb-navigation {
          padding: 1rem 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .breadcrumb-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
        }

        .breadcrumb-item a {
          color: #8b5cf6;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-item a:hover,
        .breadcrumb-item a:focus {
          color: #7c3aed;
          text-decoration: underline;
        }

        .breadcrumb-separator {
          margin: 0 0.25rem;
          color: #94a3b8;
        }

        /* Annonces d'accessibilité */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          background: var(--focus-color);
          color: white;
          border-radius: 4px;
          z-index: 9999;
        }
        </style>
      `;

      document.head.insertAdjacentHTML('beforeend', focusStyles);
      document.body.classList.add('enhanced-focus-indicators');
    }

    trackFocusHistory() {
      let lastFocusedElement = null;

      document.addEventListener('focusin', (e) => {
        if (lastFocusedElement && !e.target.closest('.modal, .gd-product-customizer')) {
          this.focusHistory.push(lastFocusedElement);
          
          // Garder seulement les 10 derniers éléments
          if (this.focusHistory.length > 10) {
            this.focusHistory = this.focusHistory.slice(-10);
          }
        }
        lastFocusedElement = e.target;
      });

      // Restaurer le focus après fermeture de modal
      document.addEventListener('modal-closed', () => {
        const lastElement = this.focusHistory.pop();
        if (lastElement && document.contains(lastElement)) {
          setTimeout(() => lastElement.focus(), 100);
        }
      });
    }

    setupScreenReaderOptimizations() {
      if (!this.config.enableScreenReaderOptimizations) return;

      // Annonces en direct pour les changements d'état
      this.createLiveRegions();
      
      // Amélioration des descriptions d'images
      this.enhanceImageDescriptions();
      
      // Textes contextuels pour les actions
      this.addContextualTexts();
      
      // Optimisation des listes et tableaux
      this.optimizeDataStructures();
    }

    createLiveRegions() {
      // Zone d'annonces polies
      const politeRegion = document.createElement('div');
      politeRegion.id = 'live-region-polite';
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      document.body.appendChild(politeRegion);

      // Zone d'annonces assertives
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'live-region-assertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);

      // Fonction utilitaire pour annoncer
      window.announceToScreenReader = (message, assertive = false) => {
        const region = assertive ? assertiveRegion : politeRegion;
        region.textContent = '';
        setTimeout(() => {
          region.textContent = message;
        }, 100);
      };
    }

    enhanceImageDescriptions() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt) {
          // Générer un alt text basique depuis le nom de fichier
          const filename = img.src.split('/').pop().split('.')[0];
          const altText = filename.replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .toLowerCase();
          img.alt = altText;
        }

        // Ajouter des descriptions longues si nécessaire
        if (img.closest('.product-card') && !img.getAttribute('aria-describedby')) {
          const description = img.closest('.product-card').querySelector('.product-description');
          if (description && description.id) {
            img.setAttribute('aria-describedby', description.id);
          }
        }
      });
    }

    addContextualTexts() {
      // Ajouter du contexte aux boutons d'action
      const addToCartButtons = document.querySelectorAll('.gd-add-to-cart, .add-to-cart-btn');
      addToCartButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        if (productCard) {
          const productName = productCard.querySelector('.product-title, .product-name')?.textContent?.trim();
          if (productName && !button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', 
              `${this.currentLanguage === 'fr' ? 'Ajouter' : 'Add'} ${productName} ${this.currentLanguage === 'fr' ? 'au panier' : 'to cart'}`
            );
          }
        }
      });

      // Contexte pour les contrôles de quantité
      const quantityButtons = document.querySelectorAll('.quantity-btn');
      quantityButtons.forEach(button => {
        const action = button.classList.contains('plus') ? 
          (this.currentLanguage === 'fr' ? 'Augmenter' : 'Increase') :
          (this.currentLanguage === 'fr' ? 'Diminuer' : 'Decrease');
        
        if (!button.getAttribute('aria-label')) {
          button.setAttribute('aria-label', 
            `${action} ${this.currentLanguage === 'fr' ? 'la quantité' : 'quantity'}`
          );
        }
      });
    }

    optimizeDataStructures() {
      // Améliorer les listes de produits
      const productGrids = document.querySelectorAll('.products-grid');
      productGrids.forEach(grid => {
        if (!grid.getAttribute('role')) {
          grid.setAttribute('role', 'grid');
          grid.setAttribute('aria-label', 
            this.currentLanguage === 'fr' ? 'Grille de produits' : 'Products grid'
          );
        }

        const products = grid.querySelectorAll('.product-card');
        products.forEach((product, index) => {
          product.setAttribute('role', 'gridcell');
          product.setAttribute('aria-posinset', String(index + 1));
          product.setAttribute('aria-setsize', String(products.length));
        });
      });

      // Améliorer les tableaux (si présents)
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
          const heading = table.previousElementSibling;
          if (heading && heading.matches('h1, h2, h3, h4, h5, h6')) {
            table.setAttribute('aria-labelledby', heading.id || this.generateId('table-heading'));
            if (!heading.id) {
              heading.id = table.getAttribute('aria-labelledby');
            }
          }
        }
      });
    }

    enhanceImages() {
      if (!this.config.autoGenerateAltText) return;

      const images = document.querySelectorAll('img:not([alt]), img[alt=""]');
      images.forEach(async (img) => {
        // Générer alt text intelligent basé sur le contexte
        const altText = this.generateIntelligentAltText(img);
        if (altText) {
          img.alt = altText;
        }
      });
    }

    generateIntelligentAltText(img) {
      // Analyser le contexte de l'image
      const src = img.src;
      const context = img.closest('.product-card, .hero-section, .feature-card');
      
      // Alt text basé sur le nom de fichier et le contexte
      let altText = '';
      
      if (src.includes('coin') || src.includes('piece')) {
        altText = this.currentLanguage === 'fr' ? 'Pièce métallique pour jeu de rôle' : 'Metal coin for tabletop RPG';
      } else if (src.includes('card') || src.includes('carte')) {
        altText = this.currentLanguage === 'fr' ? 'Carte d\'équipement illustrée' : 'Illustrated equipment card';
      } else if (src.includes('triptyque') || src.includes('triptych')) {
        altText = this.currentLanguage === 'fr' ? 'Fiche de personnage triptyque' : 'Triptych character sheet';
      } else if (context?.querySelector('.product-title')) {
        const productName = context.querySelector('.product-title').textContent.trim();
        altText = this.currentLanguage === 'fr' ? 
          `Image du produit ${productName}` : 
          `Product image of ${productName}`;
      }

      // Ajouter des détails spécifiques si détectés
      if (src.includes('x10')) altText += ' (multiplicateur x10)';
      if (src.includes('x100')) altText += ' (multiplicateur x100)';
      if (src.includes('copper')) altText += this.currentLanguage === 'fr' ? ' en cuivre' : ' copper';
      if (src.includes('gold')) altText += this.currentLanguage === 'fr' ? ' en or' : ' gold';
      if (src.includes('silver')) altText += this.currentLanguage === 'fr' ? ' en argent' : ' silver';

      return altText;
    }

    setupSocialSharing() {
      if (!this.config.enableSocialSharing) return;

      // Ajouter des boutons de partage contextuel
      this.addSocialShareButtons();
      
      // Optimiser les meta tags pour le partage
      this.optimizeSocialMetaTags();
    }

    addSocialShareButtons() {
      const shareContainer = document.createElement('div');
      shareContainer.className = 'social-share-container';
      shareContainer.innerHTML = `
        <h3>${this.currentLanguage === 'fr' ? 'Partager cette page' : 'Share this page'}</h3>
        <div class="social-share-buttons">
          <button class="share-btn facebook" data-platform="facebook" aria-label="${this.currentLanguage === 'fr' ? 'Partager sur Facebook' : 'Share on Facebook'}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button class="share-btn twitter" data-platform="twitter" aria-label="${this.currentLanguage === 'fr' ? 'Partager sur Twitter' : 'Share on Twitter'}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button class="share-btn linkedin" data-platform="linkedin" aria-label="${this.currentLanguage === 'fr' ? 'Partager sur LinkedIn' : 'Share on LinkedIn'}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button class="share-btn native" data-platform="native" aria-label="${this.currentLanguage === 'fr' ? 'Partager via...' : 'Share via...'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      `;

      // Ajouter les styles
      const shareStyles = `
        <style>
        .social-share-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(139, 92, 246, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .social-share-container h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #f1f5f9;
        }

        .social-share-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .share-btn {
          background: none;
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #94a3b8;
        }

        .share-btn svg {
          width: 20px;
          height: 20px;
        }

        .share-btn:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
          transform: translateY(-1px);
        }

        .share-btn.facebook:hover {
          color: #1877f2;
          border-color: #1877f2;
          background: rgba(24, 119, 242, 0.1);
        }

        .share-btn.twitter:hover {
          color: #1da1f2;
          border-color: #1da1f2;
          background: rgba(29, 161, 242, 0.1);
        }

        .share-btn.linkedin:hover {
          color: #0077b5;
          border-color: #0077b5;
          background: rgba(0, 119, 181, 0.1);
        }

        @media (max-width: 768px) {
          .social-share-buttons {
            justify-content: center;
          }
        }
        </style>
      `;

      document.head.insertAdjacentHTML('beforeend', shareStyles);

      // Ajouter les événements
      shareContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.share-btn');
        if (button) {
          this.handleSocialShare(button.dataset.platform);
        }
      });

      // Insérer dans la page (après le contenu principal)
      const main = document.querySelector('main');
      if (main) {
        main.appendChild(shareContainer);
      }
    }

    handleSocialShare(platform) {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const description = encodeURIComponent(
        document.querySelector('meta[name="description"]')?.content || ''
      );

      let shareUrl;

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'native':
          if (navigator.share) {
            navigator.share({
              title: document.title,
              text: description,
              url: window.location.href
            });
            return;
          } else {
            // Fallback: copier l'URL
            navigator.clipboard.writeText(window.location.href).then(() => {
              window.announceToScreenReader?.(
                this.currentLanguage === 'fr' ? 'Lien copié dans le presse-papiers' : 'Link copied to clipboard'
              );
            });
            return;
          }
      }

      if (shareUrl) {
        window.open(shareUrl, 'share', 'width=600,height=400,scrollbars=yes,resizable=yes');
      }
    }

    optimizeSocialMetaTags() {
      // Optimiser les images de partage
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && !ogImage.content.startsWith('https://')) {
        ogImage.content = `https://geekndragon.com${ogImage.content}`;
      }

      // Ajouter les tailles d'image
      if (ogImage && !document.querySelector('meta[property="og:image:width"]')) {
        const imageMeta = [
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:type', content: 'image/webp' }
        ];

        imageMeta.forEach(meta => {
          const element = document.createElement('meta');
          element.setAttribute('property', meta.property);
          element.content = meta.content;
          document.head.appendChild(element);
        });
      }
    }

    startSEOMonitoring() {
      // Monitoring des métriques SEO importantes
      this.seoMetrics = {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        interactionToNextPaint: 0,
        socialShares: 0,
        accessibilityScore: 0
      };

      this.trackSEOMetrics();
      
      // Rapport automatique (dev mode)
      if (window.location.hostname === 'localhost') {
        setTimeout(() => {
          this.generateSEOReport();
        }, 5000);
      }
    }

    trackSEOMetrics() {
      // Performance metrics
      if (window.performance) {
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0];
          this.seoMetrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        });
      }

      // Web Vitals (si disponible via le monitoring de performance existant)
      if (window.GeeknDragonPerformanceMonitor) {
        const performanceMonitor = window.GeeknDragonPerformanceMonitor;
        setInterval(() => {
          const metrics = performanceMonitor.getMetrics();
          if (metrics.webVitals) {
            this.seoMetrics.firstContentfulPaint = metrics.webVitals.FCP?.value || 0;
            this.seoMetrics.largestContentfulPaint = metrics.webVitals.LCP?.value || 0;
            this.seoMetrics.cumulativeLayoutShift = metrics.webVitals.CLS?.value || 0;
          }
        }, 10000);
      }

      // Accessibilité score basique
      this.seoMetrics.accessibilityScore = this.calculateBasicAccessibilityScore();
    }

    calculateBasicAccessibilityScore() {
      let score = 100;
      
      // Vérifications de base
      const checks = [
        { test: () => document.querySelectorAll('img:not([alt])').length === 0, weight: 15 },
        { test: () => document.querySelectorAll('a:empty').length === 0, weight: 10 },
        { test: () => document.querySelectorAll('button:empty').length === 0, weight: 10 },
        { test: () => document.querySelector('h1') !== null, weight: 10 },
        { test: () => document.querySelector('[lang]') !== null, weight: 5 },
        { test: () => document.querySelector('main') !== null, weight: 10 },
        { test: () => document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length === 0, weight: 15 },
        { test: () => document.querySelector('.skip-link') !== null, weight: 10 },
        { test: () => document.querySelectorAll('[aria-live]').length > 0, weight: 5 },
        { test: () => document.querySelector('nav[aria-label]') !== null, weight: 10 }
      ];

      checks.forEach(check => {
        if (!check.test()) {
          score -= check.weight;
        }
      });

      return Math.max(0, score);
    }

    generateSEOReport() {
      const report = {
        url: window.location.href,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        imageCount: document.querySelectorAll('img').length,
        imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
        linksCount: document.querySelectorAll('a').length,
        emptyLinks: document.querySelectorAll('a:empty').length,
        structuredData: document.querySelectorAll('script[type="application/ld+json"]').length,
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.href || '',
        openGraphTags: document.querySelectorAll('meta[property^="og:"]').length,
        twitterCardTags: document.querySelectorAll('meta[name^="twitter:"]').length,
        accessibilityScore: this.seoMetrics.accessibilityScore,
        metrics: this.seoMetrics,
        recommendations: this.generateSEORecommendations()
      };

      console.group('📊 SEO Report');
      console.table(report);
      console.groupEnd();

      return report;
    }

    generateSEORecommendations() {
      const recommendations = [];

      if (this.seoMetrics.accessibilityScore < 80) {
        recommendations.push('Améliorer le score d\'accessibilité');
      }

      if (document.querySelectorAll('img:not([alt])').length > 0) {
        recommendations.push('Ajouter des attributs alt aux images');
      }

      if (document.querySelectorAll('h1').length !== 1) {
        recommendations.push('Utiliser exactement un H1 par page');
      }

      if (!document.querySelector('meta[name="description"]')?.content) {
        recommendations.push('Ajouter une meta description');
      }

      if (this.seoMetrics.largestContentfulPaint > 2500) {
        recommendations.push('Optimiser le temps de chargement (LCP > 2.5s)');
      }

      return recommendations;
    }

    // Utilitaires
    extractProductsFromPage() {
      const products = [];
      document.querySelectorAll('.product-card').forEach(card => {
        const product = this.extractProductFromCard(card);
        if (product) products.push(product);
      });
      return products;
    }

    extractProductFromCard(card) {
      const name = card.querySelector('.product-title, .product-name')?.textContent?.trim();
      const price = card.querySelector('.product-price')?.textContent?.replace(/[^\d.]/g, '');
      const image = card.querySelector('img')?.src;
      const description = card.querySelector('.product-description')?.textContent?.trim();

      if (!name || !price) return null;

      return {
        '@type': 'Product',
        'name': name,
        'price': parseFloat(price),
        'image': image,
        'description': description || '',
        'priceCurrency': 'CAD'
      };
    }

    extractCurrentProductData() {
      // Extraire les données du produit actuel (page produit)
      const productCard = document.querySelector('.product-card');
      if (productCard) {
        return this.extractProductFromCard(productCard);
      }

      // Fallback depuis les métadonnées
      return {
        name: document.title,
        price: 0,
        description: document.querySelector('meta[name="description"]')?.content || '',
        images: [document.querySelector('meta[property="og:image"]')?.content || ''],
        id: window.location.pathname.split('/').pop().replace('.php', ''),
        availability: 'https://schema.org/InStock',
        variations: []
      };
    }

    generatePageDescription() {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/index.php') {
        return this.currentLanguage === 'fr' ?
          'Transformez vos parties D&D avec nos aides de jeu physiques : pièces métalliques, cartes d\'équipement et triptyques. Fabriqué au Québec.' :
          'Transform your D&D games with our physical game aids: metal coins, equipment cards and triptychs. Made in Quebec.';
      }

      if (path.includes('boutique')) {
        return this.currentLanguage === 'fr' ?
          'Découvrez notre boutique d\'aides de jeu D&D : pièces métalliques avec multiplicateurs, cartes d\'équipement illustrées et triptyques de personnage.' :
          'Discover our D&D game aids shop: metal coins with multipliers, illustrated equipment cards and character triptychs.';
      }

      return document.querySelector('meta[name="description"]')?.content || '';
    }

    getCanonicalURL() {
      const base = 'https://geekndragon.com';
      const path = window.location.pathname;
      return base + path;
    }

    isProductPage() {
      const path = window.location.pathname;
      return path.includes('product') || 
             path.includes('lot') || 
             path.includes('pack') || 
             path.includes('triptyque');
    }

    getGridColumns(grid) {
      const style = window.getComputedStyle(grid);
      const columns = style.gridTemplateColumns;
      return columns ? columns.split(' ').length : 1;
    }

    generateId(prefix = 'generated') {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // API publique
    getSEOMetrics() {
      return this.seoMetrics;
    }

    generateReport() {
      return this.generateSEOReport();
    }

    updateLanguage(lang) {
      this.currentLanguage = lang;
      document.documentElement.lang = lang;
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonSEO = new AdvancedSEOAccessibility();
    
    // Mode debug
    if (window.location.hostname === 'localhost') {
      window._debugSEO = window.GeeknDragonSEO;
      console.log('🚀 SEO Debug - Utilisez window._debugSEO.generateReport()');
    }
  });

})();