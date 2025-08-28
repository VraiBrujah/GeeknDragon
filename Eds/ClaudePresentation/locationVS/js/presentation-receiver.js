/**
 * Récepteur Présentation Li-CUBE PRO™
 * Réception et application automatique des modifications depuis les éditeurs
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class PresentationReceiver {
    constructor(pageType) {
        // Configuration : type de page et identification
        this.pageType = pageType; // 'vente' ou 'location'
        this.storageKey = `locationVS-${pageType}-live`;
        
        // État : suivi des mises à jour reçues
        this.updatesReceived = 0;
        this.lastUpdate = 0;
        this.isListening = false;
        
        // Configuration : délais et options
        this.debounceDelay = 25; // Délai ultra-court pour applications immédiates
        this.maxUpdateQueue = 100;
        this.updateQueue = [];
        
        this.init();
    }

    /**
     * Initialisation : mise en place de la réception automatique
     */
    init() {
        // Récepteur PRÉSENTATION initialisé en mode silencieux
        
        this.setupStorageListeners();
        this.setupMessageListeners();
        this.startUpdateProcessing();
        this.loadInitialContent();
        
        this.isListening = true;
        // Récepteur en mode écoute active
    }

    /**
     * Configuration : écoute des changements de stockage inter-onglets
     */
    setupStorageListeners() {
        // Écoute : événements storage pour communications entre onglets
        window.addEventListener('storage', (event) => {
            // Filtrage : messages de synchronisation instantanée
            if (event.key && event.key.includes(`locationVS-instant-${this.pageType}`)) {
                this.handleStorageUpdate(event);
            }
        });
        
        // Écoute : changements directs du storage principal
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            const result = originalSetItem.call(localStorage, key, value);
            
            // Détection : modifications du storage principal
            if (key === this.storageKey) {
                this.handleDirectStorageChange(value);
            }
            
            return result;
        };
    }

    /**
     * Configuration : écoute des messages inter-fenêtres
     */
    setupMessageListeners() {
        // Écoute : événements personnalisés de synchronisation
        window.addEventListener('locationVS-instant-sync', (event) => {
            if (event.detail && event.detail.pageType === this.pageType) {
                this.handleSyncMessage(event.detail);
            }
        });
        
        // Écoute : messages postMessage des iframes/fenêtres
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'instant-sync' && 
                event.data.pageType === this.pageType) {
                this.handleSyncMessage(event.data);
            }
        });
        
        // Écoute : focus pour synchronisation de rattrapage
        window.addEventListener('focus', () => {
            this.loadAndApplyLatestContent();
        });
        
        // Écoute : visibilité pour sync quand la page redevient visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadAndApplyLatestContent();
            }
        });
    }

    /**
     * Traitement : message de changement de storage
     * @param {StorageEvent} event - Événement de storage
     */
    handleStorageUpdate(event) {
        if (!event.newValue) return;
        
        try {
            const syncMessage = JSON.parse(event.newValue);
            this.queueUpdate(syncMessage);
            
            // Message storage traité
            
        } catch (error) {
            // Erreur lors du traitement du message storage
        }
    }

    /**
     * Traitement : changement direct du storage principal
     * @param {string} newValue - Nouvelle valeur du storage
     */
    handleDirectStorageChange(newValue) {
        try {
            const content = JSON.parse(newValue);
            
            // Application : contenu complet si pas de champ spécifique
            if (!content.modifiedField) {
                this.queueUpdate({
                    type: 'full-sync',
                    pageType: this.pageType,
                    fullContent: content,
                    timestamp: Date.now()
                });
            } else {
                this.queueUpdate({
                    type: 'field-sync',
                    pageType: this.pageType,
                    fieldName: content.modifiedField,
                    fieldValue: content[content.modifiedField],
                    fullContent: content,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            // Erreur lors du changement direct
        }
    }

    /**
     * Traitement : message de synchronisation
     * @param {Object} message - Message de synchronisation
     */
    handleSyncMessage(message) {
        if (message.source === 'presentation-receiver') {
            // Éviter : boucles de synchronisation
            return;
        }
        
        this.queueUpdate(message);
        // Message sync traité
    }

    /**
     * File d'attente : ajout d'une mise à jour à traiter
     * @param {Object} updateMessage - Message de mise à jour
     */
    queueUpdate(updateMessage) {
        // Ajout : à la file avec timestamp
        this.updateQueue.push({
            ...updateMessage,
            queuedAt: Date.now()
        });
        
        // Limitation : taille de la file pour éviter l'accumulation
        if (this.updateQueue.length > this.maxUpdateQueue) {
            this.updateQueue = this.updateQueue.slice(-this.maxUpdateQueue);
        }
        
        // Déclenchement : traitement avec anti-rebond
        this.scheduleProcessing();
    }

    /**
     * Planification : traitement des mises à jour avec anti-rebond
     */
    scheduleProcessing() {
        clearTimeout(this.processTimeout);
        this.processTimeout = setTimeout(() => {
            this.processUpdateQueue();
        }, this.debounceDelay);
    }

    /**
     * Traitement : application de toutes les mises à jour en file
     */
    processUpdateQueue() {
        if (this.updateQueue.length === 0) return;
        
        // Traitement des mises à jour en cours
        
        // Groupement : mises à jour par type
        const fieldUpdates = new Map();
        const fullUpdates = [];
        
        this.updateQueue.forEach(update => {
            if (update.type === 'full-sync' || !update.fieldName) {
                fullUpdates.push(update);
            } else {
                // Dernière valeur : pour chaque champ (écrasement)
                fieldUpdates.set(update.fieldName, update);
            }
        });
        
        // Application : mises à jour complètes d'abord
        fullUpdates.forEach(update => {
            this.applyFullUpdate(update.fullContent || update.content);
        });
        
        // Application : mises à jour par champ
        fieldUpdates.forEach((update, fieldName) => {
            this.applyFieldUpdate(fieldName, update.fieldValue, update);
        });
        
        // Nettoyage : vidage de la file
        this.updatesReceived += this.updateQueue.length;
        this.lastUpdate = Date.now();
        this.updateQueue = [];
        
        // Mises à jour appliquées avec succès
    }

    /**
     * Application : mise à jour d'un champ spécifique
     * @param {string} fieldName - Nom du champ à mettre à jour
     * @param {string} value - Nouvelle valeur
     * @param {Object} updateInfo - Informations de mise à jour
     */
    applyFieldUpdate(fieldName, value, updateInfo) {
        // Recherche : élément dans la page de présentation
        const elements = document.querySelectorAll(`[data-field="${fieldName}"]`);
        
        if (elements.length === 0) {
            // Champ non trouvé dans la page
            return;
        }
        
        elements.forEach(element => {
            const currentValue = this.getElementValue(element);
            
            // Vérification : changement réel nécessaire
            if (currentValue !== value) {
                this.setElementValue(element, value);
                this.animateUpdatedElement(element);
                
                // Champ mis à jour
            }
        });

        // Traitement spécial : champs téléphone et email pour liens
        this.handleSpecialFields(fieldName, value);
    }

    /**
     * Traitement spécial : champs nécessitant une logique particulière
     * @param {string} fieldName - Nom du champ
     * @param {string} value - Valeur du champ
     */
    handleSpecialFields(fieldName, value) {
        // Gestion : numéro de téléphone pour liens
        if (fieldName === 'phone-number') {
            const phoneLinks = document.querySelectorAll('[data-phone-field="phone-number"]');
            phoneLinks.forEach(link => {
                const cleanPhone = value.replace(/\D/g, ''); // Supprime tout sauf chiffres
                link.href = `tel:${cleanPhone}`;
                // Lien téléphone mis à jour
            });
        }
        
        // Gestion : adresse email pour liens
        if (fieldName === 'email-address') {
            const emailLinks = document.querySelectorAll('[data-email-field="email-address"]');
            emailLinks.forEach(link => {
                // Conservation : sujet et corps du message existant
                const currentHref = link.href;
                const subjectMatch = currentHref.match(/subject=([^&]*)/);
                const bodyMatch = currentHref.match(/body=([^&]*)/);
                
                let newHref = `mailto:${value}`;
                if (subjectMatch) {
                    newHref += `?subject=${subjectMatch[1]}`;
                    if (bodyMatch) {
                        newHref += `&body=${bodyMatch[1]}`;
                    }
                } else if (bodyMatch) {
                    newHref += `?body=${bodyMatch[1]}`;
                }
                
                link.href = newHref;
                // Lien email mis à jour
            });
        }

        // Gestion : métadonnées de la page
        if (fieldName === 'page-title') {
            document.title = value;
            // Titre de page mis à jour
        }
        
        if (fieldName === 'page-description') {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', value);
                // Meta description mise à jour
            }
        }

        // Gestion : images avec chemins dynamiques
        this.updateImageFields(fieldName, value);
    }

    /**
     * Mise à jour : images avec chemins dynamiques
     * @param {string} fieldName - Nom du champ image
     * @param {string} imagePath - Nouveau chemin de l'image
     */
    updateImageFields(fieldName, imagePath) {
        // Correspondance : nom de champ vers sélecteur d'attribut
        const imageFieldMappings = {
            'logo-path': 'logo-path',
            'product-image-path': 'product-image-path',
            'competitor-image-path': 'competitor-image-path',
            'company-image-path': 'company-image-path'
        };

        // Vérification : est-ce un champ d'image reconnu
        if (imageFieldMappings[fieldName]) {
            const imageElements = document.querySelectorAll(`[data-image-field="${imageFieldMappings[fieldName]}"]`);
            
            imageElements.forEach(element => {
                // Mise à jour : background-image via CSS
                const newImageUrl = `url('${imagePath}')`;
                element.style.backgroundImage = newImageUrl;
                
                // Animation : effet visuel de changement
                this.animateImageUpdate(element);
                
                // Image mise à jour
            });
        }

        // Gestion spéciale : images dans les règles CSS existantes
        this.updateCSSImageRules(fieldName, imagePath);
    }

    /**
     * Mise à jour : règles CSS avec images
     * @param {string} fieldName - Nom du champ image
     * @param {string} imagePath - Nouveau chemin de l'image
     */
    updateCSSImageRules(fieldName, imagePath) {
        // Recherche : feuilles de style pour mise à jour dynamique
        const styleSheets = document.styleSheets;
        
        try {
            for (let i = 0; i < styleSheets.length; i++) {
                const styleSheet = styleSheets[i];
                if (!styleSheet.cssRules) continue;
                
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const rule = styleSheet.cssRules[j];
                    
                    // Mise à jour : logo EDS dans .nav-logo
                    if (fieldName === 'logo-path' && rule.selectorText && rule.selectorText.includes('.nav-logo')) {
                        rule.style.backgroundImage = `url('${imagePath}')`;
                        // CSS rule nav-logo mise à jour
                    }
                    
                    // Mise à jour : produit dans .product-showcase
                    if (fieldName === 'product-image-path' && rule.selectorText && rule.selectorText.includes('.product-showcase')) {
                        rule.style.backgroundImage = `url('${imagePath}')`;
                        // CSS rule product-showcase mise à jour
                    }
                }
            }
        } catch (error) {
            // Fallback : si l'accès aux CSS rules échoue (CORS, etc.)
            // Fallback style inline utilisé
        }
    }

    /**
     * Animation : effet visuel pour changement d'image
     * @param {HTMLElement} element - Élément image modifié
     */
    animateImageUpdate(element) {
        // Animation : effet de flash pour indiquer le changement d'image
        const originalFilter = element.style.filter;
        const originalTransform = element.style.transform;
        
        element.style.filter = 'brightness(1.3) saturate(1.2)';
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.5s ease';
        
        // Restauration : état normal après animation
        setTimeout(() => {
            element.style.filter = originalFilter;
            element.style.transform = originalTransform;
        }, 600);
    }

    /**
     * Application : mise à jour complète du contenu
     * @param {Object} content - Contenu complet à appliquer
     */
    applyFullUpdate(content) {
        if (!content) return;
        
        let updatedCount = 0;
        
        // Application : chaque champ du contenu
        Object.entries(content).forEach(([fieldName, value]) => {
            // Exclusion : champs de métadonnées
            if (['lastModified', 'modifiedField', 'timestamp'].includes(fieldName)) {
                return;
            }
            
            const elements = document.querySelectorAll(`[data-field="${fieldName}"]`);
            
            elements.forEach(element => {
                const currentValue = this.getElementValue(element);
                
                if (currentValue !== value) {
                    this.setElementValue(element, value);
                    this.animateUpdatedElement(element);
                    updatedCount++;
                }
            });

            // Traitement spécial : champs d'images et autres champs spéciaux
            this.handleSpecialFields(fieldName, value);
        });
        
        // Mise à jour complète effectuée
    }

    /**
     * Lecture : valeur actuelle d'un élément
     * @param {HTMLElement} element - Élément à lire
     * @return {string} - Valeur actuelle
     */
    getElementValue(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            return element.value || '';
        } else if (element.contentEditable === 'true') {
            return element.textContent || '';
        } else {
            return element.textContent || element.innerText || '';
        }
    }

    /**
     * Écriture : nouvelle valeur dans un élément
     * @param {HTMLElement} element - Élément cible
     * @param {string} value - Valeur à écrire
     */
    setElementValue(element, value) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            element.value = value;
        } else if (element.contentEditable === 'true') {
            element.textContent = value;
        } else {
            element.textContent = value;
        }
        
        // Déclenchement : événements pour autres scripts
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Événement personnalisé : notification de mise à jour
        element.dispatchEvent(new CustomEvent('locationVS-updated', {
            detail: { fieldName: element.dataset.field, value: value },
            bubbles: true
        }));
    }

    /**
     * Animation : effet visuel sur élément mis à jour
     * @param {HTMLElement} element - Élément à animer
     */
    animateUpdatedElement(element) {
        // Animation : surbrillance bleue pour indiquer la mise à jour
        const originalBorder = element.style.border;
        const originalBackground = element.style.background;
        const originalTransform = element.style.transform;
        
        element.style.border = '2px solid #3B82F6';
        element.style.background = 'rgba(59, 130, 246, 0.1)';
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'all 0.4s ease';
        
        // Restauration : état normal après animation
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.background = originalBackground;
            element.style.transform = originalTransform;
        }, 800);
    }

    /**
     * Chargement initial : contenu au démarrage de la page
     */
    loadInitialContent() {
        try {
            const content = localStorage.getItem(this.storageKey);
            if (content) {
                const parsedContent = JSON.parse(content);
                this.applyFullUpdate(parsedContent);
                // Contenu initial appliqué
            }
        } catch (error) {
            // Erreur lors du chargement initial
        }
    }

    /**
     * Chargement de rattrapage : derniers contenus en cas de désynchronisation
     */
    loadAndApplyLatestContent() {
        // Synchronisation de rattrapage en cours
        
        // Chargement : contenu le plus récent
        this.loadInitialContent();
        
        // Vérification : messages en attente dans le storage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(`locationVS-instant-${this.pageType}`)) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    if (message.timestamp > this.lastUpdate) {
                        this.queueUpdate(message);
                    }
                } catch (e) {
                    // Ignore les messages malformés
                }
            }
        }
    }

    /**
     * Démarrage : processeur de mises à jour continue
     */
    startUpdateProcessing() {
        // Traitement : toutes les 50ms pour réactivité maximale
        setInterval(() => {
            if (this.updateQueue.length > 0) {
                this.processUpdateQueue();
            }
        }, 50);
        
        // Surveillance : santé du système
        setInterval(() => {
            this.checkReceiverHealth();
        }, 30000); // 30 secondes
    }

    /**
     * Surveillance : vérification de la santé du récepteur
     */
    checkReceiverHealth() {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdate;
        
        // Diagnostic : activité récente
        if (timeSinceLastUpdate > 300000 && this.updatesReceived > 0) { // 5 minutes
            // Surveillance: aucune mise à jour récente
        }
        
        // Nettoyage : anciens messages temporaires
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('locationVS-instant-') && key.includes(this.pageType)) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    if (now - message.timestamp > 60000) { // 1 minute
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Suppression des messages corrompus
                    localStorage.removeItem(key);
                }
            }
        }
    }

    /**
     * Statistiques : informations sur les mises à jour reçues
     * @return {Object} - Statistiques du récepteur
     */
    getStats() {
        return {
            pageType: this.pageType,
            updatesReceived: this.updatesReceived,
            queueLength: this.updateQueue.length,
            isListening: this.isListening,
            lastUpdate: new Date(this.lastUpdate).toLocaleString(),
            timeSinceLastUpdate: Date.now() - this.lastUpdate
        };
    }

    /**
     * Arrêt : désactivation du récepteur
     */
    stop() {
        this.isListening = false;
        clearTimeout(this.processTimeout);
        this.updateQueue = [];
        // Récepteur désactivé
    }
}

// Auto-détection : type de page et initialisation
function initPresentationReceiver() {
    const pageUrl = window.location.pathname.toLowerCase();
    let pageType = 'vente'; // Défaut
    
    if (pageUrl.includes('locationvs')) {
        pageType = 'locationVS'; // ✅ CORRECTION : namespace spécifique pour locationVS
    } else if (pageUrl.includes('location')) {
        pageType = 'location';
    } else if (pageUrl.includes('vente')) {
        pageType = 'vente';
    }
    
    // Vérification : ne s'active que sur les pages de présentation (pas les éditeurs)
    if (pageUrl.includes('edit-')) {
        // Récepteur non nécessaire sur page éditeur
        return null;
    }
    
    // Instance globale
    window.presentationReceiver = new PresentationReceiver(pageType);
    
    // Debug : exposition des stats
    window.getReceiverStats = () => window.presentationReceiver.getStats();
    
    return window.presentationReceiver;
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initPresentationReceiver);

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationReceiver;
}