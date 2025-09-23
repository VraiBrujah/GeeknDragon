/**
 * FICHIER OBSOLÈTE - REMPLACÉ PAR dynamic-coin-recommender.js
 * 
 * Ce calculateur utilisait des IDs hardcodés et n'était pas évolutif.
 * Il a été remplacé par un système 100% dynamique avec:
 * - Chargement automatique depuis products.json
 * - Algorithme de brute force optimisé
 * - Cache intelligent
 * - Aucun hardcodage
 * 
 * Utilisez maintenant: js/dynamic-coin-recommender.js
 */

console.error('ATTENTION: coin-lots-recommender.js est obsolète. Utilisez dynamic-coin-recommender.js');

// Redirection vers le nouveau système pour compatibilité
if (window.dynamicRecommender) {
    console.log('Redirection vers le nouveau calculateur dynamique');
    window.CoinLotsRecommender = class {
        constructor() {
            console.warn('Utilisez window.dynamicRecommender au lieu de CoinLotsRecommender');
            return window.dynamicRecommender;
        }
    };
}