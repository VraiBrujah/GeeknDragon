/**
 * Récepteur Présentation Li-CUBE PRO™
 * Réception et application automatique des modifications depuis les éditeurs
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

// Rôle : Détection simple et directe du type de page pour récepteur
// Type : Function - Détection basée sur l'URL de la page actuelle
function detectPageType() {
    const url = window.location.pathname.toLowerCase();
    if (url.includes('locationvsold')) return 'locationVSOLD';
    if (url.includes('locationvs')) return 'locationVS';
    if (url.includes('location')) return 'location';
    if (url.includes('vente')) return 'vente';
    return 'location'; // Par défaut
}

class PresentationReceiver {
    constructor(pageType) {
        // Configuration : type de page et identification
        this.pageType = pageType; // 'vente' ou 'location'
        this.storageKey = `licubepro-${pageType}-live`;
        
        // État : suivi des mises à jour reçues
        this.updatesReceived = 0;
        this.lastUpdate = 0;
        this.isListening = false;
        
        // Configuration : délais et options
        this.debounceDelay = 25; // Délai ultra-court pour applications immédiates
        this.maxUpdateQueue = 100;
        this.updateQueue = [];
        
        this.init();
    }

    /**
     * Initialisation : mise en place de la réception automatique
     */
    init() {
        console.log(`📡 Récepteur PRÉSENTATION ${this.pageType.toUpperCase()} - Initialisation`);
        
        this.setupStorageListeners();
        this.setupMessageListeners();
        this.startUpdateProcessing();
        this.loadInitialContent();
        this.loadCustomStyles(); // Chargement des styles personnalisés
        
        this.isListening = true;
        console.log(`✅ Récepteur PRÉSENTATION ${this.pageType.toUpperCase()} - En écoute`);
    }

    /**
     * Configuration : écoute des changements de stockage inter-onglets
     */
    setupStorageListeners() {
        // Écoute : événements storage pour communications entre onglets
        window.addEventListener('storage', (event) => {
            // Filtrage : messages de synchronisation instantanée
            if (event.key && event.key.includes(`licubepro-instant-${this.pageType}`)) {
                this.handleStorageUpdate(event);
            }
        });

        // Écoute : changements directs du storage principal
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            if (typeof localStorage === 'undefined') {
                console.error('localStorage non disponible');
                return;
            }
            const result = originalSetItem.call(localStorage, key, value);
            
            // Détection : modifications du storage principal
            if (key === this.storageKey) {
                this.handleDirectStorageChange(value);
            }
            
            return result;
        };
    }

    /**
     * Configuration : écoute des messages inter-fenêtres
     */
    setupMessageListeners() {
        // Écoute : événements personnalisés de synchronisation
        window.addEventListener('licubepro-instant-sync', (event) => {
            if (event.detail && event.detail.pageType === this.pageType) {
                this.handleSyncMessage(event.detail);
            }
        });
        
        // Écoute : messages postMessage des iframes/fenêtres
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'instant-sync' && 
                event.data.pageType === this.pageType) {
                this.handleSyncMessage(event.data);
            }
        });
        
        // Écoute : focus pour synchronisation de rattrapage
        window.addEventListener('focus', () => {
            this.loadAndApplyLatestContent();
        });
        
        // Écoute : visibilité pour sync quand la page redevient visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadAndApplyLatestContent();
            }
        });
    }

    /**
     * Traitement : message de changement de storage
     * @param {StorageEvent} event - Événement de storage
     */
    handleStorageUpdate(event) {
        if (!event.newValue) return;
        
        try {
            const syncMessage = JSON.parse(event.newValue);
            this.queueUpdate(syncMessage);
            
            console.log(`📨 Message storage reçu: ${syncMessage.fieldName || 'complet'}`);
            
        } catch (error) {
            console.error('Erreur traitement message storage:', error);
        }
    }

    /**
     * Traitement : changement direct du storage principal
     * @param {string} newValue - Nouvelle valeur du storage
     */
    handleDirectStorageChange(newValue) {
        try {
            const content = JSON.parse(newValue);
            
            // Application : contenu complet si pas de champ spécifique
            if (!content.modifiedField) {
                this.queueUpdate({
                    type: 'full-sync',
                    pageType: this.pageType,
                    fullContent: content,
                    timestamp: Date.now()
                });
            } else {
                this.queueUpdate({
                    type: 'field-sync',
                    pageType: this.pageType,
                    fieldName: content.modifiedField,
                    fieldValue: content[content.modifiedField],
                    fullContent: content,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Erreur traitement changement direct:', error);
        }
    }

    /**
     * Traitement : message de synchronisation
     * @param {Object} message - Message de synchronisation
     */
    handleSyncMessage(message) {
        if (message.source === 'presentation-receiver') {
            // Éviter : boucles de synchronisation
            return;
        }
        
        this.queueUpdate(message);
        console.log(`🔄 Message sync reçu: ${message.fieldName || 'multiple'}`);
    }

    /**
     * File d'attente : ajout d'une mise à jour à traiter
     * @param {Object} updateMessage - Message de mise à jour
     */
    queueUpdate(updateMessage) {
        // Ajout : à la file avec timestamp
        this.updateQueue.push({
            ...updateMessage,
            queuedAt: Date.now()
        });
        
        // Limitation : taille de la file pour éviter l'accumulation
        if (this.updateQueue.length > this.maxUpdateQueue) {
            this.updateQueue = this.updateQueue.slice(-this.maxUpdateQueue);
        }
        
        // Déclenchement : traitement avec anti-rebond
        this.scheduleProcessing();
    }

    /**
     * Planification : traitement des mises à jour avec anti-rebond
     */
    scheduleProcessing() {
        clearTimeout(this.processTimeout);
        this.processTimeout = setTimeout(() => {
            this.processUpdateQueue();
        }, this.debounceDelay);
    }

    /**
     * Traitement : application de toutes les mises à jour en file
     */
    processUpdateQueue() {
        if (this.updateQueue.length === 0) return;
        
        console.log(`🔄 Traitement de ${this.updateQueue.length} mises à jour`);
        
        // Groupement : mises à jour par type
        const fieldUpdates = new Map();
        const fullUpdates = [];
        
        this.updateQueue.forEach(update => {
            if (update.type === 'full-sync' || !update.fieldName) {
                fullUpdates.push(update);
            } else {
                // Dernière valeur : pour chaque champ (écrasement)
                fieldUpdates.set(update.fieldName, update);
            }
        });
        
        // Application : mises à jour complètes d'abord
        fullUpdates.forEach(update => {
            this.applyFullUpdate(update.fullContent || update.content);
        });
        
        // Application : mises à jour par champ
        fieldUpdates.forEach((update, fieldName) => {
            this.applyFieldUpdate(fieldName, update.fieldValue, update);
        });
        
        // Nettoyage : vidage de la file
        this.updatesReceived += this.updateQueue.length;
        this.lastUpdate = Date.now();
        this.updateQueue = [];
        
        console.log(`✅ ${fieldUpdates.size + fullUpdates.length} mises à jour appliquées`);
    }

    /**
     * Application : mise à jour d'un champ spécifique
     * @param {string} fieldName - Nom du champ à mettre à jour
     * @param {string} value - Nouvelle valeur
     * @param {Object} updateInfo - Informations de mise à jour
     */
    applyFieldUpdate(fieldName, value, updateInfo) {
        // Traitement spécial : champs de style CSS
        if (fieldName.startsWith('style-')) {
            this.applyStyleUpdate(fieldName, value);
            return;
        }
        
        // Traitement spécial : champs d'images (PRIORITÉ AVANT recherche d'éléments)
        if (fieldName.endsWith('-image-path')) {
            console.log(`🖼️ Traitement spécial image détecté: ${fieldName} = "${value}"`);
            this.handleSpecialFields(fieldName, value);
            // Continue le traitement normal pour synchroniser aussi les champs data-field
        }
        
        // Recherche : élément dans la page de présentation
        const elements = document.querySelectorAll(`[data-field="${fieldName}"]`);
        
        if (elements.length === 0) {
            console.warn(`⚠️ Champ non trouvé: ${fieldName}`);
            return;
        }
        
        elements.forEach(element => {
            const currentValue = this.getElementValue(element);
            
            // Vérification : changement réel nécessaire
            if (currentValue !== value) {
                this.setElementValue(element, value);
                this.animateUpdatedElement(element);
                
                console.log(`📝 Champ mis à jour: ${fieldName} = "${value}"`);
                
                // Log spécial : champs de faiblesses et avantages dynamiques
                if (fieldName.match(/^(weakness|strength)\d+-/)) {
                    console.log(`💪 Champ dynamique synchronisé: ${fieldName}`);
                }
            }
        });
        
        // Traitement spécial : création dynamique d'éléments pour nouveaux champs
        if (elements.length === 0 && fieldName.match(/^(weakness|strength)\d+-/)) {
            console.log(`🔧 Tentative de création d'élément manquant: ${fieldName}`);
            this.createDynamicElement(fieldName, value);
        }

        // Traitement spécial : champs téléphone et email pour liens
        this.handleSpecialFields(fieldName, value);
    }

    /**
     * Création dynamique : élément manquant pour nouveaux champs de faiblesses/avantages
     * @param {string} fieldName - Nom du champ (ex: "weakness13-title")
     * @param {string} value - Valeur à assigner
     */
    createDynamicElement(fieldName, value) {
        console.log(`🏗️ Création d'élément dynamique: ${fieldName}`);
        
        const match = fieldName.match(/^(weakness|strength)(\d+)-(title|desc|emoji)$/);
        if (!match) {
            console.warn(`⚠️ Format de champ non reconnu: ${fieldName}`);
            return;
        }
        
        const [, type, index, fieldType] = match;
        const isWeakness = type === 'weakness';
        
        // Sélection : conteneur approprié selon la structure de location.html
        const listSelector = isWeakness ? '.weakness-list' : '.strength-list';
        const container = document.querySelector(listSelector);
        
        if (!container) {
            console.warn(`⚠️ Conteneur non trouvé: ${listSelector}`);
            return;
        }
        
        // Vérification : élément complet n'existe pas déjà
        const itemSelector = isWeakness ? `.weakness-item` : `.strength-item`;
        const existingItem = container.querySelector(`${itemSelector}[data-index="${index}"]`);
        
        if (existingItem) {
            console.log(`ℹ️ Item déjà existant pour index ${index}, mise à jour seulement`);
            const targetElement = existingItem.querySelector(`[data-field="${fieldName}"]`);
            if (targetElement) {
                this.setElementValue(targetElement, value);
            }
            return;
        }
        
        // Création : nouvelle structure complète
        this.createCompleteItemStructure(type, index, container);
        
        console.log(`✅ Élément complet créé pour index ${index}`);
    }

    /**
     * Insertion : élément à la position correcte dans le conteneur
     * @param {HTMLElement} newItem - Nouvel élément à insérer
     * @param {HTMLElement} container - Conteneur parent
     * @param {string} index - Index numérique pour déterminer la position
     */
    insertItemAtCorrectPosition(newItem, container, index) {
        // Insertion simplifiée : toujours à la fin (plus simple pour synchronisation)
        container.appendChild(newItem);
        console.log(`✅ Élément inséré à la fin (index ${index})`);
    }

    /**
     * Création : structure complète d'un item faiblesse/avantage
     * @param {string} type - 'weakness' ou 'strength'
     * @param {string} index - Index numérique
     * @param {HTMLElement} container - Conteneur parent
     */
    createCompleteItemStructure(type, index, container) {
        const isWeakness = type === 'weakness';
        const itemClass = isWeakness ? 'weakness-item' : 'strength-item';
        const iconClass = isWeakness ? 'weakness-icon' : 'strength-icon';
        const contentClass = isWeakness ? 'weakness-content' : 'strength-content';
        
        // Valeurs par défaut
        const defaultEmoji = isWeakness ? '❓' : '⭐';
        const defaultTitle = isWeakness ? `Nouvelle Faiblesse ${index}` : `Nouvel Avantage ${index}`;
        const defaultDesc = isWeakness ? `Description de la faiblesse ${index}` : `Description de l'avantage ${index}`;
        
        // Création : structure HTML complète
        const itemHTML = `
            <div class="${itemClass} dynamic-item" data-index="${index}">
                <div class="${iconClass}">
                    <span class="editable" data-field="${type}${index}-emoji">${defaultEmoji}</span>
                </div>
                <div class="${contentClass}">
                    <h4 class="editable" data-field="${type}${index}-title">${defaultTitle}</h4>
                    <p class="editable" data-field="${type}${index}-desc">${defaultDesc}</p>
                </div>
            </div>
        `;
        
        // Insertion : avec animation
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = itemHTML;
        const newItem = tempDiv.firstElementChild;
        
        // Insertion : à la position correcte (pas d'animation dans location.html)
        this.insertItemAtCorrectPosition(newItem, container, index);
        
        console.log(`✅ Structure complète créée: ${type}${index}`);
    }

    /**
     * Application : mise à jour de style CSS via variables CSS
     * @param {string} fieldName - Nom du champ de style (ex: "style-primaryDark")
     * @param {string} value - Nouvelle valeur de couleur (ex: "#FF0000")
     */
    applyStyleUpdate(fieldName, value) {
        // Mapping : noms de champs vers variables CSS (SEULEMENT celles dans location.html)
        const styleMapping = {
            'style-primaryDark': '--primary-dark',
            'style-secondaryDark': '--secondary-dark',
            'style-textWhite': '--text-white',
            'style-textGray': '--text-gray',
            'style-accentGreen': '--accent-green',
            'style-accentBlue': '--accent-blue',
            'style-accentTeal': '--accent-teal',
            'style-successGreen': '--success-green',
            'style-warningOrange': '--warning-orange',
            'style-warningRed': '--warning-red',
            'style-vsTextColor': '--vs-text-color'
        };
        
        const cssVariable = styleMapping[fieldName];
        if (cssVariable) {
            // Application : mise à jour de la variable CSS
            console.log(`🔧 Tentative mise à jour style: ${fieldName} -> ${cssVariable} = "${value}"`);
            document.documentElement.style.setProperty(cssVariable, value);
            
            // Vérification : la valeur a-t-elle été appliquée ?
            const appliedValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariable);
            console.log(`✅ Style appliqué avec succès: ${cssVariable} = "${appliedValue.trim()}"`);
            
            // Animation : clignotement visuel pour indiquer le changement
            document.body.style.transition = 'all 0.2s ease';
            document.body.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                document.body.style.filter = 'brightness(1)';
            }, 200);
            
            // Sauvegarde : persistance des styles personnalisés
            this.saveCustomStyles();
        } else {
            console.warn(`⚠️ Variable CSS non trouvée pour: ${fieldName}`);
            console.warn(`📋 Variables disponibles:`, Object.keys(styleMapping));
        }
    }

    /**
     * Sauvegarde : styles personnalisés dans localStorage
     */
    saveCustomStyles() {
        const customStyles = {};
        const root = document.documentElement;
        
        // Extraction : toutes les variables CSS personnalisées (SEULEMENT celles existantes)
        const styleMapping = {
            '--primary-dark': 'primaryDark',
            '--secondary-dark': 'secondaryDark',
            '--text-white': 'textWhite',
            '--text-gray': 'textGray',
            '--accent-green': 'accentGreen',
            '--accent-blue': 'accentBlue',
            '--accent-teal': 'accentTeal',
            '--success-green': 'successGreen',
            '--warning-orange': 'warningOrange',
            '--warning-red': 'warningRed',
            '--vs-text-color': 'vsTextColor'
        };
        
        Object.keys(styleMapping).forEach(cssVar => {
            const computedValue = getComputedStyle(root).getPropertyValue(cssVar);
            if (computedValue) {
                customStyles[styleMapping[cssVar]] = computedValue.trim();
            }
        });
        
        // Sauvegarde : persistance locale
        localStorage.setItem(`${this.pageType}VSOLD-custom-styles`, JSON.stringify(customStyles));
    }

    /**
     * Chargement : styles personnalisés depuis localStorage
     */
    loadCustomStyles() {
        try {
            const savedStyles = localStorage.getItem(`${this.pageType}VSOLD-custom-styles`);
            if (savedStyles) {
                const customStyles = JSON.parse(savedStyles);
                
                // Mapping inverse : noms de propriétés vers variables CSS (SEULEMENT existantes)
                const styleMapping = {
                    'primaryDark': '--primary-dark',
                    'secondaryDark': '--secondary-dark',
                    'textWhite': '--text-white',
                    'textGray': '--text-gray',
                    'accentGreen': '--accent-green',
                    'accentBlue': '--accent-blue',
                    'accentTeal': '--accent-teal',
                    'successGreen': '--success-green',
                    'warningOrange': '--warning-orange',
                    'warningRed': '--warning-red',
                    'vsTextColor': '--vs-text-color'
                };
                
                // Application : chaque style personnalisé
                Object.keys(customStyles).forEach(styleName => {
                    const cssVariable = styleMapping[styleName];
                    if (cssVariable) {
                        document.documentElement.style.setProperty(cssVariable, customStyles[styleName]);
                    }
                });
                
                console.log(`🎨 ${Object.keys(customStyles).length} styles personnalisés chargés`);
            }
        } catch (error) {
            console.warn('⚠️ Erreur chargement styles personnalisés:', error);
        }
    }

    /**
     * Traitement spécial : champs nécessitant une logique particulière
     * @param {string} fieldName - Nom du champ
     * @param {string} value - Valeur du champ
     */
    handleSpecialFields(fieldName, value) {
        // Gestion : numéro de téléphone pour liens
        if (['phone-number', 'rental-phone'].includes(fieldName)) {
            const phoneLinks = document.querySelectorAll(`[data-phone-field="${fieldName}"]`);
            phoneLinks.forEach(link => {
                const cleanPhone = value.replace(/\D/g, ''); // Supprime tout sauf chiffres
                link.href = `tel:${cleanPhone}`;
                console.log(`📞 Lien téléphone mis à jour: tel:${cleanPhone}`);
            });
        }

        // Gestion : adresse email pour liens
        if (['email-address', 'rental-email'].includes(fieldName)) {
            const emailLinks = document.querySelectorAll(`[data-email-field="${fieldName}"]`);
            emailLinks.forEach(link => {
                // Conservation : sujet et corps du message existant
                const currentHref = link.href;
                const subjectMatch = currentHref.match(/subject=([^&]*)/);
                const bodyMatch = currentHref.match(/body=([^&]*)/);

                let newHref = `mailto:${value}`;
                if (subjectMatch) {
                    newHref += `?subject=${subjectMatch[1]}`;
                    if (bodyMatch) {
                        newHref += `&body=${bodyMatch[1]}`;
                    }
                } else if (bodyMatch) {
                    newHref += `?body=${bodyMatch[1]}`;
                }

                link.href = newHref;
                console.log(`📧 Lien email mis à jour: ${value}`);
            });
        }

        // Gestion : métadonnées de la page
        if (fieldName === 'page-title') {
            document.title = value;
            console.log(`📄 Titre de la page mis à jour: ${value}`);
        }
        
        if (fieldName === 'page-description') {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', value);
                console.log(`📄 Meta description mise à jour: ${value}`);
            }
        }

        // Gestion : images avec chemins dynamiques
        this.updateImageFields(fieldName, value);
    }

    /**
     * Mise à jour : images avec chemins dynamiques
     * @param {string} fieldName - Nom du champ image
     * @param {string} imagePath - Nouveau chemin de l'image
     */
    updateImageFields(fieldName, imagePath) {
        console.log(`🔍 Début updateImageFields: ${fieldName} = "${imagePath}"`);
        
        // Correspondance : nom de champ vers sélecteur d'attribut
        const imageFieldMappings = {
            'logo-path': 'logo-path',
            'product-image-path': 'product-image-path',
            'competitor-image-path': 'competitor-image-path',
            'company-image-path': 'company-image-path'
        };

        // Vérification : est-ce un champ d'image reconnu
        if (imageFieldMappings[fieldName]) {
            console.log(`✅ Champ d'image reconnu: ${fieldName}`);
            const selectorQuery = `[data-image-field="${imageFieldMappings[fieldName]}"]`;
            console.log(`🔍 Recherche éléments avec sélecteur: ${selectorQuery}`);
            
            const imageElements = document.querySelectorAll(selectorQuery);
            console.log(`📊 ${imageElements.length} éléments d'image trouvés`);

            if (imageElements.length === 0) {
                console.warn(`⚠️ Aucun élément trouvé avec data-image-field="${imageFieldMappings[fieldName]}"`);
                // Recherche alternative avec tous les attributs data-image-field
                const allImageElements = document.querySelectorAll('[data-image-field]');
                console.log(`📋 Tous les éléments avec data-image-field:`, 
                    Array.from(allImageElements).map(el => el.getAttribute('data-image-field')));
            }

            imageElements.forEach((element, index) => {
                console.log(`🖼️ Traitement élément ${index + 1}:`, element.tagName, element.classList.toString());
                
                if (element.tagName.toLowerCase() === 'img') {
                    console.log(`📸 Mise à jour src d'une balise <img>`);
                    element.setAttribute('src', imagePath);
                } else {
                    const newImageUrl = `url('${imagePath}')`;
                    console.log(`🎨 Mise à jour background-image: ${newImageUrl}`);
                    element.style.backgroundImage = newImageUrl;
                }

                this.animateImageUpdate(element);
                console.log(`✅ Image mise à jour: ${fieldName} → ${imagePath}`);
            });
        } else {
            console.warn(`⚠️ Champ d'image NON reconnu: ${fieldName}`);
            console.log(`📋 Champs d'images supportés:`, Object.keys(imageFieldMappings));
        }

        // Gestion spéciale : images dans les règles CSS existantes
        this.updateCSSImageRules(fieldName, imagePath);
    }

    /**
     * Mise à jour : règles CSS avec images
     * @param {string} fieldName - Nom du champ image
     * @param {string} imagePath - Nouveau chemin de l'image
     */
    updateCSSImageRules(fieldName, imagePath) {
        console.log(`🔧 Début updateCSSImageRules: ${fieldName} = "${imagePath}"`);
        
        // Mapping des champs vers les sélecteurs CSS
        const cssMapping = {
            'logo-path': '.nav-logo',
            'product-image-path': '.product-showcase', 
            'competitor-image-path': '.competitor-showcase',
            'company-image-path': '.company-image'
        };
        
        const targetSelector = cssMapping[fieldName];
        if (!targetSelector) {
            console.log(`ℹ️ Aucun mapping CSS pour ${fieldName}`);
            return;
        }
        
        console.log(`🎯 Cible CSS: ${targetSelector}`);
        
        // Méthode directe : mise à jour inline style (plus fiable)
        const targetElements = document.querySelectorAll(targetSelector);
        console.log(`📊 ${targetElements.length} éléments trouvés avec ${targetSelector}`);
        
        targetElements.forEach((element, index) => {
            const newImageUrl = `url('${imagePath}')`;
            element.style.backgroundImage = newImageUrl;
            console.log(`✅ Style inline mis à jour sur élément ${index + 1}: ${newImageUrl}`);
        });
        
        // Recherche : feuilles de style pour mise à jour dynamique
        const styleSheets = document.styleSheets;
        
        try {
            let rulesUpdated = 0;
            for (let i = 0; i < styleSheets.length; i++) {
                const styleSheet = styleSheets[i];
                if (!styleSheet.cssRules) continue;
                
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const rule = styleSheet.cssRules[j];
                    
                    if (rule.selectorText && rule.selectorText.includes(targetSelector.substring(1))) {
                        rule.style.backgroundImage = `url('${imagePath}')`;
                        rulesUpdated++;
                        console.log(`📝 CSS rule mise à jour: ${rule.selectorText} → ${imagePath}`);
                    }
                }
            }
            console.log(`📊 ${rulesUpdated} règles CSS mises à jour`);
        } catch (error) {
            // Fallback : si l'accès aux CSS rules échoue (CORS, etc.)
            console.warn('⚠️ Impossible de mettre à jour les CSS rules, utilisation du style inline uniquement', error);
        }
    }

    /**
     * Animation : effet visuel pour changement d'image
     * @param {HTMLElement} element - Élément image modifié
     */
    animateImageUpdate(element) {
        // Animation : effet de flash pour indiquer le changement d'image
        const originalFilter = element.style.filter;
        const originalTransform = element.style.transform;
        
        element.style.filter = 'brightness(1.3) saturate(1.2)';
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'all 0.5s ease';
        
        // Restauration : état normal après animation
        setTimeout(() => {
            element.style.filter = originalFilter;
            element.style.transform = originalTransform;
        }, 600);
    }

    /**
     * Application : mise à jour complète du contenu
     * @param {Object} content - Contenu complet à appliquer
     */
    applyFullUpdate(content) {
        if (!content) return;
        
        let updatedCount = 0;
        let existingFields = new Set();
        
        // Application : chaque champ du contenu
        Object.entries(content).forEach(([fieldName, value]) => {
            // Exclusion : champs de métadonnées
            if (['lastModified', 'modifiedField', 'timestamp'].includes(fieldName)) {
                return;
            }
            
            existingFields.add(fieldName);
            
            const elements = document.querySelectorAll(`[data-field="${fieldName}"]`);
            
            if (elements.length > 0) {
                elements.forEach(element => {
                    const currentValue = this.getElementValue(element);
                    
                    if (currentValue !== value) {
                        this.setElementValue(element, value);
                        this.animateUpdatedElement(element);
                        updatedCount++;
                    }
                });
            } else {
                // Création : élément dynamique si n'existe pas
                if (fieldName.match(/^(weakness|strength)\d+-/)) {
                    this.createDynamicElement(fieldName, value);
                    updatedCount++;
                }
            }

            // Traitement spécial : champs d'images et autres champs spéciaux
            this.handleSpecialFields(fieldName, value);
        });
        
        // Nettoyage : suppression des éléments dynamiques obsolètes
        this.cleanupRemovedElements(existingFields);
        
        if (updatedCount > 0) {
            console.log(`📋 Mise à jour complète: ${updatedCount} champs modifiés`);
        }
    }

    /**
     * Nettoyage : suppression des éléments dynamiques qui n'existent plus dans le contenu
     * @param {Set} existingFields - Set des champs présents dans le contenu
     */
    cleanupRemovedElements(existingFields) {
        console.log(`🧹 Début nettoyage des éléments obsolètes`);
        
        // Nettoyage : faiblesses obsolètes
        const weaknessItems = document.querySelectorAll('.weakness-item[data-index]');
        weaknessItems.forEach(item => {
            const index = item.dataset.index;
            const titleField = `weakness${index}-title`;
            
            if (!existingFields.has(titleField)) {
                console.log(`🗑️ Suppression faiblesse obsolète: ${index}`);
                
                item.classList.add('removing');
                setTimeout(() => {
                    item.remove();
                }, 400);
            }
        });
        
        // Nettoyage : avantages obsolètes  
        const advantageItems = document.querySelectorAll('.strength-item[data-index]');
        advantageItems.forEach(item => {
            const index = item.dataset.index;
            const titleField = `strength${index}-title`;
            
            if (!existingFields.has(titleField)) {
                console.log(`🗑️ Suppression avantage obsolète: ${index}`);
                
                item.classList.add('removing');
                setTimeout(() => {
                    item.remove();
                }, 400);
            }
        });
        
        console.log(`✅ Nettoyage terminé`);
    }

    /**
     * Lecture : valeur actuelle d'un élément
     * @param {HTMLElement} element - Élément à lire
     * @return {string} - Valeur actuelle
     */
    getElementValue(element) {
        const tagName = element.tagName.toLowerCase();

        if (element.classList.contains('section-spacer') || element.classList.contains('header-spacer')) {
            return parseInt(element.style.height) || 0;
        }

        if (tagName === 'input' || tagName === 'textarea') {
            return element.value || '';
        }
        if (element.contentEditable === 'true') {
            return element.textContent || '';
        }
        return element.textContent || element.innerText || '';
    }

    /**
     * Écriture : nouvelle valeur dans un élément
     * @param {HTMLElement} element - Élément cible
     * @param {string} value - Valeur à écrire
     */
    setElementValue(element, value) {
        const tagName = element.tagName.toLowerCase();

        if (element.classList.contains('section-spacer') || element.classList.contains('header-spacer')) {
            const height = parseInt(value, 10) || 0;
            element.style.height = `${height}px`;
        } else if (tagName === 'input' || tagName === 'textarea') {
            element.value = value;
        } else if (element.contentEditable === 'true') {
            if (typeof window !== 'undefined' && window.DOMPurify) {
                element.innerHTML = window.DOMPurify.sanitize(value);
            } else {
                element.textContent = value;
            }
        } else {
            element.textContent = value;
        }
        
        // Déclenchement : événements pour autres scripts
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Événement personnalisé : notification de mise à jour
        element.dispatchEvent(new CustomEvent('licubepro-updated', {
            detail: { fieldName: element.dataset.field, value: value },
            bubbles: true
        }));
    }

    /**
     * Animation : effet visuel sur élément mis à jour
     * @param {HTMLElement} element - Élément à animer
     */
    animateUpdatedElement(element) {
        // Animation : surbrillance bleue pour indiquer la mise à jour
        const originalBorder = element.style.border;
        const originalBackground = element.style.background;
        const originalTransform = element.style.transform;
        
        element.style.border = '2px solid #3B82F6';
        element.style.background = 'rgba(59, 130, 246, 0.1)';
        element.style.transform = 'scale(1.02)';
        element.style.transition = 'all 0.4s ease';
        
        // Restauration : état normal après animation
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.background = originalBackground;
            element.style.transform = originalTransform;
        }, 800);
    }

    /**
     * Chargement initial : contenu au démarrage de la page
     */
    loadInitialContent() {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        try {
            const content = localStorage.getItem(this.storageKey);
            if (content) {
                const parsedContent = JSON.parse(content);
                this.applyFullUpdate(parsedContent);
                console.log(`📋 Contenu initial appliqué: ${Object.keys(parsedContent).length} champs`);
            }
        } catch (error) {
            console.error('Erreur chargement initial:', error);
        }
    }

    /**
     * Chargement de rattrapage : derniers contenus en cas de désynchronisation
     */
    loadAndApplyLatestContent() {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        console.log(`🔄 Synchronisation de rattrapage ${this.pageType}...`);

        // Chargement : contenu le plus récent
        this.loadInitialContent();

        // Vérification : messages en attente dans le storage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(`licubepro-instant-${this.pageType}`)) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    if (message.timestamp > this.lastUpdate) {
                        this.queueUpdate(message);
                    }
                } catch (e) {
                    // Ignore les messages malformés
                }
            }
        }
    }

    /**
     * Démarrage : processeur de mises à jour continue
     */
    startUpdateProcessing() {
        // Traitement : toutes les 50ms pour réactivité maximale
        setInterval(() => {
            if (this.updateQueue.length > 0) {
                this.processUpdateQueue();
            }
        }, 50);
        
        // Surveillance : santé du système
        setInterval(() => {
            this.checkReceiverHealth();
        }, 30000); // 30 secondes
    }

    /**
     * Surveillance : vérification de la santé du récepteur
     */
    checkReceiverHealth() {
        if (typeof localStorage === 'undefined') {
            console.error('localStorage non disponible');
            return;
        }
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdate;

        // Diagnostic : activité récente
        if (timeSinceLastUpdate > 300000 && this.updatesReceived > 0) { // 5 minutes
            console.warn(`⚠️ Aucune mise à jour reçue depuis ${Math.round(timeSinceLastUpdate / 60000)} minutes`);
        }

        // Nettoyage : anciens messages temporaires
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('licubepro-instant-') && key.includes(this.pageType)) {
                try {
                    const message = JSON.parse(localStorage.getItem(key));
                    if (now - message.timestamp > 60000) { // 1 minute
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Suppression des messages corrompus
                    localStorage.removeItem(key);
                }
            }
        }
    }

    /**
     * Statistiques : informations sur les mises à jour reçues
     * @return {Object} - Statistiques du récepteur
     */
    getStats() {
        return {
            pageType: this.pageType,
            updatesReceived: this.updatesReceived,
            queueLength: this.updateQueue.length,
            isListening: this.isListening,
            lastUpdate: new Date(this.lastUpdate).toLocaleString(),
            timeSinceLastUpdate: Date.now() - this.lastUpdate
        };
    }

    /**
     * Arrêt : désactivation du récepteur
     */
    stop() {
        this.isListening = false;
        clearTimeout(this.processTimeout);
        this.updateQueue = [];
        console.log(`🛑 Récepteur ${this.pageType} désactivé`);
    }
}

// Auto-détection : type de page et initialisation
// Détection du type de page pour un stockage isolé
function initPresentationReceiver() {
    const pageUrl = window.location.pathname.toLowerCase();
    const pageType = detectPageType();

    // Vérification : ne s'active que sur les pages de présentation (pas les éditeurs)
    if (pageUrl.includes('edit-')) {
        console.log('🚫 Récepteur désactivé sur page éditeur');
        return null;
    }

    // Instance globale
    window.presentationReceiver = new PresentationReceiver(pageType);

    // Debug : exposition des stats
    window.getReceiverStats = () => window.presentationReceiver.getStats();

    return window.presentationReceiver;
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initPresentationReceiver);

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationReceiver;
}