/**
 * 🛠️ UTILS.JS - Utilitaires Système
 * 
 * Rôle : Fonctions utilitaires globales pour l'éditeur révolutionnaire
 * Type : Module d'utilitaires statiques
 * Responsabilité : Helpers, validateurs, formatters, générateurs
 */
class Utils {
    
    /**
     * Génère un identifiant unique pour les widgets
     * 
     * @param {string} type - Type de widget 
     * @param {string} prefix - Préfixe optionnel
     * @returns {string} Identifiant unique
     */
    static generateId(type = 'widget', prefix = '') {
        // Rôle : Générateur d'ID unique temporellement et aléatoirement
        // Type : String (identifiant unique)
        // Unité : Sans unité
        // Domaine : Chaîne alphanumérique unique dans le temps
        // Formule : prefix + type + timestamp + random(9 chars)
        // Exemple : 'widget-element-universel-1704890400123-k2j9m8n7p'
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const fullPrefix = prefix ? `${prefix}-` : '';
        
        return `${fullPrefix}${type}-${timestamp}-${random}`;
    }
    
    /**
     * Valide une structure de données selon un schéma
     * 
     * @param {Object} data - Données à valider
     * @param {Object} schema - Schéma de validation
     * @returns {Object} Résultat validation {valid: boolean, errors: Array}
     */
    static validateSchema(data, schema) {
        const errors = [];
        
        // Validation des propriétés requises
        if (schema.required) {
            schema.required.forEach(prop => {
                if (!(prop in data)) {
                    errors.push(`Propriété requise manquante: ${prop}`);
                }
            });
        }
        
        // Validation des types
        if (schema.properties) {
            Object.entries(schema.properties).forEach(([prop, config]) => {
                if (prop in data) {
                    const value = data[prop];
                    const expectedType = config.type;
                    
                    if (expectedType && typeof value !== expectedType) {
                        errors.push(`Type incorrect pour ${prop}: attendu ${expectedType}, reçu ${typeof value}`);
                    }
                    
                    // Validation des valeurs minimales/maximales
                    if (config.min !== undefined && value < config.min) {
                        errors.push(`Valeur trop petite pour ${prop}: ${value} < ${config.min}`);
                    }
                    
                    if (config.max !== undefined && value > config.max) {
                        errors.push(`Valeur trop grande pour ${prop}: ${value} > ${config.max}`);
                    }
                    
                    // Validation des patterns
                    if (config.pattern && !config.pattern.test(value)) {
                        errors.push(`Format invalide pour ${prop}`);
                    }
                }
            });
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Clone profond d'un objet (sans fonctions)
     * 
     * @param {Object} obj - Objet à cloner
     * @returns {Object} Clone profond
     */
    static deepClone(obj) {
        // Rôle : Clonage profond sans références partagées
        // Type : Object (copie complète)
        // Unité : Sans unité
        // Domaine : Objects, Arrays, primitives (pas de fonctions/Symbol)
        // Formule : JSON.parse(JSON.stringify(obj)) → clonage complet
        // Exemple : Objet original modifié n'affecte pas le clone
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.warn('⚠️ Erreur de clonage, fallback vers Object.assign:', error);
            return Object.assign({}, obj);
        }
    }
    
    /**
     * Fusionne deux objets profondément
     * 
     * @param {Object} target - Objet cible
     * @param {Object} source - Objet source
     * @returns {Object} Objet fusionné
     */
    static deepMerge(target, source) {
        // Rôle : Fusion récursive de deux objets
        // Type : Object (fusion complète)
        // Unité : Sans unité
        // Domaine : Objects avec propriétés imbriquées
        // Formule : Récursion sur propriétés communes + ajout nouvelles
        // Exemple : {a: {b: 1}} + {a: {c: 2}} = {a: {b: 1, c: 2}}
        const result = this.deepClone(target);
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = result[key] || {};
                result[key] = this.deepMerge(result[key], source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    }
    
    /**
     * Débounce une fonction (limite la fréquence d'appel)
     * 
     * @param {Function} func - Fonction à débouncer
     * @param {number} delay - Délai en millisecondes
     * @returns {Function} Fonction débouncée
     */
    static debounce(func, delay) {
        // Rôle : Limiteur de fréquence d'exécution de fonction
        // Type : Function (wrapper temporisé)
        // Unité : millisecondes (ms)
        // Domaine : delay ≥ 0
        // Formule : Réinitialise timer à chaque appel, exécute après delay stable
        // Exemple : Recherche temps réel avec delay 300ms → pas de spam serveur
        let timeoutId;
        
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * Throttle une fonction (limite à un appel par période)
     * 
     * @param {Function} func - Fonction à throttler
     * @param {number} delay - Délai minimum entre appels
     * @returns {Function} Fonction throttlée
     */
    static throttle(func, delay) {
        // Rôle : Limiteur d'exécution par période fixe
        // Type : Function (wrapper cadencé)
        // Unité : millisecondes (ms)
        // Domaine : delay ≥ 0
        // Formule : Maximum 1 exécution par période de delay
        // Exemple : Scroll event avec delay 16ms → max 60fps
        let lastCall = 0;
        
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }
    
    /**
     * Formate une taille en bytes vers format lisible
     * 
     * @param {number} bytes - Taille en bytes
     * @param {number} decimals - Nombre de décimales
     * @returns {string} Taille formatée
     */
    static formatFileSize(bytes, decimals = 2) {
        // Rôle : Convertisseur de bytes vers unités lisibles
        // Type : String (taille formatée)
        // Unité : B, KB, MB, GB, TB
        // Domaine : bytes ≥ 0
        // Formule : division successive par 1024 + suffixe approprié
        // Exemple : 1536 bytes → '1.50 KB'
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * Formate un timestamp vers date lisible
     * 
     * @param {number} timestamp - Timestamp milliseconds
     * @param {string} locale - Locale (défaut: 'fr-FR')
     * @returns {string} Date formatée
     */
    static formatDate(timestamp, locale = 'fr-FR') {
        // Rôle : Convertisseur timestamp vers date localisée
        // Type : String (date formatée)
        // Unité : Sans unité
        // Domaine : Timestamp valid
        // Formule : new Date(timestamp).toLocaleString()
        // Exemple : 1704890400000 → '10/01/2024, 10:00:00'
        try {
            const date = new Date(timestamp);
            return date.toLocaleString(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return 'Date invalide';
        }
    }
    
    /**
     * Sanitise une chaîne pour utilisation en nom de fichier
     * 
     * @param {string} filename - Nom de fichier à sanitiser
     * @returns {string} Nom sanitisé
     */
    static sanitizeFilename(filename) {
        // Rôle : Nettoyeur de nom de fichier pour compatibilité système
        // Type : String (nom sécurisé)
        // Unité : Sans unité
        // Domaine : Caractères autorisés par systèmes de fichiers
        // Formule : Suppression caractères interdits + normalisation
        // Exemple : 'Mon Projet! (v2)' → 'Mon-Projet-v2'
        return filename
            .replace(/[<>:"/\\|?*]/g, '') // Caractères interdits Windows
            .replace(/[\s]+/g, '-')       // Espaces → tirets
            .replace(/[-]+/g, '-')        // Tirets multiples → simple
            .replace(/^-+|-+$/g, '')      // Tirets début/fin
            .substr(0, 255);              // Limite longueur
    }
    
    /**
     * Génère une couleur aléatoire en format hex
     * 
     * @returns {string} Couleur hex (#rrggbb)
     */
    static generateRandomColor() {
        // Rôle : Générateur de couleur aléatoire
        // Type : String (couleur hex)
        // Unité : Sans unité
        // Domaine : #000000 à #FFFFFF
        // Formule : Random 0-255 pour R,G,B → conversion hex
        // Exemple : '#3a7bd5', '#f1c40f', etc.
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    /**
     * Calcule la distance entre deux points
     * 
     * @param {Object} point1 - Point {x, y}
     * @param {Object} point2 - Point {x, y}
     * @returns {number} Distance en pixels
     */
    static calculateDistance(point1, point2) {
        // Rôle : Calculateur de distance euclidienne
        // Type : Number (distance)
        // Unité : pixels (px)
        // Domaine : distance ≥ 0
        // Formule : √((x2-x1)² + (y2-y1)²) → théorème Pythagore
        // Exemple : (0,0) et (3,4) → 5px
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Vérifie si un point est dans un rectangle
     * 
     * @param {Object} point - Point {x, y}
     * @param {Object} rect - Rectangle {x, y, width, height}
     * @returns {boolean} true si le point est dans le rectangle
     */
    static pointInRect(point, rect) {
        // Rôle : Détecteur de collision point-rectangle
        // Type : Boolean (collision détectée)
        // Unité : Sans unité
        // Domaine : Coordonnées 2D
        // Formule : (px ≥ rx && px ≤ rx+w) && (py ≥ ry && py ≤ ry+h)
        // Exemple : Point(5,5) dans Rect(0,0,10,10) → true
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width &&
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    }
    
    /**
     * Convertit les styles objet en CSS inline
     * 
     * @param {Object} styles - Styles CSS en objet
     * @returns {string} CSS inline formaté
     */
    static stylesToCSS(styles) {
        // Rôle : Convertisseur objet vers CSS inline
        // Type : String (CSS formaté)
        // Unité : Unités CSS variées
        // Domaine : Propriétés CSS valides
        // Formule : camelCase → kebab-case + propriété:valeur;
        // Exemple : {fontSize: '16px', marginTop: '10px'} → 'font-size: 16px; margin-top: 10px;'
        if (!styles || typeof styles !== 'object') {
            return '';
        }
        
        return Object.entries(styles)
            .map(([property, value]) => {
                // Conversion camelCase vers kebab-case
                const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssProperty}: ${value}`;
            })
            .join('; ');
    }
    
    /**
     * Escape HTML pour éviter les injections
     * 
     * @param {string} text - Texte à échapper
     * @returns {string} Texte sécurisé
     */
    static escapeHTML(text) {
        // Rôle : Échappeur de caractères HTML dangereux
        // Type : String (texte sécurisé)
        // Unité : Sans unité
        // Domaine : Tout texte utilisateur
        // Formule : Remplacement caractères spéciaux par entités HTML
        // Exemple : '<script>' → '&lt;script&gt;'
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Convertit camelCase vers kebab-case
     * 
     * @param {string} str - Chaîne camelCase
     * @returns {string} Chaîne kebab-case
     */
    static camelToKebab(str) {
        // Rôle : Convertisseur de casse camelCase vers kebab-case
        // Type : String (format kebab)
        // Unité : Sans unité
        // Domaine : Noms de propriétés CSS/HTML
        // Formule : Insertion tiret avant majuscule + toLowerCase()
        // Exemple : 'fontSize' → 'font-size', 'marginTop' → 'margin-top'
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    
    /**
     * Convertit kebab-case vers camelCase
     * 
     * @param {string} str - Chaîne kebab-case
     * @returns {string} Chaîne camelCase
     */
    static kebabToCamel(str) {
        // Rôle : Convertisseur de casse kebab-case vers camelCase
        // Type : String (format camel)
        // Unité : Sans unité
        // Domaine : Noms de propriétés JavaScript
        // Formule : Suppression tiret + majuscule caractère suivant
        // Exemple : 'font-size' → 'fontSize', 'margin-top' → 'marginTop'
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    
    /**
     * Log avec horodatage et couleurs
     * 
     * @param {string} level - Niveau (info, warn, error)
     * @param {string} message - Message à logger
     * @param {any} data - Données optionnelles
     */
    static log(level, message, data = null) {
        // Rôle : Logger système avec horodatage et couleurs
        // Type : Void (effet de bord console)
        // Unité : Sans unité
        // Domaine : Messages de debug/info/erreur
        // Formule : console[level] avec formatage timestamp
        // Exemple : Utils.log('info', 'Widget créé', {id: 'widget-123'})
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        const prefix = `[${timestamp}] 🎯`;
        
        const colors = {
            info: 'color: #3498db',
            warn: 'color: #f39c12',
            error: 'color: #e74c3c',
            success: 'color: #2ecc71'
        };
        
        const color = colors[level] || colors.info;
        
        if (data) {
            console[level === 'error' ? 'error' : 'log'](
                `%c${prefix} ${message}`, color, data
            );
        } else {
            console[level === 'error' ? 'error' : 'log'](
                `%c${prefix} ${message}`, color
            );
        }
    }
    
    /**
     * Vérifie si l'environnement est en mode développement
     * 
     * @returns {boolean} true en mode dev
     */
    static isDevelopment() {
        // Rôle : Détecteur d'environnement de développement
        // Type : Boolean (mode détecté)
        // Unité : Sans unité
        // Domaine : true (dev) | false (production)
        // Formule : Vérification localhost ou paramètres debug
        // Exemple : localhost:3000 → true, domain.com → false
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.search.includes('debug=true');
    }
}

// Export pour utilisation globale
window.Utils = Utils;