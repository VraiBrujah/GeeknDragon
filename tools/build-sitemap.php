<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

/**
 * Génère un sitemap.xml cohérent avec les routes actives.
 *
 * L'objectif est de ne plus dépendre des anciens fichiers du dossier `old/`
 * et de centraliser la source de vérité vers les pages modernisées.
 */
$config = require __DIR__ . '/../config.php';
$baseUrl = rtrim($config['base_url'] ?? gdComputeBaseUrl(), '/');

$paths = [
    '/',
    '/boutique',
    '/contact',
    '/devis',
    '/checkout',
    '/merci',
    '/product',
];

$legacyProductPaths = [
    '/lot10',
    '/lot25',
    '/lot50-essence',
    '/lot50-tresorerie',
    '/lot10.php',
    '/lot25.php',
    '/lot50-essence.php',
    '/lot50-tresorerie.php',
];

$actualitesDir = realpath(__DIR__ . '/../actualites');
if ($actualitesDir !== false) {
    $actualitesPaths = [];
    foreach (glob($actualitesDir . '/*.{php,html}', GLOB_BRACE) as $file) {
        $relative = substr($file, strlen(dirname(__DIR__)));
        if ($relative === false) {
            continue;
        }

        $relative = '/' . ltrim(str_replace('\\', '/', $relative), '/');

        if (str_ends_with($relative, '.php')) {
            $htmlCandidate = preg_replace('/\.php$/', '.html', $relative);
            if ($htmlCandidate !== null) {
                $htmlCandidatePath = dirname(__DIR__) . $htmlCandidate;
                if (is_file($htmlCandidatePath)) {
                    continue;
                }
            }
        }

        $actualitesPaths[] = $relative;
    }

    $paths = array_merge($paths, $actualitesPaths);
}

$productsFile = dirname(__DIR__) . '/data/products.json';
if (is_file($productsFile)) {
    $data = json_decode((string) file_get_contents($productsFile), true);
    if (is_array($data)) {
        foreach (array_keys($data) as $productId) {
            $paths[] = '/product?id=' . rawurlencode((string) $productId);
        }
    }
}

$normalized = array_map(
    static function (string $path): string {
        if ($path === '' || $path === '/') {
            return '/';
        }

        return '/' . ltrim($path, '/');
    },
    $paths
);

$uniquePaths = array_values(array_unique(array_filter(
    $normalized,
    static function (string $path) use ($legacyProductPaths): bool {
        return !in_array($path, $legacyProductPaths, true);
    }
)));
sort($uniquePaths);

$xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');

foreach ($uniquePaths as $path) {
    $loc = $baseUrl . ($path === '/' ? '/' : $path);
    $urlNode = $xml->addChild('url');
    $urlNode->addChild('loc', htmlspecialchars($loc, ENT_QUOTES, 'UTF-8'));
}

$dom = dom_import_simplexml($xml)->ownerDocument;
$dom->formatOutput = true;
$target = __DIR__ . '/../sitemap.xml';
$dom->save($target);

printf("✅ Sitemap généré (%d entrées) → %s\n", count($uniquePaths), $target);
