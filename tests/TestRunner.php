<?php
/**
 * Test Runner simple pour valider le refactoring
 * Exécute tous les tests unitaires et d'intégration
 */

require_once __DIR__ . '/../bootstrap.php';

class TestRunner
{
    private array $results = [];
    private int $passed = 0;
    private int $failed = 0;

    public function runAllTests(): void
    {
        echo "🧪 Démarrage des tests de validation du refactoring...\n\n";

        $this->testApplicationCore();
        $this->testServices();
        $this->testRepositories();
        $this->testMediaProcessing();
        $this->testApiEndpoints();
        $this->testBackwardCompatibility();

        $this->displayResults();
    }

    private function testApplicationCore(): void
    {
        echo "📋 Test : Application Core\n";

        // Test Singleton Application
        $this->assert(
            'Application Singleton',
            function() {
                $app1 = \GeeknDragon\Core\Application::getInstance();
                $app2 = \GeeknDragon\Core\Application::getInstance();
                return $app1 === $app2;
            }
        );

        // Test ServiceFactory
        $this->assert(
            'ServiceFactory création',
            function() {
                $service1 = \GeeknDragon\Factories\ServiceFactory::create('cache');
                $service2 = \GeeknDragon\Factories\ServiceFactory::create('cache');
                return $service1 === $service2; // Doit être la même instance
            }
        );

        // Test services disponibles
        $this->assert(
            'Services disponibles',
            function() {
                $available = \GeeknDragon\Factories\ServiceFactory::getAvailableServices();
                return in_array('media', $available) && 
                       in_array('product', $available) && 
                       in_array('cache', $available);
            }
        );
    }

    private function testServices(): void
    {
        echo "\n🔧 Test : Services\n";

        // Test CacheService
        $this->assert(
            'CacheService fonctionnel',
            function() {
                $cache = new \GeeknDragon\Services\CacheService();
                $cache->set('test_key', 'test_value', 60);
                return $cache->get('test_key') === 'test_value';
            }
        );

        // Test ProductService
        $this->assert(
            'ProductService charge les données',
            function() {
                $productService = new \GeeknDragon\Services\ProductService();
                $products = $productService->getAllProducts();
                return is_array($products) && count($products) > 0;
            }
        );
    }

    private function testRepositories(): void
    {
        echo "\n📚 Test : Repositories\n";

        // Test ProductRepository
        $this->assert(
            'ProductRepository charge les données',
            function() {
                $repo = new \GeeknDragon\Repositories\ProductRepository();
                $products = $repo->findAll();
                return is_array($products) && count($products) > 0;
            }
        );

        // Test recherche par catégorie
        $this->assert(
            'ProductRepository filtre par catégorie',
            function() {
                $repo = new \GeeknDragon\Repositories\ProductRepository();
                $pieces = $repo->findByCategory('pieces');
                $cards = $repo->findByCategory('cards');
                return is_array($pieces) && is_array($cards);
            }
        );

        // Test recherche textuelle
        $this->assert(
            'ProductRepository recherche textuelle',
            function() {
                $repo = new \GeeknDragon\Repositories\ProductRepository();
                $results = $repo->search(['text' => 'pièces']);
                return is_array($results);
            }
        );
    }

    private function testMediaProcessing(): void
    {
        echo "\n🎬 Test : Traitement des médias\n";

        // Test création du service média
        $this->assert(
            'MediaService instanciation',
            function() {
                $mediaService = new \GeeknDragon\Services\MediaService();
                return $mediaService instanceof \GeeknDragon\Services\MediaService;
            }
        );

        // Test ImageProcessor
        $this->assert(
            'ImageProcessor instanciation',
            function() {
                $processor = new \GeeknDragon\Processors\ImageProcessor();
                return $processor instanceof \GeeknDragon\Processors\ImageProcessor;
            }
        );

        // Test VideoProcessor
        $this->assert(
            'VideoProcessor instanciation',
            function() {
                $processor = new \GeeknDragon\Processors\VideoProcessor();
                return $processor instanceof \GeeknDragon\Processors\VideoProcessor;
            }
        );
    }

    private function testApiEndpoints(): void
    {
        echo "\n🌐 Test : API Endpoints\n";

        // Test ProductController
        $this->assert(
            'ProductController instanciation',
            function() {
                $controller = new \GeeknDragon\Controllers\ProductController();
                return $controller instanceof \GeeknDragon\Controllers\ProductController;
            }
        );

        // Test MediaController
        $this->assert(
            'MediaController instanciation',
            function() {
                $controller = new \GeeknDragon\Controllers\MediaController();
                return $controller instanceof \GeeknDragon\Controllers\MediaController;
            }
        );

        // Test récupération des produits via contrôleur
        $this->assert(
            'ProductController récupère les produits',
            function() {
                $controller = new \GeeknDragon\Controllers\ProductController();
                $result = $controller->index();
                return isset($result['products']) && is_array($result['products']);
            }
        );
    }

    private function testBackwardCompatibility(): void
    {
        echo "\n⚡ Test : Compatibilité arrière\n";

        // Test que les fichiers de données existent toujours
        $this->assert(
            'Fichier products.json accessible',
            function() {
                return file_exists(__DIR__ . '/../data/products.json');
            }
        );

        // Test que la structure des données est préservée
        $this->assert(
            'Structure des données préservée',
            function() {
                $data = json_decode(file_get_contents(__DIR__ . '/../data/products.json'), true);
                $firstProduct = reset($data);
                return isset($firstProduct['name'], $firstProduct['price'], $firstProduct['description']);
            }
        );

        // Test que les fonctions de stock existent toujours
        $this->assert(
            'Fonctions de stock disponibles',
            function() {
                require_once __DIR__ . '/../includes/stock-functions.php';
                return function_exists('getStock') && function_exists('inStock');
            }
        );
    }

    private function assert(string $testName, callable $test): void
    {
        try {
            $result = $test();
            if ($result) {
                echo "  ✅ {$testName}\n";
                $this->passed++;
            } else {
                echo "  ❌ {$testName} - Échec\n";
                $this->failed++;
            }
        } catch (\Exception $e) {
            echo "  ❌ {$testName} - Erreur: " . $e->getMessage() . "\n";
            $this->failed++;
        }
    }

    private function displayResults(): void
    {
        $total = $this->passed + $this->failed;
        $successRate = $total > 0 ? round(($this->passed / $total) * 100, 1) : 0;

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 RÉSULTATS DES TESTS\n";
        echo str_repeat("=", 60) . "\n";
        echo "Tests réussis    : {$this->passed}\n";
        echo "Tests échoués    : {$this->failed}\n";
        echo "Total            : {$total}\n";
        echo "Taux de réussite : {$successRate}%\n";
        echo str_repeat("=", 60) . "\n";

        if ($this->failed === 0) {
            echo "🎉 Tous les tests sont passés ! Le refactoring est validé.\n";
        } else {
            echo "⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.\n";
        }
    }
}

// Exécution des tests
if (php_sapi_name() === 'cli') {
    $runner = new TestRunner();
    $runner->runAllTests();
} else {
    echo "⚠️ Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage : php tests/TestRunner.php\n";
}