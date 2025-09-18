/**
 * Configuration Snipcart dérivée de la clé rendue côté client.
 */
window.GEEKNDRAGON_SNIPCART_CONFIG = {
    apiKey: window.SNIPCART_API_KEY || '',
    currency: 'CAD',
    language: 'fr',
    modalStyle: 'side',
    addProductBehavior: 'none',
    templatesUrl: 'http://localhost:8000/templates/snipcart-templates.html',
    environment: 'development'
};
