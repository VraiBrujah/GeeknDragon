<?php
/**
 * API endpoint pour chargement asynchrone des produits
 * Retourne le HTML des cartes produits par catégorie
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../bootstrap.php';

// Log de performance
$startTime = microtime(true);

// i18n setup
$lang = $_GET['lang'] ?? 'fr';
$active = 'boutique';
require __DIR__ . '/../i18n.php';

// Include du système de rendu optimisé
require_once __DIR__ . '/../includes/product-card-renderer.php';

// Catégorie demandée
$category = $_GET['category'] ?? 'all';
$validCategories = ['pieces', 'cards', 'triptychs', 'all', 'featured'];

if (!in_array($category, $validCategories)) {
    http_response_code(400);
    echo json_encode(['error' => 'Catégorie invalide']);
    exit;
}

// Produits spécifiques pour featured
$featuredProductIds = null;
if ($category === 'featured' && isset($_GET['products'])) {
    $featuredProductIds = explode(',', $_GET['products']);
}

try {
    // Chargement des produits
    $data = json_decode(file_get_contents(__DIR__ . '/../data/products.json'), true) ?? [];
    $pieces = [];
    $cards = [];
    $triptychs = [];

    foreach ($data as $id => $p) {
        $summaryFr = (string) ($p['summary'] ?? ($p['description'] ?? ''));
        $summaryEn = (string) ($p['summary_en'] ?? ($p['description_en'] ?? ''));
        if ($summaryFr === '' && $summaryEn !== '') {
            $summaryFr = $summaryEn;
        }
        if ($summaryEn === '' && $summaryFr !== '') {
            $summaryEn = $summaryFr;
        }

        $product = [
            'id' => $id,
            'name' => str_replace(' – ', '<br>', $p['name']),
            'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
            'price' => $p['price'],
            'img' => $p['images'][0] ?? '',
            'description' => $p['description'] ?? '',
            'description_en' => $p['description_en'] ?? ($p['description'] ?? ''),
            'summary' => $summaryFr,
            'summary_en' => $summaryEn,
            'multipliers' => $p['multipliers'] ?? [],
            'metals' => $p['metals'] ?? [],
            'metals_en' => $p['metals_en'] ?? [],
            'languages' => $p['languages'] ?? [],
            'triptych_options' => $p['triptych_options'] ?? [],
            'triptych_type' => $p['triptych_type'] ?? null,
            'customizable' => $p['customizable'] ?? false,
        ];

        $productCategory = $p['category'] ?? 'cards';

        if ($productCategory === 'pieces') {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=pieces';
            $pieces[] = $product;
        } elseif ($productCategory === 'triptychs') {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=triptychs';
            $triptychs[] = $product;
        } else {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=cards';
            $cards[] = $product;
        }
    }

    // Si catégorie featured, filtrer seulement les produits demandés
    if ($category === 'featured' && $featuredProductIds) {
        $featuredProducts = [];
        $allProducts = array_merge($pieces, $cards, $triptychs);
        
        foreach ($featuredProductIds as $productId) {
            foreach ($allProducts as $product) {
                if ($product['id'] === trim($productId)) {
                    $featuredProducts[] = $product;
                    break;
                }
            }
        }
        
        // Pour featured, on retourne directement le HTML des produits
        $response = [
            'html' => ProductCardRenderer::renderMultiple($featuredProducts, $lang, $translations),
            'count' => count($featuredProducts)
        ];
    } else {
        // Génération du HTML selon la catégorie
        $response = [];

    if ($category === 'all' || $category === 'pieces') {
        $response['pieces'] = ProductCardRenderer::renderMultiple($pieces, $lang, $translations);
    }

    if ($category === 'all' || $category === 'cards') {
        $response['cards'] = ProductCardRenderer::renderMultiple($cards, $lang, $translations);
    }

    if ($category === 'all' || $category === 'triptychs') {
        $response['triptychs'] = ProductCardRenderer::renderMultiple($triptychs, $lang, $translations);
    }

        // Ajouter les compteurs et métriques pour les catégories normales
        $response['counts'] = [
            'pieces' => count($pieces),
            'cards' => count($cards),
            'triptychs' => count($triptychs),
            'total' => count($pieces) + count($cards) + count($triptychs)
        ];
    }

    // Métriques de performance pour toutes les catégories
    $response['performance'] = [
        'execution_time_ms' => round((microtime(true) - $startTime) * 1000, 2),
        'memory_mb' => round(memory_get_usage() / 1024 / 1024, 2)
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>