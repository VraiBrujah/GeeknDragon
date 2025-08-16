<?php
/**
 * Tests de performance pour valider les optimisations
 * Mesure les temps de réponse et l'utilisation mémoire
 */

require_once __DIR__ . '/../bootstrap.php';

class PerformanceTest
{
    private array $benchmarks = [];

    public function runPerformanceTests(): void
    {
        echo "⚡ Tests de performance et optimisation...\n\n";

        $this->testProductLoadingSpeed();
        $this->testCacheEfficiency();
        $this->testMemoryUsage();
        $this->testApiResponseTime();

        $this->displayBenchmarks();
    }

    private function testProductLoadingSpeed(): void
    {
        echo "📦 Test : Vitesse de chargement des produits\n";

        // Test sans cache
        $start = microtime(true);
        $memory_start = memory_get_usage();
        
        $productService = new \GeeknDragon\Services\ProductService();
        $products = $productService->getAllProducts();
        
        $time_no_cache = microtime(true) - $start;
        $memory_no_cache = memory_get_usage() - $memory_start;

        // Test avec cache (deuxième appel)
        $start = microtime(true);
        $memory_start = memory_get_usage();
        
        $products_cached = $productService->getAllProducts();
        
        $time_with_cache = microtime(true) - $start;
        $memory_with_cache = memory_get_usage() - $memory_start;

        $this->benchmarks['product_loading'] = [
            'sans_cache' => [
                'temps' => round($time_no_cache * 1000, 2) . 'ms',
                'memoire' => $this->formatBytes($memory_no_cache),
                'produits' => count($products)
            ],
            'avec_cache' => [
                'temps' => round($time_with_cache * 1000, 2) . 'ms',
                'memoire' => $this->formatBytes($memory_with_cache),
                'acceleration' => round($time_no_cache / $time_with_cache, 1) . 'x'
            ]
        ];

        echo "  ✅ Produits chargés: " . count($products) . "\n";
        echo "  ⚡ Accélération cache: " . $this->benchmarks['product_loading']['avec_cache']['acceleration'] . "\n";
    }

    private function testCacheEfficiency(): void
    {
        echo "\n💾 Test : Efficacité du cache\n";

        $cache = new \GeeknDragon\Services\CacheService();
        
        // Test d'écriture
        $start = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            $cache->set("test_key_{$i}", "test_value_{$i}", 3600);
        }
        $write_time = microtime(true) - $start;

        // Test de lecture
        $start = microtime(true);
        for ($i = 0; $i < 100; $i++) {
            $cache->get("test_key_{$i}");
        }
        $read_time = microtime(true) - $start;

        // Nettoyage
        for ($i = 0; $i < 100; $i++) {
            $cache->delete("test_key_{$i}");
        }

        $this->benchmarks['cache'] = [
            'ecriture' => round($write_time * 1000, 2) . 'ms (100 entrées)',
            'lecture' => round($read_time * 1000, 2) . 'ms (100 entrées)',
            'ecriture_moyenne' => round(($write_time / 100) * 1000, 3) . 'ms/entrée',
            'lecture_moyenne' => round(($read_time / 100) * 1000, 3) . 'ms/entrée'
        ];

        echo "  ✅ Cache testé avec 100 entrées\n";
        echo "  💨 Lecture moyenne: " . $this->benchmarks['cache']['lecture_moyenne'] . "\n";
    }

    private function testMemoryUsage(): void
    {
        echo "\n🧠 Test : Utilisation mémoire\n";

        $memory_start = memory_get_usage();
        $peak_start = memory_get_peak_usage();

        // Simulation d'une charge complète
        $app = \GeeknDragon\Core\Application::getInstance();
        $productService = $app->getService('product');
        $mediaService = $app->getService('media');
        $cacheService = $app->getService('cache');

        $products = $productService->getAllProducts();
        
        $memory_after = memory_get_usage();
        $peak_after = memory_get_peak_usage();

        $this->benchmarks['memoire'] = [
            'utilisation_courante' => $this->formatBytes($memory_after - $memory_start),
            'pic_utilisation' => $this->formatBytes($peak_after - $peak_start),
            'memoire_par_produit' => $this->formatBytes(($memory_after - $memory_start) / count($products)),
            'total_produits' => count($products)
        ];

        echo "  ✅ Mémoire utilisée: " . $this->benchmarks['memoire']['utilisation_courante'] . "\n";
        echo "  📈 Pic mémoire: " . $this->benchmarks['memoire']['pic_utilisation'] . "\n";
    }

    private function testApiResponseTime(): void
    {
        echo "\n🌐 Test : Temps de réponse API\n";

        // Test ProductController
        $start = microtime(true);
        $controller = new \GeeknDragon\Controllers\ProductController();
        $result = $controller->index();
        $product_api_time = microtime(true) - $start;

        // Test recherche
        $_GET['search'] = 'pièces';
        $start = microtime(true);
        $search_result = $controller->index();
        $search_api_time = microtime(true) - $start;
        unset($_GET['search']);

        $this->benchmarks['api'] = [
            'liste_produits' => round($product_api_time * 1000, 2) . 'ms',
            'recherche' => round($search_api_time * 1000, 2) . 'ms',
            'produits_retournes' => count($result['products']),
            'resultats_recherche' => count($search_result['products'])
        ];

        echo "  ✅ API testée avec " . count($result['products']) . " produits\n";
        echo "  🔍 Recherche: " . $this->benchmarks['api']['recherche'] . "\n";
    }

    private function displayBenchmarks(): void
    {
        echo "\n" . str_repeat("=", 70) . "\n";
        echo "📊 RÉSULTATS DES TESTS DE PERFORMANCE\n";
        echo str_repeat("=", 70) . "\n";

        foreach ($this->benchmarks as $category => $data) {
            echo "\n" . strtoupper($category) . ":\n";
            foreach ($data as $key => $value) {
                echo "  " . ucfirst(str_replace('_', ' ', $key)) . ": {$value}\n";
            }
        }

        echo "\n" . str_repeat("=", 70) . "\n";
        echo "✨ Tests de performance terminés\n";
        
        // Recommandations
        $cache_acceleration = (float)str_replace('x', '', $this->benchmarks['product_loading']['avec_cache']['acceleration']);
        if ($cache_acceleration > 5) {
            echo "🎉 Excellent cache! Accélération de {$cache_acceleration}x\n";
        } elseif ($cache_acceleration > 2) {
            echo "👍 Bon cache. Accélération de {$cache_acceleration}x\n";
        } else {
            echo "⚠️  Cache peu efficace. Vérifiez la configuration.\n";
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Exécution des tests de performance
if (php_sapi_name() === 'cli') {
    $test = new PerformanceTest();
    $test->runPerformanceTests();
} else {
    echo "⚠️ Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage : php tests/PerformanceTest.php\n";
}