/**
 * Widget de bouton interactif
 * 
 * Rôle : Crée des boutons avec actions (liens, formulaires, événements)
 * Type : Classe de widget héritant de BaseWidget
 * Responsabilité : Rendu de boutons, gestion des actions et styles
 */
class ButtonWidget extends BaseWidget {
    constructor(config = {}) {
        super('button', config);
    }

    getDefaultData() {
        return {
            // Rôle : Texte affiché sur le bouton
            // Type : String (texte du bouton)
            // Unité : Sans unité
            // Exemple : 'Cliquez ici', 'Contactez-nous'
            text: 'Bouton',

            // Rôle : Action déclenchée au clic
            // Type : String (type d'action)
            // Domaine : 'link' | 'submit' | 'button' | 'javascript'
            // Exemple : 'link' → redirection, 'submit' → envoi formulaire
            action: 'button',

            // Rôle : URL de destination si action = 'link'
            // Type : String (URL)
            // Exemple : 'https://example.com', './contact.html'
            href: '',

            // Rôle : Cible du lien (_blank, _self)
            // Type : String (attribut target)
            // Exemple : '_blank' → nouvel onglet
            target: '_self',

            // Rôle : Code JavaScript si action = 'javascript'
            // Type : String (code JS)
            // Exemple : 'alert("Hello")'
            javascript: '',

            // Rôle : Icône à afficher dans le bouton
            // Type : String (classe FontAwesome)
            // Exemple : 'fas fa-download'
            icon: '',

            // Rôle : Position de l'icône par rapport au texte
            // Type : String (position)
            // Domaine : 'left' | 'right' | 'top' | 'bottom'
            iconPosition: 'left'
        };
    }

    getDefaultStyles() {
        return {
            ...super.getDefaultStyles(),
            // Styles par défaut du bouton
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#10B981',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '44px' // Accessibilité tactile
        };
    }

    render(renderOptions = {}) {
        const { text, action, href, target, javascript, icon, iconPosition } = this.data;
        
        // Détermination de la balise HTML selon l'action
        let tag = 'button';
        let attributes = '';
        
        if (action === 'link' && href) {
            tag = 'a';
            attributes = `href="${href}" target="${target}"`;
        } else if (action === 'submit') {
            attributes = 'type="submit"';
        } else if (action === 'javascript' && javascript) {
            attributes = `onclick="${javascript}"`;
        }

        // Construction de l'icône si présente
        let iconHtml = '';
        if (icon) {
            iconHtml = `<i class="${icon}"></i>`;
        }

        // Organisation du contenu selon position de l'icône
        let content = '';
        if (icon) {
            switch (iconPosition) {
                case 'left':
                    content = `${iconHtml}<span>${text}</span>`;
                    break;
                case 'right':
                    content = `<span>${text}</span>${iconHtml}`;
                    break;
                case 'top':
                    content = `<span class="icon-top">${iconHtml}</span><span>${text}</span>`;
                    break;
                case 'bottom':
                    content = `<span>${text}</span><span class="icon-bottom">${iconHtml}</span>`;
                    break;
                default:
                    content = `${iconHtml}<span>${text}</span>`;
            }
        } else {
            content = `<span>${text}</span>`;
        }

        const cssClasses = [
            this.getClassesCSS(),
            `action-${action}`,
            icon ? `has-icon icon-${iconPosition}` : 'text-only',
            renderOptions.preview ? 'preview-mode' : ''
        ].filter(Boolean).join(' ');

        return `<${tag} 
            class="${cssClasses}" 
            style="${this.getStylesCSS()}" 
            ${this.getAttributesHTML()}
            ${attributes}
        >${content}</${tag}>`;
    }
}

window.ButtonWidget = ButtonWidget;