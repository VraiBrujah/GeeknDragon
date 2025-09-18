<?php
declare(strict_types=1);

/**
 * Redirige une ancienne URL produit (format produit-*.php) vers la page dynamique.
 *
 * Ce script détermine l'identifiant du produit correspondant à l'ancien slug
 * et effectue une redirection permanente vers product.php afin de centraliser
 * la logique d'affichage.
 */

$legacySlug = $legacySlug ?? '';

if ($legacySlug === '') {
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? ($_SERVER['PHP_SELF'] ?? '');
    $legacySlug = preg_replace('/^produit-/', '', basename($scriptName, '.php'));
}

$catalogPath = dirname(__DIR__) . '/data/products.json';
$targetId = null;

if (is_file($catalogPath)) {
    $catalogJson = file_get_contents($catalogPath);
    if ($catalogJson !== false) {
        $catalog = json_decode($catalogJson, true);
        if (is_array($catalog)) {
            foreach ($catalog as $productId => $productData) {
                $slug = (string)($productData['slug'] ?? '');
                if ($slug === $legacySlug || $productId === $legacySlug) {
                    $targetId = $productId;
                    break;
                }
                $legacySlugs = $productData['legacy_slugs'] ?? [];
                if (is_array($legacySlugs) && in_array($legacySlug, $legacySlugs, true)) {
                    $targetId = $productId;
                    break;
                }
            }
        }
    }
}

if ($targetId === null) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}

$redirectUrl = 'product.php?id=' . rawurlencode($targetId);

if (PHP_SAPI === 'cli') {
    echo $redirectUrl . PHP_EOL;
    exit;
}

header('Location: ' . $redirectUrl, true, 301);
exit;
