/**
 * Synchronisation Instantanée Li-CUBE PRO™
 * Système de synchronisation automatique temps réel sans boutons de sauvegarde
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

// Rôle : Détection simple et directe du type de page
// Type : Function - Détection basée sur l'URL de la page actuelle
// Stratégie : Analyse directe du pathname pour identifier le type
function detectPageType() {
    const url = window.location.pathname.toLowerCase();
    if (url.includes('locationvsold')) return 'locationVSOLD';
    if (url.includes('locationvs')) return 'locationVS';
    if (url.includes('location')) return 'location';
    if (url.includes('vente')) return 'vente';
    return 'location'; // Par défaut
}

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
        // Suppression : anciens listeners pour éviter les doublons
        if (this.inputListener) {
            document.removeEventListener('input', this.inputListener);
        }
        if (this.changeListener) {
            document.removeEventListener('change', this.changeListener);
        }
        
        // Délégation d'événements : capture TOUS les éléments avec data-field (même futurs)
        this.inputListener = (event) => {
            const field = event.target;
            if (field.dataset.field) {
                const fieldName = field.dataset.field;
                console.log(`📝 Event INPUT détecté sur: ${fieldName}`);
                this.scheduleInstantSync(fieldName, field);
            }
        };
        
        this.changeListener = (event) => {
            const field = event.target;
            if (field.dataset.field) {
                const fieldName = field.dataset.field;
                console.log(`🎨 Event CHANGE détecté sur: ${fieldName}`);
                this.scheduleInstantSync(fieldName, field);
            }
        };
        
        // Ajout : listeners déléguées sur le document entier
        document.addEventListener('input', this.inputListener, true);
        document.addEventListener('change', this.changeListener, true);
        
        const editableFields = document.querySelectorAll('[data-field]');
        console.log(`📡 Délégation configurée pour ${editableFields.length} champs existants + futurs éléments`);
        
        // Initialisation : système de throttling pour sauvegarde auto
        this.lastAutoSave = 0;
        this.autoSaveDelay = 5000; // 5 secondes minimum entre sauvegardes auto
        
        // Observer global : détecte les changements programmatiques sur tous les champs
        if (this.globalObserver) {
            this.globalObserver.disconnect();
        }
        
        this.globalObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.target.dataset && mutation.target.dataset.field) {
                    const field = mutation.target;
                    const fieldName = field.dataset.field;
                    
                    if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                        this.scheduleInstantSync(fieldName, field);
                        break;
                    }
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        this.scheduleInstantSync(fieldName, field);
                        break;
                    }
                }
            }
        });
        
        // Observer : tout le document pour capturer les changements sur tous les champs
        this.globalObserver.observe(document.body, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
            attributeFilter: ['value']
        });
    }

    /**
     * Détermine si une sauvegarde automatique des pages HTML doit être effectuée
     * @param {string} fieldName - Nom du champ modifié
     * @return {boolean} - True si la sauvegarde doit être effectuée
     */
    shouldAutoSave(fieldName) {
        const now = Date.now();
        
        // Throttling : éviter trop de sauvegardes rapprochées
        if (now - this.lastAutoSave < this.autoSaveDelay) {
            return false;
        }
        
        // Excluer : champs temporaires ou non-importants
        const excludedFields = ['style-', 'temp-', 'preview-'];
        if (excludedFields.some(prefix => fieldName.startsWith(prefix))) {
            return false;
        }
        
        this.lastAutoSave = now;
        return true;
    }

    /**
     * Planification : synchronisation avec anti-rebond ultra-court
     * @param {string} fieldName - Nom du champ modifié
     * @param {HTMLElement} field - Élément DOM modifié
     */
    scheduleInstantSync(fieldName, field) {
        if (!this.isInitialized) {
            console.warn(`⚠️ InstantSync non initialisé pour: ${fieldName}`);
            return;
        }
        
        console.log(`🔄 scheduleInstantSync appelée pour: ${fieldName}`);
        
        // Extraction : valeur actuelle
        const currentValue = this.extractFieldValue(field);
        const previousValue = this.fieldValues.get(fieldName);
        
        console.log(`📊 Valeurs: ${fieldName} | Actuelle: "${currentValue}" | Précédente: "${previousValue}"`);
        
        // Vérification : changement réel
        if (currentValue === previousValue) {
            console.log(`⏭️ Aucun changement détecté pour: ${fieldName}`);
            return;
        }
        
        console.log(`✅ Changement détecté pour: ${fieldName}, planification sync...`);
        
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
            
            // SAUVEGARDE AUTOMATIQUE des 2 pages HTML après modification de champ
            if (window.saveCompleteHtmlPages && this.shouldAutoSave(fieldName)) {
                setTimeout(() => {
                    window.saveCompleteHtmlPages(`Modification ${fieldName}`);
                }, 1000); // Délai plus long pour éviter trop de sauvegardes
            }
            
            // Compteur : suivi des modifications
            this.syncCounter++;
            this.updateSyncUI('synced');
            
            // Animation : feedback visuel sur le champ modifié
            this.highlightSyncedField(field);
            
            console.log(`⚡ Sync INSTANTANÉE: ${fieldName} = "${value}"`);
            
            // Log spécial pour champs d'images
            if (fieldName.endsWith('-image-path')) {
                console.log(`🖼️ IMAGE SYNCHRONISÉE: ${fieldName} vers page ${this.pageType}`);
            }
            
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
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        localStorage.setItem(tempKey, JSON.stringify(syncMessage));

        // Nettoyage : suppression après utilisation
        setTimeout(() => {
            if (typeof localStorage === 'undefined') {
                console.error('localStorage non disponible');
                return;
            }
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
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        localStorage.setItem(tempKey, JSON.stringify(syncMessage));

        // Nettoyage : suppression du message temporaire
        setTimeout(() => {
            if (typeof localStorage === 'undefined') {
                console.error('localStorage non disponible');
                return;
            }
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
            const value = field.value || '';
            // Log spécial pour les champs de style
            if (field.dataset.field && field.dataset.field.startsWith('style-')) {
                console.log(`🎨 Extraction valeur style: ${field.dataset.field} = "${value}"`);
            }
            // Log spécial pour les champs d'images
            if (field.dataset.field && field.dataset.field.endsWith('-image-path')) {
                console.log(`🖼️ Extraction valeur image: ${field.dataset.field} = "${value}"`);
            }
            return value;
        }
        if (field.contentEditable === 'true') {
            return field.innerHTML || '';
        }
        return field.textContent || field.innerText || '';
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
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            this.updateSyncUI('error');
            return;
        }
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
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return {};
        }
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
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
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
    async exportContent() {
        try {
            await this.executeFullSync();
            if (typeof localStorage === 'undefined') {
                console.error('localStorage non disponible');
                return;
            }
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
                if (typeof localStorage === 'undefined') {
                    console.error('localStorage non disponible');
                    return;
                }
                localStorage.setItem(this.storageKey, JSON.stringify(content));

                const getMaxIndex = (prefix) => {
                    return Object.keys(content).reduce((max, key) => {
                        const match = key.match(new RegExp(`^${prefix}(\\d+)-`));
                        return match ? Math.max(max, parseInt(match[1], 10)) : max;
                    }, 0);
                };

                const maxWeakness = getMaxIndex('weakness');
                const maxStrength = getMaxIndex('strength');

                const countBlocks = (type) => document.querySelectorAll(`[data-field^="${type}"][data-field$="-title"]`).length;
                let currentWeakness = countBlocks('weakness');
                let currentStrength = countBlocks('strength');

                if (typeof window.addWeakness === 'function') {
                    while (currentWeakness < maxWeakness) {
                        window.addWeakness();
                        currentWeakness++;
                    }
                }
                if (typeof window.removeWeakness === 'function') {
                    while (currentWeakness > maxWeakness) {
                        window.removeWeakness();
                        currentWeakness--;
                    }
                }
                if (typeof window.addStrength === 'function') {
                    while (currentStrength < maxStrength) {
                        window.addStrength();
                        currentStrength++;
                    }
                }
                if (typeof window.removeStrength === 'function') {
                    while (currentStrength > maxStrength) {
                        window.removeStrength();
                        currentStrength--;
                    }
                }

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
        let lastSync = null;
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
        } else {
            lastSync = localStorage.getItem(this.lastSyncKey);
        }
        return {
            pageType: this.pageType,
            syncCounter: this.syncCounter,
            fieldsTracked: this.fieldValues.size,
            isActive: this.isInitialized,
            lastSync: lastSync,
            pendingSync: this.pendingSync
        };
    }
}

// Détection du type de page pour un stockage isolé
// Auto-détection : type de page et initialisation
function initInstantSync() {
    // Détection : type de page directe
    const pageType = detectPageType();
    
    console.log(`🔍 Type de page détecté: ${pageType}`);

    try {
        // Instance globale
        window.instantSync = new InstantSync(pageType);

        // Debug : exposition des stats dans la console
        window.getSyncStats = () => window.instantSync.getStats();

        console.log('✅ InstantSync initialisé avec succès');
        console.log(`📊 Configuration: ${pageType}, Champs détectés: ${document.querySelectorAll('[data-field]').length}`);

        return window.instantSync;
        
    } catch (error) {
        console.error('❌ Erreur initialisation InstantSync:', error);
        console.error('Stack trace:', error.stack);
        
        // Création : instance fallback minimaliste
        window.instantSync = {
            isInitialized: false,
            syncCounter: 0,
            error: error.message,
            executeInstantSync: () => console.warn('InstantSync en mode fallback'),
            exportContent: () => console.warn('Export non disponible en mode fallback'),
            importContent: () => console.warn('Import non disponible en mode fallback')
        };
        
        return window.instantSync;
    }
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
