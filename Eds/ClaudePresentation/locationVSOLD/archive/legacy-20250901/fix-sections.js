/**
 * Script temporaire pour ajouter automatiquement les boutons sur toutes les sections
 * Rôle : Corriger l'HTML en ajoutant les boutons + et - sur toutes les sections de faiblesses et d'avantages
 */

// Fonction pour créer le HTML des boutons de contrôle
function createControlsHTML(type, index) {
    const functionName = type === 'weakness' ? 'addWeaknessAfter' : 'addStrengthAfter';
    const removeName = type === 'weakness' ? 'removeWeaknessAt' : 'removeStrengthAt';
    const addTitle = type === 'weakness' ? 'Ajouter une faiblesse après celle-ci' : 'Ajouter un avantage après celui-ci';
    const removeTitle = type === 'weakness' ? 'Supprimer cette faiblesse' : 'Supprimer cet avantage';
    
    return `
        <!-- Boutons de contrôle pour cette section -->
        <div class="section-controls-individual">
            <button class="btn-control btn-add-after" onclick="${functionName}(${index})" title="${addTitle}">
                <i class="fas fa-plus"></i>
            </button>
            <button class="btn-control btn-remove-this" onclick="${removeName}(${index})" title="${removeTitle}">
                <i class="fas fa-minus"></i>
            </button>
        </div>
        `;
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Début de la correction automatique des sections');
    
    // Correction des faiblesses (weakness3 à weakness11)
    for (let i = 4; i <= 11; i++) {
        const selector = `[data-field="weakness${i}-emoji"]`;
        const emojiInput = document.querySelector(selector);
        
        if (emojiInput) {
            // Trouver le conteneur parent
            const contentBlock = emojiInput.closest('.content-block');
            
            if (contentBlock && !contentBlock.classList.contains('weakness-block')) {
                console.log(`✅ Correction faiblesse ${i}`);
                
                // Ajouter les classes et attributs
                contentBlock.classList.add('weakness-block');
                contentBlock.dataset.index = i;
                contentBlock.style.position = 'relative';
                
                // Ajouter les boutons de contrôle
                const controlsHTML = createControlsHTML('weakness', i);
                contentBlock.insertAdjacentHTML('afterbegin', controlsHTML);
            }
        }
    }
    
    // Correction des avantages (strength1 à strength12)
    for (let i = 1; i <= 12; i++) {
        const selector = `[data-field="strength${i}-emoji"]`;
        const emojiInput = document.querySelector(selector);
        
        if (emojiInput) {
            // Trouver le conteneur parent
            const contentBlock = emojiInput.closest('.content-block');
            
            if (contentBlock && !contentBlock.classList.contains('strength-block')) {
                console.log(`✅ Correction avantage ${i}`);
                
                // Ajouter les classes et attributs
                contentBlock.classList.add('strength-block');
                contentBlock.dataset.index = i;
                contentBlock.style.position = 'relative';
                
                // Ajouter les boutons de contrôle
                const controlsHTML = createControlsHTML('strength', i);
                contentBlock.insertAdjacentHTML('afterbegin', controlsHTML);
            }
        }
    }
    
    console.log('🎉 Correction automatique terminée!');
    
    // Auto-suppression du script après utilisation
    setTimeout(() => {
        const script = document.querySelector('script[src*="fix-sections.js"]');
        if (script) {
            script.remove();
            console.log('🧹 Script de correction supprimé');
        }
    }, 2000);
});