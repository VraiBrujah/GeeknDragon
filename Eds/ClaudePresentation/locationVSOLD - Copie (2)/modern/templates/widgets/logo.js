/**
 * ============================================================================
 * LOGO WIDGET - Widget Logo Avancé avec Arrière-plans et Effets
 * ============================================================================
 * 
 * Rôle : Widget de logo avec fonctionnalités complètes
 * Type : Composant UI - Logo avec effets et personnalisation avancée
 * Usage : Affichage de logos avec arrière-plans, bordures, ombres et effets hover
 */

class LogoWidget {
    constructor() {
        this.id = 'logo';
        this.name = 'Logo';
        this.category = 'Navigation';
        this.icon = '🏢';
        this.description = 'Logo avec image et effets hover';
        
        this.defaultData = {
            imagePath: '../assets/images/logo-eds.png',
            altText: 'Logo EDS Québec',
            width: 60,
            height: 60,
            link: '#',
            hoverEffect: true,
            
            // Propriétés d'arrière-plan avancées
            backgroundColor: '#10b981',
            backgroundOpacity: 10,
            backgroundType: 'solid', // solid, gradient, transparent
            gradientStart: '#10b981',
            gradientEnd: '#065f46',
            gradientDirection: 'to bottom',
            
            // Propriétés de bordure
            borderColor: '#10b981',
            borderWidth: 2,
            borderStyle: 'solid', // solid, dashed, dotted, none
            borderRadius: 12,
            borderOpacity: 30,
            
            // Propriétés de l'image
            imageSize: 80, // en pourcentage
            imagePosition: 'center',
            imageFit: 'contain', // contain, cover, fill
            
            // Propriétés d'ombrage
            shadowEnabled: false,
            shadowColor: '#000000',
            shadowOpacity: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowBlur: 8,
            
            // Propriétés de conteneur
            /* 
            # Rôle      : Espacement horizontal du conteneur (gauche et droite)
            # Type      : number
            # Unité     : pixels
            # Domaine   : 0 ≤ valeur ≤ 50
            # Exemple   : 20 pour 20px de chaque côté
            */
            containerPaddingX: 20,
            
            /* 
            # Rôle      : Espacement vertical du conteneur (haut et bas)
            # Type      : number
            # Unité     : pixels
            # Domaine   : 0 ≤ valeur ≤ 50
            # Exemple   : 20 pour 20px en haut et en bas
            */
            containerPaddingY: 20,
            
            containerAlignment: 'center'
        };
    }

    render(data = {}) {
        // Rôle      : Fusion des données par défaut avec les données fournies
        // Type      : Object
        // Unité     : sans unité
        // Domaine   : objet contenant toutes les propriétés du logo
        // Formule   : d = {...defaultData, ...data}
        // Exemple   : {width: 60, backgroundColor: '#ff0000', ...}
        const d = { ...this.defaultData, ...data };
        
        /* 
        # Rôle      : Migration des anciennes données containerPadding vers containerPaddingX/Y
        # Type      : compatibility check
        # Unité     : pixels
        # Formule   : Si containerPadding existe et pas containerPaddingX/Y, copier la valeur
        # Exemple   : containerPadding=25 → containerPaddingX=25, containerPaddingY=25
        */
        if (data.containerPadding !== undefined && data.containerPaddingX === undefined) {
            d.containerPaddingX = data.containerPadding;
            d.containerPaddingY = data.containerPadding;
            console.log(`📦 Migration containerPadding: ${data.containerPadding} → X=${d.containerPaddingX}, Y=${d.containerPaddingY}`);
        }
        
        // Rôle      : Calcul de la couleur d'arrière-plan selon le type choisi
        // Type      : string (CSS)
        // Unité     : sans unité
        // Domaine   : couleur CSS valide ou transparent
        // Formule   : backgroundStyle = type === 'transparent' ? 'transparent' : (type === 'gradient' ? gradientCSS : solidColorCSS)
        // Exemple   : 'rgba(16, 185, 129, 0.1)' ou 'linear-gradient(to bottom, #10b981, #065f46)' ou 'transparent'
        let backgroundStyle;
        if (d.backgroundType === 'transparent') {
            backgroundStyle = 'transparent';
        } else if (d.backgroundType === 'gradient') {
            // Rôle      : Style CSS pour gradient linéaire
            // Type      : string
            // Unité     : sans unité
            // Domaine   : gradient CSS valide
            // Formule   : linear-gradient(direction, couleur_début, couleur_fin)
            // Exemple   : 'linear-gradient(to bottom, #10b981, #065f46)'
            backgroundStyle = `linear-gradient(${d.gradientDirection}, ${d.gradientStart}, ${d.gradientEnd})`;
        } else {
            // Rôle      : Conversion de la couleur de base et opacité en rgba
            // Type      : string
            // Unité     : sans unité
            // Domaine   : couleur rgba CSS
            // Formule   : rgba basée sur backgroundColor et backgroundOpacity
            // Exemple   : 'rgba(16, 185, 129, 0.1)' pour opacity=10%
            const opacity = d.backgroundOpacity / 100;
            if (d.backgroundColor.startsWith('#')) {
                // Rôle      : Conversion hexadécimal vers RGB
                // Type      : Object {r, g, b}
                // Unité     : sans unité (valeurs 0-255)
                // Domaine   : couleurs RGB valides
                // Formule   : hex = parseInt(hex.slice(1,3), 16) pour chaque composante
                // Exemple   : '#10b981' -> {r: 16, g: 185, b: 129}
                const hex = d.backgroundColor.slice(1);
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                backgroundStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            } else {
                backgroundStyle = d.backgroundColor;
            }
        }
        
        // Rôle      : Calcul de la couleur de bordure avec opacité
        // Type      : string (CSS)
        // Unité     : sans unité
        // Domaine   : couleur CSS avec opacité
        // Formule   : rgba basée sur borderColor et borderOpacity
        // Exemple   : 'rgba(16, 185, 129, 0.3)' pour borderOpacity=30%
        let borderColorStyle;
        const borderOpacity = d.borderOpacity / 100;
        if (d.borderColor.startsWith('#')) {
            const hex = d.borderColor.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            borderColorStyle = `rgba(${r}, ${g}, ${b}, ${borderOpacity})`;
        } else {
            borderColorStyle = d.borderColor;
        }
        
        // Rôle      : Style de bordure complet selon les paramètres
        // Type      : string (CSS)
        // Unité     : pixels pour width, style et couleur
        // Domaine   : border CSS valide ou 'none'
        // Formule   : border = width + ' ' + style + ' ' + color ou 'none'
        // Exemple   : '2px solid rgba(16, 185, 129, 0.3)' ou 'none'
        const borderStyle = d.borderStyle === 'none' ? 'none' : `${d.borderWidth}px ${d.borderStyle} ${borderColorStyle}`;
        
        // Rôle      : Style d'ombrage si activé
        // Type      : string (CSS)
        // Unité     : pixels pour offset et blur, sans unité pour opacité
        // Domaine   : box-shadow CSS valide ou 'none'
        // Formule   : box-shadow = offsetX + 'px ' + offsetY + 'px ' + blur + 'px ' + color
        // Exemple   : '0px 4px 8px rgba(0, 0, 0, 0.2)' ou 'none'
        let shadowStyle = 'none';
        if (d.shadowEnabled) {
            const shadowOpacity = d.shadowOpacity / 100;
            let shadowColor;
            if (d.shadowColor.startsWith('#')) {
                const hex = d.shadowColor.slice(1);
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                shadowColor = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
            } else {
                shadowColor = d.shadowColor;
            }
            shadowStyle = `${d.shadowOffsetX}px ${d.shadowOffsetY}px ${d.shadowBlur}px ${shadowColor}`;
        }
        
        /* 
        # Rôle      : Log de débogage pour tracer les valeurs d'espacement
        # Type      : console.log
        # Unité     : pixels
        # Formule   : padding = paddingY + 'px ' + paddingX + 'px'
        # Exemple   : "Espacement: Y=20px X=15px → padding: 20px 15px"
        */
        console.log(`🔧 Espacement Logo: Y=${d.containerPaddingY}px X=${d.containerPaddingX}px → CSS généré`);
        console.log(`📐 Détail CSS:`, {
            'padding-top': `${d.containerPaddingY}px`,
            'padding-bottom': `${d.containerPaddingY}px`, 
            'padding-left': `${d.containerPaddingX}px`,
            'padding-right': `${d.containerPaddingX}px`
        });
        console.log(`📋 Données complètes du logo:`, d);
        
        return `
            <div class="logo-container" style="text-align: ${d.containerAlignment}; 
                                               padding-top: ${d.containerPaddingY}px;
                                               padding-bottom: ${d.containerPaddingY}px;
                                               padding-left: ${d.containerPaddingX}px;
                                               padding-right: ${d.containerPaddingX}px; 
                                               height: 100%;">
                <a href="${d.link}" 
                   class="nav-logo logo-image ${d.hoverEffect ? 'hover-effect' : ''}"
                   style="display: inline-block; 
                          width: ${d.width}px; 
                          height: ${d.height}px; 
                          border-radius: ${d.borderRadius}px; 
                          background: ${backgroundStyle};
                          border: ${borderStyle};
                          background-image: url('${d.imagePath}');
                          background-size: ${d.imageSize}%; 
                          background-repeat: no-repeat; 
                          background-position: ${d.imagePosition};
                          object-fit: ${d.imageFit};
                          box-shadow: ${shadowStyle};
                          transition: all 0.3s ease;
                          text-decoration: none;">
                    <span style="position: absolute; width: 1px; height: 1px; overflow: hidden;">
                        ${d.altText}
                    </span>
                </a>
            </div>
        `;
    }

    getEditableFields() {
        return [
            // Configuration de base
            { name: 'imagePath', label: 'Chemin de l\'image', type: 'text', category: 'Configuration' },
            { name: 'altText', label: 'Texte alternatif', type: 'text', category: 'Configuration' },
            { name: 'link', label: 'Lien de destination', type: 'text', category: 'Configuration' },
            { name: 'hoverEffect', label: 'Effet au survol', type: 'checkbox', category: 'Configuration' },
            
            // Dimensions et position
            { name: 'width', label: 'Largeur (px)', type: 'range', min: 30, max: 200, category: 'Dimensions' },
            { name: 'height', label: 'Hauteur (px)', type: 'range', min: 30, max: 200, category: 'Dimensions' },
            { name: 'containerPaddingY', label: 'Espacement hauteur (px)', type: 'range', min: 0, max: 50, category: 'Dimensions' },
            { name: 'containerAlignment', label: 'Alignement', type: 'select', category: 'Dimensions', options: [
                { value: 'left', label: 'Gauche' },
                { value: 'center', label: 'Centre' },
                { value: 'right', label: 'Droite' }
            ]},
            
            // Arrière-plan
            { name: 'backgroundType', label: 'Type d\'arrière-plan', type: 'select', category: 'Arrière-plan', options: [
                { value: 'solid', label: 'Couleur unie' },
                { value: 'gradient', label: 'Dégradé' },
                { value: 'transparent', label: 'Transparent' }
            ]},
            { name: 'backgroundColor', label: 'Couleur de base', type: 'color', category: 'Arrière-plan' },
            { name: 'backgroundOpacity', label: 'Opacité arrière-plan (%)', type: 'range', min: 0, max: 100, category: 'Arrière-plan' },
            { name: 'gradientStart', label: 'Couleur début dégradé', type: 'color', category: 'Arrière-plan' },
            { name: 'gradientEnd', label: 'Couleur fin dégradé', type: 'color', category: 'Arrière-plan' },
            { name: 'gradientDirection', label: 'Direction dégradé', type: 'select', category: 'Arrière-plan', options: [
                { value: 'to bottom', label: 'Vers le bas' },
                { value: 'to top', label: 'Vers le haut' },
                { value: 'to right', label: 'Vers la droite' },
                { value: 'to left', label: 'Vers la gauche' },
                { value: 'to bottom right', label: 'Diagonal bas-droite' },
                { value: 'to bottom left', label: 'Diagonal bas-gauche' }
            ]},
            
            // Bordures
            { name: 'borderStyle', label: 'Style de bordure', type: 'select', category: 'Bordures', options: [
                { value: 'none', label: 'Aucune' },
                { value: 'solid', label: 'Solide' },
                { value: 'dashed', label: 'Tirets' },
                { value: 'dotted', label: 'Pointillés' }
            ]},
            { name: 'borderWidth', label: 'Épaisseur bordure (px)', type: 'range', min: 0, max: 10, category: 'Bordures' },
            { name: 'borderColor', label: 'Couleur bordure', type: 'color', category: 'Bordures' },
            { name: 'borderOpacity', label: 'Opacité bordure (%)', type: 'range', min: 0, max: 100, category: 'Bordures' },
            { name: 'borderRadius', label: 'Arrondi des coins (px)', type: 'range', min: 0, max: 50, category: 'Bordures' },
            
            // Propriétés de l'image
            { name: 'imageSize', label: 'Taille image (%)', type: 'range', min: 20, max: 100, category: 'Image' },
            { name: 'imagePosition', label: 'Position de l\'image', type: 'select', category: 'Image', options: [
                { value: 'center', label: 'Centre' },
                { value: 'top', label: 'Haut' },
                { value: 'bottom', label: 'Bas' },
                { value: 'left', label: 'Gauche' },
                { value: 'right', label: 'Droite' },
                { value: 'top left', label: 'Haut-gauche' },
                { value: 'top right', label: 'Haut-droite' },
                { value: 'bottom left', label: 'Bas-gauche' },
                { value: 'bottom right', label: 'Bas-droite' }
            ]},
            { name: 'imageFit', label: 'Ajustement image', type: 'select', category: 'Image', options: [
                { value: 'contain', label: 'Contenir (proportions)' },
                { value: 'cover', label: 'Couvrir (remplir)' },
                { value: 'fill', label: 'Étirer (déformer)' }
            ]},
            
            // Ombres
            { name: 'shadowEnabled', label: 'Activer l\'ombre', type: 'checkbox', category: 'Ombres' },
            { name: 'shadowColor', label: 'Couleur de l\'ombre', type: 'color', category: 'Ombres' },
            { name: 'shadowOpacity', label: 'Opacité ombre (%)', type: 'range', min: 0, max: 100, category: 'Ombres' },
            { name: 'shadowOffsetX', label: 'Décalage X (px)', type: 'range', min: -20, max: 20, category: 'Ombres' },
            { name: 'shadowOffsetY', label: 'Décalage Y (px)', type: 'range', min: -20, max: 20, category: 'Ombres' },
            { name: 'shadowBlur', label: 'Flou de l\'ombre (px)', type: 'range', min: 0, max: 30, category: 'Ombres' }
        ];
    }

    getElements() {
        return [
            { id: 'container', name: 'Conteneur', editable: true },
            { id: 'link', name: 'Lien', editable: true },
            { id: 'image', name: 'Image', editable: true }
        ];
    }
}

// Export par défaut pour utilisation ES6
export default LogoWidget;