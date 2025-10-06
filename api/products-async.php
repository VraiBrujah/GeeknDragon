<?php
/**
 * API endpoint pour chargement asynchrone des produits - Geek & Dragon
 * 
 * Génère et retourne le HTML des cartes produits organisées par catégorie
 * pour optimiser les performances de chargement de la boutique.
 * 
 * @endpoint GET /api/products-async.php?category={all|pieces|cards|triptychs}&lang={fr|en}
 * @return application/json Structure contenant HTML des cartes et métadonnées
 * 
 * @example
 * GET /api/products-async.php?category=pieces&lang=fr
 * Retourne : {
 *   "pieces": "<div class='product-card'>...</div>",
 *   "counts": {"pieces": 15},
 *   "error": null
 * }
 * 
 * @author Brujah - Geek & Dragon
 * @version 1.0.0
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/cors-helpers.php';
if (function_exists('gd_send_cors_headers')) {
    gd_send_cors_headers(['GET','POST','OPTIONS'], ['Content-Type','X-Requested-With']);
}

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

/**
 * Rendu de cartes produits via le partial product-card.php
 *
 * @param array $products Liste de produits
 * @param string $lang Langue courante
 * @param array $translations Traductions i18n
 * @return string HTML concaténé des cartes produits
 */
function renderProductCards(array $products, string $lang, array $translations): string
{
    if (empty($products)) {
        return '';
    }

    $html = '';
    foreach ($products as $product) {
        ob_start();
        include __DIR__ . '/../partials/product-card.php';
        $html .= ob_get_clean();
    }

    return $html;
}

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
            'html' => renderProductCards($featuredProducts, $lang, $translations),
            'count' => count($featuredProducts)
        ];
    } else {
        // Génération du HTML selon la catégorie
        $response = [];

    if ($category === 'all' || $category === 'pieces') {
        $response['pieces'] = renderProductCards($pieces, $lang, $translations);
    }

    if ($category === 'all' || $category === 'cards') {
        $response['cards'] = renderProductCards($cards, $lang, $translations);
    }

    if ($category === 'all' || $category === 'triptychs') {
        $response['triptychs'] = renderProductCards($triptychs, $lang, $translations);
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

