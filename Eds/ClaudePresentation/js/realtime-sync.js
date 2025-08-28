/**
 * Synchronisation Temps Réel Li-CUBE PRO™
 * Système de synchronisation bidirectionnelle entre éditeurs et présentations
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class RealtimeSync {
    constructor(pageType) {
        // Configuration : type de page (vente, location) et clés de stockage
        this.pageType = pageType; // 'vente' ou 'location'
        this.storageKey = `licubepro-${pageType}-content`;
        this.stylesKey = `licubepro-${pageType}-styles`;
        
        // État : gestion des changements et synchronisation
        this.isUpdating = false;
        this.pendingUpdates = new Set();
        this.lastSync = 0;
        this.syncDelay = 100; // Délai anti-rebond en millisecondes
        
        // Configuration : URLs des pages cibles selon le type
        this.targetUrls = {
            'vente': 'vente.html',
            'location': 'location.html'
        };
        
        this.init();
    }

    /**
     * Initialisation : configuration des écouteurs et synchronisation initiale
     */
    init() {
        this.setupStorageListeners();
        this.setupFieldListeners();
        this.loadAndApplyContent();
        this.startSyncMonitoring();
        
        console.log(`Synchronisation Temps Réel ${this.pageType.toUpperCase()} initialisée`);
    }

    /**
     * Configuration : écouteurs sur le localStorage pour détecter les changements externes
     */
    setupStorageListeners() {
        // Écoute : changements dans localStorage depuis d'autres onglets
        window.addEventListener('storage', (event) => {
            if (event.key === this.storageKey && !this.isUpdating) {
                console.log(`Synchronisation externe détectée pour ${this.pageType}`);
                this.loadAndApplyContent();
            }
        });

        // Écoute : changements de focus pour synchroniser au retour sur la page
        window.addEventListener('focus', () => {
            this.loadAndApplyContent();
        });
    }

    /**
     * Configuration : écouteurs sur les champs éditables pour capturer les modifications
     */
    setupFieldListeners() {
        // Sélection : tous les éléments avec data-field
        const editableElements = document.querySelectorAll('[data-field]');
        
        editableElements.forEach(element => {
            const fieldName = element.dataset.field;
            
            // Écouteurs multiples : capture de tous les types de modifications
            ['input', 'change', 'blur', 'paste'].forEach(eventType => {
                element.addEventListener(eventType, () => {
                    this.queueFieldUpdate(fieldName, element.value || element.textContent);
                });
            });

            // Écouteur spécial : modification du contenu par contentEditable
            if (element.contentEditable === 'true') {
                element.addEventListener('keyup', () => {
                    this.queueFieldUpdate(fieldName, element.textContent);
                });
            }
        });

        console.log(`${editableElements.length} champs éditables surveillés pour ${this.pageType}`);
    }

    /**
     * File d'attente : gestion des mises à jour avec anti-rebond
     * @param {string} fieldName - Nom du champ modifié
     * @param {string} value - Nouvelle valeur
     */
    queueFieldUpdate(fieldName, value) {
        // Ajout à la file : enregistrement de la modification
        this.pendingUpdates.add({ fieldName, value, timestamp: Date.now() });
        
        // Anti-rebond : délai avant traitement pour éviter les mises à jour excessives
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.processPendingUpdates();
        }, this.syncDelay);
    }

    /**
     * Traitement : application des mises à jour en attente
     */
    processPendingUpdates() {
        if (this.pendingUpdates.size === 0) return;
        
        this.isUpdating = true;
        
        // Conversion : transformation du Set en objet de contenu
        const content = this.loadCurrentContent();
        
        this.pendingUpdates.forEach(update => {
            content[update.fieldName] = update.value;
            console.log(`Champ synchronisé: ${update.fieldName} = "${update.value}"`);
        });
        
        // Sauvegarde : persistance des modifications
        this.saveContent(content);
        
        // Application : mise à jour des pages de présentation ouvertes
        this.notifyPresentationPages(content);
        
        // Nettoyage : vidage de la file d'attente
        this.pendingUpdates.clear();
        this.lastSync = Date.now();
        this.isUpdating = false;
    }

    /**
     * Chargement : récupération du contenu depuis localStorage
     * @return {Object} - Contenu actuel ou objet vide
     */
    loadCurrentContent() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error(`Erreur chargement contenu ${this.pageType}:`, error);
            return {};
        }
    }

    /**
     * Sauvegarde : persistance du contenu dans localStorage
     * @param {Object} content - Contenu à sauvegarder
     */
    saveContent(content) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(content));
            console.log(`Contenu ${this.pageType} sauvegardé:`, Object.keys(content).length, 'champs');
        } catch (error) {
            console.error(`Erreur sauvegarde contenu ${this.pageType}:`, error);
        }
    }

    /**
     * Application : mise à jour du contenu dans la page actuelle
     */
    loadAndApplyContent() {
        if (this.isUpdating) return;
        
        const content = this.loadCurrentContent();
        let appliedCount = 0;
        
        // Application : mise à jour de chaque champ trouvé
        Object.entries(content).forEach(([fieldName, value]) => {
            const element = document.querySelector(`[data-field="${fieldName}"]`);
            if (element && element.value !== value && element.textContent !== value) {
                // Détection du type d'élément et application appropriée
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
                
                // Déclenchement : événement de changement pour les écouteurs tiers
                element.dispatchEvent(new Event('input', { bubbles: true }));
                appliedCount++;
            }
        });
        
        if (appliedCount > 0) {
            console.log(`${appliedCount} champs mis à jour depuis le stockage ${this.pageType}`);
        }
    }

    /**
     * Notification : communication avec les pages de présentation
     * @param {Object} content - Contenu à transmettre
     */
    notifyPresentationPages(content) {
        // Communication inter-onglets via localStorage avec timestamp
        const syncMessage = {
            type: 'content-update',
            pageType: this.pageType,
            content: content,
            timestamp: Date.now(),
            source: 'editor'
        };
        
        // Envoi : message temporaire pour déclencher l'événement storage
        const tempKey = `licubepro-sync-${this.pageType}-${Date.now()}`;
        localStorage.setItem(tempKey, JSON.stringify(syncMessage));
        
        // Nettoyage : suppression du message temporaire après délai
        setTimeout(() => {
            localStorage.removeItem(tempKey);
        }, 1000);
    }

    /**
     * Surveillance : vérification périodique de la synchronisation
     */
    startSyncMonitoring() {
        // Vérification : toutes les 5 secondes pour détecter les désynchronisations
        setInterval(() => {
            this.checkSyncHealth();
        }, 5000);
    }

    /**
     * Vérification : contrôle de santé de la synchronisation
     */
    checkSyncHealth() {
        const now = Date.now();
        const timeSinceLastSync = now - this.lastSync;
        
        // Alerte : si pas de synchronisation depuis longtemps
        if (timeSinceLastSync > 300000) { // 5 minutes
            console.warn(`Aucune synchronisation ${this.pageType} depuis ${Math.round(timeSinceLastSync / 60000)} minutes`);
        }
        
        // Auto-synchronisation : si nécessaire
        if (timeSinceLastSync > 60000 && this.pendingUpdates.size === 0) { // 1 minute
            this.loadAndApplyContent();
        }
    }

    /**
     * Exportation : génération d'un export complet du contenu
     * @return {Object} - Contenu formaté pour export
     */
    exportContent() {
        const content = this.loadCurrentContent();
        const styles = this.loadStyles();
        
        return {
            pageType: this.pageType,
            timestamp: Date.now(),
            content: content,
            styles: styles,
            version: '1.0'
        };
    }

    /**
     * Importation : application d'un contenu exporté
     * @param {Object} importData - Données à importer
     * @return {boolean} - Succès de l'importation
     */
    importContent(importData) {
        try {
            // Validation : vérification de la compatibilité
            if (importData.pageType !== this.pageType) {
                throw new Error(`Type de page incompatible: ${importData.pageType} vs ${this.pageType}`);
            }
            
            // Application : contenu et styles
            if (importData.content) {
                this.saveContent(importData.content);
                this.loadAndApplyContent();
            }
            
            if (importData.styles) {
                this.saveStyles(importData.styles);
            }
            
            console.log(`Contenu ${this.pageType} importé avec succès`);
            return true;
            
        } catch (error) {
            console.error(`Erreur importation ${this.pageType}:`, error);
            return false;
        }
    }

    /**
     * Styles : chargement des styles personnalisés
     * @return {Object} - Styles sauvegardés
     */
    loadStyles() {
        try {
            const saved = localStorage.getItem(this.stylesKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error(`Erreur chargement styles ${this.pageType}:`, error);
            return {};
        }
    }

    /**
     * Styles : sauvegarde des styles personnalisés
     * @param {Object} styles - Styles à sauvegarder
     */
    saveStyles(styles) {
        try {
            localStorage.setItem(this.stylesKey, JSON.stringify(styles));
            console.log(`Styles ${this.pageType} sauvegardés`);
        } catch (error) {
            console.error(`Erreur sauvegarde styles ${this.pageType}:`, error);
        }
    }

    /**
     * Réinitialisation : suppression de toutes les données
     */
    reset() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.stylesKey);
        this.pendingUpdates.clear();
        this.lastSync = 0;
        
        console.log(`Données ${this.pageType} réinitialisées`);
    }

    /**
     * Statistiques : informations sur l'état de la synchronisation
     * @return {Object} - Statistiques détaillées
     */
    getStats() {
        const content = this.loadCurrentContent();
        const styles = this.loadStyles();
        
        return {
            pageType: this.pageType,
            contentFields: Object.keys(content).length,
            styleElements: Object.keys(styles).length,
            pendingUpdates: this.pendingUpdates.size,
            lastSync: new Date(this.lastSync).toLocaleString(),
            timeSinceLastSync: Date.now() - this.lastSync,
            storageSize: JSON.stringify(content).length + JSON.stringify(styles).length
        };
    }
}

// Fonction d'initialisation : détection automatique du type de page
function initRealtimeSync() {
    // Détection : analyse de l'URL ou des éléments de la page pour déterminer le type
    const pageUrl = window.location.pathname.toLowerCase();
    let pageType = 'vente'; // Défaut
    
    if (pageUrl.includes('location')) {
        pageType = 'location';
    } else if (pageUrl.includes('vente')) {
        pageType = 'vente';
    }
    
    // Instance globale : accessible depuis toute l'application
    window.realtimeSync = new RealtimeSync(pageType);
    
    return window.realtimeSync;
}

// Auto-initialisation : lancement automatique au chargement
document.addEventListener('DOMContentLoaded', initRealtimeSync);

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeSync;
}