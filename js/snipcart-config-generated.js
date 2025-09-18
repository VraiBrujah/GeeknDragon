/**
 * Configuration Snipcart générée côté client sans inclure de secret.
 *
 * La clé publique est récupérée depuis api/public-config.js.php qui se charge
 * d'exposer window.SNIPCART_API_KEY après lecture du fichier config.php.
 */
(function () {
    const publicKey = typeof window !== 'undefined' ? window.SNIPCART_API_KEY || '' : '';

    const baseConfig = {
        apiKey: publicKey,
        currency: "CAD",
        language: "fr",
        modalStyle: "side",
        addProductBehavior: "none",
        templatesUrl: "/templates/snipcart-templates.html",
        environment: "development"
    };

    if (typeof window !== 'undefined') {
        window.GEEKNDRAGON_SNIPCART_CONFIG = {
            ...(window.GEEKNDRAGON_SNIPCART_CONFIG || {}),
            ...baseConfig
        };
    }
})();
