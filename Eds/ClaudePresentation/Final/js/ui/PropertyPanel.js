/**
 * ====================================================================
 * PANNEAU DE PROPRIÉTÉS - MODULE UI
 * ====================================================================
 * 
 * Rôle : Interface de modification des propriétés des widgets
 * Type : UI Component - Panneau contextuel adaptatif
 */

class PropertyPanel {
    constructor() {
        // 
        // Rôle : Référence vers le widget actuellement sélectionné
        // Type : Widget | null (référence d'objet)
        // Domaine : instance Widget valide | null (aucune sélection)
        // Exemple : null
        this.selectedWidget = null;

        // Conteneur DOM du panneau de propriétés
        this.container = document.getElementById('properties-content');

        console.log('PropertyPanel initialisé');
    }

    /**
     * Affiche les propriétés du widget sélectionné.
     * 
     * Args:
     *   widget (Widget): Instance du widget à éditer
     * 
     * Rôle : UI Updater - Affichage panneau contextuel
     * Type : Form Generator - Interface d'édition dynamique
     * Retour : void (effet : DOM mis à jour)
     */
    showProperties(widget) {
        this.selectedWidget = widget;

        if (!widget) {
            this.showEmptyState();
            return;
        }

        // Génération du panneau de propriétés spécifique au widget
        const propertiesHtml = widget.getPropertiesPanel();
        
        this.container.innerHTML = `
            <div class="widget-properties">
                <div class="properties-header">
                    <h3>Propriétés - ${widget.type}</h3>
                    <button class="btn-close" onclick="propertyPanel.hideProperties()">×</button>
                </div>
                <div class="properties-content">
                    ${propertiesHtml}
                </div>
            </div>
        `;

        // Liaison des événements pour les contrôles de propriétés
        this.bindPropertyEvents();
    }

    /**
     * Masque le panneau de propriétés.
     */
    hideProperties() {
        this.selectedWidget = null;
        this.showEmptyState();
    }

    /**
     * Affiche l'état vide du panneau.
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="no-selection-state">
                <div class="empty-state-icon">⚙️</div>
                <h4>Aucun widget sélectionné</h4>
                <p>Cliquez sur un widget ou faites glisser-déposer depuis la banque pour commencer l'édition.</p>
                
                <div class="quick-actions">
                    <button class="btn-primary" onclick="this.addElementUniversel()">
                        <span class="icon">🌟</span> Ajouter Élément Universel
                    </button>
                    <button class="btn-secondary" onclick="this.addGrilleComposition()">
                        <span class="icon">🏗️</span> Ajouter Grille Composition
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Lie les événements des contrôles de propriétés.
     */
    bindPropertyEvents() {
        if (!this.selectedWidget) return;

        // Liaison des inputs pour mise à jour temps réel
        const inputs = this.container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const property = e.target.id;
                let value = e.target.value;

                // Gestion des types spéciaux
                if (e.target.type === 'checkbox') {
                    value = e.target.checked;
                } else if (e.target.type === 'number' || e.target.type === 'range') {
                    value = parseFloat(value);
                }

                this.updateWidgetProperty(property, value);
            });
        });
    }

    /**
     * Met à jour une propriété du widget sélectionné.
     */
    updateWidgetProperty(property, value) {
        if (this.selectedWidget) {
            this.selectedWidget.updateProperty(property, value);
            
            // Actualisation de l'affichage si nécessaire
            if (window.presentationEditor) {
                // Déclencher le re-rendu du widget
                window.presentationEditor.refreshWidget(this.selectedWidget);
            }
        }
    }

    /**
     * Actions rapides pour ajouter des widgets.
     */
    addElementUniversel() {
        console.log('Ajout Élément Universel');
        // À implémenter avec le système de widgets
    }

    addGrilleComposition() {
        console.log('Ajout Grille Composition');
        // À implémenter avec le système de widgets
    }
}

// Instance globale du panneau de propriétés
window.propertyPanel = new PropertyPanel();