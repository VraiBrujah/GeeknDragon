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

<!-- Chargement automatique et silencieux des dépendances manquantes -->
<script>
// Chargement automatique des dépendances sans logs en production
(function() {
    'use strict';

    const isDebugMode = window.location.hash === '#debug' || window.location.search.includes('debug=1');

    // Attendre que tous les scripts soient chargés
    function ensureDependencies() {
        const needsConverter = document.getElementById('currency-converter-premium');
        const needsOptimizer = document.getElementById('coin-lots-recommendations');

        // Ne rien faire si ces éléments ne sont pas présents
        if (!needsConverter && !needsOptimizer) {
            return;
        }

        const missing = [];

        if (typeof CurrencyConverterPremium === 'undefined') missing.push('currency-converter');
        if (typeof CoinLotOptimizer === 'undefined') missing.push('coin-lot-optimizer');
        if (typeof SnipcartUtils === 'undefined') missing.push('snipcart-utils');

        // Charger silencieusement les scripts manquants
        missing.forEach(function(scriptName) {
            const script = document.createElement('script');
            script.src = '/js/' + scriptName + '.js?v=' + Date.now();
            script.async = true;
            document.head.appendChild(script);
        });

        // Log uniquement en mode debug
        if (isDebugMode && missing.length > 0) {
            console.log('[GD Debug] Chargement automatique:', missing);
        }
    }

    // Vérifier après DOMContentLoaded et après un délai pour laisser les scripts se charger
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(ensureDependencies, 100);
        });
    } else {
        setTimeout(ensureDependencies, 100);
    }
})();
</script>
