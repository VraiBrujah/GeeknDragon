<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\Security\CsrfProtection;

/**
 * En-tête HTML commun aux pages publiques.
 *
 * Les variables suivantes peuvent être définies avant inclusion :
 * - $title            : titre de la page
 * - $metaDescription  : description SEO
 * - $metaUrl          : URL canonique
 * - $ogImage          : visuel OpenGraph
 * - $extraHead        : contenu HTML additionnel
 */

$title = $title ?? 'Geek & Dragon';
$metaDescription = $metaDescription ?? '';
$metaUrl = $metaUrl ?? (gdComputeBaseUrl() . ($_SERVER['REQUEST_URI'] ?? '/'));
$ogImage = $ogImage ?? '/images/optimized-modern/webp/brand-geekndragon-main.webp';
$extraHead = $extraHead ?? '';
?>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Content Security Policy de secours -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.snipcart.com https://cdn.snipcart.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.snipcart.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://cdn.snipcart.com; connect-src 'self' https://app.snipcart.com https://cdn.snipcart.com; frame-src https://app.snipcart.com; worker-src 'self' blob:;">
  <?= CsrfProtection::getMetaTag(); ?>
  <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></title>
  <meta name="description" content="<?= htmlspecialchars($metaDescription, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:description" content="<?= htmlspecialchars($metaDescription, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:url" content="<?= htmlspecialchars($metaUrl, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="twitter:description" content="<?= htmlspecialchars($metaDescription, ENT_QUOTES, 'UTF-8'); ?>" />
  <meta name="twitter:image" content="<?= htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8'); ?>" />
  <link rel="canonical" href="<?= htmlspecialchars($metaUrl, ENT_QUOTES, 'UTF-8'); ?>">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Uncial+Antiqua&family=MedievalSharp&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/vendor.bundle.min.css?v=<?= gdAssetVersion('css/vendor.bundle.min.css'); ?>" />
  <link rel="stylesheet" href="/css/styles.css?v=<?= gdAssetVersion('css/styles.css'); ?>">
  <link rel="stylesheet" href="/css/boutique-style-global.css?v=<?= gdAssetVersion('css/boutique-style-global.css'); ?>">
  <link rel="stylesheet" href="/css/gd-ecommerce-native.css?v=<?= gdAssetVersion('css/gd-ecommerce-native.css'); ?>">
  <link rel="stylesheet" href="/css/site-enhancements.css?v=<?= gdAssetVersion('css/site-enhancements.css'); ?>">
  <link rel="stylesheet" href="/css/disable-image-crop.css?v=<?= gdAssetVersion('css/disable-image-crop.css'); ?>">
  <link rel="stylesheet" href="/css/checkout-dnd.css?v=<?= gdAssetVersion('css/checkout-dnd.css'); ?>">
  <script src="/js/vendor.bundle.min.js?v=<?= gdAssetVersion('js/vendor.bundle.min.js'); ?>" defer></script>
  <script src="/js/lazy-load-enhanced.js?v=<?= gdAssetVersion('js/lazy-load-enhanced.js'); ?>" defer></script>
  <script src="/js/universal-image-gallery.js?v=<?= gdAssetVersion('js/universal-image-gallery.js'); ?>" defer></script>
  <?= $extraHead; ?>
</head>
