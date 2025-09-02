/**
 * PERSISTENCE.JS - Système de sauvegarde et historique
 * VERSION SCRIPT CLASSIQUE - Fonctionne sans serveur
 * Responsabilité : Persistance état + gestion historique actions
 */

// Namespace global
window.WidgetEditor = window.WidgetEditor || {};

/**
 * Classe Persistence - Gestion sauvegarde et historique
 * Fonctionnalités : Auto-save, historique, export/import
 */
window.WidgetEditor.Persistence = class Persistence {
    /**
     * Constructeur du système de persistance
     * @param {Editor} editor - Instance éditeur parent
     */
    constructor(editor) {
        // Référence éditeur parent
        this.editor = editor;
        
        // Configuration persistance
        this.config = {
            // Clé localStorage base
            storageKey: 'widgetEditor',
            // Intervalle auto-save (ms)
            autoSaveInterval: 30000, // 30 secondes
            // Taille maximale historique
            maxHistorySize: 100,
            // Compression JSON
            useCompression: true,
            // Sauvegarde état interface
            saveUIState: true
        };
        
        // État historique
        this.history = {
            // Stack des actions (états précédents)
            undoStack: [],
            // Stack des actions annulées (pour redo)
            redoStack: [],
            // Index action courante
            currentIndex: -1,
            // Flag pour éviter boucles lors restore
            isRestoring: false
        };
        
        // État sauvegarde
        this.saveState = {
            // Timer auto-save
            autoSaveTimer: null,
            // Dernier hash sauvegardé (détection changements)
            lastSavedHash: '',
            // Timestamp dernière sauvegarde
            lastSaveTime: 0,
            // Flag sauvegarde en cours
            isSaving: false,
            // Statistiques
            saveCount: 0,
            totalSaves: 0
        };
        
        this.debugLog('Persistence créée');
    }
    
    /**
     * Initialisation système persistance
     * Configuration auto-save et chargement état précédent
     */
    async init() {
        try {
            // Démarrage auto-save
            this.startAutoSave();
            
            // Restauration état précédent si existant
            await this.loadPreviousState();
            
            // Configuration événements système
            this.setupSystemEvents();
            
            this.debugLog('Persistence initialisée');
            
        } catch (error) {
            console.error('❌ Erreur initialisation Persistence:', error);
            throw error;
        }
    }
    
    /**
     * Démarrage du système d'auto-save
     * Timer récurrent pour sauvegarde automatique
     */
    startAutoSave() {
        // Clear timer existant
        if (this.saveState.autoSaveTimer) {
            clearInterval(this.saveState.autoSaveTimer);
        }
        
        // Nouveau timer
        this.saveState.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);
        
        this.debugLog(`Auto-save démarré (${this.config.autoSaveInterval}ms)`);
    }
    
    /**
     * Arrêt du système d'auto-save
     */
    stopAutoSave() {
        if (this.saveState.autoSaveTimer) {
            clearInterval(this.saveState.autoSaveTimer);
            this.saveState.autoSaveTimer = null;
        }
        
        this.debugLog('Auto-save arrêté');
    }
    
    /**
     * Configuration événements système
     * Sauvegarde avant fermeture, etc.
     */
    setupSystemEvents() {
        // Sauvegarde avant fermeture page
        window.addEventListener('beforeunload', (e) => {
            this.save();
            // Pas de message de confirmation pour ne pas embêter l'utilisateur
        });
        
        // Sauvegarde lors perte focus (changement onglet)
        window.addEventListener('blur', () => {
            this.save();
        });
        
        // Gestion erreurs localStorage
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.config.storageKey)) {
                this.debugLog('Changement localStorage détecté');
            }
        });
    }
    
    /**
     * Sauvegarde manuelle immédiate
     * Ajout à l'historique + localStorage
     */
    save() {
        if (this.saveState.isSaving || this.history.isRestoring) {
            return; // Éviter boucles
        }
        
        try {
            this.saveState.isSaving = true;
            
            // Capture état actuel complet
            const currentState = this.captureCurrentState();
            
            // Vérification si changement réel
            const stateHash = this.generateStateHash(currentState);
            if (stateHash === this.saveState.lastSavedHash) {
                this.saveState.isSaving = false;
                return; // Pas de changement
            }
            
            // Ajout à l'historique
            this.addToHistory(currentState);
            
            // Sauvegarde localStorage
            this.saveToLocalStorage(currentState);
            
            // Mise à jour état
            this.saveState.lastSavedHash = stateHash;
            this.saveState.lastSaveTime = Date.now();
            this.saveState.saveCount++;
            this.saveState.totalSaves++;
            
            // Notification interface
            this.updateSaveStatus('success');
            
            this.debugLog(`État sauvegardé (#${this.saveState.totalSaves})`);
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.updateSaveStatus('error');
        } finally {
            this.saveState.isSaving = false;
        }
    }
    
    /**
     * Auto-save intelligente
     * Sauvegarde seulement si changements détectés
     */
    autoSave() {
        // Skip si pas de widgets ou éditeur pas prêt
        if (!this.editor.getState().isInitialized || this.editor.getWidgets().size === 0) {
            return;
        }
        
        // Skip si utilisateur en cours d'édition
        if (this.isUserCurrentlyEditing()) {
            this.debugLog('Auto-save reportée (édition en cours)');
            return;
        }
        
        // Sauvegarde normale
        this.save();
    }
    
    /**
     * Détection si utilisateur en cours d'édition
     * Évite auto-save pendant saisie
     * @returns {boolean} - True si édition active
     */
    isUserCurrentlyEditing() {
        // Vérification champ texte actif
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' || 
                             activeElement.contentEditable === 'true')) {
            return true;
        }
        
        // Vérification drag en cours
        if (this.editor.getState().dragDrop?.isDragActive()) {
            return true;
        }
        
        // Vérification édition inline widget
        const widgets = this.editor.getWidgets();
        for (let widget of widgets.values()) {
            if (widget.editingState?.isEditing) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Capture état actuel complet de l'éditeur
     * Sérialisation complète pour sauvegarde
     * @returns {Object} - État complet sérialisable
     */
    captureCurrentState() {
        const state = {
            // Métadonnées sauvegarde
            version: '1.0.0',
            timestamp: Date.now(),
            
            // Informations projet
            project: {
                name: this.editor.getState().projectName,
                id: this.editor.getState().projectId
            },
            
            // Configuration éditeur
            editor: {
                zoom: this.editor.getState().config.currentZoom,
                gridConfig: this.editor.getState().grid?.exportConfig(),
                panelsState: { ...this.editor.getState().panelsState }
            },
            
            // Widgets avec configurations complètes
            widgets: {},
            
            // Ordre des widgets (z-index)
            widgetOrder: [],
            
            // Widget sélectionné
            selectedWidget: this.editor.getSelectedWidget()?.getId() || null
        };
        
        // Sérialisation widgets
        this.editor.getWidgets().forEach((widget, id) => {
            state.widgets[id] = {
                type: widget.getType ? widget.getType() : 'canvas',
                config: widget.exportConfig ? widget.exportConfig() : widget.config,
                position: widget.getPosition ? widget.getPosition() : widget.config.position,
                dimensions: widget.getDimensions ? widget.getDimensions() : { width: 300, height: 200 },
                visible: widget.isVisible ? widget.isVisible() : true,
                locked: widget.isLocked ? widget.isLocked() : false
            };
            
            state.widgetOrder.push(id);
        });
        
        return state;
    }
    
    /**
     * Génération hash unique pour état
     * Détection changements pour optimisation
     * @param {Object} state - État à hasher
     * @returns {string} - Hash MD5-like simple
     */
    generateStateHash(state) {
        const stateString = JSON.stringify(state);
        return this.simpleHash(stateString);
    }
    
    /**
     * Hash simple pour chaînes
     * @param {string} str - Chaîne à hasher
     * @returns {string} - Hash numérique
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Conversion 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }
    
    /**
     * Ajout état à l'historique
     * Gestion pile undo/redo
     * @param {Object} state - État à ajouter
     */
    addToHistory(state) {
        // Vérification taille maximale
        if (this.history.undoStack.length >= this.config.maxHistorySize) {
            this.history.undoStack.shift(); // Supprime le plus ancien
        }
        
        // Ajout nouvel état
        this.history.undoStack.push({
            state: JSON.parse(JSON.stringify(state)), // Deep copy
            timestamp: Date.now(),
            action: this.getLastActionDescription()
        });
        
        // Reset redo stack (nouveau chemin)
        this.history.redoStack = [];
        
        // Mise à jour index
        this.history.currentIndex = this.history.undoStack.length - 1;
        
        // Mise à jour interface
        this.updateHistoryButtons();
    }
    
    /**
     * Description dernière action pour historique
     * @returns {string} - Description action
     */
    getLastActionDescription() {
        const widgets = this.editor.getWidgets();
        
        if (widgets.size === 0) {
            return 'Projet vide';
        }
        
        const selectedWidget = this.editor.getSelectedWidget();
        if (selectedWidget) {
            return `Modification ${selectedWidget.getType()}`;
        }
        
        return `${widgets.size} widget${widgets.size > 1 ? 's' : ''}`;
    }
    
    /**
     * Annulation dernière action (Undo)
     * Restauration état précédent
     */
    undo() {
        if (!this.canUndo()) {
            this.debugLog('Undo impossible');
            return;
        }
        
        try {
            // Sauvegarde état actuel dans redo avant undo
            const currentState = this.captureCurrentState();
            this.history.redoStack.push({
                state: currentState,
                timestamp: Date.now(),
                action: 'État avant undo'
            });
            
            // Récupération état précédent
            this.history.currentIndex--;
            const previousState = this.history.undoStack[this.history.currentIndex];
            
            // Restauration
            await this.restoreState(previousState.state);
            
            this.updateHistoryButtons();
            this.updateSaveStatus('undo');
            
            this.debugLog(`Undo: ${previousState.action}`);
            
        } catch (error) {
            console.error('❌ Erreur undo:', error);
        }
    }
    
    /**
     * Rétablissement action annulée (Redo)
     * Restauration depuis pile redo
     */
    redo() {
        if (!this.canRedo()) {
            this.debugLog('Redo impossible');
            return;
        }
        
        try {
            // Récupération état à rétablir
            const nextState = this.history.redoStack.pop();
            
            // Restauration
            await this.restoreState(nextState.state);
            
            // Mise à jour index
            this.history.currentIndex++;
            
            this.updateHistoryButtons();
            this.updateSaveStatus('redo');
            
            this.debugLog(`Redo: ${nextState.action}`);
            
        } catch (error) {
            console.error('❌ Erreur redo:', error);
        }
    }
    
    /**
     * Vérification possibilité undo
     * @returns {boolean} - True si undo possible
     */
    canUndo() {
        return this.history.currentIndex > 0 && 
               this.history.undoStack.length > 0;
    }
    
    /**
     * Vérification possibilité redo
     * @returns {boolean} - True si redo possible
     */
    canRedo() {
        return this.history.redoStack.length > 0;
    }
    
    /**
     * Restauration état complet
     * Reconstruction éditeur depuis sauvegarde
     * @param {Object} state - État à restaurer
     */
    async restoreState(state) {
        if (!state) {
            throw new Error('État à restaurer invalide');
        }
        
        try {
            // Flag pour éviter boucles
            this.history.isRestoring = true;
            
            // Nettoyage widgets existants
            this.clearAllWidgets();
            
            // Restauration informations projet
            if (state.project) {
                this.editor.getState().projectName = state.project.name || 'Projet restauré';
                const nameInput = document.getElementById('project-name');
                if (nameInput) {
                    nameInput.value = this.editor.getState().projectName;
                }
            }
            
            // Restauration configuration éditeur
            if (state.editor) {
                // Zoom
                if (state.editor.zoom) {
                    this.editor.getState().config.currentZoom = state.editor.zoom;
                    this.editor.updateZoomDisplay();
                }
                
                // Configuration grille
                if (state.editor.gridConfig && this.editor.getState().grid) {
                    this.editor.getState().grid.importConfig(state.editor.gridConfig);
                }
                
                // État panneaux
                if (state.editor.panelsState) {
                    this.editor.getState().panelsState = { ...state.editor.panelsState };
                    this.editor.updatePanelsVisibility();
                }
            }
            
            // Restauration widgets dans l'ordre
            if (state.widgets && state.widgetOrder) {
                for (const widgetId of state.widgetOrder) {
                    const widgetData = state.widgets[widgetId];
                    if (widgetData) {
                        await this.restoreWidget(widgetId, widgetData);
                    }
                }
            }
            
            // Restauration sélection
            if (state.selectedWidget) {
                const widget = this.editor.getWidgets().get(state.selectedWidget);
                if (widget) {
                    this.editor.selectWidget(widget);
                }
            } else {
                this.editor.deselectWidget();
            }
            
            // Mise à jour interface
            this.editor.updateHierarchyPanel();
            this.editor.updateStorageUsage();
            
        } catch (error) {
            console.error('❌ Erreur restauration état:', error);
            throw error;
        } finally {
            // Reset flag
            this.history.isRestoring = false;
        }
    }
    
    /**
     * Suppression tous widgets existants
     * Nettoyage avant restauration
     */
    clearAllWidgets() {
        const widgets = new Map(this.editor.getWidgets());
        
        widgets.forEach(widget => {
            widget.destroy();
        });
        
        this.editor.getWidgets().clear();
        this.editor.getState().selectedWidget = null;
    }
    
    /**
     * Restauration widget individuel
     * @param {string} widgetId - ID widget
     * @param {Object} widgetData - Données widget
     */
    async restoreWidget(widgetId, widgetData) {
        try {
            // Création widget selon type
            let widget = null;
            
            // Création widget depuis classe globale
            if (widgetData.type === 'canvas') {
                widget = new window.WidgetEditor.WidgetCanvas(this.editor, widgetId);
            }
            // Compatibility ancien type
            else if (widgetData.type === 'ElementUniversel') {
                widget = new window.WidgetEditor.WidgetCanvas(this.editor, widgetId);
            }
            // Autres types widgets (Phase 2+)
            else {
                console.warn(`Type widget inconnu: ${widgetData.type}, utilisation WidgetCanvas par défaut`);
                widget = new window.WidgetEditor.WidgetCanvas(this.editor, widgetId);
            }
            
            // Restauration configuration
            if (widgetData.config) {
                widget.importConfig(widgetData.config);
            }
            
            // Position et dimensions
            if (widgetData.position) {
                widget.setPosition(widgetData.position.x, widgetData.position.y);
            }
            if (widgetData.dimensions) {
                widget.setDimensions(widgetData.dimensions.width, widgetData.dimensions.height);
            }
            
            // États
            if (typeof widgetData.visible === 'boolean') {
                widget.setVisible(widgetData.visible);
            }
            if (typeof widgetData.locked === 'boolean') {
                widget.setLocked(widgetData.locked);
            }
            
            // Rendu dans grille
            const grid = document.getElementById('infinite-grid');
            if (grid) {
                widget.render(grid);
            }
            
            // Ajout à la collection
            this.editor.getWidgets().set(widgetId, widget);
            
        } catch (error) {
            console.error(`❌ Erreur restauration widget ${widgetId}:`, error);
        }
    }
    
    /**
     * Sauvegarde localStorage
     * @param {Object} state - État à sauvegarder
     */
    saveToLocalStorage(state) {
        try {
            const key = `${this.config.storageKey}_project_${this.editor.getState().projectId}`;
            let dataToSave = state;
            
            // Compression si activée
            if (this.config.useCompression) {
                dataToSave = this.compressState(state);
            }
            
            // Sauvegarde avec gestion erreur quota
            localStorage.setItem(key, JSON.stringify(dataToSave));
            
            this.debugLog(`Sauvé localStorage (${key})`);
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            } else {
                throw error;
            }
        }
    }
    
    /**
     * Chargement localStorage
     * @returns {Object|null} - État chargé ou null
     */
    loadFromLocalStorage() {
        try {
            const key = `${this.config.storageKey}_project_${this.editor.getState().projectId}`;
            const savedData = localStorage.getItem(key);
            
            if (!savedData) {
                return null;
            }
            
            let state = JSON.parse(savedData);
            
            // Décompression si nécessaire
            if (this.config.useCompression && state.compressed) {
                state = this.decompressState(state);
            }
            
            this.debugLog(`Chargé localStorage (${key})`);
            return state;
            
        } catch (error) {
            console.error('❌ Erreur chargement localStorage:', error);
            return null;
        }
    }
    
    /**
     * Chargement état précédent au démarrage
     */
    async loadPreviousState() {
        const savedState = this.loadFromLocalStorage();
        
        if (savedState) {
            try {
                await this.restoreState(savedState);
                this.debugLog('État précédent restauré');
            } catch (error) {
                console.error('❌ Erreur restauration état précédent:', error);
                // Continue avec état vide si erreur
            }
        }
    }
    
    /**
     * Gestion quota localStorage dépassé
     * Nettoyage automatique anciennes sauvegardes
     */
    handleStorageQuotaExceeded() {
        console.warn('⚠️ Quota localStorage dépassé - nettoyage');
        
        try {
            // Suppression anciennes sauvegardes
            const keys = Object.keys(localStorage);
            const projectKeys = keys.filter(key => key.startsWith(this.config.storageKey));
            
            // Tri par âge (si timestamp dans les données)
            projectKeys.sort();
            
            // Suppression plus anciennes
            const toRemove = Math.ceil(projectKeys.length * 0.3); // 30% plus anciens
            for (let i = 0; i < toRemove && i < projectKeys.length; i++) {
                localStorage.removeItem(projectKeys[i]);
            }
            
            this.debugLog(`${toRemove} anciennes sauvegardes supprimées`);
            
        } catch (error) {
            console.error('❌ Erreur nettoyage localStorage:', error);
        }
    }
    
    /**
     * Compression état (simple)
     * @param {Object} state - État à compresser
     * @returns {Object} - État compressé
     */
    compressState(state) {
        return {
            compressed: true,
            data: state // TODO: Vraie compression si nécessaire
        };
    }
    
    /**
     * Décompression état
     * @param {Object} compressedState - État compressé
     * @returns {Object} - État décompressé
     */
    decompressState(compressedState) {
        return compressedState.data;
    }
    
    /**
     * Mise à jour statut sauvegarde interface
     * @param {string} type - Type statut ('success', 'error', 'undo', 'redo')
     */
    updateSaveStatus(type) {
        const status = this.editor.getElements().saveStatus;
        if (!status) return;
        
        let message = '';
        let className = '';
        
        switch (type) {
            case 'success':
                message = 'Sauvegardé';
                className = 'save-success';
                break;
            case 'error':
                message = 'Erreur sauvegarde';
                className = 'save-error';
                break;
            case 'undo':
                message = 'Annulé';
                className = 'save-undo';
                break;
            case 'redo':
                message = 'Rétabli';
                className = 'save-redo';
                break;
        }
        
        status.textContent = message;
        status.className = `save-status ${className}`;
    }
    
    /**
     * Mise à jour boutons historique
     * Activation/désactivation undo/redo
     */
    updateHistoryButtons() {
        const undoBtn = this.editor.getElements().btnUndo;
        const redoBtn = this.editor.getElements().btnRedo;
        
        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
        }
        
        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
        }
        
        // Mise à jour compteur historique
        const historyCount = document.getElementById('history-count');
        if (historyCount) {
            historyCount.textContent = `${this.history.undoStack.length} actions`;
        }
    }
    
    /**
     * Export projet complet
     * @returns {Object} - Données projet exportables
     */
    exportProject() {
        const state = this.captureCurrentState();
        
        return {
            ...state,
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            editorVersion: 'Phase 1'
        };
    }
    
    /**
     * Import projet complet
     * @param {Object} projectData - Données projet
     */
    async importProject(projectData) {
        if (!projectData || typeof projectData !== 'object') {
            throw new Error('Données projet invalides');
        }
        
        // Validation version
        if (projectData.version && projectData.version !== '1.0.0') {
            console.warn('⚠️ Version projet différente, tentative import...');
        }
        
        // Restauration état
        await this.restoreState(projectData);
        
        this.debugLog('Projet importé');
    }
    
    // Getters pour interface externe
    getHistorySize() { return this.history.undoStack.length; }
    getRedoSize() { return this.history.redoStack.length; }
    getSaveCount() { return this.saveState.saveCount; }
    getTotalSaves() { return this.saveState.totalSaves; }
    getLastSaveTime() { return this.saveState.lastSaveTime; }
    
    /**
     * Méthodes publiques appelées par Editor
     */
    load() {
        return this.loadPreviousState();
    }
    
    /**
     * Log de debug spécialisé Persistence
     * @param {string} message - Message à logger
     */
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`💾 [${timestamp}] Persistence: ${message}`);
    }
};

// Compatibilité globale
window.Persistence = window.WidgetEditor.Persistence;