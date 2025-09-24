/**
 * Utilitaires Snipcart réutilisables
 * Fonctions cohérentes pour l'ajout au panier dans toute l'application
 */
class SnipcartUtils {

    /**
     * Normalise une URL (relative ou absolue) en utilisant l'origine courante de la page.
     *
     * @param {string} url URL potentiellement relative.
     * @returns {string} URL absolue.
     */
    static normalizeUrl(url) {
        const base = document.baseURI || window.location.href;
        const candidate = url ?? '';

        try {
            return new URL(candidate, base).href;
        } catch (error) {
            return candidate;
        }
    }

    /**
     * Crée un bouton d'ajout au panier avec tous les attributs nécessaires
     */
    static createAddToCartButton(productData, options = {}) {
        const {
            quantity = 1,
            customFields = {},
            className = 'snipcart-add-item btn btn-primary',
            text = 'Ajouter au panier',
            ...extraAttributes
        } = options;

        const button = document.createElement('button');
        button.className = className;
        button.textContent = text;

        // Attributs de base Snipcart
        const baseAttributes = {
            'data-item-id': productData.id,
            'data-item-name': productData.name,
            'data-item-description': productData.summary || productData.description || '',
            'data-item-price': productData.price.toString(),
            'data-item-quantity': quantity.toString()
        };

        // Ajouter les attributs multilingues si disponibles
        if (productData.name_en) {
            baseAttributes['data-item-name-en'] = productData.name_en;
        }
        if (productData.summary_en) {
            baseAttributes['data-item-description-en'] = productData.summary_en;
        }

        // Ajouter l'URL du produit si disponible
        if (productData.url) {
            baseAttributes['data-item-url'] = this.normalizeUrl(productData.url);
        }

        // Appliquer les attributs de base
        Object.entries(baseAttributes).forEach(([key, value]) => {
            button.setAttribute(key, value);
        });

        // Ajouter les champs personnalisés
        Object.entries(customFields).forEach(([fieldKey, fieldData]) => {
            const index = fieldKey.replace('custom', '');
            button.setAttribute(`data-item-custom${index}-name`, fieldData.name);
            button.setAttribute(`data-item-custom${index}-type`, fieldData.type);
            button.setAttribute(`data-item-custom${index}-options`, fieldData.options);
            button.setAttribute(`data-item-custom${index}-value`, fieldData.value);
            
            // Ajouter le rôle pour faciliter la recherche
            if (fieldData.role) {
                button.setAttribute(`data-item-custom${index}-role`, fieldData.role);
            }
        });

        // Ajouter les attributs supplémentaires
        Object.entries(extraAttributes).forEach(([key, value]) => {
            button.setAttribute(key, value);
        });

        return button;
    }

    /**
     * Ajoute un produit au panier par programmation
     */
    static addToCart(productData, options = {}) {
        const button = this.createAddToCartButton(productData, options);
        
        // Ajouter temporairement au DOM pour déclencher Snipcart
        button.style.display = 'none';
        document.body.appendChild(button);
        
        // Déclencher le clic
        button.click();
        
        // Nettoyer
        setTimeout(() => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        }, 100);
    }

    /**
     * Ajoute plusieurs produits au panier en lot
     */
    static addMultipleToCart(products, onProgress = null) {
        if (!products || products.length === 0) {
            if (onProgress) onProgress(0, 0);
            return;
        }

        let added = 0;
        
        // Fonction récursive pour ajouter un produit à la fois avec délai adaptatif
        const addNext = (index) => {
            if (index >= products.length) return;
            
            const productData = products[index];
            
            try {
                this.addToCart(productData.product, {
                    quantity: productData.quantity,
                    customFields: productData.customFields || {}
                });
                
                added++;
                if (onProgress) {
                    onProgress(added, products.length);
                }
                
                // Délai plus long pour être sûr que Snipcart a traité l'ajout
                setTimeout(() => addNext(index + 1), 500);
                
            } catch (error) {
                console.error('Erreur ajout produit au panier:', error, productData);
                // Continuer avec le suivant même en cas d'erreur
                setTimeout(() => addNext(index + 1), 500);
            }
        };
        
        // Commencer l'ajout séquentiel
        addNext(0);
    }

    /**
     * Met à jour les attributs d'un bouton existant selon les sélections
     */
    static updateCartButton(button, selections = {}) {
        const { quantity, metal, multiplier, triptych, language } = selections;
        
        if (quantity !== undefined) {
            button.setAttribute('data-item-quantity', quantity.toString());
        }

        // Mise à jour des champs personnalisés
        this.updateCustomFields(button, selections);
    }

    /**
     * Met à jour les champs personnalisés d'un bouton
     */
    static updateCustomFields(button, selections) {
        const { metal, multiplier, triptych, language } = selections;
        
        // Trouver et mettre à jour le champ métal
        if (metal !== undefined) {
            const metalField = this.findCustomFieldByRole(button, 'metal');
            if (metalField) {
                button.setAttribute(`data-item-custom${metalField}-value`, metal);
            }
        }

        // Trouver et mettre à jour le champ multiplicateur
        if (multiplier !== undefined) {
            const multiplierField = this.findCustomFieldByRole(button, 'multiplier');
            if (multiplierField) {
                button.setAttribute(`data-item-custom${multiplierField}-value`, multiplier.toString());
            }
        }

        // Trouver et mettre à jour le champ triptyque
        if (triptych !== undefined) {
            const triptychField = this.findCustomFieldByRole(button, 'triptych');
            if (triptychField) {
                button.setAttribute(`data-item-custom${triptychField}-value`, triptych);
            }
        }

        // Trouver et mettre à jour le champ langue
        if (language !== undefined) {
            const languageField = this.findCustomFieldByRole(button, 'language');
            if (languageField) {
                button.setAttribute(`data-item-custom${languageField}-value`, language);
            }
        }
    }

    /**
     * Trouve l'index d'un champ personnalisé par son rôle
     */
    static findCustomFieldByRole(button, role) {
        const attributes = Array.from(button.attributes);
        
        for (const attr of attributes) {
            const match = attr.name.match(/^data-item-custom(\d+)-role$/);
            if (match && attr.value === role) {
                return match[1];
            }
        }
        
        return null;
    }

    /**
     * Extrait les données produit depuis les attributs d'un bouton
     */
    static extractProductDataFromButton(button) {
        return {
            id: button.getAttribute('data-item-id'),
            name: button.getAttribute('data-item-name'),
            description: button.getAttribute('data-item-description'),
            price: parseFloat(button.getAttribute('data-item-price')),
            quantity: parseInt(button.getAttribute('data-item-quantity')),
            url: this.normalizeUrl(button.getAttribute('data-item-url'))
        };
    }

    /**
     * Crée les données de produit pour les lots recommandés
     */
    static createLotProductData(lot) {
        const { product, quantity, customFields, displayName } = lot;
        
        return {
            product: {
                id: product.id,
                name: displayName || product.name,
                summary: product.summary,
                price: product.price,
                url: this.normalizeUrl(`/product.php?id=${encodeURIComponent(product.id)}`)
            },
            quantity: quantity,
            customFields: customFields || {}
        };
    }

    /**
     * Traduit les noms de métaux
     */
    static translateMetal(metal, lang = 'fr') {
        const translations = {
            fr: {
                copper: 'cuivre',
                silver: 'argent', 
                electrum: 'électrum',
                gold: 'or',
                platinum: 'platine'
            },
            en: {
                copper: 'copper',
                silver: 'silver',
                electrum: 'electrum', 
                gold: 'gold',
                platinum: 'platinum'
            }
        };
        
        return translations[lang]?.[metal] || metal;
    }

    /**
     * Obtient la langue actuelle
     */
    static getCurrentLang() {
        return document.documentElement.lang || 'fr';
    }

    /**
     * Obtient les traductions i18n
     */
    static getTranslation(key, fallback = '') {
        if (window.i18n) {
            const keys = key.split('.');
            let value = window.i18n;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return fallback;
                }
            }
            return typeof value === 'string' ? value : fallback;
        }
        return fallback;
    }
}

// Export pour utilisation globale
window.SnipcartUtils = SnipcartUtils;