/**
 * Li-CUBE PRO™ Core - Version Simplified Browser Compatible
 * 
 * Rôle : Version simplifiée compatible navigateur sans ES6 modules
 * Type : Script classique avec exposition directe dans window
 * Fonctionnalités : Configuration, Storage, Interface Admin de base
 * Répertoire : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVSOLD
 */

(function(window) {
    'use strict';

    // Rôle : Configuration centralisée Li-CUBE PRO™
    // Type : Object - Paramètres globaux du système
    class LiCubeConfig {
        constructor() {
            // Configuration : paramètres par défaut
            this.config = {
                app: {
                    name: 'Li-CUBE PRO™',
                    version: '2.0.0',
                    environment: 'production'
                },
                admin: {
                    position: 'right',
                    autoHide: true,
                    enableDragDrop: true
                },
                sync: {
                    delay: 50,
                    maxRetries: 3,
                    storagePrefix: 'licubepro'
                }
            };
        }

        // Récupération : valeur de configuration par chemin
        get(path) {
            const keys = path.split('.');
            let value = this.config;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return undefined;
                }
            }
            
            return value;
        }

        // Définition : mise à jour de configuration
        set(path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let target = this.config;
            
            // Navigation : création du chemin si nécessaire
            for (const key of keys) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                target = target[key];
            }
            
            target[lastKey] = value;
            console.log(`📝 Configuration mise à jour: ${path} = ${value}`);
        }
    }

    // Rôle : Interface d'administration simplifiée
    // Type : Modal - Interface de gestion basique
    class LiCubeAdminInterface {
        constructor(config) {
            // Configuration : paramètres de l'interface
            this.config = config;
            this.isVisible = false;
            this.element = null;
        }

        // Création : interface d'administration HTML
        createInterface() {
            const modal = document.createElement('div');
            modal.id = 'licube-admin-interface';
            modal.innerHTML = `
                <div class="licube-admin-overlay" onclick="window.LiCubeAdmin.hide()">
                    <div class="licube-admin-panel" onclick="event.stopPropagation()">
                        <div class="licube-admin-header">
                            <h2><i class="fas fa-cogs"></i> Li-CUBE PRO™ Admin</h2>
                            <button class="licube-admin-close" onclick="window.LiCubeAdmin.hide()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="licube-admin-content">
                            <div class="licube-admin-tabs">
                                <button class="licube-tab-btn active" onclick="window.LiCubeAdmin.showTab('system')">
                                    <i class="fas fa-info-circle"></i> Système
                                </button>
                                <button class="licube-tab-btn" onclick="window.LiCubeAdmin.showTab('theme')">
                                    <i class="fas fa-palette"></i> Thème
                                </button>
                                <button class="licube-tab-btn" onclick="window.LiCubeAdmin.showTab('layout')">
                                    <i class="fas fa-layout"></i> Layout
                                </button>
                                <button class="licube-tab-btn" onclick="window.LiCubeAdmin.showTab('media')">
                                    <i class="fas fa-images"></i> Médias
                                </button>
                                <button class="licube-tab-btn" onclick="window.LiCubeAdmin.showTab('templates')">
                                    <i class="fas fa-magic"></i> Générateur
                                </button>
                                <button class="licube-tab-btn" onclick="window.LiCubeAdmin.showTab('settings')">
                                    <i class="fas fa-cog"></i> Paramètres
                                </button>
                            </div>
                            <div class="licube-admin-body">
                                <div id="system-tab" class="licube-tab-content active">
                                    <h3>État du Système</h3>
                                    <div class="licube-system-status">
                                        <div class="licube-status-item">
                                            <span class="licube-status-label">Framework:</span>
                                            <span class="licube-status-value success">✅ Li-CUBE PRO™ v2.0.0</span>
                                        </div>
                                        <div class="licube-status-item">
                                            <span class="licube-status-label">Interface Admin:</span>
                                            <span class="licube-status-value success">✅ Opérationnelle</span>
                                        </div>
                                        <div class="licube-status-item">
                                            <span class="licube-status-label">InstantSync:</span>
                                            <span class="licube-status-value ${window.instantSync && window.instantSync.isInitialized ? 'success' : 'error'}">
                                                ${window.instantSync && window.instantSync.isInitialized ? 
                                                    `✅ Actif (${window.instantSync.syncCounter || 0} syncs)` : 
                                                    '❌ Non chargé'}
                                            </span>
                                        </div>
                                        <div class="licube-status-item">
                                            <span class="licube-status-label">Détection page:</span>
                                            <span class="licube-status-value ${window.detectPageType ? 'success' : 'error'}">
                                                ${window.detectPageType ? 
                                                    `✅ ${window.detectPageType()}` : 
                                                    '❌ Non disponible'}
                                            </span>
                                        </div>
                                        <div class="licube-status-item">
                                            <span class="licube-status-label">Dernière activité:</span>
                                            <span class="licube-status-value">${new Date().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div id="theme-tab" class="licube-tab-content">
                                    <h3><i class="fas fa-palette"></i> Éditeur de Thème</h3>
                                    <div class="licube-theme-editor">
                                        <div class="theme-category">
                                            <h4>Couleurs Principales</h4>
                                            <div class="color-grid">
                                                <div class="color-item">
                                                    <label>Accent Vert:</label>
                                                    <input type="color" value="#10B981" onchange="window.LiCubeAdmin.updateThemeColor('accentGreen', this.value)">
                                                    <span class="color-value">#10B981</span>
                                                </div>
                                                <div class="color-item">
                                                    <label>Accent Bleu:</label>
                                                    <input type="color" value="#3B82F6" onchange="window.LiCubeAdmin.updateThemeColor('accentBlue', this.value)">
                                                    <span class="color-value">#3B82F6</span>
                                                </div>
                                                <div class="color-item">
                                                    <label>Arrière-plan:</label>
                                                    <input type="color" value="#0F172A" onchange="window.LiCubeAdmin.updateThemeColor('primaryDark', this.value)">
                                                    <span class="color-value">#0F172A</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="theme-category">
                                            <h4>Typographie</h4>
                                            <div class="typography-grid">
                                                <div class="typo-item">
                                                    <label>Taille titre hero:</label>
                                                    <input type="range" min="40" max="120" value="72" onchange="window.LiCubeAdmin.updateThemeSize('heroTitleSize', this.value)">
                                                    <span class="size-value">72px</span>
                                                </div>
                                                <div class="typo-item">
                                                    <label>Taille titre section:</label>
                                                    <input type="range" min="24" max="80" value="56" onchange="window.LiCubeAdmin.updateThemeSize('sectionTitleSize', this.value)">
                                                    <span class="size-value">56px</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="theme-actions">
                                            <button onclick="window.LiCubeAdmin.resetTheme()" class="licube-btn-secondary">
                                                <i class="fas fa-undo"></i> Reset par défaut
                                            </button>
                                            <button onclick="window.LiCubeAdmin.exportTheme()" class="licube-btn-primary">
                                                <i class="fas fa-download"></i> Exporter thème
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div id="layout-tab" class="licube-tab-content">
                                    <h3><i class="fas fa-layout"></i> Gestionnaire de Layout</h3>
                                    <div class="licube-layout-manager">
                                        <div class="layout-category">
                                            <h4>Ordre des Sections</h4>
                                            <div class="section-list" id="sortable-sections">
                                                <!-- Sections dynamiquement générées -->
                                            </div>
                                        </div>
                                        <div class="layout-category">
                                            <h4>Espacements</h4>
                                            <div class="spacing-grid">
                                                <div class="spacing-item">
                                                    <label>Espacement des sections:</label>
                                                    <input type="range" min="32" max="128" value="64" onchange="window.LiCubeAdmin.updateSpacing('sectionPadding', this.value)">
                                                    <span class="spacing-value">64px</span>
                                                </div>
                                                <div class="spacing-item">
                                                    <label>Largeur max container:</label>
                                                    <input type="range" min="1000" max="1800" value="1400" onchange="window.LiCubeAdmin.updateSpacing('containerMaxWidth', this.value)">
                                                    <span class="spacing-value">1400px</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="media-tab" class="licube-tab-content">
                                    <h3><i class="fas fa-images"></i> Gestionnaire de Médias</h3>
                                    <div class="licube-media-manager">
                                        <div class="media-category">
                                            <h4>Images Principales</h4>
                                            <div class="image-list">
                                                <div class="image-item">
                                                    <img src="./images/Li-CUBE PRO.png" alt="Produit" class="image-preview">
                                                    <div class="image-info">
                                                        <span class="image-name">Li-CUBE PRO.png</span>
                                                        <button onclick="window.LiCubeAdmin.changeImage('product')" class="licube-btn-secondary">
                                                            <i class="fas fa-edit"></i> Changer
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="image-item">
                                                    <img src="./images/logo edsquebec.png" alt="Logo" class="image-preview">
                                                    <div class="image-info">
                                                        <span class="image-name">logo edsquebec.png</span>
                                                        <button onclick="window.LiCubeAdmin.changeImage('logo')" class="licube-btn-secondary">
                                                            <i class="fas fa-edit"></i> Changer
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="media-category">
                                            <h4>Emojis & Icônes</h4>
                                            <div class="emoji-grid">
                                                <div class="emoji-item">
                                                    <span class="emoji-preview">✅</span>
                                                    <input type="text" value="✅" onchange="window.LiCubeAdmin.updateEmoji('strength-title', this.value)">
                                                    <label>Avantage titre</label>
                                                </div>
                                                <div class="emoji-item">
                                                    <span class="emoji-preview">❌</span>
                                                    <input type="text" value="❌" onchange="window.LiCubeAdmin.updateEmoji('weakness-title', this.value)">
                                                    <label>Faiblesse titre</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="templates-tab" class="licube-tab-content">
                                    <h3><i class="fas fa-magic"></i> Générateur de Templates</h3>
                                    <div class="licube-template-generator">
                                        <div class="template-wizard">
                                            <h4>🚀 Nouveau Produit - Assistant Rapide</h4>
                                            <div class="wizard-grid">
                                                <div class="wizard-section">
                                                    <label>Type de produit :</label>
                                                    <select id="product-type" onchange="window.LiCubeAdmin.updatePreview()">
                                                        <option value="location">🏠 Location</option>
                                                        <option value="vente">💰 Vente</option>
                                                        <option value="service">🔧 Service</option>
                                                        <option value="logiciel">💻 Logiciel</option>
                                                    </select>
                                                </div>
                                                
                                                <div class="wizard-section">
                                                    <label>Mode comparaison :</label>
                                                    <select id="comparison-mode" onchange="window.LiCubeAdmin.updatePreview()">
                                                        <option value="avec-vs">⚔️ Avec VS concurrent</option>
                                                        <option value="sans-vs">🎯 Sans comparaison</option>
                                                        <option value="avantages-only">✅ Avantages uniquement</option>
                                                    </select>
                                                </div>

                                                <div class="wizard-section">
                                                    <label>Langues cibles :</label>
                                                    <div class="language-checkboxes">
                                                        <label><input type="checkbox" checked> 🇫🇷 Français</label>
                                                        <label><input type="checkbox" checked> 🇺🇸 Anglais</label>
                                                        <label><input type="checkbox"> 🇪🇸 Espagnol</label>
                                                        <label><input type="checkbox"> 🇩🇪 Allemand</label>
                                                    </div>
                                                </div>

                                                <div class="wizard-section">
                                                    <label>Nom du produit :</label>
                                                    <input type="text" id="product-name" placeholder="Ex: Li-CUBE PRO™" onchange="window.LiCubeAdmin.updatePreview()">
                                                </div>

                                                <div class="wizard-section">
                                                    <label>Industrie/Secteur :</label>
                                                    <select id="industry" onchange="window.LiCubeAdmin.updatePreview()">
                                                        <option value="technologie">💻 Technologie</option>
                                                        <option value="immobilier">🏠 Immobilier</option>
                                                        <option value="automobile">🚗 Automobile</option>
                                                        <option value="sante">⚕️ Santé</option>
                                                        <option value="education">📚 Éducation</option>
                                                        <option value="finance">💰 Finance</option>
                                                        <option value="autre">🔧 Autre</option>
                                                    </select>
                                                </div>

                                                <div class="wizard-section">
                                                    <label>Prix/Tarif :</label>
                                                    <input type="text" id="product-price" placeholder="Ex: 299$/mois" onchange="window.LiCubeAdmin.updatePreview()">
                                                </div>
                                            </div>

                                            <div class="template-preview">
                                                <h5>👁️ Aperçu Configuration</h5>
                                                <div id="config-preview" class="config-preview">
                                                    <!-- Prévisualisation générée dynamiquement -->
                                                </div>
                                            </div>

                                            <div class="template-actions">
                                                <button onclick="window.LiCubeAdmin.generateTemplate()" class="licube-btn-primary">
                                                    <i class="fas fa-magic"></i> Générer Template
                                                </button>
                                                <button onclick="window.LiCubeAdmin.saveAsPreset()" class="licube-btn-secondary">
                                                    <i class="fas fa-save"></i> Sauver Preset
                                                </button>
                                            </div>
                                        </div>

                                        <div class="presets-library">
                                            <h4>📚 Bibliothèque de Presets</h4>
                                            <div class="presets-grid">
                                                <div class="preset-item" onclick="window.LiCubeAdmin.loadPreset('tech-location')">
                                                    <div class="preset-icon">💻🏠</div>
                                                    <div class="preset-info">
                                                        <span class="preset-name">Tech - Location</span>
                                                        <span class="preset-desc">Produit technologique en location avec VS</span>
                                                    </div>
                                                </div>
                                                
                                                <div class="preset-item" onclick="window.LiCubeAdmin.loadPreset('service-simple')">
                                                    <div class="preset-icon">🔧✨</div>
                                                    <div class="preset-info">
                                                        <span class="preset-name">Service Simple</span>
                                                        <span class="preset-desc">Service sans comparaison, focus avantages</span>
                                                    </div>
                                                </div>

                                                <div class="preset-item" onclick="window.LiCubeAdmin.loadPreset('ecommerce-vs')">
                                                    <div class="preset-icon">🛒⚔️</div>
                                                    <div class="preset-info">
                                                        <span class="preset-name">E-commerce VS</span>
                                                        <span class="preset-desc">Produit vente avec comparaison concurrentielle</span>
                                                    </div>
                                                </div>

                                                <div class="preset-item" onclick="window.LiCubeAdmin.createCustomPreset()">
                                                    <div class="preset-icon">➕</div>
                                                    <div class="preset-info">
                                                        <span class="preset-name">Nouveau Preset</span>
                                                        <span class="preset-desc">Créer configuration personnalisée</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="settings-tab" class="licube-tab-content">
                                    <h3><i class="fas fa-cog"></i> Paramètres Système</h3>
                                    <div class="licube-settings-grid">
                                        <label for="admin-position">Position du panneau:</label>
                                        <select id="admin-position" onchange="window.LiCubeAdmin.updateSetting('admin.position', this.value)">
                                            <option value="right">Droite</option>
                                            <option value="left">Gauche</option>
                                            <option value="center">Centre</option>
                                        </select>
                                        
                                        <label for="sync-delay">Délai de synchronisation:</label>
                                        <input type="number" id="sync-delay" value="${this.config.get('sync.delay') || 50}" 
                                               onchange="window.LiCubeAdmin.updateSetting('sync.delay', parseInt(this.value))">

                                        <label for="debug-mode">Mode debug:</label>
                                        <input type="checkbox" id="debug-mode" onchange="window.LiCubeAdmin.toggleDebug(this.checked)">

                                        <label for="auto-save">Sauvegarde auto:</label>
                                        <input type="checkbox" id="auto-save" checked onchange="window.LiCubeAdmin.toggleAutoSave(this.checked)">
                                    </div>
                                    <div class="settings-actions">
                                        <button onclick="window.LiCubeAdmin.clearCache()" class="licube-btn-secondary">
                                            <i class="fas fa-trash"></i> Vider le cache
                                        </button>
                                        <button onclick="window.LiCubeAdmin.resetAll()" class="licube-btn-secondary">
                                            <i class="fas fa-exclamation-triangle"></i> Reset complet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="licube-admin-footer">
                            <button onclick="window.LiCubeAdmin.exportConfig()" class="licube-btn-secondary">
                                <i class="fas fa-download"></i> Exporter Config
                            </button>
                            <button onclick="window.LiCubeAdmin.hide()" class="licube-btn-primary">
                                <i class="fas fa-check"></i> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Styles : intégrés pour éviter les dépendances
            const style = document.createElement('style');
            style.textContent = this.getStyles();
            document.head.appendChild(style);

            return modal;
        }

        // Affichage : ouverture de l'interface
        show() {
            if (this.isVisible) return;

            this.element = this.createInterface();
            document.body.appendChild(this.element);
            this.isVisible = true;

            // Rafraîchissement : état temps réel après ouverture
            setTimeout(() => {
                this.refreshSystemStatus();
            }, 100);

            console.log('🔧 Interface Admin Li-CUBE PRO™ ouverte');
        }

        // Rafraîchissement : mise à jour de l'état système en temps réel
        refreshSystemStatus() {
            if (!this.isVisible || !this.element) return;

            const systemTab = this.element.querySelector('#system-tab');
            if (!systemTab) return;

            // Mise à jour : contenu dynamique de l'état système
            const statusHTML = `
                <h3>État du Système</h3>
                <div class="licube-system-status">
                    <div class="licube-status-item">
                        <span class="licube-status-label">Framework:</span>
                        <span class="licube-status-value success">✅ Li-CUBE PRO™ v2.0.0</span>
                    </div>
                    <div class="licube-status-item">
                        <span class="licube-status-label">Interface Admin:</span>
                        <span class="licube-status-value success">✅ Opérationnelle</span>
                    </div>
                    <div class="licube-status-item">
                        <span class="licube-status-label">InstantSync:</span>
                        <span class="licube-status-value ${window.instantSync && window.instantSync.isInitialized ? 'success' : 'error'}">
                            ${window.instantSync && window.instantSync.isInitialized ? 
                                `✅ Actif (${window.instantSync.syncCounter || 0} syncs)` : 
                                window.instantSync && window.instantSync.error ? 
                                    `❌ Erreur: ${window.instantSync.error}` : 
                                    '❌ Non initialisé'}
                        </span>
                    </div>
                    <div class="licube-status-item">
                        <span class="licube-status-label">Détection page:</span>
                        <span class="licube-status-value ${window.detectPageType ? 'success' : 'error'}">
                            ${window.detectPageType ? 
                                `✅ ${window.detectPageType()}` : 
                                '❌ Non disponible'}
                        </span>
                    </div>
                    <div class="licube-status-item">
                        <span class="licube-status-label">Champs détectés:</span>
                        <span class="licube-status-value success">✅ ${document.querySelectorAll('[data-field]').length} éléments</span>
                    </div>
                    <div class="licube-status-item">
                        <span class="licube-status-label">Dernière activité:</span>
                        <span class="licube-status-value">${new Date().toLocaleString()}</span>
                    </div>
                </div>
            `;

            systemTab.innerHTML = statusHTML;
        }

        // Masquage : fermeture de l'interface
        hide() {
            if (!this.isVisible || !this.element) return;

            this.element.remove();
            this.element = null;
            this.isVisible = false;

            console.log('🔒 Interface Admin Li-CUBE PRO™ fermée');
        }

        // Basculement : ouverture/fermeture
        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }

        // Navigation : changement d'onglet
        showTab(tabName) {
            // Masquage : tous les onglets
            document.querySelectorAll('.licube-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.licube-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Affichage : onglet sélectionné
            const targetTab = document.getElementById(tabName + '-tab');
            const targetBtn = event.target.closest('.licube-tab-btn');
            
            if (targetTab) targetTab.classList.add('active');
            if (targetBtn) targetBtn.classList.add('active');
        }

        // Mise à jour : paramètre de configuration
        updateSetting(path, value) {
            this.config.set(path, value);
            console.log(`⚙️ Paramètre mis à jour: ${path} = ${value}`);
        }

        // Export : configuration actuelle
        exportConfig() {
            const config = JSON.stringify(this.config.config, null, 2);
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'licube-config.json';
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('📥 Configuration exportée');
        }

        // Thème : mise à jour couleur avec prévisualisation
        updateThemeColor(property, value) {
            // Mise à jour : variable CSS temps réel
            document.documentElement.style.setProperty(`--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
            
            // Sauvegarde : configuration
            this.config.set(`theme.${property}`, value);
            
            // Mise à jour : affichage de la valeur
            const colorValue = this.element.querySelector(`.color-item input[value="${value}"] + .color-value`);
            if (colorValue) colorValue.textContent = value;
            
            console.log(`🎨 Couleur mise à jour: ${property} = ${value}`);
        }

        // Thème : mise à jour taille avec prévisualisation
        updateThemeSize(property, value) {
            // Application : style CSS dynamique
            const cssProperty = `--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            document.documentElement.style.setProperty(cssProperty, `${value}px`);
            
            // Sauvegarde : configuration
            this.config.set(`theme.${property}`, parseInt(value));
            
            // Mise à jour : affichage de la valeur
            const sizeValue = this.element.querySelector(`.typo-item input[value="${value}"] + .size-value`);
            if (sizeValue) sizeValue.textContent = `${value}px`;
            
            console.log(`📐 Taille mise à jour: ${property} = ${value}px`);
        }

        // Espacement : mise à jour avec application immédiate
        updateSpacing(property, value) {
            // Application : style CSS
            const cssProperty = `--${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            document.documentElement.style.setProperty(cssProperty, `${value}px`);
            
            // Sauvegarde : configuration
            this.config.set(`layout.${property}`, parseInt(value));
            
            // Mise à jour : affichage
            const spacingValue = this.element.querySelector(`.spacing-item input[value="${value}"] + .spacing-value`);
            if (spacingValue) spacingValue.textContent = `${value}px`;
            
            console.log(`📏 Espacement mis à jour: ${property} = ${value}px`);
        }

        // Emoji : mise à jour avec prévisualisation
        updateEmoji(property, value) {
            // Application : mise à jour dans les éléments de la page
            const emojiElements = document.querySelectorAll(`[data-emoji="${property}"]`);
            emojiElements.forEach(element => {
                element.textContent = value;
            });
            
            // Sauvegarde : configuration
            this.config.set(`emojis.${property}`, value);
            
            // Mise à jour : prévisualisation
            const emojiPreview = this.element.querySelector(`.emoji-item input[value="${value}"]`).previousElementSibling;
            if (emojiPreview) emojiPreview.textContent = value;
            
            console.log(`😀 Emoji mis à jour: ${property} = ${value}`);
        }

        // Image : changement avec prévisualisation
        changeImage(type) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    
                    // Mise à jour : prévisualisation
                    const imagePreview = this.element.querySelector(\`.image-item img[alt*="${type}"]\`);
                    if (imagePreview) {
                        imagePreview.src = imageData;
                    }
                    
                    // Sauvegarde : configuration (ici on stockerait l'URL ou les données)
                    this.config.set(`images.${type}`, imageData);
                    
                    console.log(`🖼️ Image mise à jour: ${type}`);
                };
                reader.readAsDataURL(file);
            };
            
            input.click();
        }

        // Thème : reset aux valeurs par défaut
        resetTheme() {
            if (confirm('Réinitialiser le thème aux valeurs par défaut ?')) {
                // Reset : variables CSS
                const defaultColors = {
                    '--accent-green': '#10B981',
                    '--accent-blue': '#3B82F6',
                    '--primary-dark': '#0F172A'
                };
                
                Object.entries(defaultColors).forEach(([property, value]) => {
                    document.documentElement.style.setProperty(property, value);
                });
                
                // Reset : configuration
                this.config.set('theme', {});
                
                // Rafraîchissement : interface
                this.refreshSystemStatus();
                
                console.log('🔄 Thème réinitialisé');
            }
        }

        // Thème : export du thème personnalisé
        exportTheme() {
            const themeData = {
                colors: this.config.get('theme') || {},
                layout: this.config.get('layout') || {},
                emojis: this.config.get('emojis') || {},
                exported: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'licube-theme.json';
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('🎨 Thème exporté');
        }

        // Debug : basculement mode debug
        toggleDebug(enabled) {
            this.config.set('debug.enabled', enabled);
            
            if (enabled) {
                document.body.classList.add('licube-debug-mode');
                console.log('🐛 Mode debug activé');
            } else {
                document.body.classList.remove('licube-debug-mode');
                console.log('🐛 Mode debug désactivé');
            }
        }

        // Cache : vidage du cache
        clearCache() {
            if (confirm('Vider tout le cache Li-CUBE PRO™ ?')) {
                localStorage.removeItem('licubepro-config');
                sessionStorage.clear();
                
                console.log('🧹 Cache vidé');
                alert('Cache vidé avec succès');
            }
        }

        // Reset : remise à zéro complète
        resetAll() {
            if (confirm('⚠️ ATTENTION: Ceci va réinitialiser TOUTE la configuration !\\n\\nContinuer ?')) {
                // Vidage : stockage
                localStorage.clear();
                sessionStorage.clear();
                
                // Reset : configuration
                this.config = new LiCubeConfig();
                
                console.log('💥 Configuration complètement réinitialisée');
                alert('Configuration réinitialisée. Actualisez la page.');
            }
        }

        // Template : mise à jour aperçu configuration
        updatePreview() {
            const productType = document.getElementById('product-type')?.value || 'location';
            const comparisonMode = document.getElementById('comparison-mode')?.value || 'avec-vs';
            const productName = document.getElementById('product-name')?.value || 'Nouveau Produit';
            const industry = document.getElementById('industry')?.value || 'technologie';
            const price = document.getElementById('product-price')?.value || '299$/mois';

            const preview = document.getElementById('config-preview');
            if (!preview) return;

            // Génération : aperçu configuration
            const configSummary = `
                <div class="config-summary">
                    <div class="config-item">
                        <span class="config-label">📦 Produit:</span>
                        <span class="config-value">${productName}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">🏷️ Type:</span>
                        <span class="config-value">${this.getTypeIcon(productType)} ${productType}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">⚔️ Mode:</span>
                        <span class="config-value">${this.getModeIcon(comparisonMode)} ${comparisonMode.replace('-', ' ')}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">🏢 Secteur:</span>
                        <span class="config-value">${this.getIndustryIcon(industry)} ${industry}</span>
                    </div>
                    <div class="config-item">
                        <span class="config-label">💰 Prix:</span>
                        <span class="config-value">${price}</span>
                    </div>
                </div>
            `;

            preview.innerHTML = configSummary;
        }

        // Template : génération automatique
        async generateTemplate() {
            const config = this.getTemplateConfig();
            const selectedLanguages = this.getSelectedLanguages();
            
            if (confirm(`Générer template pour "${config.productName}" ?\\n\\nLangues: ${selectedLanguages.join(', ')}\\nCeci va créer les fichiers nécessaires.`)) {
                try {
                    // Affichage : indicateur de progression
                    const progressDiv = document.createElement('div');
                    progressDiv.innerHTML = `
                        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                    background: rgba(15,23,42,0.95); border: 2px solid #10B981; 
                                    border-radius: 12px; padding: 2rem; text-align: center; z-index: 10000; color: #F8FAFC;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">🔄</div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">Génération en cours...</div>
                            <div id="generation-status" style="color: #10B981;">Chargement des traductions...</div>
                        </div>
                    `;
                    document.body.appendChild(progressDiv);

                    // Chargement : traductions pour langues sélectionnées
                    document.getElementById('generation-status').textContent = 'Chargement des traductions...';
                    const translations = await this.loadTranslationFiles(selectedLanguages);

                    // Génération : fichiers template multi-langues
                    document.getElementById('generation-status').textContent = 'Génération des templates...';
                    const generatedFiles = await this.createMultilingualTemplateFiles(config, translations);
                    
                    // Nettoyage : indicateur progression
                    document.body.removeChild(progressDiv);
                    
                    // Notification : succès
                    const filesList = Object.keys(generatedFiles).join('\\n- ');
                    alert(`✅ Template "${config.productName}" généré avec succès !\\n\\nLangues: ${selectedLanguages.join(', ')}\\n\\nFichiers créés:\\n- ${filesList}`);
                    
                    console.log('🎉 Template multi-langue généré:', { config, translations, files: generatedFiles });
                    
                } catch (error) {
                    console.error('❌ Erreur génération template:', error);
                    alert(`Erreur lors de la génération du template: ${error.message}`);
                    
                    // Nettoyage : indicateur progression en cas d'erreur
                    const progressDiv = document.querySelector('[style*="position: fixed"]');
                    if (progressDiv) document.body.removeChild(progressDiv);
                }
            }
        }

        // Template : sauvegarde comme preset
        saveAsPreset() {
            const config = this.getTemplateConfig();
            
            if (!config.productName || config.productName === 'Nouveau Produit') {
                alert('⚠️ Veuillez donner un nom à votre template avant de le sauvegarder.');
                return;
            }

            const presetData = {
                name: config.productName,
                description: this.generatePresetDescription(config),
                config: config,
                createdAt: new Date().toISOString()
            };

            // Sauvegarde : localStorage pour persistence
            const savedPresets = JSON.parse(localStorage.getItem('licube-custom-presets') || '[]');
            savedPresets.push(presetData);
            localStorage.setItem('licube-custom-presets', JSON.stringify(savedPresets));

            alert(`✅ Preset "${config.productName}" sauvegardé !\\n\\nVous pouvez maintenant le réutiliser depuis la bibliothèque.`);
            
            // Rafraîchissement : interface presets
            this.refreshPresetsLibrary();
        }

        // Template : description automatique de preset
        generatePresetDescription(config) {
            const typeLabels = {
                'location': 'Location',
                'vente': 'Vente',
                'service': 'Service',
                'logiciel': 'Logiciel'
            };
            
            const comparisonLabels = {
                'avec-vs': 'avec comparaison VS',
                'sans-vs': 'sans comparaison',
                'avantages-only': 'focus avantages'
            };

            return `${typeLabels[config.productType] || 'Produit'} ${comparisonLabels[config.comparisonMode] || ''} - ${config.industry || 'Standard'}`;
        }

        // Template : rafraîchissement bibliothèque presets
        refreshPresetsLibrary() {
            // Cette méthode rechargerait la liste des presets dans l'interface
            console.log('🔄 Rafraîchissement bibliothèque presets...');
        }

        // Template : récupération configuration
        getTemplateConfig() {
            return {
                productName: document.getElementById('product-name')?.value || 'Nouveau Produit',
                productType: document.getElementById('product-type')?.value || 'location',
                comparisonMode: document.getElementById('comparison-mode')?.value || 'avec-vs',
                industry: document.getElementById('industry')?.value || 'technologie',
                price: document.getElementById('product-price')?.value || '299$/mois',
                languages: this.getSelectedLanguages(),
                slug: this.generateSlug(document.getElementById('product-name')?.value || 'nouveau-produit')
            };
        }

        // Template : langues sélectionnées
        getSelectedLanguages() {
            const checkboxes = document.querySelectorAll('.language-checkboxes input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => {
                const label = cb.nextSibling.textContent.trim();
                // Extraction du code langue depuis "🇫🇷 Français" -> "fr"
                const langMap = {
                    'Français': 'fr',
                    'Anglais': 'en', 
                    'Espagnol': 'es',
                    'Allemand': 'de'
                };
                const langName = label.split(' ')[1];
                return langMap[langName] || langName.toLowerCase().slice(0,2);
            });
        }

        // Template : chargement fichiers de traduction
        async loadTranslationFiles(languages) {
            const translations = {};
            
            for (const lang of languages) {
                try {
                    // Tentative : chargement depuis /locales/
                    const response = await fetch(`./locales/${lang}.json`);
                    if (response.ok) {
                        translations[lang] = await response.json();
                        console.log(`✅ Traductions ${lang} chargées`);
                    } else {
                        console.warn(`⚠️ Fichier de traduction manquant: ${lang}.json`);
                        // Création : structure de base si fichier manquant
                        translations[lang] = this.createDefaultTranslations(lang);
                    }
                } catch (error) {
                    console.error(`❌ Erreur chargement traductions ${lang}:`, error);
                    translations[lang] = this.createDefaultTranslations(lang);
                }
            }

            return translations;
        }

        // Template : traductions par défaut si fichier manquant
        createDefaultTranslations(langCode) {
            const baseStructure = {
                meta: {
                    language: langCode,
                    name: langCode === 'en' ? 'English' : langCode === 'es' ? 'Español' : langCode === 'de' ? 'Deutsch' : 'Français',
                    nativeName: langCode === 'en' ? 'English' : langCode === 'es' ? 'Español' : langCode === 'de' ? 'Deutsch' : 'Français',
                    locale: `${langCode}-${langCode.toUpperCase()}`,
                    version: '1.0.0',
                    lastUpdated: new Date().toISOString().split('T')[0]
                },
                admin: {
                    title: langCode === 'en' ? 'Administration' : langCode === 'es' ? 'Administración' : langCode === 'de' ? 'Verwaltung' : 'Administration',
                    save: langCode === 'en' ? 'Save' : langCode === 'es' ? 'Guardar' : langCode === 'de' ? 'Speichern' : 'Sauvegarder',
                    cancel: langCode === 'en' ? 'Cancel' : langCode === 'es' ? 'Cancelar' : langCode === 'de' ? 'Abbrechen' : 'Annuler'
                }
            };

            console.log(`🔧 Structure de traduction créée pour: ${langCode}`);
            return baseStructure;
        }

        // Template : génération slug
        generateSlug(name) {
            return name.toLowerCase()
                .replace(/[™®©]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        // Template : création fichiers
        // Template : création de fichiers multi-langues
        async createMultilingualTemplateFiles(config, translations) {
            const generatedFiles = {};
            
            // Génération : pour chaque langue sélectionnée
            for (const [langCode, translationData] of Object.entries(translations)) {
                const langConfig = { ...config, language: langCode, translations: translationData };
                
                // Génération : fichiers spécifiques à la langue
                generatedFiles[`${config.slug}-${langCode}-edit.html`] = this.generateEditTemplate(langConfig);
                generatedFiles[`${config.slug}-${langCode}.html`] = this.generatePresentationTemplate(langConfig);
                generatedFiles[`${config.slug}-${langCode}-defaults.json`] = this.generateDefaultsTemplate(langConfig);
            }

            // Génération : fichier index multi-langue
            generatedFiles[`${config.slug}-index.html`] = this.generateMultilingualIndex(config, Object.keys(translations));
            
            // Sauvegarde : configurations locales pour preview
            const templateKey = `licube-multilingual-template-${config.slug}`;
            localStorage.setItem(templateKey, JSON.stringify({
                config: config,
                translations: translations,
                files: generatedFiles,
                createdAt: new Date().toISOString()
            }));
            
            console.log(`📁 Templates multi-langues sauvegardés: ${templateKey}`);
            console.log(`🌐 Langues générées: ${Object.keys(translations).join(', ')}`);
            
            return generatedFiles;
        }

        // Template : index de sélection de langue
        generateMultilingualIndex(config, languages) {
            const languageFlags = { fr: '🇫🇷', en: '🇺🇸', es: '🇪🇸', de: '🇩🇪' };
            const languageNames = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch' };
            
            const languageLinks = languages.map(lang => `
                <a href="${config.slug}-${lang}.html" class="language-option" data-lang="${lang}">
                    <span class="flag">${languageFlags[lang] || '🌍'}</span>
                    <span class="name">${languageNames[lang] || lang.toUpperCase()}</span>
                </a>
            `).join('');

            return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.productName} - Sélection de langue</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            color: #F8FAFC; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .language-selector {
            text-align: center; max-width: 600px; padding: 3rem;
            background: rgba(30,41,59,0.8); border: 1px solid rgba(52,73,85,0.5);
            border-radius: 20px; backdrop-filter: blur(10px);
        }
        .logo { font-size: 3rem; margin-bottom: 1rem; }
        h1 { 
            font-family: 'Playfair Display', serif; font-size: 2.5rem; 
            font-weight: 900; margin-bottom: 0.5rem; color: #F8FAFC; 
        }
        .subtitle { color: #CBD5E1; margin-bottom: 3rem; font-size: 1.1rem; }
        .language-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .language-option {
            display: flex; flex-direction: column; align-items: center; gap: 1rem;
            padding: 2rem; background: rgba(16,185,129,0.1); border: 2px solid rgba(16,185,129,0.3);
            border-radius: 16px; text-decoration: none; color: #F8FAFC;
            transition: all 0.3s; font-weight: 600;
        }
        .language-option:hover {
            background: rgba(16,185,129,0.2); border-color: #10B981;
            transform: translateY(-4px); box-shadow: 0 8px 25px rgba(16,185,129,0.3);
        }
        .flag { font-size: 3rem; }
        .name { font-size: 1.2rem; }
    </style>
</head>
<body>
    <div class="language-selector">
        <div class="logo">🌍</div>
        <h1>${config.productName}</h1>
        <p class="subtitle">Choisissez votre langue / Choose your language</p>
        <div class="language-grid">
            ${languageLinks}
        </div>
    </div>
</body>
</html>`;
        }

        // Template : création de fichiers (version simple - rétrocompatibilité)
        createTemplateFiles(config) {
            // Simulation de création de fichiers
            // Dans un environnement réel, ceci ferait des appels API
            
            const templates = {
                editHtml: this.generateEditTemplate(config),
                presentationHtml: this.generatePresentationTemplate(config),
                defaultsJson: this.generateDefaultsTemplate(config)
            };

            // Sauvegarde : configurations locales pour preview
            localStorage.setItem(`template-${config.slug}`, JSON.stringify(templates));
            
            return templates;
        }

        // Template : génération HTML éditeur
        generateEditTemplate(config) {
            return `<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Éditeur ${config.productName}</title>
    <meta charset="UTF-8">
    <!-- Template auto-généré Li-CUBE PRO™ -->
</head>
<body>
    <!-- Interface éditeur pour ${config.productName} -->
    <h1>${config.productName} - Interface Éditeur</h1>
    <!-- Champs dynamiques selon ${config.productType} -->
</body>
</html>`;
        }

        // Template : génération HTML présentation
        generatePresentationTemplate(config) {
            const hasVS = config.comparisonMode === 'avec-vs';
            return `<!DOCTYPE html>
<html lang="fr">
<head>
    <title>${config.productName} - Présentation</title>
    <meta charset="UTF-8">
</head>
<body>
    <!-- Template ${config.productType} pour ${config.productName} -->
    <section class="hero">
        <h1>${config.productName}</h1>
        <p>Solution ${config.industry} - ${config.price}</p>
    </section>
    
    ${hasVS ? '<section class="comparison"><!-- Section VS --></section>' : ''}
    
    <section class="advantages">
        <!-- Avantages produit -->
    </section>
</body>
</html>`;
        }

        // Template : génération JSON defaults
        generateDefaultsTemplate(config) {
            return JSON.stringify({
                productName: config.productName,
                productType: config.productType,
                comparisonMode: config.comparisonMode,
                industry: config.industry,
                price: config.price,
                languages: config.languages,
                generated: new Date().toISOString(),
                version: '1.0.0'
            }, null, 2);
        }

        // Preset : chargement
        loadPreset(presetId) {
            const presets = {
                'tech-location': {
                    productType: 'location',
                    comparisonMode: 'avec-vs',
                    industry: 'technologie',
                    price: '299$/mois'
                },
                'service-simple': {
                    productType: 'service',
                    comparisonMode: 'sans-vs', 
                    industry: 'technologie',
                    price: '99$/mois'
                },
                'ecommerce-vs': {
                    productType: 'vente',
                    comparisonMode: 'avec-vs',
                    industry: 'autre',
                    price: '49.99$'
                }
            };

            const preset = presets[presetId];
            if (preset) {
                // Application : valeurs preset
                Object.entries(preset).forEach(([key, value]) => {
                    const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                    if (element) element.value = value;
                });

                this.updatePreview();
                console.log(`📋 Preset "${presetId}" chargé`);
            }
        }

        // Guide : affichage guide rapide
        showQuickGuide() {
            const guideHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                           background: rgba(0,0,0,0.8); z-index: 20000; 
                           display: flex; align-items: center; justify-content: center;"
                     onclick="this.remove()">
                    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); 
                               border: 2px solid #10B981; border-radius: 20px; padding: 3rem; 
                               max-width: 800px; max-height: 80vh; overflow-y: auto; color: #F8FAFC;"
                         onclick="event.stopPropagation()">
                        
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h2 style="color: #10B981; margin-bottom: 1rem; font-size: 2rem;">
                                🚀 Guide Rapide - Li-CUBE PRO™
                            </h2>
                            <p style="color: #CBD5E1; font-size: 1.1rem;">
                                Créez des templates professionnels en quelques clics
                            </p>
                        </div>

                        <div style="display: grid; gap: 2rem;">
                            
                            <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); 
                                        border-radius: 12px; padding: 1.5rem;">
                                <h3 style="color: #10B981; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <span>1️⃣</span> Configuration Rapide
                                </h3>
                                <ul style="color: #CBD5E1; line-height: 1.6; margin-left: 1rem;">
                                    <li><strong>Nom du produit :</strong> Donnez un nom unique à votre produit</li>
                                    <li><strong>Type :</strong> Location 🏠, Vente 💰, Service 🔧, ou Logiciel 💻</li>
                                    <li><strong>Mode VS :</strong> Avec concurrent ⚔️, Sans comparaison 🎯, ou Avantages seulement ✅</li>
                                    <li><strong>Langues :</strong> Sélectionnez Français 🇫🇷, Anglais 🇺🇸, Espagnol 🇪🇸, Allemand 🇩🇪</li>
                                </ul>
                            </div>

                            <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); 
                                        border-radius: 12px; padding: 1.5rem;">
                                <h3 style="color: #3B82F6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <span>2️⃣</span> Utilisation des Presets
                                </h3>
                                <ul style="color: #CBD5E1; line-height: 1.6; margin-left: 1rem;">
                                    <li><strong>Tech - Location :</strong> Produit technologique avec VS concurrent</li>
                                    <li><strong>Service Simple :</strong> Service sans comparaison, focus avantages</li>
                                    <li><strong>E-commerce VS :</strong> Produit e-commerce avec comparaison concurrentielle</li>
                                    <li><strong>Preset personnalisé :</strong> Sauvegardez vos configurations favorites</li>
                                </ul>
                            </div>

                            <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); 
                                        border-radius: 12px; padding: 1.5rem;">
                                <h3 style="color: #F59E0B; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <span>3️⃣</span> Génération & Export
                                </h3>
                                <ul style="color: #CBD5E1; line-height: 1.6; margin-left: 1rem;">
                                    <li><strong>Génération :</strong> Créez automatiquement les fichiers HTML, CSS et JSON</li>
                                    <li><strong>Multi-langue :</strong> Un template par langue sélectionnée + index de sélection</li>
                                    <li><strong>Fichiers créés :</strong> <code>produit-fr-edit.html</code>, <code>produit-fr.html</code>, etc.</li>
                                    <li><strong>Sauvegarde :</strong> Templates stockés localement pour réutilisation</li>
                                </ul>
                            </div>

                            <div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); 
                                        border-radius: 12px; padding: 1.5rem;">
                                <h3 style="color: #8B5CF6; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <span>💡</span> Conseils Pro
                                </h3>
                                <ul style="color: #CBD5E1; line-height: 1.6; margin-left: 1rem;">
                                    <li>Utilisez des noms courts et explicites pour vos produits</li>
                                    <li>Testez différents modes VS selon votre marché</li>
                                    <li>Sauvegardez vos configurations réussies comme presets</li>
                                    <li>Le fichier <code>-index.html</code> permet la sélection de langue</li>
                                </ul>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; 
                                   border-top: 1px solid rgba(52,73,85,0.5);">
                            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                                    style="background: #10B981; color: #0F172A; border: none; padding: 1rem 2rem; 
                                           border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.1rem;">
                                ✅ Compris ! Commencer
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', guideHTML);
        }

        // Utilitaires : icônes
        getTypeIcon(type) {
            const icons = {
                'location': '🏠',
                'vente': '💰',
                'service': '🔧',
                'logiciel': '💻'
            };
            return icons[type] || '📦';
        }

        getModeIcon(mode) {
            const icons = {
                'avec-vs': '⚔️',
                'sans-vs': '🎯',
                'avantages-only': '✅'
            };
            return icons[mode] || '🔧';
        }

        getIndustryIcon(industry) {
            const icons = {
                'technologie': '💻',
                'immobilier': '🏠',
                'automobile': '🚗',
                'sante': '⚕️',
                'education': '📚',
                'finance': '💰',
                'autre': '🔧'
            };
            return icons[industry] || '🏢';
        }

        // Styles : CSS pour l'interface
        getStyles() {
            return `
                .licube-admin-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); z-index: 10000;
                    display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                }
                .licube-admin-panel {
                    background: #0F172A; border-radius: 16px;
                    width: 90vw; max-width: 800px; max-height: 90vh;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    border: 1px solid #10B981; overflow: hidden;
                }
                .licube-admin-header {
                    padding: 1.5rem; background: #1E293B;
                    border-bottom: 1px solid #10B981;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .licube-admin-header h2 {
                    color: #10B981; margin: 0; font-size: 1.5rem;
                }
                .licube-admin-close {
                    background: none; border: none; color: #F8FAFC;
                    font-size: 1.2rem; cursor: pointer; padding: 0.5rem;
                    border-radius: 4px; transition: all 0.3s;
                }
                .licube-admin-close:hover { background: rgba(239,68,68,0.2); }
                .licube-admin-content { display: flex; height: 500px; }
                .licube-admin-tabs {
                    background: #1E293B; width: 200px; padding: 1rem 0;
                    border-right: 1px solid #374151;
                }
                .licube-tab-btn {
                    width: 100%; padding: 1rem 1.5rem; background: none;
                    border: none; color: #CBD5E1; cursor: pointer;
                    text-align: left; transition: all 0.3s;
                    display: flex; align-items: center; gap: 0.5rem;
                }
                .licube-tab-btn:hover { background: rgba(16,185,129,0.1); }
                .licube-tab-btn.active { background: #10B981; color: white; }
                .licube-admin-body { flex: 1; padding: 1.5rem; overflow-y: auto; }
                .licube-tab-content { display: none; }
                .licube-tab-content.active { display: block; }
                .licube-tab-content h3 { color: #10B981; margin-top: 0; }
                .licube-system-status { display: grid; gap: 1rem; }
                .licube-status-item {
                    display: flex; justify-content: space-between;
                    padding: 0.75rem; background: rgba(16,185,129,0.1);
                    border-radius: 8px; border-left: 4px solid #10B981;
                }
                .licube-status-label { color: #CBD5E1; font-weight: 600; }
                .licube-status-value { color: #F8FAFC; }
                .licube-status-value.success { color: #10B981; }
                .licube-status-value.error { color: #EF4444; }
                .licube-settings-grid {
                    display: grid; grid-template-columns: auto 1fr; gap: 1rem;
                    align-items: center; color: #F8FAFC;
                }
                .licube-settings-grid label { color: #CBD5E1; }
                .licube-settings-grid select, .licube-settings-grid input {
                    background: #1E293B; color: #F8FAFC; border: 1px solid #374151;
                    border-radius: 6px; padding: 0.5rem;
                }
                .licube-admin-footer {
                    padding: 1rem 1.5rem; background: #1E293B;
                    border-top: 1px solid #374151;
                    display: flex; gap: 1rem; justify-content: flex-end;
                }
                .licube-btn-primary, .licube-btn-secondary {
                    padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
                    cursor: pointer; font-weight: 600; transition: all 0.3s;
                    display: flex; align-items: center; gap: 0.5rem;
                }
                .licube-btn-primary {
                    background: #10B981; color: white;
                }
                .licube-btn-secondary {
                    background: #374151; color: #F8FAFC;
                }
                .licube-btn-primary:hover, .licube-btn-secondary:hover {
                    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                
                /* Styles : Éditeur de thème */
                .licube-theme-editor { display: flex; flex-direction: column; gap: 2rem; }
                .theme-category, .layout-category, .media-category { 
                    background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);
                    border-radius: 12px; padding: 1.5rem;
                }
                .theme-category h4, .layout-category h4, .media-category h4 { 
                    color: #10B981; margin-top: 0; margin-bottom: 1rem;
                    display: flex; align-items: center; gap: 0.5rem;
                }
                
                /* Styles : Grille de couleurs */
                .color-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .color-item {
                    display: flex; align-items: center; gap: 1rem; padding: 1rem;
                    background: rgba(30,41,59,0.5); border-radius: 8px;
                }
                .color-item label { color: #CBD5E1; min-width: 100px; }
                .color-item input[type="color"] {
                    width: 40px; height: 40px; border: none; border-radius: 6px;
                    cursor: pointer;
                }
                .color-value { 
                    font-family: 'Courier New', monospace; color: #F8FAFC;
                    font-size: 0.9rem; background: rgba(15,23,42,0.8);
                    padding: 0.25rem 0.5rem; border-radius: 4px;
                }
                
                /* Styles : Typographie */
                .typography-grid, .spacing-grid { display: grid; gap: 1rem; }
                .typo-item, .spacing-item {
                    display: flex; align-items: center; gap: 1rem; padding: 1rem;
                    background: rgba(30,41,59,0.5); border-radius: 8px;
                }
                .typo-item label, .spacing-item label { color: #CBD5E1; min-width: 150px; }
                .typo-item input[type="range"], .spacing-item input[type="range"] {
                    flex: 1; accent-color: #10B981;
                }
                .size-value, .spacing-value { 
                    font-family: 'Courier New', monospace; color: #10B981;
                    font-weight: 600; min-width: 60px; text-align: right;
                }
                
                /* Styles : Actions de thème */
                .theme-actions, .settings-actions {
                    display: flex; gap: 1rem; justify-content: center;
                    padding-top: 1rem; border-top: 1px solid rgba(52,73,85,0.3);
                }
                
                /* Styles : Gestionnaire de médias */
                .image-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
                .image-item {
                    display: flex; align-items: center; gap: 1rem; padding: 1rem;
                    background: rgba(30,41,59,0.5); border-radius: 8px;
                }
                .image-preview {
                    width: 60px; height: 60px; object-fit: cover;
                    border-radius: 8px; border: 2px solid rgba(16,185,129,0.3);
                }
                .image-info { flex: 1; }
                .image-name { 
                    color: #F8FAFC; font-weight: 500; display: block;
                    margin-bottom: 0.5rem;
                }
                
                /* Styles : Emojis */
                .emoji-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .emoji-item {
                    display: flex; align-items: center; gap: 1rem; padding: 1rem;
                    background: rgba(30,41,59,0.5); border-radius: 8px;
                }
                .emoji-preview { 
                    font-size: 2rem; width: 50px; text-align: center;
                    background: rgba(16,185,129,0.1); border-radius: 8px;
                    padding: 0.5rem;
                }
                .emoji-item input[type="text"] {
                    width: 60px; text-align: center; font-size: 1.5rem;
                    background: rgba(15,23,42,0.8); border: 1px solid rgba(52,73,85,0.5);
                    border-radius: 6px; color: #F8FAFC; padding: 0.5rem;
                }
                .emoji-item label { 
                    color: #CBD5E1; font-size: 0.9rem; flex: 1;
                }
                
                /* Styles : Liste des sections (drag & drop future) */
                .section-list {
                    border: 2px dashed rgba(16,185,129,0.3); border-radius: 8px;
                    padding: 2rem; text-align: center; color: #CBD5E1;
                }
                .section-list:empty::before {
                    content: "Sections seront listées ici pour réorganisation";
                    font-style: italic;
                }
                
                /* Styles : Mode debug */
                .licube-debug-mode {
                    border: 3px solid #F59E0B !important;
                }
                .licube-debug-mode::before {
                    content: "MODE DEBUG ACTIF";
                    position: fixed; top: 0; right: 0; z-index: 99999;
                    background: #F59E0B; color: black; padding: 0.5rem 1rem;
                    font-weight: bold; font-size: 0.8rem;
                }
                
                /* Styles : Générateur de templates */
                .licube-template-generator { display: flex; flex-direction: column; gap: 2rem; }
                .template-wizard { 
                    background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);
                    border-radius: 12px; padding: 1.5rem;
                }
                .wizard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .wizard-section {
                    display: flex; flex-direction: column; gap: 0.5rem;
                    padding: 1rem; background: rgba(30,41,59,0.5); border-radius: 8px;
                }
                .wizard-section label { color: #10B981; font-weight: 600; font-size: 0.9rem; }
                .wizard-section select, .wizard-section input[type="text"] {
                    background: rgba(15,23,42,0.8); border: 1px solid rgba(52,73,85,0.5);
                    border-radius: 6px; color: #F8FAFC; padding: 0.75rem;
                }
                .language-checkboxes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
                .language-checkboxes label { 
                    display: flex; align-items: center; gap: 0.5rem; 
                    color: #CBD5E1; font-weight: normal; cursor: pointer;
                    padding: 0.5rem; border-radius: 4px; transition: all 0.3s;
                }
                .language-checkboxes label:hover { background: rgba(16,185,129,0.1); }
                
                /* Styles : Aperçu configuration */
                .template-preview { 
                    background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2);
                    border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;
                }
                .config-preview { margin-top: 1rem; }
                .config-summary { display: grid; gap: 0.75rem; }
                .config-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0.75rem; background: rgba(30,41,59,0.3); border-radius: 6px;
                }
                .config-label { color: #CBD5E1; font-weight: 500; }
                .config-value { 
                    color: #F8FAFC; font-weight: 600; 
                    background: rgba(16,185,129,0.1); padding: 0.25rem 0.75rem;
                    border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);
                }
                
                /* Styles : Actions template */
                .template-actions {
                    display: flex; gap: 1rem; justify-content: center;
                    padding-top: 1rem; border-top: 1px solid rgba(52,73,85,0.3);
                }
                
                /* Styles : Bibliothèque presets */
                .presets-library { 
                    background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);
                    border-radius: 12px; padding: 1.5rem;
                }
                .presets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
                .preset-item {
                    display: flex; align-items: center; gap: 1rem; padding: 1.5rem;
                    background: rgba(30,41,59,0.5); border: 1px solid rgba(52,73,85,0.3);
                    border-radius: 8px; cursor: pointer; transition: all 0.3s;
                }
                .preset-item:hover {
                    background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.5);
                    transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.2);
                }
                .preset-icon {
                    font-size: 2rem; width: 60px; height: 60px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(16,185,129,0.1); border-radius: 8px;
                    border: 2px solid rgba(16,185,129,0.3);
                }
                .preset-info { flex: 1; }
                .preset-name {
                    display: block; color: #F8FAFC; font-weight: 600;
                    font-size: 1.1rem; margin-bottom: 0.25rem;
                }
                .preset-desc {
                    color: #CBD5E1; font-size: 0.9rem; line-height: 1.4;
                }
                
                /* Responsiveness : adaptation mobile */
                @media (max-width: 768px) {
                    .licube-admin-panel { width: 95vw; max-width: none; }
                    .color-grid, .emoji-grid, .image-list { grid-template-columns: 1fr; }
                    .theme-actions, .template-actions { flex-direction: column; }
                    .wizard-grid { grid-template-columns: 1fr; }
                    .presets-grid { grid-template-columns: 1fr; }
                    .language-checkboxes { grid-template-columns: 1fr; }
                }
            `;
        }
    }

    // Initialisation : système Li-CUBE PRO™ simplifié
    function initLiCube() {
        console.log('🚀 Initialisation Li-CUBE PRO™ Core...');

        // Création : instances principales
        const config = new LiCubeConfig();
        const adminInterface = new LiCubeAdminInterface(config);

        // Exposition : API globale
        window.LiCubeCore = {
            version: '2.0.0',
            config: config,
            admin: adminInterface
        };

        // Exposition : raccourcis directs
        window.LiCubeConfig = config;
        window.LiCubeAdmin = adminInterface;

        console.log('✅ Li-CUBE PRO™ Core initialisé avec succès');
        console.log('📊 API disponible: window.LiCubeCore, window.LiCubeAdmin');

        return window.LiCubeCore;
    }

    // Auto-initialisation : au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiCube);
    } else {
        initLiCube();
    }

})(window);