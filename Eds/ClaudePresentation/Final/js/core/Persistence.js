/**
 * 💾 PERSISTENCE.JS - Système de Sauvegarde Avancé
 * 
 * Rôle : Gestion persistance avec auto-save et historique 100 actions
 * Type : Gestionnaire de stockage localStorage avec compression
 * Responsabilité : Sauvegarde, restauration, historique, export/import
 * Innovation : Persistance temps réel avec F5 → restauration exacte état
 */
class Persistence {
    
    constructor(eventManager) {
        // Rôle : Gestionnaire d'événements pour communication
        // Type : EventManager (bus d'événements)
        // Unité : Sans unité
        // Domaine : Instance EventManager valide
        // Formule : Injection de dépendance
        // Exemple : Écoute 'widget-modified' pour déclencher auto-save
        this.eventManager = eventManager;
        
        // Rôle : Clé de base pour stockage localStorage
        // Type : String (préfixe stockage)
        // Unité : Sans unité
        // Domaine : Nom unique pour éviter collisions
        // Formule : 'presentation-editor-v2-' + nom spécifique
        // Exemple : 'presentation-editor-v2-project-data'
        this.storagePrefix = 'presentation-editor-v2-';
        
        // Rôle : Historique des états pour undo/redo (100 actions max)
        // Type : Array<Object> (snapshots chronologiques)
        // Unité : Sans unité
        // Domaine : États complets du projet avec timestamps
        // Formule : Push + slice pour maintenir limite 100
        // Exemple : [{state: {...}, timestamp: 1704890400123, action: 'widget-created'}]
        this.history = [];
        this.maxHistorySize = 100;
        this.currentHistoryIndex = -1;
        
        // Rôle : Timer pour auto-save différé (debounce)
        // Type : Number (timer ID)
        // Unité : millisecondes (ms)
        // Domaine : ID setTimeout valide ou null
        // Formule : setTimeout avec clearTimeout pour debounce
        // Exemple : Auto-save 2s après dernière modification
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 secondes
        
        // Rôle : Flag pour désactiver temporairement auto-save
        // Type : Boolean (état auto-save)
        // Unité : Sans unité
        // Domaine : true (actif) | false (désactivé)
        // Formule : Configuration utilisateur + état système
        // Exemple : false pendant import pour éviter pollution historique
        this.autoSaveEnabled = true;
        
        // Rôle : Données actuelles du projet
        // Type : Object (état complet)
        // Unité : Sans unité
        // Domaine : Structure projet avec widgets, config, metadata
        // Formule : Merge de tous modules du système
        // Exemple : {widgets: [...], grid: {...}, settings: {...}}
        this.currentProject = this.getDefaultProject();
        
        // Rôle : Flag pour détecter modifications non sauvées
        // Type : Boolean (état sauvegarde)
        // Unité : Sans unité
        // Domaine : true (modifié) | false (synchronisé)
        // Formule : true à chaque modification, false après save
        // Exemple : true → indicateur * dans titre fenêtre
        this.hasUnsavedChanges = false;
        
        // Initialisation
        this.initEventListeners();
        this.loadProject();
        
        Utils.log('success', 'Système de persistance initialisé', {
            autoSaveDelay: this.autoSaveDelay,
            maxHistorySize: this.maxHistorySize,
            storageAvailable: this.isStorageAvailable()
        });
    }
    
    /**
     * Initialise les écouteurs d'événements
     */
    initEventListeners() {
        // Auto-save sur modifications
        this.eventManager.on('widget:created', () => this.scheduleAutoSave('widget-created'));
        this.eventManager.on('widget:modified', () => this.scheduleAutoSave('widget-modified'));
        this.eventManager.on('widget:deleted', () => this.scheduleAutoSave('widget-deleted'));
        this.eventManager.on('widget:moved', () => this.scheduleAutoSave('widget-moved'));
        this.eventManager.on('project:settings-changed', () => this.scheduleAutoSave('settings-changed'));
        
        // Sauvegarde avant fermeture
        this.eventManager.on('system:before-unload', () => {
            if (this.hasUnsavedChanges) {
                this.saveProject(true); // Sauvegarde synchrone
            }
        });
        
        // Raccourcis clavier
        this.eventManager.on('system:keydown', (event) => {
            if (event.data.ctrlKey || event.data.metaKey) {
                switch (event.data.key) {
                    case 's':
                        event.preventDefault?.();
                        this.saveProject();
                        break;
                    case 'z':
                        if (!event.data.shiftKey) {
                            event.preventDefault?.();
                            this.undo();
                        } else {
                            event.preventDefault?.();
                            this.redo();
                        }
                        break;
                    case 'y':
                        event.preventDefault?.();
                        this.redo();
                        break;
                }
            }
        });
    }
    
    /**
     * Retourne la structure de projet par défaut
     * 
     * @returns {Object} Projet par défaut
     */
    getDefaultProject() {
        // Rôle : Générateur de structure projet vierge
        // Type : Object (projet complet)
        // Unité : Sans unité
        // Domaine : Structure complète avec tous modules
        // Formule : Template avec valeurs par défaut cohérentes
        // Exemple : Nouveau projet → état initial propre
        return {
            // Métadonnées projet
            metadata: {
                id: Utils.generateId('project'),
                name: 'Projet Sans Titre',
                version: '1.0.0',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: 'Éditeur Révolutionnaire'
            },
            
            // Configuration grille
            grid: {
                width: 1200,
                height: 800,
                cellSize: 20,
                showGrid: true,
                snapToGrid: true,
                backgroundColor: '#ffffff'
            },
            
            // Widgets du projet
            widgets: [],
            
            // Arborescence hiérarchique
            hierarchy: {
                rootId: 'root',
                children: []
            },
            
            // Configuration éditeur
            editor: {
                zoom: 1.0,
                viewportX: 0,
                viewportY: 0,
                selectedWidgetId: null,
                activePanel: 'properties'
            },
            
            // Paramètres globaux
            settings: {
                theme: 'default',
                language: 'fr',
                autoSave: true,
                syncViewer: true
            },
            
            // Assets du projet
            assets: {
                images: [],
                fonts: [],
                icons: []
            }
        };
    }
    
    /**
     * Vérifie si localStorage est disponible
     * 
     * @returns {boolean} true si disponible
     */
    isStorageAvailable() {
        // Rôle : Testeur de disponibilité localStorage
        // Type : Boolean (disponibilité)
        // Unité : Sans unité
        // Domaine : true (utilisable) | false (indisponible)
        // Formule : Try/catch sur opérations localStorage de base
        // Exemple : Navigation privée ou quota dépassé → false
        try {
            const testKey = this.storagePrefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            Utils.log('error', 'LocalStorage indisponible:', error.message);
            return false;
        }
    }
    
    /**
     * Programme un auto-save différé
     * 
     * @param {string} action - Action qui déclenche la sauvegarde
     */
    scheduleAutoSave(action) {
        if (!this.autoSaveEnabled) return;
        
        // Rôle : Planificateur de sauvegarde différée avec debounce
        // Type : Void (effet de bord timer)
        // Unité : millisecondes (ms)
        // Domaine : Timer actif avec delay configurable
        // Formule : clearTimeout + setTimeout pour debounce
        // Exemple : Modification → attendre 2s silence → auto-save
        this.hasUnsavedChanges = true;
        
        // Annule le timer précédent
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // Programme nouvelle sauvegarde
        this.autoSaveTimer = setTimeout(() => {
            this.saveProject(false, `Auto-save: ${action}`);
            this.autoSaveTimer = null;
        }, this.autoSaveDelay);
        
        // Notification système
        this.eventManager.emit('persistence:auto-save-scheduled', {
            action,
            delay: this.autoSaveDelay
        });
    }
    
    /**
     * Sauvegarde le projet actuel
     * 
     * @param {boolean} synchronous - Sauvegarde synchrone
     * @param {string} description - Description de la sauvegarde
     * @returns {boolean} true si succès
     */
    saveProject(synchronous = false, description = 'Sauvegarde manuelle') {
        if (!this.isStorageAvailable()) {
            this.eventManager.emit('persistence:save-failed', {
                reason: 'localStorage indisponible'
            });
            return false;
        }
        
        try {
            // Rôle : Sérialiseur et compresseur de l'état projet complet
            // Type : String (JSON compressé)
            // Unité : caractères (taille sérialisée)
            // Domaine : État complet sérialisé en JSON valide
            // Formule : JSON.stringify + compression optionnelle
            // Exemple : {widgets: [...]} → "{"widgets":[...]}" (minifié)
            
            // Mise à jour timestamp
            this.currentProject.metadata.modified = new Date().toISOString();
            
            // Sérialisation
            const serializedProject = JSON.stringify(this.currentProject);
            const projectSize = serializedProject.length;
            
            // Sauvegarde principale
            const mainKey = this.storagePrefix + 'current-project';
            localStorage.setItem(mainKey, serializedProject);
            
            // Sauvegarde de récupération (backup)
            const backupKey = this.storagePrefix + 'project-backup';
            localStorage.setItem(backupKey, serializedProject);
            
            // Sauvegarde métadonnées
            const metaKey = this.storagePrefix + 'project-meta';
            const metadata = {
                lastSaved: new Date().toISOString(),
                size: projectSize,
                description,
                version: this.currentProject.metadata.version
            };
            localStorage.setItem(metaKey, JSON.stringify(metadata));
            
            // Ajout à l'historique si pas auto-save
            if (description !== 'Auto-save') {
                this.addToHistory(this.currentProject, description);
            }
            
            // Mise à jour état
            this.hasUnsavedChanges = false;
            
            Utils.log('success', `Projet sauvegardé: ${description}`, {
                size: Utils.formatFileSize(projectSize),
                synchronous,
                historySize: this.history.length
            });
            
            // Notification réussite
            this.eventManager.emit('persistence:save-success', {
                size: projectSize,
                description,
                timestamp: new Date().toISOString()
            });
            
            return true;
            
        } catch (error) {
            Utils.log('error', 'Erreur sauvegarde projet:', error);
            
            this.eventManager.emit('persistence:save-failed', {
                error: error.message,
                description
            });
            
            return false;
        }
    }
    
    /**
     * Charge le projet depuis localStorage
     * 
     * @returns {boolean} true si chargement réussi
     */
    loadProject() {
        if (!this.isStorageAvailable()) {
            Utils.log('warn', 'Impossible de charger - localStorage indisponible');
            return false;
        }
        
        try {
            // Rôle : Désérialiseur et restaurateur d'état projet
            // Type : Object (projet restauré)
            // Unité : Sans unité
            // Domaine : État complet avec structure validée
            // Formule : JSON.parse + validation + fusion defaults
            // Exemple : localStorage → objet projet complet
            
            const mainKey = this.storagePrefix + 'current-project';
            const savedProject = localStorage.getItem(mainKey);
            
            if (!savedProject) {
                Utils.log('info', 'Aucun projet sauvé - utilisation défaut');
                return false;
            }
            
            // Désérialisation
            const project = JSON.parse(savedProject);
            
            // Validation basique structure
            if (!project.metadata || !project.widgets || !Array.isArray(project.widgets)) {
                throw new Error('Structure de projet invalide');
            }
            
            // Fusion avec structure par défaut pour nouvelles propriétés
            this.currentProject = Utils.deepMerge(this.getDefaultProject(), project);
            
            // Chargement métadonnées
            const metaKey = this.storagePrefix + 'project-meta';
            const savedMeta = localStorage.getItem(metaKey);
            if (savedMeta) {
                const metadata = JSON.parse(savedMeta);
                
                Utils.log('success', 'Projet chargé depuis localStorage', {
                    name: this.currentProject.metadata.name,
                    widgets: this.currentProject.widgets.length,
                    lastSaved: metadata.lastSaved,
                    size: Utils.formatFileSize(metadata.size)
                });
            }
            
            // Chargement historique si existant
            this.loadHistory();
            
            // Notification chargement
            this.eventManager.emit('persistence:project-loaded', {
                project: this.currentProject,
                fromStorage: true
            });
            
            return true;
            
        } catch (error) {
            Utils.log('error', 'Erreur chargement projet:', error);
            
            // Tentative de récupération depuis backup
            return this.loadProjectBackup();
        }
    }
    
    /**
     * Charge le projet depuis la sauvegarde de récupération
     * 
     * @returns {boolean} true si récupération réussie
     */
    loadProjectBackup() {
        try {
            // Rôle : Système de récupération depuis backup en cas d'erreur
            // Type : Boolean (succès récupération)
            // Unité : Sans unité
            // Domaine : true (backup récupéré) | false (échec total)
            // Formule : Tentative chargement backup-key si main-key corrompu
            // Exemple : Corruption données principales → fallback backup
            
            const backupKey = this.storagePrefix + 'project-backup';
            const backupProject = localStorage.getItem(backupKey);
            
            if (!backupProject) {
                throw new Error('Aucune sauvegarde de récupération disponible');
            }
            
            const project = JSON.parse(backupProject);
            this.currentProject = Utils.deepMerge(this.getDefaultProject(), project);
            
            Utils.log('warn', 'Projet récupéré depuis backup', {
                name: this.currentProject.metadata.name,
                widgets: this.currentProject.widgets.length
            });
            
            // Notification récupération
            this.eventManager.emit('persistence:project-recovered', {
                project: this.currentProject,
                fromBackup: true
            });
            
            return true;
            
        } catch (error) {
            Utils.log('error', 'Impossible de récupérer le projet:', error);
            
            // Utilise projet par défaut
            this.currentProject = this.getDefaultProject();
            
            this.eventManager.emit('persistence:project-reset', {
                reason: 'Récupération impossible'
            });
            
            return false;
        }
    }
    
    /**
     * Ajoute un état à l'historique pour undo/redo
     * 
     * @param {Object} state - État à sauvegarder
     * @param {string} action - Description de l'action
     */
    addToHistory(state, action) {
        // Rôle : Enregistreur chronologique pour système undo/redo
        // Type : Void (effet de bord historique)
        // Unité : Sans unité
        // Domaine : Snapshot complet avec métadonnées
        // Formule : push + slice pour maintenir limite + reset index
        // Exemple : Après création widget → snapshot pour pouvoir annuler
        
        // Clone profond pour éviter références partagées
        const snapshot = {
            state: Utils.deepClone(state),
            timestamp: Date.now(),
            action: action,
            id: Utils.generateId('snapshot')
        };
        
        // Si on était au milieu de l'historique, supprime le futur
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentHistoryIndex + 1);
        }
        
        // Ajout nouveau snapshot
        this.history.push(snapshot);
        
        // Maintient la limite
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentHistoryIndex = this.history.length - 1;
        }
        
        // Sauvegarde historique
        this.saveHistory();
        
        // Notification
        this.eventManager.emit('persistence:history-updated', {
            action,
            historySize: this.history.length,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }
    
    /**
     * Annule la dernière action (undo)
     * 
     * @returns {boolean} true si undo effectué
     */
    undo() {
        // Rôle : Restaurateur d'état précédent dans l'historique
        // Type : Boolean (succès undo)
        // Unité : Sans unité
        // Domaine : true (undo effectué) | false (impossible)
        // Formule : currentHistoryIndex-- + restauration state[index]
        // Exemple : Après création widget → undo → état sans widget
        
        if (!this.canUndo()) {
            Utils.log('warn', 'Undo impossible - début de l\'historique atteint');
            return false;
        }
        
        this.currentHistoryIndex--;
        const snapshot = this.history[this.currentHistoryIndex];
        
        // Désactive auto-save pendant restoration
        const wasAutoSaveEnabled = this.autoSaveEnabled;
        this.autoSaveEnabled = false;
        
        try {
            // Restauration état
            this.currentProject = Utils.deepClone(snapshot.state);
            
            Utils.log('info', `Undo effectué: ${snapshot.action}`, {
                timestamp: Utils.formatDate(snapshot.timestamp),
                historyIndex: this.currentHistoryIndex
            });
            
            // Notification
            this.eventManager.emit('persistence:undo', {
                action: snapshot.action,
                timestamp: snapshot.timestamp,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
            
        } finally {
            // Réactive auto-save
            this.autoSaveEnabled = wasAutoSaveEnabled;
        }
    }
    
    /**
     * Refait la dernière action annulée (redo)
     * 
     * @returns {boolean} true si redo effectué
     */
    redo() {
        // Rôle : Restaurateur d'état suivant dans l'historique
        // Type : Boolean (succès redo)
        // Unité : Sans unité
        // Domaine : true (redo effectué) | false (impossible)
        // Formule : currentHistoryIndex++ + restauration state[index]
        // Exemple : Après undo création widget → redo → widget réapparaît
        
        if (!this.canRedo()) {
            Utils.log('warn', 'Redo impossible - fin de l\'historique atteinte');
            return false;
        }
        
        this.currentHistoryIndex++;
        const snapshot = this.history[this.currentHistoryIndex];
        
        // Désactive auto-save pendant restoration
        const wasAutoSaveEnabled = this.autoSaveEnabled;
        this.autoSaveEnabled = false;
        
        try {
            // Restauration état
            this.currentProject = Utils.deepClone(snapshot.state);
            
            Utils.log('info', `Redo effectué: ${snapshot.action}`, {
                timestamp: Utils.formatDate(snapshot.timestamp),
                historyIndex: this.currentHistoryIndex
            });
            
            // Notification
            this.eventManager.emit('persistence:redo', {
                action: snapshot.action,
                timestamp: snapshot.timestamp,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            });
            
            return true;
            
        } finally {
            // Réactive auto-save
            this.autoSaveEnabled = wasAutoSaveEnabled;
        }
    }
    
    /**
     * Vérifie si un undo est possible
     * 
     * @returns {boolean} true si undo possible
     */
    canUndo() {
        // Rôle : Vérificateur de possibilité undo
        // Type : Boolean (capacité undo)
        // Unité : Sans unité
        // Domaine : true (undo possible) | false (impossible)
        // Formule : currentHistoryIndex > 0
        // Exemple : Index 5 sur 10 → true, Index 0 → false
        return this.currentHistoryIndex > 0;
    }
    
    /**
     * Vérifie si un redo est possible
     * 
     * @returns {boolean} true si redo possible
     */
    canRedo() {
        // Rôle : Vérificateur de possibilité redo
        // Type : Boolean (capacité redo)
        // Unité : Sans unité
        // Domaine : true (redo possible) | false (impossible)
        // Formule : currentHistoryIndex < history.length - 1
        // Exemple : Index 5 sur 10 → true, Index 9 sur 10 → false
        return this.currentHistoryIndex < this.history.length - 1;
    }
    
    /**
     * Sauvegarde l'historique dans localStorage
     */
    saveHistory() {
        if (!this.isStorageAvailable()) return;
        
        try {
            // Rôle : Persisteur de l'historique undo/redo
            // Type : Void (effet de bord localStorage)
            // Unité : Sans unité
            // Domaine : Historique complet sérialisé
            // Formule : JSON.stringify(history + index)
            // Exemple : 100 snapshots → sauvegarde pour récupération après F5
            
            const historyData = {
                history: this.history,
                currentIndex: this.currentHistoryIndex,
                saved: new Date().toISOString()
            };
            
            const historyKey = this.storagePrefix + 'history';
            localStorage.setItem(historyKey, JSON.stringify(historyData));
            
        } catch (error) {
            Utils.log('error', 'Erreur sauvegarde historique:', error);
        }
    }
    
    /**
     * Charge l'historique depuis localStorage
     */
    loadHistory() {
        if (!this.isStorageAvailable()) return;
        
        try {
            // Rôle : Restaurateur de l'historique undo/redo
            // Type : Void (effet de bord this.history)
            // Unité : Sans unité
            // Domaine : Historique complet avec index
            // Formule : JSON.parse + validation structure
            // Exemple : Après F5 → historique intact pour undo/redo
            
            const historyKey = this.storagePrefix + 'history';
            const savedHistory = localStorage.getItem(historyKey);
            
            if (!savedHistory) return;
            
            const historyData = JSON.parse(savedHistory);
            
            if (historyData.history && Array.isArray(historyData.history)) {
                this.history = historyData.history;
                this.currentHistoryIndex = historyData.currentIndex || -1;
                
                Utils.log('success', 'Historique chargé', {
                    snapshots: this.history.length,
                    currentIndex: this.currentHistoryIndex
                });
            }
            
        } catch (error) {
            Utils.log('error', 'Erreur chargement historique:', error);
            this.history = [];
            this.currentHistoryIndex = -1;
        }
    }
    
    /**
     * Exporte le projet vers un fichier JSON
     * 
     * @returns {string} JSON du projet
     */
    exportProject() {
        // Rôle : Générateur de fichier export projet complet
        // Type : String (JSON formaté)
        // Unité : Sans unité
        // Domaine : Projet complet avec métadonnées export
        // Formule : JSON.stringify avec métadonnées ajoutées
        // Exemple : Bouton export → téléchargement .json
        
        const exportData = {
            ...this.currentProject,
            exportMetadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: 'Éditeur Révolutionnaire',
                version: '1.0.0',
                format: 'presentation-editor-project'
            }
        };
        
        const jsonStr = JSON.stringify(exportData, null, 2);
        
        Utils.log('info', 'Projet exporté', {
            size: Utils.formatFileSize(jsonStr.length),
            widgets: exportData.widgets.length
        });
        
        this.eventManager.emit('persistence:project-exported', {
            size: jsonStr.length,
            format: 'json'
        });
        
        return jsonStr;
    }
    
    /**
     * Importe un projet depuis JSON
     * 
     * @param {string} jsonData - Données JSON
     * @returns {boolean} true si import réussi
     */
    importProject(jsonData) {
        try {
            // Rôle : Parseur et validateur de projet importé
            // Type : Boolean (succès import)
            // Unité : Sans unité
            // Domaine : true (projet valide) | false (erreur)
            // Formule : JSON.parse + validation + fusion defaults
            // Exemple : Upload .json → remplace projet actuel
            
            const importedProject = JSON.parse(jsonData);
            
            // Validation structure
            if (!importedProject.metadata || !importedProject.widgets) {
                throw new Error('Format de projet invalide');
            }
            
            // Sauvegarde état actuel avant import
            this.addToHistory(this.currentProject, 'Avant import');
            
            // Désactive auto-save pendant import
            const wasAutoSaveEnabled = this.autoSaveEnabled;
            this.autoSaveEnabled = false;
            
            try {
                // Fusion avec défauts pour nouvelles propriétés
                this.currentProject = Utils.deepMerge(
                    this.getDefaultProject(), 
                    importedProject
                );
                
                // Mise à jour timestamps
                this.currentProject.metadata.modified = new Date().toISOString();
                
                Utils.log('success', 'Projet importé', {
                    name: this.currentProject.metadata.name,
                    widgets: this.currentProject.widgets.length,
                    importSize: Utils.formatFileSize(jsonData.length)
                });
                
                // Sauvegarde immédiate
                this.saveProject(false, 'Import projet');
                
                // Notification
                this.eventManager.emit('persistence:project-imported', {
                    project: this.currentProject,
                    size: jsonData.length
                });
                
                return true;
                
            } finally {
                this.autoSaveEnabled = wasAutoSaveEnabled;
            }
            
        } catch (error) {
            Utils.log('error', 'Erreur import projet:', error);
            
            this.eventManager.emit('persistence:import-failed', {
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Obtient les informations sur l'état de sauvegarde
     * 
     * @returns {Object} État complet du système
     */
    getStatus() {
        // Rôle : Générateur de rapport d'état complet
        // Type : Object (métriques système)
        // Unité : Diverses (tailles, compteurs, flags)
        // Domaine : Vue d'ensemble du système de persistance
        // Formule : Agrégation de tous indicateurs
        // Exemple : Interface admin ou debug
        
        return {
            hasUnsavedChanges: this.hasUnsavedChanges,
            autoSaveEnabled: this.autoSaveEnabled,
            storageAvailable: this.isStorageAvailable(),
            project: {
                name: this.currentProject.metadata.name,
                widgets: this.currentProject.widgets.length,
                lastModified: this.currentProject.metadata.modified
            },
            history: {
                size: this.history.length,
                maxSize: this.maxHistorySize,
                currentIndex: this.currentHistoryIndex,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            },
            autoSave: {
                delay: this.autoSaveDelay,
                scheduled: !!this.autoSaveTimer
            }
        };
    }
    
    /**
     * Nettoie les ressources du système
     */
    destroy() {
        // Rôle : Destructeur complet du système de persistance
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Libération complète des ressources
        // Formule : Clear timers + save final + clear data
        // Exemple : Avant rechargement ou fermeture application
        
        // Sauvegarde finale si nécessaire
        if (this.hasUnsavedChanges) {
            this.saveProject(true, 'Sauvegarde finale');
        }
        
        // Nettoyage timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        // Sauvegarde historique final
        this.saveHistory();
        
        Utils.log('warn', 'Système de persistance détruit');
    }
}

// Export pour utilisation globale
window.Persistence = Persistence;