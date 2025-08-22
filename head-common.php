<?php
declare(strict_types=1);
/** head-common.php - shared head section */
?>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?= \GeeknDragon\Security\CsrfProtection::getMetaTag(); ?>
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
  <!-- Preload des fonts critiques pour performance optimale -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:wght@400;500;600&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:wght@400;500;600&display=swap"></noscript>
  
  <!-- CSS critique inliné pour First Paint optimal -->
  <style><?= file_get_contents(__DIR__.'/css/critical.min.css') ?></style>
  
  <!-- Vendor JS critique -->
  <script src="/js/vendor.bundle.min.js?v=<?= filemtime(__DIR__.'/js/vendor.bundle.min.js') ?>"></script>
  
  <!-- CSS non-critique chargé de manière asynchrone -->
  <link rel="preload" href="/css/vendor.bundle.min.css?v=<?= filemtime(__DIR__.'/css/vendor.bundle.min.css') ?>" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/vendor.bundle.min.css?v=<?= filemtime(__DIR__.'/css/vendor.bundle.min.css') ?>"></noscript>
  
  <link rel="preload" href="/css/optimized.min.css?v=<?= filemtime(__DIR__.'/css/optimized.min.css') ?>" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/optimized.min.css?v=<?= filemtime(__DIR__.'/css/optimized.min.css') ?>"></noscript>
  
  <link rel="icon" type="image/png" href="/images/favicon.png">>
  <!-- Scripts critiques (chargés individuellement) -->
  <script src="/js/lazy-load-enhanced.js" defer></script>
  <script src="/js/universal-image-gallery.js" defer></script>
  <script src="/js/cart-custom.js" defer></script>
  
  <!-- Scripts non-critiques (bundlés et optimisés) -->
  <script src="/js/optimized.min.js" defer></script>
  <?php if (!empty($extraHead)) echo $extraHead; ?>
</head>

