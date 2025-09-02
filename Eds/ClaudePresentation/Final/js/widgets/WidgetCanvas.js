/**
 * 🎨 WIDGETCANVAS - WIDGET UNIVERSEL ATOMIQUE
 * 
 * Rôle : Widget universel pour tout type de contenu (texte, images, éléments)
 * Type : Classe héritant de BaseWidget avec polyvalence maximale  
 * Unité : Widget = conteneur universel éditable et composable
 * Domaine : Contenu mixte avec support Markdown, HTML et éléments enfants
 * Formule : BaseWidget + UniversalContent + ChildWidgets = WidgetCanvas complet
 * Exemple : Canvas contenant texte + images + sous-widgets assemblés
 */

// Vérification de la disponibilité de BaseWidget
if (typeof window.WidgetEditor === 'undefined' || !window.WidgetEditor.BaseWidget) {
    throw new Error('WidgetCanvas nécessite BaseWidget - Chargez BaseWidget.js en premier');
}

// Références aux librairies externes chargées via CDN
const markedLib = window.marked;
const DOMPurifyLib = window.DOMPurify;

/**
 * Classe WidgetCanvas - Widget universel héritant de BaseWidget
 * Conteneur polyvalent pour tout type de contenu avec capacité d'imbrication
 */
window.WidgetEditor.WidgetCanvas = class WidgetCanvas extends window.WidgetEditor.BaseWidget {
    /**
     * Constructeur WidgetCanvas universel
     * 
     * Rôle : Initialisation widget universel avec contenu mixte
     * Type : Constructeur enfant avec super() + configuration universelle
     * Unité : Instance WidgetCanvas polyvalente
     * Domaine : Options universelles (contenu, dimensions, enfants)
     * Formule : super(editor, id, options) + canvasConfig = WidgetCanvas
     * Exemple : new WidgetCanvas(editor, "canvas_1", {content: "# Titre", width: 400})
     * 
     * @param {Object} editor - Référence vers l'éditeur principal
     * @param {string} widgetId - Identifiant unique du widget
     * @param {Object} options - Options universelles du canvas
     */
    constructor(editor, widgetId, options = {}) {
        // === APPEL CONSTRUCTEUR PARENT ===
        super(editor, widgetId, options);
        
        // === CONFIGURATION SPÉCIFIQUE CANVAS ===
        this.canvasConfig = {
            // Contenu universel (Markdown/HTML/texte)
            content: options.content || '',
            isMarkdown: options.isMarkdown !== false,
            
            // Widgets enfants contenus dans ce canvas
            children: new Map(),
            
            // Mode layout pour enfants
            layoutMode: options.layoutMode || 'free',
            
            // Styles typographiques pour contenu textuel
            textStyles: {
                fontFamily: options.fontFamily || 'Inter, sans-serif',
                fontSize: options.fontSize || 16,
                fontWeight: options.fontWeight || 400,
                color: options.color || '#0F172A',
                textAlign: options.textAlign || 'left',
                lineHeight: options.lineHeight || 1.6
            }
        };
        
        // État d'édition
        this.editingState = {
            originalContent: '',
            isContentEditable: false,
            selectedChild: null
        };
        
        // Conteneur DOM pour widgets enfants
        this.childrenContainer = null;
        
        console.log(`[WidgetCanvas] Widget canvas créé: ${this.id}`);
    }
    
    /**
     * Initialisation du contenu universel (Surcharge BaseWidget)
     */
    initializeContent() {
        this.createCanvasStructure();
        this.updateCanvasContent();
        this.applyCanvasStyles();
        this.renderChildren();
    }
    
    /**
     * Création de la structure DOM du canvas
     */
    createCanvasStructure() {
        // Conteneur pour widgets enfants
        this.childrenContainer = document.createElement('div');
        this.childrenContainer.className = 'canvas-children';
        this.childrenContainer.style.position = 'relative';
        this.childrenContainer.style.width = '100%';
        this.childrenContainer.style.minHeight = '0';
        this.childrenContainer.style.zIndex = '2';
        
        // Ajout au container principal
        this.elements.container.appendChild(this.childrenContainer);
        
        // Configuration drag & drop pour enfants
        this.setupChildrenDropZone();
    }
    
    /**
     * Configuration zone de drop pour widgets enfants
     */
    setupChildrenDropZone() {
        const container = this.elements.container;
        
        // Drag over
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.add('drop-target');
        });
        
        // Drag leave
        container.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            container.classList.remove('drop-target');
        });
        
        // Drop
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.remove('drop-target');
            
            const widgetType = e.dataTransfer.getData('text/widget-type');
            if (widgetType) {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addChildWidget(widgetType, x, y);
            }
        });
    }
    
    /**
     * Mise à jour du contenu avec rendu Markdown/HTML
     */
    updateCanvasContent() {
        const contentArea = this.elements.contentArea;
        
        // Contenu vide
        if (!this.canvasConfig.content || this.canvasConfig.content.trim() === '') {
            contentArea.innerHTML = '<p style="color: #9ca3af; font-style: italic;">Canvas vide - Double-cliquez pour éditer</p>';
            return;
        }
        
        if (this.canvasConfig.isMarkdown) {
            // Parsing Markdown
            try {
                let processedHTML = '';
                
                if (typeof markedLib !== 'undefined' && markedLib.parse) {
                    processedHTML = markedLib.parse(this.canvasConfig.content);
                } else {
                    // Fallback Markdown basique
                    processedHTML = this.canvasConfig.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/> (.*$)/gm, '<blockquote>$1</blockquote>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n/g, '<br>');
                    
                    if (!processedHTML.match(/^<[^>]+>/)) {
                        processedHTML = `<p>${processedHTML}</p>`;
                    }
                }
                
                // Nettoyage sécurisé
                let safeHTML = processedHTML;
                if (typeof DOMPurifyLib !== 'undefined' && DOMPurifyLib.sanitize) {
                    safeHTML = DOMPurifyLib.sanitize(processedHTML, {
                        ALLOWED_TAGS: [
                            'p', 'br', 'strong', 'em', 'u', 'i', 'b',
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'ul', 'ol', 'li', 'blockquote', 
                            'a', 'code', 'pre', 'span', 'div'
                        ],
                        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'style', 'title']
                    });
                }
                
                contentArea.innerHTML = safeHTML;
                
            } catch (error) {
                console.error('[WidgetCanvas] Erreur rendu Markdown:', error);
                contentArea.innerHTML = `
                    <p style="color: #ef4444; background: #fef2f2; padding: 8px; border-radius: 4px;">
                        ❌ Erreur rendu contenu
                    </p>
                `;
            }
        } else {
            // HTML/Texte direct
            let safeContent = this.canvasConfig.content;
            if (typeof DOMPurifyLib !== 'undefined' && DOMPurifyLib.sanitize) {
                safeContent = DOMPurifyLib.sanitize(this.canvasConfig.content);
            }
            contentArea.innerHTML = safeContent;
        }
        
        this.autoResize();
    }
    
    /**
     * Application des styles typographiques
     */
    applyCanvasStyles() {
        const contentArea = this.elements.contentArea;
        const styles = this.canvasConfig.textStyles;
        
        contentArea.style.fontFamily = styles.fontFamily;
        contentArea.style.fontSize = `${styles.fontSize}px`;
        contentArea.style.fontWeight = styles.fontWeight;
        contentArea.style.color = styles.color;
        contentArea.style.textAlign = styles.textAlign;
        contentArea.style.lineHeight = styles.lineHeight;
        contentArea.style.wordWrap = 'break-word';
        contentArea.style.overflowWrap = 'break-word';
    }
    
    /**
     * Auto-redimensionnement selon contenu + enfants
     */
    autoResize() {
        if (this.config.dimensions.height !== 'auto') return;
        
        const container = this.elements.container;
        const contentArea = this.elements.contentArea;
        
        // Hauteur contenu
        const contentHeight = contentArea.scrollHeight;
        const paddingTotal = this.config.styles.padding * 2;
        
        // Hauteur enfants
        let maxChildBottom = 0;
        this.canvasConfig.children.forEach(child => {
            if (child.elements && child.elements.container) {
                const childRect = child.elements.container.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const childRelativeBottom = (childRect.bottom - containerRect.top) + 20;
                maxChildBottom = Math.max(maxChildBottom, childRelativeBottom);
            }
        });
        
        // Hauteur finale
        const finalHeight = Math.max(
            contentHeight + paddingTotal,
            maxChildBottom,
            this.config.dimensions.minHeight
        );
        
        container.style.height = `${finalHeight}px`;
        this.config.dimensions.height = finalHeight;
    }
    
    /**
     * Rendu des widgets enfants
     */
    renderChildren() {
        if (!this.childrenContainer) return;
        
        this.childrenContainer.innerHTML = '';
        
        this.canvasConfig.children.forEach(child => {
            child.render(this.childrenContainer);
        });
        
        this.autoResize();
    }
    
    /**
     * Ajout d'un widget enfant
     */
    addChildWidget(widgetType, x, y) {
        try {
            const childId = this.generateChildId();
            
            const childOptions = {
                x: x,
                y: y,
                width: 200,
                content: `Widget enfant ${this.canvasConfig.children.size + 1}`
            };
            
            // Factory pour widget enfant
            let childWidget = null;
            switch (widgetType.toLowerCase()) {
                case 'canvas':
                case 'widgetcanvas':
                default:
                    childWidget = new window.WidgetEditor.WidgetCanvas(
                        this.editor, 
                        childId, 
                        childOptions
                    );
            }
            
            if (!childWidget) return;
            
            // Intégration
            this.canvasConfig.children.set(childId, childWidget);
            childWidget.render(this.childrenContainer);
            
            this.autoResize();
            this.notifyChange();
            
            return childWidget;
            
        } catch (error) {
            console.error('[WidgetCanvas] Erreur ajout widget enfant:', error);
        }
    }
    
    /**
     * Suppression widget enfant
     */
    removeChildWidget(childId) {
        const child = this.canvasConfig.children.get(childId);
        if (!child) return;
        
        child.destroy();
        this.canvasConfig.children.delete(childId);
        this.autoResize();
        this.notifyChange();
    }
    
    /**
     * Démarrage édition inline (Surcharge BaseWidget)
     */
    startEditing() {
        if (this.config.isLocked || this.config.isEditing) return;
        
        const contentArea = this.elements.contentArea;
        
        // Sauvegarde état initial
        this.editingState.originalContent = this.canvasConfig.content;
        this.config.isEditing = true;
        
        // Activation édition
        contentArea.contentEditable = true;
        contentArea.style.outline = '2px solid #10b981';
        contentArea.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
        contentArea.style.borderRadius = '4px';
        
        // Contenu brut pour édition
        contentArea.innerText = this.canvasConfig.content;
        contentArea.focus();
        
        // Sélection totale
        const range = document.createRange();
        range.selectNodeContents(contentArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Événements édition
        const finishEditing = () => this.finishEditing();
        const cancelEditing = () => this.cancelEditing();
        
        this.addEventHandler(contentArea, 'blur', finishEditing);
        this.addEventHandler(contentArea, 'keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditing();
            }
        });
        
        this.addEventHandler(contentArea, 'input', () => {
            this.autoResize();
        });
    }
    
    /**
     * Finalisation édition
     */
    finishEditing() {
        if (!this.config.isEditing) return;
        
        const contentArea = this.elements.contentArea;
        const newContent = contentArea.innerText.trim();
        
        if (newContent !== this.editingState.originalContent) {
            this.canvasConfig.content = newContent;
            this.notifyChange();
        }
        
        this.exitEditingMode();
        this.updateCanvasContent();
        this.applyCanvasStyles();
    }
    
    /**
     * Annulation édition
     */
    cancelEditing() {
        if (!this.config.isEditing) return;
        
        this.canvasConfig.content = this.editingState.originalContent;
        this.exitEditingMode();
        this.updateCanvasContent();
        this.applyCanvasStyles();
    }
    
    /**
     * Sortie mode édition
     */
    exitEditingMode() {
        const contentArea = this.elements.contentArea;
        
        contentArea.contentEditable = false;
        contentArea.style.outline = 'none';
        contentArea.style.backgroundColor = 'transparent';
        
        this.config.isEditing = false;
        this.editingState.originalContent = '';
        
        this.removeEventHandlers(contentArea, ['blur', 'keydown', 'input']);
    }
    
    // === INTERFACE PUBLIQUE ===
    
    setContent(content) {
        this.canvasConfig.content = content || '';
        this.updateCanvasContent();
        this.notifyChange();
    }
    
    setMarkdownMode(isMarkdown) {
        this.canvasConfig.isMarkdown = isMarkdown;
        this.updateCanvasContent();
        this.notifyChange();
    }
    
    setTextStyle(property, value) {
        if (this.canvasConfig.textStyles.hasOwnProperty(property)) {
            this.canvasConfig.textStyles[property] = value;
            this.applyCanvasStyles();
            this.autoResize();
            this.notifyChange();
        }
    }
    
    // === SURCHARGES BASEWIDGET ===
    
    getType() {
        return 'canvas';
    }
    
    getName() {
        const content = this.canvasConfig.content || 'Canvas vide';
        let name = content.replace(/[#*_`\[\]]/g, '').trim();
        if (name.length > 30) {
            name = name.substring(0, 30) + '...';
        }
        
        const childCount = this.canvasConfig.children.size;
        if (childCount > 0) {
            name += ` (${childCount} enfant${childCount > 1 ? 's' : ''})`;
        }
        
        return name || 'WidgetCanvas';
    }
    
    getIcon() {
        if (this.canvasConfig.children.size > 0) {
            return 'fa-layer-group';
        } else if (this.canvasConfig.content && this.canvasConfig.content.startsWith('#')) {
            return 'fa-heading';
        } else {
            return 'fa-square';
        }
    }
    
    /**
     * Export HTML standalone
     */
    exportToHTML() {
        const dimensions = this.config.dimensions;
        const styles = this.config.styles;
        const textStyles = this.canvasConfig.textStyles;
        
        // Contenu HTML
        let contentHtml = '';
        if (this.canvasConfig.isMarkdown && this.canvasConfig.content) {
            if (typeof markedLib !== 'undefined' && markedLib.parse) {
                const rawHtml = markedLib.parse(this.canvasConfig.content);
                contentHtml = (typeof DOMPurifyLib !== 'undefined') ? 
                    DOMPurifyLib.sanitize(rawHtml) : rawHtml;
            }
        } else {
            contentHtml = (typeof DOMPurifyLib !== 'undefined') ? 
                DOMPurifyLib.sanitize(this.canvasConfig.content) : this.canvasConfig.content;
        }
        
        // Enfants HTML
        let childrenHtml = '';
        this.canvasConfig.children.forEach(child => {
            childrenHtml += child.exportToHTML();
        });
        
        // Styles CSS
        const cssStyles = `
            width: ${dimensions.width}px;
            height: ${dimensions.height === 'auto' ? 'auto' : dimensions.height + 'px'};
            position: relative;
            background-color: ${styles.backgroundColor};
            border: ${styles.borderWidth}px ${styles.borderStyle} ${styles.borderColor};
            border-radius: ${styles.borderRadius}px;
            padding: ${styles.padding}px;
            font-family: ${textStyles.fontFamily};
            font-size: ${textStyles.fontSize}px;
            font-weight: ${textStyles.fontWeight};
            color: ${textStyles.color};
            text-align: ${textStyles.textAlign};
            line-height: ${textStyles.lineHeight};
        `;
        
        return `<div class="widget-canvas-export" style="${cssStyles}">
            <div class="canvas-content">${contentHtml}</div>
            <div class="canvas-children">${childrenHtml}</div>
        </div>`;
    }
    
    // === UTILITAIRES ===
    
    generateChildId() {
        return `${this.id}_child_${this.canvasConfig.children.size + 1}_${Date.now()}`;
    }
    
    removeEventHandlers(element, events) {
        events.forEach(event => {
            const key = `${element.className || 'element'}-${event}`;
            const handlers = this.eventHandlers.get(key) || [];
            
            handlers.forEach(({ handler }) => {
                element.removeEventListener(event, handler);
            });
            
            this.eventHandlers.delete(key);
        });
    }
    
    destroy() {
        // Destruction enfants
        this.canvasConfig.children.forEach(child => child.destroy());
        this.canvasConfig.children.clear();
        
        // Nettoyage parent
        super.destroy();
    }
};

// Compatibilité globale
window.WidgetCanvas = window.WidgetEditor.WidgetCanvas;