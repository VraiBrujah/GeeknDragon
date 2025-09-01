/**
 * Gestionnaire de hiérarchie complète pour les présentations
 * 
 * Rôle : Gère la structure hiérarchique complète : Méta-Sections → Sections → Sous-Sections → Widgets  
 * Type : Classe de gestion architecturale avec arbre de composants
 * Responsabilité : Structure, navigation, validation et rendu hiérarchique
 */
class HierarchyManager {
    constructor(widgetManager) {
        // Référence au gestionnaire de widgets
        this.widgetManager = widgetManager;

        // Rôle : Définitions des types hiérarchiques disponibles
        // Type : Object avec configuration de chaque niveau
        // Unité : Sans unité (types de conteneurs)
        // Domaine : 5 niveaux hiérarchiques définis
        // Formule : Structure arborescente avec règles d'imbrication
        // Exemple : MetaSection peut contenir Sections, Sections peuvent contenir SousSection, etc.
        this.hierarchyLevels = {
            'meta-section': {
                name: 'Méta-Section',
                icon: 'fas fa-layer-group',
                canContain: ['section', 'widget'],
                examples: ['Header Global', 'Corps Principal', 'Footer Global']
            },
            'section': {
                name: 'Section',
                icon: 'fas fa-th-large',
                canContain: ['sous-section', 'widget'],
                examples: ['Hero', 'Tarification', 'Contact', 'Témoignages']
            },
            'sous-section': {
                name: 'Sous-Section',
                icon: 'fas fa-th',
                canContain: ['sous-sous-section', 'widget'],
                examples: ['Colonne Gauche', 'Colonne Droite', 'Zone Contenu']
            },
            'sous-sous-section': {
                name: 'Sous-Sous-Section',
                icon: 'fas fa-th-list',
                canContain: ['widget'],
                examples: ['Zone Titre', 'Zone Description', 'Zone Actions']
            },
            'widget': {
                name: 'Widget',
                icon: 'fas fa-puzzle-piece',
                canContain: [],
                examples: ['Texte', 'Image', 'Bouton', 'Espaceur']
            }
        };

        // Rôle : Templates prédéfinis pour chaque type hiérarchique
        // Type : Map<String, Object> (templates par type)
        // Unité : Sans unité
        // Domaine : Templates configurables pour chaque niveau
        // Formule : Map avec structure prédéfinie pour création rapide
        // Exemple : template 'hero-section' avec layout et widgets par défaut
        this.hierarchyTemplates = new Map();
        
        // Rôle : Cache des éléments créés pour performance
        // Type : Map<String, Object> (éléments mis en cache)
        // Unité : Sans unité
        // Domaine : Éléments avec ID unique
        // Formule : Cache LRU avec limite de taille
        // Exemple : {'meta-header-123': {type, children, config}, ...}
        this.elementCache = new Map();

        // Initialisation des templates
        this.initializeHierarchyTemplates();

        console.log('🏗️ HierarchyManager initialisé avec', Object.keys(this.hierarchyLevels).length, 'niveaux hiérarchiques');
    }

    /**
     * Initialise de façon asynchrone le gestionnaire hiérarchique
     * 
     * Rôle : Initialisation complète du système hiérarchique
     * Type : Méthode d'initialisation asynchrone
     * Retour : Promise<void> - Résolution quand l'initialisation est terminée
     * Effet de bord : Configuration finale des templates et validation
     */
    async init() {
        try {
            console.log('🔄 Initialisation asynchrone HierarchyManager...');
            
            // Validation de l'initialisation des templates
            if (this.hierarchyTemplates.size === 0) {
                console.warn('⚠️ Aucun template hiérarchique chargé, re-initialisation...');
                this.initializeHierarchyTemplates();
            }
            
            // Validation des niveaux hiérarchiques
            const levels = Object.keys(this.hierarchyLevels);
            if (levels.length === 0) {
                throw new Error('Aucun niveau hiérarchique défini');
            }
            
            console.log(`✅ HierarchyManager initialisé: ${levels.length} niveaux, ${this.hierarchyTemplates.size} templates`);
        } catch (error) {
            console.error('❌ Erreur initialisation HierarchyManager:', error);
            throw error;
        }
    }

    /**
     * Initialise les templates hiérarchiques prédéfinis
     * 
     * Rôle : Chargement des templates par défaut pour construction rapide
     * Type : Méthode d'initialisation de données
     * Effet de bord : Remplit hierarchyTemplates avec configurations prêtes
     */
    initializeHierarchyTemplates() {
        // Templates de Méta-Sections
        this.hierarchyTemplates.set('meta-header', {
            type: 'meta-section',
            name: 'Header Global',
            description: 'En-tête principal du site avec navigation',
            children: [
                {
                    type: 'section',
                    name: 'Navigation',
                    children: [
                        {type: 'widget', widgetType: 'text', content: 'Logo'},
                        {type: 'widget', widgetType: 'text', content: 'Menu Navigation'}
                    ]
                }
            ],
            styles: {
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--primary-dark)',
                borderBottom: '1px solid var(--surface-light)'
            }
        });

        this.hierarchyTemplates.set('meta-body', {
            type: 'meta-section',
            name: 'Corps Principal',
            description: 'Contenu principal de la présentation',
            children: [],
            styles: {
                flex: 1,
                background: 'var(--primary-dark)'
            }
        });

        this.hierarchyTemplates.set('meta-footer', {
            type: 'meta-section',
            name: 'Footer Global', 
            description: 'Pied de page avec informations de contact',
            children: [
                {
                    type: 'section',
                    name: 'Informations Contact',
                    children: [
                        {type: 'widget', widgetType: 'text', content: 'Copyright © 2024'}
                    ]
                }
            ],
            styles: {
                background: 'var(--secondary-dark)',
                marginTop: 'auto'
            }
        });

        // Templates de Sections
        this.hierarchyTemplates.set('hero-section', {
            type: 'section',
            name: 'Section Hero',
            description: 'Bannière principale avec titre et call-to-action',
            children: [
                {
                    type: 'sous-section',
                    name: 'Contenu Principal',
                    children: [
                        {
                            type: 'sous-sous-section',
                            name: 'Zone Titre',
                            children: [
                                {type: 'widget', widgetType: 'text', content: 'Titre Principal'}
                            ]
                        },
                        {
                            type: 'sous-sous-section', 
                            name: 'Zone Actions',
                            children: [
                                {type: 'widget', widgetType: 'button', content: 'Call to Action'}
                            ]
                        }
                    ]
                }
            ],
            styles: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)'
            }
        });

        this.hierarchyTemplates.set('pricing-section', {
            type: 'section',
            name: 'Section Tarification',
            description: 'Grille de tarifs avec options',
            children: [
                {
                    type: 'sous-section',
                    name: 'Titre Section',
                    children: [
                        {type: 'widget', widgetType: 'text', content: 'Nos Tarifs'}
                    ]
                },
                {
                    type: 'sous-section',
                    name: 'Grille Tarifs',
                    children: [
                        {
                            type: 'sous-sous-section',
                            name: 'Plan Basic',
                            children: [
                                {type: 'widget', widgetType: 'text', content: 'Plan Basic'},
                                {type: 'widget', widgetType: 'text', content: '29€/mois'}
                            ]
                        }
                    ]
                }
            ],
            styles: {
                padding: '4rem 2rem',
                background: 'var(--surface-dark)'
            }
        });

        console.log('📋 Templates hiérarchiques initialisés:', this.hierarchyTemplates.size, 'templates');
    }

    /**
     * Crée un nouvel élément dans la hiérarchie
     * 
     * Rôle : Factory pour création d'éléments hiérarchiques
     * Type : Méthode de création avec validation
     * Paramètres : type - Type d'élément, config - Configuration
     * Retour : Object - Élément hiérarchique créé
     * Effet de bord : Ajoute l'élément au cache et aux statistiques
     */
    createElement(type, config = {}) {
        // Validation du type
        if (!this.hierarchyLevels[type]) {
            throw new Error(`Type hiérarchique inconnu: ${type}`);
        }

        // Génération d'ID unique
        const id = config.id || this.generateElementId(type);

        // Configuration de base de l'élément  
        const element = {
            id: id,
            type: type,
            name: config.name || this.hierarchyLevels[type].name,
            description: config.description || '',
            children: config.children || [],
            styles: config.styles || {},
            data: config.data || {},
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        // Traitement spécial pour les widgets
        if (type === 'widget') {
            element.widgetType = config.widgetType || 'text';
            element.widgetConfig = config.widgetConfig || {};
            
            // Utilisation du WidgetManager si disponible
            if (this.widgetManager && element.widgetType) {
                try {
                    element.widgetInstance = this.widgetManager.createWidget(element.widgetType, {
                        id: element.id,
                        data: element.widgetConfig
                    });
                } catch (error) {
                    console.warn(`⚠️ Erreur création widget ${element.widgetType}:`, error.message);
                }
            }
        }

        // Mise en cache
        this.elementCache.set(id, element);

        console.log(`🔧 Élément créé: ${type} (${id})`);
        return element;
    }

    /**
     * Crée un élément à partir d'un template
     * 
     * Rôle : Création rapide via templates prédéfinis
     * Type : Méthode factory avec template
     * Paramètre : templateName - Nom du template à utiliser
     * Retour : Object - Élément créé depuis le template
     */
    createFromTemplate(templateName, overrides = {}) {
        const template = this.hierarchyTemplates.get(templateName);
        if (!template) {
            throw new Error(`Template introuvable: ${templateName}`);
        }

        // Fusion template + overrides
        const config = {
            ...template,
            ...overrides,
            children: this.createChildrenFromTemplate(template.children || [])
        };

        return this.createElement(template.type, config);
    }

    /**
     * Crée récursivement les enfants depuis un template
     * 
     * Rôle : Construction récursive de l'arbre hiérarchique
     * Type : Méthode récursive de construction
     * Paramètre : childrenTemplate - Array des enfants à créer
     * Retour : Array - Enfants créés récursivement
     */
    createChildrenFromTemplate(childrenTemplate) {
        return childrenTemplate.map(childTemplate => {
            const child = this.createElement(childTemplate.type, childTemplate);
            
            // Récursion pour les petits-enfants
            if (childTemplate.children && childTemplate.children.length > 0) {
                child.children = this.createChildrenFromTemplate(childTemplate.children);
            }
            
            return child;
        });
    }

    /**
     * Ajoute un enfant à un élément parent
     * 
     * Rôle : Insertion d'élément dans la hiérarchie avec validation
     * Type : Méthode de manipulation arborescente
     * Paramètres : parentId - ID parent, child - Élément enfant, position - Position d'insertion
     * Effet de bord : Modifie l'arbre hiérarchique et met à jour le cache
     */
    addChild(parentId, child, position = -1) {
        const parent = this.elementCache.get(parentId);
        if (!parent) {
            throw new Error(`Élément parent introuvable: ${parentId}`);
        }

        // Validation de la possibilité d'imbrication
        const parentLevel = this.hierarchyLevels[parent.type];
        if (!parentLevel.canContain.includes(child.type)) {
            throw new Error(`${parent.type} ne peut pas contenir ${child.type}`);
        }

        // Insertion à la position spécifiée
        if (position === -1 || position >= parent.children.length) {
            parent.children.push(child);
        } else {
            parent.children.splice(position, 0, child);
        }

        // Mise à jour des timestamps
        parent.modified = new Date().toISOString();
        
        // Mise à jour du cache
        this.elementCache.set(parentId, parent);

        console.log(`➕ Enfant ${child.type} ajouté à ${parent.type} (${parentId})`);
    }

    /**
     * Supprime un enfant d'un élément parent
     * 
     * Rôle : Suppression d'élément de la hiérarchie
     * Type : Méthode de manipulation arborescente
     * Paramètres : parentId - ID parent, childId - ID enfant à supprimer
     * Effet de bord : Modifie l'arbre et nettoie le cache
     */
    removeChild(parentId, childId) {
        const parent = this.elementCache.get(parentId);
        if (!parent) {
            throw new Error(`Élément parent introuvable: ${parentId}`);
        }

        // Recherche et suppression de l'enfant
        const childIndex = parent.children.findIndex(child => child.id === childId);
        if (childIndex === -1) {
            throw new Error(`Enfant introuvable: ${childId}`);
        }

        const removedChild = parent.children.splice(childIndex, 1)[0];
        
        // Nettoyage récursif du cache
        this.cleanupElementFromCache(removedChild);

        // Mise à jour du parent
        parent.modified = new Date().toISOString();
        this.elementCache.set(parentId, parent);

        console.log(`➖ Enfant ${childId} supprimé de ${parentId}`);
    }

    /**
     * Déplace un enfant d'une position à une autre
     * 
     * Rôle : Réorganisation de l'ordre des enfants
     * Type : Méthode de manipulation de position
     * Paramètres : parentId - ID parent, childId - ID enfant, newPosition - Nouvelle position
     */
    moveChild(parentId, childId, newPosition) {
        const parent = this.elementCache.get(parentId);
        if (!parent) {
            throw new Error(`Élément parent introuvable: ${parentId}`);
        }

        const currentIndex = parent.children.findIndex(child => child.id === childId);
        if (currentIndex === -1) {
            throw new Error(`Enfant introuvable: ${childId}`);
        }

        // Déplacement
        const child = parent.children.splice(currentIndex, 1)[0];
        parent.children.splice(newPosition, 0, child);

        // Mise à jour
        parent.modified = new Date().toISOString();
        this.elementCache.set(parentId, parent);

        console.log(`🔄 Enfant ${childId} déplacé vers position ${newPosition}`);
    }

    /**
     * Génère un ID unique pour un élément
     * 
     * Rôle : Génération d'identifiants uniques
     * Type : Utilitaire de génération d'ID
     * Paramètre : type - Type d'élément
     * Retour : string - ID unique généré
     */
    generateElementId(type) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6);
        return `${type}-${timestamp}-${random}`;
    }

    /**
     * Nettoie récursivement un élément du cache
     * 
     * Rôle : Nettoyage mémoire récursif
     * Type : Méthode utilitaire de nettoyage
     * Paramètre : element - Élément à nettoyer
     * Effet de bord : Supprime l'élément et ses enfants du cache
     */
    cleanupElementFromCache(element) {
        // Nettoyage récursif des enfants
        if (element.children) {
            element.children.forEach(child => {
                this.cleanupElementFromCache(child);
            });
        }

        // Suppression du cache
        this.elementCache.delete(element.id);
    }

    /**
     * Retourne la liste des types disponibles pour un parent
     * 
     * Rôle : Validation des types autorisés pour imbrication
     * Type : Méthode de validation
     * Paramètre : parentType - Type du parent
     * Retour : Array - Types autorisés comme enfants
     */
    getAvailableChildTypes(parentType) {
        const parentLevel = this.hierarchyLevels[parentType];
        return parentLevel ? parentLevel.canContain : [];
    }


    /**
     * Retourne les templates disponibles
     * 
     * Rôle : Accès au catalogue de templates
     * Type : Getter de templates
     * Retour : Map - Templates disponibles
     */
    getAvailableTemplates() {
        return this.hierarchyTemplates;
    }

    /**
     * Trouve un élément par son ID dans le cache
     * 
     * Rôle : Recherche d'élément par identifiant
     * Type : Méthode de recherche
     * Paramètre : elementId - ID de l'élément recherché
     * Retour : Object|null - Élément trouvé ou null
     */
    getElementById(elementId) {
        return this.elementCache.get(elementId) || null;
    }

    /**
     * Valide la structure hiérarchique complète
     * 
     * Rôle : Validation de cohérence de l'arbre
     * Type : Méthode de validation récursive
     * Paramètre : element - Élément racine à valider
     * Retour : Object - Résultat de validation avec erreurs éventuelles
     */
    validateHierarchy(element) {
        const errors = [];
        const warnings = [];

        // Validation récursive
        this._validateElementRecursive(element, errors, warnings);

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Validation récursive d'un élément
     * 
     * Rôle : Validation interne récursive
     * Type : Méthode utilitaire récursive
     * Paramètres : element - Élément à valider, errors - Array des erreurs, warnings - Array des avertissements
     */
    _validateElementRecursive(element, errors, warnings) {
        // Validation du type
        if (!this.hierarchyLevels[element.type]) {
            errors.push(`Type hiérarchique invalide: ${element.type} (${element.id})`);
            return;
        }

        const level = this.hierarchyLevels[element.type];

        // Validation des enfants
        if (element.children) {
            element.children.forEach(child => {
                if (!level.canContain.includes(child.type)) {
                    errors.push(`${element.type} ne peut pas contenir ${child.type} (parent: ${element.id}, enfant: ${child.id})`);
                }

                // Récursion pour les petits-enfants
                this._validateElementRecursive(child, errors, warnings);
            });
        }

        // Avertissements pour éléments vides
        if (element.type !== 'widget' && (!element.children || element.children.length === 0)) {
            warnings.push(`Élément ${element.type} vide: ${element.id}`);
        }
    }

    /**
     * Retourne tous les templates hiérarchiques disponibles
     * 
     * Rôle : Accessor pour les templates hiérarchiques
     * Type : Méthode getter pour templates
     * Retour : Object - Tous les templates disponibles convertis en objet
     */
    getTemplates() {
        // Rôle : Conversion de la Map des templates en objet simple
        // Type : Object (templates convertis depuis Map)
        // Unité : Sans unité
        // Domaine : Object avec propriétés template
        // Formule : Object.fromEntries(Map) pour conversion
        // Exemple : {'meta-header': {...}, 'hero-section': {...}}
        const templatesObject = Object.fromEntries(this.hierarchyTemplates);
        
        console.log(`📋 ${this.hierarchyTemplates.size} templates hiérarchiques disponibles`);
        return templatesObject;
    }

    /**
     * Retourne les niveaux hiérarchiques disponibles
     * 
     * Rôle : Accessor pour la structure hiérarchique
     * Type : Méthode getter pour niveaux
     * Retour : Object - Niveaux hiérarchiques avec leurs configurations
     */
    getHierarchyLevels() {
        return { ...this.hierarchyLevels };
    }

    /**
     * Récupère un template spécifique par son nom
     * 
     * Rôle : Accès à un template individuel
     * Type : Méthode de récupération
     * Paramètre : templateName (String) - Nom du template recherché
     * Retour : Object|null - Template trouvé ou null
     */
    getTemplate(templateName) {
        // Rôle : Vérification d'existence du nom de template
        // Type : String (nom de template)
        // Unité : Sans unité
        // Domaine : Chaîne non vide ou null/undefined
        // Formule : Recherche directe dans Map
        // Exemple : "presentation-corporate", "section-intro"
        if (!templateName) {
            return null;
        }

        // Rôle : Template trouvé dans la collection
        // Type : Object (configuration template) ou undefined
        // Unité : Sans unité
        // Domaine : Template valide ou undefined si non trouvé
        // Formule : Accès direct via Map.get()
        // Exemple : {name: "corporate", description: "...", elements: [...]}
        const template = this.hierarchyTemplates.get(templateName);
        
        return template || null;
    }

    /**
     * Déploie un template en créant les éléments correspondants
     * 
     * Rôle : Application d'un template à la présentation
     * Type : Méthode de déploiement
     * Paramètre : template (Object) - Configuration du template à déployer
     * Retour : HierarchyElement - Élément racine créé
     */
    deployTemplate(template) {
        // Rôle : Vérification de validité du template
        // Type : Object (template de hiérarchie)
        // Unité : Sans unité
        // Domaine : Object avec propriétés name et structure
        // Formule : Validation existence propriétés requises
        // Exemple : {name: "corporate", type: "meta-section", elements: [...]}
        if (!template || !template.name) {
            console.error('❌ Template invalide pour déploiement:', template);
            return null;
        }

        console.log(`🎨 Déploiement du template: ${template.name}`);

        // Rôle : Élément racine créé depuis le template
        // Type : HierarchyElement (élément hiérarchique)
        // Unité : Sans unité
        // Domaine : Instance valide de HierarchyElement
        // Formule : Création via createFromTemplate()
        // Exemple : Meta-section contenant sections et widgets prédéfinis
        const rootElement = this.createFromTemplate(template.name, template);

        // Rôle : Application des éléments enfants du template
        // Type : Array<Object> (éléments enfants)
        // Unité : Sans unité
        // Domaine : Liste d'éléments à créer
        // Formule : Itération sur template.elements
        // Exemple : [{type: "section", title: "Intro"}, {type: "widget", ...}]
        if (template.elements && Array.isArray(template.elements)) {
            template.elements.forEach(childConfig => {
                const childElement = new HierarchyElement({
                    ...childConfig,
                    parent: rootElement.id
                });
                rootElement.addChild(childElement);
            });
        }

        return rootElement;
    }

    /**
     * Génère le HTML pour un ensemble d'éléments hiérarchiques
     * 
     * Rôle : Rendu HTML des éléments hiérarchiques
     * Type : Méthode de génération de contenu
     * Paramètre : hierarchicalElements (Array) - Éléments à rendre
     * Retour : String - HTML généré
     */
    generateHTML(hierarchicalElements = []) {
        // Rôle : Vérification de validité des éléments
        // Type : Array (liste d'éléments hiérarchiques)
        // Unité : Sans unité
        // Domaine : Array valide (possiblement vide)
        // Formule : Validation Array.isArray()
        // Exemple : [metaSection1, section1, widget1]
        if (!Array.isArray(hierarchicalElements)) {
            console.warn('⚠️ generateHTML: éléments non valides, utilisation tableau vide');
            hierarchicalElements = [];
        }

        // Rôle : HTML généré pour tous les éléments
        // Type : String (HTML complet)
        // Unité : Sans unité
        // Domaine : String HTML valide
        // Formule : Concaténation des HTML individuels
        // Exemple : "<div class='meta-section'>...</div><div class='section'>...</div>"
        const htmlParts = hierarchicalElements.map(element => {
            if (element && typeof element.generateHTML === 'function') {
                return element.generateHTML();
            } else {
                console.warn('⚠️ Élément sans méthode generateHTML:', element);
                return '';
            }
        });

        return htmlParts.join('\n');
    }
}

// Export de la classe pour utilisation globale
if (typeof window !== 'undefined') {
    window.HierarchyManager = HierarchyManager;
}