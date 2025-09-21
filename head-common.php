<?php
/**
 * head-common.php - section d'en-tête mutualisée
 *
 * Cette section récupère l'identifiant de mesure Google Analytics depuis
 * l'environnement (priorité à $_ENV puis repli sur $_SERVER). Lorsqu'un
 * identifiant est fourni, le script gtag est injecté avant Snipcart afin
 * d'activer le suivi e-commerce attendu par Snipcart sans exposer de valeur
 * codée en dur.
 */
$gaMeasurementId = $_ENV['GA_MEASUREMENT_ID']
    ?? $_SERVER['GA_MEASUREMENT_ID']
    ?? null;

if (is_string($gaMeasurementId)) {
    $gaMeasurementId = trim($gaMeasurementId);
}

?>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  <link rel="stylesheet" href="/css/vendor.bundle.min.css?v=<?= filemtime(__DIR__.'/css/vendor.bundle.min.css') ?>" />
  <script src="/js/vendor.bundle.min.js?v=<?= filemtime(__DIR__.'/js/vendor.bundle.min.js') ?>"></script>
  <link rel="stylesheet" href="/css/styles.css?v=<?= filemtime(__DIR__.'/css/styles.css') ?>">
  <?php if (!empty($gaMeasurementId)): ?>
    <!-- Google Analytics : chargement avant Snipcart pour le suivi e-commerce -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= rawurlencode($gaMeasurementId) ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} // Fonction de suivi GA4
      gtag('js', new Date());
      gtag('config', '<?= htmlspecialchars($gaMeasurementId) ?>');
    </script>
  <?php endif; ?>
  <link rel="stylesheet" href="/css/snipcart.css?v=<?= filemtime(__DIR__.'/css/snipcart.css') ?>">
  <link rel="stylesheet" href="/css/snipcart-custom.css?v=<?= filemtime(__DIR__.'/css/snipcart-custom.css') ?>">
  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

