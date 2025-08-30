/**
 * Détection du type de page.
 * @returns {string} Type de page détecté
 */
function detectPageType() {
    const url = window.location.pathname.toLowerCase();
    if (url.includes('locationvsold')) return 'locationVSOLD';
    if (url.includes('locationvs')) return 'locationVS';
    if (url.includes('location')) return 'location';
    if (url.includes('vente')) return 'vente';
    return 'vente';
}

if (typeof window !== 'undefined') {
    window.detectPageType = detectPageType;
}

module.exports = { detectPageType };
