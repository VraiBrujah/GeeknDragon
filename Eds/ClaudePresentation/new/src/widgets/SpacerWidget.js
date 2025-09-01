/**
 * Widget d'espacement pour mise en page
 * 
 * Rôle : Crée des espaces vides de taille contrôlée
 * Type : Classe de widget héritant de BaseWidget  
 * Responsabilité : Gestion des espaces et marges dans la mise en page
 */
class SpacerWidget extends BaseWidget {
    constructor(config = {}) {
        super('spacer', config);
    }

    getDefaultData() {
        return {
            // Rôle : Hauteur de l'espacement
            // Type : Number (taille en pixels)
            // Unité : pixels (px)
            // Domaine : height ≥ 0
            // Exemple : 40 → espace de 40px de haut
            height: 20,

            // Rôle : Type d'espacement
            // Type : String (mode d'espacement)
            // Domaine : 'vertical' | 'horizontal' | 'both'
            // Exemple : 'vertical' → espacement vertical uniquement
            type: 'vertical',

            // Rôle : Visibilité de l'espacement en mode édition
            // Type : Boolean (affichage guide)
            // Exemple : true → bordure visible pour aide visuelle
            showInEditor: true
        };
    }

    getDefaultStyles() {
        return {
            ...super.getDefaultStyles(),
            display: 'block',
            width: '100%',
            backgroundColor: 'transparent'
        };
    }

    render(renderOptions = {}) {
        const height = this.data.height || 20;
        const isEditor = renderOptions.editor || renderOptions.showControls;
        
        // Styles dynamiques selon les données
        const spacerStyles = {
            ...this.styles,
            height: `${height}px`,
            minHeight: `${height}px`
        };

        // Ajout d'un guide visuel en mode édition
        if (isEditor && this.data.showInEditor) {
            spacerStyles.border = '1px dashed rgba(16, 185, 129, 0.3)';
            spacerStyles.position = 'relative';
        }

        const cssClasses = [
            this.getClassesCSS(),
            isEditor ? 'editor-spacer' : 'viewer-spacer'
        ].join(' ');

        const inlineStyles = Object.entries(spacerStyles)
            .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');

        // Contenu pour mode édition
        const content = isEditor && this.data.showInEditor ? 
            `<span class="spacer-label">Espacement ${height}px</span>` : '';

        return `<div 
            class="${cssClasses}" 
            style="${inlineStyles}" 
            ${this.getAttributesHTML()}
        >${content}</div>`;
    }
}

window.SpacerWidget = SpacerWidget;