/**
 * SCRIPT DE NETTOYAGE AUTOMATIQUE DES VALEURS HARDCODÉES
 * =======================================================
 * 
 * Ce script supprime automatiquement TOUTES les valeurs hardcodées
 * des éléments avec data-pricing-value pour que le pricing-manager.js
 * puisse les calculer dynamiquement.
 * 
 * Utilisation: Exécuter dans la console du navigateur
 */

function cleanupHardcodedValues() {
    console.log('🧹 Démarrage du nettoyage automatique des valeurs hardcodées...');
    
    const elements = document.querySelectorAll('[data-pricing-value]');
    let cleanedCount = 0;
    
    elements.forEach(element => {
        const originalContent = element.textContent || '';
        
        // Liste des patterns à nettoyer
        const patternsToClean = [
            /\d[\d\s,]*\s*\$?\s*(CAD)?/g,  // Nombres avec $ ou CAD
            /\d[\d\s,]*\s*%/g,             // Pourcentages
            /\d[\d\s,]*\+/g,               // Nombres avec +
            /^\d[\d\s,]*$/g                // Nombres purs
        ];
        
        let newContent = originalContent;
        let wasModified = false;
        
        // Nettoyer les patterns
        patternsToClean.forEach(pattern => {
            const before = newContent;
            newContent = newContent.replace(pattern, '').trim();
            if (newContent !== before) wasModified = true;
        });
        
        // Conserver les mots contextuels importants
        const contextualWords = [
            'CAD', ' $', '/mois', '%', '+', 'cycles', 'économisés', 
            'ÉCONOMISÉS', 'économies', 'ÉCONOMIES', 'sur 20 ans',
            'vs', 'par unité', 'garantis', 'de réduction', 'moins cher'
        ];
        
        // Si le contenu ne contient que des espaces après nettoyage,
        // essayer de préserver au moins le contexte
        if (newContent.trim() === '' || /^[\s,$%+-]*$/.test(newContent)) {
            // Chercher des mots contextuels dans le contenu original
            let context = '';
            contextualWords.forEach(word => {
                if (originalContent.includes(word) && !context.includes(word)) {
                    context += word + ' ';
                }
            });
            newContent = context.trim();
            wasModified = true;
        }
        
        // Appliquer les changements
        if (wasModified) {
            element.textContent = newContent;
            cleanedCount++;
            console.log(`✅ Nettoyé: "${originalContent}" → "${newContent}"`);
        }
    });
    
    console.log(`🎉 Nettoyage terminé: ${cleanedCount} éléments nettoyés sur ${elements.length}`);
    
    // Déclencher la mise à jour des prix
    if (window.PricingManager) {
        setTimeout(() => {
            window.PricingManager.updatePrices();
        }, 100);
    }
}

// Lancement automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupHardcodedValues);
} else {
    cleanupHardcodedValues();
}