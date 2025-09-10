<?php
/**
 * Script de Test Snipcart - GeeknDragon
 * ======================================
 * 
 * Ce script teste toute l'intégration Snipcart :
 * - Configuration et connectivité
 * - Endpoints API et webhook
 * - Données produits et prix
 * - Templates et personnalisation
 */

require_once __DIR__ . '/../config/snipcart-config.php';

class SnipcartTester
{
    private $config;
    private $results = [];

    public function __construct()
    {
        $this->config = SnipcartConfig::getConfig();
    }

    /**
     * Exécution complète des tests
     */
    public function runAllTests(): void
    {
        echo "🧪 Tests Snipcart - GeeknDragon\n";
        echo "=" . str_repeat("=", 40) . "\n\n";

        $this->testConfiguration();
        $this->testProductsData();
        $this->testWebhookEndpoint();
        $this->testTemplates();
        $this->testJavaScriptIntegration();
        $this->testCartFunctionality();
        
        $this->displayResults();
    }

    /**
     * Test de la configuration
     */
    private function testConfiguration(): void
    {
        echo "🔧 Test de la configuration...\n";

        // Test des clés API
        $apiKey = $this->config['api_key'];
        $secretKey = $this->config['secret_key'];

        if ($apiKey !== 'pk_test_your_key_here' && preg_match('/^pk_(test|live)_/', $apiKey)) {
            $this->addResult('✅ Clé API publique configurée', 'config');
        } else {
            $this->addResult('❌ Clé API publique manquante ou invalide', 'config');
        }

        if ($secretKey !== 'sk_test_your_secret_key_here' && preg_match('/^sk_(test|live)_/', $secretKey)) {
            $this->addResult('✅ Clé API secrète configurée', 'config');
        } else {
            $this->addResult('❌ Clé API secrète manquante ou invalide', 'config');
        }

        // Test cohérence environnement
        $keyEnv = str_contains($apiKey, 'test') ? 'test' : 'live';
        $configEnv = $this->config['environment'] === 'production' ? 'live' : 'test';

        if ($keyEnv === $configEnv) {
            $this->addResult('✅ Cohérence environnement/clés', 'config');
        } else {
            $this->addResult("⚠️ Incohérence: env={$configEnv}, clés={$keyEnv}", 'config');
        }

        echo "  Configuration: " . count(array_filter($this->results['config'], fn($r) => str_starts_with($r, '✅'))) . "/3 validée\n\n";
    }

    /**
     * Test des données produits
     */
    private function testProductsData(): void
    {
        echo "📦 Test des données produits...\n";

        $productsFile = __DIR__ . '/../data/products.json';
        
        if (!file_exists($productsFile)) {
            $this->addResult('❌ Fichier products.json manquant', 'products');
            echo "  Produits: 0/3 validés\n\n";
            return;
        }

        $products = json_decode(file_get_contents($productsFile), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->addResult('❌ Format JSON invalide: ' . json_last_error_msg(), 'products');
            echo "  Produits: 0/3 validés\n\n";
            return;
        }

        $this->addResult('✅ Fichier products.json valide', 'products');

        // Validation structure des produits
        $requiredFields = ['name', 'price', 'description'];
        $validProducts = 0;

        foreach ($products as $id => $product) {
            $isValid = true;
            foreach ($requiredFields as $field) {
                if (empty($product[$field])) {
                    $isValid = false;
                    break;
                }
            }
            if ($isValid) $validProducts++;
        }

        if ($validProducts === count($products)) {
            $this->addResult("✅ Tous les produits ({$validProducts}) sont valides", 'products');
        } else {
            $this->addResult("⚠️ {$validProducts}/" . count($products) . " produits valides", 'products');
        }

        // Test génération données Snipcart
        $snipcartProducts = SnipcartConfig::getProductsForSnipcart();
        if (!empty($snipcartProducts)) {
            $this->addResult("✅ Conversion Snipcart OK ({count($snipcartProducts)} produits)", 'products');
        } else {
            $this->addResult('❌ Échec conversion Snipcart', 'products');
        }

        $validResults = count(array_filter($this->results['products'], fn($r) => str_starts_with($r, '✅')));
        echo "  Produits: {$validResults}/3 validés\n\n";
    }

    /**
     * Test du webhook
     */
    private function testWebhookEndpoint(): void
    {
        echo "🌐 Test de l'endpoint webhook...\n";

        $webhookFile = __DIR__ . '/../api/snipcart-webhook.php';
        
        if (!file_exists($webhookFile)) {
            $this->addResult('❌ Fichier webhook manquant', 'webhook');
            echo "  Webhook: 0/3 validé\n\n";
            return;
        }

        $this->addResult('✅ Fichier webhook présent', 'webhook');

        // Test syntaxe PHP
        $output = [];
        $returnVar = 0;
        exec("php -l " . escapeshellarg($webhookFile), $output, $returnVar);
        
        if ($returnVar === 0) {
            $this->addResult('✅ Syntaxe PHP valide', 'webhook');
        } else {
            $this->addResult('❌ Erreur syntaxe PHP: ' . implode(' ', $output), 'webhook');
        }

        // Test accessibilité (si serveur web actif)
        $webhookUrl = $this->config['webhook_url'];
        $headers = @get_headers($webhookUrl, 1);
        
        if ($headers && (strpos($headers[0], '200') !== false || strpos($headers[0], '405') !== false)) {
            // 405 Method Not Allowed est attendu pour GET sur webhook POST
            $this->addResult('✅ Webhook accessible via HTTP', 'webhook');
        } else {
            $this->addResult('⚠️ Webhook non accessible (serveur éteint?)', 'webhook');
        }

        $validResults = count(array_filter($this->results['webhook'], fn($r) => str_starts_with($r, '✅')));
        echo "  Webhook: {$validResults}/3 validé\n\n";
    }

    /**
     * Test des templates
     */
    private function testTemplates(): void
    {
        echo "🎨 Test des templates...\n";

        $templatesFile = __DIR__ . '/../templates/snipcart-templates.html';
        
        if (!file_exists($templatesFile)) {
            $this->addResult('❌ Fichier templates manquant', 'templates');
            echo "  Templates: 0/3 validés\n\n";
            return;
        }

        $this->addResult('✅ Fichier templates présent', 'templates');

        $content = file_get_contents($templatesFile);
        
        // Vérification des templates requis
        $requiredTemplates = [
            'snipcart-layout',
            'snipcart-item',
            'snipcart-cart-summary',
            'snipcart-checkout'
        ];

        $foundTemplates = 0;
        foreach ($requiredTemplates as $templateId) {
            if (strpos($content, 'id="' . $templateId . '"') !== false) {
                $foundTemplates++;
            }
        }

        if ($foundTemplates === count($requiredTemplates)) {
            $this->addResult('✅ Tous les templates requis présents', 'templates');
        } else {
            $this->addResult("⚠️ {$foundTemplates}/" . count($requiredTemplates) . " templates trouvés", 'templates');
        }

        // Vérification du thème D&D
        if (strpos($content, 'Sac d\'Aventurier') !== false && 
            strpos($content, 'medieval') !== false) {
            $this->addResult('✅ Thématique D&D intégrée', 'templates');
        } else {
            $this->addResult('⚠️ Thématique D&D partielle', 'templates');
        }

        $validResults = count(array_filter($this->results['templates'], fn($r) => str_starts_with($r, '✅')));
        echo "  Templates: {$validResults}/3 validés\n\n";
    }

    /**
     * Test de l'intégration JavaScript
     */
    private function testJavaScriptIntegration(): void
    {
        echo "📜 Test de l'intégration JavaScript...\n";

        $jsFiles = [
            'snipcart-integration.js' => __DIR__ . '/../js/snipcart-integration.js',
            'snipcart-products.js' => __DIR__ . '/../js/snipcart-products.js',
        ];

        $validFiles = 0;
        foreach ($jsFiles as $name => $path) {
            if (file_exists($path)) {
                $validFiles++;
            }
        }

        if ($validFiles === count($jsFiles)) {
            $this->addResult('✅ Tous les scripts JS présents', 'javascript');
        } else {
            $this->addResult("⚠️ {$validFiles}/" . count($jsFiles) . " scripts JS trouvés", 'javascript');
        }

        // Test des pages HTML
        $htmlFiles = [
            'index.html' => __DIR__ . '/../index.html',
            'boutique.html' => __DIR__ . '/../boutique.html',
        ];

        $configuredPages = 0;
        foreach ($htmlFiles as $name => $path) {
            if (file_exists($path)) {
                $content = file_get_contents($path);
                if (strpos($content, 'snipcart-integration.js') !== false &&
                    strpos($content, 'data-api-key') !== false) {
                    $configuredPages++;
                }
            }
        }

        if ($configuredPages === count($htmlFiles)) {
            $this->addResult('✅ Pages HTML configurées pour Snipcart', 'javascript');
        } else {
            $this->addResult("⚠️ {$configuredPages}/" . count($htmlFiles) . " pages configurées", 'javascript');
        }

        // Test widget panier
        $cartWidgetCss = __DIR__ . '/../css/cart-widget.css';
        if (file_exists($cartWidgetCss)) {
            $this->addResult('✅ Styles du widget panier présents', 'javascript');
        } else {
            $this->addResult('❌ Styles du widget panier manquants', 'javascript');
        }

        $validResults = count(array_filter($this->results['javascript'], fn($r) => str_starts_with($r, '✅')));
        echo "  JavaScript: {$validResults}/3 validés\n\n";
    }

    /**
     * Test fonctionnel du panier (simulation)
     */
    private function testCartFunctionality(): void
    {
        echo "🛒 Test fonctionnel du panier...\n";

        // Test simulation ajout produit
        $products = SnipcartConfig::getProductsForSnipcart();
        
        if (!empty($products)) {
            $testProduct = reset($products);
            $this->addResult("✅ Produit de test disponible: {$testProduct['name']}", 'cart');
        } else {
            $this->addResult('❌ Aucun produit pour test', 'cart');
        }

        // Test calcul frais de port
        $shippingConfig = $this->config['shipping'];
        if ($shippingConfig['standard_rate_base'] > 0 && 
            $shippingConfig['free_shipping_threshold'] > 0) {
            $this->addResult('✅ Configuration frais de port valide', 'cart');
        } else {
            $this->addResult('❌ Configuration frais de port manquante', 'cart');
        }

        // Test calcul taxes
        $taxRates = $this->config['taxes'];
        if (!empty($taxRates) && isset($taxRates['QC'])) {
            $this->addResult("✅ Taxes configurées pour " . count($taxRates) . " provinces", 'cart');
        } else {
            $this->addResult('❌ Configuration des taxes manquante', 'cart');
        }

        $validResults = count(array_filter($this->results['cart'], fn($r) => str_starts_with($r, '✅')));
        echo "  Panier: {$validResults}/3 validés\n\n";
    }

    /**
     * Ajout d'un résultat de test
     */
    private function addResult(string $message, string $category): void
    {
        if (!isset($this->results[$category])) {
            $this->results[$category] = [];
        }
        $this->results[$category][] = $message;
    }

    /**
     * Affichage des résultats finaux
     */
    private function displayResults(): void
    {
        echo "📊 Résumé des Tests\n";
        echo "=" . str_repeat("=", 25) . "\n\n";

        $totalTests = 0;
        $passedTests = 0;

        foreach ($this->results as $category => $results) {
            $categoryPassed = count(array_filter($results, fn($r) => str_starts_with($r, '✅')));
            $categoryTotal = count($results);
            
            $totalTests += $categoryTotal;
            $passedTests += $categoryPassed;

            $categoryName = ucfirst($category);
            echo "{$categoryName}: {$categoryPassed}/{$categoryTotal} ✅\n";
            
            foreach ($results as $result) {
                echo "  {$result}\n";
            }
            echo "\n";
        }

        // Score global
        $percentage = $totalTests > 0 ? round(($passedTests / $totalTests) * 100) : 0;
        
        echo "🎯 Score Global: {$passedTests}/{$totalTests} ({$percentage}%)\n\n";

        if ($percentage >= 80) {
            echo "🎉 Intégration Snipcart prête ! Vous pouvez tester avec de vraies commandes.\n";
            $this->displayNextSteps();
        } elseif ($percentage >= 60) {
            echo "⚠️ Intégration fonctionnelle mais améliorations recommandées.\n";
            $this->displayNextSteps();
        } else {
            echo "❌ Intégration incomplète. Corrigez les erreurs avant de continuer.\n";
        }
    }

    /**
     * Affichage des prochaines étapes
     */
    private function displayNextSteps(): void
    {
        echo "\n📋 Prochaines étapes recommandées :\n";
        echo "1. Testez l'ajout au panier sur http://localhost:8000/boutique.html\n";
        echo "2. Testez une commande avec la carte 4242 4242 4242 4242\n";
        echo "3. Configurez le webhook dans votre dashboard Snipcart\n";
        echo "4. Vérifiez les emails de confirmation\n";
        echo "5. Testez sur mobile et différents navigateurs\n\n";
        
        echo "🔗 Liens utiles :\n";
        echo "  • Dashboard Snipcart: https://app.snipcart.com/dashboard\n";
        echo "  • Documentation: https://docs.snipcart.com/\n";
        echo "  • Cartes de test: https://docs.snipcart.com/v3/setup/test-mode\n\n";
    }
}

// Exécution du script si appelé directement
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $tester = new SnipcartTester();
    $tester->runAllTests();
}
?>