# 🛠️ DOCUMENTATION DÉVELOPPEUR - ÉDITEUR WIDGETS ATOMIQUES

## 🎯 ARCHITECTURE TECHNIQUE FINALE

**Version Production** - Scripts classiques, namespace global, sans serveur

---

## 📋 VUE D'ENSEMBLE SYSTÈME

### **🏗️ Architecture Atomique**

```
🎯 Concept : UN widget universel pour tout (WidgetCanvas)
├── Mode Widget : Auto-resize intelligent selon contenu
├── Mode Présentation : Taille fixe pour édition (1200x800)
├── Récursif : Peut contenir d'autres WidgetCanvas
├── Édition inline : Double-clic → contenteditable
├── Support Markdown/HTML : Avec fallbacks robustes
└── Export standalone : HTML autonome optimisé
```

### **🌐 Namespace Global**

```javascript
window.WidgetEditor = {
    // Classes principales
    Editor,           // Chef d'orchestre
    WidgetCanvas,     // Widget universel atomique
    
    // Modules système
    Grid,             // Navigation zoom/pan
    DragDrop,         // Glisser-déposer
    Persistence,      // Sauvegarde/historique
    Sync,             // Synchronisation
    Viewer            // Export HTML
};
```

---

## 🧱 CLASSES PRINCIPALES

### **Editor.js** - Chef d'Orchestre

```javascript
class Editor {
    constructor() {
        this.state = {
            // Collections
            widgets: new Map(),           // Widgets actifs
            selectedWidget: null,         // Widget sélectionné
            
            // Modules système
            grid: null,                   // Instance Grid
            dragDrop: null,              // Instance DragDrop
            persistence: null,           // Instance Persistence
            sync: null,                  // Instance Sync
            viewer: null,                // Instance Viewer
            
            // Configuration
            projectName: 'Mon Projet',
            projectId: this.generateProjectId(),
            isInitialized: false
        };
    }
    
    // Méthodes principales
    async init()                         // Initialisation complète
    createWidget(type, x, y, options)   // Création widget
    selectWidget(widget)                 // Sélection widget
    deleteWidget(widgetId)              // Suppression widget
    saveState()                         // Sauvegarde état
    exportProject()                     // Export complet
}
```

### **WidgetCanvas.js** - Widget Universel Atomique

```javascript
class WidgetCanvas {
    constructor(editor, id, options = {}) {
        this.editor = editor;
        this.id = id;
        
        this.config = {
            // Contenu et mode
            content: 'Nouveau widget',   // Contenu Markdown/HTML
            mode: 'widget',              // 'widget' | 'presentation'
            isMarkdown: true,            // Support Markdown ON/OFF
            
            // Position et dimensions
            position: { x: 0, y: 0 },
            dimensions: {
                widget: { width: 300, height: 'auto' },
                presentation: { width: 1200, height: 800 }
            },
            
            // Styles personnalisables
            styles: {
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 16,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: '#1F2937'
                // ... 20+ propriétés CSS
            },
            
            // État widget
            isVisible: true,
            isLocked: false,
            zIndex: 1
        };
        
        this.elements = {};              // Références DOM
        this.children = new Map();       // Widgets enfants (récursif)
    }
    
    // Méthodes lifecycle
    render()                            // Création DOM
    updateContent()                     // Mise à jour contenu
    startInlineEditing()               // Édition inline
    applyStyles()                      // Application styles
    
    // Méthodes utilitaires
    getPosition()                      // Position actuelle
    setPosition(x, y)                 // Définir position
    getDimensions()                    // Dimensions actuelles
    exportToHTML()                     // Export HTML standalone
    exportConfig()                     // Export configuration
}
```

---

## ⚙️ MODULES SYSTÈME

### **Grid.js** - Navigation Grille Infinie

```javascript
class Grid {
    constructor(editor) {
        this.config = {
            gridSize: 20,               // Taille grille points
            snapToGrid: true,           // Accrochage activé
            snapSize: 10,               // Taille accrochage
            pan: { x: 0, y: 0 },       // Position vue
            zoom: 1.0,                  // Niveau zoom
            zoomMin: 0.25,             // Zoom minimum
            zoomMax: 4.0                // Zoom maximum
        };
    }
    
    // Navigation
    handleZoom(e)                      // Gestion molette souris
    startPan(e)                       // Début pan clic-milieu
    updatePan(e)                      // Mise à jour pan
    
    // Conversion coordonnées
    screenToGrid(screenX, screenY)    // Écran → Grille
    gridToScreen(gridX, gridY)        // Grille → Écran
    snapToGrid(x, y)                  // Accrochage grille
}
```

### **DragDrop.js** - Système Drag & Drop

```javascript
class DragDrop {
    // Types drag supportés
    dragTypes = {
        'widget-from-bank': 'Création depuis banque',
        'widget-reposition': 'Repositionnement widget'
    };
    
    // Méthodes principales
    setupWidgetBankDragDrop()         // Config drag depuis banque
    setupDropZones()                  // Config zones drop
    handleWidgetDragStart(e, item)    // Début drag widget
    handleDrop(e, dropZone)           // Gestion drop
    startWidgetRepositioning(e, widget) // Repositionnement
}
```

### **Persistence.js** - Sauvegarde & Historique

```javascript
class Persistence {
    constructor(editor) {
        this.maxHistorySize = 50;      // Limite historique
        this.autoSaveInterval = 5000;  // Auto-save 5s
        
        this.history = {
            states: [],                 // États sauvegardés
            currentIndex: -1           // Index actuel
        };
    }
    
    // Gestion état
    captureCurrentState()              // Capture état
    saveState()                        // Sauvegarde immédiate
    loadState()                        // Chargement état
    
    // Historique
    undo()                            // Ctrl+Z
    redo()                            // Ctrl+Y
    
    // Projets
    saveProject(projectName)          // Sauvegarde projet
    loadProject(projectName)          // Chargement projet
    listProjects()                    // Liste projets
}
```

---

## 🔧 PATTERNS & CONVENTIONS

### **Création Widget**

```javascript
// Pattern factory pour création widgets
function createWidget(type, x, y, options) {
    const widgetId = this.generateId();
    
    // Toujours WidgetCanvas (atomique)
    const widget = new window.WidgetEditor.WidgetCanvas(this, widgetId, {
        ...options,
        position: { x, y }
    });
    
    // Intégration système
    this.state.widgets.set(widgetId, widget);
    widget.render();
    
    return widget;
}
```

### **Gestion Événements**

```javascript
// Pattern événements avec cleanup automatique
addEventHandler(element, event, handler) {
    element.addEventListener(event, handler);
    
    // Auto-cleanup lors destruction
    if (!this.eventHandlers) this.eventHandlers = [];
    this.eventHandlers.push({ element, event, handler });
}

destroy() {
    // Cleanup automatique événements
    this.eventHandlers?.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
}
```

### **Styles Dynamiques**

```javascript
// Pattern styles CSS dynamiques
applyStyles() {
    const container = this.elements.container;
    const styles = this.config.styles;
    
    // Application directe propriétés CSS
    Object.entries(styles).forEach(([property, value]) => {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        container.style[cssProperty] = value;
    });
}
```

---

## 📦 EXTENSION SYSTÈME

### **Nouveau Widget (Futur)**

```javascript
// Modèle pour nouveau widget atomique
class WidgetImage extends WidgetCanvas {
    constructor(editor, id, options) {
        super(editor, id, {
            ...options,
            // Config spécifique image
            imageUrl: '',
            altText: '',
            fit: 'cover'
        });
    }
    
    // Override méthodes si nécessaire
    updateContent() {
        // Logique spécifique image
        super.updateContent();
    }
}

// Enregistrement dans factory
window.WidgetEditor.WidgetImage = WidgetImage;
```

### **Nouveau Module**

```javascript
// Pattern module système
class NewModule {
    constructor(editor) {
        this.editor = editor;
        this.config = {};
        this.state = { isInitialized: false };
    }
    
    async init() {
        // Initialisation
        this.state.isInitialized = true;
    }
    
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🔧 [${timestamp}] NewModule: ${message}`);
    }
}

// Enregistrement global
window.WidgetEditor.NewModule = NewModule;
```

---

## 🧪 DEBUGGING & MONITORING

### **Console Debug**

```javascript
// Tous modules loggent avec icônes
console.log('🔧 Editor: Message');     // Editor
console.log('🧱 WidgetCanvas: Message'); // Widget
console.log('🔲 Grid: Message');        // Grid
console.log('🖱️ DragDrop: Message');    // DragDrop
console.log('💾 Persistence: Message'); // Persistence
```

### **État Global**

```javascript
// Accès état complet depuis console
console.log(window.editor.getState());

// Inspection widgets
window.editor.getWidgets().forEach((widget, id) => {
    console.log(`Widget ${id}:`, widget.exportConfig());
});
```

### **Performance Monitoring**

```javascript
// Mesures performance intégrées
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Performance: ${Math.round(loadTime)}ms`);
});
```

---

## 🔒 SÉCURITÉ

### **Sanitization HTML**

```javascript
// DOMPurify automatique avec fallback
function sanitizeHTML(html) {
    if (window.DOMPurify) {
        return DOMPurify.sanitize(html);
    }
    // Fallback basique si DOMPurify absent
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
```

### **Validation Input**

```javascript
// Validation systématique entrées
function validateWidgetConfig(config) {
    return {
        content: String(config.content || '').substring(0, 10000),
        position: {
            x: Math.max(-10000, Math.min(10000, Number(config.position?.x) || 0)),
            y: Math.max(-10000, Math.min(10000, Number(config.position?.y) || 0))
        }
        // ... autres validations
    };
}
```

---

## 🚀 DÉPLOIEMENT

### **Build Process**

**Aucun build requis !**
- Scripts classiques directement utilisables
- Pas de transpilation nécessaire
- Pas de bundling requis

### **Optimisations Production**

```html
<!-- Compression Gzip serveur recommandée -->
<!-- Cache headers pour CDN -->
<!-- Minification optionnelle -->
```

---

## 📚 RESSOURCES

### **Structure Fichiers**
```
📂 js/
├── 📂 widgets/
│   └── WidgetCanvas.js     // 1500 lignes - Widget universel
├── 📂 core/
│   ├── Editor.js           // 1400 lignes - Chef orchestre
│   ├── Grid.js             // 500 lignes - Navigation
│   ├── DragDrop.js         // 600 lignes - Interactions
│   ├── Persistence.js      // 800 lignes - Sauvegarde
│   ├── Sync.js             // 450 lignes - Synchronisation
│   └── Viewer.js           // 950 lignes - Export HTML
└── 📂 libs/               // CDN locaux (optionnel)
```

### **Métriques Code**
- **Total :** ~6200 lignes JavaScript
- **Modularité :** 7 classes principales
- **Cohésion :** Namespace unifié
- **Performance :** Chargement < 3s
- **Maintenabilité :** Comments français ELI10

**🎊 ARCHITECTURE PRODUCTION-READY DOCUMENTÉE**