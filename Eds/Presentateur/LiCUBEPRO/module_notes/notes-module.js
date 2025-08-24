/**
 * =====================================================
 * MODULE DE NOTES UNIVERSELLES - CLIENT JAVASCRIPT
 * =====================================================
 * 
 * Module générique de notes partagées pour tout site web
 * 
 * CARACTÉRISTIQUES :
 * - 100% modulaire et réutilisable
 * - Compatible avec n'importe quel site web
 * - Style adaptatif au site hôte
 * - Sauvegarde serveur immédiate
 * - Notes partagées entre utilisateurs
 * - Nommage automatique basé sur URL
 * - Interface responsive et accessible
 * 
 * INSTALLATION :
 * 1. Copier le dossier module_notes dans votre site
 * 2. Inclure ce script : <script src="module_notes/notes-module.js"></script>
 * 3. Le module s'initialise automatiquement
 * 
 * PERSONNALISATION :
 * Définir NotesConfig avant le chargement du script :
 * 
 * <script>
 * window.NotesConfig = {
 *   position: 'bottom-right',
 *   theme: 'dark',
 *   autoInit: true,
 *   apiPath: 'module_notes/notes-handler.php'
 * };
 * </script>
 * <script src="module_notes/notes-module.js"></script>
 * 
 * AUTEUR : Assistant Claude (Anthropic)
 * VERSION : 1.0 - Module Universel
 * LICENCE : MIT - Libre utilisation
 */

(function(window, document) {
    'use strict';
    
    // ========================================
    // CONFIGURATION GLOBALE MODULAIRE
    // ========================================
    
    const NotesModule = {
        version: '1.0-universel',
        initialized: false,
        
        // Configuration par défaut (peut être surchargée)
        config: {
            // Position du bouton flottant
            position: 'center-right', // top-right, bottom-right, center-right, center-left, etc.
            
            // Thème visuel
            theme: 'auto', // auto, light, dark, adaptive
            
            // Couleurs personnalisables
            colors: {
                primary: '#007BFF',
                success: '#28A745',
                warning: '#FFC107',
                danger: '#DC3545',
                background: 'rgba(15, 23, 42, 0.95)',
                text: '#ffffff'
            },
            
            // Chemins et URLs
            apiPath: 'module_notes/notes-handler.php',
            
            // Comportement
            autoInit: true,
            refreshInterval: 30000, // 30 secondes
            maxNoteLength: 5000,
            
            // Raccourcis clavier
            shortcuts: {
                toggle: ['ctrl+shift+n', 'cmd+shift+n'],
                save: ['ctrl+enter', 'cmd+enter']
            },
            
            // Textes personnalisables (multilingue)
            labels: {
                title: 'Notes Partagées',
                placeholder: 'Votre note sera partagée avec tous les utilisateurs...\n\nExemples:\nBUG: Problème avec le bouton X\nIDÉE: Améliorer la navigation\nCOMMENTAIRE: Interface très claire !',
                saveButton: '💾 Sauvegarder',
                viewButton: '👁️ Voir Notes',
                refreshButton: '🔄 Actualiser',
                clearButton: '🗑️ Effacer',
                statusConnected: '🌐 Connecté',
                statusSaving: '📤 Sauvegarde...',
                statusError: '❌ Erreur connexion'
            },
            
            // Métadonnées personnalisées
            metadata: {
                includeTitle: true,
                includeUrl: true,
                customFields: {} // {category: 'support', project: 'alpha', etc.}
            }
        },
        
        // État du module
        state: {
            isOpen: false,
            isLoading: false,
            hasUnsavedChanges: false,
            currentNotes: '',
            lastRefresh: null,
            refreshTimer: null
        },
        
        // Éléments DOM
        elements: {},
        
        // Cache des styles adaptatifs
        adaptiveStyles: null
    };
    
    // Fusionner avec la configuration utilisateur si elle existe
    if (window.NotesConfig) {
        NotesModule.config = deepMerge(NotesModule.config, window.NotesConfig);
    }
    
    // ========================================
    // INITIALISATION AUTOMATIQUE
    // ========================================
    
    function initModule() {
        if (NotesModule.initialized) return;
        
        console.log('🚀 Initialisation Module Notes Universel v' + NotesModule.version);
        
        // Détecter et adapter le thème au site
        adaptThemeToSite();
        
        // Créer l'interface utilisateur
        createInterface();
        
        // Configurer les événements
        setupEventListeners();
        
        // Tester la connexion serveur
        testServerConnection();
        
        NotesModule.initialized = true;
        
        console.log('✅ Module Notes prêt - URL:', getCurrentPageURL());
        
        // Événement personnalisé pour intégration
        const event = new CustomEvent('notesModuleReady', {
            detail: { version: NotesModule.version, config: NotesModule.config }
        });
        document.dispatchEvent(event);
    }
    
    // ========================================
    // ADAPTATION THÉMATIQUE INTELLIGENTE
    // ========================================
    
    function adaptThemeToSite() {
        const config = NotesModule.config;
        
        if (config.theme === 'auto' || config.theme === 'adaptive') {
            // Analyser les styles du site pour adaptation
            const bodyStyles = window.getComputedStyle(document.body);
            const rootStyles = window.getComputedStyle(document.documentElement);
            
            // Détecter le thème sombre/clair
            const bgColor = bodyStyles.backgroundColor;
            const isDarkTheme = isColorDark(bgColor);
            
            // Extraire les couleurs principales du site
            const primaryColor = extractPrimaryColor() || config.colors.primary;
            
            // Adapter les couleurs du module
            if (isDarkTheme) {
                config.colors.background = 'rgba(15, 23, 42, 0.95)';
                config.colors.text = '#ffffff';
                config.colors.primary = lightenColor(primaryColor, 20);
            } else {
                config.colors.background = 'rgba(255, 255, 255, 0.95)';
                config.colors.text = '#333333';
                config.colors.primary = primaryColor;
            }
            
            console.log('🎨 Thème adapté automatiquement:', isDarkTheme ? 'sombre' : 'clair');
        }
    }
    
    // ========================================
    // CRÉATION DE L'INTERFACE UTILISATEUR
    // ========================================
    
    function createInterface() {
        const container = document.createElement('div');
        container.id = 'notes-module-container';
        container.innerHTML = generateInterfaceHTML();
        
        document.body.appendChild(container);
        
        // Stocker les références aux éléments
        NotesModule.elements = {
            container: container,
            toggleBtn: document.getElementById('notes-module-toggle'),
            window: document.getElementById('notes-module-window'),
            textarea: document.getElementById('notes-module-textarea'),
            saveBtn: document.getElementById('notes-module-save'),
            viewBtn: document.getElementById('notes-module-view'),
            refreshBtn: document.getElementById('notes-module-refresh'),
            clearBtn: document.getElementById('notes-module-clear'),
            statusText: document.getElementById('notes-module-status'),
            displayArea: document.getElementById('notes-module-display'),
            contentArea: document.getElementById('notes-module-content'),
            closeBtn: document.getElementById('notes-module-close')
        };
        
        // Appliquer les styles
        injectStyles();
        
        // Positionner selon la configuration
        applyPositioning();
    }
    
    function generateInterfaceHTML() {
        const config = NotesModule.config;
        
        return `
            <!-- Bouton flottant -->
            <button id="notes-module-toggle" class="notes-module-toggle-btn" 
                    title="Notes Partagées - Clic pour ouvrir" 
                    aria-label="Ouvrir le module de notes partagées">
                📝
                <span class="notes-module-badge">NOTES</span>
            </button>
            
            <!-- Fenêtre principale -->
            <div id="notes-module-window" class="notes-module-window notes-module-hidden" 
                 role="dialog" aria-labelledby="notes-module-title" aria-modal="true">
                
                <!-- En-tête -->
                <div class="notes-module-header">
                    <h3 id="notes-module-title" class="notes-module-title">
                        <span class="notes-module-icon">📝</span>
                        ${config.labels.title}
                        <span class="notes-module-version">v${NotesModule.version}</span>
                    </h3>
                    <button id="notes-module-close" class="notes-module-close-btn" 
                            title="Fermer" aria-label="Fermer la fenêtre">✕</button>
                </div>
                
                <!-- Informations contextuelles -->
                <div class="notes-module-context">
                    <div class="notes-module-context-item">
                        <strong>📄 Page:</strong> 
                        <span id="notes-module-page-info">${document.title || 'Page courante'}</span>
                    </div>
                    <div class="notes-module-context-item">
                        <strong>🌐 Mode:</strong> 
                        <span class="notes-module-shared">PARTAGÉ</span>
                    </div>
                    <div class="notes-module-context-item">
                        <strong>📁 Fichier:</strong> 
                        <span id="notes-module-filename">${generateFilenameFromURL(getCurrentPageURL())}</span>
                    </div>
                </div>
                
                <!-- Zone de saisie -->
                <div class="notes-module-input-section">
                    <label for="notes-module-textarea" class="notes-module-label">
                        💬 ${config.labels.title} :
                    </label>
                    <textarea id="notes-module-textarea" 
                              class="notes-module-textarea"
                              placeholder="${config.labels.placeholder}"
                              rows="5"
                              maxlength="${config.maxNoteLength}"
                              aria-describedby="notes-module-char-count"></textarea>
                    <div id="notes-module-char-count" class="notes-module-char-count">
                        0 / ${config.maxNoteLength} caractères
                    </div>
                </div>
                
                <!-- Boutons d'action -->
                <div class="notes-module-actions">
                    <button id="notes-module-save" class="notes-module-btn notes-module-btn-primary">
                        ${config.labels.saveButton}
                    </button>
                    <button id="notes-module-view" class="notes-module-btn notes-module-btn-secondary">
                        ${config.labels.viewButton}
                    </button>
                    <button id="notes-module-refresh" class="notes-module-btn notes-module-btn-info">
                        ${config.labels.refreshButton}
                    </button>
                    <button id="notes-module-clear" class="notes-module-btn notes-module-btn-warning">
                        ${config.labels.clearButton}
                    </button>
                </div>
                
                <!-- Statut de connexion -->
                <div class="notes-module-status-bar">
                    <span id="notes-module-status" class="notes-module-status">
                        🔄 Initialisation...
                    </span>
                    <span id="notes-module-auto-refresh" class="notes-module-auto-refresh">
                        Auto-refresh: ${config.refreshInterval / 1000}s
                    </span>
                </div>
                
                <!-- Zone d'affichage des notes -->
                <div id="notes-module-display" class="notes-module-display notes-module-hidden">
                    <div class="notes-module-display-header">
                        <strong>📋 Notes partagées de cette page:</strong>
                        <button id="notes-module-hide-display" class="notes-module-hide-btn">
                            Masquer
                        </button>
                    </div>
                    <div id="notes-module-content" class="notes-module-content">
                        Chargement des notes partagées...
                    </div>
                </div>
            </div>
        `;
    }
    
    // ========================================
    // GÉNÉRATION DES STYLES ADAPTATIFS
    // ========================================
    
    function injectStyles() {
        if (document.getElementById('notes-module-styles')) return;
        
        const config = NotesModule.config;
        const styles = document.createElement('style');
        styles.id = 'notes-module-styles';
        styles.textContent = generateCSS();
        document.head.appendChild(styles);
    }
    
    /**
     * Charge le CSS version 2.0 optimisé pour une meilleure lisibilité
     * @returns {string} Le CSS amélioré
     */
    function loadCSSv2() {
        // CSS optimisé avec excellente lisibilité et design moderne
        // Inspiré de notes-style-v2.css mais intégré directement
        return `
/* ========================================
   CSS MODULE NOTES V2.0 - INTÉGRÉ
   ======================================== */

:root {
    --notes-primary: #4A90E2;
    --notes-primary-light: #6BA3E8;
    --notes-primary-dark: #357ABD;
    --notes-success: #27AE60;
    --notes-warning: #F39C12;
    --notes-danger: #E74C3C;
    --notes-info: #3498DB;
    
    --notes-bg-main: rgba(255, 255, 255, 0.98);
    --notes-bg-header: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    --notes-bg-input: rgba(248, 249, 250, 0.95);
    --notes-bg-note: rgba(245, 247, 250, 0.9);
    --notes-bg-overlay: rgba(0, 0, 0, 0.08);
    --notes-bg-button: #4A90E2;
    
    --notes-text-primary: #2C3E50;
    --notes-text-secondary: #5D6D7E;
    --notes-text-muted: #95A5A6;
    --notes-text-white: #ffffff;
    --notes-text-header: #ffffff;
    
    --notes-border: #E8ECEF;
    --notes-border-focus: #4A90E2;
    --notes-border-light: rgba(0, 0, 0, 0.08);
    
    --notes-shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
    --notes-shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.12);
    --notes-shadow-heavy: 0 8px 32px rgba(0, 0, 0, 0.16);
    --notes-shadow-button: 0 2px 8px rgba(74, 144, 226, 0.3);
    
    --notes-spacing-xs: 4px;
    --notes-spacing-sm: 8px;
    --notes-spacing-md: 12px;
    --notes-spacing-lg: 16px;
    --notes-spacing-xl: 24px;
    --notes-spacing-xxl: 32px;
    
    --notes-radius-sm: 6px;
    --notes-radius-md: 12px;
    --notes-radius-lg: 16px;
    --notes-radius-round: 50px;
    
    --notes-transition-fast: 0.2s ease;
    --notes-transition-normal: 0.3s ease;
    
    --notes-z-button: 9998;
    --notes-z-panel: 9999;
}

@media (prefers-color-scheme: dark) {
    :root {
        --notes-bg-main: rgba(30, 34, 42, 0.98);
        --notes-bg-input: rgba(45, 52, 64, 0.95);
        --notes-bg-note: rgba(40, 46, 58, 0.9);
        --notes-text-primary: #ECEFF4;
        --notes-text-secondary: #D8DEE9;
        --notes-text-muted: #81A1C1;
        --notes-border: rgba(129, 161, 193, 0.2);
        --notes-border-light: rgba(255, 255, 255, 0.08);
    }
}

/* Protection du module */
#notes-universal-container,
#notes-universal-container * {
    box-sizing: border-box !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif !important;
}

/* Bouton flottant moderne */
.notes-module-toggle-btn {
    position: fixed !important;
    top: 50% !important;
    right: 20px !important;
    transform: translateY(-50%) !important;
    width: 56px !important;
    height: 56px !important;
    background: linear-gradient(135deg, var(--notes-primary) 0%, var(--notes-primary-light) 100%) !important;
    border: none !important;
    border-radius: var(--notes-radius-round) !important;
    cursor: pointer !important;
    box-shadow: var(--notes-shadow-button) !important;
    z-index: var(--notes-z-button) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 24px !important;
    color: var(--notes-text-white) !important;
    transition: all var(--notes-transition-normal) !important;
    user-select: none !important;
    font-weight: 600 !important;
    outline: none !important;
}

.notes-module-toggle-btn:hover {
    transform: translateY(-50%) scale(1.08) !important;
    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.4) !important;
}

.notes-module-toggle-btn:active {
    transform: translateY(-50%) scale(0.96) !important;
}

/* Badge du bouton */
.notes-module-badge {
    position: absolute !important;
    top: -3px !important;
    right: -3px !important;
    background: var(--notes-success) !important;
    color: var(--notes-text-white) !important;
    font-size: 9px !important;
    font-weight: 800 !important;
    padding: 2px 6px !important;
    border-radius: 12px !important;
    border: 2px solid var(--notes-text-white) !important;
    box-shadow: var(--notes-shadow-light) !important;
    line-height: 1 !important;
}

/* Fenêtre principale */
.notes-module-window {
    position: fixed !important;
    top: 50% !important;
    right: 20px !important;
    transform: translateY(-50%) translateX(100%) !important;
    width: 380px !important;
    max-width: calc(100vw - 40px) !important;
    max-height: calc(100vh - 40px) !important;
    background: var(--notes-bg-main) !important;
    border-radius: var(--notes-radius-lg) !important;
    box-shadow: var(--notes-shadow-heavy) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    z-index: var(--notes-z-panel) !important;
    transition: transform var(--notes-transition-normal) !important;
    overflow: hidden !important;
    border: 1px solid var(--notes-border) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
}

.notes-module-window:not(.notes-module-hidden) {
    transform: translateY(-50%) translateX(0) !important;
}

.notes-module-hidden {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

/* En-tête moderne */
.notes-module-header {
    background: var(--notes-bg-header) !important;
    padding: var(--notes-spacing-lg) var(--notes-spacing-xl) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    color: var(--notes-text-header) !important;
    position: relative !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.notes-module-title {
    display: flex !important;
    align-items: center !important;
    gap: var(--notes-spacing-sm) !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    margin: 0 !important;
    color: var(--notes-text-header) !important;
}

.notes-module-icon {
    font-size: 18px !important;
}

.notes-module-version {
    background: rgba(255, 255, 255, 0.2) !important;
    padding: 2px 8px !important;
    border-radius: var(--notes-radius-sm) !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    margin-left: auto !important;
}

.notes-module-close-btn {
    background: rgba(255, 255, 255, 0.15) !important;
    border: none !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: var(--notes-radius-sm) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: var(--notes-text-header) !important;
    font-size: 18px !important;
    transition: all var(--notes-transition-fast) !important;
    font-weight: bold !important;
}

.notes-module-close-btn:hover {
    background: rgba(255, 255, 255, 0.25) !important;
    transform: scale(1.1) !important;
}

/* Section contexte */
.notes-module-context {
    padding: var(--notes-spacing-lg) var(--notes-spacing-xl) !important;
    border-bottom: 1px solid var(--notes-border) !important;
    background: var(--notes-bg-overlay) !important;
}

.notes-module-context-item {
    font-size: 13px !important;
    margin-bottom: 5px !important;
    color: var(--notes-text-secondary) !important;
    word-break: break-all !important;
    line-height: 1.4 !important;
}

.notes-module-context-item strong {
    color: var(--notes-primary) !important;
    margin-right: var(--notes-spacing-sm) !important;
}

/* Zone de saisie */
.notes-module-input-section {
    padding: var(--notes-spacing-xl) !important;
}

.notes-module-label {
    display: block !important;
    font-weight: 600 !important;
    margin-bottom: 10px !important;
    color: var(--notes-primary) !important;
    font-size: 14px !important;
}

.notes-module-textarea {
    width: 100% !important;
    min-height: 120px !important;
    padding: var(--notes-spacing-md) !important;
    border: 1px solid var(--notes-border) !important;
    border-radius: var(--notes-radius-md) !important;
    background: var(--notes-bg-input) !important;
    color: var(--notes-text-primary) !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    resize: vertical !important;
    transition: all var(--notes-transition-fast) !important;
    font-family: inherit !important;
    box-sizing: border-box !important;
    outline: none !important;
}

.notes-module-textarea:focus {
    border-color: var(--notes-border-focus) !important;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
    background: rgba(255, 255, 255, 0.98) !important;
}

.notes-module-textarea::placeholder {
    color: var(--notes-text-muted) !important;
}

/* Boutons d'action */
.notes-module-actions {
    padding: 0 var(--notes-spacing-xl) var(--notes-spacing-xl) !important;
    display: flex !important;
    gap: var(--notes-spacing-sm) !important;
    flex-wrap: wrap !important;
}

.notes-module-btn {
    flex: 1 !important;
    min-width: 80px !important;
    padding: var(--notes-spacing-md) var(--notes-spacing-sm) !important;
    border: none !important;
    border-radius: var(--notes-radius-sm) !important;
    cursor: pointer !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all var(--notes-transition-fast) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: var(--notes-spacing-xs) !important;
    text-align: center !important;
    font-family: inherit !important;
    outline: none !important;
}

.notes-module-btn.primary {
    background: var(--notes-primary) !important;
    color: var(--notes-text-white) !important;
}

.notes-module-btn.primary:hover {
    background: var(--notes-primary-dark) !important;
    transform: translateY(-1px) !important;
    box-shadow: var(--notes-shadow-light) !important;
}

.notes-module-btn.secondary {
    background: var(--notes-bg-input) !important;
    color: var(--notes-text-primary) !important;
    border: 1px solid var(--notes-border) !important;
}

.notes-module-btn.secondary:hover {
    background: var(--notes-border) !important;
    transform: translateY(-1px) !important;
}

.notes-module-btn.success {
    background: var(--notes-success) !important;
    color: var(--notes-text-white) !important;
}

.notes-module-btn.success:hover {
    background: #219A52 !important;
    transform: translateY(-1px) !important;
}

.notes-module-btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    transform: none !important;
}

/* Affichage des notes */
.notes-module-display {
    border-top: 1px solid var(--notes-border) !important;
    max-height: 300px !important;
    overflow-y: auto !important;
}

.notes-module-display-header {
    padding: var(--notes-spacing-lg) var(--notes-spacing-xl) !important;
    background: var(--notes-bg-overlay) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: var(--notes-text-primary) !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 1 !important;
    border-bottom: 1px solid var(--notes-border) !important;
}

.notes-module-display-header strong {
    color: var(--notes-primary) !important;
}

.notes-module-hide-btn {
    background: none !important;
    border: 1px solid var(--notes-border) !important;
    color: var(--notes-text-secondary) !important;
    padding: var(--notes-spacing-xs) var(--notes-spacing-sm) !important;
    border-radius: var(--notes-radius-sm) !important;
    cursor: pointer !important;
    font-size: 12px !important;
    transition: all var(--notes-transition-fast) !important;
}

.notes-module-hide-btn:hover {
    background: var(--notes-bg-input) !important;
    color: var(--notes-text-primary) !important;
}

.notes-module-content {
    padding: 0 !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
    color: var(--notes-text-primary) !important;
}

/* Notes individuelles */
.notes-module-note-item {
    padding: var(--notes-spacing-lg) var(--notes-spacing-xl) !important;
    border-bottom: 1px solid var(--notes-border-light) !important;
    background: var(--notes-bg-note) !important;
    transition: background var(--notes-transition-fast) !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
}

.notes-module-note-item:hover {
    background: rgba(74, 144, 226, 0.04) !important;
}

.notes-module-note-item:last-child {
    border-bottom: none !important;
}

/* Scrollbars */
.notes-module-display::-webkit-scrollbar {
    width: 6px !important;
}

.notes-module-display::-webkit-scrollbar-track {
    background: var(--notes-bg-overlay) !important;
}

.notes-module-display::-webkit-scrollbar-thumb {
    background: var(--notes-border) !important;
    border-radius: 3px !important;
}

.notes-module-display::-webkit-scrollbar-thumb:hover {
    background: var(--notes-primary) !important;
}

/* Responsive */
@media (max-width: 768px) {
    .notes-module-window {
        width: calc(100vw - 20px) !important;
        right: 10px !important;
        left: 10px !important;
        transform: translateY(-50%) translateX(0) scale(0.9) !important;
        opacity: 0 !important;
    }
    
    .notes-module-window:not(.notes-module-hidden) {
        transform: translateY(-50%) translateX(0) scale(1) !important;
        opacity: 1 !important;
    }
    
    .notes-module-toggle-btn {
        right: 15px !important;
    }
}

@media (max-width: 480px) {
    .notes-module-window {
        width: calc(100vw - 10px) !important;
        right: 5px !important;
        left: 5px !important;
        top: 10px !important;
        max-height: calc(100vh - 20px) !important;
        transform: translateY(-100%) !important;
    }
    
    .notes-module-window:not(.notes-module-hidden) {
        transform: translateY(0) !important;
    }
    
    .notes-module-toggle-btn {
        width: 48px !important;
        height: 48px !important;
        font-size: 20px !important;
        right: 10px !important;
    }
    
    .notes-module-header {
        padding: var(--notes-spacing-md) var(--notes-spacing-lg) !important;
    }
    
    .notes-module-input-section,
    .notes-module-actions {
        padding: var(--notes-spacing-lg) !important;
    }
    
    .notes-module-actions {
        flex-direction: column !important;
    }
    
    .notes-module-btn {
        min-width: auto !important;
        flex: none !important;
    }
}

/* Animations */
@keyframes notes-fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.notes-module-note-item {
    animation: notes-fade-in 0.3s ease !important;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

@media (prefers-contrast: high) {
    :root {
        --notes-border: #000000;
        --notes-text-muted: #444444;
    }
}

/* Protection contre conflits */
[id*="notes-module"] {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
}

#notes-module-toggle,
#notes-module-window,
.notes-module-toggle-btn,
.notes-module-window {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
    box-sizing: border-box !important;
}

/* Conteneur principal */
.notes-module-container {
    all: initial !important;
    position: fixed !important;
    z-index: 9997 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
}

.notes-module-container *,
.notes-module-container *::before,
.notes-module-container *::after {
    box-sizing: border-box !important;
    font-family: inherit !important;
}
        `;
    }

    function generateCSS() {
        // Intégrer le nouveau CSS version 2.0 directement
        return loadCSSv2();
        const config = NotesModule.config;
        const colors = config.colors;
        
        return `
        /* ========================================
           MODULE DE NOTES UNIVERSEL - STYLES
           ======================================== */
        
        /* Réinitialisation pour isolation */
        #notes-module-container,
        #notes-module-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        /* Bouton flottant adaptatif */
        .notes-module-toggle-btn {
            position: fixed;
            z-index: 999999;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, ${colors.primary}, ${lightenColor(colors.primary, 15)});
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            color: white;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        .notes-module-toggle-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
        }
        
        .notes-module-toggle-btn:active {
            transform: scale(0.95);
        }
        
        .notes-module-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: ${colors.success};
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 10px;
            border: 2px solid white;
            animation: pulse-badge 2s infinite;
        }
        
        @keyframes pulse-badge {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* Fenêtre principale */
        .notes-module-window {
            position: fixed;
            z-index: 999998;
            width: min(450px, calc(100vw - 30px));
            max-height: calc(100vh - 30px);
            background: ${colors.background};
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            color: ${colors.text};
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .notes-module-hidden {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-20px) scale(0.9);
        }
        
        /* En-tête */
        .notes-module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            background: linear-gradient(135deg, ${colors.primary}, ${lightenColor(colors.primary, 10)});
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-module-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 700;
            color: white;
            margin: 0;
        }
        
        .notes-module-version {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        
        .notes-module-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notes-module-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        /* Contexte */
        .notes-module-context {
            padding: 20px 25px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-module-context-item {
            font-size: 13px;
            margin-bottom: 8px;
            opacity: 0.9;
        }
        
        .notes-module-context-item:last-child {
            margin-bottom: 0;
        }
        
        .notes-module-context-item strong {
            color: ${colors.primary};
            margin-right: 8px;
        }
        
        .notes-module-shared {
            color: ${colors.success};
            font-weight: 700;
            font-size: 12px;
        }
        
        /* Zone de saisie */
        .notes-module-input-section {
            padding: 25px;
        }
        
        .notes-module-label {
            display: block;
            font-weight: 600;
            margin-bottom: 12px;
            color: ${colors.primary};
            font-size: 14px;
        }
        
        .notes-module-textarea {
            width: 100%;
            min-height: 120px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 15px;
            color: ${colors.text};
            font-family: inherit;
            font-size: 14px;
            line-height: 1.6;
            resize: vertical;
            transition: border-color 0.2s ease;
        }
        
        .notes-module-textarea:focus {
            outline: none;
            border-color: ${colors.primary};
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        .notes-module-textarea::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .notes-module-char-count {
            text-align: right;
            font-size: 12px;
            margin-top: 8px;
            opacity: 0.7;
        }
        
        /* Boutons d'action */
        .notes-module-actions {
            padding: 0 25px 25px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .notes-module-btn {
            flex: 1;
            min-width: 90px;
            padding: 12px 16px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            font-family: inherit;
        }
        
        .notes-module-btn:hover {
            transform: translateY(-2px);
        }
        
        .notes-module-btn:active {
            transform: translateY(0);
        }
        
        .notes-module-btn-primary {
            background: linear-gradient(135deg, ${colors.success}, ${lightenColor(colors.success, 10)});
            color: white;
        }
        
        .notes-module-btn-primary:hover {
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        }
        
        .notes-module-btn-secondary {
            background: linear-gradient(135deg, ${colors.primary}, ${lightenColor(colors.primary, 10)});
            color: white;
        }
        
        .notes-module-btn-secondary:hover {
            box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        }
        
        .notes-module-btn-info {
            background: linear-gradient(135deg, #17A2B8, #138496);
            color: white;
        }
        
        .notes-module-btn-info:hover {
            box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
        }
        
        .notes-module-btn-warning {
            background: rgba(255, 255, 255, 0.1);
            color: ${colors.text};
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notes-module-btn-warning:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Barre de statut */
        .notes-module-status-bar {
            padding: 15px 25px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
        }
        
        .notes-module-auto-refresh {
            color: ${colors.success};
            font-weight: 600;
        }
        
        /* Zone d'affichage */
        .notes-module-display {
            max-height: 400px;
            overflow-y: auto;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notes-module-display-header {
            padding: 20px 25px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: ${colors.primary};
            font-size: 14px;
            font-weight: 600;
        }
        
        .notes-module-hide-btn {
            background: none;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.7);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .notes-module-hide-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .notes-module-content {
            padding: 0 25px 25px;
            font-size: 13px;
            line-height: 1.6;
            white-space: pre-wrap;
            color: rgba(255, 255, 255, 0.9);
            max-height: 300px;
            overflow-y: auto;
        }
        
        /* Scrollbar personnalisée */
        .notes-module-content::-webkit-scrollbar {
            width: 6px;
        }
        
        .notes-module-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        .notes-module-content::-webkit-scrollbar-thumb {
            background: ${colors.primary};
            border-radius: 3px;
        }
        
        .notes-module-content::-webkit-scrollbar-thumb:hover {
            background: ${lightenColor(colors.primary, 20)};
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .notes-module-window {
                width: calc(100vw - 20px);
                max-height: calc(100vh - 20px);
            }
            
            .notes-module-toggle-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            
            .notes-module-badge {
                font-size: 8px;
                padding: 1px 4px;
            }
            
            .notes-module-actions {
                gap: 8px;
            }
            
            .notes-module-btn {
                min-width: 70px;
                padding: 10px 12px;
                font-size: 11px;
            }
        }
        
        @media (max-width: 480px) {
            .notes-module-header,
            .notes-module-context,
            .notes-module-input-section,
            .notes-module-actions,
            .notes-module-status-bar,
            .notes-module-display-header,
            .notes-module-content {
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .notes-module-textarea {
                min-height: 100px;
            }
        }
        
        /* Animations d'entrée */
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .notes-module-window:not(.notes-module-hidden) {
            animation: slideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        `;
    }
    
    // ========================================
    // POSITIONNEMENT ADAPTATIF
    // ========================================
    
    function applyPositioning() {
        const toggleBtn = NotesModule.elements.toggleBtn;
        const window = NotesModule.elements.window;
        const position = NotesModule.config.position;
        
        // Position du bouton flottant
        switch (position) {
            case 'top-right':
                toggleBtn.style.top = '20px';
                toggleBtn.style.right = '20px';
                window.style.top = '20px';
                window.style.right = '20px';
                break;
                
            case 'bottom-right':
                toggleBtn.style.bottom = '20px';
                toggleBtn.style.right = '20px';
                window.style.bottom = '20px';
                window.style.right = '20px';
                break;
                
            case 'center-left':
                toggleBtn.style.top = '50%';
                toggleBtn.style.left = '20px';
                toggleBtn.style.transform = 'translateY(-50%)';
                window.style.top = '20px';
                window.style.left = '20px';
                break;
                
            case 'center-right':
            default:
                toggleBtn.style.top = '50%';
                toggleBtn.style.right = '20px';
                toggleBtn.style.transform = 'translateY(-50%)';
                window.style.top = '20px';
                window.style.right = '20px';
                break;
        }
    }
    
    // ========================================
    // GESTION DES ÉVÉNEMENTS
    // ========================================
    
    function setupEventListeners() {
        const elements = NotesModule.elements;
        
        // Boutons principaux
        elements.toggleBtn.addEventListener('click', toggleWindow);
        elements.closeBtn.addEventListener('click', closeWindow);
        elements.saveBtn.addEventListener('click', saveNote);
        elements.viewBtn.addEventListener('click', toggleNotesDisplay);
        elements.refreshBtn.addEventListener('click', refreshNotes);
        elements.clearBtn.addEventListener('click', clearTextarea);
        
        // Masquer l'affichage
        document.getElementById('notes-module-hide-display').addEventListener('click', hideNotesDisplay);
        
        // Compteur de caractères
        elements.textarea.addEventListener('input', updateCharCount);
        
        // Raccourcis clavier
        setupKeyboardShortcuts();
        
        // Fermeture par échappement
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && NotesModule.state.isOpen) {
                closeWindow();
            }
        });
        
        // Clic en dehors pour fermer (optionnel)
        document.addEventListener('click', function(e) {
            if (NotesModule.state.isOpen && 
                !elements.window.contains(e.target) && 
                !elements.toggleBtn.contains(e.target)) {
                // closeWindow(); // Désactivé par défaut
            }
        });
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            const shortcuts = NotesModule.config.shortcuts;
            
            // Toggle window
            if (isShortcutPressed(e, shortcuts.toggle)) {
                e.preventDefault();
                toggleWindow();
            }
            
            // Save note
            if (isShortcutPressed(e, shortcuts.save) && NotesModule.state.isOpen) {
                e.preventDefault();
                saveNote();
            }
        });
    }
    
    function isShortcutPressed(event, shortcuts) {
        return shortcuts.some(shortcut => {
            const keys = shortcut.split('+');
            const hasCtrl = keys.includes('ctrl') && event.ctrlKey;
            const hasCmd = keys.includes('cmd') && event.metaKey;
            const hasShift = keys.includes('shift') && event.shiftKey;
            const hasAlt = keys.includes('alt') && event.altKey;
            const keyPressed = event.key.toLowerCase();
            const targetKey = keys[keys.length - 1];
            
            return (hasCtrl || hasCmd) && 
                   (!keys.includes('shift') || hasShift) &&
                   (!keys.includes('alt') || hasAlt) &&
                   keyPressed === targetKey;
        });
    }
    
    // ========================================
    // FONCTIONS DE L'INTERFACE
    // ========================================
    
    function toggleWindow() {
        if (NotesModule.state.isOpen) {
            closeWindow();
        } else {
            openWindow();
        }
    }
    
    function openWindow() {
        const elements = NotesModule.elements;
        
        elements.window.classList.remove('notes-module-hidden');
        NotesModule.state.isOpen = true;
        
        // Focus sur le textarea
        setTimeout(() => {
            elements.textarea.focus();
        }, 300);
        
        // Démarrer le refresh automatique
        startAutoRefresh();
        
        // Tester la connexion
        testServerConnection();
        
        console.log('📝 Module Notes ouvert');
    }
    
    function closeWindow() {
        const elements = NotesModule.elements;
        
        elements.window.classList.add('notes-module-hidden');
        elements.displayArea.classList.add('notes-module-hidden');
        NotesModule.state.isOpen = false;
        
        // Arrêter le refresh automatique
        stopAutoRefresh();
        
        console.log('📝 Module Notes fermé');
    }
    
    function updateCharCount() {
        const textarea = NotesModule.elements.textarea;
        const counter = document.getElementById('notes-module-char-count');
        const maxLength = NotesModule.config.maxNoteLength;
        
        const currentLength = textarea.value.length;
        counter.textContent = `${currentLength} / ${maxLength} caractères`;
        
        // Changer la couleur si limite approchée
        if (currentLength > maxLength * 0.9) {
            counter.style.color = NotesModule.config.colors.warning;
        } else if (currentLength === maxLength) {
            counter.style.color = NotesModule.config.colors.danger;
        } else {
            counter.style.color = '';
        }
        
        NotesModule.state.hasUnsavedChanges = currentLength > 0;
    }
    
    function clearTextarea() {
        const textarea = NotesModule.elements.textarea;
        
        if (textarea.value.trim()) {
            if (confirm('🗑️ Effacer le texte saisi ?')) {
                textarea.value = '';
                updateCharCount();
                textarea.focus();
            }
        } else {
            textarea.focus();
        }
    }
    
    // ========================================
    // COMMUNICATION SERVEUR
    // ========================================
    
    function saveNote() {
        const elements = NotesModule.elements;
        const textarea = elements.textarea;
        const saveBtn = elements.saveBtn;
        
        const contenu = textarea.value.trim();
        if (!contenu) {
            alert('⚠️ Veuillez écrire une note avant de sauvegarder.');
            textarea.focus();
            return;
        }
        
        // Interface de sauvegarde en cours
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '📤 Sauvegarde...';
        saveBtn.disabled = true;
        updateStatus('📤 Sauvegarde en cours...');
        
        // Préparer les données
        const formData = new FormData();
        formData.append('action', 'save');
        formData.append('urlComplete', getCurrentPageURL());
        formData.append('contenu', contenu);
        
        // Métadonnées
        const metadata = {
            titre: document.title,
            ...NotesModule.config.metadata.customFields
        };
        formData.append('metadonnes', JSON.stringify(metadata));
        
        // Requête AJAX
        fetch(NotesModule.config.apiPath, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Note sauvegardée:', data.data);
                
                // Succès
                saveBtn.textContent = '✅ Sauvegardé !';
                updateStatus(`✅ Sauvegardé: ${data.data.timestamp}`);
                
                // Vider le textarea
                textarea.value = '';
                updateCharCount();
                
                // Refresh des notes affichées si visibles
                if (!elements.displayArea.classList.contains('notes-module-hidden')) {
                    setTimeout(() => loadNotes(), 500);
                }
                
            } else {
                throw new Error(data.error || 'Erreur de sauvegarde inconnue');
            }
        })
        .catch(error => {
            console.error('❌ Erreur sauvegarde:', error);
            
            saveBtn.textContent = '❌ Erreur';
            updateStatus(`❌ Erreur: ${error.message}`);
            
            alert(`❌ Erreur de sauvegarde:\n${error.message}\n\nVérifiez votre connexion et réessayez.`);
        })
        .finally(() => {
            // Restaurer le bouton après 2 secondes
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
        });
    }
    
    function loadNotes() {
        const url = getCurrentPageURL();
        updateStatus('🔄 Chargement...');
        
        return fetch(`${NotesModule.config.apiPath}?action=load&urlComplete=${encodeURIComponent(url)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('📄 Notes chargées:', data.data);
                    updateStatus(`✅ ${data.data.nombreNotes || 0} note(s) chargée(s)`);
                    NotesModule.state.lastRefresh = new Date();
                    return data.data;
                } else {
                    throw new Error(data.error || 'Erreur de chargement');
                }
            })
            .catch(error => {
                console.error('❌ Erreur chargement:', error);
                updateStatus(`❌ Erreur: ${error.message}`);
                return { 
                    contenu: `❌ Erreur de connexion:\n${error.message}`, 
                    existe: false,
                    nombreNotes: 0
                };
            });
    }
    
    function toggleNotesDisplay() {
        const displayArea = NotesModule.elements.displayArea;
        const contentArea = NotesModule.elements.contentArea;
        
        if (displayArea.classList.contains('notes-module-hidden')) {
            displayArea.classList.remove('notes-module-hidden');
            contentArea.textContent = '🔄 Chargement des notes partagées...';
            
            loadNotes().then(data => {
                if (data.contenu && data.contenu.trim()) {
                    const infoHeader = data.existe 
                        ? `✅ ${data.nombreNotes} note(s) - Dernière modif: ${data.derniereModification}\n\n`
                        : '';
                    contentArea.textContent = infoHeader + data.contenu;
                } else {
                    contentArea.textContent = `📭 Aucune note partagée pour cette page.\n\nSoyez le premier à laisser une note !`;
                }
            });
            
        } else {
            displayArea.classList.add('notes-module-hidden');
        }
    }
    
    function hideNotesDisplay() {
        NotesModule.elements.displayArea.classList.add('notes-module-hidden');
    }
    
    function refreshNotes() {
        const refreshBtn = NotesModule.elements.refreshBtn;
        const originalText = refreshBtn.textContent;
        
        refreshBtn.textContent = '🔄';
        refreshBtn.disabled = true;
        
        // Tester la connexion
        testServerConnection();
        
        // Refresh des notes si affichées
        const displayArea = NotesModule.elements.displayArea;
        if (!displayArea.classList.contains('notes-module-hidden')) {
            loadNotes().then(data => {
                const contentArea = NotesModule.elements.contentArea;
                if (data.contenu && data.contenu.trim()) {
                    const infoHeader = data.existe 
                        ? `✅ ${data.nombreNotes} note(s) - MAJ: ${data.derniereModification}\n\n`
                        : '';
                    contentArea.textContent = infoHeader + data.contenu;
                    
                    // Flash visuel pour indiquer la mise à jour
                    displayArea.style.borderColor = NotesModule.config.colors.success;
                    setTimeout(() => {
                        displayArea.style.borderColor = '';
                    }, 1000);
                }
            });
        }
        
        setTimeout(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        }, 1000);
    }
    
    function testServerConnection() {
        fetch(`${NotesModule.config.apiPath}?action=stats`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateStatus(`🌐 Serveur OK - ${data.data.totalFichiers} fichier(s)`);
                } else {
                    updateStatus('⚠️ Serveur répond avec erreur');
                }
            })
            .catch(error => {
                updateStatus('❌ Pas de connexion serveur');
                console.warn('Test connexion échoué:', error);
            });
    }
    
    function updateStatus(message) {
        const statusElement = NotesModule.elements.statusText;
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    // ========================================
    // REFRESH AUTOMATIQUE
    // ========================================
    
    function startAutoRefresh() {
        if (NotesModule.state.refreshTimer) {
            clearInterval(NotesModule.state.refreshTimer);
        }
        
        NotesModule.state.refreshTimer = setInterval(() => {
            // Auto-refresh seulement si les notes sont affichées
            const displayArea = NotesModule.elements.displayArea;
            if (displayArea && !displayArea.classList.contains('notes-module-hidden')) {
                console.log('🔄 Auto-refresh des notes');
                
                const contentArea = NotesModule.elements.contentArea;
                const oldContent = contentArea.textContent;
                
                loadNotes().then(data => {
                    if (data.contenu && data.contenu !== oldContent) {
                        const infoHeader = data.existe 
                            ? `✅ ${data.nombreNotes} note(s) - MAJ: ${data.derniereModification}\n\n`
                            : '';
                        contentArea.textContent = infoHeader + data.contenu;
                        
                        // Flash visuel
                        displayArea.style.borderColor = NotesModule.config.colors.primary;
                        setTimeout(() => {
                            displayArea.style.borderColor = '';
                        }, 1000);
                    }
                });
            }
            
            // Test connexion périodique
            testServerConnection();
            
        }, NotesModule.config.refreshInterval);
        
        console.log(`🔄 Auto-refresh démarré (${NotesModule.config.refreshInterval / 1000}s)`);
    }
    
    function stopAutoRefresh() {
        if (NotesModule.state.refreshTimer) {
            clearInterval(NotesModule.state.refreshTimer);
            NotesModule.state.refreshTimer = null;
            console.log('⏹️ Auto-refresh arrêté');
        }
    }
    
    // ========================================
    // FONCTIONS UTILITAIRES
    // ========================================
    
    function getCurrentPageURL() {
        return window.location.href;
    }
    
    function generateFilenameFromURL(url) {
        // Cette fonction doit reproduire la logique PHP
        const urlParts = new URL(url);
        const domain = urlParts.hostname.replace(/[^a-zA-Z0-9.-]/g, '');
        const path = urlParts.pathname.replace(/^\/|\/$/g, '')
                                      .replace(/[^a-zA-Z0-9.\-\/]/g, '_')
                                      .replace(/\//g, '_')
                                      .replace(/\.html?$/, '');
        
        let filename = domain + '_' + path;
        filename = filename.replace(/_+/g, '_').replace(/^_|_$/g, '');
        
        if (filename.length > 200) {
            filename = filename.substring(0, 200) + '_tronque';
        }
        
        return filename + '.md';
    }
    
    function isColorDark(color) {
        if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
            return true; // Défaut sombre si pas de couleur détectée
        }
        
        // Conversion simplifiée pour détection de thème
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return true;
        
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        return brightness < 128;
    }
    
    function extractPrimaryColor() {
        // Essayer de détecter la couleur principale du site
        const selectors = ['a', 'button', '.btn', '.primary', '[class*="primary"]'];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const styles = window.getComputedStyle(element);
                const color = styles.color || styles.backgroundColor;
                if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                    return color;
                }
            }
        }
        
        return null;
    }
    
    function lightenColor(color, percent) {
        // Simplification pour éclaircir une couleur
        if (color.startsWith('#')) {
            // Hex to RGB
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            
            const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
            const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
            const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
            
            return `rgb(${newR}, ${newG}, ${newB})`;
        }
        
        return color; // Retourner tel quel si pas de conversion possible
    }
    
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }
    
    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    
    // ========================================
    // API PUBLIQUE DU MODULE
    // ========================================
    
    // Exposer l'API publique
    window.NotesModule = {
        version: NotesModule.version,
        config: NotesModule.config,
        state: NotesModule.state,
        
        // Méthodes publiques
        init: initModule,
        open: openWindow,
        close: closeWindow,
        toggle: toggleWindow,
        save: saveNote,
        load: loadNotes,
        refresh: refreshNotes,
        
        // Configuration dynamique
        setConfig: function(newConfig) {
            NotesModule.config = deepMerge(NotesModule.config, newConfig);
            if (NotesModule.initialized) {
                // Réappliquer les styles si déjà initialisé
                const stylesElement = document.getElementById('notes-module-styles');
                if (stylesElement) {
                    stylesElement.textContent = generateCSS();
                }
                applyPositioning();
            }
        },
        
        // Événements personnalisés
        on: function(eventName, callback) {
            document.addEventListener('notesModule' + eventName, callback);
        },
        
        emit: function(eventName, data) {
            const event = new CustomEvent('notesModule' + eventName, { detail: data });
            document.dispatchEvent(event);
        }
    };
    
    // ========================================
    // INITIALISATION CONDITIONNELLE
    // ========================================
    
    // Auto-initialisation si configuré
    if (NotesModule.config.autoInit) {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initModule);
        } else {
            // DOM déjà prêt, initialiser immédiatement
            setTimeout(initModule, 100);
        }
    }
    
})(window, document);