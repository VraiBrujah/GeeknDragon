/**
 * 📡 EVENT_MANAGER.JS - Gestionnaire d'Événements Global
 * 
 * Rôle : Système d'événements centralisé pour l'éditeur révolutionnaire
 * Type : Gestionnaire d'événements avec bus central
 * Responsabilité : Communication inter-modules, découplage, événements custom
 * Innovation : Système réactif pour synchronisation temps réel
 */
class EventManager {
    
    constructor() {
        // Rôle : Registre central des événements et callbacks
        // Type : Map<String, Array<Function>> (événement → callbacks)
        // Unité : Sans unité
        // Domaine : Nom d'événement unique → liste de fonctions
        // Formule : Map pour performance O(1) sur lookup
        // Exemple : 'widget-created' → [callback1, callback2, callback3]
        this.events = new Map();
        
        // Rôle : Compteur d'événements pour statistiques
        // Type : Map<String, Number> (événement → nombre)
        // Unité : Sans unité (compteur)
        // Domaine : Nom d'événement → nombre d'émissions ≥ 0
        // Formule : Incrémentation à chaque emit()
        // Exemple : 'widget-moved' → 1547 (très utilisé)
        this.eventCounts = new Map();
        
        // Rôle : Historique des événements récents pour debug
        // Type : Array<Object> (journal d'événements)
        // Unité : Sans unité
        // Domaine : Liste chronologique limitée à 1000 entrées
        // Formule : Push + slice pour maintenir taille
        // Exemple : [{event: 'widget-created', timestamp: 1704890400123, data: {...}}]
        this.eventHistory = [];
        this.maxHistorySize = 1000;
        
        // Rôle : Mode debug pour logging détaillé
        // Type : Boolean (état debug)
        // Unité : Sans unité
        // Domaine : true (debug actif) | false (silencieux)
        // Formule : Utils.isDevelopment() par défaut
        // Exemple : true → log tous événements, false → silencieux
        this.debugMode = Utils.isDevelopment();
        
        // Initialisation des événements système
        this.initSystemEvents();
        
        Utils.log('success', 'EventManager initialisé', {
            debugMode: this.debugMode
        });
    }
    
    /**
     * Initialise les événements système de base
     */
    initSystemEvents() {
        // Événements système pour gestion erreurs
        window.addEventListener('error', (event) => {
            this.emit('system:error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Événements de visibilité page pour pause/reprise
        document.addEventListener('visibilitychange', () => {
            this.emit('system:visibility-changed', {
                visible: !document.hidden
            });
        });
        
        // Événements de redimensionnement pour responsive
        window.addEventListener('resize', Utils.throttle(() => {
            this.emit('system:window-resized', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, 250));
        
        // Événements clavier globaux
        document.addEventListener('keydown', (event) => {
            this.emit('system:keydown', {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey
            });
        });
        
        // Événement beforeunload pour sauvegarde
        window.addEventListener('beforeunload', (event) => {
            this.emit('system:before-unload', { event });
        });
    }
    
    /**
     * S'abonne à un événement
     * 
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction de callback
     * @param {Object} options - Options d'abonnement
     * @returns {Function} Fonction de désabonnement
     */
    on(eventName, callback, options = {}) {
        // Validation des paramètres
        if (typeof eventName !== 'string' || !eventName.trim()) {
            throw new Error('Le nom d\'événement doit être une chaîne non vide');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Le callback doit être une fonction');
        }
        
        // Rôle : Enregistrement d'un callback pour un événement
        // Type : Function (callback wrappé)
        // Unité : Sans unité
        // Domaine : callback valide avec options
        // Formule : Map.get(event).push(wrapper) avec options intégrées
        // Exemple : on('widget-created', handleCreate, {once: true})
        const wrappedCallback = {
            fn: callback,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null,
            id: Utils.generateId('callback')
        };
        
        // Initialise l'array si premier callback pour cet événement
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        // Ajout du callback avec tri par priorité (plus élevée d'abord)
        const callbacks = this.events.get(eventName);
        callbacks.push(wrappedCallback);
        callbacks.sort((a, b) => b.priority - a.priority);
        
        if (this.debugMode) {
            Utils.log('info', `Abonnement événement: ${eventName}`, {
                callbackId: wrappedCallback.id,
                priority: wrappedCallback.priority,
                once: wrappedCallback.once,
                totalCallbacks: callbacks.length
            });
        }
        
        // Retourne fonction de désabonnement
        return () => this.off(eventName, wrappedCallback.id);
    }
    
    /**
     * S'abonne à un événement une seule fois
     * 
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction de callback
     * @param {Object} options - Options d'abonnement
     * @returns {Function} Fonction de désabonnement
     */
    once(eventName, callback, options = {}) {
        // Rôle : Abonnement unique auto-désinscrit après première exécution
        // Type : Function (désabonnement)
        // Unité : Sans unité
        // Domaine : callback exécuté exactement 1 fois
        // Formule : on() avec option once=true
        // Exemple : once('project-loaded', init) → init appelé 1 seule fois
        return this.on(eventName, callback, { ...options, once: true });
    }
    
    /**
     * Se désabonne d'un événement
     * 
     * @param {string} eventName - Nom de l'événement
     * @param {string|Function} callbackOrId - Callback ou ID à désabonner
     * @returns {boolean} true si désabonnement réussi
     */
    off(eventName, callbackOrId) {
        if (!this.events.has(eventName)) {
            return false;
        }
        
        // Rôle : Suppression d'un callback du registre d'événements
        // Type : Boolean (succès de suppression)
        // Unité : Sans unité
        // Domaine : true (trouvé et supprimé) | false (non trouvé)
        // Formule : Array.filter pour supprimer callback matching
        // Exemple : off('widget-moved', 'callback-123') → true si supprimé
        const callbacks = this.events.get(eventName);
        const initialLength = callbacks.length;
        
        // Recherche par ID ou par référence fonction
        const filteredCallbacks = callbacks.filter(wrapper => {
            if (typeof callbackOrId === 'string') {
                return wrapper.id !== callbackOrId;
            } else {
                return wrapper.fn !== callbackOrId;
            }
        });
        
        this.events.set(eventName, filteredCallbacks);
        const removed = initialLength > filteredCallbacks.length;
        
        if (this.debugMode && removed) {
            Utils.log('info', `Désabonnement événement: ${eventName}`, {
                callbacksRestants: filteredCallbacks.length
            });
        }
        
        return removed;
    }
    
    /**
     * Émet un événement vers tous les abonnés
     * 
     * @param {string} eventName - Nom de l'événement
     * @param {any} data - Données à transmettre
     * @param {Object} options - Options d'émission
     * @returns {boolean} true si au moins un callback exécuté
     */
    emit(eventName, data = null, options = {}) {
        // Validation
        if (typeof eventName !== 'string' || !eventName.trim()) {
            throw new Error('Le nom d\'événement doit être une chaîne non vide');
        }
        
        // Rôle : Diffusion d'événement vers tous callbacks abonnés
        // Type : Boolean (callbacks exécutés)
        // Unité : Sans unité
        // Domaine : true (≥1 callback) | false (aucun callback)
        // Formule : Itération callbacks avec gestion erreurs + once cleanup
        // Exemple : emit('widget-selected', {widgetId: '123'}) → notify all
        const timestamp = Date.now();
        let callbacksExecuted = 0;
        let errors = [];
        
        // Mise à jour statistiques
        const currentCount = this.eventCounts.get(eventName) || 0;
        this.eventCounts.set(eventName, currentCount + 1);
        
        // Ajout à l'historique
        this.addToHistory(eventName, data, timestamp);
        
        if (!this.events.has(eventName)) {
            if (this.debugMode) {
                Utils.log('warn', `Aucun abonné pour événement: ${eventName}`, data);
            }
            return false;
        }
        
        const callbacks = this.events.get(eventName);
        const callbacksToRemove = [];
        
        // Exécution des callbacks
        callbacks.forEach(wrapper => {
            try {
                // Contexte d'exécution
                const context = wrapper.context || this;
                
                // Préparation des données événement
                const eventData = {
                    type: eventName,
                    data: data,
                    timestamp: timestamp,
                    source: 'EventManager'
                };
                
                // Exécution du callback
                wrapper.fn.call(context, eventData);
                callbacksExecuted++;
                
                // Marquer pour suppression si 'once'
                if (wrapper.once) {
                    callbacksToRemove.push(wrapper.id);
                }
                
            } catch (error) {
                errors.push({
                    callbackId: wrapper.id,
                    error: error
                });
                
                Utils.log('error', `Erreur callback événement ${eventName}:`, {
                    callbackId: wrapper.id,
                    error: error.message,
                    stack: error.stack
                });
            }
        });
        
        // Nettoyage des callbacks 'once'
        callbacksToRemove.forEach(id => {
            this.off(eventName, id);
        });
        
        // Debug logging
        if (this.debugMode) {
            Utils.log('info', `Événement émis: ${eventName}`, {
                callbacksExecuted,
                errors: errors.length,
                data
            });
        }
        
        // Émettre erreur si callbacks ont échoué
        if (errors.length > 0) {
            this.emit('system:callback-errors', {
                eventName,
                errors,
                timestamp
            });
        }
        
        return callbacksExecuted > 0;
    }
    
    /**
     * Ajoute un événement à l'historique
     * 
     * @param {string} eventName - Nom événement
     * @param {any} data - Données
     * @param {number} timestamp - Timestamp
     */
    addToHistory(eventName, data, timestamp) {
        // Rôle : Ajout chronologique à l'historique avec limite taille
        // Type : Void (effet de bord sur historique)
        // Unité : Sans unité
        // Domaine : Entrée historique complète
        // Formule : push + slice pour maintenir maxHistorySize
        // Exemple : Garde les 1000 événements les plus récents
        this.eventHistory.push({
            event: eventName,
            data: data,
            timestamp: timestamp,
            formattedTime: Utils.formatDate(timestamp)
        });
        
        // Limite la taille de l'historique
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * Obtient la liste des événements disponibles
     * 
     * @returns {Array<string>} Liste des noms d'événements
     */
    getEvents() {
        // Rôle : Listeur des événements enregistrés
        // Type : Array<String> (noms d'événements)
        // Unité : Sans unité
        // Domaine : Tous événements avec ≥1 callback
        // Formule : Array.from(Map.keys())
        // Exemple : ['widget-created', 'project-saved', 'sync-updated']
        return Array.from(this.events.keys());
    }
    
    /**
     * Obtient le nombre de callbacks pour un événement
     * 
     * @param {string} eventName - Nom de l'événement
     * @returns {number} Nombre de callbacks
     */
    getCallbackCount(eventName) {
        // Rôle : Compteur de callbacks pour événement spécifique
        // Type : Number (nombre de callbacks)
        // Unité : Sans unité (compteur)
        // Domaine : Nombre ≥ 0
        // Formule : callbacks.length ou 0 si événement inexistant
        // Exemple : getCallbackCount('widget-moved') → 5 (5 modules écoutent)
        if (!this.events.has(eventName)) {
            return 0;
        }
        
        return this.events.get(eventName).length;
    }
    
    /**
     * Obtient les statistiques d'émission des événements
     * 
     * @returns {Object} Statistiques complètes
     */
    getStats() {
        // Rôle : Générateur de statistiques système complet
        // Type : Object (métriques système)
        // Unité : Diverses (compteurs, arrays, etc.)
        // Domaine : Vue d'ensemble performance et usage
        // Formule : Agrégation de toutes métriques internes
        // Exemple : {totalEvents: 25, mostUsed: 'widget-moved', history: [...]}
        const totalEvents = this.getEvents().length;
        const totalEmissions = Array.from(this.eventCounts.values())
            .reduce((sum, count) => sum + count, 0);
        
        // Événement le plus utilisé
        let mostUsedEvent = null;
        let maxCount = 0;
        this.eventCounts.forEach((count, eventName) => {
            if (count > maxCount) {
                maxCount = count;
                mostUsedEvent = eventName;
            }
        });
        
        return {
            totalEvents,
            totalEmissions,
            mostUsedEvent,
            maxEmissions: maxCount,
            historySize: this.eventHistory.length,
            debugMode: this.debugMode,
            eventsList: this.getEvents(),
            emissionCounts: Object.fromEntries(this.eventCounts),
            recentEvents: this.eventHistory.slice(-10) // 10 derniers
        };
    }
    
    /**
     * Vide l'historique des événements
     */
    clearHistory() {
        // Rôle : Réinitialisation complète de l'historique
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Suppression complète données historiques
        // Formule : Réinitialisation arrays et maps
        // Exemple : Nettoyage pour économiser mémoire
        this.eventHistory = [];
        this.eventCounts.clear();
        
        if (this.debugMode) {
            Utils.log('info', 'Historique événements vidé');
        }
    }
    
    /**
     * Supprime tous les abonnements pour un événement
     * 
     * @param {string} eventName - Nom de l'événement
     * @returns {number} Nombre de callbacks supprimés
     */
    removeAllListeners(eventName) {
        // Rôle : Suppresseur masse de tous callbacks d'un événement
        // Type : Number (callbacks supprimés)
        // Unité : Sans unité (compteur)
        // Domaine : Nombre ≥ 0
        // Formule : callbacks.length avant suppression
        // Exemple : removeAllListeners('widget-moved') → 5 (tous supprimés)
        if (!this.events.has(eventName)) {
            return 0;
        }
        
        const callbackCount = this.events.get(eventName).length;
        this.events.delete(eventName);
        
        if (this.debugMode) {
            Utils.log('info', `Tous callbacks supprimés pour: ${eventName}`, {
                callbacksSupprimes: callbackCount
            });
        }
        
        return callbackCount;
    }
    
    /**
     * Active/désactive le mode debug
     * 
     * @param {boolean} enabled - Activer debug
     */
    setDebugMode(enabled) {
        // Rôle : Configurateur du niveau de logging
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : true (debug actif) | false (silencieux)
        // Formule : Modification état debugMode
        // Exemple : setDebugMode(true) → logs détaillés activés
        this.debugMode = !!enabled;
        
        Utils.log('info', `Mode debug EventManager: ${this.debugMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    }
    
    /**
     * Nettoie toutes les ressources
     */
    destroy() {
        // Rôle : Destructeur complet du gestionnaire d'événements
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Libération complète des ressources
        // Formule : Clear de toutes structures de données
        // Exemple : Appelé avant rechargement page ou fermeture
        this.events.clear();
        this.eventCounts.clear();
        this.eventHistory = [];
        
        Utils.log('warn', 'EventManager détruit - toutes ressources libérées');
    }
}

// Export pour utilisation globale
window.EventManager = EventManager;