/**
 * ====================================================================
 * BANQUE DE WIDGETS - MODULE UI
 * ====================================================================
 * 
 * Rôle : Gestionnaire de la bibliothèque de widgets disponibles
 * Type : UI Component - Panneau latéral avec drag & drop
 */

class WidgetBank {
    constructor() {
        // Conteneur DOM de la banque de widgets
        this.container = document.getElementById('widget-bank-panel');
        
        // Catalogue des widgets disponibles
        this.widgets = [
            {
                id: 'element-universel',
                name: 'Élément Universel',
                description: 'Image + 3 textes modulaires',
                icon: '🌟',
                category: 'universel',
                usage: 'Remplace: Logo, Texte, Hero'
            },
            {
                id: 'grille-composition',
                name: 'Grille Composition',
                description: 'Générateur tableaux N×M',
                icon: '🏗️',
                category: 'universel',
                usage: '3 modes : Col/Ligne/Grille 2D'
            }
        ];

        this.init();
    }

    /**
     * Initialise la banque de widgets.
     */
    init() {
        this.setupSearch();
        this.setupFilters();
        this.setupDragAndDrop();
        this.render();
        
        console.log('WidgetBank initialisée');
    }

    /**
     * Configuration de la recherche de widgets.
     */
    setupSearch() {
        const searchInput = document.getElementById('widget-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterWidgets(e.target.value);
            });
        }
    }

    /**
     * Configuration des filtres par catégorie.
     */
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Mise à jour de l'état actif
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Application du filtre
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            });
        });
    }

    /**
     * Configuration du système drag & drop.
     */
    setupDragAndDrop() {
        // Les événements de drag seront gérés dynamiquement
        // lors du rendu des éléments
    }

    /**
     * Rendu de la banque de widgets.
     */
    render() {
        const widgetList = document.querySelector('.widget-list');
        if (!widgetList) return;

        widgetList.innerHTML = this.widgets.map(widget => `
            <div class="widget-item" 
                 data-widget-type="${widget.id}" 
                 draggable="true"
                 title="${widget.description}">
                <div class="widget-icon">${widget.icon}</div>
                <div class="widget-info">
                    <div class="widget-name">${widget.name}</div>
                    <div class="widget-desc">${widget.description}</div>
                    <div class="widget-usage">${widget.usage}</div>
                </div>
            </div>
        `).join('');

        // Liaison des événements drag & drop
        this.bindDragEvents();
    }

    /**
     * Lie les événements de drag & drop aux widgets.
     */
    bindDragEvents() {
        const widgetItems = document.querySelectorAll('.widget-item');
        widgetItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const widgetType = e.target.closest('.widget-item').dataset.widgetType;
                e.dataTransfer.setData('text/plain', widgetType);
                e.target.classList.add('dragging');
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
    }

    /**
     * Filtre les widgets selon le texte de recherche.
     */
    filterWidgets(searchText) {
        const items = document.querySelectorAll('.widget-item');
        const text = searchText.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.widget-name').textContent.toLowerCase();
            const desc = item.querySelector('.widget-desc').textContent.toLowerCase();
            const usage = item.querySelector('.widget-usage').textContent.toLowerCase();

            const matches = name.includes(text) || 
                          desc.includes(text) || 
                          usage.includes(text);

            item.style.display = matches ? 'flex' : 'none';
        });
    }

    /**
     * Applique un filtre par catégorie.
     */
    applyFilter(filter) {
        const items = document.querySelectorAll('.widget-item');

        items.forEach(item => {
            const widgetId = item.dataset.widgetType;
            const widget = this.widgets.find(w => w.id === widgetId);

            if (filter === 'all' || widget.category === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Ajoute un widget à la zone d'édition.
     */
    addWidget(widgetType) {
        console.log('Ajout widget:', widgetType);
        
        // Création de l'instance selon le type
        let widget;
        switch (widgetType) {
            case 'element-universel':
                widget = new ElementUniversel();
                break;
            case 'grille-composition':
                widget = new GrilleComposition();
                break;
            default:
                console.warn('Type de widget inconnu:', widgetType);
                return;
        }

        // Ajout à l'éditeur principal
        if (window.presentationEditor) {
            window.presentationEditor.addWidget(widget);
        }
    }
}

// Instance globale de la banque de widgets
window.widgetBank = new WidgetBank();