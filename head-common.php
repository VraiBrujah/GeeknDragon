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
  <!-- Système e-commerce natif moderne -->
  <link rel="stylesheet" href="/css/gd-ecommerce-native.css?v=<?= filemtime(__DIR__.'/css/gd-ecommerce-native.css') ?>">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="stylesheet" href="/css/disable-image-crop.css?v=<?= filemtime(__DIR__.'/css/disable-image-crop.css') ?>">
  <link rel="stylesheet" href="/css/checkout-dnd.css?v=<?= filemtime(__DIR__.'/css/checkout-dnd.css') ?>">
  <link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.css">
  <script src="/js/lazy-load-enhanced.js" defer></script>
  <script src="/js/universal-image-gallery.js" defer></script>
  <script src="/js/gd-ecommerce-native.js" defer></script>
  <script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

