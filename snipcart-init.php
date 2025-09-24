<?php
/**
 * Initialisation centralisée de Snipcart.
 *
 * Les pages peuvent définir $snipcartKey, $snipcartLanguage ou $snipcartAddProductBehavior
 * avant d'inclure ce fichier. À défaut, les valeurs sont récupérées depuis l'environnement
 * puis normalisées pour garantir un comportement uniforme sur toutes les pages (index, boutique, etc.).
 */

// Liste des langues supportées par Snipcart sur Geek & Dragon.
$snipcartSupportedLocales = ['fr', 'en'];

// Clé publique Snipcart (priorité à la valeur définie par la page).
$snipcartKey = $snipcartKey
    ?? $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY']
    ?? null;

// Langue souhaitée : valeur fournie par la page, puis environnement, puis langue globale du site.
$snipcartLanguage = $snipcartLanguage
    ?? $_ENV['SNIPCART_LANGUAGE']
    ?? $_SERVER['SNIPCART_LANGUAGE']
    ?? ($lang ?? null);

if (is_string($snipcartLanguage)) {
    $snipcartLanguage = trim($snipcartLanguage);
}

// Normalisation de la langue pour toujours fournir un code compatible Snipcart (fr/en).
$normalizedLanguage = '';
if (is_string($snipcartLanguage) && $snipcartLanguage !== '') {
    $candidate = strtolower(str_replace([' ', '_'], '-', $snipcartLanguage));
    $primary = explode('-', $candidate)[0] ?? '';

    if (in_array($candidate, $snipcartSupportedLocales, true)) {
        $normalizedLanguage = $candidate;
    } elseif (in_array($primary, $snipcartSupportedLocales, true)) {
        $normalizedLanguage = $primary;
    }
}

if ($normalizedLanguage === '') {
    // Dernier recours : bascule sur la première langue supportée pour éviter une initialisation incomplète.
    $normalizedLanguage = $snipcartSupportedLocales[0];
}

$snipcartLanguage = $normalizedLanguage;

// Comportement du bouton « ajouter au panier » (overlay/standard).
$snipcartAddProductBehavior = $snipcartAddProductBehavior
    ?? $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? $_SERVER['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? 'standard';

if (!is_string($snipcartAddProductBehavior) || $snipcartAddProductBehavior === '') {
    $snipcartAddProductBehavior = 'standard';
}

if (!$snipcartKey) {
    throw new RuntimeException('SNIPCART_API_KEY doit être définie.');
}
?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  // Configuration Snipcart simplifiée et robuste
  (function() {
    const fallbackLang = '<?= htmlspecialchars($snipcartLanguage) ?>';
    let lang = fallbackLang;

    // Récupération sécurisée de la langue depuis localStorage
    try {
      const storedLang = localStorage.getItem('snipcartLanguage');
      if (storedLang) {
        lang = storedLang;
      } else {
        localStorage.setItem('snipcartLanguage', lang);
      }
    } catch (error) {
      console.warn('localStorage indisponible, utilisation fallback lang:', fallbackLang);
    }

    // Configuration Snipcart avec chargement immédiat forcé
    window.SnipcartSettings = {
      publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
      loadStrategy: 'onload', // Retour au chargement immédiat
      version: '3.4.0',
      config: {
        addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
        locale: lang,
        customerAccount: { enabled: true }
      },
    };

    // Forcer l'initialisation immédiate
    window.addEventListener('DOMContentLoaded', function() {
      if (window.Snipcart && typeof window.Snipcart.api === 'undefined') {
        console.warn('Snipcart détecté mais API non initialisée, forçage...');
        // Tentative de forcer l'initialisation
        setTimeout(function() {
          if (window.Snipcart && window.Snipcart.ready) {
            window.Snipcart.ready();
          }
        }, 100);
      }
    });

    // Debug pour identifier les problèmes
    if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
      console.log('Snipcart Debug - Configuration:', window.SnipcartSettings);
      console.log('Snipcart Debug - API Key:', '<?= htmlspecialchars($snipcartKey) ?>');
      console.log('Snipcart Debug - Langue:', lang);
    }
  })();
</script>
<!-- Librairie Snipcart avec exemption CMP configurée -->
<script 
  async 
  src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"
  data-cmp-ab="0"
  data-purposes="essential"
  data-service="snipcart"
  class="cmplz-native">
</script>
<script>
  // Vérification silencieuse de Snipcart (logs uniquement en mode debug)
  const debugMode = window.location.hash === '#debug' || window.location.search.includes('debug=1');
  
  if (debugMode) {
    console.log('🚀 Chargement Snipcart avec exemption CMP configurée');
  }
  
  let checkCount = 0;
  const checkSnipcart = setInterval(() => {
    checkCount++;
    
    if (window.Snipcart && window.Snipcart.events) {
      if (debugMode) {
        console.log('✅ Snipcart détecté et prêt avec exemption CMP !');
      }
      clearInterval(checkSnipcart);
    } else if (checkCount > 50) { // 5 secondes - Log d'erreur même sans debug
      console.error('❌ Snipcart non disponible après 5s');
      clearInterval(checkSnipcart);
    }
  }, 100);
  
  // Événements CMP uniquement en debug
  if (debugMode) {
    document.addEventListener('cmpConsentUpdate', function(event) {
      console.log('📢 CMP: Mise à jour des consentements:', event.detail);
    });
  }
</script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
