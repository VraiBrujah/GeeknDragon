<?php
/**
 * head-common.php - section d'en-tête mutualisée
 *
 * Cette section récupère l'identifiant de mesure Google Analytics depuis
 * l'environnement (priorité à $_ENV puis repli sur $_SERVER). Lorsqu'un
 * identifiant est fourni, le script gtag est injecté avant Snipcart afin
 * d'activer le suivi e-commerce attendu par Snipcart sans exposer de valeur
 * codée en dur.
 * 
 * Le CMP (Consent Management Platform) est chargé en PRIORITÉ ABSOLUE
 * pour bloquer automatiquement les trackers avant consentement utilisateur.
 */
$gaMeasurementId = $_ENV['GA_MEASUREMENT_ID']
    ?? $_SERVER['GA_MEASUREMENT_ID']
    ?? null;

if (is_string($gaMeasurementId)) {
    $gaMeasurementId = trim($gaMeasurementId);
}

?>
<head>
  <?php 
  // CMP réactivé avec exemption Snipcart configurée
  include __DIR__ . '/includes/cmp-consent.php'; 
  ?>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="frame-src 'self' https://checkout.stripe.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.com https://api.stripe.com https://checkout.snipcart.com https://app.snipcart.com https://payment.snipcart.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.snipcart.com https://js.stripe.com https://www.googletagmanager.com https://cdn.consentmanager.net https://c.delivery.consentmanager.net; connect-src 'self' https://api.stripe.com https://api.snipcart.com https://app.snipcart.com https://checkout.stripe.com https://cdn.snipcart.com https://payment.snipcart.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.com;"/>
  <meta http-equiv="Permissions-Policy" content="payment=(self), payment-handler=(self)"/>
  <title><?= htmlspecialchars($title ?? 'Geek & Dragon') ?></title>
  <meta name="description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta property="og:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:image" content="<?= htmlspecialchars($ogImage ?? '/media/branding/logos/logo.webp') ?>" />
  <meta property="og:url" content="<?= htmlspecialchars($metaUrl ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . ($_SERVER['REQUEST_URI'] ?? ''))) ?>" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta name="twitter:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta name="twitter:image" content="<?= htmlspecialchars($ogImage ?? '/media/branding/logos/logo.webp') ?>" />
  <link rel="canonical" href="<?= htmlspecialchars($metaUrl ?? '') ?>">

  <!-- Polyfills pour compatibilité navigateurs anciens (Array.from, Object.entries, fetch, IntersectionObserver, ResizeObserver) -->
  <script crossorigin="anonymous"
          src="https://polyfill.io/v3/polyfill.min.js?features=Array.from%2CObject.entries%2CObject.assign%2CPromise%2Cfetch%2CIntersectionObserver%2CResizeObserver%2CNumber.isFinite%2CNumber.parseInt"></script>

  <link rel="stylesheet" href="/css/vendor.bundle.min.css?v=<?= filemtime(__DIR__.'/css/vendor.bundle.min.css') ?>" />
  <script src="/js/vendor.bundle.min.js?v=<?= filemtime(__DIR__.'/js/vendor.bundle.min.js') ?>"></script>
  <link rel="stylesheet" href="/css/styles.css?v=<?= filemtime(__DIR__.'/css/styles.css') ?>">
  <?php if (!empty($gaMeasurementId)): ?>
    <!-- Google Analytics : chargement conditionnel après consentement CMP -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= rawurlencode($gaMeasurementId) ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} // Fonction de suivi GA4
      
      // Configuration initiale avec consentement refusé par défaut
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'wait_for_update': 2000 // Attendre 2s max pour le CMP
      });
      
      gtag('js', new Date());
      gtag('config', '<?= htmlspecialchars($gaMeasurementId) ?>', {
        'anonymize_ip': true, // Anonymisation IP par défaut
        'cookie_flags': 'SameSite=Strict;Secure' // Cookies sécurisés
      });
      
      // Écouter les mises à jour de consentement du CMP
      document.addEventListener('cmpConsentUpdate', function(event) {
        const purposes = event.detail.purposes;
        gtag('consent', 'update', {
          'analytics_storage': purposes.analytics ? 'granted' : 'denied',
          'ad_storage': purposes.marketing ? 'granted' : 'denied'
        });
      });
    </script>
  <?php endif; ?>
  <link rel="stylesheet" href="/css/snipcart.css?v=<?= filemtime(__DIR__.'/css/snipcart.css') ?>">
  <link rel="stylesheet" href="/css/snipcart-custom.css?v=<?= filemtime(__DIR__.'/css/snipcart-custom.css') ?>">

  <!-- Monitoring supprimé - Performance réglée -->

  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

