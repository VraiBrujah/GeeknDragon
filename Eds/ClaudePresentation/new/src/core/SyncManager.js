/**
 * Gestionnaire de synchronisation temps réel entre éditeur et viewer
 * 
 * Rôle : Synchronise automatiquement toute modification de l'éditeur vers le viewer
 * Type : Classe de synchronisation bidirectionnelle temps réel
 * Responsabilité : Communication éditeur ⟷ viewer + persistance état
 */
class SyncManager {
    constructor() {
        // Rôle : Identifiant unique de cette session de synchronisation
        // Type : String (UUID de session)
        // Unité : Sans unité
        // Domaine : Chaîne alphanumérique unique par session
        // Formule : 'sync-' + timestamp + '-' + random
        // Exemple : 'sync-1704890400123-xyz789'
        this.sessionId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Rôle : Stockage des canaux de communication actifs
        // Type : Map<String, BroadcastChannel> (canaux de diffusion)
        // Unité : Sans unité
        // Domaine : Map avec clés = noms canaux, valeurs = instances BroadcastChannel
        // Formule : new Map() → gestion centralisée des canaux
        // Exemple : {'presentation': BroadcastChannel1, 'styles': BroadcastChannel2}
        this.channels = new Map();

        // Rôle : Debounce timer pour éviter trop de synchronisations rapprochées
        // Type : Number (ID du timer setTimeout)
        // Unité : millisecondes (délai)
        // Domaine : null ou ID timer valide
        // Formule : setTimeout retourne ID numérique > 0
        // Exemple : 1234 → timer actif, null → aucun timer
        this.debounceTimer = null;

        // Rôle : Délai de debounce pour limiter fréquence de synchronisation
        // Type : Number (temps en millisecondes)
        // Unité : millisecondes (ms)
        // Domaine : 50 ≤ debounceDelay ≤ 2000
        // Formule : Délai optimal entre performance et réactivité
        // Exemple : 200ms → max 5 syncs/seconde
        this.debounceDelay = 200;

        // Rôle : Cache du dernier état synchronisé pour éviter doublons
        // Type : String (JSON sérialisé)
        // Unité : Sans unité
        // Domaine : JSON valide ou null si aucun cache
        // Formule : JSON.stringify(état) → string pour comparaison
        // Exemple : '{"sections":[...],"styles":{...}}' 
        this.lastSyncedState = null;

        // Rôle : Flag indiquant si le gestionnaire est initialisé et actif
        // Type : Boolean (état d'initialisation)
        // Unité : Sans unité
        // Domaine : true | false
        // Formule : false au départ, true après init()
        // Exemple : true → peut synchroniser, false → doit attendre init
        this.isInitialized = false;

        console.log(`🔄 SyncManager créé avec session ID: ${this.sessionId}`);
    }

    /**
     * Initialise le gestionnaire de synchronisation
     * 
     * Rôle : Configuration des canaux et listeners de synchronisation
     * Type : Méthode d'initialisation asynchrone
     * Effet de bord : Créé les BroadcastChannel et configure les listeners
     */
    init() {
        try {
            console.log('🚀 Initialisation du gestionnaire de synchronisation...');

            // Configuration des canaux de communication
            this.setupChannels();

            // Configuration des listeners d'événements
            this.setupEventListeners();

            // Configuration de la persistance automatique
            this.setupAutoPersistence();

            // Marquer comme initialisé
            this.isInitialized = true;

            console.log('✅ SyncManager initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation SyncManager:', error);
            throw error;
        }
    }

    /**
     * Configure les canaux de communication BroadcastChannel
     * 
     * Rôle : Création des canaux pour différents types de données
     * Type : Méthode de configuration interne
     * Effet de bord : Crée les BroadcastChannel dans this.channels
     */
    setupChannels() {
        // Rôle : Définition des canaux de communication nécessaires
        // Type : Array<String> (noms des canaux)
        // Unité : Sans unité
        // Domaine : Noms de canaux alphanumériques
        // Formule : Liste des types de données à synchroniser
        // Exemple : ['presentation', 'styles', 'widgets'] → 3 canaux
        const channelNames = [
            'presentation-data',    // Données de présentation (sections, widgets)
            'presentation-styles',  // Styles CSS dynamiques
            'presentation-actions', // Actions utilisateur (add, remove, move)
            'presentation-meta'     // Métadonnées et configuration
        ];

        channelNames.forEach(channelName => {
            try {
                // Rôle : Création d'un canal de diffusion pour ce type de données
                // Type : BroadcastChannel (API native navigateur)
                // Unité : Sans unité
                // Domaine : Instance valide de BroadcastChannel
                // Formule : new BroadcastChannel(nom) → canal de diffusion
                // Exemple : Canal 'presentation-data' pour sync des sections
                const channel = new BroadcastChannel(channelName);
                
                // Configuration du listener pour ce canal
                channel.onmessage = (event) => {
                    this.handleChannelMessage(channelName, event);
                };

                // Stockage du canal
                this.channels.set(channelName, channel);

                console.log(`📡 Canal '${channelName}' configuré`);
            } catch (error) {
                console.warn(`⚠️ Impossible de créer le canal '${channelName}':`, error);
            }
        });
    }

    /**
     * Configure les listeners d'événements globaux
     * 
     * Rôle : Écoute des événements système pour synchronisation
     * Type : Méthode de configuration des event listeners
     * Effet de bord : Ajoute des listeners sur window et localStorage
     */
    setupEventListeners() {
        // Rôle : Écoute des changements de localStorage entre onglets
        // Type : Event listener (API Storage)
        // Unité : Sans unité
        // Domaine : Événements storage du navigateur
        // Formule : window.addEventListener('storage', callback)
        // Exemple : Autre onglet modifie localStorage → événement reçu
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('presentation-')) {
                this.handleStorageChange(event);
            }
        });

        // Rôle : Écoute des événements personnalisés de l'application
        // Type : Event listener (CustomEvent)
        // Unité : Sans unité
        // Domaine : Événements personnalisés de présentation
        // Formule : window.addEventListener('nom-événement', callback)
        // Exemple : Événement 'sectionAdded' → synchronisation automatique
        window.addEventListener('presentationChanged', (event) => {
            this.handlePresentationChange(event);
        });

        // Rôle : Écoute des raccourcis clavier pour actions rapides
        // Type : Event listener (KeyboardEvent)
        // Unité : Sans unité
        // Domaine : Événements clavier globaux
        // Formule : event.ctrlKey + event.key → combinaison de touches
        // Exemple : Ctrl+S → sauvegarde et synchronisation
        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.forceSyncCurrentState();
            }
        });

        console.log('🎧 Event listeners configurés');
    }

    /**
     * Configure la persistance automatique
     * 
     * Rôle : Sauvegarde automatique périodique de l'état
     * Type : Méthode de configuration de persistance
     * Effet de bord : Démarre un timer de sauvegarde automatique
     */
    setupAutoPersistence() {
        // Rôle : Intervalle de sauvegarde automatique en millisecondes
        // Type : Number (délai entre sauvegardes)
        // Unité : millisecondes (ms)
        // Domaine : 5000 ≤ autoSaveInterval ≤ 300000
        // Formule : Équilibre entre sécurité données et performance
        // Exemple : 30000ms → sauvegarde toutes les 30 secondes
        const autoSaveInterval = 30000; // 30 secondes

        // Configuration du timer de sauvegarde automatique
        setInterval(() => {
            if (this.isInitialized && this.hasUnsavedChanges()) {
                this.persistCurrentState('Sauvegarde automatique');
            }
        }, autoSaveInterval);

        console.log(`⏱️ Sauvegarde automatique configurée (${autoSaveInterval}ms)`);
    }

    /**
     * Synchronise une présentation complète
     * 
     * @param {Object} presentation - Présentation à synchroniser
     * @param {string} source - Source de la synchronisation (optionnel)
     */
    syncPresentation(presentation, source = 'editor') {
        if (!this.isInitialized) {
            console.warn('⚠️ SyncManager non initialisé, synchronisation reportée');
            return;
        }

        // Rôle : Sérialisation de l'état pour comparaison et diffusion
        // Type : String (JSON sérialisé)
        // Unité : Sans unité
        // Domaine : JSON valide représentant la présentation
        // Formule : JSON.stringify(presentation) → string pour diffusion
        // Exemple : '{"id":"pres-123","sections":[...],"styles":{...}}'
        const presentationJson = JSON.stringify(presentation);

        // Vérification si changement réel (éviter sync inutiles)
        if (presentationJson === this.lastSyncedState) {
            return; // Aucun changement, pas de sync nécessaire
        }

        // Rôle : Message de synchronisation structuré
        // Type : Object (message standardisé)
        // Unité : Sans unité
        // Domaine : Object avec propriétés requises pour sync
        // Formule : Structure standard de message de synchronisation
        // Exemple : {type: 'SYNC_PRESENTATION', data: {...}, meta: {...}}
        const syncMessage = {
            type: 'SYNC_PRESENTATION',
            data: presentation,
            metadata: {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                source: source,
                version: presentation.metadata?.version || '1.0.0'
            }
        };

        // Diffusion avec debounce pour éviter spam
        this.debouncedBroadcast('presentation-data', syncMessage);

        // Mise à jour du cache
        this.lastSyncedState = presentationJson;

        console.log(`🔄 Présentation synchronisée: ${presentation.titre} (source: ${source})`);
    }

    /**
     * Synchronise uniquement les styles CSS
     * 
     * @param {Object} styles - Styles à synchroniser
     * @param {string} target - Cible de synchronisation (optionnel)
     */
    syncStyles(styles, target = 'viewer') {
        if (!this.isInitialized) return;

        const styleMessage = {
            type: 'SYNC_STYLES',
            data: styles,
            metadata: {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                target: target
            }
        };

        this.broadcast('presentation-styles', styleMessage);
        console.log('🎨 Styles synchronisés');
    }

    /**
     * Synchronise une action spécifique (add, remove, move)
     * 
     * @param {string} action - Type d'action
     * @param {Object} payload - Données de l'action
     */
    syncAction(action, payload) {
        if (!this.isInitialized) return;

        const actionMessage = {
            type: 'SYNC_ACTION',
            action: action,
            data: payload,
            metadata: {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            }
        };

        this.broadcast('presentation-actions', actionMessage);
        console.log(`⚡ Action synchronisée: ${action}`);
    }

    /**
     * Diffuse un message sur un canal avec debounce
     * 
     * @param {string} channelName - Nom du canal
     * @param {Object} message - Message à diffuser
     */
    debouncedBroadcast(channelName, message) {
        // Annulation du timer précédent
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Rôle : Timer de debounce pour limiter fréquence de diffusion
        // Type : Number (ID setTimeout)
        // Unité : millisecondes (délai)
        // Domaine : ID timer > 0
        // Formule : setTimeout(() => action, délai) → timer avec délai
        // Exemple : Delay 200ms → max 5 diffusions par seconde
        this.debounceTimer = setTimeout(() => {
            this.broadcast(channelName, message);
            this.debounceTimer = null;
        }, this.debounceDelay);
    }

    /**
     * Diffuse immédiatement un message sur un canal
     * 
     * @param {string} channelName - Nom du canal
     * @param {Object} message - Message à diffuser
     */
    broadcast(channelName, message) {
        const channel = this.channels.get(channelName);
        if (channel) {
            try {
                channel.postMessage(message);
            } catch (error) {
                console.warn(`⚠️ Erreur diffusion canal '${channelName}':`, error);
            }
        } else {
            console.warn(`⚠️ Canal '${channelName}' non trouvé`);
        }
    }

    /**
     * Gère la réception d'un message sur un canal
     * 
     * @param {string} channelName - Nom du canal
     * @param {MessageEvent} event - Événement message reçu
     */
    handleChannelMessage(channelName, event) {
        const message = event.data;

        // Ignorer ses propres messages
        if (message.metadata && message.metadata.sessionId === this.sessionId) {
            return;
        }

        console.log(`📨 Message reçu sur '${channelName}':`, message.type);

        // Rôle : Dispatch du message selon son type vers le handler approprié
        // Type : Switch/case (routage de messages)
        // Unité : Sans unité
        // Domaine : Types de messages définis dans l'application
        // Formule : message.type → handler correspondant
        // Exemple : 'SYNC_PRESENTATION' → handlePresentationSync()
        switch (message.type) {
            case 'SYNC_PRESENTATION':
                this.handlePresentationSync(message);
                break;
            case 'SYNC_STYLES':
                this.handleStylesSync(message);
                break;
            case 'SYNC_ACTION':
                this.handleActionSync(message);
                break;
            default:
                console.warn(`❓ Type de message inconnu: ${message.type}`);
        }
    }

    /**
     * Gère la synchronisation d'une présentation reçue
     * 
     * @param {Object} message - Message de synchronisation
     */
    handlePresentationSync(message) {
        try {
            // Émission d'événement personnalisé pour notifier l'application
            const customEvent = new CustomEvent('presentationSyncReceived', {
                detail: {
                    presentation: message.data,
                    source: message.metadata.source,
                    timestamp: message.metadata.timestamp
                }
            });

            window.dispatchEvent(customEvent);
            
            // Sauvegarde dans localStorage pour persistance
            if (message.data.id) {
                localStorage.setItem(
                    `presentation-${message.data.id}-synced`, 
                    JSON.stringify(message.data)
                );
            }

            console.log('✅ Présentation synchronisée reçue et traitée');
        } catch (error) {
            console.error('❌ Erreur traitement sync présentation:', error);
        }
    }

    /**
     * Gère la synchronisation des styles reçus
     * 
     * @param {Object} message - Message de styles
     */
    handleStylesSync(message) {
        try {
            // Application directe des styles CSS
            this.applyStylesDirectly(message.data);

            // Émission d'événement pour notification
            const customEvent = new CustomEvent('stylesSyncReceived', {
                detail: {
                    styles: message.data,
                    timestamp: message.metadata.timestamp
                }
            });

            window.dispatchEvent(customEvent);

            console.log('🎨 Styles synchronisés appliqués');
        } catch (error) {
            console.error('❌ Erreur application styles sync:', error);
        }
    }

    /**
     * Gère la synchronisation d'une action reçue
     * 
     * @param {Object} message - Message d'action
     */
    handleActionSync(message) {
        try {
            // Émission d'événement pour que l'application traite l'action
            const customEvent = new CustomEvent('actionSyncReceived', {
                detail: {
                    action: message.action,
                    data: message.data,
                    timestamp: message.metadata.timestamp
                }
            });

            window.dispatchEvent(customEvent);

            console.log(`⚡ Action synchronisée reçue: ${message.action}`);
        } catch (error) {
            console.error('❌ Erreur traitement action sync:', error);
        }
    }

    /**
     * Applique des styles CSS directement au document
     * 
     * @param {Object} styles - Styles à appliquer
     */
    applyStylesDirectly(styles) {
        // Rôle : Élément style dynamique pour les styles synchronisés
        // Type : HTMLStyleElement ou null
        // Unité : Sans unité
        // Domaine : Element DOM valide ou null
        // Formule : document.getElementById('sync-styles') → élément existant
        // Exemple : <style id="sync-styles">...</style>
        let styleElement = document.getElementById('sync-styles');

        if (!styleElement) {
            // Création de l'élément style s'il n'existe pas
            styleElement = document.createElement('style');
            styleElement.id = 'sync-styles';
            document.head.appendChild(styleElement);
        }

        // Rôle : Génération du CSS à partir des styles objet
        // Type : String (CSS valide)
        // Unité : Sans unité
        // Domaine : CSS syntaxiquement correct
        // Formule : Conversion objet → CSS text
        // Exemple : {color: 'red'} → '.class { color: red; }'
        let cssText = '';

        if (typeof styles === 'string') {
            // CSS déjà formaté
            cssText = styles;
        } else if (typeof styles === 'object') {
            // Conversion objet vers CSS
            cssText = this.convertObjectToCSS(styles);
        }

        // Application du CSS
        styleElement.textContent = cssText;
    }

    /**
     * Convertit un objet styles en CSS text
     * 
     * @param {Object} styles - Objet styles
     * @returns {string} CSS formaté
     */
    convertObjectToCSS(styles) {
        let css = '';

        for (const [selector, properties] of Object.entries(styles)) {
            css += `${selector} {\n`;
            
            if (typeof properties === 'object') {
                for (const [property, value] of Object.entries(properties)) {
                    css += `  ${property}: ${value};\n`;
                }
            }
            
            css += '}\n\n';
        }

        return css;
    }

    /**
     * Vérifie s'il y a des changements non sauvegardés
     * 
     * @returns {boolean} true s'il y a des changements non sauvegardés
     */
    hasUnsavedChanges() {
        // Pour l'instant, logique simple basée sur localStorage
        const currentId = localStorage.getItem('current-presentation-id');
        if (!currentId) return false;

        const lastSaved = localStorage.getItem(`presentation-${currentId}-lastsaved`);
        const current = localStorage.getItem(`presentation-${currentId}`);
        
        return lastSaved !== current;
    }

    /**
     * Persiste l'état actuel avec description
     * 
     * @param {string} description - Description de la sauvegarde
     */
    persistCurrentState(description = 'Sauvegarde manuelle') {
        const currentId = localStorage.getItem('current-presentation-id');
        if (!currentId) return;

        const currentData = localStorage.getItem(`presentation-${currentId}`);
        if (currentData) {
            // Sauvegarde avec timestamp
            const timestamp = Date.now();
            localStorage.setItem(`presentation-${currentId}-lastsaved`, currentData);
            localStorage.setItem(`presentation-${currentId}-backup-${timestamp}`, currentData);
            
            console.log(`💾 État persisté: ${description}`);
        }
    }

    /**
     * Force la synchronisation de l'état actuel
     */
    forceSyncCurrentState() {
        const currentId = localStorage.getItem('current-presentation-id');
        if (!currentId) return;

        const currentData = localStorage.getItem(`presentation-${currentId}`);
        if (currentData) {
            try {
                const presentation = JSON.parse(currentData);
                this.syncPresentation(presentation, 'force-sync');
            } catch (error) {
                console.error('❌ Erreur force sync:', error);
            }
        }
    }

    /**
     * Gère les changements de localStorage
     * 
     * @param {StorageEvent} event - Événement storage
     */
    handleStorageChange(event) {
        if (!event.newValue) return;

        try {
            // Traitement selon le type de clé modifiée
            if (event.key.includes('presentation-')) {
                const data = JSON.parse(event.newValue);
                
                // Émission d'événement pour notifier l'application
                const customEvent = new CustomEvent('externalPresentationChange', {
                    detail: {
                        key: event.key,
                        data: data,
                        source: 'external-tab'
                    }
                });

                window.dispatchEvent(customEvent);
            }
        } catch (error) {
            console.warn('⚠️ Erreur traitement changement localStorage:', error);
        }
    }

    /**
     * Gère les changements de présentation internes
     * 
     * @param {CustomEvent} event - Événement de changement
     */
    handlePresentationChange(event) {
        if (event.detail && event.detail.presentation) {
            this.syncPresentation(event.detail.presentation, 'internal-change');
        }
    }

    /**
     * Vérifie si le gestionnaire de synchronisation est connecté
     * 
     * Rôle : Vérification de l'état de la synchronisation
     * Type : Méthode de vérification d'état
     * Retour : boolean - True si connecté et opérationnel
     */
    isConnected() {
        return this.isInitialized && this.channels.size > 0;
    }

    /**
     * Nettoie et ferme toutes les connexions
     */
    cleanup() {
        console.log('🧹 Nettoyage SyncManager...');

        // Fermeture des canaux
        for (const [name, channel] of this.channels) {
            try {
                channel.close();
                console.log(`📡 Canal '${name}' fermé`);
            } catch (error) {
                console.warn(`⚠️ Erreur fermeture canal '${name}':`, error);
            }
        }

        // Nettoyage du timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // Reset des propriétés
        this.channels.clear();
        this.lastSyncedState = null;
        this.isInitialized = false;

        console.log('✅ SyncManager nettoyé');
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.SyncManager = SyncManager;