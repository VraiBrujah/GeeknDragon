/**
 * Gestionnaire de Langues Li-CUBE PRO™
 * 
 * Rôle : Gestion multilingue extensible avec support i18n complet
 * Responsabilité : Traductions, détection locale, changement de langue temps réel
 * Extensibilité : Support illimité de langues avec plugins de traduction
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class LanguageManager {
    constructor(framework) {
        // Rôle : Liaison avec le framework principal
        this.framework = framework;
        
        // Rôle : Configuration du gestionnaire multilingue
        // Type : Object - Paramètres de gestion des langues
        this.config = {
            defaultLanguage: 'fr',             // Langue par défaut
            fallbackLanguage: 'en',            // Langue de fallback
            autoDetect: true,                  // Détection automatique
            persistLanguage: true,             // Sauvegarde préférence utilisateur
            supportedLanguages: ['fr', 'en'],  // Langues supportées (extensible)
            dateFormat: {                      // Formats de dates par langue
                'fr': 'DD/MM/YYYY',
                'en': 'MM/DD/YYYY'
            },
            numberFormat: {                    // Formats de nombres par langue
                'fr': { locale: 'fr-FR', currency: 'EUR' },
                'en': { locale: 'en-US', currency: 'USD' }
            }
        };
        
        // Rôle : État du gestionnaire de langues
        // Type : Object - Suivi de la langue active et traductions
        this.state = {
            currentLanguage: null,             // Langue actuellement active
            availableLanguages: new Map(),     // Langues disponibles avec métadonnées
            translations: new Map(),           // Cache des traductions chargées
            isLoading: false,                  // État de chargement
            lastDetected: null                 // Dernière langue détectée
        };
        
        // Rôle : Observateurs pour changements de langue
        // Type : Set - Callbacks de notification
        this.observers = new Set();
        
        // Rôle : Plugins de traduction
        // Type : Map - Services de traduction tiers
        this.translationProviders = new Map();
        
        this.init();
    }
    
    /**
     * Initialisation : configuration des langues supportées
     */
    async init() {
        // Enregistrement : langues de base
        await this.registerBaseLanguages();
        
        // Détection : langue préférée de l'utilisateur
        const preferredLanguage = this.detectUserLanguage();
        
        // Chargement : traductions de la langue préférée
        await this.loadLanguage(preferredLanguage);
        
        // Configuration : observateurs pour changements
        this.setupLanguageObservers();
        
        console.log(`✅ LanguageManager initialisé (${this.state.currentLanguage})`);
    }
    
    /**
     * Enregistrement : langues de base (français et anglais)
     */
    async registerBaseLanguages() {
        // Enregistrement : Français
        this.registerLanguage('fr', {
            name: 'Français',
            nativeName: 'Français',
            code: 'fr',
            locale: 'fr-FR',
            flag: '🇫🇷',
            rtl: false,
            dateFormat: 'DD/MM/YYYY',
            timeFormat: 'HH:mm',
            currency: {
                code: 'EUR',
                symbol: '€',
                position: 'after'
            },
            numberFormat: {
                decimal: ',',
                thousands: ' ',
                precision: 2
            }
        });
        
        // Enregistrement : Anglais
        this.registerLanguage('en', {
            name: 'English',
            nativeName: 'English',
            code: 'en',
            locale: 'en-US', 
            flag: '🇺🇸',
            rtl: false,
            dateFormat: 'MM/DD/YYYY',
            timeFormat: 'hh:mm A',
            currency: {
                code: 'USD',
                symbol: '$',
                position: 'before'
            },
            numberFormat: {
                decimal: '.',
                thousands: ',',
                precision: 2
            }
        });
        
        // Chargement : fichiers de traduction
        await this.loadTranslationFiles();
    }
    
    /**
     * Enregistrement : nouvelle langue supportée
     * @param {string} languageCode - Code de langue (ex: 'fr', 'en', 'es')
     * @param {Object} languageConfig - Configuration de la langue
     */
    registerLanguage(languageCode, languageConfig) {
        // Validation : configuration complète
        const requiredFields = ['name', 'nativeName', 'locale'];
        for (const field of requiredFields) {
            if (!languageConfig[field]) {
                throw new Error(`Langue ${languageCode}: champ ${field} requis`);
            }
        }
        
        // Enregistrement : langue avec configuration complète
        this.state.availableLanguages.set(languageCode, {
            code: languageCode,
            ...languageConfig,
            registeredAt: Date.now(),
            isActive: false
        });
        
        // Mise à jour : langues supportées
        if (!this.config.supportedLanguages.includes(languageCode)) {
            this.config.supportedLanguages.push(languageCode);
        }
        
        console.log(`🌐 Langue enregistrée: ${languageConfig.name} (${languageCode})`);
    }
    
    /**
     * Chargement : fichiers de traduction pour les langues de base
     */
    async loadTranslationFiles() {
        // Traductions : français (langue de base)
        const frTranslations = {
            // Interface d'administration
            admin: {
                title: 'Administration Li-CUBE PRO™',
                close: 'Fermer',
                minimize: 'Réduire',
                preview: 'Aperçu',
                save: 'Sauvegarder',
                cancel: 'Annuler',
                confirm: 'Confirmer',
                delete: 'Supprimer',
                duplicate: 'Dupliquer',
                edit: 'Éditer',
                add: 'Ajouter',
                remove: 'Retirer',
                help: 'Aide'
            },
            
            // Onglets
            tabs: {
                sections: 'Sections',
                templates: 'Modèles',
                content: 'Contenu',
                settings: 'Paramètres',
                languages: 'Langues'
            },
            
            // Sections
            sections: {
                title: 'Gestion des Sections',
                addSection: 'Ajouter Section',
                import: 'Importer',
                export: 'Exporter',
                moveUp: 'Monter',
                moveDown: 'Descendre',
                visible: 'Visible',
                hidden: 'Masquée',
                fields: 'champs',
                noSections: 'Aucune section créée'
            },
            
            // Templates
            templates: {
                title: 'Modèles Disponibles',
                search: 'Rechercher modèles...',
                use: 'Utiliser',
                hero: 'Section Héros',
                pricing: 'Section Tarification',
                advantages: 'Section Avantages',
                contact: 'Section Contact',
                custom: 'Section Personnalisée'
            },
            
            // Types de champs
            fields: {
                text: 'Texte',
                image: 'Image',
                button: 'Bouton',
                spacer: 'Espacement',
                addField: 'Ajouter Champ',
                fieldName: 'Nom du champ',
                fieldValue: 'Valeur',
                placeholder: 'Texte d\'exemple',
                required: 'Champ requis',
                validation: 'Validation'
            },
            
            // Messages
            messages: {
                success: 'Opération réussie',
                error: 'Erreur survenue',
                saved: 'Sauvegardé avec succès',
                deleted: 'Supprimé avec succès',
                duplicated: 'Dupliqué avec succès',
                loading: 'Chargement...',
                noSelection: 'Sélectionnez un élément pour l\'éditer',
                confirmDelete: 'Êtes-vous sûr de vouloir supprimer ?'
            },
            
            // Paramètres
            settings: {
                interface: 'Interface',
                panelPosition: 'Position du panneau',
                right: 'Droite',
                left: 'Gauche',
                autoHide: 'Masquer automatiquement en mode présentation',
                enableDragDrop: 'Activer le glisser-déposer',
                enablePreview: 'Prévisualisation temps réel',
                syncDelay: 'Délai de synchronisation (ms)',
                language: 'Langue',
                shortcuts: 'Raccourcis Clavier'
            },
            
            // Raccourcis clavier
            shortcuts: {
                preview: 'Prévisualiser',
                save: 'Sauvegarder',
                duplicate: 'Dupliquer section',
                close: 'Fermer panneau',
                toggleAdmin: 'Basculer admin'
            },
            
            // Constructeur de templates
            templateBuilder: {
                title: 'Constructeur de Modèles',
                newTemplate: 'Nouveau Modèle',
                widgets: 'Widgets Disponibles',
                properties: 'Propriétés',
                searchWidgets: 'Rechercher widgets...',
                categories: {
                    content: 'Contenu',
                    media: 'Médias',
                    interactive: 'Interactif',
                    layout: 'Mise en page',
                    other: 'Autres'
                },
                dragHint: 'Glissez-déposez des widgets ici pour créer votre modèle'
            }
        };
        
        // Traductions : anglais
        const enTranslations = {
            // Admin interface
            admin: {
                title: 'Li-CUBE PRO™ Administration',
                close: 'Close',
                minimize: 'Minimize',
                preview: 'Preview',
                save: 'Save',
                cancel: 'Cancel',
                confirm: 'Confirm',
                delete: 'Delete',
                duplicate: 'Duplicate',
                edit: 'Edit',
                add: 'Add',
                remove: 'Remove',
                help: 'Help'
            },
            
            // Tabs
            tabs: {
                sections: 'Sections',
                templates: 'Templates',
                content: 'Content',
                settings: 'Settings',
                languages: 'Languages'
            },
            
            // Sections
            sections: {
                title: 'Section Management',
                addSection: 'Add Section',
                import: 'Import',
                export: 'Export',
                moveUp: 'Move Up',
                moveDown: 'Move Down',
                visible: 'Visible',
                hidden: 'Hidden',
                fields: 'fields',
                noSections: 'No sections created'
            },
            
            // Templates
            templates: {
                title: 'Available Templates',
                search: 'Search templates...',
                use: 'Use',
                hero: 'Hero Section',
                pricing: 'Pricing Section',
                advantages: 'Features Section',
                contact: 'Contact Section',
                custom: 'Custom Section'
            },
            
            // Field types
            fields: {
                text: 'Text',
                image: 'Image',
                button: 'Button',
                spacer: 'Spacer',
                addField: 'Add Field',
                fieldName: 'Field name',
                fieldValue: 'Value',
                placeholder: 'Placeholder text',
                required: 'Required field',
                validation: 'Validation'
            },
            
            // Messages
            messages: {
                success: 'Operation successful',
                error: 'Error occurred',
                saved: 'Saved successfully',
                deleted: 'Deleted successfully',
                duplicated: 'Duplicated successfully',
                loading: 'Loading...',
                noSelection: 'Select an element to edit',
                confirmDelete: 'Are you sure you want to delete?'
            },
            
            // Settings
            settings: {
                interface: 'Interface',
                panelPosition: 'Panel position',
                right: 'Right',
                left: 'Left',
                autoHide: 'Auto-hide in presentation mode',
                enableDragDrop: 'Enable drag & drop',
                enablePreview: 'Real-time preview',
                syncDelay: 'Sync delay (ms)',
                language: 'Language',
                shortcuts: 'Keyboard Shortcuts'
            },
            
            // Keyboard shortcuts
            shortcuts: {
                preview: 'Preview',
                save: 'Save',
                duplicate: 'Duplicate section',
                close: 'Close panel',
                toggleAdmin: 'Toggle admin'
            },
            
            // Template builder
            templateBuilder: {
                title: 'Template Builder',
                newTemplate: 'New Template',
                widgets: 'Available Widgets',
                properties: 'Properties',
                searchWidgets: 'Search widgets...',
                categories: {
                    content: 'Content',
                    media: 'Media',
                    interactive: 'Interactive',
                    layout: 'Layout',
                    other: 'Other'
                },
                dragHint: 'Drag & drop widgets here to create your template'
            }
        };
        
        // Stockage : traductions dans le cache
        this.state.translations.set('fr', frTranslations);
        this.state.translations.set('en', enTranslations);
        
        console.log('📚 Fichiers de traduction chargés (FR, EN)');
    }
    
    /**
     * Détection : langue préférée de l'utilisateur
     * @return {string} - Code de langue détecté
     */
    detectUserLanguage() {
        // Priorité 1 : Langue sauvegardée par l'utilisateur
        if (this.config.persistLanguage) {
            const savedLanguage = this.framework.core.storage?.get?.('user-language');
            if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
                this.state.lastDetected = savedLanguage;
                return savedLanguage;
            }
        }
        
        // Priorité 2 : Paramètre URL (?lang=fr)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isLanguageSupported(urlLang)) {
            this.state.lastDetected = urlLang;
            return urlLang;
        }
        
        // Priorité 3 : Langue du navigateur
        const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        
        for (const browserLang of browserLanguages) {
            // Extraction : code de langue principal (ex: 'fr-CA' -> 'fr')
            const langCode = browserLang.split('-')[0].toLowerCase();
            
            if (this.isLanguageSupported(langCode)) {
                this.state.lastDetected = langCode;
                return langCode;
            }
        }
        
        // Priorité 4 : Langue par défaut
        this.state.lastDetected = this.config.defaultLanguage;
        return this.config.defaultLanguage;
    }
    
    /**
     * Vérification : langue supportée
     * @param {string} languageCode - Code de langue à vérifier
     * @return {boolean} - true si supportée
     */
    isLanguageSupported(languageCode) {
        return this.config.supportedLanguages.includes(languageCode) &&
               this.state.availableLanguages.has(languageCode);
    }
    
    /**
     * Chargement : langue spécifique
     * @param {string} languageCode - Code de langue à charger
     * @return {Promise<boolean>} - true si chargée avec succès
     */
    async loadLanguage(languageCode) {
        // Validation : langue supportée
        if (!this.isLanguageSupported(languageCode)) {
            console.warn(`⚠️ Langue non supportée: ${languageCode}, fallback vers ${this.config.fallbackLanguage}`);
            languageCode = this.config.fallbackLanguage;
        }
        
        // Éviter : rechargement si déjà active
        if (this.state.currentLanguage === languageCode) {
            return true;
        }
        
        this.state.isLoading = true;
        
        try {
            // Chargement : traductions si non en cache
            if (!this.state.translations.has(languageCode)) {
                await this.loadTranslationsFromFile(languageCode);
            }
            
            // Activation : langue
            this.activateLanguage(languageCode);
            
            // Sauvegarde : préférence utilisateur
            if (this.config.persistLanguage && this.framework.core.storage) {
                await this.framework.core.storage.set('user-language', languageCode);
            }
            
            // Notification : changement de langue
            this.notifyObservers('language-changed', {
                oldLanguage: this.state.currentLanguage,
                newLanguage: languageCode,
                languageData: this.state.availableLanguages.get(languageCode)
            });
            
            console.log(`🌐 Langue chargée: ${languageCode}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur chargement langue ${languageCode}:`, error);
            
            // Fallback : langue par défaut en cas d'erreur
            if (languageCode !== this.config.fallbackLanguage) {
                return await this.loadLanguage(this.config.fallbackLanguage);
            }
            
            return false;
            
        } finally {
            this.state.isLoading = false;
        }
    }
    
    /**
     * Activation : langue comme langue courante
     * @param {string} languageCode - Code de langue à activer
     */
    activateLanguage(languageCode) {
        // Désactivation : langue précédente
        if (this.state.currentLanguage) {
            const prevLang = this.state.availableLanguages.get(this.state.currentLanguage);
            if (prevLang) {
                prevLang.isActive = false;
            }
        }
        
        // Activation : nouvelle langue
        this.state.currentLanguage = languageCode;
        const newLang = this.state.availableLanguages.get(languageCode);
        if (newLang) {
            newLang.isActive = true;
        }
        
        // Mise à jour : attributs HTML
        document.documentElement.lang = languageCode;
        document.documentElement.dir = newLang?.rtl ? 'rtl' : 'ltr';
        
        // Mise à jour : classes CSS pour le styling
        document.body.classList.remove(`lang-${this.state.currentLanguage}`);
        document.body.classList.add(`lang-${languageCode}`);
        
        // Application : traductions à l'interface
        this.applyTranslationsToDOM();
    }
    
    /**
     * Chargement : traductions depuis fichier externe
     * @param {string} languageCode - Code de langue
     */
    async loadTranslationsFromFile(languageCode) {
        try {
            // Tentative : chargement fichier JSON
            const response = await fetch(`./locales/${languageCode}.json`);
            
            if (response.ok) {
                const translations = await response.json();
                this.state.translations.set(languageCode, translations);
                console.log(`📄 Traductions chargées depuis fichier: ${languageCode}`);
            } else {
                console.warn(`⚠️ Fichier de traduction introuvable: ${languageCode}.json`);
            }
            
        } catch (error) {
            console.warn(`⚠️ Erreur chargement fichier traduction ${languageCode}:`, error);
        }
    }
    
    /**
     * Traduction : texte avec clé de traduction
     * @param {string} key - Clé de traduction (ex: 'admin.title', 'buttons.save')
     * @param {Object} params - Paramètres pour interpolation
     * @param {string} languageCode - Langue spécifique (optionnel)
     * @return {string} - Texte traduit
     */
    t(key, params = {}, languageCode = null) {
        // Utilisation : langue courante si non spécifiée
        const lang = languageCode || this.state.currentLanguage || this.config.defaultLanguage;
        
        // Récupération : traductions pour la langue
        const translations = this.state.translations.get(lang);
        if (!translations) {
            return this.getFallbackTranslation(key, params);
        }
        
        // Navigation : dans l'arbre de traductions (ex: 'admin.title' -> admin.title)
        const keys = key.split('.');
        let translation = translations;
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                return this.getFallbackTranslation(key, params);
            }
        }
        
        // Vérification : traduction trouvée et est une chaîne
        if (typeof translation !== 'string') {
            return this.getFallbackTranslation(key, params);
        }
        
        // Interpolation : remplacement des paramètres {{param}}
        return this.interpolateTranslation(translation, params);
    }
    
    /**
     * Récupération : traduction de fallback
     * @param {string} key - Clé de traduction
     * @param {Object} params - Paramètres
     * @return {string} - Traduction de fallback ou clé
     */
    getFallbackTranslation(key, params) {
        // Tentative : langue de fallback
        if (this.state.currentLanguage !== this.config.fallbackLanguage) {
            const fallbackTranslations = this.state.translations.get(this.config.fallbackLanguage);
            
            if (fallbackTranslations) {
                const keys = key.split('.');
                let translation = fallbackTranslations;
                
                for (const k of keys) {
                    if (translation && typeof translation === 'object' && k in translation) {
                        translation = translation[k];
                    } else {
                        break;
                    }
                }
                
                if (typeof translation === 'string') {
                    return this.interpolateTranslation(translation, params);
                }
            }
        }
        
        // Dernière option : retourner la clé avec indication de traduction manquante
        console.warn(`🔤 Traduction manquante: ${key} (${this.state.currentLanguage})`);
        return `[${key}]`;
    }
    
    /**
     * Interpolation : remplacement des paramètres dans la traduction
     * @param {string} translation - Texte avec paramètres {{param}}
     * @param {Object} params - Paramètres à remplacer
     * @return {string} - Texte avec paramètres remplacés
     */
    interpolateTranslation(translation, params) {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
            return params[paramName] !== undefined ? params[paramName] : match;
        });
    }
    
    /**
     * Application : traductions à l'interface DOM
     */
    applyTranslationsToDOM() {
        // Recherche : éléments avec attribut data-i18n
        const translatableElements = document.querySelectorAll('[data-i18n]');
        
        translatableElements.forEach(element => {
            const translationKey = element.getAttribute('data-i18n');
            const translatedText = this.t(translationKey);
            
            // Application : selon le type d'élément
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                element.placeholder = translatedText;
            } else if (element.hasAttribute('title')) {
                element.title = translatedText;
            } else {
                element.textContent = translatedText;
            }
        });
        
        // Notification : DOM mis à jour
        this.notifyObservers('dom-updated', { language: this.state.currentLanguage });
    }
    
    /**
     * Changement : langue utilisateur
     * @param {string} languageCode - Nouvelle langue
     * @return {Promise<boolean>} - true si changement réussi
     */
    async changeLanguage(languageCode) {
        return await this.loadLanguage(languageCode);
    }
    
    /**
     * Configuration : observateurs pour changements automatiques
     */
    setupLanguageObservers() {
        // Écoute : changements de langue du navigateur
        window.addEventListener('languagechange', () => {
            if (this.config.autoDetect) {
                const newLanguage = this.detectUserLanguage();
                if (newLanguage !== this.state.currentLanguage) {
                    this.loadLanguage(newLanguage);
                }
            }
        });
        
        // Écoute : changements d'URL avec paramètre langue
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            
            if (urlLang && this.isLanguageSupported(urlLang) && urlLang !== this.state.currentLanguage) {
                this.loadLanguage(urlLang);
            }
        });
    }
    
    /**
     * Formatage : date selon la locale courante
     * @param {Date|string|number} date - Date à formater
     * @param {string} format - Format spécifique (optionnel)
     * @return {string} - Date formatée
     */
    formatDate(date, format = null) {
        const lang = this.state.availableLanguages.get(this.state.currentLanguage);
        const locale = lang?.locale || 'en-US';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (format) {
            // Format personnalisé (basique)
            return format
                .replace('YYYY', dateObj.getFullYear())
                .replace('MM', String(dateObj.getMonth() + 1).padStart(2, '0'))
                .replace('DD', String(dateObj.getDate()).padStart(2, '0'))
                .replace('HH', String(dateObj.getHours()).padStart(2, '0'))
                .replace('mm', String(dateObj.getMinutes()).padStart(2, '0'));
        }
        
        // Format par défaut selon la locale
        return dateObj.toLocaleDateString(locale);
    }
    
    /**
     * Formatage : nombre selon la locale courante
     * @param {number} number - Nombre à formater
     * @param {Object} options - Options de formatage
     * @return {string} - Nombre formaté
     */
    formatNumber(number, options = {}) {
        const lang = this.state.availableLanguages.get(this.state.currentLanguage);
        const locale = lang?.locale || 'en-US';
        
        return new Intl.NumberFormat(locale, options).format(number);
    }
    
    /**
     * Formatage : devise selon la locale courante
     * @param {number} amount - Montant
     * @param {string} currency - Code devise (optionnel)
     * @return {string} - Montant formaté avec devise
     */
    formatCurrency(amount, currency = null) {
        const lang = this.state.availableLanguages.get(this.state.currentLanguage);
        const locale = lang?.locale || 'en-US';
        const currencyCode = currency || lang?.currency?.code || 'USD';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode
        }).format(amount);
    }
    
    /**
     * Ajout : observateur pour changements
     * @param {Function} callback - Fonction callback
     */
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    /**
     * Écoute : événements spécifiques (alias pour addObserver)
     * @param {string} event - Type d'événement ('languageChanged', etc.)
     * @param {Function} callback - Fonction callback
     */
    on(event, callback) {
        if (event === 'languageChanged') {
            this.addObserver((eventType, data) => {
                if (eventType === 'language-changed') {
                    callback(data.language);
                }
            });
        }
    }
    
    /**
     * Définition : nouvelle langue (alias pour loadLanguage)
     * @param {string} languageCode - Code de langue
     * @return {Promise<boolean>} - true si chargement réussi
     */
    async setLanguage(languageCode) {
        return await this.loadLanguage(languageCode);
    }
    
    /**
     * Suppression : observateur
     * @param {Function} callback - Fonction callback
     */
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    /**
     * Notification : observateurs
     * @param {string} event - Type d'événement
     * @param {any} data - Données de l'événement
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erreur observateur LanguageManager:', error);
            }
        });
    }
    
    /**
     * Liste : langues disponibles
     * @return {Array<Object>} - Liste des langues avec métadonnées
     */
    getAvailableLanguages() {
        return Array.from(this.state.availableLanguages.values());
    }
    
    /**
     * Récupération : langue courante
     * @return {string} - Code de la langue courante
     */
    getCurrentLanguage() {
        return this.state.currentLanguage;
    }
    
    /**
     * Récupération : données de langue courante  
     * @return {Object|null} - Données complètes de la langue courante
     */
    getCurrentLanguageData() {
        return this.state.availableLanguages.get(this.state.currentLanguage) || null;
    }
    
    /**
     * Export : traductions pour sauvegarde
     * @param {string} languageCode - Langue à exporter (optionnel)
     * @return {Object} - Traductions exportées
     */
    exportTranslations(languageCode = null) {
        const lang = languageCode || this.state.currentLanguage;
        const translations = this.state.translations.get(lang);
        
        return {
            language: lang,
            translations: translations || {},
            metadata: this.state.availableLanguages.get(lang) || {},
            exportedAt: Date.now()
        };
    }
    
    /**
     * Import : traductions depuis fichier
     * @param {Object} translationData - Données de traductions
     * @return {Promise<boolean>} - true si importées avec succès
     */
    async importTranslations(translationData) {
        try {
            const { language, translations, metadata } = translationData;
            
            // Validation : données complètes
            if (!language || !translations) {
                throw new Error('Données de traduction incomplètes');
            }
            
            // Enregistrement : langue si nouvelle
            if (!this.state.availableLanguages.has(language)) {
                this.registerLanguage(language, metadata || {
                    name: language.toUpperCase(),
                    nativeName: language.toUpperCase(),
                    locale: `${language}-${language.toUpperCase()}`
                });
            }
            
            // Stockage : traductions
            this.state.translations.set(language, translations);
            
            console.log(`📥 Traductions importées: ${language}`);
            return true;
            
        } catch (error) {
            console.error('Erreur import traductions:', error);
            return false;
        }
    }
    
    /**
     * Statistiques : analyse des traductions par langue
     * @param {string} languageCode - Code de langue à analyser
     * @return {Object} - Statistiques détaillées
     */
    getTranslationStats(languageCode) {
        const translations = this.state.translations.get(languageCode);
        const referenceTranslations = this.state.translations.get(this.config.defaultLanguage);
        
        if (!translations) {
            return {
                totalKeys: 0,
                translatedKeys: 0,
                missingKeys: 0,
                completionPercentage: 0,
                emptyTranslations: 0
            };
        }
        
        // Calcul : nombre total de clés depuis la langue de référence
        const referenceKeyCount = referenceTranslations ? this.countTranslationKeys(referenceTranslations) : 0;
        const currentKeyCount = this.countTranslationKeys(translations);
        
        // Calcul : clés manquantes et vides
        const missingKeys = Math.max(0, referenceKeyCount - currentKeyCount);
        const emptyTranslations = this.countEmptyTranslations(translations);
        const translatedKeys = Math.max(0, currentKeyCount - emptyTranslations);
        
        // Calcul : pourcentage de complétion
        const totalKeys = Math.max(referenceKeyCount, currentKeyCount);
        const completionPercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 100;
        
        return {
            totalKeys,
            translatedKeys,
            missingKeys,
            completionPercentage: Math.min(100, completionPercentage),
            emptyTranslations
        };
    }
    
    /**
     * Comptage : clés de traduction récursif
     * @param {Object} obj - Objet de traductions
     * @return {number} - Nombre total de clés
     */
    countTranslationKeys(obj) {
        let count = 0;
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                if (typeof value === 'object' && value !== null) {
                    // Récursion : comptage dans les sous-objets
                    count += this.countTranslationKeys(value);
                } else if (typeof value === 'string') {
                    // Comptage : clé de traduction finale
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Comptage : traductions vides
     * @param {Object} obj - Objet de traductions
     * @return {number} - Nombre de traductions vides
     */
    countEmptyTranslations(obj) {
        let count = 0;
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                if (typeof value === 'object' && value !== null) {
                    // Récursion : comptage dans les sous-objets
                    count += this.countEmptyTranslations(value);
                } else if (typeof value === 'string' && (!value || value.trim().length === 0)) {
                    // Comptage : traduction vide
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * État : informations sur le gestionnaire
     * @return {Object} - État détaillé
     */
    getStatus() {
        return {
            currentLanguage: this.state.currentLanguage,
            availableLanguages: this.config.supportedLanguages,
            isLoading: this.state.isLoading,
            lastDetected: this.state.lastDetected,
            translationsLoaded: Array.from(this.state.translations.keys()),
            observers: this.observers.size
        };
    }
}

// Export ES6
export default LanguageManager;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}