/**
 * Utilitaires d'interface utilisateur
 * 
 * Rôle : Fonctions d'aide pour l'interface et l'expérience utilisateur
 * Type : Module utilitaire pour interactions UI
 * Usage : Simplification des opérations courantes d'interface
 */

/**
 * Classe utilitaire pour l'interface utilisateur
 * 
 * Rôle : Collection de méthodes pour améliorer l'UX
 * Type : Utilitaire de manipulation DOM et gestion UI
 * Usage : Simplification des tâches communes d'interface
 */
class UIUtils {
    /**
     * Créer un élément toast de notification
     * 
     * Rôle : Génération d'une notification temporaire
     * Type : Factory de notifications
     * Paramètres : message - Texte, type - Type de notification, duration - Durée
     * Retour : HTMLElement - Élément toast créé
     * Effet de bord : Ajoute le toast au conteneur de notifications
     */
    static showToast(message, type = 'info', duration = 5000) {
        // Container de toasts
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Création du toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icône selon le type
        const iconMap = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${iconMap[type] || iconMap.info}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Ajout au container
        container.appendChild(toast);

        // Animation d'apparition
        setTimeout(() => toast.classList.add('toast-show'), 10);

        // Auto-destruction
        const autoClose = setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        // Permettre la fermeture manuelle
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoClose);
        });

        return toast;
    }

    /**
     * Affiche une boîte de confirmation personnalisée
     * 
     * Rôle : Alternative moderne au confirm() natif
     * Type : Factory de modal de confirmation
     * Paramètres : title - Titre, message - Message, options - Configuration
     * Retour : Promise<boolean> - Promesse résolue avec le choix utilisateur
     * Effet de bord : Affiche un modal de confirmation
     */
    static showConfirmDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            // Options par défaut
            const config = {
                confirmText: 'Confirmer',
                cancelText: 'Annuler',
                confirmClass: 'btn-danger',
                ...options
            };

            // Création du modal
            const modal = document.createElement('div');
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">
                            ${config.cancelText}
                        </button>
                        <button class="btn ${config.confirmClass}" data-action="confirm">
                            ${config.confirmText}
                        </button>
                    </div>
                </div>
            `;

            // Ajout au DOM
            document.body.appendChild(modal);

            // Gestion des événements
            modal.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    modal.remove();
                } else if (action === 'cancel' || e.target === modal) {
                    resolve(false);
                    modal.remove();
                }
            });

            // Focus sur le bouton de confirmation
            setTimeout(() => {
                const confirmBtn = modal.querySelector('[data-action="confirm"]');
                confirmBtn?.focus();
            }, 100);
        });
    }

    /**
     * Anime un élément avec une classe CSS temporaire
     * 
     * Rôle : Animation CSS avec cleanup automatique
     * Type : Méthode d'animation utilitaire
     * Paramètres : element - Élément à animer, animationClass - Classe CSS, duration - Durée
     * Retour : Promise<void> - Promesse résolue quand l'animation est terminée
     * Effet de bord : Ajoute et supprime une classe CSS d'animation
     */
    static animateElement(element, animationClass, duration = 500) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            // Ajout de la classe d'animation
            element.classList.add(animationClass);

            // Suppression après la durée spécifiée
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    }

    /**
     * Débounce une fonction (limitation de fréquence d'appel)
     * 
     * Rôle : Optimisation des performances pour événements fréquents
     * Type : Décorateur de fonction
     * Paramètres : func - Fonction à débouncer, wait - Délai en ms
     * Retour : Function - Fonction débouncée
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle une fonction (limitation de fréquence d'exécution)
     * 
     * Rôle : Contrôle de la fréquence d'exécution d'une fonction
     * Type : Décorateur de fonction
     * Paramètres : func - Fonction à throttler, limit - Intervalle en ms
     * Retour : Function - Fonction throttlée
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Génère un ID unique
     * 
     * Rôle : Création d'identifiants uniques pour éléments DOM
     * Type : Générateur d'ID
     * Paramètre : prefix - Préfixe optionnel
     * Retour : string - ID unique généré
     */
    static generateUID(prefix = 'uid') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Copie de texte dans le presse-papiers
     * 
     * Rôle : Copie de données textuelles dans le clipboard
     * Type : Méthode utilitaire système
     * Paramètre : text - Texte à copier
     * Retour : Promise<boolean> - Promesse résolue selon le succès
     * Effet de bord : Copie le texte dans le presse-papiers
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback pour navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'absolute';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Erreur copie presse-papiers:', error);
            return false;
        }
    }

    /**
     * Formate un nombre d'octets en format lisible
     * 
     * Rôle : Conversion de tailles de fichiers en format humain
     * Type : Formateur de données
     * Paramètre : bytes - Nombre d'octets, decimals - Précision
     * Retour : string - Taille formatée
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Valide une adresse email
     * 
     * Rôle : Validation de format d'email
     * Type : Validateur de données
     * Paramètre : email - Adresse email à valider
     * Retour : boolean - Validité de l'email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Échappe le HTML pour éviter les injections
     * 
     * Rôle : Sécurisation du contenu HTML
     * Type : Utilitaire de sécurité
     * Paramètre : text - Texte à échapper
     * Retour : string - Texte sécurisé
     */
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    /**
     * Détecte si l'appareil est un mobile/tablette
     * 
     * Rôle : Détection du type d'appareil
     * Type : Détecteur d'environnement
     * Retour : boolean - True si mobile/tablette
     */
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth <= 768;
    }

    /**
     * Observe les changements de taille d'un élément
     * 
     * Rôle : Surveillance des dimensions d'un élément
     * Type : Observer de DOM
     * Paramètres : element - Élément à observer, callback - Fonction de rappel
     * Retour : ResizeObserver - Instance de l'observateur
     * Effet de bord : Met en place la surveillance de taille
     */
    static observeResize(element, callback) {
        if (!element || typeof callback !== 'function') return null;

        if (window.ResizeObserver) {
            const observer = new ResizeObserver(callback);
            observer.observe(element);
            return observer;
        } else {
            // Fallback pour navigateurs sans ResizeObserver
            const checkResize = () => {
                callback([{
                    target: element,
                    contentRect: element.getBoundingClientRect()
                }]);
            };
            
            window.addEventListener('resize', checkResize);
            return {
                disconnect: () => window.removeEventListener('resize', checkResize)
            };
        }
    }

    /**
     * Charge une image de façon asynchrone
     * 
     * Rôle : Chargement d'image avec gestion d'erreur
     * Type : Utilitaire de chargement de ressources
     * Paramètre : src - URL de l'image
     * Retour : Promise<HTMLImageElement> - Promesse résolue avec l'image
     */
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Impossible de charger l'image: ${src}`));
            img.src = src;
        });
    }

    /**
     * Crée un sélecteur de couleur personnalisé
     * 
     * Rôle : Interface de sélection de couleur
     * Type : Composant UI
     * Paramètres : container - Container, options - Configuration
     * Retour : HTMLElement - Sélecteur de couleur
     * Effet de bord : Ajoute un color picker au container
     */
    static createColorPicker(container, options = {}) {
        const config = {
            defaultColor: '#000000',
            colors: [
                '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
                '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
            ],
            onChange: null,
            ...options
        };

        const picker = document.createElement('div');
        picker.className = 'color-picker';

        // Palette de couleurs
        const palette = document.createElement('div');
        palette.className = 'color-palette';

        config.colors.forEach(color => {
            const colorSwatch = document.createElement('button');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.title = color;
            
            colorSwatch.addEventListener('click', () => {
                // Mise à jour de la sélection
                palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
                colorSwatch.classList.add('selected');
                
                // Callback
                if (config.onChange) {
                    config.onChange(color);
                }
            });

            palette.appendChild(colorSwatch);
        });

        picker.appendChild(palette);

        // Input personnalisé
        const customInput = document.createElement('input');
        customInput.type = 'color';
        customInput.className = 'color-input';
        customInput.value = config.defaultColor;
        
        customInput.addEventListener('change', (e) => {
            if (config.onChange) {
                config.onChange(e.target.value);
            }
        });

        picker.appendChild(customInput);

        if (container) {
            container.appendChild(picker);
        }

        return picker;
    }
}

// Export pour utilisation en module ou global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
} else if (typeof window !== 'undefined') {
    window.UIUtils = UIUtils;
}