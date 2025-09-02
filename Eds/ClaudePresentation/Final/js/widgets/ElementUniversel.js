/**
 * ====================================================================
 * WIDGET ÉLÉMENT UNIVERSEL - 90% DES BESOINS
 * ====================================================================
 * 
 * Rôle : Widget modulaire image + 3 textes (H1/H2/P)
 * Type : Composant universel - Remplace Logo, Texte, Hero
 * Usage : Couverture 90% besoins présentation avec un seul widget
 */

class ElementUniversel extends BaseWidget {
    constructor(id = null) {
        super(id, 'element-universel');

        // 
        // Configuration par défaut du widget universel
        // Structure : 1 image optionnelle + 3 niveaux de texte
        //
        
        // Données de l'image principale (optionnelle)
        // Type : Object {src, alt, visible}
        // Rôle : Image d'illustration ou logo
        // Domaine : src URL valide ou vide, alt texte descriptif
        this.data.image = {
            src: '',
            alt: '',
            visible: false
        };

        // Premier niveau de texte (généralement titre principal)
        // Type : string (contenu textuel)
        // Unité : sans unité (texte libre)
        // Usage : H1, titre principal, nom de marque
        // Exemple : "Li-CUBE PRO™"
        this.data.texte1 = '';

        // Deuxième niveau de texte (généralement sous-titre)
        // Type : string (contenu textuel)  
        // Unité : sans unité (texte libre)
        // Usage : H2, sous-titre, slogan, description courte
        // Exemple : "LOCATION INTELLIGENTE ZÉRO RISQUE"
        this.data.texte2 = '';

        // Troisième niveau de texte (généralement description)
        // Type : string (contenu textuel)
        // Unité : sans unité (texte libre)
        // Usage : P, description détaillée, contenu informatif
        // Exemple : "La solution révolutionnaire pour professionnels"
        this.data.texte3 = '';

        console.log('ElementUniversel créé:', this.id);
    }

    /**
     * Génère le HTML de rendu du widget universel.
     * 
     * Rôle : Template Engine - Génération HTML avec données
     * Type : Renderer - HTML structuré et stylisé
     * Retour : String HTML complet pour affichage
     */
    render() {
        return `
            <div class="element-universel" id="${this.id}">
                ${this.data.image.visible && this.data.image.src ? 
                    `<div class="eu-image">
                        <img src="${this.data.image.src}" alt="${this.data.image.alt}" />
                    </div>` : ''
                }
                ${this.data.texte1 ? 
                    `<h1 class="eu-texte1">${this.data.texte1}</h1>` : ''
                }
                ${this.data.texte2 ? 
                    `<h2 class="eu-texte2">${this.data.texte2}</h2>` : ''
                }
                ${this.data.texte3 ? 
                    `<p class="eu-texte3">${this.data.texte3}</p>` : ''
                }
            </div>
        `;
    }

    /**
     * Génère le panneau de propriétés pour l'édition.
     * 
     * Rôle : Property Editor - Interface d'édition paramètres
     * Type : Form Generator - Formulaire adaptatif par propriétés
     * Retour : String HTML du panneau de propriétés
     */
    getPropertiesPanel() {
        return `
            <div class="properties-section">
                <h4>🌟 Élément Universel</h4>
                
                <div class="property-group">
                    <label>Image (optionnelle)</label>
                    <input type="checkbox" id="image-visible" ${this.data.image.visible ? 'checked' : ''}>
                    <label for="image-visible">Afficher image</label>
                    
                    <input type="url" id="image-src" 
                           placeholder="URL de l'image" 
                           value="${this.data.image.src}"
                           ${!this.data.image.visible ? 'style="display:none"' : ''}>
                    
                    <input type="text" id="image-alt" 
                           placeholder="Texte alternatif" 
                           value="${this.data.image.alt}"
                           ${!this.data.image.visible ? 'style="display:none"' : ''}>
                </div>
                
                <div class="property-group">
                    <label>Texte 1 (Titre principal)</label>
                    <input type="text" id="texte1" 
                           placeholder="Titre principal" 
                           value="${this.data.texte1}">
                </div>
                
                <div class="property-group">
                    <label>Texte 2 (Sous-titre)</label>
                    <input type="text" id="texte2" 
                           placeholder="Sous-titre ou slogan" 
                           value="${this.data.texte2}">
                </div>
                
                <div class="property-group">
                    <label>Texte 3 (Description)</label>
                    <textarea id="texte3" 
                              placeholder="Description détaillée" 
                              rows="3">${this.data.texte3}</textarea>
                </div>
            </div>
        `;
    }

    /**
     * Met à jour une propriété spécifique du widget.
     * 
     * Args:
     *   property (string): Nom de la propriété à modifier
     *   value (any): Nouvelle valeur de la propriété
     * 
     * Rôle : Property Updater - Modification données widget
     * Type : Setter - Mise à jour état interne avec validation
     * Retour : void (effet : this.data modifié)
     */
    updateProperty(property, value) {
        switch (property) {
            case 'image-visible':
                this.data.image.visible = value;
                break;
            case 'image-src':
                this.data.image.src = value;
                break;
            case 'image-alt':
                this.data.image.alt = value;
                break;
            case 'texte1':
                this.data.texte1 = value;
                break;
            case 'texte2':
                this.data.texte2 = value;
                break;
            case 'texte3':
                this.data.texte3 = value;
                break;
            default:
                super.updateProperty(property, value);
        }
        
        // Déclenchement du re-rendu si nécessaire
        this.requestUpdate();
    }

    /**
     * Clone le widget avec nouvelles données.
     * 
     * Rôle : Factory Method - Création instance identique
     * Type : Clone Pattern - Duplication complète avec nouvel ID
     * Retour : ElementUniversel nouvelle instance
     */
    clone() {
        const clone = new ElementUniversel();
        clone.data = JSON.parse(JSON.stringify(this.data));
        return clone;
    }
}