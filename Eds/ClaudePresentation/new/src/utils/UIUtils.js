/**
 * Utilitaires d'interface utilisateur - Version allégée
 * 
 * Rôle : Fonctions essentielles pour l'interface et l'expérience utilisateur
 * Type : Module utilitaire pour interactions UI minimales
 * Usage : Simplification des opérations courantes d'interface
 */

/**
 * Classe utilitaire pour l'interface utilisateur
 * 
 * Rôle : Collection de méthodes essentielles pour l'UX
 * Type : Utilitaire de manipulation DOM et gestion UI
 * Usage : Uniquement les fonctions activement utilisées dans le projet
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
        // Rôle : Container DOM pour les notifications toast
        // Type : HTMLElement (conteneur de notifications)
        // Unité : Sans unité
        // Domaine : Élément DOM valide ou null si inexistant
        // Formule : document.getElementById('toast-container')
        // Exemple : <div id="toast-container" class="toast-container">...</div>
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Création du toast avec style et icône
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Rôle : Mapping d'icônes selon le type de notification
        // Type : Object (correspondance type → classe icône)
        // Unité : Sans unité
        // Domaine : Paires clé-valeur type et classe CSS
        // Formule : Mapping statique pour cohérence visuelle
        // Exemple : {'success': 'fas fa-check-circle', 'error': 'fas fa-exclamation-circle'}
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
            </div>
        `;

        // Ajout et animation
        container.appendChild(toast);
        
        // Auto-suppression après délai
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);

        return toast;
    }

    /**
     * Dialogue de confirmation modal
     * 
     * Rôle : Affichage d'un dialogue de confirmation utilisateur
     * Type : Factory de modal de confirmation
     * Paramètres : title - Titre, message - Message, options - Configuration
     * Retour : Promise<boolean> - true si confirmé, false si annulé
     * Effet de bord : Crée et affiche un modal de confirmation
     */
    static showConfirmDialog(title, message, options = {}) {
        return new Promise((resolve) => {
            // Rôle : Configuration par défaut du dialogue de confirmation
            // Type : Object (paramètres de configuration)
            // Unité : Sans unité
            // Domaine : Object avec propriétés optionnelles
            // Formule : Fusion options utilisateur + valeurs par défaut
            // Exemple : {confirmText: 'Oui', cancelText: 'Non', danger: false}
            const config = {
                confirmText: 'Confirmer',
                cancelText: 'Annuler',
                danger: false,
                ...options
            };

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content confirm-dialog">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">${config.cancelText}</button>
                        <button class="btn ${config.danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${config.confirmText}</button>
                    </div>
                </div>
            `;

            // Event handlers pour les boutons
            modal.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'confirm') {
                    document.body.removeChild(modal);
                    resolve(true);
                } else if (action === 'cancel' || e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            });

            document.body.appendChild(modal);
        });
    }

    /**
     * Animation d'élément avec classe CSS
     * 
     * Rôle : Application d'animation CSS temporaire sur un élément
     * Type : Utilitaire d'animation
     * Paramètres : element - Élément DOM, animationClass - Classe CSS, duration - Durée
     * Effet de bord : Ajoute et supprime une classe d'animation
     */
    static animateElement(element, animationClass, duration = 500) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.classList.add(animationClass);
            
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    }

    /**
     * Debounce pour limiter la fréquence d'exécution d'une fonction
     * 
     * Rôle : Limitation de la fréquence d'appel d'une fonction
     * Type : Higher-order function pour contrôle de fréquence
     * Paramètres : func - Fonction à débouncer, wait - Délai d'attente en ms
     * Retour : Function - Fonction débouncée
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle pour limiter la fréquence d'exécution d'une fonction
     * 
     * Rôle : Limitation de la fréquence d'appel avec intervalle régulier
     * Type : Higher-order function pour contrôle de débit
     * Paramètres : func - Fonction à throttler, limit - Intervalle minimum en ms
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
     * Génération d'identifiant unique
     * 
     * Rôle : Création d'un identifiant unique pour éléments DOM
     * Type : Factory d'identifiants uniques
     * Paramètre : prefix - Préfixe pour l'identifiant
     * Retour : String - Identifiant unique
     */
    static generateUID(prefix = 'uid') {
        // Rôle : Timestamp actuel pour unicité
        // Type : Number (millisecondes depuis epoch)
        // Unité : millisecondes (ms)
        // Domaine : Nombre positif représentant le temps
        // Formule : Date.now() → millisecondes actuelles
        // Exemple : 1704890400123
        const timestamp = Date.now();

        // Rôle : Composant aléatoire pour renforcer l'unicité
        // Type : String (caractères alphanumériques)
        // Unité : Sans unité
        // Domaine : Chaîne de 4 caractères aléatoires
        // Formule : Math.random().toString(36).substr(2, 4)
        // Exemple : 'x8k2', 'p9m1'
        const randomPart = Math.random().toString(36).substr(2, 4);
        
        return `${prefix}-${timestamp}-${randomPart}`;
    }
}

// Rôle : Export pour utilisation dans d'autres modules
// Type : Export de classe utilitaire
// Unité : Sans unité
// Domaine : Classe UIUtils complète
// Formule : Export conditionnel selon l'environnement (Node.js ou navigateur)
// Exemple : window.UIUtils = UIUtils en navigateur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
} else if (typeof window !== 'undefined') {
    window.UIUtils = UIUtils;
}