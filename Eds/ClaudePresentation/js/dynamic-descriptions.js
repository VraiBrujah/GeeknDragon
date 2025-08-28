/**
 * Descriptions Dynamiques Li-CUBE PRO™
 * Système de mise à jour automatique des descriptions basé sur le contenu réel
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class DynamicDescriptions {
    constructor() {
        // Configuration : mapping des champs avec leurs descriptions dynamiques
        this.fieldDescriptions = {
            'nav-title': (value) => `Titre affiché dans la barre de navigation (actuellement: ${value || 'non défini'})`,
            'logo-path': (value) => `Chemin vers le logo EDS (actuellement: ${this.extractFilename(value) || 'non défini'})`,
            'product-image-path': (value) => `Chemin vers l'image ${this.extractProductName(value) || 'Li-CUBE PRO™'} dans la section héro`,
            'competitor-image-path': (value) => `Chemin vers l'image ${this.extractProductName(value) || 'concurrent (Ni-Cd)'} obsolètes`,
            'company-image-path': (value) => `Chemin vers l'image ${this.extractCompanyName(value) || 'entreprise EDS Québec'}`,
            'hero-title': (value) => `Nom du produit principal (actuellement: ${value || 'Li-CUBE PRO™'})`,
            'hero-subtitle': (value) => `Accroche principale (actuellement: ${value || 'non définie'})`,
            'hero-description': (value) => `Description argumentaire (${this.getWordCount(value)} mots)`,
            'pricing-title': (value) => `Titre section tarifs (actuellement: ${value || 'non défini'})`,
            'pricing-subtitle': (value) => `Explication tarifaire (${this.getWordCount(value)} mots)`,
            'comparison-title': (value) => `Titre comparaison technique (actuellement: ${value || 'non défini'})`,
            'comparison-subtitle': (value) => `Explication supériorité technique (${this.getWordCount(value)} mots)`,
            'contact-title': (value) => `Titre section contact (actuellement: ${value || 'non défini'})`,
            'contact-subtitle': (value) => `Message de renforcement (${this.getWordCount(value)} mots)`,
            'rental-phone': (value) => `Numéro spécialisé location (actuellement: ${value || 'non défini'})`,
            'rental-email': (value) => `Email location (actuellement: ${value || 'non défini'})`,
            'contact-phone': (value) => `Numéro vente (actuellement: ${value || 'non défini'})`,
            'contact-email': (value) => `Email vente (actuellement: ${value || 'non défini'})`,
        };

        // État : dernières valeurs connues pour éviter les mises à jour inutiles
        this.lastValues = {};
        
        this.init();
    }

    /**
     * Initialisation : configuration des observateurs et écouteurs
     */
    init() {
        this.setupFieldObservers();
        this.updateAllDescriptions();
        console.log('Système de Descriptions Dynamiques Li-CUBE PRO™ initialisé');
    }

    /**
     * Configuration : mise en place des observateurs sur les champs éditables
     */
    setupFieldObservers() {
        // Sélection : tous les champs avec attribut data-field
        const editableFields = document.querySelectorAll('[data-field]');
        
        editableFields.forEach(field => {
            const fieldName = field.dataset.field;
            
            // Écouteur : mise à jour à chaque modification
            field.addEventListener('input', () => {
                this.updateFieldDescription(fieldName, field.value);
            });
            
            // Écouteur : mise à jour lors de la perte de focus
            field.addEventListener('blur', () => {
                this.updateFieldDescription(fieldName, field.value);
            });
        });
    }

    /**
     * Mise à jour : actualisation de la description d'un champ spécifique
     * @param {string} fieldName - Nom du champ à mettre à jour
     * @param {string} value - Nouvelle valeur du champ
     */
    updateFieldDescription(fieldName, value) {
        // Vérification : éviter les mises à jour inutiles
        if (this.lastValues[fieldName] === value) return;
        
        this.lastValues[fieldName] = value;
        
        // Recherche : localisation de la description associée
        const descriptionElement = document.querySelector(`[for="${fieldName}"] + .field-description`);
        if (!descriptionElement) return;
        
        // Génération : création de la nouvelle description
        const generator = this.fieldDescriptions[fieldName];
        if (!generator) return;
        
        const newDescription = generator(value);
        
        // Application : mise à jour du contenu
        descriptionElement.textContent = newDescription;
        
        // Animation : effet visuel de mise à jour
        this.animateDescriptionUpdate(descriptionElement);
        
        console.log(`Description mise à jour pour ${fieldName}: ${newDescription}`);
    }

    /**
     * Mise à jour globale : actualisation de toutes les descriptions
     */
    updateAllDescriptions() {
        Object.keys(this.fieldDescriptions).forEach(fieldName => {
            const field = document.querySelector(`[data-field="${fieldName}"]`);
            if (field) {
                this.updateFieldDescription(fieldName, field.value);
            }
        });
    }

    /**
     * Animation : effet visuel lors de la mise à jour d'une description
     * @param {HTMLElement} element - Élément à animer
     */
    animateDescriptionUpdate(element) {
        // Effet : brève surbrillance pour indiquer la mise à jour
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        
        // Restauration : retour à l'état normal après délai
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 300);
    }

    // Utilitaires : fonctions d'extraction et de traitement des données

    /**
     * Extraction : récupération du nom de fichier depuis un chemin
     * @param {string} path - Chemin complet vers le fichier
     * @return {string} - Nom du fichier sans extension
     */
    extractFilename(path) {
        if (!path) return '';
        
        // Extraction : nom après le dernier slash
        const filename = path.split('/').pop() || path.split('\\').pop() || '';
        
        // Suppression : extension de fichier
        return filename.replace(/\.[^/.]+$/, '');
    }

    /**
     * Extraction : récupération du nom de produit depuis un chemin d'image
     * @param {string} path - Chemin vers l'image du produit
     * @return {string} - Nom du produit extrait
     */
    extractProductName(path) {
        if (!path) return '';
        
        const filename = this.extractFilename(path);
        
        // Nettoyage : suppression des termes techniques
        return filename
            .replace(/[_-]/g, ' ')
            .replace(/\b(image|img|photo|pic)\b/gi, '')
            .trim();
    }

    /**
     * Extraction : récupération du nom d'entreprise depuis un chemin
     * @param {string} path - Chemin vers l'image d'entreprise
     * @return {string} - Nom de l'entreprise extrait
     */
    extractCompanyName(path) {
        if (!path) return '';
        
        const filename = this.extractFilename(path);
        
        // Reconnaissance : identification des noms d'entreprise courants
        const companyNames = ['EDS', 'Quebec', 'Québec', 'edsquebec'];
        
        for (const name of companyNames) {
            if (filename.toLowerCase().includes(name.toLowerCase())) {
                return name === 'edsquebec' ? 'EDS Québec' : name;
            }
        }
        
        // Alternative : utilisation du nom de fichier nettoyé
        return filename.replace(/[_-]/g, ' ').trim();
    }

    /**
     * Comptage : nombre de mots dans un texte
     * @param {string} text - Texte à analyser
     * @return {number} - Nombre de mots
     */
    getWordCount(text) {
        if (!text || typeof text !== 'string') return 0;
        
        // Comptage : séparation par espaces et filtrage des éléments vides
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Ajout : enregistrement d'un nouveau générateur de description
     * @param {string} fieldName - Nom du champ
     * @param {Function} generator - Fonction génératrice de description
     */
    addFieldDescription(fieldName, generator) {
        this.fieldDescriptions[fieldName] = generator;
        
        // Mise à jour immédiate : application de la nouvelle description
        const field = document.querySelector(`[data-field="${fieldName}"]`);
        if (field) {
            this.updateFieldDescription(fieldName, field.value);
        }
    }

    /**
     * Suppression : retrait d'un générateur de description
     * @param {string} fieldName - Nom du champ à supprimer
     */
    removeFieldDescription(fieldName) {
        delete this.fieldDescriptions[fieldName];
        delete this.lastValues[fieldName];
    }

    /**
     * Configuration : mise à jour des descriptions pour les faiblesses/forces
     * @param {number} count - Nombre d'éléments à configurer
     * @param {string} type - Type d'élément ('weakness' ou 'strength')
     */
    setupComparisonDescriptions(count, type) {
        for (let i = 1; i <= count; i++) {
            // Titre : description pour le titre de l'élément
            this.addFieldDescription(`${type}${i}-title`, (value) => 
                `${type === 'weakness' ? 'Faiblesse' : 'Avantage'} ${i} - Titre (actuellement: ${value || 'non défini'})`
            );
            
            // Description : description pour le contenu détaillé
            this.addFieldDescription(`${type}${i}-desc`, (value) => 
                `${type === 'weakness' ? 'Défaut détaillé' : 'Atout expliqué'} ${i} (${this.getWordCount(value)} mots)`
            );
        }
    }
}

// Initialisation automatique : lancement au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Instance globale : accessible depuis toute l'application
    window.dynamicDescriptions = new DynamicDescriptions();
    
    // Configuration spéciale : ajout des descriptions pour la comparaison technique
    window.dynamicDescriptions.setupComparisonDescriptions(11, 'weakness');
    window.dynamicDescriptions.setupComparisonDescriptions(12, 'strength');
    
    // Mise à jour périodique : vérification toutes les 30 secondes
    setInterval(() => {
        window.dynamicDescriptions.updateAllDescriptions();
    }, 30000);
});