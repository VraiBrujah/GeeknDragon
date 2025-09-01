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
        // Formule : Structure standard de présentation
        // Exemple : Voir ci-dessous
        const presentation = {
            id: presentationId,
            titre: titre,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            template: template,
            sections: [],
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
                tags: []
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
            history: this.historyManager.getHistory()
        };
    }

    /**
     * Crée une nouvelle présentation
     * 
     * Rôle : Factory de création de présentations
     * Type : Méthode de création de données
     * Paramètre : config - Configuration de la présentation
     * Retour : Promise<Object> - Présentation créée
     */
    async createPresentation(config) {
        try {
            // Génération d'un ID unique pour la présentation
            const presentationId = `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Structure de présentation par défaut
            const presentation = {
                id: presentationId,
                title: config.title || 'Nouvelle présentation',
                description: config.description || '',
                template: config.template || '',
                dateCreation: config.createdAt || new Date().toISOString(),
                dateModification: new Date().toISOString(),
                author: config.author || 'Utilisateur',
                metadata: {
                    version: '1.0.0',
                    lastSaved: null
                },
                sections: []
            };

            // Application du template si spécifié
            if (config.template && config.template !== '') {
                await this.applyTemplate(presentation, config.template);
            }

            // Définition comme présentation courante
            this.currentPresentation = presentation;

            // Sauvegarde initiale dans l'historique
            this.historyManager.saveState(presentation, `Création de "${presentation.title}"`);

            console.log(`✅ Présentation créée: ${presentation.title} (${presentationId})`);
            return presentation;

        } catch (error) {
            console.error('❌ Erreur création présentation:', error);
            throw error;
        }
    }

    /**
     * Applique un template à une présentation
     * 
     * Rôle : Chargement d'un template prédéfini
     * Type : Méthode de configuration
     * Paramètres : presentation - Présentation cible, templateName - Nom du template
     * Effet de bord : Modifie la structure de la présentation
     */
    async applyTemplate(presentation, templateName) {
        try {
            console.log(`📋 Application du template: ${templateName}`);

            switch (templateName) {
                case 'li-cube-pro':
                    // Chargement des sections du template Li-CUBE PRO
                    const licubeProSections = await this.sectionManager.getTemplateSection('li-cube-pro');
                    presentation.sections = licubeProSections || [];
                    break;

                case 'commercial':
                    // Template commercial simple
                    presentation.sections = [
                        await this.sectionManager.createSection('hero', { title: 'Présentation commerciale' }),
                        await this.sectionManager.createSection('features', { title: 'Nos atouts' }),
                        await this.sectionManager.createSection('contact', { title: 'Contactez-nous' })
                    ];
                    break;

                case 'simple':
                    // Template simple avec une section
                    presentation.sections = [
                        await this.sectionManager.createSection('hero', { title: 'Ma présentation' })
                    ];
                    break;

                default:
                    console.warn(`Template inconnu: ${templateName}`);
            }

            presentation.template = templateName;
            console.log(`✅ Template "${templateName}" appliqué avec ${presentation.sections.length} sections`);

        } catch (error) {
            console.error(`❌ Erreur application template ${templateName}:`, error);
            // En cas d'erreur, on laisse une présentation vide
            presentation.sections = [];
        }
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