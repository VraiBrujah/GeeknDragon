/**
 * Interface d'Administration Li-CUBE PRO™
 * 
 * Rôle : Interface utilisateur pour la gestion visuelle des sections et contenus
 * Responsabilité : Panneau d'administration drag & drop avec prévisualisation temps réel
 * Extensibilité : Interface modulaire pour nouveaux types de contenus
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class AdminInterface {
    constructor(framework, sectionManager) {
        // Rôle : Services injectés
        this.framework = framework;
        this.sectionManager = sectionManager;
        this.languageManager = framework.getService('LanguageManager');
        
        // Rôle : Configuration de l'interface
        this.config = {
            panelPosition: 'right',    // Position du panneau admin
            autoHide: true,            // Masquage automatique en mode présentation
            enableDragDrop: true,      // Drag & drop des sections
            enablePreview: true,       // Prévisualisation temps réel
            enableKeyboardShortcuts: true // Raccourcis clavier
        };
        
        // Rôle : État de l'interface
        this.state = {
            isVisible: false,          // Panneau visible ou masqué
            activeTab: 'sections',     // Onglet actif (sections, templates, settings)
            selectedSection: null,     // Section actuellement sélectionnée
            draggedElement: null,      // Élément en cours de déplacement
            isPreviewMode: false       // Mode prévisualisation active
        };
        
        // Rôle : Éléments DOM de l'interface
        this.elements = {
            panel: null,               // Panneau principal
            toolbar: null,             // Barre d'outils
            sectionsTab: null,         // Onglet sections
            templatesTab: null,        // Onglet templates
            settingsTab: null          // Onglet paramètres
        };
        
        this.init();
    }
    
    /**
     * Initialisation : création de l'interface complète
     */
    init() {
        // Vérification : mode édition uniquement
        if (!this.isEditMode()) {
            console.log('🚫 AdminInterface désactivée en mode présentation');
            return;
        }
        
        // Création : structure de l'interface
        this.createMainInterface();
        
        // Configuration : drag & drop
        this.initializeDragDrop();
        
        // Configuration : raccourcis clavier
        this.initializeKeyboardShortcuts();
        
        // Configuration : synchronisation temps réel
        this.initializeRealtimeSync();
        
        // Configuration : système multilingue
        this.initializeLanguageSupport();
        
        // Liaison : événements du SectionManager
        this.bindSectionManagerEvents();
        
        console.log('✅ AdminInterface initialisée');
    }
    
    /**
     * Création : interface principale
     */
    createMainInterface() {
        // Panneau : structure principale
        this.elements.panel = this.createElement('div', {
            id: 'admin-panel',
            className: `admin-panel panel-${this.config.panelPosition}`,
            innerHTML: this.getMainPanelHTML()
        });
        
        // Insertion : dans le DOM
        document.body.appendChild(this.elements.panel);
        
        // Configuration : événements du panneau
        this.setupPanelEvents();
        
        // Initialisation : onglets
        this.initializeTabs();
        
        // État initial : masqué si auto-hide activé
        if (this.config.autoHide) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * HTML : panneau principal
     * @return {string} - Structure HTML complète
     */
    getMainPanelHTML() {
        return `
            <!-- Barre de titre avec contrôles -->
            <div class="admin-panel-header">
                <div class="panel-title">
                    <i class="fas fa-cogs"></i>
                    <span>Li-CUBE PRO™ Admin</span>
                </div>
                <div class="panel-controls">
                    <button class="btn-minimize" title="Réduire">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn-preview" title="Prévisualiser (Ctrl+P)">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-close" title="Fermer (Echap)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Navigation par onglets -->
            <div class="admin-panel-tabs">
                <button class="tab-button active" data-tab="sections">
                    <i class="fas fa-layer-group"></i>
                    <span>Sections</span>
                </button>
                <button class="tab-button" data-tab="templates">
                    <i class="fas fa-th-large"></i>
                    <span>Templates</span>
                </button>
                <button class="tab-button" data-tab="content">
                    <i class="fas fa-edit"></i>
                    <span>Contenu</span>
                </button>
                <button class="tab-button" data-tab="languages">
                    <i class="fas fa-globe"></i>
                    <span>Langues</span>
                </button>
                <button class="tab-button" data-tab="settings">
                    <i class="fas fa-cog"></i>
                    <span>Paramètres</span>
                </button>
            </div>
            
            <!-- Contenu des onglets -->
            <div class="admin-panel-content">
                
                <!-- Onglet : Gestion des sections -->
                <div class="tab-content active" data-tab-content="sections">
                    <div class="section-toolbar">
                        <button class="btn-add-section primary">
                            <i class="fas fa-plus"></i>
                            Ajouter Section
                        </button>
                        <button class="btn-import-template">
                            <i class="fas fa-download"></i>
                            Importer
                        </button>
                        <button class="btn-export-structure">
                            <i class="fas fa-upload"></i>
                            Exporter
                        </button>
                    </div>
                    
                    <div class="sections-list" id="sections-list">
                        <!-- Liste des sections générée dynamiquement -->
                    </div>
                </div>
                
                <!-- Onglet : Templates disponibles -->
                <div class="tab-content" data-tab-content="templates">
                    <div class="templates-search">
                        <input type="text" placeholder="Rechercher templates..." class="search-input">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <div class="templates-grid" id="templates-grid">
                        <!-- Templates disponibles générés dynamiquement -->
                    </div>
                </div>
                
                <!-- Onglet : Édition de contenu -->
                <div class="tab-content" data-tab-content="content">
                    <div class="content-editor" id="content-editor">
                        <div class="no-selection">
                            <i class="fas fa-mouse-pointer"></i>
                            <p>Sélectionnez une section pour l'éditer</p>
                        </div>
                    </div>
                </div>
                
                <!-- Onglet : Gestion des langues -->
                <div class="tab-content" data-tab-content="languages">
                    <div class="languages-placeholder">
                        <i class="fas fa-globe"></i>
                        <p>Chargement de la gestion des langues...</p>
                    </div>
                </div>
                
                <!-- Onglet : Paramètres -->
                <div class="tab-content" data-tab-content="settings">
                    <div class="settings-groups">
                        
                        <!-- Groupe : Interface -->
                        <div class="settings-group">
                            <h3>Interface</h3>
                            <div class="setting-item">
                                <label>Position du panneau</label>
                                <select class="setting-select" data-setting="panelPosition">
                                    <option value="right">Droite</option>
                                    <option value="left">Gauche</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" class="setting-checkbox" data-setting="autoHide" checked>
                                    Masquer automatiquement en mode présentation
                                </label>
                            </div>
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" class="setting-checkbox" data-setting="enableDragDrop" checked>
                                    Activer le drag & drop
                                </label>
                            </div>
                        </div>
                        
                        <!-- Groupe : Synchronisation -->
                        <div class="settings-group">
                            <h3>Synchronisation</h3>
                            <div class="setting-item">
                                <label>
                                    <input type="checkbox" class="setting-checkbox" data-setting="enablePreview" checked>
                                    Prévisualisation temps réel
                                </label>
                            </div>
                            <div class="setting-item">
                                <label>Délai de synchronisation (ms)</label>
                                <input type="number" class="setting-input" data-setting="syncDelay" value="50" min="10" max="1000">
                            </div>
                        </div>
                        
                        <!-- Groupe : Raccourcis -->
                        <div class="settings-group">
                            <h3>Raccourcis Clavier</h3>
                            <div class="shortcuts-list">
                                <div class="shortcut-item">
                                    <kbd>Ctrl</kbd> + <kbd>P</kbd> : Prévisualiser
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Ctrl</kbd> + <kbd>S</kbd> : Sauvegarder
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Ctrl</kbd> + <kbd>D</kbd> : Dupliquer section
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Échap</kbd> : Fermer panneau
                                </div>
                                <div class="shortcut-item">
                                    <kbd>F11</kbd> : Basculer admin
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Barre de statut -->
            <div class="admin-panel-footer">
                <div class="status-info">
                    <span class="sync-status">
                        <i class="fas fa-circle status-indicator"></i>
                        <span class="status-text">Synchronisé</span>
                    </span>
                    <span class="sections-count">0 sections</span>
                </div>
                <div class="footer-actions">
                    <button class="btn-help" title="Aide">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Configuration : événements du panneau
     */
    setupPanelEvents() {
        const panel = this.elements.panel;
        
        // Contrôles : header
        panel.querySelector('.btn-minimize').addEventListener('click', () => this.toggle());
        panel.querySelector('.btn-preview').addEventListener('click', () => this.togglePreview());
        panel.querySelector('.btn-close').addEventListener('click', () => this.hide());
        
        // Navigation : onglets
        panel.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-button').dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Actions : sections
        panel.querySelector('.btn-add-section').addEventListener('click', () => this.showAddSectionDialog());
        panel.querySelector('.btn-import-template').addEventListener('click', () => this.importTemplate());
        panel.querySelector('.btn-export-structure').addEventListener('click', () => this.exportStructure());
        
        // Recherche : templates
        const searchInput = panel.querySelector('.templates-search .search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTemplates(e.target.value));
        }
        
        // Paramètres : événements de configuration
        panel.querySelectorAll('[data-setting]').forEach(input => {
            const eventType = input.type === 'checkbox' ? 'change' : 'input';
            input.addEventListener(eventType, (e) => {
                const setting = e.target.dataset.setting;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.updateSetting(setting, value);
            });
        });
        
        // Aide
        panel.querySelector('.btn-help').addEventListener('click', () => this.showHelpDialog());
    }
    
    /**
     * Initialisation : onglets
     */
    initializeTabs() {
        // Peuplement : liste des sections
        this.refreshSectionsList();
        
        // Peuplement : grille des templates
        this.refreshTemplatesGrid();
        
        // Mise à jour : compteur de sections
        this.updateSectionsCount();
    }
    
    /**
     * Actualisation : liste des sections
     */
    refreshSectionsList() {
        const sectionsList = this.elements.panel.querySelector('#sections-list');
        const sections = Array.from(this.sectionManager.sectionsState.sections.values());
        
        // Tri : par ordre d'affichage
        sections.sort((a, b) => a.position - b.position);
        
        // Génération : HTML des sections
        sectionsList.innerHTML = sections.map(section => this.getSectionItemHTML(section)).join('');
        
        // Configuration : événements drag & drop
        this.setupSectionListDragDrop(sectionsList);
    }
    
    /**
     * HTML : élément de section dans la liste
     * @param {Object} section - Configuration de section
     * @return {string} - HTML de l'élément
     */
    getSectionItemHTML(section) {
        const template = this.sectionManager.sectionTemplates.get(section.templateId);
        const isActive = this.state.selectedSection === section.id;
        
        return `
            <div class="section-item ${isActive ? 'active' : ''}" 
                 data-section-id="${section.id}"
                 data-template-id="${section.templateId}"
                 draggable="${this.config.enableDragDrop}">
                
                <div class="section-header">
                    <div class="section-icon">
                        <i class="${template?.icon || 'fas fa-layer-group'}"></i>
                    </div>
                    <div class="section-info">
                        <h4 class="section-name">${section.name}</h4>
                        <p class="section-template">${template?.name || 'Template inconnu'}</p>
                        <span class="section-fields">${section.fields.size} champs</span>
                    </div>
                </div>
                
                <div class="section-actions">
                    <button class="btn-edit" data-action="edit" title="Éditer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-duplicate" data-action="duplicate" title="Dupliquer">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-move-up" data-action="move-up" title="Monter">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" title="Descendre">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete" data-action="delete" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="section-status">
                    <span class="visibility-indicator ${section.isVisible ? 'visible' : 'hidden'}" 
                          title="${section.isVisible ? 'Visible' : 'Masquée'}">
                        <i class="fas fa-eye${section.isVisible ? '' : '-slash'}"></i>
                    </span>
                </div>
            </div>
        `;
    }
    
    /**
     * Actualisation : grille des templates
     */
    refreshTemplatesGrid() {
        const templatesGrid = this.elements.panel.querySelector('#templates-grid');
        const templates = this.sectionManager.getAvailableTemplates();
        
        // Génération : HTML des templates
        templatesGrid.innerHTML = templates.map(template => this.getTemplateCardHTML(template)).join('');
        
        // Configuration : événements des cartes
        templatesGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (card) {
                const templateId = card.dataset.templateId;
                this.createSectionFromTemplate(templateId);
            }
        });
    }
    
    /**
     * HTML : carte de template
     * @param {Object} template - Configuration de template
     * @return {string} - HTML de la carte
     */
    getTemplateCardHTML(template) {
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <i class="${template.icon || 'fas fa-layer-group'}"></i>
                </div>
                <div class="template-info">
                    <h4 class="template-name">${template.name}</h4>
                    <p class="template-description">${template.description || ''}</p>
                    <div class="template-components">
                        ${template.allowedComponents.slice(0, 3).map(comp => 
                            `<span class="component-tag">${comp}</span>`
                        ).join('')}
                        ${template.allowedComponents.length > 3 ? 
                            `<span class="more-components">+${template.allowedComponents.length - 3}</span>` : ''
                        }
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn-use-template">
                        <i class="fas fa-plus"></i>
                        Utiliser
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Affichage : dialog d'ajout de section
     */
    async showAddSectionDialog() {
        // Création : dialog modal
        const dialog = this.createElement('div', {
            className: 'add-section-dialog',
            innerHTML: `
                <div class="dialog-backdrop"></div>
                <div class="dialog-content">
                    <div class="dialog-header">
                        <h3>Ajouter une nouvelle section</h3>
                        <button class="btn-close-dialog">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="dialog-body">
                        <div class="templates-quick-grid">
                            ${this.sectionManager.getAvailableTemplates().map(template => `
                                <button class="quick-template-btn" data-template-id="${template.id}">
                                    <i class="${template.icon}"></i>
                                    <span>${template.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `
        });
        
        document.body.appendChild(dialog);
        
        // Gestion : sélection de template
        dialog.addEventListener('click', async (e) => {
            const templateBtn = e.target.closest('.quick-template-btn');
            const closeBtn = e.target.closest('.btn-close-dialog');
            const backdrop = e.target.classList.contains('dialog-backdrop');
            
            if (templateBtn) {
                const templateId = templateBtn.dataset.templateId;
                await this.createSectionFromTemplate(templateId);
                dialog.remove();
            } else if (closeBtn || backdrop) {
                dialog.remove();
            }
        });
    }
    
    /**
     * Création : section depuis template
     * @param {string} templateId - ID du template à utiliser
     */
    async createSectionFromTemplate(templateId) {
        try {
            const section = await this.sectionManager.createSection(templateId);
            
            // Actualisation : interface
            this.refreshSectionsList();
            this.updateSectionsCount();
            
            // Sélection : nouvelle section
            this.selectSection(section.id);
            
            // Notification : succès
            this.showNotification(`Section "${section.name}" créée avec succès`, 'success');
            
        } catch (error) {
            console.error('Erreur création section:', error);
            this.showNotification(`Erreur: ${error.message}`, 'error');
        }
    }
    
    /**
     * Sélection : section pour édition
     * @param {string} sectionId - ID de la section à sélectionner
     */
    selectSection(sectionId) {
        // Mise à jour : état
        this.state.selectedSection = sectionId;
        
        // Mise à jour : visuel de la liste
        this.elements.panel.querySelectorAll('.section-item').forEach(item => {
            item.classList.toggle('active', item.dataset.sectionId === sectionId);
        });
        
        // Mise à jour : éditeur de contenu
        this.updateContentEditor(sectionId);
        
        // Basculement : onglet contenu si section sélectionnée
        if (sectionId && this.state.activeTab !== 'content') {
            this.switchTab('content');
        }
    }
    
    /**
     * Mise à jour : éditeur de contenu
     * @param {string} sectionId - ID de la section à éditer
     */
    updateContentEditor(sectionId) {
        const contentEditor = this.elements.panel.querySelector('#content-editor');
        
        if (!sectionId) {
            contentEditor.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Sélectionnez une section pour l'éditer</p>
                </div>
            `;
            return;
        }
        
        const section = this.sectionManager.sectionsState.sections.get(sectionId);
        if (!section) return;
        
        // Génération : interface d'édition
        contentEditor.innerHTML = this.getContentEditorHTML(section);
        
        // Configuration : événements d'édition
        this.setupContentEditorEvents(contentEditor, section);
    }
    
    /**
     * HTML : éditeur de contenu
     * @param {Object} section - Configuration de section
     * @return {string} - HTML de l'éditeur
     */
    getContentEditorHTML(section) {
        const template = this.sectionManager.sectionTemplates.get(section.templateId);
        
        return `
            <div class="content-editor-header">
                <h3>Édition : ${section.name}</h3>
                <span class="template-badge">${template?.name || 'Template inconnu'}</span>
            </div>
            
            <div class="content-editor-body">
                <!-- Propriétés de la section -->
                <div class="editor-group">
                    <h4>Propriétés de la section</h4>
                    <div class="form-field">
                        <label>Nom de la section</label>
                        <input type="text" class="field-input" data-field="name" value="${section.name}">
                    </div>
                    <div class="form-field">
                        <label>
                            <input type="checkbox" data-field="isVisible" ${section.isVisible ? 'checked' : ''}>
                            Section visible
                        </label>
                    </div>
                </div>
                
                <!-- Champs de la section -->
                <div class="editor-group">
                    <div class="group-header">
                        <h4>Champs (${section.fields.size})</h4>
                        <button class="btn-add-field-editor">
                            <i class="fas fa-plus"></i> Ajouter champ
                        </button>
                    </div>
                    
                    <div class="fields-list">
                        ${Array.from(section.fields.values()).map(field => 
                            this.getFieldEditorHTML(field)
                        ).join('')}
                    </div>
                </div>
                
                <!-- Actions sur la section -->
                <div class="editor-group">
                    <h4>Actions</h4>
                    <div class="action-buttons">
                        <button class="btn-duplicate-section">
                            <i class="fas fa-copy"></i> Dupliquer section
                        </button>
                        <button class="btn-export-section">
                            <i class="fas fa-download"></i> Exporter section
                        </button>
                        <button class="btn-delete-section danger">
                            <i class="fas fa-trash"></i> Supprimer section
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * HTML : éditeur de champ
     * @param {Object} field - Configuration de champ
     * @return {string} - HTML de l'éditeur de champ
     */
    getFieldEditorHTML(field) {
        return `
            <div class="field-editor-item" data-field-id="${field.id}">
                <div class="field-editor-header">
                    <div class="field-icon">
                        <i class="fas fa-${this.getFieldIcon(field.type)}"></i>
                    </div>
                    <div class="field-info">
                        <input type="text" class="field-name-input" value="${field.name}" data-property="name">
                        <span class="field-type">${field.type}</span>
                    </div>
                    <div class="field-actions">
                        <button class="btn-remove-field" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="field-editor-body">
                    ${this.getFieldSpecificEditorHTML(field)}
                </div>
            </div>
        `;
    }
    
    /**
     * Icône : selon le type de champ
     * @param {string} fieldType - Type de champ
     * @return {string} - Nom d'icône FontAwesome
     */
    getFieldIcon(fieldType) {
        const icons = {
            text: 'font',
            image: 'image',
            button: 'mouse-pointer',
            spacer: 'arrows-alt-v'
        };
        return icons[fieldType] || 'question';
    }
    
    /**
     * HTML : éditeur spécifique au type de champ
     * @param {Object} field - Configuration de champ
     * @return {string} - HTML spécifique
     */
    getFieldSpecificEditorHTML(field) {
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-field">
                        <label>Valeur</label>
                        <textarea class="field-input" data-property="value" rows="3">${field.value || ''}</textarea>
                    </div>
                    <div class="form-field">
                        <label>Placeholder</label>
                        <input type="text" class="field-input" data-property="placeholder" value="${field.placeholder || ''}">
                    </div>
                    <div class="form-field">
                        <label>
                            <input type="checkbox" data-property="required" ${field.required ? 'checked' : ''}>
                            Champ requis
                        </label>
                    </div>
                `;
                
            case 'image':
                return `
                    <div class="form-field">
                        <label>URL de l'image</label>
                        <input type="url" class="field-input" data-property="src" value="${field.src || ''}">
                    </div>
                    <div class="form-field">
                        <label>Texte alternatif</label>
                        <input type="text" class="field-input" data-property="alt" value="${field.alt || ''}">
                    </div>
                `;
                
            case 'button':
                return `
                    <div class="form-field">
                        <label>Texte du bouton</label>
                        <input type="text" class="field-input" data-property="text" value="${field.text || ''}">
                    </div>
                    <div class="form-field">
                        <label>Lien (URL)</label>
                        <input type="url" class="field-input" data-property="href" value="${field.href || ''}">
                    </div>
                `;
                
            case 'spacer':
                return `
                    <div class="form-field">
                        <label>Hauteur (px)</label>
                        <input type="number" class="field-input" data-property="height" value="${field.height || 50}" min="0" max="500">
                    </div>
                `;
                
            default:
                return `<p>Type de champ non reconnu: ${field.type}</p>`;
        }
    }
    
    /**
     * Basculement : onglet actif
     * @param {string} tabName - Nom de l'onglet
     */
    switchTab(tabName) {
        // Mise à jour : état
        this.state.activeTab = tabName;
        
        // Mise à jour : visuel des onglets
        this.elements.panel.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mise à jour : contenu des onglets
        this.elements.panel.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabName);
        });
        
        // Actions : spécifiques à l'onglet
        switch (tabName) {
            case 'sections':
                this.refreshSectionsList();
                break;
            case 'templates':
                this.refreshTemplatesGrid();
                break;
            case 'content':
                if (this.state.selectedSection) {
                    this.updateContentEditor(this.state.selectedSection);
                }
                break;
            case 'languages':
                this.refreshLanguagesTab();
                break;
        }
    }
    
    /**
     * Affichage : interface
     */
    show() {
        this.state.isVisible = true;
        this.elements.panel.classList.add('visible');
        
        // Focus : sur le panneau
        this.elements.panel.focus();
        
        // Actualisation : contenu
        this.refreshSectionsList();
        this.updateSectionsCount();
    }
    
    /**
     * Masquage : interface
     */
    hide() {
        this.state.isVisible = false;
        this.elements.panel.classList.remove('visible');
    }
    
    /**
     * Basculement : visibilité
     */
    toggle() {
        if (this.state.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Basculement : mode prévisualisation
     */
    togglePreview() {
        this.state.isPreviewMode = !this.state.isPreviewMode;
        
        // Mise à jour : classes du body
        document.body.classList.toggle('preview-mode', this.state.isPreviewMode);
        
        // Masquage : contrôles d'édition
        document.querySelectorAll('.section-controls').forEach(controls => {
            controls.style.display = this.state.isPreviewMode ? 'none' : '';
        });
        
        // Mise à jour : bouton
        const previewBtn = this.elements.panel.querySelector('.btn-preview');
        const icon = previewBtn.querySelector('i');
        icon.className = this.state.isPreviewMode ? 'fas fa-edit' : 'fas fa-eye';
        previewBtn.title = this.state.isPreviewMode ? 'Mode Édition' : 'Prévisualiser';
        
        // Notification
        const mode = this.state.isPreviewMode ? 'Prévisualisation' : 'Édition';
        this.showNotification(`Mode ${mode} activé`, 'info');
    }
    
    /**
     * Vérification : mode édition
     * @return {boolean} - true si en mode édition
     */
    isEditMode() {
        return window.location.pathname.includes('edit-') || 
               document.body.classList.contains('edit-mode');
    }
    
    /**
     * Création : élément DOM avec options
     * @param {string} tag - Nom de la balise
     * @param {Object} options - Options de création
     * @return {HTMLElement} - Élément créé
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        Object.entries(options).forEach(([key, value]) => {
            if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
    
    /**
     * Notification : message utilisateur
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, info, warning)
     */
    showNotification(message, type = 'info') {
        // Création : notification
        const notification = this.createElement('div', {
            className: `admin-notification ${type}`,
            innerHTML: `
                <div class="notification-content">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                    <span>${message}</span>
                </div>
                <button class="btn-close-notification">
                    <i class="fas fa-times"></i>
                </button>
            `
        });
        
        // Insertion : en haut du panneau
        const panelHeader = this.elements.panel.querySelector('.admin-panel-header');
        panelHeader.appendChild(notification);
        
        // Auto-suppression : après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Suppression : sur clic
        notification.querySelector('.btn-close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    /**
     * Icône : selon le type de notification
     * @param {string} type - Type de notification
     * @return {string} - Nom d'icône
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    /**
     * Mise à jour : compteur de sections
     */
    updateSectionsCount() {
        const counter = this.elements.panel.querySelector('.sections-count');
        const count = this.sectionManager.sectionsState.sections.size;
        counter.textContent = `${count} section${count !== 1 ? 's' : ''}`;
    }
    
    /**
     * État : informations sur l'interface
     * @return {Object} - État détaillé
     */
    getStatus() {
        return {
            isVisible: this.state.isVisible,
            activeTab: this.state.activeTab,
            selectedSection: this.state.selectedSection,
            isPreviewMode: this.state.isPreviewMode,
            sectionsCount: this.sectionManager.sectionsState.sections.size
        };
    }
    
    /**
     * Initialisation : support multilingue
     */
    initializeLanguageSupport() {
        // Configuration : écoute des changements de langue
        if (this.languageManager) {
            this.languageManager.on('languageChanged', (newLanguage) => {
                this.onLanguageChanged(newLanguage);
            });
            
            // Traduction : interface actuelle
            this.translateInterface();
        }
    }
    
    /**
     * Traduction : interface utilisateur
     */
    translateInterface() {
        if (!this.languageManager) return;
        
        // Sélection : éléments à traduire
        const elementsToTranslate = this.elements.panel?.querySelectorAll('[data-i18n]');
        
        elementsToTranslate?.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.languageManager.t(key);
            
            // Application : selon le type d'élément
            if (element.tagName === 'INPUT' && element.type !== 'button') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }
    
    /**
     * Événement : changement de langue
     * @param {string} newLanguage - Nouvelle langue
     */
    onLanguageChanged(newLanguage) {
        // Traduction : interface complète
        this.translateInterface();
        
        // Mise à jour : contenu selon l'onglet actif
        if (this.state.activeTab === 'languages') {
            this.refreshLanguagesTab();
        }
        
        // Notification : changement effectué
        console.log(`🌐 Interface traduite en : ${newLanguage}`);
    }
    
    /**
     * Rafraîchissement : onglet des langues
     */
    refreshLanguagesTab() {
        if (!this.languageManager) return;
        
        const languagesContent = this.elements.panel?.querySelector('[data-tab-content="languages"]');
        if (!languagesContent) return;
        
        // HTML : contenu de l'onglet langues
        languagesContent.innerHTML = this.getLanguagesTabHTML();
        
        // Configuration : événements de l'onglet langues
        this.setupLanguagesTabEvents();
    }
    
    /**
     * HTML : onglet de gestion des langues
     * @return {string} - Structure HTML
     */
    getLanguagesTabHTML() {
        if (!this.languageManager) {
            return '<p>LanguageManager non disponible</p>';
        }
        
        const currentLanguage = this.languageManager.getCurrentLanguage();
        const availableLanguages = this.languageManager.getAvailableLanguages();
        
        return `
            <div class="languages-management">
                <!-- Sélecteur de langue actuelle -->
                <div class="current-language-section">
                    <h3 data-i18n="languages.currentLanguage">Langue actuelle</h3>
                    <div class="language-selector">
                        <select id="language-select" class="form-control">
                            ${availableLanguages.map(lang => `
                                <option value="${lang.code}" ${lang.code === currentLanguage ? 'selected' : ''}>
                                    ${lang.flag} ${lang.nativeName}
                                </option>
                            `).join('')}
                        </select>
                        <button class="btn btn-primary" id="apply-language">
                            <i class="fas fa-check"></i>
                            <span data-i18n="admin.confirm">Confirmer</span>
                        </button>
                    </div>
                </div>
                
                <!-- Langues disponibles -->
                <div class="available-languages-section">
                    <h3 data-i18n="languages.availableLanguages">Langues disponibles</h3>
                    <div class="languages-grid">
                        ${availableLanguages.map(lang => `
                            <div class="language-card ${lang.code === currentLanguage ? 'active' : ''}">
                                <div class="language-flag">${lang.flag}</div>
                                <div class="language-info">
                                    <strong>${lang.name}</strong>
                                    <small>${lang.nativeName}</small>
                                    <div class="language-meta">
                                        <span class="locale">${lang.locale}</span>
                                        ${lang.rtl ? '<span class="rtl-badge">RTL</span>' : ''}
                                    </div>
                                </div>
                                <div class="language-actions">
                                    <button class="btn btn-sm btn-secondary" data-action="edit-translations" data-language="${lang.code}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Statistiques des traductions -->
                <div class="translation-stats">
                    <h4 data-i18n="languages.translationStats">Statistiques des traductions</h4>
                    <div class="stats-grid">
                        ${availableLanguages.map(lang => {
                            const stats = this.languageManager.getTranslationStats(lang.code);
                            return `
                                <div class="stat-item">
                                    <span class="stat-label">${lang.flag} ${lang.name}</span>
                                    <div class="stat-progress">
                                        <div class="progress-bar" style="width: ${stats.completionPercentage}%"></div>
                                        <span class="stat-value">${stats.completionPercentage}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Configuration : événements de l'onglet langues
     */
    setupLanguagesTabEvents() {
        if (!this.elements.panel) return;
        
        // Sélecteur : changement de langue
        const languageSelect = this.elements.panel.querySelector('#language-select');
        const applyButton = this.elements.panel.querySelector('#apply-language');
        
        applyButton?.addEventListener('click', () => {
            const selectedLanguage = languageSelect?.value;
            if (selectedLanguage && this.languageManager) {
                this.languageManager.setLanguage(selectedLanguage);
            }
        });
        
        // Boutons : édition des traductions
        this.elements.panel.querySelectorAll('[data-action="edit-translations"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const language = e.currentTarget.getAttribute('data-language');
                this.openTranslationEditor(language);
            });
        });
    }
    
    /**
     * Ouverture : éditeur de traductions
     * @param {string} language - Code de langue à éditer
     */
    openTranslationEditor(language) {
        // Interface : modale d'édition des traductions
        const modal = this.createElement('div', {
            className: 'translation-editor-modal',
            innerHTML: `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Éditeur de traductions - ${language.toUpperCase()}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="translation-editor">
                            <p>Éditeur de traductions pour ${language} (en développement)</p>
                        </div>
                    </div>
                </div>
            `
        });
        
        // Fermeture : modale
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.remove();
        });
        
        // Ajout : au DOM
        document.body.appendChild(modal);
    }
}

// Export ES6
export default AdminInterface;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminInterface;
}