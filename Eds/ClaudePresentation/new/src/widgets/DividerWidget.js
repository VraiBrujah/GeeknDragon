/**
 * Widget de séparateur visuel
 * 
 * Rôle : Crée des lignes de séparation entre sections
 * Type : Classe de widget héritant de BaseWidget
 * Responsabilité : Séparation visuelle et organisation du contenu
 */
class DividerWidget extends BaseWidget {
    constructor(config = {}) {
        super('divider', config);
    }

    getDefaultData() {
        return {
            // Rôle : Style du séparateur
            // Type : String (type de ligne)
            // Domaine : 'solid' | 'dashed' | 'dotted' | 'double'
            // Exemple : 'solid' → ligne continue
            style: 'solid',

            // Rôle : Épaisseur de la ligne
            // Type : Number (taille en pixels)
            // Unité : pixels (px)
            // Domaine : thickness ≥ 1
            // Exemple : 2 → ligne de 2px d'épaisseur
            thickness: 1,

            // Rôle : Couleur de la ligne
            // Type : String (couleur CSS)
            // Exemple : '#e5e5e5', 'rgba(0,0,0,0.1)'
            color: '#e5e5e5',

            // Rôle : Largeur du séparateur
            // Type : String (largeur CSS)
            // Unité : %, px
            // Exemple : '100%' → pleine largeur, '50%' → moitié
            width: '100%',

            // Rôle : Alignement du séparateur
            // Type : String (alignement)
            // Domaine : 'left' | 'center' | 'right'
            // Exemple : 'center' → centré
            align: 'center',

            // Rôle : Espacement vertical autour du séparateur
            // Type : Number (marge en pixels)
            // Unité : pixels (px)
            // Exemple : 20 → 20px de marge en haut et bas
            spacing: 20
        };
    }

    getDefaultStyles() {
        return {
            ...super.getDefaultStyles(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
        };
    }

    render(renderOptions = {}) {
        const { style, thickness, color, width, align, spacing } = this.data;
        
        // Styles du conteneur
        const containerStyles = {
            ...this.styles,
            justifyContent: align === 'left' ? 'flex-start' : 
                          align === 'right' ? 'flex-end' : 'center',
            padding: `${spacing}px 0`
        };

        // Styles de la ligne
        const lineStyles = {
            width: width,
            height: '0',
            borderTop: `${thickness}px ${style} ${color}`
        };

        const cssClasses = [
            this.getClassesCSS(),
            `divider-${style}`,
            `align-${align}`
        ].join(' ');

        const containerStylesCSS = Object.entries(containerStyles)
            .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');

        const lineStylesCSS = Object.entries(lineStyles)
            .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');

        return `<div 
            class="${cssClasses}" 
            style="${containerStylesCSS}" 
            ${this.getAttributesHTML()}
        ><div class="divider-line" style="${lineStylesCSS}"></div></div>`;
    }
}

window.DividerWidget = DividerWidget;