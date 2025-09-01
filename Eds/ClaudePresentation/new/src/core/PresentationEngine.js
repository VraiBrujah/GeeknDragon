/**
 * Moteur principal du générateur de présentations
 * 
 * Rôle : Coordonne tous les modules (widgets, sections, synchronisation)
 * Type : Classe singleton - Point d'entrée unique du système
 * Responsabilité : Gestion centralisée des présentations et de leur état
 */
class PresentationEngine {
    constructor() {
        // Rôle : Instance singleton du moteur principal
        // Type : PresentationEngine (unique)
        // Unité : Sans unité
        // Domaine : Une seule instance par application
        // Formule : Design Pattern Singleton
        // Exemple : Moteur centralisé pour toute l'application
        if (PresentationEngine.instance) {
            return PresentationEngine.instance;
        }
        PresentationEngine.instance = this;

        // Rôle : Stockage de l'état actuel de la présentation
        // Type : Object (état de la présentation courante)
        // Unité : Sans unité
        // Domaine : Object ou null si aucune présentation active
        // Formule : État = {id, titre, sections[], widgets[], styles}
        // Exemple : {id: 'pres-123', titre: 'Li-CUBE PRO', sections: [...]}
        this.currentPresentation = null;

        // Rôle : Gestionnaire d'historique pour undo/redo
        // Type : HistoryManager (instance de gestion d'historique)
        // Unité : Sans unité
        // Domaine : Instance valide de HistoryManager
        // Formule : new HistoryManager() → instance de gestion d'historique
        // Exemple : Permet ctrl+z et ctrl+y sur les modifications
        this.historyManager = new HistoryManager();

        // Rôle : Gestionnaire de synchronisation temps réel
        // Type : SyncManager (instance de synchronisation)
        // Unité : Sans unité
        // Domaine : Instance valide de SyncManager
        // Formule : new SyncManager() → instance de synchronisation
        // Exemple : Synchronise éditeur ⟷ viewer en temps réel
        this.syncManager = new SyncManager();

        // Rôle : Gestionnaire de widgets disponibles
        // Type : WidgetManager (gestionnaire de composants réutilisables)
        // Unité : Sans unité
        // Domaine : Instance valide de WidgetManager
        // Formule : new WidgetManager() → gestionnaire de widgets
        // Exemple : Gère texte, image, bouton, etc.
        this.widgetManager = new WidgetManager();

        // Rôle : Gestionnaire de sections pré-définies
        // Type : SectionManager (gestionnaire de sections templates)
        // Unité : Sans unité
        // Domaine : Instance valide de SectionManager
        // Formule : new SectionManager() → gestionnaire de sections
        // Exemple : Gère header, hero, pricing, contact, etc.
        this.sectionManager = new SectionManager();

        // Rôle : Gestionnaire hiérarchique des éléments de présentation
        // Type : HierarchyManager (gestionnaire de hiérarchie 5 niveaux)
        // Unité : Sans unité
        // Domaine : Instance valide de HierarchyManager
        // Formule : new HierarchyManager(widgetManager) → gestionnaire hiérarchique
        // Exemple : Gère Méta-Sections → Sections → Sous-Sections → Sous-Sous-Sections → Widgets
        this.hierarchyManager = new HierarchyManager(this.widgetManager);

        // Initialisation du moteur
        this.init();
    }

    /**
     * Initialise le moteur de présentation
     * 
     * Rôle : Configuration initiale du système
     * Type : Méthode d'initialisation
     * Effet de bord : Charge les templates, configure les events
     */
    async init() {
        try {
            console.log('🚀 Initialisation du moteur de présentation...');
            
            // Chargement des widgets par défaut
            await this.widgetManager.loadDefaultWidgets();
            
            // Chargement des sections par défaut
            await this.sectionManager.loadDefaultSections();
            
            // Initialisation du gestionnaire hiérarchique
            await this.hierarchyManager.init();
            
            // Configuration de la synchronisation
            this.syncManager.init();
            
            console.log('✅ Moteur de présentation initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du moteur:', error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle présentation
     * 
     * @param {string} titre - Titre de la présentation
     * @param {string} template - Template de base (optionnel)
     * @returns {Object} Nouvelle présentation créée
     */
    createPresentation(titre, template = null) {
        // Rôle : Identifiant unique de la nouvelle présentation
        // Type : String (UUID ou timestamp-based)
        // Unité : Sans unité
        // Domaine : Chaîne alphanumérique unique
        // Formule : 'pres-' + timestamp + '-' + random
        // Exemple : 'pres-1704890400123-abc'
        const presentationId = `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Rôle : Structure de données de la nouvelle présentation
        // Type : Object (définition complète d'une présentation)
        // Unité : Sans unité
        // Domaine : Object avec propriétés requises
        // Formule : Structure standard de présentation avec support hiérarchique
        // Exemple : Voir ci-dessous
        const presentation = {
            id: presentationId,
            titre: titre,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            template: template,
            sections: [],
            hierarchicalElements: [], // Support pour la nouvelle structure hiérarchique
            styles: {
                theme: 'default',
                colors: {
                    primary: '#10B981',
                    secondary: '#3B82F6',
                    background: '#0F172A'
                },
                fonts: {
                    primary: 'Inter',
                    secondary: 'Playfair Display'
                }
            },
            metadata: {
                version: '1.0.0',
                author: 'PresentationEngine',
                tags: [],
                hierarchical: true // Indicateur de support hiérarchique
            }
        };

        // Si un template est spécifié, charger sa structure
        if (template) {
            this.loadTemplate(presentation, template);
        }

        // Sauvegarder l'état actuel pour l'historique
        this.historyManager.saveState(presentation);

        // Définir comme présentation active
        this.currentPresentation = presentation;

        // Synchroniser avec le viewer
        this.syncManager.syncPresentation(presentation);

        console.log(`📋 Nouvelle présentation créée: ${titre} (${presentationId})`);
        return presentation;
    }

    /**
     * Charge un template dans une présentation
     * 
     * @param {Object} presentation - Présentation à modifier
     * @param {string} templateName - Nom du template à charger
     */
    loadTemplate(presentation, templateName) {
        // Récupération du template depuis le gestionnaire de sections
        const template = this.sectionManager.getTemplate(templateName);
        
        if (template && template.sections) {
            presentation.sections = [...template.sections];
            presentation.styles = { ...presentation.styles, ...template.styles };
            console.log(`📝 Template '${templateName}' chargé dans la présentation`);
        } else {
            console.warn(`⚠️ Template '${templateName}' non trouvé`);
        }
    }

    /**
     * Ajoute une section à la présentation courante
     * 
     * @param {string} sectionType - Type de section à ajouter
     * @param {number} position - Position d'insertion (optionnelle)
     * @returns {Object} Section créée
     */
    addSection(sectionType, position = null) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        // Création de la nouvelle section
        const section = this.sectionManager.createSection(sectionType);
        
        // Rôle : Position d'insertion dans le tableau des sections
        // Type : Number (index dans le tableau)
        // Unité : Sans unité (index)
        // Domaine : 0 ≤ insertPosition ≤ sections.length
        // Formule : position || sections.length (fin par défaut)
        // Exemple : position = 2 → insérer à l'index 2
        const insertPosition = position !== null ? position : this.currentPresentation.sections.length;

        // Insertion de la section
        this.currentPresentation.sections.splice(insertPosition, 0, section);
        
        // Mise à jour timestamp
        this.currentPresentation.dateModification = new Date().toISOString();

        // Sauvegarde pour historique
        this.historyManager.saveState(this.currentPresentation);

        // Synchronisation
        this.syncManager.syncPresentation(this.currentPresentation);

        console.log(`➕ Section '${sectionType}' ajoutée à la position ${insertPosition}`);
        return section;
    }

    /**
     * Supprime une section de la présentation courante
     * 
     * @param {string} sectionId - ID de la section à supprimer
     * @returns {boolean} Succès de la suppression
     */
    removeSection(sectionId) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        // Rôle : Index de la section à supprimer
        // Type : Number (index dans le tableau)
        // Unité : Sans unité (index)
        // Domaine : -1 si non trouvé, ≥0 si trouvé
        // Formule : findIndex(section => section.id === sectionId)
        // Exemple : index = 3 → section à l'index 3
        const sectionIndex = this.currentPresentation.sections.findIndex(
            section => section.id === sectionId
        );

        if (sectionIndex === -1) {
            console.warn(`⚠️ Section '${sectionId}' non trouvée`);
            return false;
        }

        // Suppression de la section
        const removedSection = this.currentPresentation.sections.splice(sectionIndex, 1)[0];
        
        // Mise à jour timestamp
        this.currentPresentation.dateModification = new Date().toISOString();

        // Sauvegarde pour historique
        this.historyManager.saveState(this.currentPresentation);

        // Synchronisation
        this.syncManager.syncPresentation(this.currentPresentation);

        console.log(`🗑️ Section '${removedSection.type}' supprimée`);
        return true;
    }

    /**
     * Déplace une section vers une nouvelle position
     * 
     * @param {string} sectionId - ID de la section à déplacer
     * @param {number} newPosition - Nouvelle position
     * @returns {boolean} Succès du déplacement
     */
    moveSection(sectionId, newPosition) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        const currentIndex = this.currentPresentation.sections.findIndex(
            section => section.id === sectionId
        );

        if (currentIndex === -1) {
            console.warn(`⚠️ Section '${sectionId}' non trouvée`);
            return false;
        }

        // Rôle : Validation de la nouvelle position
        // Type : Number (position cible valide)
        // Unité : Sans unité (index)
        // Domaine : 0 ≤ targetPosition < sections.length
        // Formule : Math.max(0, Math.min(newPosition, sections.length - 1))
        // Exemple : newPosition = 10, sections.length = 5 → targetPosition = 4
        const targetPosition = Math.max(0, Math.min(newPosition, this.currentPresentation.sections.length - 1));

        // Déplacement de la section
        const [section] = this.currentPresentation.sections.splice(currentIndex, 1);
        this.currentPresentation.sections.splice(targetPosition, 0, section);

        // Mise à jour timestamp
        this.currentPresentation.dateModification = new Date().toISOString();

        // Sauvegarde pour historique
        this.historyManager.saveState(this.currentPresentation);

        // Synchronisation
        this.syncManager.syncPresentation(this.currentPresentation);

        console.log(`🔄 Section '${section.type}' déplacée de ${currentIndex} vers ${targetPosition}`);
        return true;
    }

    /**
     * Sauvegarde la présentation courante
     * 
     * @param {boolean} createBackup - Créer une sauvegarde (défaut: true)
     * @returns {string} Chemin de sauvegarde
     */
    savePresentation(createBackup = true) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active à sauvegarder');
        }

        try {
            // Mise à jour timestamp
            this.currentPresentation.dateModification = new Date().toISOString();

            // Rôle : Chemin de sauvegarde de la présentation
            // Type : String (chemin relatif)
            // Unité : Sans unité
            // Domaine : Chemin valide dans projects/
            // Formule : 'projects/' + presentationId + '/presentation.json'
            // Exemple : 'projects/pres-123-abc/presentation.json'
            const savePath = `projects/${this.currentPresentation.id}/presentation.json`;

            // Sauvegarde du fichier JSON
            const dataToSave = JSON.stringify(this.currentPresentation, null, 2);
            
            // Note: En environnement réel, utiliser l'API File System Access
            localStorage.setItem(`presentation-${this.currentPresentation.id}`, dataToSave);
            localStorage.setItem('current-presentation-id', this.currentPresentation.id);

            if (createBackup) {
                // Sauvegarde de backup avec timestamp
                const backupKey = `backup-${this.currentPresentation.id}-${Date.now()}`;
                localStorage.setItem(backupKey, dataToSave);
            }

            console.log(`💾 Présentation sauvegardée: ${savePath}`);
            return savePath;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            throw error;
        }
    }

    /**
     * Charge une présentation existante
     * 
     * @param {string} presentationId - ID de la présentation à charger
     * @returns {Object} Présentation chargée
     */
    loadPresentation(presentationId) {
        try {
            // Récupération depuis localStorage (ou API en production)
            const savedData = localStorage.getItem(`presentation-${presentationId}`);
            
            if (!savedData) {
                throw new Error(`Présentation '${presentationId}' non trouvée`);
            }

            const presentation = JSON.parse(savedData);
            
            // Validation de la structure
            if (!presentation.id || !presentation.titre || !Array.isArray(presentation.sections)) {
                throw new Error('Structure de présentation invalide');
            }

            // Définir comme présentation active
            this.currentPresentation = presentation;

            // Synchronisation
            this.syncManager.syncPresentation(presentation);

            console.log(`📂 Présentation chargée: ${presentation.titre} (${presentationId})`);
            return presentation;
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            throw error;
        }
    }

    /**
     * Génère le HTML final de la présentation
     * 
     * @returns {string} HTML complet de la présentation
     */
    generateHTML() {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        console.log('🔄 Génération du HTML final...');
        
        // Génération par le gestionnaire de sections
        const html = this.sectionManager.generatePresentationHTML(this.currentPresentation);
        
        console.log('✅ HTML généré avec succès');
        return html;
    }

    /**
     * Retourne l'état actuel du moteur
     * 
     * @returns {Object} État complet du moteur
     */
    getState() {
        return {
            currentPresentation: this.currentPresentation,
            availableWidgets: this.widgetManager.getAvailableWidgets(),
            availableSections: this.sectionManager.getAvailableSections(),
            hierarchyLevels: this.hierarchyManager.getHierarchyLevels(),
            hierarchyTemplates: this.hierarchyManager.getTemplates(),
            history: this.historyManager.getHistory()
        };
    }

    /**
     * Ajoute un élément hiérarchique à la présentation courante
     * 
     * Rôle : Intégration d'éléments hiérarchiques dans la présentation
     * Type : Méthode de manipulation hiérarchique
     * Paramètres : levelType - Type d'élément (meta-section, section, etc.), elementConfig - Configuration de l'élément, parentId - ID du parent (optionnel)
     * Retour : Object - Élément créé
     */
    addHierarchicalElement(levelType, elementConfig, parentId = null) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        try {
            // Rôle : Élément hiérarchique créé par le gestionnaire
            // Type : Object (structure d'élément hiérarchique)
            // Unité : Sans unité
            // Domaine : Object avec propriétés requises (id, type, content, children)
            // Formule : hierarchyManager.createElement(levelType, elementConfig)
            // Exemple : {id: 'meta-001', type: 'meta-section', title: 'Présentation', children: []}
            const hierarchicalElement = this.hierarchyManager.createElement(levelType, elementConfig);

            // Si c'est une méta-section (niveau racine), ajouter directement à la présentation
            if (levelType === 'meta-section') {
                // Rôle : Initialisation de la structure hiérarchique dans la présentation
                // Type : Array (tableau des éléments hiérarchiques de niveau racine)
                // Unité : Sans unité
                // Domaine : Array d'objets hiérarchiques
                // Formule : presentation.hierarchicalElements = presentation.hierarchicalElements || []
                // Exemple : [{id: 'meta-001', type: 'meta-section', ...}, ...]
                if (!this.currentPresentation.hierarchicalElements) {
                    this.currentPresentation.hierarchicalElements = [];
                }
                this.currentPresentation.hierarchicalElements.push(hierarchicalElement);
            } 
            // Sinon, ajouter à l'élément parent spécifié
            else if (parentId) {
                const parentElement = this.findHierarchicalElement(parentId);
                if (parentElement) {
                    if (!parentElement.children) {
                        parentElement.children = [];
                    }
                    parentElement.children.push(hierarchicalElement);
                } else {
                    throw new Error(`Élément parent '${parentId}' non trouvé`);
                }
            } else {
                throw new Error(`Élément de type '${levelType}' nécessite un parent`);
            }

            // Mise à jour timestamp
            this.currentPresentation.dateModification = new Date().toISOString();

            // Sauvegarde pour historique
            this.historyManager.saveState(this.currentPresentation);

            // Synchronisation
            this.syncManager.syncPresentation(this.currentPresentation);

            console.log(`➕ Élément hiérarchique ajouté: ${levelType} (${hierarchicalElement.id})`);
            return hierarchicalElement;

        } catch (error) {
            console.error('❌ Erreur ajout élément hiérarchique:', error);
            throw error;
        }
    }

    /**
     * Recherche un élément hiérarchique par son ID
     * 
     * Rôle : Recherche récursive dans la hiérarchie
     * Type : Méthode de recherche récursive
     * Paramètre : elementId - ID de l'élément à rechercher
     * Retour : Object|null - Élément trouvé ou null
     */
    findHierarchicalElement(elementId) {
        if (!this.currentPresentation?.hierarchicalElements) {
            return null;
        }

        /**
         * Fonction récursive de recherche dans les éléments
         * 
         * Rôle : Parcours en profondeur de la hiérarchie
         * Type : Fonction récursive de recherche
         * Paramètre : elements - Tableau d'éléments à parcourir
         * Retour : Object|null - Élément trouvé ou null
         */
        const searchInElements = (elements) => {
            for (const element of elements) {
                if (element.id === elementId) {
                    return element;
                }
                if (element.children && element.children.length > 0) {
                    const found = searchInElements(element.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return searchInElements(this.currentPresentation.hierarchicalElements);
    }

    /**
     * Supprime un élément hiérarchique par son ID
     * 
     * Rôle : Suppression d'élément avec gestion de la hiérarchie
     * Type : Méthode de suppression hiérarchique
     * Paramètre : elementId - ID de l'élément à supprimer
     * Retour : boolean - Succès de la suppression
     */
    removeHierarchicalElement(elementId) {
        if (!this.currentPresentation?.hierarchicalElements) {
            return false;
        }

        /**
         * Fonction récursive de suppression
         * 
         * Rôle : Suppression avec préservation de la structure
         * Type : Fonction récursive de suppression
         * Paramètre : elements - Tableau d'éléments, parent - Élément parent (optionnel)
         * Retour : boolean - Succès de la suppression
         */
        const removeFromElements = (elements, parent = null) => {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].id === elementId) {
                    elements.splice(i, 1);
                    console.log(`🗑️ Élément hiérarchique supprimé: ${elementId}`);
                    return true;
                }
                if (elements[i].children && elements[i].children.length > 0) {
                    if (removeFromElements(elements[i].children, elements[i])) {
                        return true;
                    }
                }
            }
            return false;
        };

        const success = removeFromElements(this.currentPresentation.hierarchicalElements);
        
        if (success) {
            // Mise à jour timestamp
            this.currentPresentation.dateModification = new Date().toISOString();

            // Sauvegarde pour historique
            this.historyManager.saveState(this.currentPresentation);

            // Synchronisation
            this.syncManager.syncPresentation(this.currentPresentation);
        }

        return success;
    }

    /**
     * Applique un template hiérarchique à un élément
     * 
     * Rôle : Déploiement automatique de structures prédéfinies
     * Type : Méthode de déploiement de template
     * Paramètres : templateName - Nom du template, targetElementId - ID de l'élément cible (optionnel)
     * Retour : Object - Élément créé depuis le template
     */
    applyHierarchicalTemplate(templateName, targetElementId = null) {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        try {
            // Rôle : Template hiérarchique récupéré du gestionnaire
            // Type : Object (définition complète du template)
            // Unité : Sans unité
            // Domaine : Object avec structure hiérarchique ou null si non trouvé
            // Formule : hierarchyManager.getTemplate(templateName)
            // Exemple : {name: 'meta-header', structure: {...}, config: {...}}
            const template = this.hierarchyManager.getTemplate(templateName);

            if (!template) {
                throw new Error(`Template '${templateName}' non trouvé`);
            }

            // Rôle : Élément créé depuis le template
            // Type : Object (élément hiérarchique instancié)
            // Unité : Sans unité
            // Domaine : Object avec structure complète déployée
            // Formule : hierarchyManager.deployTemplate(template)
            // Exemple : Structure complète avec enfants imbriqués
            const deployedElement = this.hierarchyManager.deployTemplate(template);

            // Si un élément cible est spécifié, ajouter comme enfant
            if (targetElementId) {
                const targetElement = this.findHierarchicalElement(targetElementId);
                if (targetElement) {
                    if (!targetElement.children) {
                        targetElement.children = [];
                    }
                    targetElement.children.push(deployedElement);
                } else {
                    throw new Error(`Élément cible '${targetElementId}' non trouvé`);
                }
            } else {
                // Ajouter au niveau racine
                if (!this.currentPresentation.hierarchicalElements) {
                    this.currentPresentation.hierarchicalElements = [];
                }
                this.currentPresentation.hierarchicalElements.push(deployedElement);
            }

            // Mise à jour timestamp
            this.currentPresentation.dateModification = new Date().toISOString();

            // Sauvegarde pour historique
            this.historyManager.saveState(this.currentPresentation);

            // Synchronisation
            this.syncManager.syncPresentation(this.currentPresentation);

            console.log(`📋 Template hiérarchique déployé: ${templateName}`);
            return deployedElement;

        } catch (error) {
            console.error('❌ Erreur déploiement template hiérarchique:', error);
            throw error;
        }
    }

    /**
     * Crée une nouvelle présentation avec support hiérarchique complet
     * 
     * Rôle : Factory spécialisée pour le nouveau système hiérarchique
     * Type : Méthode de création avancée
     * Paramètres : config - Configuration {titre, template, templateHierarchique}
     * Retour : Promise<Object> - Présentation avec structure hiérarchique
     */
    async createHierarchicalPresentation(config = {}) {
        try {
            console.log('🆕 Création d\'une présentation hiérarchique...');

            // Rôle : Configuration par défaut pour présentation hiérarchique
            // Type : Object (paramètres de création)
            // Unité : Sans unité
            // Domaine : Object avec propriétés par défaut
            // Formule : Fusion config utilisateur + valeurs par défaut
            // Exemple : {titre: 'Ma présentation', template: 'simple', templateHierarchique: 'meta-header'}
            const finalConfig = {
                titre: config.titre || 'Nouvelle présentation',
                template: config.template || null,
                templateHierarchique: config.templateHierarchique || null,
                author: config.author || 'Utilisateur',
                ...config
            };

            // Création de la présentation de base
            const presentation = this.createPresentation(finalConfig.titre, finalConfig.template);

            // Application du template hiérarchique si spécifié
            if (finalConfig.templateHierarchique) {
                console.log(`📋 Application du template hiérarchique: ${finalConfig.templateHierarchique}`);
                
                try {
                    const deployedTemplate = this.applyHierarchicalTemplate(finalConfig.templateHierarchique);
                    console.log(`✅ Template hiérarchique appliqué: ${deployedTemplate.id}`);
                } catch (templateError) {
                    console.warn(`⚠️ Erreur template hiérarchique '${finalConfig.templateHierarchique}':`, templateError);
                }
            }

            console.log(`✅ Présentation hiérarchique créée: ${finalConfig.titre} (${presentation.id})`);
            return presentation;

        } catch (error) {
            console.error('❌ Erreur création présentation hiérarchique:', error);
            throw error;
        }
    }

    /**
     * Génère le HTML avec support de la structure hiérarchique
     * 
     * Rôle : Rendu HTML intégrant les deux systèmes (sections + hiérarchie)
     * Type : Méthode de génération hybride
     * Retour : string - HTML complet avec structure hiérarchique
     */
    generateHierarchicalHTML() {
        if (!this.currentPresentation) {
            throw new Error('Aucune présentation active');
        }

        console.log('🔄 Génération HTML hiérarchique...');

        try {
            // Génération HTML des sections classiques
            let html = this.sectionManager.generatePresentationHTML(this.currentPresentation);

            // Si des éléments hiérarchiques existent, les intégrer
            if (this.currentPresentation.hierarchicalElements && 
                this.currentPresentation.hierarchicalElements.length > 0) {
                
                // Rôle : HTML des éléments hiérarchiques généré
                // Type : String (HTML complet des éléments hiérarchiques)
                // Unité : Sans unité
                // Domaine : String HTML valide
                // Formule : hierarchyManager.generateHTML(hierarchicalElements)
                // Exemple : '<div class="meta-section">...</div>'
                const hierarchicalHTML = this.hierarchyManager.generateHTML(
                    this.currentPresentation.hierarchicalElements
                );

                // Intégration du HTML hiérarchique
                html = this.integrateHierarchicalHTML(html, hierarchicalHTML);
            }

            console.log('✅ HTML hiérarchique généré avec succès');
            return html;

        } catch (error) {
            console.error('❌ Erreur génération HTML hiérarchique:', error);
            // Fallback sur la méthode classique
            return this.generateHTML();
        }
    }

    /**
     * Intègre le HTML hiérarchique dans le HTML de base
     * 
     * Rôle : Fusion intelligente des deux structures HTML
     * Type : Méthode de fusion de contenu
     * Paramètres : baseHTML - HTML de base, hierarchicalHTML - HTML hiérarchique
     * Retour : string - HTML fusionné
     */
    integrateHierarchicalHTML(baseHTML, hierarchicalHTML) {
        // Rôle : Recherche du point d'insertion dans le HTML de base
        // Type : String (HTML avec point d'insertion localisé)
        // Unité : Sans unité
        // Domaine : HTML avec balise body ou container
        // Formule : baseHTML.replace pour localiser le point d'insertion
        // Exemple : Insertion avant la fermeture de body ou dans main container
        
        // Si le HTML hiérarchique contient du contenu
        if (hierarchicalHTML && hierarchicalHTML.trim() !== '') {
            // Tentative d'insertion avant la fermeture du body
            if (baseHTML.includes('</body>')) {
                return baseHTML.replace('</body>', `${hierarchicalHTML}</body>`);
            }
            // Sinon, tentative d'insertion dans un container principal
            else if (baseHTML.includes('<main')) {
                return baseHTML.replace('<main', `${hierarchicalHTML}<main`);
            }
            // Fallback: ajout à la fin
            else {
                return baseHTML + hierarchicalHTML;
            }
        }

        // Si pas de contenu hiérarchique, retourner le HTML de base
        return baseHTML;
    }

    /**
     * Retourne la présentation courante
     * 
     * Rôle : Accessor pour la présentation active
     * Type : Méthode getter
     * Retour : Object|null - Présentation courante ou null
     */
    getCurrentPresentation() {
        return this.currentPresentation;
    }

    /**
     * Définit la présentation courante
     * 
     * Rôle : Setter pour la présentation active
     * Type : Méthode setter
     * Paramètre : presentation - Présentation à définir comme courante
     * Effet de bord : Met à jour la présentation courante
     */
    setCurrentPresentation(presentation) {
        this.currentPresentation = presentation;
        console.log(`🎯 Présentation courante définie: ${presentation?.title || 'Aucune'}`);
    }

    /**
     * Sauvegarde la présentation courante
     * 
     * Rôle : Persistance de la présentation
     * Type : Méthode de sauvegarde
     * Retour : Promise<Object> - Résultat de la sauvegarde
     */
    async savePresentation() {
        try {
            if (!this.currentPresentation) {
                throw new Error('Aucune présentation à sauvegarder');
            }

            // Mise à jour du timestamp de modification
            this.currentPresentation.dateModification = new Date().toISOString();
            this.currentPresentation.metadata.lastSaved = new Date().toISOString();

            // Sauvegarde dans localStorage pour cette version de développement
            const storageKey = `presentation-${this.currentPresentation.id}`;
            localStorage.setItem(storageKey, JSON.stringify(this.currentPresentation));

            // Sauvegarde de la liste des présentations
            const presentations = JSON.parse(localStorage.getItem('presentations-list') || '[]');
            const existingIndex = presentations.findIndex(p => p.id === this.currentPresentation.id);
            
            const presentationInfo = {
                id: this.currentPresentation.id,
                title: this.currentPresentation.title,
                dateModification: this.currentPresentation.dateModification,
                path: storageKey
            };

            if (existingIndex > -1) {
                presentations[existingIndex] = presentationInfo;
            } else {
                presentations.push(presentationInfo);
            }

            localStorage.setItem('presentations-list', JSON.stringify(presentations));

            console.log(`💾 Présentation sauvegardée: ${this.currentPresentation.title}`);
            
            return {
                success: true,
                path: storageKey,
                timestamp: this.currentPresentation.metadata.lastSaved
            };

        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Charge une présentation depuis le stockage
     * 
     * Rôle : Récupération d'une présentation sauvegardée
     * Type : Méthode de chargement
     * Paramètre : presentationId - ID de la présentation à charger
     * Retour : Object - Présentation chargée
     */
    loadPresentation(presentationId) {
        try {
            const storageKey = `presentation-${presentationId}`;
            const presentationData = localStorage.getItem(storageKey);
            
            if (!presentationData) {
                throw new Error(`Présentation ${presentationId} non trouvée`);
            }

            const presentation = JSON.parse(presentationData);
            console.log(`📖 Présentation chargée: ${presentation.title}`);
            
            return presentation;

        } catch (error) {
            console.error(`❌ Erreur chargement présentation ${presentationId}:`, error);
            throw error;
        }
    }

    /**
     * Restaure l'état du moteur depuis un snapshot
     * 
     * Rôle : Restauration d'état pour undo/redo
     * Type : Méthode de restauration d'état
     * Paramètre : state - État à restaurer
     * Effet de bord : Met à jour l'état complet du moteur
     */
    restoreState(state) {
        try {
            if (state && state.id) {
                this.currentPresentation = { ...state };
                console.log(`🔄 État restauré: ${state.title}`);
            } else {
                console.warn('État invalide pour restauration');
            }
        } catch (error) {
            console.error('❌ Erreur restauration état:', error);
            throw error;
        }
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.PresentationEngine = PresentationEngine;