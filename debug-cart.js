// Script de débogage pour tester les variations du panier
console.log('=== DÉBUT DEBUG PANIER GEEKNDRAGON ===');

// Tester l'extraction des variantes sur la page actuelle
function debugVariantExtraction() {
    console.log('🔍 Recherche des boutons d\'ajout au panier...');
    
    const buttons = document.querySelectorAll('.gd-add-to-cart');
    console.log(`📊 ${buttons.length} bouton(s) trouvé(s)`);
    
    buttons.forEach((button, index) => {
        console.log(`\n--- BOUTON ${index + 1} ---`);
        console.log('ID produit:', button.dataset.id);
        console.log('Nom produit:', button.dataset.name);
        console.log('Prix:', button.dataset.price);
        
        // Vérifier les attributs de variations
        console.log('\n🎯 ATTRIBUTS DE VARIATIONS:');
        for (let i = 1; i <= 3; i++) {
            const name = button.dataset[`custom${i}Name`];
            const value = button.dataset[`custom${i}Value`];
            const options = button.dataset[`custom${i}Options`];
            
            if (name || value || options) {
                console.log(`custom${i}Name:`, name || 'NON DÉFINI');
                console.log(`custom${i}Value:`, value || 'NON DÉFINI'); 
                console.log(`custom${i}Options:`, options || 'NON DÉFINI');
                
                if (options) {
                    const optionsList = options.split('|');
                    console.log(`  → ${optionsList.length} option(s):`, optionsList);
                }
            }
        }
        
        // Tester la fonction d'extraction si disponible
        if (window.GDEcommerce && typeof window.GDEcommerce.extractProductVariants === 'function') {
            console.log('\n🧪 TEST EXTRACTION AVEC API:');
            try {
                const variants = window.GDEcommerce.extractProductVariants(button);
                console.log('Variantes extraites:', variants);
            } catch (error) {
                console.error('Erreur lors de l\'extraction:', error);
            }
        }
    });
}

// Tester l'ajout au panier
function debugAddToCart() {
    console.log('\n🛒 TEST AJOUT AU PANIER');
    
    const button = document.querySelector('.gd-add-to-cart[data-id="lot10"]');
    if (!button) {
        console.warn('❌ Bouton lot10 non trouvé pour le test');
        return;
    }
    
    console.log('Bouton lot10 trouvé, simulation du clic...');
    
    // Écouter les événements du panier
    const originalAddToCart = window.GDEcommerce?.addToCart;
    if (originalAddToCart) {
        window.GDEcommerce.addToCart = function(productData) {
            console.log('🎯 DONNÉES ENVOYÉES À ADDTOCART:', productData);
            console.log('Variantes détectées:', productData.variants || 'AUCUNE');
            return originalAddToCart(productData);
        };
    }
    
    // Simuler le clic
    button.click();
}

// Lancer les tests après chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            debugVariantExtraction();
            setTimeout(debugAddToCart, 1000);
        }, 500);
    });
} else {
    setTimeout(() => {
        debugVariantExtraction();
        setTimeout(debugAddToCart, 1000);
    }, 500);
}

console.log('=== SCRIPT DEBUG CHARGÉ ===');