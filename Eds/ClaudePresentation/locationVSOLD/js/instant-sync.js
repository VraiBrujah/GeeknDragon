/**
 * Synchronisation Instantanée Li-CUBE PRO™
 * Système de synchronisation automatique temps réel sans boutons de sauvegarde
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class InstantSync {
    constructor(pageType) {
        // Configuration : type de page et clés de stockage
        this.pageType = pageType; // 'vente' ou 'location'
        this.storageKey = `licubepro-${pageType}-live`;
        this.lastSyncKey = `licubepro-${pageType}-lastsync`;
        
        // État : suivi des modifications et synchronisation
        this.syncCounter = 0;
        this.isInitialized = false;
        this.fieldValues = new Map(); // Cache des valeurs actuelles
        this.pendingSync = false;
        
        // Configuration : délais et options
        this.syncDelay = 50; // Délai ultra-court pour sync instantanée
        this.maxRetries = 3;
        this.retryCount = 0;
        
        // URLs : pages de destination selon le type
        this.targetUrls = {
            'vente': 'vente.html',
            'location': 'location.html'
        };
        
        this.init();
    }

    /**
     * Initialisation : mise en place du système de synchronisation
     */
    init() {
        console.log(`🔄 Synchronisation INSTANTANÉE ${this.pageType.toUpperCase()} - Initialisation`);
        
        this.setupInstantListeners();
        this.initializeFieldCache();
        this.startHealthMonitoring();
        this.updateSyncUI();
        
        // Vérification initiale : détection des différences au chargement
        this.performInitialSync();
        
        this.isInitialized = true;
        console.log(`✅ Synchronisation INSTANTANÉE ${this.pageType.toUpperCase()} - Active`);
    }

    /**
     * Configuration : écouteurs ultra-réactifs sur tous les champs éditables
     */
    setupInstantListeners() {
        // Sélection : tous les éléments avec data-field
        const editableFields = document.querySelectorAll('[data-field]');
        
        console.log(`📡 Configuration de ${editableFields.length} champs pour sync instantanée`);
        
        editableFields.forEach(field => {
            const fieldName = field.dataset.field;
            
            // Écouteurs multiples : capture immédiate de tout changement
            const events = ['input', 'change', 'blur', 'paste', 'keyup', 'keydown'];
            
            events.forEach(eventType => {
                field.addEventListener(eventType, (event) => {
                    // Filtrage : éviter les événements non-modifiants
                    if (eventType === 'keydown' && !this.isModifyingKey(event)) {
                        return;
                    }
                    
                    // Synchronisation immédiate avec anti-rebond minimal
                    this.scheduleInstantSync(fieldName, field);
                });
            });

            // Écouteur spécial : contentEditable
            if (field.contentEditable === 'true') {
                field.addEventListener('DOMCharacterDataModified', () => {
                    this.scheduleInstantSync(fieldName, field);
                });
            }

            // Observer : mutations DOM pour détecter les changements programmatiques
            const observer = new MutationObserver(() => {
                this.scheduleInstantSync(fieldName, field);
            });
            
            observer.observe(field, {
                childList: true,
                subtree: true,
                characterData: true
            });
        });
    }

    /**
     * Planification : synchronisation avec anti-rebond ultra-court
     * @param {string} fieldName - Nom du champ modifié
     * @param {HTMLElement} field - Élément DOM modifié
     */
    scheduleInstantSync(fieldName, field) {
        if (!this.isInitialized) return;
        
        // Extraction : valeur actuelle
        const currentValue = this.extractFieldValue(field);
        const previousValue = this.fieldValues.get(fieldName);
        
        // Vérification : changement réel
        if (currentValue === previousValue) return;
        
        // Mise à jour : cache local
        this.fieldValues.set(fieldName, currentValue);
        
        // Anti-rebond : planification de la synchronisation
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.executeInstantSync(fieldName, currentValue, field);
        }, this.syncDelay);
    }

    /**
     * Exécution : synchronisation immédiate d'un champ ou complète (pour prévisualisation)
     * @param {string|boolean} fieldNameOrForceFullSync - Nom du champ OU true pour sync complète
     * @param {string} value - Nouvelle valeur (optionnel si sync complète)
     * @param {HTMLElement} field - Élément source (optionnel si sync complète)
     */
    async executeInstantSync(fieldNameOrForceFullSync, value, field) {
        if (this.pendingSync) return;
        
        this.pendingSync = true;
        this.updateSyncUI('syncing');
        
        try {
            // Mode : synchronisation complète manuelle (pour prévisualisation)
            if (fieldNameOrForceFullSync === true) {
                console.log('🔄 Synchronisation manuelle COMPLÈTE déclenchée...');
                await this.executeFullSync();
                return;
            }
            
            // Mode : synchronisation d'un champ spécifique (automatique)
            const fieldName = fieldNameOrForceFullSync;
            
            // Chargement : contenu actuel
            const content = this.loadContent();
            
            // Mise à jour : nouvelle valeur
            content[fieldName] = value;
            content.lastModified = Date.now();
            content.modifiedField = fieldName;
            
            // Sauvegarde : persistance immédiate
            this.saveContent(content);
            
            // Notification : pages de présentation
            await this.notifyPresentationPage(fieldName, value, content);
            
            // Compteur : suivi des modifications
            this.syncCounter++;
            this.updateSyncUI('synced');
            
            // Animation : feedback visuel sur le champ modifié
            this.highlightSyncedField(field);
            
            console.log(`⚡ Sync INSTANTANÉE: ${fieldName} = "${value}"`);
            
        } catch (error) {
            console.error(`❌ Erreur sync instantanée:`, error);
            this.handleSyncError(fieldNameOrForceFullSync, value);
        } finally {
            this.pendingSync = false;
        }
    }

    /**
     * Exécution : synchronisation complète manuelle (pour prévisualisation)
     * Collecte tous les champs et force une synchronisation totale
     */
    async executeFullSync() {
        console.log('📋 Synchronisation complète manuelle en cours...');
        
        // Collection : tous les champs éditables
        const allFields = document.querySelectorAll('[data-field]');
        const content = {};
        let fieldsCount = 0;
        
        // Extraction : valeur de chaque champ
        allFields.forEach(field => {
            const fieldName = field.dataset.field;
            const fieldValue = this.extractFieldValue(field);
            
            if (fieldName && fieldValue !== undefined) {
                content[fieldName] = fieldValue;
                this.fieldValues.set(fieldName, fieldValue);
                fieldsCount++;
            }
        });
        
        // Métadonnées : informations de synchronisation
        content.lastModified = Date.now();
        content.modifiedField = null; // Sync complète, pas un champ spécifique
        
        // Sauvegarde : contenu complet
        this.saveContent(content);
        
        // Notification : synchronisation complète aux pages de présentation
        await this.notifyPresentationPageFullSync(content);
        
        // Mise à jour : interface utilisateur
        this.syncCounter += fieldsCount;
        this.updateSyncUI('synced');
        
        console.log(`✅ Synchronisation complète terminée: ${fieldsCount} champs synchronisés`);
    }

    /**
     * Notification : synchronisation complète aux pages de présentation
     * @param {Object} fullContent - Contenu complet à synchroniser
     */
    async notifyPresentationPageFullSync(fullContent) {
        // Message : synchronisation complète
        const syncMessage = {
            type: 'full-sync',
            pageType: this.pageType,
            fieldName: null, // Sync complète
            fieldValue: null, // Sync complète
            fullContent: fullContent,
            timestamp: Date.now(),
            source: 'editor-manual-preview'
        };
        
        // Communication : même système que sync partielle
        const tempKey = `licubepro-instant-${this.pageType}-full-${Date.now()}-${Math.random()}`;
        localStorage.setItem(tempKey, JSON.stringify(syncMessage));
        
        // Nettoyage : suppression après utilisation
        setTimeout(() => {
            localStorage.removeItem(tempKey);
        }, 1000); // Délai plus long pour sync complète
        
        // Broadcast : événement global
        window.dispatchEvent(new CustomEvent('licubepro-instant-sync', {
            detail: syncMessage
        }));
        
        console.log('📡 Notification synchronisation complète envoyée');
    }

    /**
     * Notification : communication temps réel avec les pages de présentation
     * @param {string} fieldName - Champ modifié
     * @param {string} value - Nouvelle valeur
     * @param {Object} fullContent - Contenu complet
     */
    async notifyPresentationPage(fieldName, value, fullContent) {
        // Message : données de synchronisation
        const syncMessage = {
            type: 'instant-sync',
            pageType: this.pageType,
            fieldName: fieldName,
            fieldValue: value,
            fullContent: fullContent,
            timestamp: Date.now(),
            source: 'editor-instant'
        };
        
        // Communication inter-onglets : via localStorage temporaire
        const tempKey = `licubepro-instant-${this.pageType}-${Date.now()}-${Math.random()}`;
        localStorage.setItem(tempKey, JSON.stringify(syncMessage));
        
        // Nettoyage : suppression du message temporaire
        setTimeout(() => {
            localStorage.removeItem(tempKey);
        }, 500);
        
        // Broadcast : événement personnalisé pour scripts internes
        window.dispatchEvent(new CustomEvent('licubepro-instant-sync', {
            detail: syncMessage
        }));
        
        // Communication : avec les iframes si présentes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(syncMessage, '*');
                }
            } catch (e) {
                // Ignore les erreurs de cross-origin
            }
        });
    }

    /**
     * Initialisation : cache des valeurs initiales de tous les champs
     */
    initializeFieldCache() {
        const fields = document.querySelectorAll('[data-field]');
        
        fields.forEach(field => {
            const fieldName = field.dataset.field;
            const value = this.extractFieldValue(field);
            this.fieldValues.set(fieldName, value);
        });
        
        console.log(`📋 Cache initialisé: ${this.fieldValues.size} champs`);
    }

    /**
     * Synchronisation initiale : détection et correction des différences au chargement
     */
    async performInitialSync() {
        const savedContent = this.loadContent();
        const fields = document.querySelectorAll('[data-field]');
        let differencesFound = 0;
        
        console.log(`🔍 Vérification initiale des différences ${this.pageType}...`);
        
        fields.forEach(field => {
            const fieldName = field.dataset.field;
            const currentValue = this.extractFieldValue(field);
            const savedValue = savedContent[fieldName];
            
            // Détection : différence entre éditeur et sauvegarde
            if (savedValue !== undefined && currentValue !== savedValue) {
                console.log(`🔄 Différence détectée: ${fieldName}`);
                console.log(`   Éditeur: "${currentValue}"`);
                console.log(`   Sauvé: "${savedValue}"`);
                
                // Application : valeur sauvegardée à l'éditeur
                this.applyValueToField(field, savedValue);
                this.fieldValues.set(fieldName, savedValue);
                differencesFound++;
            }
        });
        
        if (differencesFound > 0) {
            console.log(`✅ ${differencesFound} différences corrigées automatiquement`);
            this.updateSyncUI('initial-sync');
        }
    }

    /**
     * Application : valeur à un champ spécifique
     * @param {HTMLElement} field - Champ cible
     * @param {string} value - Valeur à appliquer
     */
    applyValueToField(field, value) {
        const tagName = field.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            field.value = value;
        } else if (field.contentEditable === 'true') {
            field.innerHTML = value;
        } else {
            field.textContent = value;
        }
        
        // Déclenchement : événements pour les autres scripts
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /**
     * Extraction : valeur actuelle d'un champ
     * @param {HTMLElement} field - Champ source
     * @return {string} - Valeur extraite
     */
    extractFieldValue(field) {
        const tagName = field.tagName.toLowerCase();

        if (field.classList.contains('section-spacer') || field.classList.contains('header-spacer')) {
            return parseInt(field.style.height) || '';
        }

        if (tagName === 'input' || tagName === 'textarea') {
            return field.value || '';
        }
        if (field.contentEditable === 'true') {
            return field.innerHTML || '';
        }
        return field.textContent || field.innerText || '';
    }

    /**
     * Vérification : touche modifiante pour filtrer les événements keydown
     * @param {KeyboardEvent} event - Événement clavier
     * @return {boolean} - True si la touche modifie le contenu
     */
    isModifyingKey(event) {
        const modifyingKeys = [
            'Backspace', 'Delete', 'Enter', 'Tab',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', 'PageUp', 'PageDown'
        ];
        
        // Touches de caractères : lettres, chiffres, symboles
        if (event.key.length === 1) return true;
        
        // Touches spéciales modifiantes
        if (modifyingKeys.includes(event.key)) return true;
        
        // Raccourcis : Ctrl+V, Ctrl+X, Ctrl+Z, etc.
        if (event.ctrlKey || event.metaKey) return true;
        
        return false;
    }

    /**
     * Mise à jour : interface utilisateur de synchronisation
     * @param {string} status - État actuel ('syncing', 'synced', 'error', etc.)
     */
    updateSyncUI(status = 'active') {
        const statusIcon = document.getElementById('syncStatusIcon');
        const statusText = document.getElementById('syncStatusText');
        const syncCounter = document.getElementById('syncCounter');
        const liveIndicator = document.querySelector('.live-indicator');
        
        if (!statusIcon || !statusText) return;
        
        // Mise à jour : icône et couleur selon l'état
        switch (status) {
            case 'syncing':
                statusIcon.className = 'fas fa-sync-alt fa-spin status-icon';
                statusIcon.style.color = '#F59E0B';
                statusText.textContent = `Synchronisation ${this.pageType.toUpperCase()} en cours...`;
                break;
                
            case 'synced':
                statusIcon.className = 'fas fa-check-circle status-icon';
                statusIcon.style.color = '#10B981';
                statusText.textContent = `Synchronisation ${this.pageType.toUpperCase()} - Modification appliquée`;
                
                // Animation : indicateur live
                if (liveIndicator) {
                    liveIndicator.style.animation = 'pulse 0.5s ease-in-out';
                    setTimeout(() => {
                        liveIndicator.style.animation = '';
                    }, 500);
                }
                break;
                
            case 'initial-sync':
                statusIcon.className = 'fas fa-refresh status-icon';
                statusIcon.style.color = '#3B82F6';
                statusText.textContent = `Synchronisation ${this.pageType.toUpperCase()} - Différences corrigées`;
                break;
                
            case 'error':
                statusIcon.className = 'fas fa-exclamation-triangle status-icon';
                statusIcon.style.color = '#EF4444';
                statusText.textContent = `Synchronisation ${this.pageType.toUpperCase()} - Erreur détectée`;
                break;
                
            default:
                statusIcon.className = 'fas fa-sync status-icon';
                statusIcon.style.color = '#10B981';
                statusText.textContent = `Synchronisation ${this.pageType.toUpperCase()} automatique activée`;
        }
        
        // Compteur : nombre de modifications synchronisées
        if (syncCounter) {
            syncCounter.textContent = `${this.syncCounter} modifications synchronisées`;
        }
    }

    /**
     * Animation : surbrillance d'un champ synchronisé
     * @param {HTMLElement} field - Champ à animer
     */
    highlightSyncedField(field) {
        // Animation : effet de surbrillance verte
        const originalBorder = field.style.border;
        const originalBackground = field.style.background;
        
        field.style.border = '2px solid #10B981';
        field.style.background = 'rgba(16, 185, 129, 0.1)';
        field.style.transition = 'all 0.3s ease';
        
        // Restauration : état normal après animation
        setTimeout(() => {
            field.style.border = originalBorder;
            field.style.background = originalBackground;
        }, 600);
    }

    /**
     * Surveillance : contrôle de santé du système
     */
    startHealthMonitoring() {
        // Vérification : toutes les 10 secondes
        setInterval(() => {
            this.checkSyncHealth();
        }, 10000);
        
        // Écoute : événements de visibilité pour sync au focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.performInitialSync();
            }
        });
        
        // Écoute : retour de focus sur la fenêtre
        window.addEventListener('focus', () => {
            setTimeout(() => {
                this.performInitialSync();
            }, 100);
        });
    }

    /**
     * Vérification : santé du système de synchronisation
     */
    checkSyncHealth() {
        const now = Date.now();
        const lastSync = localStorage.getItem(this.lastSyncKey);
        
        // Diagnostic : temps depuis dernière sync
        if (lastSync) {
            const timeSinceSync = now - parseInt(lastSync);
            if (timeSinceSync > 300000) { // 5 minutes
                console.warn(`⚠️ Aucune sync depuis ${Math.round(timeSinceSync / 60000)} minutes`);
                this.updateSyncUI('warning');
            }
        }
        
        // Test : intégrité du stockage
        try {
            const testData = { test: now };
            localStorage.setItem('licubepro-test', JSON.stringify(testData));
            localStorage.removeItem('licubepro-test');
        } catch (error) {
            console.error('❌ Problème de stockage détecté:', error);
            this.updateSyncUI('error');
        }
    }

    /**
     * Gestion d'erreur : tentatives de récupération
     * @param {string} fieldName - Champ en erreur
     * @param {string} value - Valeur à synchroniser
     */
    handleSyncError(fieldName, value) {
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
            console.log(`🔄 Tentative de récupération ${this.retryCount}/${this.maxRetries}`);
            
            // Nouvelle tentative après délai progressif
            setTimeout(() => {
                const field = document.querySelector(`[data-field="${fieldName}"]`);
                if (field) {
                    this.executeInstantSync(fieldName, value, field);
                }
            }, this.retryCount * 1000);
        } else {
            console.error(`❌ Échec définitif de synchronisation: ${fieldName}`);
            this.updateSyncUI('error');
            this.retryCount = 0;
        }
    }

    /**
     * Chargement : contenu depuis localStorage
     * @return {Object} - Contenu sauvegardé
     */
    loadContent() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Erreur chargement:', error);
            return {};
        }
    }

    /**
     * Sauvegarde : contenu vers localStorage
     * @param {Object} content - Contenu à sauvegarder
     */
    saveContent(content) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(content));
            localStorage.setItem(this.lastSyncKey, Date.now().toString());
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            throw error;
        }
    }

    /**
     * Exportation : crée un fichier JSON téléchargeable contenant les données enregistrées
     */
    exportContent() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const blob = new Blob([data ?? '{}'], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.storageKey}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur exportation:', error);
        }
    }

    /**
     * Importation : charge un fichier JSON, met à jour localStorage puis applique les valeurs
     * @param {File} file - Fichier JSON contenant les données sauvegardées
     */
    importContent(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = JSON.parse(e.target.result);
                localStorage.setItem(this.storageKey, JSON.stringify(content));

                const fields = document.querySelectorAll('[data-field]');
                fields.forEach(field => {
                    const name = field.dataset.field;
                    if (content[name] !== undefined) {
                        this.applyValueToField(field, content[name]);
                        this.fieldValues.set(name, content[name]);
                    }
                });

                await this.executeFullSync();
            } catch (error) {
                console.error('Erreur importation:', error);
            }
        };
        reader.readAsText(file);
    }

    /**
     * Statistiques : informations sur la synchronisation
     * @return {Object} - Statistiques détaillées
     */
    getStats() {
        return {
            pageType: this.pageType,
            syncCounter: this.syncCounter,
            fieldsTracked: this.fieldValues.size,
            isActive: this.isInitialized,
            lastSync: localStorage.getItem(this.lastSyncKey),
            pendingSync: this.pendingSync
        };
    }
}

// Auto-détection : type de page et initialisation
function initInstantSync() {
    const pageUrl = window.location.pathname.toLowerCase();
    let pageType = 'vente'; // Défaut

    if (pageUrl.includes('locationvsold')) {
        pageType = 'locationVSOLD';
    } else if (pageUrl.includes('locationvs')) {
        pageType = 'locationVS'; // ✅ CORRECTION : namespace spécifique pour locationVS
    } else if (pageUrl.includes('location')) {
        pageType = 'location';
    } else if (pageUrl.includes('vente')) {
        pageType = 'vente';
    }

    // Instance globale
    window.instantSync = new InstantSync(pageType);
    
    // Debug : exposition des stats dans la console
    window.getSyncStats = () => window.instantSync.getStats();
    
    return window.instantSync;
}

// Auto-initialisation : démarrage automatique
document.addEventListener('DOMContentLoaded', initInstantSync);

// CSS : animations pour les indicateurs
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    .live-indicator {
        font-weight: bold;
        color: #EF4444;
        font-size: 0.8rem;
    }
    
    .sync-counter {
        font-size: 0.8rem;
        color: #10B981;
        font-weight: 600;
    }
    
    .sync-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .sync-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.85rem;
    }
`;
document.head.appendChild(dynamicStyles);
