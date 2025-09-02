/**
 * ====================================================================
 * WIDGET GRILLE COMPOSITION - GÉNÉRATEUR DYNAMIQUE
 * ====================================================================
 * 
 * Rôle : Compositeur dynamique 3 modes (colonne/ligne/grille 2D)
 * Type : Layout Generator - Générateur de tableaux N×M adaptatifs
 * Usage : Couvre les 10% besoins restants avec layouts complexes
 */

class GrilleComposition extends BaseWidget {
    constructor(id = null) {
        super(id, 'grille-composition');

        // 
        // Configuration de la grille compositrice
        // Modes : colonne, ligne, grille2d pour tous les layouts
        //
        
        // Mode d'organisation de la grille
        // Type : string (énumération contrôlée)
        // Unité : sans unité (mode de layout)  
        // Domaine : 'colonne' | 'ligne' | 'grille2d'
        // Exemple : 'colonne'
        this.data.mode = 'colonne';

        // Nombre de colonnes pour le mode grille2d
        // Type : number (entier positif)
        // Unité : sans unité (nombre de colonnes)
        // Domaine : 1 ≤ colonnes ≤ 12 (responsive standard)
        // Exemple : 3
        this.data.colonnes = 3;

        // Nombre de lignes pour le mode grille2d
        // Type : number (entier positif)  
        // Unité : sans unité (nombre de lignes)
        // Domaine : 1 ≤ lignes ≤ 10 (limite pratique)
        // Exemple : 2
        this.data.lignes = 2;

        // Collection des éléments contenus dans la grille
        // Type : Array<Object> (collection d'éléments)
        // Structure : [{id, type, data, position}]
        // Exemple : []
        this.data.elements = [];

        console.log('GrilleComposition créée:', this.id);
    }

    /**
     * Génère le HTML de rendu de la grille composition.
     * 
     * Rôle : Layout Renderer - Génération HTML adaptatif par mode
     * Type : Template Engine - HTML structuré selon mode sélectionné
     * Retour : String HTML complet de la grille
     */
    render() {
        const modeClass = `grille-mode-${this.data.mode}`;
        const elementsHtml = this.renderElements();

        return `
            <div class="grille-composition ${modeClass}" id="${this.id}">
                <div class="grille-container" 
                     data-colonnes="${this.data.colonnes}"
                     data-lignes="${this.data.lignes}">
                    ${elementsHtml}
                </div>
                ${this.data.elements.length === 0 ? this.renderEmptyState() : ''}
            </div>
        `;
    }

    /**
     * Génère le HTML des éléments selon le mode actif.
     * 
     * Rôle : Elements Renderer - Rendu adaptatif des contenus
     * Type : Conditional Renderer - HTML selon mode et contenu
     * Retour : String HTML des éléments organisés
     */
    renderElements() {
        if (this.data.elements.length === 0) {
            return '';
        }

        switch (this.data.mode) {
            case 'colonne':
                return this.renderColonne();
            case 'ligne':
                return this.renderLigne();
            case 'grille2d':
                return this.renderGrille2D();
            default:
                return this.renderColonne();
        }
    }

    /**
     * Rendu mode colonne (empilement vertical).
     */
    renderColonne() {
        return this.data.elements.map(element => 
            `<div class="grille-item item-colonne">${this.renderElement(element)}</div>`
        ).join('');
    }

    /**
     * Rendu mode ligne (alignement horizontal).
     */
    renderLigne() {
        return this.data.elements.map(element => 
            `<div class="grille-item item-ligne">${this.renderElement(element)}</div>`
        ).join('');
    }

    /**
     * Rendu mode grille 2D (tableau N×M).
     */
    renderGrille2D() {
        const totalCells = this.data.colonnes * this.data.lignes;
        let html = '';

        for (let i = 0; i < totalCells; i++) {
            const element = this.data.elements[i];
            const cellContent = element ? this.renderElement(element) : this.renderEmptyCell(i);
            html += `<div class="grille-item item-grille2d" data-index="${i}">${cellContent}</div>`;
        }

        return html;
    }

    /**
     * Rendu d'un élément individuel.
     */
    renderElement(element) {
        // Rendu basique - à étendre selon les types d'éléments
        return `
            <div class="element-content" data-element-id="${element.id}">
                <div class="element-type">${element.type}</div>
                <div class="element-data">${JSON.stringify(element.data)}</div>
            </div>
        `;
    }

    /**
     * Rendu d'une cellule vide (grille 2D).
     */
    renderEmptyCell(index) {
        return `
            <div class="cellule-vide" data-cell="${index}">
                <div class="placeholder">
                    <span class="icon">➕</span>
                    <span class="text">Ajouter élément</span>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de l'état vide (pas d'éléments).
     */
    renderEmptyState() {
        return `
            <div class="grille-empty-state">
                <div class="empty-icon">🏗️</div>
                <h4>Grille vide</h4>
                <p>Faites glisser des éléments ou cliquez pour ajouter du contenu</p>
                <button class="btn-add-element" onclick="this.addElement()">
                    ➕ Ajouter élément
                </button>
            </div>
        `;
    }

    /**
     * Génère le panneau de propriétés de la grille.
     */
    getPropertiesPanel() {
        return `
            <div class="properties-section">
                <h4>🏗️ Grille Composition</h4>
                
                <div class="property-group">
                    <label>Mode d'organisation</label>
                    <select id="grille-mode" onchange="this.changeMode(this.value)">
                        <option value="colonne" ${this.data.mode === 'colonne' ? 'selected' : ''}>
                            📋 Colonne (vertical)
                        </option>
                        <option value="ligne" ${this.data.mode === 'ligne' ? 'selected' : ''}>
                            ↔️ Ligne (horizontal)
                        </option>
                        <option value="grille2d" ${this.data.mode === 'grille2d' ? 'selected' : ''}>
                            ⊞ Grille 2D (tableau)
                        </option>
                    </select>
                </div>
                
                ${this.data.mode === 'grille2d' ? `
                    <div class="property-group">
                        <label>Colonnes</label>
                        <input type="range" id="grille-colonnes" 
                               min="1" max="12" value="${this.data.colonnes}"
                               onchange="this.updateDimensions('colonnes', this.value)">
                        <span>${this.data.colonnes}</span>
                    </div>
                    
                    <div class="property-group">
                        <label>Lignes</label>
                        <input type="range" id="grille-lignes" 
                               min="1" max="10" value="${this.data.lignes}"
                               onchange="this.updateDimensions('lignes', this.value)">
                        <span>${this.data.lignes}</span>
                    </div>
                ` : ''}
                
                <div class="property-group">
                    <label>Éléments (${this.data.elements.length})</label>
                    <button class="btn-secondary" onclick="this.addElement()">
                        ➕ Ajouter élément
                    </button>
                    <button class="btn-secondary" onclick="this.clearElements()">
                        🗑️ Vider grille
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Change le mode d'organisation de la grille.
     */
    changeMode(newMode) {
        this.data.mode = newMode;
        this.requestUpdate();
    }

    /**
     * Met à jour les dimensions (colonnes/lignes).
     */
    updateDimensions(dimension, value) {
        this.data[dimension] = parseInt(value);
        this.requestUpdate();
    }

    /**
     * Ajoute un nouvel élément à la grille.
     */
    addElement(elementType = 'text', data = {}) {
        const newElement = {
            id: `element_${Date.now()}`,
            type: elementType,
            data: data,
            position: this.data.elements.length
        };

        this.data.elements.push(newElement);
        this.requestUpdate();
    }

    /**
     * Supprime tous les éléments de la grille.
     */
    clearElements() {
        if (confirm('Supprimer tous les éléments de la grille ?')) {
            this.data.elements = [];
            this.requestUpdate();
        }
    }

    /**
     * Met à jour une propriété de la grille.
     */
    updateProperty(property, value) {
        switch (property) {
            case 'mode':
                this.changeMode(value);
                break;
            case 'colonnes':
            case 'lignes':
                this.updateDimensions(property, value);
                break;
            default:
                super.updateProperty(property, value);
        }
    }

    /**
     * Clone la grille avec tous ses éléments.
     */
    clone() {
        const clone = new GrilleComposition();
        clone.data = JSON.parse(JSON.stringify(this.data));
        return clone;
    }
}