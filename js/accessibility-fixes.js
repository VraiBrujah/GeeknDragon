/**
 * Script d'amélioration de l'accessibilité pour GeeknDragon
 * Corrige automatiquement les problèmes d'accessibilité des widgets tiers
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Fonction pour ajouter des attributs d'accessibilité aux champs sans id/name
    function fixFormFields() {
        const unnamedInputs = document.querySelectorAll('input:not([name]):not([id])');
        const unnamedSelects = document.querySelectorAll('select:not([name]):not([id])');
        const unnamedTextareas = document.querySelectorAll('textarea:not([name]):not([id])');
        
        let counter = 1;
        
        // Corriger les inputs
        unnamedInputs.forEach(input => {
            const fieldId = `auto-field-${counter++}`;
            input.id = fieldId;
            input.name = fieldId;
            
            // Ajouter un label si manquant
            if (!input.closest('label') && !document.querySelector(`label[for="${fieldId}"]`)) {
                const label = document.createElement('label');
                label.setAttribute('for', fieldId);
                label.textContent = input.placeholder || `Champ ${counter}`;
                label.className = 'sr-only'; // Masquer visuellement mais garder pour lecteurs d'écran
                input.parentNode.insertBefore(label, input);
            }
        });
        
        // Corriger les selects
        unnamedSelects.forEach(select => {
            const fieldId = `auto-select-${counter++}`;
            select.id = fieldId;
            select.name = fieldId;
            
            if (!select.closest('label') && !document.querySelector(`label[for="${fieldId}"]`)) {
                const label = document.createElement('label');
                label.setAttribute('for', fieldId);
                label.textContent = `Sélection ${counter}`;
                label.className = 'sr-only';
                select.parentNode.insertBefore(label, select);
            }
        });
        
        // Corriger les textareas
        unnamedTextareas.forEach(textarea => {
            const fieldId = `auto-textarea-${counter++}`;
            textarea.id = fieldId;
            textarea.name = fieldId;
            
            if (!textarea.closest('label') && !document.querySelector(`label[for="${fieldId}"]`)) {
                const label = document.createElement('label');
                label.setAttribute('for', fieldId);
                label.textContent = textarea.placeholder || `Zone de texte ${counter}`;
                label.className = 'sr-only';
                textarea.parentNode.insertBefore(label, textarea);
            }
        });
    }
    
    // Fonction pour corriger les problèmes Snipcart spécifiques
    function fixSnipcartAccessibility() {
        // Observer les mutations pour capturer les éléments ajoutés dynamiquement
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier si c'est un élément Snipcart
                            if (node.matches && (
                                node.matches('[class*="snipcart"]') || 
                                node.querySelector('[class*="snipcart"]')
                            )) {
                                setTimeout(fixFormFields, 100); // Petit délai pour laisser Snipcart s'initialiser
                            }
                        }
                    });
                }
            });
        });
        
        // Observer le body pour les changements
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Exécuter les corrections
    fixFormFields();
    fixSnipcartAccessibility();
    
    // Re-exécuter les corrections périodiquement pour capturer les éléments chargés tardivement
    setInterval(fixFormFields, 2000);
    
    console.log('✅ Script d\'accessibilité initialisé');
});

// Styles CSS pour les labels masqués visuellement mais accessibles
const accessibilityStyles = document.createElement('style');
accessibilityStyles.textContent = `
.sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}
`;
document.head.appendChild(accessibilityStyles);