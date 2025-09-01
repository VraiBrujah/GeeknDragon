/**
 * Gestionnaire centralisé des widgets de présentation
 * 
 * Rôle : Gère la création, édition et organisation des widgets disponibles
 * Type : Classe de gestion centralisée des composants réutilisables
 * Responsabilité : Catalogue des widgets, création d'instances, validation
 */
class WidgetManager {
    constructor() {
        // Rôle : Catalogue des types de widgets disponibles
        // Type : Map<String, Class> (registre des classes de widgets)
        // Unité : Sans unité
        // Domaine : Paires (nom_widget, ClasseWidget)
        // Formule : Map avec clés = types, valeurs = constructeurs
        // Exemple : {'text': TextWidget, 'image': ImageWidget, 'button': ButtonWidget}
        this.widgetRegistry = new Map();

        // Rôle : Cache des instances de widgets créées
        // Type : Map<String, BaseWidget> (instances en mémoire)
        // Unité : Sans unité
        // Domaine : Paires (widget_id, instance_widget)
        // Formule : Cache pour réutilisation et performance
        // Exemple : {'widget-text-123': TextWidgetInstance1, 'widget-img-456': ImageWidgetInstance2}
        this.widgetCache = new Map();

        // Rôle : Configuration par défaut des widgets par type
        // Type : Map<String, Object> (configurations par défaut)
        // Unité : Sans unité
        // Domaine : Paires (type_widget, configuration_défaut)
        // Formule : Templates de configuration pour création rapide
        // Exemple : {'text': {fontSize: '16px', color: '#333'}, 'image': {width: 300}}
        this.defaultConfigs = new Map();

        // Rôle : Catégories d'organisation des widgets dans l'interface
        // Type : Map<String, Array<String>> (groupes de widgets)
        // Unité : Sans unité
        // Domaine : Paires (nom_catégorie, [types_widgets])
        // Formule : Organisation logique pour interface utilisateur
        // Exemple : {'content': ['text', 'title'], 'media': ['image', 'video']}
        this.categories = new Map();

        // Rôle : Statistiques d'utilisation des widgets
        // Type : Map<String, Number> (compteurs d'usage)
        // Unité : Sans unité (nombre d'utilisations)
        // Domaine : Paires (type_widget, nb_utilisations)
        // Formule : Incrémentation à chaque création
        // Exemple : {'text': 45, 'image': 23, 'button': 12}
        this.usageStats = new Map();

        // Rôle : Templates de widgets prêts à l'emploi
        // Type : Map<String, Object> (widgets préconfigurés)
        // Unité : Sans unité
        // Domaine : Paires (nom_template, configuration_complète)
        // Formule : Widgets pré-stylés pour usage fréquent
        // Exemple : {'hero-title': {type: 'text', fontSize: '48px', bold: true}}
        this.templates = new Map();

        console.log('🧩 WidgetManager initialisé');
    }

    /**
     * Charge les widgets par défaut du système
     * 
     * Rôle : Initialisation du catalogue avec widgets de base
     * Type : Méthode d'initialisation asynchrone
     * Effet de bord : Remplit le registre avec les widgets essentiels
     */
    async loadDefaultWidgets() {
        console.log('🔄 Chargement des widgets par défaut...');

        try {
            // Enregistrement des widgets de base
            this.registerWidget('text', TextWidget);
            this.registerWidget('title', TextWidget); // Même classe, config différente
            this.registerWidget('image', ImageWidget);
            this.registerWidget('button', ButtonWidget);
            this.registerWidget('spacer', SpacerWidget);
            this.registerWidget('divider', DividerWidget);

            // Configuration des catégories
            this.setupDefaultCategories();

            // Configuration des templates
            this.setupDefaultTemplates();

            console.log(`✅ ${this.widgetRegistry.size} types de widgets chargés`);
        } catch (error) {
            console.error('❌ Erreur chargement widgets par défaut:', error);
            throw error;
        }
    }

    /**
     * Enregistre un nouveau type de widget
     * 
     * @param {string} type - Type de widget (identifiant unique)
     * @param {Class} WidgetClass - Classe du widget à enregistrer
     * @param {Object} defaultConfig - Configuration par défaut (optionnelle)
     */
    registerWidget(type, WidgetClass, defaultConfig = {}) {
        // Validation du type
        if (!type || typeof type !== 'string') {
            throw new Error('Le type de widget doit être une chaîne non vide');
        }

        // Validation de la classe
        if (!WidgetClass || typeof WidgetClass !== 'function') {
            throw new Error('La classe de widget doit être un constructeur valide');
        }

        // Vérification héritage BaseWidget
        if (!this.isValidWidgetClass(WidgetClass)) {
            console.warn(`⚠️ La classe ${WidgetClass.name} ne semble pas hériter de BaseWidget`);
        }

        // Enregistrement dans le catalogue
        this.widgetRegistry.set(type, WidgetClass);

        // Sauvegarde configuration par défaut
        if (Object.keys(defaultConfig).length > 0) {
            this.defaultConfigs.set(type, defaultConfig);
        }

        // Initialisation des statistiques
        this.usageStats.set(type, 0);

        console.log(`📝 Widget '${type}' enregistré (classe: ${WidgetClass.name})`);
    }

    /**
     * Vérifie si une classe hérite correctement de BaseWidget
     * 
     * @param {Class} WidgetClass - Classe à vérifier
     * @returns {boolean} true si la classe est valide
     */
    isValidWidgetClass(WidgetClass) {
        try {
            // Rôle : Création d'instance test pour validation
            // Type : BaseWidget (instance temporaire)
            // Unité : Sans unité
            // Domaine : Instance valide ou exception
            // Formule : new WidgetClass() avec paramètres minimum
            // Exemple : Test si hérite méthodes render(), validate(), etc.
            const testInstance = new WidgetClass('test', { id: 'validation-test' });
            
            // Vérification des méthodes essentielles
            const requiredMethods = ['render', 'validate', 'updateData', 'toJSON'];
            return requiredMethods.every(method => 
                typeof testInstance[method] === 'function'
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Crée une nouvelle instance de widget
     * 
     * @param {string} type - Type de widget à créer
     * @param {Object} config - Configuration du widget
     * @returns {BaseWidget} Instance du widget créé
     */
    createWidget(type, config = {}) {
        // Vérification existence du type
        const WidgetClass = this.widgetRegistry.get(type);
        if (!WidgetClass) {
            throw new Error(`Type de widget inconnu: ${type}`);
        }

        try {
            // Rôle : Configuration complète fusionnant défaut + utilisateur
            // Type : Object (configuration merge)
            // Unité : Sans unité
            // Domaine : Configuration valide pour le type de widget
            // Formule : {...configDéfaut, ...configUtilisateur}
            // Exemple : Config par défaut + surcharges utilisateur
            const defaultConfig = this.defaultConfigs.get(type) || {};
            const fullConfig = { ...defaultConfig, ...config };

            // Création de l'instance
            const widget = new WidgetClass(fullConfig);

            // Ajout au cache
            this.widgetCache.set(widget.id, widget);

            // Mise à jour des statistiques
            const currentUsage = this.usageStats.get(type) || 0;
            this.usageStats.set(type, currentUsage + 1);

            console.log(`✨ Widget créé: ${type} (${widget.id})`);
            return widget;
        } catch (error) {
            console.error(`❌ Erreur création widget '${type}':`, error);
            throw error;
        }
    }

    /**
     * Crée un widget à partir d'un template prédéfini
     * 
     * @param {string} templateName - Nom du template
     * @param {Object} overrides - Surcharges de configuration
     * @returns {BaseWidget} Widget créé depuis template
     */
    createFromTemplate(templateName, overrides = {}) {
        // Récupération du template
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template de widget inconnu: ${templateName}`);
        }

        // Rôle : Configuration finale avec template + surcharges
        // Type : Object (configuration mergée)
        // Unité : Sans unité
        // Domaine : Configuration valide fusionnant template et surcharges
        // Formule : {...template, ...overrides} avec priorité aux surcharges
        // Exemple : Template 'hero-title' + {color: 'red'} → titre rouge
        const config = { ...template, ...overrides };

        // Création du widget avec configuration template
        return this.createWidget(template.type, config);
    }

    /**
     * Récupère un widget depuis le cache
     * 
     * @param {string} widgetId - ID du widget
     * @returns {BaseWidget|null} Instance du widget ou null
     */
    getWidget(widgetId) {
        const widget = this.widgetCache.get(widgetId);
        if (!widget) {
            console.warn(`⚠️ Widget '${widgetId}' non trouvé dans le cache`);
            return null;
        }
        return widget;
    }

    /**
     * Met à jour un widget existant
     * 
     * @param {string} widgetId - ID du widget
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {BaseWidget} Widget mis à jour
     */
    updateWidget(widgetId, updates) {
        const widget = this.getWidget(widgetId);
        if (!widget) {
            throw new Error(`Widget '${widgetId}' non trouvé`);
        }

        // Application des mises à jour selon le type
        if (updates.data) {
            widget.updateData(updates.data, updates.mergeData !== false);
        }
        if (updates.styles) {
            widget.updateStyles(updates.styles, updates.mergeStyles !== false);
        }
        if (updates.position) {
            widget.updatePosition(updates.position);
        }

        // Mise à jour d'autres propriétés
        ['name', 'visible', 'editable'].forEach(prop => {
            if (updates[prop] !== undefined) {
                widget[prop] = updates[prop];
                widget.metadata.modified = new Date().toISOString();
            }
        });

        console.log(`🔄 Widget '${widgetId}' mis à jour`);
        return widget;
    }

    /**
     * Supprime un widget du cache
     * 
     * @param {string} widgetId - ID du widget à supprimer
     * @returns {boolean} true si supprimé avec succès
     */
    removeWidget(widgetId) {
        const widget = this.widgetCache.get(widgetId);
        if (!widget) {
            return false;
        }

        // Nettoyage éventuel (listeners, ressources, etc.)
        if (typeof widget.cleanup === 'function') {
            widget.cleanup();
        }

        // Suppression du cache
        const removed = this.widgetCache.delete(widgetId);
        
        if (removed) {
            console.log(`🗑️ Widget '${widgetId}' supprimé du cache`);
        }

        return removed;
    }

    /**
     * Clone un widget existant avec un nouvel ID
     * 
     * @param {string} widgetId - ID du widget à cloner
     * @param {Object} modifications - Modifications à appliquer au clone
     * @returns {BaseWidget} Widget cloné
     */
    cloneWidget(widgetId, modifications = {}) {
        const originalWidget = this.getWidget(widgetId);
        if (!originalWidget) {
            throw new Error(`Widget '${widgetId}' non trouvé pour clonage`);
        }

        // Clonage du widget
        const clonedWidget = originalWidget.clone();

        // Application des modifications
        if (Object.keys(modifications).length > 0) {
            this.updateWidget(clonedWidget.id, modifications);
        }

        // Ajout au cache
        this.widgetCache.set(clonedWidget.id, clonedWidget);

        console.log(`📋 Widget cloné: ${widgetId} → ${clonedWidget.id}`);
        return clonedWidget;
    }

    /**
     * Retourne la liste des types de widgets disponibles
     * 
     * @param {string} category - Catégorie à filtrer (optionnelle)
     * @returns {Array<Object>} Liste des widgets disponibles
     */
    getAvailableWidgets(category = null) {
        const availableWidgets = [];

        for (const [type, WidgetClass] of this.widgetRegistry) {
            // Création d'une instance temporaire pour récupérer les métadonnées
            try {
                const tempWidget = new WidgetClass({ id: 'temp-meta' });
                
                const widgetInfo = {
                    type: type,
                    name: tempWidget.getDefaultName(),
                    description: tempWidget.getDefaultDescription(),
                    category: tempWidget.getDefaultCategory(),
                    className: WidgetClass.name,
                    usageCount: this.usageStats.get(type) || 0
                };

                // Filtrage par catégorie si spécifié
                if (!category || widgetInfo.category === category) {
                    availableWidgets.push(widgetInfo);
                }
            } catch (error) {
                console.warn(`⚠️ Impossible de récupérer les métadonnées du widget '${type}':`, error);
            }
        }

        // Tri par popularité puis alphabétique
        return availableWidgets.sort((a, b) => {
            if (a.usageCount !== b.usageCount) {
                return b.usageCount - a.usageCount; // Plus utilisés en premier
            }
            return a.name.localeCompare(b.name); // Puis alphabétique
        });
    }

    /**
     * Retourne les catégories de widgets disponibles
     * 
     * @returns {Array<Object>} Liste des catégories avec compteurs
     */
    getCategories() {
        const categories = [];

        for (const [categoryName, widgetTypes] of this.categories) {
            // Rôle : Comptage des widgets dans cette catégorie
            // Type : Number (nombre de widgets)
            // Unité : Sans unité (nombre)
            // Domaine : count ≥ 0
            // Formule : Somme des widgets existants dans cette catégorie
            // Exemple : Catégorie 'content' → 5 types de widgets
            const widgetCount = widgetTypes.filter(type => 
                this.widgetRegistry.has(type)
            ).length;

            categories.push({
                name: categoryName,
                displayName: this.getCategoryDisplayName(categoryName),
                widgetCount: widgetCount,
                widgets: widgetTypes
            });
        }

        return categories.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }

    /**
     * Retourne le nom d'affichage d'une catégorie
     * 
     * @param {string} categoryName - Nom interne de la catégorie
     * @returns {string} Nom d'affichage localisé
     */
    getCategoryDisplayName(categoryName) {
        // Rôle : Mapping des noms internes vers noms d'affichage français
        // Type : Object<String, String> (dictionnaire de traduction)
        // Unité : Sans unité
        // Domaine : Correspondances nom_interne → nom_affiché
        // Formule : Table de traduction statique
        // Exemple : 'content' → 'Contenu', 'media' → 'Médias'
        const displayNames = {
            'content': 'Contenu',
            'media': 'Médias',
            'interaction': 'Interaction',
            'layout': 'Mise en page',
            'navigation': 'Navigation',
            'form': 'Formulaires',
            'chart': 'Graphiques',
            'social': 'Réseaux sociaux',
            'other': 'Autres'
        };

        return displayNames[categoryName] || categoryName;
    }

    /**
     * Configure les catégories par défaut
     */
    setupDefaultCategories() {
        // Définition des catégories d'organisation
        this.categories.set('content', ['text', 'title', 'list', 'quote']);
        this.categories.set('media', ['image', 'video', 'audio', 'gallery']);
        this.categories.set('interaction', ['button', 'link', 'form', 'modal']);
        this.categories.set('layout', ['spacer', 'divider', 'container', 'columns']);
        this.categories.set('navigation', ['menu', 'breadcrumb', 'pagination']);
        this.categories.set('chart', ['bar-chart', 'pie-chart', 'line-chart']);
        this.categories.set('social', ['share-buttons', 'social-feed', 'comments']);

        console.log(`📂 ${this.categories.size} catégories de widgets configurées`);
    }

    /**
     * Configure les templates par défaut
     */
    setupDefaultTemplates() {
        // Templates pour titres
        this.templates.set('hero-title', {
            type: 'text',
            name: 'Titre Principal',
            data: {
                text: 'Titre Principal',
                tag: 'h1'
            },
            styles: {
                fontSize: '48px',
                fontWeight: 'bold',
                textAlign: 'center',
                margin: '20px 0'
            }
        });

        this.templates.set('section-title', {
            type: 'text',
            name: 'Titre de Section',
            data: {
                text: 'Titre de Section',
                tag: 'h2'
            },
            styles: {
                fontSize: '32px',
                fontWeight: '600',
                margin: '15px 0 10px 0'
            }
        });

        // Templates pour texte
        this.templates.set('paragraph', {
            type: 'text',
            name: 'Paragraphe',
            data: {
                text: 'Votre texte ici...',
                tag: 'p'
            },
            styles: {
                fontSize: '16px',
                lineHeight: '1.6',
                margin: '10px 0'
            }
        });

        this.templates.set('lead-text', {
            type: 'text',
            name: 'Texte d\'Introduction',
            data: {
                text: 'Texte d\'introduction mis en évidence',
                tag: 'p'
            },
            styles: {
                fontSize: '20px',
                fontWeight: '300',
                lineHeight: '1.5',
                margin: '15px 0'
            }
        });

        // Templates pour images
        this.templates.set('hero-image', {
            type: 'image',
            name: 'Image Principale',
            data: {
                alt: 'Image principale de la section',
                objectFit: 'cover',
                width: 800,
                height: 400
            },
            styles: {
                width: '100%',
                maxWidth: '800px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
        });

        this.templates.set('thumbnail', {
            type: 'image',
            name: 'Image Miniature',
            data: {
                alt: 'Image miniature',
                objectFit: 'cover',
                width: 200,
                height: 200
            },
            styles: {
                width: '200px',
                height: '200px',
                borderRadius: '8px'
            }
        });

        console.log(`📋 ${this.templates.size} templates de widgets configurés`);
    }

    /**
     * Exporte un widget au format JSON
     * 
     * @param {string} widgetId - ID du widget à exporter
     * @returns {Object} Données JSON du widget
     */
    exportWidget(widgetId) {
        const widget = this.getWidget(widgetId);
        if (!widget) {
            throw new Error(`Widget '${widgetId}' non trouvé pour export`);
        }

        const exportData = {
            ...widget.toJSON(),
            exportTimestamp: new Date().toISOString(),
            exportVersion: '1.0.0'
        };

        console.log(`📤 Widget '${widgetId}' exporté`);
        return exportData;
    }

    /**
     * Importe un widget depuis JSON
     * 
     * @param {Object} jsonData - Données JSON du widget
     * @returns {BaseWidget} Widget importé
     */
    importWidget(jsonData) {
        if (!jsonData.type) {
            throw new Error('Type de widget manquant dans les données JSON');
        }

        const WidgetClass = this.widgetRegistry.get(jsonData.type);
        if (!WidgetClass) {
            throw new Error(`Type de widget inconnu: ${jsonData.type}`);
        }

        try {
            // Création depuis JSON
            const widget = WidgetClass.fromJSON(jsonData);
            
            // Ajout au cache
            this.widgetCache.set(widget.id, widget);

            console.log(`📥 Widget importé: ${jsonData.type} (${widget.id})`);
            return widget;
        } catch (error) {
            console.error(`❌ Erreur import widget:`, error);
            throw error;
        }
    }

    /**
     * Valide la cohérence d'un ensemble de widgets
     * 
     * @param {Array<string>} widgetIds - IDs des widgets à valider
     * @returns {Object} Rapport de validation
     */
    validateWidgets(widgetIds) {
        const validationReport = {
            totalWidgets: widgetIds.length,
            validWidgets: 0,
            invalidWidgets: 0,
            errors: [],
            warnings: []
        };

        widgetIds.forEach(widgetId => {
            const widget = this.getWidget(widgetId);
            
            if (!widget) {
                validationReport.errors.push(`Widget '${widgetId}' non trouvé`);
                validationReport.invalidWidgets++;
                return;
            }

            try {
                widget.validate();
                validationReport.validWidgets++;
            } catch (error) {
                validationReport.errors.push(`Widget '${widgetId}': ${error.message}`);
                validationReport.invalidWidgets++;
            }
        });

        console.log(`✅ Validation de ${widgetIds.length} widgets: ${validationReport.validWidgets} valides, ${validationReport.invalidWidgets} invalides`);
        return validationReport;
    }

    /**
     * Nettoie le cache des widgets inutilisés
     * 
     * @param {Array<string>} activeWidgetIds - IDs des widgets encore utilisés
     * @returns {number} Nombre de widgets nettoyés
     */
    cleanupCache(activeWidgetIds = []) {
        let cleanupCount = 0;
        const activeSet = new Set(activeWidgetIds);

        for (const [widgetId, widget] of this.widgetCache) {
            if (!activeSet.has(widgetId)) {
                // Widget non utilisé, nettoyage
                if (typeof widget.cleanup === 'function') {
                    widget.cleanup();
                }
                this.widgetCache.delete(widgetId);
                cleanupCount++;
            }
        }

        if (cleanupCount > 0) {
            console.log(`🧹 Cache nettoyé: ${cleanupCount} widgets supprimés`);
        }

        return cleanupCount;
    }

    /**
     * Retourne les statistiques d'utilisation des widgets
     * 
     * @returns {Object} Statistiques complètes
     */
    getStatistics() {
        return {
            registeredTypes: this.widgetRegistry.size,
            cachedInstances: this.widgetCache.size,
            totalUsage: Array.from(this.usageStats.values()).reduce((sum, count) => sum + count, 0),
            usageByType: Object.fromEntries(this.usageStats),
            availableTemplates: this.templates.size,
            categories: this.categories.size
        };
    }

    /**
     * Réinitialise le gestionnaire de widgets
     */
    reset() {
        // Nettoyage des widgets en cache
        this.widgetCache.forEach(widget => {
            if (typeof widget.cleanup === 'function') {
                widget.cleanup();
            }
        });

        // Reset des collections
        this.widgetCache.clear();
        this.usageStats.clear();

        // Remise à zéro des compteurs mais conservation du registre
        for (const type of this.widgetRegistry.keys()) {
            this.usageStats.set(type, 0);
        }

        console.log('🔄 WidgetManager réinitialisé');
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.WidgetManager = WidgetManager;