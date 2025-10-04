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
        load_optimized_scripts('main-bundle');
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
        if (dependenciesChecked) {
            return; // Éviter les vérifications multiples
        }
        dependenciesChecked = true;
        
        const needsConverter = document.getElementById('currency-converter-premium');
        const needsOptimizer = document.getElementById('coin-lots-recommendations');

        if (!needsConverter && !needsOptimizer) {
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

        missing.forEach(function(scriptName) {
            // Vérifier si le script n'est pas déjà en cours de chargement
            if (!document.querySelector(`script[src*="${scriptName}.js"]`)) {
                const script = document.createElement('script');
                script.src = '/js/' + scriptName + '.js?v=' + Date.now();
                script.async = true;
                script.onload = () => loadedScripts.push(scriptName);
                script.onerror = () => console.warn('Impossible de charger:', scriptName);
                document.head.appendChild(script);
            }
        });
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
