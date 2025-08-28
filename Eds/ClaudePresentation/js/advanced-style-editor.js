/**
 * Éditeur de Style Avancé Li-CUBE PRO™
 * Système complet d'édition de style en temps réel
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class AdvancedStyleEditor {
    constructor() {
        // Configuration : stockage des styles personnalisés pour chaque élément
        this.storageKey = 'licubepro-advanced-styles';
        
        // Styles par défaut : collections de polices, couleurs et alignements
        this.defaultStyles = {
            fonts: [
                'Inter', 'Playfair Display', 'Arial', 'Georgia', 'Helvetica', 
                'Times New Roman', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
            ],
            
            // Palette de couleurs : couleurs prédéfinies populaires
            colorPalette: [
                '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6',
                '#F97316', '#06B6D4', '#84CC16', '#F43F5E', '#6366F1',
                '#000000', '#FFFFFF', '#6B7280', '#9CA3AF', '#D1D5DB'
            ],
            
            // Alignements disponibles : options de justification du texte
            alignments: ['left', 'center', 'right', 'justify'],
            
            // Poids de police : épaisseurs de caractères disponibles
            fontWeights: ['300', '400', '500', '600', '700', '800', '900']
        };
        
        // État actuel : élément en cours d'édition et ses propriétés
        this.currentElement = null;
        this.currentStyles = {};
        
        this.init();
    }

    /**
     * Initialisation : configuration des écouteurs d'événements et du stockage
     */
    init() {
        this.loadSavedStyles();
        this.setupEventListeners();
        this.createStylePanel();
        console.log('Éditeur de Style Avancé Li-CUBE PRO™ initialisé');
    }

    /**
     * Chargement : récupération des styles sauvegardés depuis localStorage
     */
    loadSavedStyles() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.currentStyles = JSON.parse(saved);
                this.applyAllStyles();
                console.log('Styles personnalisés chargés:', Object.keys(this.currentStyles));
            } catch (error) {
                console.error('Erreur chargement styles:', error);
            }
        }
    }

    /**
     * Application : applique tous les styles sauvegardés aux éléments
     */
    applyAllStyles() {
        Object.entries(this.currentStyles).forEach(([selector, styles]) => {
            const element = document.querySelector(selector);
            if (element) {
                Object.assign(element.style, styles);
            }
        });
    }

    /**
     * Configuration des écouteurs : gestion des clics sur les éléments éditables
     */
    setupEventListeners() {
        // Écoute des clics sur les éléments éditables avec modification du comportement
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('editable')) {
                event.preventDefault();
                this.openStyleEditor(event.target);
            }
        });

        // Sauvegarde automatique : déclenchée par les modifications
        window.addEventListener('beforeunload', () => {
            this.saveStyles();
        });
    }

    /**
     * Création du panneau : interface complète d'édition de style
     */
    createStylePanel() {
        // Structure HTML : panneau d'édition avec toutes les options de style
        const panel = document.createElement('div');
        panel.id = 'advanced-style-panel';
        panel.innerHTML = `
            <div class="style-panel-header">
                <h3>🎨 Éditeur de Style Avancé</h3>
                <button class="close-panel-btn">&times;</button>
            </div>
            
            <div class="style-panel-content">
                <!-- Information : élément actuellement édité -->
                <div class="current-element-info">
                    <span class="element-tag"></span>
                    <span class="element-field"></span>
                </div>

                <!-- Couleurs : palette complète avec sélecteur et pipette -->
                <div class="style-section">
                    <h4>🌈 Couleurs</h4>
                    <div class="color-controls">
                        <div class="color-states">
                            <button class="color-state-btn active" data-state="normal">Normal</button>
                            <button class="color-state-btn" data-state="hover">Survol</button>
                            <button class="color-state-btn" data-state="active">Actif</button>
                        </div>
                        
                        <div class="color-inputs">
                            <div class="color-row">
                                <label>Texte:</label>
                                <input type="color" class="color-picker" data-property="color">
                                <button class="pipette-btn" data-property="color">🎯</button>
                            </div>
                            <div class="color-row">
                                <label>Arrière-plan:</label>
                                <input type="color" class="color-picker" data-property="backgroundColor">
                                <button class="pipette-btn" data-property="backgroundColor">🎯</button>
                            </div>
                            <div class="color-row">
                                <label>Bordure:</label>
                                <input type="color" class="color-picker" data-property="borderColor">
                                <button class="pipette-btn" data-property="borderColor">🎯</button>
                            </div>
                        </div>
                        
                        <div class="color-palette">
                            ${this.defaultStyles.colorPalette.map(color => 
                                `<div class="color-swatch" data-color="${color}" style="background-color: ${color}"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <!-- Typographie : police, taille, poids, style -->
                <div class="style-section">
                    <h4>📝 Typographie</h4>
                    <div class="typography-controls">
                        <div class="control-row">
                            <label>Police:</label>
                            <select class="font-family-select">
                                ${this.defaultStyles.fonts.map(font => 
                                    `<option value="${font}">${font}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="control-row">
                            <label>Taille:</label>
                            <input type="range" class="font-size-slider" min="8" max="120" value="16">
                            <span class="font-size-display">16px</span>
                        </div>
                        
                        <div class="control-row">
                            <label>Épaisseur:</label>
                            <select class="font-weight-select">
                                ${this.defaultStyles.fontWeights.map(weight => 
                                    `<option value="${weight}">${this.getFontWeightName(weight)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="control-row">
                            <div class="font-style-buttons">
                                <button class="style-toggle-btn" data-property="fontStyle" data-value="italic">𝑰</button>
                                <button class="style-toggle-btn" data-property="textDecoration" data-value="underline">U̲</button>
                                <button class="style-toggle-btn" data-property="textDecoration" data-value="line-through">S̶</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Alignement et Position : justification et coordonnées -->
                <div class="style-section">
                    <h4>📐 Alignement & Position</h4>
                    <div class="alignment-controls">
                        <div class="text-align-buttons">
                            ${this.defaultStyles.alignments.map(align => 
                                `<button class="align-btn" data-align="${align}">${this.getAlignIcon(align)}</button>`
                            ).join('')}
                        </div>
                        
                        <div class="position-controls">
                            <div class="position-inputs">
                                <div class="coord-row">
                                    <label>X:</label>
                                    <input type="number" class="position-input" data-property="left" placeholder="auto">
                                    <span>px</span>
                                </div>
                                <div class="coord-row">
                                    <label>Y:</label>
                                    <input type="number" class="position-input" data-property="top" placeholder="auto">
                                    <span>px</span>
                                </div>
                            </div>
                            
                            <div class="position-mode">
                                <select class="position-select">
                                    <option value="static">Static</option>
                                    <option value="relative">Relative</option>
                                    <option value="absolute">Absolute</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Espacement : marges et padding -->
                <div class="style-section">
                    <h4>📏 Espacement</h4>
                    <div class="spacing-controls">
                        <div class="spacing-group">
                            <label>Marges:</label>
                            <div class="spacing-inputs">
                                <input type="number" class="spacing-input" data-property="marginTop" placeholder="0">
                                <input type="number" class="spacing-input" data-property="marginRight" placeholder="0">
                                <input type="number" class="spacing-input" data-property="marginBottom" placeholder="0">
                                <input type="number" class="spacing-input" data-property="marginLeft" placeholder="0">
                            </div>
                        </div>
                        
                        <div class="spacing-group">
                            <label>Padding:</label>
                            <div class="spacing-inputs">
                                <input type="number" class="spacing-input" data-property="paddingTop" placeholder="0">
                                <input type="number" class="spacing-input" data-property="paddingRight" placeholder="0">
                                <input type="number" class="spacing-input" data-property="paddingBottom" placeholder="0">
                                <input type="number" class="spacing-input" data-property="paddingLeft" placeholder="0">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions : boutons de contrôle -->
                <div class="style-actions">
                    <button class="reset-styles-btn">🔄 Réinitialiser</button>
                    <button class="copy-styles-btn">📋 Copier</button>
                    <button class="paste-styles-btn">📥 Coller</button>
                    <button class="apply-styles-btn">✅ Appliquer</button>
                </div>
            </div>
        `;

        // Style CSS : apparence du panneau d'édition
        panel.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 400px; max-height: 90vh; overflow-y: auto;
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            border: 2px solid #3B82F6; border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8); z-index: 10000;
            color: #F8FAFC; font-family: Inter, sans-serif;
            display: none;
        `;

        document.body.appendChild(panel);
        this.stylePanel = panel;
        this.setupPanelListeners();
    }

    /**
     * Configuration des écouteurs : gestion des interactions avec le panneau
     */
    setupPanelListeners() {
        const panel = this.stylePanel;

        // Fermeture : bouton de fermeture du panneau
        panel.querySelector('.close-panel-btn').addEventListener('click', () => {
            this.closeStyleEditor();
        });

        // Palette de couleurs : sélection rapide de couleurs
        panel.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                const activeState = panel.querySelector('.color-state-btn.active').dataset.state;
                this.applyColorToActiveProperty(color, activeState);
            });
        });

        // Contrôles de couleur : sélecteurs et pipettes
        panel.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const property = e.target.dataset.property;
                const activeState = panel.querySelector('.color-state-btn.active').dataset.state;
                this.applyStyleProperty(property, e.target.value, activeState);
            });
        });

        // États de couleur : normal, survol, actif
        panel.querySelectorAll('.color-state-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                panel.querySelectorAll('.color-state-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateColorInputsForState(e.target.dataset.state);
            });
        });

        // Contrôles de typographie : police, taille, poids
        const fontFamilySelect = panel.querySelector('.font-family-select');
        fontFamilySelect.addEventListener('change', (e) => {
            this.applyStyleProperty('fontFamily', e.target.value);
        });

        const fontSizeSlider = panel.querySelector('.font-size-slider');
        const fontSizeDisplay = panel.querySelector('.font-size-display');
        fontSizeSlider.addEventListener('input', (e) => {
            const size = e.target.value + 'px';
            fontSizeDisplay.textContent = size;
            this.applyStyleProperty('fontSize', size);
        });

        const fontWeightSelect = panel.querySelector('.font-weight-select');
        fontWeightSelect.addEventListener('change', (e) => {
            this.applyStyleProperty('fontWeight', e.target.value);
        });

        // Boutons de style : italique, souligné, barré
        panel.querySelectorAll('.style-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const property = e.target.dataset.property;
                const value = e.target.dataset.value;
                
                btn.classList.toggle('active');
                const isActive = btn.classList.contains('active');
                
                this.applyStyleProperty(property, isActive ? value : 'normal');
            });
        });

        // Alignement : boutons de justification du texte
        panel.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                panel.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyStyleProperty('textAlign', e.target.dataset.align);
            });
        });

        // Position : contrôles de coordonnées et mode de positionnement
        panel.querySelectorAll('.position-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const property = e.target.dataset.property;
                const value = e.target.value ? e.target.value + 'px' : 'auto';
                this.applyStyleProperty(property, value);
            });
        });

        const positionSelect = panel.querySelector('.position-select');
        positionSelect.addEventListener('change', (e) => {
            this.applyStyleProperty('position', e.target.value);
        });

        // Espacement : marges et padding
        panel.querySelectorAll('.spacing-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const property = e.target.dataset.property;
                const value = e.target.value ? e.target.value + 'px' : '0';
                this.applyStyleProperty(property, value);
            });
        });

        // Actions : boutons de contrôle des styles
        panel.querySelector('.reset-styles-btn').addEventListener('click', () => {
            this.resetElementStyles();
        });

        panel.querySelector('.apply-styles-btn').addEventListener('click', () => {
            this.saveAndApplyStyles();
        });
    }

    /**
     * Ouverture : affichage du panneau d'édition pour un élément spécifique
     * @param {HTMLElement} element - Élément à éditer
     */
    openStyleEditor(element) {
        this.currentElement = element;
        this.stylePanel.style.display = 'block';
        
        // Mise à jour de l'affichage : informations de l'élément
        const elementInfo = this.stylePanel.querySelector('.current-element-info');
        elementInfo.querySelector('.element-tag').textContent = element.tagName.toLowerCase();
        elementInfo.querySelector('.element-field').textContent = element.dataset.field || 'sans-champ';
        
        // Chargement : styles actuels de l'élément
        this.loadCurrentElementStyles();
        
        console.log('Éditeur de style ouvert pour:', element.dataset.field);
    }

    /**
     * Fermeture : masquage du panneau d'édition
     */
    closeStyleEditor() {
        this.stylePanel.style.display = 'none';
        this.currentElement = null;
    }

    /**
     * Chargement : récupération des styles actuels de l'élément
     */
    loadCurrentElementStyles() {
        if (!this.currentElement) return;
        
        const computedStyles = window.getComputedStyle(this.currentElement);
        const panel = this.stylePanel;
        
        // Mise à jour : contrôles de typographie
        panel.querySelector('.font-family-select').value = computedStyles.fontFamily.replace(/"/g, '');
        panel.querySelector('.font-size-slider').value = parseInt(computedStyles.fontSize);
        panel.querySelector('.font-size-display').textContent = computedStyles.fontSize;
        panel.querySelector('.font-weight-select').value = computedStyles.fontWeight;
        
        // Mise à jour : sélecteurs de couleur
        panel.querySelector('.color-picker[data-property="color"]').value = this.rgbToHex(computedStyles.color);
        panel.querySelector('.color-picker[data-property="backgroundColor"]').value = this.rgbToHex(computedStyles.backgroundColor);
        panel.querySelector('.color-picker[data-property="borderColor"]').value = this.rgbToHex(computedStyles.borderColor);
    }

    /**
     * Application : applique une propriété de style à l'élément actuel
     * @param {string} property - Propriété CSS à modifier
     * @param {string} value - Valeur à appliquer
     * @param {string} state - État (normal, hover, active)
     */
    applyStyleProperty(property, value, state = 'normal') {
        if (!this.currentElement) return;
        
        const selector = this.getElementSelector(this.currentElement);
        
        // Stockage : sauvegarde de la modification
        if (!this.currentStyles[selector]) {
            this.currentStyles[selector] = {};
        }
        
        if (!this.currentStyles[selector][state]) {
            this.currentStyles[selector][state] = {};
        }
        
        this.currentStyles[selector][state][property] = value;
        
        // Application immédiate : mise à jour visuelle
        if (state === 'normal') {
            this.currentElement.style[property] = value;
        }
        
        console.log(`Style appliqué: ${property} = ${value} (état: ${state})`);
    }

    /**
     * Génération : création d'un sélecteur unique pour l'élément
     * @param {HTMLElement} element - Élément cible
     * @return {string} - Sélecteur CSS unique
     */
    getElementSelector(element) {
        // Priorité : utilisation du data-field comme identifiant
        if (element.dataset.field) {
            return `[data-field="${element.dataset.field}"]`;
        }
        
        // Alternative : utilisation de l'ID si disponible
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Dernier recours : classe + position dans le DOM
        const className = Array.from(element.classList).join('.');
        if (className) {
            const siblings = Array.from(element.parentElement.children);
            const index = siblings.indexOf(element);
            return `.${className}:nth-child(${index + 1})`;
        }
        
        // Fallback : sélecteur par balise
        return element.tagName.toLowerCase();
    }

    /**
     * Réinitialisation : suppression de tous les styles personnalisés de l'élément
     */
    resetElementStyles() {
        if (!this.currentElement) return;
        
        const selector = this.getElementSelector(this.currentElement);
        delete this.currentStyles[selector];
        
        // Remise à zéro : suppression des styles inline
        this.currentElement.removeAttribute('style');
        
        console.log('Styles réinitialisés pour:', selector);
    }

    /**
     * Sauvegarde : persistance des styles dans localStorage
     */
    saveStyles() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentStyles));
        console.log('Styles sauvegardés:', Object.keys(this.currentStyles).length, 'éléments');
    }

    /**
     * Application complète : sauvegarde et application de tous les styles
     */
    saveAndApplyStyles() {
        this.saveStyles();
        this.applyAllStyles();
        console.log('Styles appliqués et sauvegardés');
    }

    // Utilitaires : fonctions d'aide pour les conversions et affichages

    /**
     * Conversion : RGB vers HEX
     * @param {string} rgb - Couleur au format rgb(r,g,b)
     * @return {string} - Couleur au format #RRGGBB
     */
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/\d+/g);
        if (!match) return '#000000';
        
        const hex = match.map(x => {
            const hexValue = parseInt(x).toString(16);
            return hexValue.length === 1 ? '0' + hexValue : hexValue;
        }).join('');
        
        return '#' + hex;
    }

    /**
     * Nom : conversion du poids de police en nom lisible
     * @param {string} weight - Poids numérique (300, 400, etc.)
     * @return {string} - Nom descriptif
     */
    getFontWeightName(weight) {
        const names = {
            '300': 'Light',
            '400': 'Normal',
            '500': 'Medium',
            '600': 'Semi Bold',
            '700': 'Bold',
            '800': 'Extra Bold',
            '900': 'Black'
        };
        return names[weight] || weight;
    }

    /**
     * Icône : symbole d'alignement pour les boutons
     * @param {string} align - Type d'alignement
     * @return {string} - Caractère d'icône
     */
    getAlignIcon(align) {
        const icons = {
            'left': '⫷',
            'center': '≡',
            'right': '⫸',
            'justify': '☰'
        };
        return icons[align] || align;
    }
}

// Initialisation : lancement automatique de l'éditeur
document.addEventListener('DOMContentLoaded', () => {
    window.advancedStyleEditor = new AdvancedStyleEditor();
});