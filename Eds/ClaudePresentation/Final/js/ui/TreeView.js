/**
 * ====================================================================
 * ARBORESCENCE HIÉRARCHIQUE - MODULE UI
 * ====================================================================
 * 
 * Rôle : Interface de navigation hiérarchique type Gimp
 * Type : Tree Component - Structure navigable avec contrôles
 */

class TreeView {
    constructor() {
        // Conteneur DOM de l'arborescence
        this.container = document.getElementById('tree-panel');
        this.content = document.getElementById('tree-content');
        
        // État des éléments (visibilité, verrouillage)
        this.itemStates = new Map();

        this.init();
        console.log('TreeView initialisée');
    }

    /**
     * Initialise l'arborescence et ses contrôles.
     */
    init() {
        this.bindControls();
        this.setupDragAndDrop();
        this.render();
    }

    /**
     * Lie les contrôles de la barre d'outils de l'arborescence.
     */
    bindControls() {
        const expandAllBtn = document.getElementById('btn-expand-all');
        const collapseAllBtn = document.getElementById('btn-collapse-all');
        const showAllBtn = document.getElementById('btn-show-all');
        const unlockAllBtn = document.getElementById('btn-unlock-all');

        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => this.expandAll());
        }

        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => this.collapseAll());
        }

        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAll());
        }

        if (unlockAllBtn) {
            unlockAllBtn.addEventListener('click', () => this.unlockAll());
        }

        // Contrôles du panneau
        const collapseBtn = this.container?.querySelector('.btn-collapse');
        const closeBtn = this.container?.querySelector('.btn-close');

        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
    }

    /**
     * Configure le système de drag & drop pour réorganisation.
     */
    setupDragAndDrop() {
        // Implémentation drag & drop pour réorganiser les éléments
        console.log('Drag & drop configuré pour TreeView');
    }

    /**
     * Rendu de l'arborescence complète.
     */
    render() {
        if (!this.content) return;

        // Simulation d'une structure hiérarchique
        const treeStructure = this.getTreeStructure();
        this.content.innerHTML = this.renderTreeItems(treeStructure);

        // Liaison des événements après rendu
        this.bindItemEvents();
    }

    /**
     * Génère la structure de données de l'arborescence.
     */
    getTreeStructure() {
        return [
            {
                id: 'root',
                name: 'Projet Sans Titre',
                type: 'project',
                icon: '📄',
                expanded: true,
                visible: true,
                locked: false,
                children: [
                    {
                        id: 'widget_1',
                        name: 'Élément Universel 1',
                        type: 'element-universel',
                        icon: '🌟',
                        expanded: false,
                        visible: true,
                        locked: false,
                        children: []
                    },
                    {
                        id: 'widget_2',
                        name: 'Grille Composition 1',
                        type: 'grille-composition',
                        icon: '🏗️',
                        expanded: false,
                        visible: true,
                        locked: false,
                        children: [
                            {
                                id: 'element_1',
                                name: 'Élément 1',
                                type: 'element',
                                icon: '🔹',
                                expanded: false,
                                visible: true,
                                locked: false,
                                children: []
                            }
                        ]
                    }
                ]
            }
        ];
    }

    /**
     * Rendu récursif des éléments de l'arborescence.
     */
    renderTreeItems(items, level = 0) {
        return items.map(item => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = item.expanded;
            const indent = level * 20;

            return `
                <div class="tree-item" data-id="${item.id}" data-type="${item.type}">
                    <div class="tree-node" style="padding-left: ${indent}px">
                        ${hasChildren ? `
                            <button class="tree-expand ${isExpanded ? 'expanded' : ''}" 
                                    onclick="treeView.toggleExpand('${item.id}')">
                                ${isExpanded ? '▼' : '▶'}
                            </button>
                        ` : '<span class="tree-spacer"></span>'}
                        
                        <span class="tree-icon">${item.icon}</span>
                        <span class="tree-name editable" 
                              contenteditable="true"
                              onclick="event.stopPropagation()"
                              onblur="treeView.updateName('${item.id}', this.textContent)">${item.name}</span>
                        
                        <div class="tree-controls">
                            <button class="tree-btn ${item.visible ? 'active' : ''}" 
                                    title="Visibilité"
                                    onclick="treeView.toggleVisibility('${item.id}')">
                                ${item.visible ? '👁' : '🙈'}
                            </button>
                            <button class="tree-btn ${item.locked ? 'active' : ''}" 
                                    title="Verrouillage"
                                    onclick="treeView.toggleLock('${item.id}')">
                                ${item.locked ? '🔒' : '🔓'}
                            </button>
                        </div>
                    </div>
                    
                    ${hasChildren && isExpanded ? `
                        <div class="tree-children">
                            ${this.renderTreeItems(item.children, level + 1)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Lie les événements aux éléments de l'arborescence.
     */
    bindItemEvents() {
        const treeItems = this.content.querySelectorAll('.tree-item');
        
        treeItems.forEach(item => {
            const node = item.querySelector('.tree-node');
            
            node.addEventListener('click', (e) => {
                if (e.target.closest('.tree-controls') || e.target.closest('.tree-expand')) {
                    return; // Ignorer les clics sur les contrôles
                }
                
                this.selectItem(item.dataset.id);
            });
        });
    }

    /**
     * Sélectionne un élément dans l'arborescence.
     */
    selectItem(itemId) {
        // Désélection des autres éléments
        this.content.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Sélection du nouvel élément
        const selectedItem = this.content.querySelector(`[data-id="${itemId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            console.log('Élément sélectionné:', itemId);
            
            // Notification à l'éditeur principal
            this.onItemSelected(itemId);
        }
    }

    /**
     * Gestion de la sélection d'un élément.
     */
    onItemSelected(itemId) {
        // Mise à jour du panneau de propriétés
        if (window.propertyPanel && window.presentationEditor) {
            const widget = window.presentationEditor.findWidget(itemId);
            window.propertyPanel.showProperties(widget);
        }
    }

    /**
     * Bascule l'expansion d'un élément.
     */
    toggleExpand(itemId) {
        const item = this.content.querySelector(`[data-id="${itemId}"]`);
        if (item) {
            const expandBtn = item.querySelector('.tree-expand');
            const children = item.querySelector('.tree-children');
            
            if (expandBtn && children) {
                const isExpanded = expandBtn.classList.toggle('expanded');
                expandBtn.textContent = isExpanded ? '▼' : '▶';
                children.style.display = isExpanded ? 'block' : 'none';
            }
        }
    }

    /**
     * Bascule la visibilité d'un élément.
     */
    toggleVisibility(itemId) {
        const btn = this.content.querySelector(`[data-id="${itemId}"] .tree-btn[title="Visibilité"]`);
        if (btn) {
            const isVisible = btn.classList.toggle('active');
            btn.textContent = isVisible ? '👁' : '🙈';
            
            console.log(`Visibilité ${itemId}:`, isVisible ? 'visible' : 'masqué');
            
            // Notification à l'éditeur pour masquer/afficher l'élément
            this.onVisibilityChanged(itemId, isVisible);
        }
    }

    /**
     * Bascule le verrouillage d'un élément.
     */
    toggleLock(itemId) {
        const btn = this.content.querySelector(`[data-id="${itemId}"] .tree-btn[title="Verrouillage"]`);
        if (btn) {
            const isLocked = btn.classList.toggle('active');
            btn.textContent = isLocked ? '🔒' : '🔓';
            
            console.log(`Verrouillage ${itemId}:`, isLocked ? 'verrouillé' : 'déverrouillé');
            
            // Notification à l'éditeur pour verrouiller/déverrouiller
            this.onLockChanged(itemId, isLocked);
        }
    }

    /**
     * Met à jour le nom d'un élément.
     */
    updateName(itemId, newName) {
        console.log(`Renommage ${itemId}:`, newName);
        
        // Notification à l'éditeur pour mise à jour
        this.onNameChanged(itemId, newName);
    }

    /**
     * Actions globales de l'arborescence
     */
    
    expandAll() {
        console.log('Expansion de tous les éléments');
        const expandBtns = this.content.querySelectorAll('.tree-expand');
        expandBtns.forEach(btn => {
            btn.classList.add('expanded');
            btn.textContent = '▼';
            const item = btn.closest('.tree-item');
            const children = item?.querySelector('.tree-children');
            if (children) {
                children.style.display = 'block';
            }
        });
    }

    collapseAll() {
        console.log('Réduction de tous les éléments');
        const expandBtns = this.content.querySelectorAll('.tree-expand');
        expandBtns.forEach(btn => {
            btn.classList.remove('expanded');
            btn.textContent = '▶';
            const item = btn.closest('.tree-item');
            const children = item?.querySelector('.tree-children');
            if (children) {
                children.style.display = 'none';
            }
        });
    }

    showAll() {
        console.log('Affichage de tous les éléments');
        const visibilityBtns = this.content.querySelectorAll('.tree-btn[title="Visibilité"]');
        visibilityBtns.forEach(btn => {
            btn.classList.add('active');
            btn.textContent = '👁';
        });
    }

    unlockAll() {
        console.log('Déverrouillage de tous les éléments');
        const lockBtns = this.content.querySelectorAll('.tree-btn[title="Verrouillage"]');
        lockBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.textContent = '🔓';
        });
    }

    /**
     * Contrôles du panneau
     */
    
    toggleCollapse() {
        if (this.container) {
            this.container.classList.toggle('collapsed');
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Callbacks pour notifications à l'éditeur principal
     */
    
    onVisibilityChanged(itemId, isVisible) {
        // À implémenter avec l'éditeur principal
    }

    onLockChanged(itemId, isLocked) {
        // À implémenter avec l'éditeur principal  
    }

    onNameChanged(itemId, newName) {
        // À implémenter avec l'éditeur principal
    }
}

// Instance globale de l'arborescence
window.treeView = new TreeView();