<?php
declare(strict_types=1);

/**
 * Suite de tests complète pour GeeknDragon
 * Unique fichier centralisant tous les tests unitaires et fonctionnels
 */

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Service\ProductService;
use GeeknDragon\I18n\TranslationService;
use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\CartService;
use GeeknDragon\Core\Router;

class AllTests
{
    private array $results = [];
    private int $totalTests = 0;
    private int $passedTests = 0;
    private int $failedTests = 0;
    
    /**
     * Lance tous les tests
     */
    public function runAll(): void
    {
        echo "🧪 Lancement de la suite de tests GeeknDragon\n\n";
        
        // Tests des services
        $this->testProductService();
        $this->testTranslationService();
        $this->testSnipcartClient();
        $this->testCartService();
        $this->testRouter();
        
        // Tests fonctionnels
        $this->testFileIncludes();
        $this->testConfigurationFiles();
        $this->testAssetFiles();
        
        // Tests d'intégration
        $this->testPageRendering();
        
        // Résumé final
        $this->printSummary();
    }
    
    /**
     * Test du service produits
     */
    private function testProductService(): void
    {
        echo "📦 Tests ProductService...\n";
        
        try {
            $service = ProductService::getInstance();
            
            // Test récupération de tous les produits
            $products = $service->getAllProducts();
            $this->assert(!empty($products), "ProductService doit retourner des produits");
            
            // Test récupération d'un produit spécifique
            $firstProductKey = array_key_first($products);
            $product = $service->getProduct($firstProductKey);
            $this->assert($product !== null, "ProductService doit retourner un produit existant");
            $this->assert(isset($product['name']), "Un produit doit avoir un nom");
            $this->assert(isset($product['price']), "Un produit doit avoir un prix");
            
            // Test gestion des langues
            $nameEN = $service->getProductName($product, 'en');
            $nameFR = $service->getProductName($product, 'fr');
            $this->assert(!empty($nameEN), "Le nom en anglais ne doit pas être vide");
            $this->assert(!empty($nameFR), "Le nom en français ne doit pas être vide");
            
            // Test produit inexistant
            $nonExistent = $service->getProduct('produit-inexistant');
            $this->assert($nonExistent === null, "Un produit inexistant doit retourner null");
            
        } catch (Exception $e) {
            $this->fail("ProductService: " . $e->getMessage());
        }
    }
    
    /**
     * Test du service de traductions
     */
    private function testTranslationService(): void
    {
        echo "🌐 Tests TranslationService...\n";
        
        try {
            $service = TranslationService::getInstance();
            
            // Test langue par défaut
            $this->assert($service->getCurrentLanguage() === 'fr', "La langue par défaut doit être le français");
            
            // Test changement de langue
            $service->setLanguage('en');
            $this->assert($service->getCurrentLanguage() === 'en', "Le changement de langue doit fonctionner");
            
            // Test récupération de traduction
            $service->setLanguage('fr');
            $translation = $service->get('nav.shop');
            $this->assert(!empty($translation), "Les traductions doivent être disponibles");
            
            // Test traduction avec clé imbriquée
            $metaTitle = $service->get('meta.home.title');
            $this->assert(!empty($metaTitle), "Les traductions imbriquées doivent fonctionner");
            
            // Test traduction inexistante
            $nonExistent = $service->get('cle.inexistante', 'default');
            $this->assert($nonExistent === 'default', "Une clé inexistante doit retourner la valeur par défaut");
            
            // Test détection de langue
            $_GET['lang'] = 'en';
            $detected = $service->detectLanguage();
            $this->assert($detected === 'en', "La détection de langue depuis URL doit fonctionner");
            unset($_GET['lang']);
            
        } catch (Exception $e) {
            $this->fail("TranslationService: " . $e->getMessage());
        }
    }
    
    /**
     * Test du client Snipcart
     */
    private function testSnipcartClient(): void
    {
        echo "🛒 Tests SnipcartClient...\n";
        
        try {
            // Test en mode mock
            $client = new SnipcartClient('test-key', 'test-secret', true);
            
            // Test récupération produit mock
            $product = $client->getProduct('test-product');
            $this->assert(isset($product['id']), "Le produit mock doit avoir un ID");
            $this->assert(isset($product['name']), "Le produit mock doit avoir un nom");
            $this->assert(isset($product['price']), "Le produit mock doit avoir un prix");

            // Test création produit mock
            $created = $client->createOrUpdateProduct([
                'id' => 'test-new-product',
                'name' => 'Produit Test',
                'price' => 9.99,
                'url' => 'https://example.com/product',
                'image' => '/images/test.jpg'
            ]);
            $this->assert($created['id'] === 'test-new-product', "La création de produit mock doit retourner l'ID fourni");

            // Test récupération inventaire mock
            $inventory = $client->getInventory('test-product');
            $this->assert(isset($inventory['stock']), "L'inventaire mock doit avoir un stock");
            $this->assert(is_int($inventory['stock']), "Le stock doit être un entier");
            
            // Test récupération commandes mock
            $orders = $client->getOrders();
            $this->assert(isset($orders['items']), "Les commandes mock doivent avoir des items");
            $this->assert(is_array($orders['items']), "Les items doivent être un tableau");
            
        } catch (Exception $e) {
            $this->fail("SnipcartClient: " . $e->getMessage());
        }
    }
    
    /**
     * Test du service panier
     */
    private function testCartService(): void
    {
        echo "🛍️ Tests CartService...\n";
        
        try {
            $client = new SnipcartClient('test-key', 'test-secret', true);
            $cart = new CartService($client);
            
            // Test panier vide initial
            $this->assert($cart->isEmpty(), "Le panier doit être vide initialement");
            $this->assert($cart->getItemCount() === 0, "Le nombre d'articles doit être 0");
            $this->assert($cart->getTotal() === 0.0, "Le total doit être 0");
            
            // Test ajout d'un produit
            $added = $cart->addItem('test-product', 2);
            $this->assert($added === true, "L'ajout de produit doit réussir");
            $this->assert(!$cart->isEmpty(), "Le panier ne doit plus être vide");
            $this->assert($cart->getItemCount() === 2, "Le nombre d'articles doit être 2");
            
            // Test récupération des items
            $items = $cart->getItems();
            $this->assert(count($items) === 1, "Il doit y avoir 1 type d'item");
            
            $firstItem = reset($items);
            $this->assert($firstItem['quantity'] === 2, "La quantité doit être 2");
            $this->assert($firstItem['productId'] === 'test-product', "L'ID produit doit correspondre");
            
            // Test mise à jour quantité
            $itemKey = array_key_first($items);
            $updated = $cart->updateQuantity($itemKey, 3);
            $this->assert($updated === true, "La mise à jour de quantité doit réussir");
            $this->assert($cart->getItemCount() === 3, "Le nombre d'articles doit être 3");
            
            // Test suppression d'item
            $removed = $cart->removeItem($itemKey);
            $this->assert($removed === true, "La suppression doit réussir");
            $this->assert($cart->isEmpty(), "Le panier doit être vide après suppression");
            
            // Test vidage du panier
            $cart->addItem('test-product', 1);
            $cart->clearCart();
            $this->assert($cart->isEmpty(), "Le panier doit être vide après vidage");
            
        } catch (Exception $e) {
            $this->fail("CartService: " . $e->getMessage());
        }
    }
    
    /**
     * Test du routeur
     */
    private function testRouter(): void
    {
        echo "🛣️ Tests Router...\n";
        
        try {
            $router = new Router();
            
            // Test ajout de routes
            $testExecuted = false;
            $router->get('/test', function() use (&$testExecuted) {
                $testExecuted = true;
            });
            
            // Simuler une requête
            $_SERVER['REQUEST_METHOD'] = 'GET';
            $_SERVER['REQUEST_URI'] = '/test';
            
            ob_start();
            $router->resolve();
            ob_end_clean();
            
            $this->assert($testExecuted === true, "Le routeur doit exécuter la route correspondante");
            
            // Test redirection
            $router->redirect('/old-path', '/new-path');
            
            // Note: Difficile de tester la redirection sans sortie HTTP réelle
            // On vérifie juste que la méthode ne lève pas d'exception
            $this->pass("Test des redirections passé");
            
        } catch (Exception $e) {
            $this->fail("Router: " . $e->getMessage());
        }
    }
    
    /**
     * Test des fichiers d'inclusion
     */
    private function testFileIncludes(): void
    {
        echo "📁 Tests des fichiers d'inclusion...\n";
        
        $criticalFiles = [
            'bootstrap.php',
            'config.php',
            'i18n.php',
            'header.php',
            'footer.php'
        ];
        
        foreach ($criticalFiles as $file) {
            $path = __DIR__ . '/../' . $file;
            $this->assert(file_exists($path), "Le fichier $file doit exister");
            
            if (file_exists($path)) {
                // Test de syntaxe PHP
                $output = [];
                $return = 0;
                exec("php -l \"$path\" 2>&1", $output, $return);
                $this->assert($return === 0, "Le fichier $file doit avoir une syntaxe PHP valide");
            }
        }
    }
    
    /**
     * Test des fichiers de configuration
     */
    private function testConfigurationFiles(): void
    {
        echo "⚙️ Tests des fichiers de configuration...\n";
        
        // Test composer.json
        $composerPath = __DIR__ . '/../composer.json';
        $this->assert(file_exists($composerPath), "composer.json doit exister");
        
        if (file_exists($composerPath)) {
            $composer = json_decode(file_get_contents($composerPath), true);
            $this->assert($composer !== null, "composer.json doit être un JSON valide");
            $this->assert(isset($composer['autoload']['psr-4']), "L'autoload PSR-4 doit être configuré");
        }
        
        // Test package.json
        $packagePath = __DIR__ . '/../package.json';
        $this->assert(file_exists($packagePath), "package.json doit exister");
        
        if (file_exists($packagePath)) {
            $package = json_decode(file_get_contents($packagePath), true);
            $this->assert($package !== null, "package.json doit être un JSON valide");
        }
        
        // Test fichiers de données
        $productsPath = __DIR__ . '/../data/products.json';
        $this->assert(file_exists($productsPath), "products.json doit exister");
        
        if (file_exists($productsPath)) {
            $products = json_decode(file_get_contents($productsPath), true);
            $this->assert($products !== null, "products.json doit être un JSON valide");
            $this->assert(!empty($products), "products.json ne doit pas être vide");
        }
    }
    
    /**
     * Test des fichiers d'assets
     */
    private function testAssetFiles(): void
    {
        echo "🎨 Tests des fichiers d'assets...\n";
        
        $criticalAssets = [
            'css/styles.css',
            'js/app.js'
        ];
        
        foreach ($criticalAssets as $asset) {
            $path = __DIR__ . '/../' . $asset;
            $this->assert(file_exists($path), "L'asset $asset doit exister");
            
            if (file_exists($path)) {
                $size = filesize($path);
                $this->assert($size > 0, "L'asset $asset ne doit pas être vide");
            }
        }
    }
    
    /**
     * Test du rendu des pages
     */
    private function testPageRendering(): void
    {
        echo "🌐 Tests du rendu des pages...\n";
        
        // Test bootstrap
        try {
            ob_start();
            require __DIR__ . '/../bootstrap.php';
            ob_end_clean();
            $this->pass("Bootstrap se charge sans erreur");
        } catch (Exception $e) {
            $this->fail("Erreur de chargement du bootstrap: " . $e->getMessage());
        }
        
        // Test configuration
        try {
            $config = require __DIR__ . '/../config.php';
            $this->assert(is_array($config), "La configuration doit retourner un tableau");
            $this->assert(isset($config['snipcart_api_key']), "La configuration doit contenir les clés Snipcart");
        } catch (Exception $e) {
            $this->fail("Erreur de chargement de la configuration: " . $e->getMessage());
        }
    }
    
    /**
     * Assertion réussie
     */
    private function assert(bool $condition, string $message): void
    {
        $this->totalTests++;
        
        if ($condition) {
            $this->passedTests++;
            echo "  ✅ $message\n";
        } else {
            $this->failedTests++;
            echo "  ❌ $message\n";
        }
    }
    
    /**
     * Test réussi explicite
     */
    private function pass(string $message): void
    {
        $this->totalTests++;
        $this->passedTests++;
        echo "  ✅ $message\n";
    }
    
    /**
     * Test échoué explicite
     */
    private function fail(string $message): void
    {
        $this->totalTests++;
        $this->failedTests++;
        echo "  ❌ $message\n";
    }
    
    /**
     * Affiche le résumé des tests
     */
    private function printSummary(): void
    {
        echo "\n" . str_repeat('=', 60) . "\n";
        echo "📊 RÉSUMÉ DES TESTS\n";
        echo str_repeat('=', 60) . "\n";
        echo "Total: {$this->totalTests} tests\n";
        echo "✅ Réussis: {$this->passedTests}\n";
        echo "❌ Échoués: {$this->failedTests}\n";
        
        $successRate = $this->totalTests > 0 ? round(($this->passedTests / $this->totalTests) * 100, 1) : 0;
        echo "📈 Taux de réussite: {$successRate}%\n";
        
        if ($this->failedTests === 0) {
            echo "\n🎉 Tous les tests sont passés avec succès !\n";
            exit(0);
        } else {
            echo "\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.\n";
            exit(1);
        }
    }
}

// Exécution si appelé directement
if (php_sapi_name() === 'cli') {
    $tests = new AllTests();
    $tests->runAll();
}