/**
 * EDS Template Generator Framework - Version 2.0
 * 
 * Rôle : Framework générique de génération de templates e-commerce
 * Type : Script classique compatible navigateur sans ES6 modules
 * Fonctionnalités : Configuration, Storage, Interface Admin, Génération templates
 * Répertoire : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVSOLD
 * 
 * Mission : Créer des templates pour tout type de produit, mode de vente, langue
 * Extensibilité : Système de plugins pour ajouter de nouveaux types de templates
 */

(function(window) {
    'use strict';

    /**
     * Classe de configuration centralisée EDS Framework
     * 
     * Rôle : Gérer tous les paramètres du framework de manière centralisée
     * Type : Gestionnaire de configuration avec persistance localStorage
     */
    class EDSFrameworkConfig {
        constructor() {
            // Configuration : paramètres par défaut du framework générique
            this.config = {
                app: {
                    name: 'EDS Template Generator',
                    version: '2.0.0',
                    environment: 'production',
                    author: 'EDS Quebec'
                },
                admin: {
                    position: 'right',
                    autoHide: true,
                    enableDragDrop: true,
                    theme: 'modern'
                },
                sync: {
                    delay: 50,
                    maxRetries: 3,
                    storagePrefix: 'eds-template'
                },
                templates: {
                    defaultLanguage: 'fr',
                    supportedLanguages: ['fr', 'en', 'es', 'de'],
                    defaultMode: 'location',
                    supportedModes: ['location', 'vente', 'service', 'software']
                }
            };
        }

        /**
         * Récupération de valeur de configuration par chemin
         * 
         * Args:
         *   path (string): Chemin vers la configuration (ex. "app.name")
         * 
         * Returns:
         *   any: Valeur de configuration ou undefined si non trouvée
         * 
         * Exemple:
         *   config.get("app.name") → "EDS Template Generator"
         */
        get(path) {
            const keys = path.split('.');
            let value = this.config;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return undefined;
                }
            }
            
            return value;
        }

        /**
         * Définition de valeur de configuration
         * 
         * Args:
         *   path (string): Chemin vers la configuration
         *   value (any): Nouvelle valeur à assigner
         * 
         * Effets de bord:
         *   - Modifie la configuration en mémoire
         *   - Log la modification dans la console
         */
        set(path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let target = this.config;
            
            // Navigation : création du chemin si nécessaire
            for (const key of keys) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                target = target[key];
            }
            
            target[lastKey] = value;
            console.log(`📝 EDS Config mise à jour: ${path} = ${value}`);
        }

        /**
         * Chargement de la configuration depuis localStorage
         * 
         * Returns:
         *   boolean: true si chargement réussi, false sinon
         */
        loadFromStorage() {
            try {
                const stored = localStorage.getItem('eds-framework-config');
                if (stored) {
                    const parsedConfig = JSON.parse(stored);
                    this.config = { ...this.config, ...parsedConfig };
                    console.log('📥 Configuration EDS chargée depuis localStorage');
                    return true;
                }
            } catch (error) {
                console.warn('⚠️ Erreur chargement config EDS:', error);
            }
            return false;
        }

        /**
         * Sauvegarde de la configuration vers localStorage
         * 
         * Returns:
         *   boolean: true si sauvegarde réussie, false sinon
         */
        saveToStorage() {
            try {
                localStorage.setItem('eds-framework-config', JSON.stringify(this.config));
                console.log('💾 Configuration EDS sauvegardée');
                return true;
            } catch (error) {
                console.warn('⚠️ Erreur sauvegarde config EDS:', error);
                return false;
            }
        }
    }

    /**
     * Gestionnaire de templates produits
     * 
     * Rôle : Créer et gérer des templates pour différents produits
     * Type : Fabrique de templates avec support multi-langues et multi-modes
     */
    class EDSTemplateManager {
        constructor(config) {
            this.config = config;
            
            // Catalogue : templates de produits prédéfinis
            this.productTemplates = {
                'licube-pro': {
                    name: 'Li-CUBE PRO™',
                    type: 'hardware',
                    category: 'location',
                    hasCompetitorComparison: true,
                    defaultLanguage: 'fr',
                    supportedLanguages: ['fr', 'en'],
                    description: 'Système de géolocalisation avancé pour véhicules'
                },
                'geekndragon-coins': {
                    name: 'Pièces Geek&Dragon',
                    type: 'collectible',
                    category: 'vente',
                    hasCompetitorComparison: false,
                    defaultLanguage: 'fr',
                    supportedLanguages: ['fr', 'en'],
                    description: 'Collection de pièces métalliques pour jeux de rôle'
                },
                'generic-product': {
                    name: 'Produit Générique',
                    type: 'generic',
                    category: 'vente',
                    hasCompetitorComparison: false,
                    defaultLanguage: 'fr',
                    supportedLanguages: ['fr', 'en', 'es', 'de'],
                    description: 'Template de base personnalisable'
                }
            };
            
            // Modes : différents types de présentation
            this.presentationModes = {
                'location': {
                    name: 'Location',
                    description: 'Mode location avec tarifs périodiques',
                    features: ['pricing-rental', 'availability-calendar', 'deposit-info']
                },
                'vente': {
                    name: 'Vente',
                    description: 'Mode vente avec prix fixe',
                    features: ['pricing-sale', 'stock-info', 'shipping-info']
                },
                'service': {
                    name: 'Service',
                    description: 'Mode prestation de service',
                    features: ['pricing-hourly', 'booking-system', 'testimonials']
                },
                'software': {
                    name: 'Logiciel',
                    description: 'Mode produit numérique',
                    features: ['pricing-subscription', 'demo-access', 'feature-comparison']
                }
            };
        }

        /**
         * Génération d'un template complet
         * 
         * Args:
         *   productId (string): Identifiant du produit
         *   mode (string): Mode de présentation ('location', 'vente', etc.)
         *   language (string): Code langue ('fr', 'en', etc.)
         *   options (object): Options supplémentaires
         * 
         * Returns:
         *   object: Configuration complète du template généré
         */
        generateTemplate(productId, mode, language, options = {}) {
            const product = this.productTemplates[productId];
            const presentationMode = this.presentationModes[mode];
            
            if (!product || !presentationMode) {
                throw new Error(`Template invalide: ${productId} / ${mode}`);
            }

            // Configuration : template de base
            const templateConfig = {
                product: {
                    id: productId,
                    name: product.name,
                    type: product.type,
                    category: product.category,
                    description: product.description
                },
                presentation: {
                    mode: mode,
                    language: language,
                    hasCompetitorComparison: product.hasCompetitorComparison,
                    features: presentationMode.features
                },
                generated: {
                    timestamp: new Date().toISOString(),
                    version: this.config.get('app.version'),
                    framework: this.config.get('app.name')
                },
                customizations: options
            };

            console.log(`🎨 Template généré: ${product.name} (${mode}/${language})`);
            return templateConfig;
        }

        /**
         * Liste des templates disponibles
         * 
         * Returns:
         *   array: Liste des produits disponibles avec leurs métadonnées
         */
        getAvailableTemplates() {
            return Object.keys(this.productTemplates).map(id => ({
                id,
                ...this.productTemplates[id]
            }));
        }

        /**
         * Ajout d'un nouveau template produit
         * 
         * Args:
         *   id (string): Identifiant unique du produit
         *   templateData (object): Configuration du template
         */
        addProductTemplate(id, templateData) {
            this.productTemplates[id] = templateData;
            console.log(`➕ Nouveau template ajouté: ${id}`);
        }
    }

    /**
     * Interface d'administration EDS Framework
     * 
     * Rôle : Interface graphique pour gérer templates et configuration
     * Type : Modal avec onglets pour différentes fonctionnalités
     */
    class EDSAdminInterface {
        constructor(config, templateManager) {
            this.config = config;
            this.templateManager = templateManager;
            this.isVisible = false;
            this.element = null;
            this.currentTab = 'system';
        }

        /**
         * Affichage de l'interface d'administration
         * 
         * Effets de bord:
         *   - Crée et affiche la modal d'administration
         *   - Ajoute les styles CSS nécessaires
         */
        show() {
            if (!this.element) {
                this.createElement();
                this.addStyles();
            }
            
            this.element.style.display = 'flex';
            this.isVisible = true;
            document.body.classList.add('eds-admin-active');
            console.log('🎛️ Interface EDS Admin ouverte');
        }

        /**
         * Masquage de l'interface d'administration
         */
        hide() {
            if (this.element) {
                this.element.style.display = 'none';
            }
            this.isVisible = false;
            document.body.classList.remove('eds-admin-active');
            console.log('🎛️ Interface EDS Admin fermée');
        }

        /**
         * Basculement de visibilité de l'interface
         */
        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }

        /**
         * Création de l'élément DOM de l'interface
         */
        createElement() {
            const modal = document.createElement('div');
            modal.id = 'eds-admin-interface';
            modal.className = 'eds-admin-modal';
            
            modal.innerHTML = `
                <div class="eds-admin-overlay" onclick="window.EDSFramework.admin.hide()">
                    <div class="eds-admin-panel" onclick="event.stopPropagation()">
                        <div class="eds-admin-header">
                            <div class="eds-admin-logo">
                                <i class="fas fa-magic"></i>
                                <h2>EDS Template Generator</h2>
                                <span class="eds-version">v${this.config.get('app.version')}</span>
                            </div>
                            <button class="eds-admin-close" onclick="window.EDSFramework.admin.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="eds-admin-content">
                            <div class="eds-admin-tabs">
                                <button class="eds-tab-btn active" onclick="window.EDSFramework.admin.showTab('system')">
                                    <i class="fas fa-info-circle"></i> Système
                                </button>
                                <button class="eds-tab-btn" onclick="window.EDSFramework.admin.showTab('templates')">
                                    <i class="fas fa-layer-group"></i> Templates
                                </button>
                                <button class="eds-tab-btn" onclick="window.EDSFramework.admin.showTab('generator')">
                                    <i class="fas fa-magic"></i> Générateur
                                </button>
                                <button class="eds-tab-btn" onclick="window.EDSFramework.admin.showTab('products')">
                                    <i class="fas fa-cube"></i> Produits
                                </button>
                                <button class="eds-tab-btn" onclick="window.EDSFramework.admin.showTab('settings')">
                                    <i class="fas fa-cog"></i> Paramètres
                                </button>
                            </div>
                            
                            <div class="eds-admin-body">
                                ${this.createSystemTab()}
                                ${this.createTemplatesTab()}
                                ${this.createGeneratorTab()}
                                ${this.createProductsTab()}
                                ${this.createSettingsTab()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.element = modal;
        }

        /**
         * Création de l'onglet Système
         * 
         * Returns:
         *   string: HTML de l'onglet système
         */
        createSystemTab() {
            const templates = this.templateManager.getAvailableTemplates();
            
            return `
                <div id="eds-tab-system" class="eds-tab-content active">
                    <h3><i class="fas fa-info-circle"></i> Informations Système</h3>
                    
                    <div class="eds-info-grid">
                        <div class="eds-info-card">
                            <h4>Framework</h4>
                            <p><strong>${this.config.get('app.name')}</strong></p>
                            <p>Version ${this.config.get('app.version')}</p>
                            <p>Par ${this.config.get('app.author')}</p>
                        </div>
                        
                        <div class="eds-info-card">
                            <h4>Templates Disponibles</h4>
                            <p><strong>${templates.length}</strong> produits</p>
                            <ul>
                                ${templates.map(t => `<li>${t.name} (${t.type})</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="eds-info-card">
                            <h4>Modes Supportés</h4>
                            <p><strong>${Object.keys(this.templateManager.presentationModes).length}</strong> modes</p>
                            <ul>
                                ${Object.values(this.templateManager.presentationModes).map(m => `<li>${m.name}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="eds-info-card">
                            <h4>Langues Supportées</h4>
                            <p><strong>${this.config.get('templates.supportedLanguages').length}</strong> langues</p>
                            <ul>
                                ${this.config.get('templates.supportedLanguages').map(l => `<li>${l.toUpperCase()}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Création de l'onglet Templates
         */
        createTemplatesTab() {
            const templates = this.templateManager.getAvailableTemplates();
            
            return `
                <div id="eds-tab-templates" class="eds-tab-content">
                    <h3><i class="fas fa-layer-group"></i> Gestion des Templates</h3>
                    
                    <div class="eds-templates-list">
                        ${templates.map(template => `
                            <div class="eds-template-card" data-template-id="${template.id}">
                                <div class="eds-template-header">
                                    <h4>${template.name}</h4>
                                    <span class="eds-template-type">${template.type}</span>
                                </div>
                                <p>${template.description}</p>
                                <div class="eds-template-meta">
                                    <span>Catégorie: ${template.category}</span>
                                    <span>Langues: ${template.supportedLanguages.join(', ')}</span>
                                    <span>Comparaison: ${template.hasCompetitorComparison ? 'Oui' : 'Non'}</span>
                                </div>
                                <div class="eds-template-actions">
                                    <button onclick="window.EDSFramework.admin.previewTemplate('${template.id}')" class="eds-btn eds-btn-primary">
                                        <i class="fas fa-eye"></i> Prévisualiser
                                    </button>
                                    <button onclick="window.EDSFramework.admin.editTemplate('${template.id}')" class="eds-btn eds-btn-secondary">
                                        <i class="fas fa-edit"></i> Éditer
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="eds-templates-actions">
                        <button onclick="window.EDSFramework.admin.createNewTemplate()" class="eds-btn eds-btn-primary">
                            <i class="fas fa-plus"></i> Nouveau Template
                        </button>
                        <button onclick="window.EDSFramework.admin.importTemplate()" class="eds-btn eds-btn-secondary">
                            <i class="fas fa-upload"></i> Importer Template
                        </button>
                    </div>
                </div>
            `;
        }

        /**
         * Création de l'onglet Générateur
         */
        createGeneratorTab() {
            const templates = this.templateManager.getAvailableTemplates();
            const modes = Object.keys(this.templateManager.presentationModes);
            const languages = this.config.get('templates.supportedLanguages');
            
            return `
                <div id="eds-tab-generator" class="eds-tab-content">
                    <h3><i class="fas fa-magic"></i> Générateur de Template</h3>
                    
                    <form id="eds-generator-form" class="eds-generator-form">
                        <div class="eds-form-group">
                            <label>Produit</label>
                            <select name="product" required>
                                <option value="">Sélectionnez un produit</option>
                                ${templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Mode de Présentation</label>
                            <select name="mode" required>
                                <option value="">Sélectionnez un mode</option>
                                ${modes.map(m => {
                                    const mode = this.templateManager.presentationModes[m];
                                    return `<option value="${m}">${mode.name} - ${mode.description}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Langue</label>
                            <select name="language" required>
                                <option value="">Sélectionnez une langue</option>
                                ${languages.map(l => `<option value="${l}">${l.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>
                                <input type="checkbox" name="includeComparison">
                                Inclure comparaison concurrentielle
                            </label>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Nom du fichier généré</label>
                            <input type="text" name="filename" placeholder="mon-template-personnalise">
                        </div>
                        
                        <div class="eds-generator-actions">
                            <button type="button" onclick="window.EDSFramework.admin.previewGenerated()" class="eds-btn eds-btn-secondary">
                                <i class="fas fa-eye"></i> Prévisualiser
                            </button>
                            <button type="button" onclick="window.EDSFramework.admin.generateTemplate()" class="eds-btn eds-btn-primary">
                                <i class="fas fa-magic"></i> Générer Template
                            </button>
                        </div>
                    </form>
                    
                    <div id="eds-generator-output" class="eds-generator-output" style="display: none;">
                        <h4>Template Généré</h4>
                        <pre id="eds-generated-config"></pre>
                        <div class="eds-generator-output-actions">
                            <button onclick="window.EDSFramework.admin.downloadGenerated()" class="eds-btn eds-btn-primary">
                                <i class="fas fa-download"></i> Télécharger
                            </button>
                            <button onclick="window.EDSFramework.admin.applyGenerated()" class="eds-btn eds-btn-secondary">
                                <i class="fas fa-check"></i> Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Création de l'onglet Produits
         */
        createProductsTab() {
            return `
                <div id="eds-tab-products" class="eds-tab-content">
                    <h3><i class="fas fa-cube"></i> Gestion des Produits</h3>
                    
                    <div class="eds-products-manager">
                        <div class="eds-form-group">
                            <label>Ajouter un nouveau produit</label>
                            <input type="text" id="new-product-id" placeholder="identifiant-produit">
                            <input type="text" id="new-product-name" placeholder="Nom du produit">
                            <select id="new-product-type">
                                <option value="hardware">Matériel</option>
                                <option value="software">Logiciel</option>
                                <option value="service">Service</option>
                                <option value="collectible">Collection</option>
                                <option value="generic">Générique</option>
                            </select>
                            <button onclick="window.EDSFramework.admin.addProduct()" class="eds-btn eds-btn-primary">
                                <i class="fas fa-plus"></i> Ajouter
                            </button>
                        </div>
                        
                        <div class="eds-products-list" id="eds-products-list">
                            <!-- Liste dynamique des produits -->
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Création de l'onglet Paramètres
         */
        createSettingsTab() {
            return `
                <div id="eds-tab-settings" class="eds-tab-content">
                    <h3><i class="fas fa-cog"></i> Paramètres du Framework</h3>
                    
                    <div class="eds-settings-form">
                        <div class="eds-form-group">
                            <label>Langue par défaut</label>
                            <select id="default-language">
                                ${this.config.get('templates.supportedLanguages').map(l => 
                                    `<option value="${l}" ${l === this.config.get('templates.defaultLanguage') ? 'selected' : ''}>${l.toUpperCase()}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Mode par défaut</label>
                            <select id="default-mode">
                                ${Object.keys(this.templateManager.presentationModes).map(m => 
                                    `<option value="${m}" ${m === this.config.get('templates.defaultMode') ? 'selected' : ''}>${this.templateManager.presentationModes[m].name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Délai de synchronisation (ms)</label>
                            <input type="number" id="sync-delay" value="${this.config.get('sync.delay')}" min="10" max="1000">
                        </div>
                        
                        <div class="eds-form-group">
                            <label>Position interface admin</label>
                            <select id="admin-position">
                                <option value="right" ${this.config.get('admin.position') === 'right' ? 'selected' : ''}>Droite</option>
                                <option value="left" ${this.config.get('admin.position') === 'left' ? 'selected' : ''}>Gauche</option>
                                <option value="top" ${this.config.get('admin.position') === 'top' ? 'selected' : ''}>Haut</option>
                                <option value="bottom" ${this.config.get('admin.position') === 'bottom' ? 'selected' : ''}>Bas</option>
                            </select>
                        </div>
                        
                        <div class="eds-settings-actions">
                            <button onclick="window.EDSFramework.admin.saveSettings()" class="eds-btn eds-btn-primary">
                                <i class="fas fa-save"></i> Sauvegarder
                            </button>
                            <button onclick="window.EDSFramework.admin.resetSettings()" class="eds-btn eds-btn-danger">
                                <i class="fas fa-undo"></i> Réinitialiser
                            </button>
                            <button onclick="window.EDSFramework.admin.exportConfig()" class="eds-btn eds-btn-secondary">
                                <i class="fas fa-download"></i> Exporter Config
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Affichage d'un onglet spécifique
         * 
         * Args:
         *   tabName (string): Nom de l'onglet à afficher
         */
        showTab(tabName) {
            // Masquage : tous les onglets
            document.querySelectorAll('.eds-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelectorAll('.eds-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Affichage : onglet sélectionné
            const targetTab = document.getElementById(`eds-tab-${tabName}`);
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // Activation : bouton correspondant
            const targetBtn = document.querySelector(`[onclick="window.EDSFramework.admin.showTab('${tabName}')"]`);
            if (targetBtn) {
                targetBtn.classList.add('active');
            }

            this.currentTab = tabName;
            console.log(`📑 Onglet EDS activé: ${tabName}`);
        }

        /**
         * Génération d'un template via l'interface
         */
        generateTemplate() {
            const form = document.getElementById('eds-generator-form');
            const formData = new FormData(form);
            
            const config = {
                product: formData.get('product'),
                mode: formData.get('mode'),
                language: formData.get('language'),
                includeComparison: formData.get('includeComparison') === 'on',
                filename: formData.get('filename') || 'template-generated'
            };

            try {
                const template = this.templateManager.generateTemplate(
                    config.product,
                    config.mode,
                    config.language,
                    { includeComparison: config.includeComparison }
                );

                // Affichage : résultat de génération
                const outputDiv = document.getElementById('eds-generator-output');
                const configPre = document.getElementById('eds-generated-config');
                
                configPre.textContent = JSON.stringify(template, null, 2);
                outputDiv.style.display = 'block';
                
                console.log('✨ Template généré avec succès:', template);
                
            } catch (error) {
                console.error('❌ Erreur génération template:', error);
                alert(`Erreur lors de la génération: ${error.message}`);
            }
        }

        /**
         * Ajout des styles CSS pour l'interface
         */
        addStyles() {
            if (document.getElementById('eds-admin-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'eds-admin-styles';
            styles.textContent = `
                .eds-admin-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: none;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .eds-admin-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .eds-admin-panel {
                    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    width: 90vw;
                    max-width: 1200px;
                    height: 90vh;
                    max-height: 800px;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #334155;
                }
                
                .eds-admin-header {
                    padding: 20px 30px;
                    border-bottom: 1px solid #334155;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(16, 185, 129, 0.1);
                }
                
                .eds-admin-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .eds-admin-logo i {
                    color: #10B981;
                    font-size: 28px;
                }
                
                .eds-admin-logo h2 {
                    color: #F8FAFC;
                    margin: 0;
                    font-size: 24px;
                    font-weight: 800;
                }
                
                .eds-version {
                    background: #10B981;
                    color: #0F172A;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                }
                
                .eds-admin-close {
                    background: transparent;
                    border: none;
                    color: #CBD5E1;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .eds-admin-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #EF4444;
                }
                
                .eds-admin-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }
                
                .eds-admin-tabs {
                    width: 200px;
                    background: rgba(30, 41, 59, 0.5);
                    border-right: 1px solid #334155;
                    padding: 20px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .eds-tab-btn {
                    background: transparent;
                    border: none;
                    color: #CBD5E1;
                    padding: 12px 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .eds-tab-btn:hover {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10B981;
                }
                
                .eds-tab-btn.active {
                    background: linear-gradient(90deg, #10B981, #14B8A6);
                    color: #0F172A;
                    font-weight: 700;
                }
                
                .eds-admin-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 30px;
                }
                
                .eds-tab-content {
                    display: none;
                }
                
                .eds-tab-content.active {
                    display: block;
                }
                
                .eds-tab-content h3 {
                    color: #F8FAFC;
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .eds-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .eds-info-card {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 20px;
                }
                
                .eds-info-card h4 {
                    color: #10B981;
                    margin: 0 0 10px 0;
                    font-size: 16px;
                    font-weight: 700;
                }
                
                .eds-info-card p {
                    color: #CBD5E1;
                    margin: 0 0 10px 0;
                    font-size: 14px;
                }
                
                .eds-info-card ul {
                    color: #9CA3AF;
                    font-size: 12px;
                    margin: 0;
                    padding-left: 20px;
                }
                
                .eds-templates-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .eds-template-card {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s ease;
                }
                
                .eds-template-card:hover {
                    border-color: #10B981;
                    box-shadow: 0 8px 25px -8px rgba(16, 185, 129, 0.3);
                }
                
                .eds-template-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .eds-template-header h4 {
                    color: #F8FAFC;
                    margin: 0;
                    font-size: 16px;
                    font-weight: 700;
                }
                
                .eds-template-type {
                    background: #14B8A6;
                    color: #0F172A;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                
                .eds-template-card p {
                    color: #CBD5E1;
                    font-size: 14px;
                    margin: 0 0 15px 0;
                    line-height: 1.5;
                }
                
                .eds-template-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                
                .eds-template-meta span {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9CA3AF;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .eds-template-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .eds-btn {
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .eds-btn-primary {
                    background: linear-gradient(135deg, #10B981, #14B8A6);
                    color: #0F172A;
                }
                
                .eds-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }
                
                .eds-btn-secondary {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3B82F6;
                    border: 1px solid #3B82F6;
                }
                
                .eds-btn-secondary:hover {
                    background: rgba(59, 130, 246, 0.2);
                }
                
                .eds-btn-danger {
                    background: rgba(239, 68, 68, 0.1);
                    color: #EF4444;
                    border: 1px solid #EF4444;
                }
                
                .eds-btn-danger:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
                
                .eds-generator-form {
                    background: rgba(30, 41, 59, 0.3);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 20px;
                }
                
                .eds-form-group {
                    margin-bottom: 20px;
                }
                
                .eds-form-group label {
                    display: block;
                    color: #F8FAFC;
                    font-weight: 600;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                
                .eds-form-group input,
                .eds-form-group select {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid #334155;
                    border-radius: 8px;
                    color: #F8FAFC;
                    font-size: 14px;
                }
                
                .eds-form-group input:focus,
                .eds-form-group select:focus {
                    outline: none;
                    border-color: #10B981;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                }
                
                .eds-generator-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                
                .eds-generator-output {
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 20px;
                }
                
                .eds-generator-output h4 {
                    color: #10B981;
                    margin: 0 0 15px 0;
                    font-size: 16px;
                }
                
                .eds-generator-output pre {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid #334155;
                    border-radius: 8px;
                    padding: 15px;
                    color: #CBD5E1;
                    font-size: 12px;
                    line-height: 1.5;
                    overflow-x: auto;
                    margin-bottom: 15px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .eds-generator-output-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                @media (max-width: 768px) {
                    .eds-admin-panel {
                        width: 95vw;
                        height: 95vh;
                    }
                    
                    .eds-admin-content {
                        flex-direction: column;
                    }
                    
                    .eds-admin-tabs {
                        width: 100%;
                        flex-direction: row;
                        overflow-x: auto;
                        border-right: none;
                        border-bottom: 1px solid #334155;
                    }
                    
                    .eds-info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .eds-templates-list {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            
            document.head.appendChild(styles);
        }
    }

    /**
     * Classe principale EDS Framework
     * 
     * Rôle : Orchestrateur central du framework de génération de templates
     * Type : Singleton - Instance unique partagée globalement
     */
    class EDSFramework {
        constructor() {
            console.log('🚀 Initialisation EDS Template Generator Framework');
            
            // Initialisation : composants principaux
            this.config = new EDSFrameworkConfig();
            this.templateManager = new EDSTemplateManager(this.config);
            this.admin = new EDSAdminInterface(this.config, this.templateManager);
            
            // Chargement : configuration persistée
            this.config.loadFromStorage();
            
            console.log(`✅ Framework EDS initialisé - ${this.config.get('app.name')} v${this.config.get('app.version')}`);
        }

        /**
         * Méthode de démarrage du framework
         * 
         * Effets de bord:
         *   - Initialise les event listeners
         *   - Configure l'environnement
         *   - Prépare l'interface utilisateur
         */
        initialize() {
            console.log('⚡ Démarrage du framework EDS');
            
            // Configuration : événements globaux
            this.setupGlobalEvents();
            
            // Exposition : méthodes publiques
            this.exposePublicAPI();
            
            console.log('🎯 Framework EDS prêt à l'emploi');
        }

        /**
         * Configuration des événements globaux
         */
        setupGlobalEvents() {
            // Gestion : raccourcis clavier
            document.addEventListener('keydown', (event) => {
                // F12 : Interface d'administration (au lieu de F11)
                if (event.key === 'F12') {
                    event.preventDefault();
                    this.admin.toggle();
                }
                
                // Échap : Fermer interface admin
                if (event.key === 'Escape' && this.admin.isVisible) {
                    this.admin.hide();
                }
            });
            
            // Sauvegarde : configuration périodique
            setInterval(() => {
                this.config.saveToStorage();
            }, 30000); // Sauvegarde toutes les 30 secondes
        }

        /**
         * Exposition de l'API publique dans window
         */
        exposePublicAPI() {
            // API publique : accès aux fonctionnalités principales
            window.EDSFramework = {
                // Framework principal
                framework: this,
                config: this.config,
                templates: this.templateManager,
                admin: this.admin,
                
                // Méthodes de convenance
                showAdmin: () => this.admin.show(),
                hideAdmin: () => this.admin.hide(),
                toggleAdmin: () => this.admin.toggle(),
                generateTemplate: (productId, mode, language, options) => 
                    this.templateManager.generateTemplate(productId, mode, language, options),
                
                // Version et informations
                version: this.config.get('app.version'),
                name: this.config.get('app.name')
            };
            
            console.log('🌍 API publique EDS exposée dans window.EDSFramework');
        }
    }

    // Initialisation : création de l'instance principale
    const framework = new EDSFramework();
    
    // Démarrage : quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => framework.initialize());
    } else {
        framework.initialize();
    }
    
    // Exposition : instance globale pour compatibilité
    window.EDSFramework = framework;

})(window);