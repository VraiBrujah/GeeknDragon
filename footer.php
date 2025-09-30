<footer class="bg-gray-800 py-6 text-center text-gray-400 txt-court">
  © <?= date('Y'); ?> Geek & Dragon — <span data-i18n="footer.made">Conçu au Québec.</span>
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
        load_optimized_scripts('main-bundle');
        break;
        
    default:
        load_optimized_scripts('basic');
        break;
}
?>

<!-- Script de validation du chargement -->
<script>
// Vérification que les classes critiques sont disponibles
document.addEventListener('DOMContentLoaded', function() {
    const requiredClasses = {
        'CurrencyConverterPremium': typeof CurrencyConverterPremium !== 'undefined',
        'CoinLotOptimizer': typeof CoinLotOptimizer !== 'undefined',
        'SnipcartUtils': typeof SnipcartUtils !== 'undefined'
    };
    
    let missingClasses = [];
    for (const [className, isAvailable] of Object.entries(requiredClasses)) {
        if (!isAvailable) {
            missingClasses.push(className);
        }
    }
    
    if (missingClasses.length > 0) {
        console.warn('⚠️ Classes manquantes:', missingClasses);
        
        // Tentative de rechargement des scripts individuels
        if (missingClasses.includes('CurrencyConverterPremium')) {
            const script1 = document.createElement('script');
            script1.src = '/js/currency-converter.js?v=' + Date.now();
            document.head.appendChild(script1);
        }
        
        if (missingClasses.includes('CoinLotOptimizer')) {
            const script2 = document.createElement('script');
            script2.src = '/js/coin-lot-optimizer.js?v=' + Date.now();
            document.head.appendChild(script2);
        }
        
        if (missingClasses.includes('SnipcartUtils')) {
            const script3 = document.createElement('script');
            script3.src = '/js/snipcart-utils.js?v=' + Date.now();
            document.head.appendChild(script3);
        }
    } else {
        console.log('✅ Toutes les classes requises sont disponibles');
    }
});
</script>
