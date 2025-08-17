<?php
/** head-common.php - shared head section */
?>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= htmlspecialchars($title ?? 'Geek & Dragon') ?></title>
  <meta name="description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta property="og:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta property="og:image" content="<?= htmlspecialchars($ogImage ?? '/images/optimized-modern/webp/brand-geekndragon-main.webp') ?>" />
  <meta property="og:url" content="<?= htmlspecialchars($metaUrl ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ($_SERVER['REQUEST_URI'] ?? '/'))) ?>" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= htmlspecialchars($title ?? 'Geek & Dragon') ?>" />
  <meta name="twitter:description" content="<?= htmlspecialchars($metaDescription ?? '') ?>" />
  <meta name="twitter:image" content="<?= htmlspecialchars($ogImage ?? '/images/optimized-modern/webp/brand-geekndragon-main.webp') ?>" />
  <link rel="canonical" href="<?= htmlspecialchars($metaUrl ?? '') ?>">
  <link rel="stylesheet" href="/css/vendor.bundle.min.css?v=<?= filemtime(__DIR__.'/css/vendor.bundle.min.css') ?>" />
  <script src="/js/vendor.bundle.min.js?v=<?= filemtime(__DIR__.'/js/vendor.bundle.min.js') ?>"></script>
  <link rel="stylesheet" href="/css/styles.css?v=<?= filemtime(__DIR__.'/css/styles.css') ?>">
  <link rel="stylesheet" href="/css/boutique-style-global.css?v=<?= filemtime(__DIR__.'/css/boutique-style-global.css') ?>">
  <!-- Snipcart (intégration transparente en arrière-plan) -->
  <link rel="stylesheet" href="/css/snipcart.css?v=<?= filemtime(__DIR__.'/css/snipcart.css') ?>">
  <link rel="stylesheet" href="/css/snipcart-custom.css?v=<?= filemtime(__DIR__.'/css/snipcart-custom.css') ?>">
  <link rel="stylesheet" href="/css/snipcart-ecommerce.css?v=<?= filemtime(__DIR__.'/css/snipcart-ecommerce.css') ?>">
  <!-- Interface e-commerce DnD par-dessus Snipcart -->
  <link rel="stylesheet" href="/css/gd-ecommerce-native.css?v=<?= filemtime(__DIR__.'/css/gd-ecommerce-native.css') ?>">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="stylesheet" href="/css/disable-image-crop.css?v=<?= filemtime(__DIR__.'/css/disable-image-crop.css') ?>">
  <script src="/js/lazy-load-enhanced.js" defer></script>
  <script src="/js/universal-image-gallery.js" defer></script>
  <script src="/js/gd-ecommerce-hybrid-transparent.js" defer></script>
  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

