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

    // Configuration Snipcart avec thème sombre
    window.SnipcartSettings = {
      publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
      loadStrategy: 'onload', // Chargement automatique
      version: '3.4.0',
      config: {
        addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
        locale: lang,
        customerAccount: { enabled: true },
        payment: {
          appearance: {
            theme: 'night', // Thème sombre pour Stripe
            variables: {
              colorPrimary: '#8b5cf6',
              colorBackground: '#1e293b',
              colorText: '#f8fafc',
              colorDanger: '#ef4444',
              colorSuccess: '#10b981',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              spacingUnit: '12px',
              borderRadius: '8px',
              colorTextSecondary: '#cbd5e1',
              colorTextPlaceholder: '#94a3b8'
            }
          },
          stripe: {
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#8b5cf6',
                colorBackground: '#1e293b',
                colorText: '#f8fafc',
                colorDanger: '#ef4444',
                fontFamily: 'Inter',
                spacingUnit: '12px',
                borderRadius: '8px'
              }
            }
          }
        }
      },
    };

    // Configuration simple - pas d'interférence avec CMP
    console.log('Snipcart configuré pour chargement direct');

    // Debug pour identifier les problèmes
    if (window.location.hash === '#debug' || window.location.search.includes('debug=1')) {
      console.log('Snipcart Debug - Configuration:', window.SnipcartSettings);
      console.log('Snipcart Debug - API Key:', '<?= htmlspecialchars($snipcartKey) ?>');
      console.log('Snipcart Debug - Langue:', lang);
    }
  })();
</script>
<!-- Snipcart avec diagnostics détaillés -->
<script>
// Test de connectivité préalable
console.log('🔍 Test de connectivité CDN Snipcart...');
fetch('https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js', { method: 'HEAD' })
  .then(response => {
    console.log('✅ CDN Snipcart accessible:', response.status, response.ok);
    console.log('🔗 Headers:', Array.from(response.headers.entries()));
  })
  .catch(error => {
    console.error('❌ CDN Snipcart bloqué par:', error.name, error.message);
    console.error('Causes possibles: bloqueur pub, proxy, DNS, extensions navigateur');
  });

// Chargement avec exemption CMP complète
const snipcartScript = document.createElement('script');
snipcartScript.async = true;
snipcartScript.src = 'https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js';

// Exemption CMP correcte selon documentation ConsentManager
snipcartScript.setAttribute('data-cmp-ab', '1'); // CORRECT: 1 = exempt du blocage
// Suppression des autres attributs non-standard pour ConsentManager

snipcartScript.onload = function() {
  console.log('✅ Script Snipcart chargé avec succès');
  console.log('🔍 window.Snipcart présent:', !!window.Snipcart);
  
  setTimeout(() => {
    console.log('🔍 Snipcart.events disponible:', !!(window.Snipcart && window.Snipcart.events));
    console.log('🔍 Snipcart.api disponible:', !!(window.Snipcart && window.Snipcart.api));
  }, 1000);
};

snipcartScript.onerror = function(event) {
  console.error('❌ Échec chargement script Snipcart');
  console.error('Événement d\'erreur:', event);
  console.error('Vérifiez: bloqueurs de pub, proxy, antivirus, extensions');
};

document.head.appendChild(snipcartScript);
</script>
<script>
  // Vérification silencieuse de Snipcart (logs uniquement en mode debug)
  const debugMode = window.location.hash === '#debug' || window.location.search.includes('debug=1');
  
  if (debugMode) {
    console.log('🚀 Chargement Snipcart avec exemption CMP configurée');
  }
  
  // Vérification simple du chargement Snipcart
  setTimeout(() => {
    if (window.Snipcart && window.Snipcart.events) {
      console.log('✅ Snipcart opérationnel !');
    } else {
      console.error('❌ Snipcart non chargé - problème de connectivité CDN');
    }
  }, 3000);
  
  // Événements CMP uniquement en debug
  if (debugMode) {
    document.addEventListener('cmpConsentUpdate', function(event) {
      console.log('📢 CMP: Mise à jour des consentements:', event.detail);
    });
  }
</script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
