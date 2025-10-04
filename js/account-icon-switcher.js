/**
 * Détecte l'état de connexion Snipcart et change l'icône du compte
 *
 * Icônes :
 * - Déconnecté : compte_non_connecter.webp
 * - Connecté : compte_connecter.webp
 */

(function() {
    'use strict';

    /**
     * Met à jour l'affichage de l'icône de compte selon l'état de connexion
     */
    function updateAccountIcon() {
        const isSignedIn = window.Snipcart?.store?.getState()?.customer?.status === 'SignedIn';

        // Récupérer toutes les icônes de compte (desktop + mobile)
        const disconnectedIcons = document.querySelectorAll('.account-icon-disconnected');
        const connectedIcons = document.querySelectorAll('.account-icon-connected');
        const labels = document.querySelectorAll('.account-label');
        const buttons = document.querySelectorAll('.snipcart-customer-signin');

        if (isSignedIn) {
            // Utilisateur connecté
            disconnectedIcons.forEach(icon => icon.classList.add('hidden'));
            connectedIcons.forEach(icon => icon.classList.remove('hidden'));
            labels.forEach(label => {
                label.textContent = label.getAttribute('data-i18n') === 'nav.account'
                    ? 'Mon compte'
                    : label.textContent;
            });
            buttons.forEach(btn => {
                btn.setAttribute('title', 'Mon compte');
                btn.setAttribute('aria-label', 'Mon compte');
            });
        } else {
            // Utilisateur déconnecté
            disconnectedIcons.forEach(icon => icon.classList.remove('hidden'));
            connectedIcons.forEach(icon => icon.classList.add('hidden'));
            labels.forEach(label => {
                label.textContent = label.getAttribute('data-i18n') === 'nav.account'
                    ? 'Se connecter'
                    : label.textContent;
            });
            buttons.forEach(btn => {
                btn.setAttribute('title', 'Se connecter');
                btn.setAttribute('aria-label', 'Se connecter');
            });
        }
    }

    /**
     * Initialise la détection de l'état de connexion
     */
    function initAccountIconSwitcher() {
        // Attendre que Snipcart soit chargé
        if (window.Snipcart && window.Snipcart.events) {
            // Mise à jour initiale
            updateAccountIcon();

            // Écouter les changements d'état de connexion
            document.addEventListener('snipcart.ready', updateAccountIcon);

            // Écouter les événements de connexion/déconnexion
            window.Snipcart.events.on('customer.signedin', updateAccountIcon);
            window.Snipcart.events.on('customer.signedout', updateAccountIcon);

        } else {
            // Réessayer après 500ms si Snipcart n'est pas encore chargé
            setTimeout(initAccountIconSwitcher, 500);
        }
    }

    // Lancer l'initialisation au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccountIconSwitcher);
    } else {
        initAccountIconSwitcher();
    }
})();
