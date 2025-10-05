<footer class="bg-gray-800 py-6 text-center text-gray-400 txt-court">
  <div class="flex flex-col items-center justify-center gap-4">
    <div class="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
      <img src="/media/branding/logos/logo_fabrique_qc.png" alt="Fabriqué au Québec" class="h-auto" loading="lazy">
    </div>
    <div>
      © <?= date('Y'); ?> Geek & Dragon — <span data-i18n="footer.made">Conçu au Québec.</span>
    </div>
  </div>
</footer>

<?php
// Chargement intelligent des scripts JavaScript
require_once __DIR__ . '/includes/script-loader.php';

// Déterminer le type de page et charger les scripts appropriés
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

switch ($currentPage) {
    case 'aide-jeux':
        load_optimized_scripts('aide-jeux');
        break;
    
    case 'boutique':
        load_optimized_scripts('boutique');
        break;
    
    case 'index':
        // Utiliser exactement le même système que la boutique
        load_optimized_scripts('boutique');
        break;
        
    default:
        load_optimized_scripts('basic');
        break;
}
?>

<!-- Chargement automatique des dépendances manquantes -->
<script>
(function() {
    'use strict';
    
    let dependenciesChecked = false; // Protection anti-boucle

    function ensureDependencies() {
        console.log('=== DEBUT ensureDependencies ===');
        if (dependenciesChecked) {
            console.log('Dépendances déjà vérifiées, arrêt');
            return; // Éviter les vérifications multiples
        }
        dependenciesChecked = true;
        
        const needsConverter = document.getElementById('currency-converter-premium');
        const needsOptimizer = document.getElementById('coin-lots-recommendations');
        const needsStockLoader = document.querySelectorAll('.card[data-product-id]');
        // Ignorer les cartes dans #featured-products (gérées séparément)
        const filteredStockLoader = Array.from(needsStockLoader).filter(card => 
            !card.closest('#featured-products')
        );

        console.log('Besoins détectés:');
        console.log('- Converter:', !!needsConverter);
        console.log('- Optimizer:', !!needsOptimizer); 
        console.log('- Stock Loader:', filteredStockLoader.length, 'cartes (hors featured)');

        if (!needsConverter && !needsOptimizer && filteredStockLoader.length === 0) {
            console.log('Aucun besoin détecté, arrêt');
            return;
        }

        const missing = [];
        const loadedScripts = [];

        if (needsConverter && typeof CurrencyConverterPremium === 'undefined') {
            missing.push('currency-converter');
        }
        if (needsOptimizer && typeof CoinLotOptimizer === 'undefined') {
            missing.push('coin-lot-optimizer');
        }
        if ((needsConverter || needsOptimizer) && typeof SnipcartUtils === 'undefined') {
            missing.push('snipcart-utils');
        }
        if (filteredStockLoader.length > 0 && typeof AsyncStockLoader === 'undefined') {
            console.log('AsyncStockLoader manquant, ajout à la liste de chargement');
            missing.push('async-stock-loader');
        }

        console.log('Scripts manquants à charger:', missing);

        missing.forEach(function(scriptName) {
            console.log('Chargement du script:', scriptName);
            // Vérifier si le script n'est pas déjà en cours de chargement
            const existingScript = document.querySelector(`script[src*="${scriptName}.js"]`);
            if (!existingScript) {
                console.log('Script pas encore présent, création:', scriptName);
                const script = document.createElement('script');
                script.src = '/js/' + scriptName + '.js?v=' + Date.now();
                script.async = true;
                script.onload = function() {
                    console.log('Script chargé avec succès:', scriptName);
                    loadedScripts.push(scriptName);
                    
                    // Si c'est le stock loader qui vient d'être chargé, initialiser pour les cartes produits
                    if (scriptName === 'async-stock-loader' && window.AsyncStockLoader) {
                        console.log('AsyncStockLoader chargé, initialisation...');
                        initStockForProductCards();
                    } else if (scriptName === 'async-stock-loader') {
                        console.error('Script async-stock-loader chargé mais window.AsyncStockLoader non disponible');
                    }
                };
                script.onerror = function(error) {
                    console.error('Impossible de charger:', scriptName, error);
                };
                document.head.appendChild(script);
            } else {
                console.log('Script déjà présent dans le DOM:', scriptName, existingScript.src);
            }
        });
        
        // Si AsyncStockLoader est déjà disponible, initialiser directement (hors featured)
        if (filteredStockLoader.length > 0 && window.AsyncStockLoader) {
            console.log('AsyncStockLoader déjà disponible, initialisation...');
            initStockForProductCards();
        }
    }
    
    function initStockForProductCards() {
        console.log('=== DEBUT initStockForProductCards ===');
        const productCards = document.querySelectorAll('.card[data-product-id]');
        console.log('Cartes trouvées:', productCards.length);
        
        if (productCards.length > 0) {
            console.log('AsyncStockLoader disponible:', !!window.AsyncStockLoader);
            
            if (window.AsyncStockLoader) {
                const stockLoader = new AsyncStockLoader();
                const productIds = Array.from(productCards).map(card => {
                    const id = card.dataset.productId;
                    console.log('Carte trouvée avec ID:', id, 'Statut actuel:', card.dataset.stockStatus);
                    return id;
                }).filter(Boolean);
                
                console.log('Initialisation stock pour', productIds.length, 'produits:', productIds);
                
                if (productIds.length > 0) {
                    stockLoader.loadStock(productIds);
                    console.log('Commande de chargement envoyée');
                } else {
                    console.warn('Aucun ID de produit valide trouvé');
                }
            } else {
                console.error('AsyncStockLoader non disponible dans initStockForProductCards');
            }
        } else {
            console.warn('Aucune carte produit trouvée');
        }
        console.log('=== FIN initStockForProductCards ===');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(ensureDependencies, 100);
        });
    } else {
        setTimeout(ensureDependencies, 100);
    }
})();
</script>

<?php if ($currentPage === 'index'): ?>
<script>
// Chargement des 3 produits spécifiques pour index.php
document.addEventListener('DOMContentLoaded', function() {
    const featuredGrid = document.querySelector('#featured-products .shop-grid');
    if (featuredGrid) {
        // Produits spécifiques à charger
        const featuredProducts = [
            'coin-merchant-essence-double',
            'cards-adventurer-arsenal-190', 
            'triptych-mystery-hero'
        ];
        
        // Charger les produits via l'API
        fetch('/api/products-async.php?category=featured&products=' + featuredProducts.join(','))
            .then(response => response.json())
            .then(data => {
                if (data.html) {
                    featuredGrid.innerHTML = data.html;
                    
                    // Attendre que AsyncStockLoader soit disponible (chargé par script-loader)
                    let attempts = 0;
                    const maxAttempts = 20; // 4 secondes max (20 * 200ms)
                    
                    const waitForStockLoaderAndInit = () => {
                        attempts++;
                        
                        // Vérifier que les cartes sont bien dans le DOM
                        const cardCount = document.querySelectorAll('#featured-products [data-product-id]').length;
                        
                        if (cardCount === 0) {
                            console.warn('⚠️ Aucune carte trouvée dans featured-products');
                            return;
                        }
                        
                        if (window.AsyncStockLoader) {
                            console.log('✅ AsyncStockLoader disponible, initialisation stock featured...');
                            const stockLoader = new AsyncStockLoader();
                            stockLoader.loadStock(featuredProducts);
                            console.log('📤 Commande stock envoyée pour featured:', featuredProducts);
                        } else if (attempts < maxAttempts) {
                            console.log(`⏳ Attente AsyncStockLoader (${attempts}/${maxAttempts})...`);
                            setTimeout(waitForStockLoaderAndInit, 200);
                        } else {
                            console.warn('❌ AsyncStockLoader non disponible après', maxAttempts, 'tentatives');
                        }
                    };
                    
                    setTimeout(waitForStockLoaderAndInit, 100);
                }
            })
            .catch(error => {
                console.error('Erreur chargement produits phares:', error);
                featuredGrid.innerHTML = '<p class="text-center text-gray-400">Erreur de chargement des produits</p>';
            });
    }
});
</script>
<?php endif; ?>

