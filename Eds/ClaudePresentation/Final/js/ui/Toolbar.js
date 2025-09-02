/**
 * ====================================================================
 * BARRE D'OUTILS PRINCIPALE - MODULE UI
 * ====================================================================
 * 
 * Rôle : Gestionnaire des actions de la barre d'outils principale
 * Type : UI Controller - Interface des actions globales
 */

class Toolbar {
    constructor() {
        this.init();
        console.log('Toolbar initialisée');
    }

    /**
     * Initialise les gestionnaires d'événements de la barre d'outils.
     */
    init() {
        this.bindProjectControls();
        this.bindHistoryControls();
        this.bindSyncControls();
        this.bindExportControls();
        this.bindGridControls();
    }

    /**
     * Lie les contrôles de gestion de projet.
     */
    bindProjectControls() {
        const newBtn = document.getElementById('btn-nouveau-projet');
        const openBtn = document.getElementById('btn-ouvrir-projet');
        const saveBtn = document.getElementById('btn-sauvegarder');

        if (newBtn) {
            newBtn.addEventListener('click', () => this.newProject());
        }

        if (openBtn) {
            openBtn.addEventListener('click', () => this.openProject());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProject());
        }
    }

    /**
     * Lie les contrôles d'historique (undo/redo).
     */
    bindHistoryControls() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }
    }

    /**
     * Lie les contrôles de synchronisation.
     */
    bindSyncControls() {
        const syncBtn = document.getElementById('btn-sync-viewer');
        const viewerBtn = document.getElementById('btn-open-viewer');

        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.toggleSync());
        }

        if (viewerBtn) {
            viewerBtn.addEventListener('click', () => this.openViewer());
        }
    }

    /**
     * Lie les contrôles d'export.
     */
    bindExportControls() {
        const exportBtn = document.getElementById('btn-export-zip');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportZip());
        }
    }

    /**
     * Lie les contrôles de grille.
     */
    bindGridControls() {
        const gridSnapBtn = document.getElementById('btn-grid-snap');
        const gridVisibleBtn = document.getElementById('btn-grid-visible');
        const zoomButtons = document.querySelectorAll('[id^="btn-zoom"]');

        if (gridSnapBtn) {
            gridSnapBtn.addEventListener('click', () => this.toggleGridSnap());
        }

        if (gridVisibleBtn) {
            gridVisibleBtn.addEventListener('click', () => this.toggleGridVisible());
        }

        zoomButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('button').id.replace('btn-zoom-', '');
                this.handleZoom(action);
            });
        });
    }

    /**
     * Actions de la barre d'outils
     */
    
    newProject() {
        if (window.presentationEditor) {
            window.presentationEditor.newProject();
        }
    }

    openProject() {
        // Simulation d'ouverture de fichier
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('Ouverture du projet:', file.name);
                // Implémentation de chargement à ajouter
            }
        };
        input.click();
    }

    saveProject() {
        if (window.presentationEditor) {
            window.presentationEditor.saveProject();
        }
    }

    undo() {
        console.log('Annuler dernière action');
        // Implémentation undo à ajouter
        this.updateHistoryButtons();
    }

    redo() {
        console.log('Refaire dernière action annulée');
        // Implémentation redo à ajouter
        this.updateHistoryButtons();
    }

    toggleSync() {
        console.log('Basculer synchronisation viewer');
        const syncBtn = document.getElementById('btn-sync-viewer');
        const status = document.getElementById('sync-status');
        
        if (syncBtn && status) {
            const isActive = syncBtn.classList.toggle('active');
            status.textContent = isActive ? '🟢' : '🔴';
        }
    }

    openViewer() {
        console.log('Ouverture viewer externe');
        // Ouvrir le viewer en nouvelle fenêtre
        window.open('viewer.html', '_blank', 'width=1200,height=800');
    }

    exportZip() {
        console.log('Export ZIP complet');
        if (window.presentationEditor) {
            window.presentationEditor.exportProject();
        }
    }

    toggleGridSnap() {
        const btn = document.getElementById('btn-grid-snap');
        if (btn) {
            const isActive = btn.classList.toggle('active');
            console.log('Magnétisme grille:', isActive ? 'activé' : 'désactivé');
        }
    }

    toggleGridVisible() {
        const btn = document.getElementById('btn-grid-visible');
        if (btn) {
            const isActive = btn.classList.toggle('active');
            const gridOverlay = document.getElementById('grid-overlay');
            if (gridOverlay) {
                gridOverlay.style.display = isActive ? 'block' : 'none';
            }
            console.log('Grille visible:', isActive ? 'oui' : 'non');
        }
    }

    handleZoom(action) {
        console.log('Action zoom:', action);
        
        switch (action) {
            case 'fit':
                this.zoomToFit();
                break;
            case 'out':
                this.zoomOut();
                break;
            case 'in':
                this.zoomIn();
                break;
        }
    }

    zoomToFit() {
        console.log('Ajuster zoom au contenu');
        this.updateZoomDisplay('100%');
    }

    zoomOut() {
        console.log('Dézoomer');
        // Implémentation dézoomer
        this.updateZoomDisplay('75%');
    }

    zoomIn() {
        console.log('Zoomer');
        // Implémentation zoomer
        this.updateZoomDisplay('125%');
    }

    updateZoomDisplay(level) {
        const zoomDisplay = document.getElementById('zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = `Zoom: ${level}`;
        }
    }

    updateHistoryButtons() {
        // Mise à jour de l'état des boutons undo/redo
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');
        const counter = document.getElementById('history-counter');

        if (counter) {
            counter.textContent = '1/100'; // Simulation
        }
    }
}

// Instance globale de la barre d'outils
window.toolbar = new Toolbar();