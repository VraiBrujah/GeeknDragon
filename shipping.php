<?php
/**
 * Snipcart bootstrap + clés .env avec secours en dur
 * Place ce fichier où il est inclus sur toutes les pages produits/panier.
 */

// ---- FALLBACKS (à remplacer par tes vraies valeurs en dur si besoin) ----
$PUBLIC_FALLBACK = 'YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1';
$SECRET_FALLBACK = 'S_MDdhYmU2NWMtYmI5ZC00NmI0LWJjZGUtZDdkYTZjYTRmZTMxNjM4ODkxMjUzODg0NDc4ODU4';

// ---- Récup des clés depuis l'env (avec secours) ----
$snipcartKey    = getenv('SNIPCART_API_KEY');
if (!$snipcartKey || trim($snipcartKey) === '') {
  $snipcartKey = $PUBLIC_FALLBACK;
}

$snipcartSecret = getenv('SNIPCART_SECRET_API_KEY');
if (!$snipcartSecret || trim($snipcartSecret) === '') {
  $snipcartSecret = $SECRET_FALLBACK;
}

// (Optionnel) Rendre dispo côté PHP sans jamais exposer la secret au front
if (!defined('SNIPCART_SECRET_API_KEY')) {
  define('SNIPCART_SECRET_API_KEY', $snipcartSecret);
}
if (!defined('SNIPCART_PUBLIC_API_KEY')) {
  define('SNIPCART_PUBLIC_API_KEY', $snipcartKey);
}

// ---- Config front ----
$snipcartLanguage = $snipcartLanguage ?? ($lang ?? 'fr');
$snipcartAddProductBehavior = $snipcartAddProductBehavior ?? 'overlay';

// ---- Cache-busting helpers ----
$cssLocal       = __DIR__ . '/css/snipcart.css';
$cssCustomLocal = __DIR__ . '/css/snipcart-custom.css';
$jsCustomLocal  = __DIR__ . '/js/snipcart.js';

$cssVer       = file_exists($cssLocal)       ? filemtime($cssLocal)       : time();
$cssCustomVer = file_exists($cssCustomLocal) ? filemtime($cssCustomLocal) : time();
$jsCustomVer  = file_exists($jsCustomLocal)  ? filemtime($jsCustomLocal)  : time();
?>
<?php if ($snipcartKey): ?>
  <!-- Thème Snipcart (CDN) + ton override CSS local -->
  <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.css" />
  <link rel="stylesheet" href="/css/snipcart.css?v=<?= $cssVer ?>" />
  <link rel="stylesheet" href="/css/snipcart-custom.css?v=<?= $cssCustomVer ?>" />

  <!-- Conteneur Snipcart + Settings -->
  <div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
  <script>
    (function() {
      const lang = localStorage.getItem('snipcartLanguage') || '<?= htmlspecialchars($snipcartLanguage) ?>';
      window.SnipcartSettings = {
        publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
        loadStrategy: 'onload',
        config: {
          addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
          locale: lang,
          customerAccount: { enabled: true },
        },
      };
    })();
  </script>

  <!-- Lib Snipcart (CDN) -->
  <script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>

  <!-- Ton JS de personnalisation (après la lib) -->
  <script defer src="/js/snipcart.js?v=<?= $jsCustomVer ?>"></script>
<?php else: ?>
  <p class="text-red-500 text-center">SNIPCART_API_KEY manquante</p>
<?php endif; ?>
