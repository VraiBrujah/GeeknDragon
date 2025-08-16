<?php
/**
 * Test de compatibilité frontend
 * Valide que l'interface utilisateur reste identique après refactoring
 */

require_once __DIR__ . '/../bootstrap.php';

class FrontendCompatibilityTest
{
    private array $endpoints = [
        'boutique.php',
        'product.php?id=lot10',
        'product.php?id=pack-182-arsenal-aventurier',
        'api/products.php',
        'api/products.php?action=show&id=lot10'
    ];

    public function runCompatibilityTests(): void
    {
        echo "🎨 Tests de compatibilité frontend...\n\n";

        $this->testPageRendering();
        $this->testApiCompatibility();
        $this->testDataStructure();
        $this->testJavaScriptIntegration();

        echo "\n✅ Tests de compatibilité frontend terminés\n";
    }

    private function testPageRendering(): void
    {
        echo "🖼️  Test : Rendu des pages\n";

        foreach ($this->endpoints as $endpoint) {
            if (strpos($endpoint, 'api/') === 0) {
                continue; // Skip API endpoints pour ce test
            }

            $this->testPageLoad($endpoint);
        }
    }

    private function testPageLoad(string $page): void
    {
        try {
            // Simuler une requête HTTP locale
            ob_start();
            
            // Sauvegarder les variables globales
            $old_get = $_GET;
            $old_server = $_SERVER;
            
            // Parser l'URL
            $parts = parse_url($page);
            $script = $parts['path'];
            parse_str($parts['query'] ?? '', $_GET);
            
            $_SERVER['REQUEST_METHOD'] = 'GET';
            $_SERVER['HTTP_HOST'] = 'localhost';
            
            // Inclure la page
            if (file_exists(__DIR__ . '/../' . $script)) {
                include __DIR__ . '/../' . $script;
                $output = ob_get_contents();
                
                // Vérifications basiques
                $checks = [
                    'HTML valide' => strpos($output, '<!DOCTYPE html') !== false,
                    'Head présent' => strpos($output, '<head>') !== false,
                    'Body présent' => strpos($output, '<body>') !== false,
                    'Pas d\'erreur PHP' => strpos($output, 'Fatal error') === false && strpos($output, 'Warning') === false
                ];
                
                $passed = array_filter($checks);
                $status = count($passed) === count($checks) ? '✅' : '❌';
                
                echo "  {$status} {$script} (" . count($passed) . "/" . count($checks) . " vérifications)\n";
                
                if (count($passed) !== count($checks)) {
                    foreach ($checks as $check => $result) {
                        if (!$result) {
                            echo "    ❌ {$check}\n";
                        }
                    }
                }
            } else {
                echo "  ❌ {$script} - Fichier non trouvé\n";
            }
            
            // Restaurer les variables globales
            $_GET = $old_get;
            $_SERVER = $old_server;
            
        } catch (\Exception $e) {
            echo "  ❌ {$page} - Erreur: " . $e->getMessage() . "\n";
        } finally {
            ob_end_clean();
        }
    }

    private function testApiCompatibility(): void
    {
        echo "\n🔌 Test : Compatibilité API\n";

        // Test API produits
        $this->testApiEndpoint('products.php', [
            'structure' => ['products', 'total'],
            'products_not_empty' => true
        ]);

        // Test API produit spécifique
        $this->testApiEndpoint('products.php?action=show&id=lot10', [
            'structure' => ['product'],
            'product_fields' => ['id', 'name', 'price', 'description']
        ]);

        // Test API recherche
        $this->testApiEndpoint('products.php?action=search&q=pièces', [
            'structure' => ['products', 'total', 'query']
        ]);
    }

    private function testApiEndpoint(string $endpoint, array $expectations): void
    {
        try {
            // Simuler appel API
            $old_get = $_GET;
            $old_server = $_SERVER;
            
            $parts = parse_url($endpoint);
            parse_str($parts['query'] ?? '', $_GET);
            $_SERVER['REQUEST_METHOD'] = 'GET';
            
            ob_start();
            include __DIR__ . '/../api/' . $parts['path'];
            $output = ob_get_contents();
            ob_end_clean();
            
            $data = json_decode($output, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo "  ❌ {$endpoint} - JSON invalide\n";
                return;
            }
            
            $checks = [];
            
            // Vérifier la structure
            if (isset($expectations['structure'])) {
                foreach ($expectations['structure'] as $field) {
                    $checks["Structure: {$field}"] = isset($data[$field]);
                }
            }
            
            // Vérifier que products n'est pas vide
            if (isset($expectations['products_not_empty'])) {
                $checks['Products non vide'] = isset($data['products']) && count($data['products']) > 0;
            }
            
            // Vérifier les champs d'un produit
            if (isset($expectations['product_fields']) && isset($data['product'])) {
                foreach ($expectations['product_fields'] as $field) {
                    $checks["Champ produit: {$field}"] = isset($data['product'][$field]);
                }
            }
            
            $passed = array_filter($checks);
            $status = count($passed) === count($checks) ? '✅' : '❌';
            
            echo "  {$status} {$endpoint} (" . count($passed) . "/" . count($checks) . " vérifications)\n";
            
            $_GET = $old_get;
            $_SERVER = $old_server;
            
        } catch (\Exception $e) {
            echo "  ❌ {$endpoint} - Erreur: " . $e->getMessage() . "\n";
        }
    }

    private function testDataStructure(): void
    {
        echo "\n📊 Test : Structure des données\n";

        // Vérifier que la structure JSON est préservée
        $originalData = json_decode(file_get_contents(__DIR__ . '/../data/products.json'), true);
        
        // Via le nouveau service
        $productService = new \GeeknDragon\Services\ProductService();
        $processedData = $productService->getAllProducts();
        
        $checks = [
            'Même nombre de produits' => count($originalData) === count($processedData),
            'IDs préservés' => array_keys($originalData) === array_keys($processedData),
            'Champs essentiels présents' => $this->checkEssentialFields($processedData)
        ];
        
        foreach ($checks as $check => $result) {
            $status = $result ? '✅' : '❌';
            echo "  {$status} {$check}\n";
        }
    }

    private function checkEssentialFields(array $products): bool
    {
        $essentialFields = ['id', 'name', 'price', 'description'];
        
        foreach ($products as $product) {
            foreach ($essentialFields as $field) {
                if (!isset($product[$field])) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private function testJavaScriptIntegration(): void
    {
        echo "\n⚡ Test : Intégration JavaScript\n";

        // Vérifier que les fichiers JS existent
        $jsFiles = [
            'js/app.js',
            'js/boutique-premium.js',
            'js/currency-converter.js',
            'js/hero-videos.js'
        ];

        foreach ($jsFiles as $jsFile) {
            $exists = file_exists(__DIR__ . '/../' . $jsFile);
            $status = $exists ? '✅' : '❌';
            echo "  {$status} {$jsFile}\n";
        }

        // Vérifier que les attributs data-* sont préservés
        ob_start();
        include __DIR__ . '/../boutique.php';
        $boutiquePage = ob_get_contents();
        ob_end_clean();

        $dataAttributes = [
            'data-i18n' => 'Attributs d\'internationalisation',
            'data-gallery' => 'Attributs de galerie',
            'data-videos' => 'Attributs vidéo'
        ];

        foreach ($dataAttributes as $attr => $description) {
            $present = strpos($boutiquePage, $attr) !== false;
            $status = $present ? '✅' : '❌';
            echo "  {$status} {$description}\n";
        }
    }
}

// Exécution des tests
if (php_sapi_name() === 'cli') {
    $test = new FrontendCompatibilityTest();
    $test->runCompatibilityTests();
} else {
    echo "⚠️ Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage : php tests/FrontendCompatibilityTest.php\n";
}