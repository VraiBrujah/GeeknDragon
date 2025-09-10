<?php
/**
 * Script d'initialisation Snipcart
 * =================================
 * 
 * Ce script prépare l'environnement pour l'intégration Snipcart :
 * - Création des dossiers nécessaires
 * - Vérification de la configuration
 * - Tests de connectivité
 * - Génération des fichiers de configuration
 */

// Chemin vers la racine du projet
$projectRoot = dirname(__DIR__);

// Chargement de la configuration
require_once $projectRoot . '/config/snipcart-config.php';

class SnipcartInitializer
{
    private $projectRoot;
    private $config;
    private $errors = [];
    private $warnings = [];

    public function __construct(string $projectRoot)
    {
        $this->projectRoot = $projectRoot;
        $this->config = SnipcartConfig::getConfig();
    }

    /**
     * Exécution complète de l'initialisation
     */
    public function run(): bool
    {
        echo "🐉 Initialisation de l'intégration Snipcart - GeeknDragon\n";
        echo "=" . str_repeat("=", 60) . "\n\n";

        // Étapes d'initialisation
        $this->createDirectories();
        $this->validateConfiguration();
        $this->generateConfigFiles();
        $this->checkPermissions();
        $this->testConnectivity();
        $this->generateJavaScriptConfig();
        
        // Affichage du résumé
        $this->displaySummary();

        return empty($this->errors);
    }

    /**
     * Création des dossiers nécessaires
     */
    private function createDirectories(): void
    {
        echo "📁 Création des dossiers...\n";

        $directories = [
            'logs' => $this->projectRoot . '/logs',
            'api' => $this->projectRoot . '/api',
            'config' => $this->projectRoot . '/config',
            'templates' => $this->projectRoot . '/templates',
            'data' => $this->projectRoot . '/data',
            'scripts' => $this->projectRoot . '/scripts',
        ];

        foreach ($directories as $name => $path) {
            if (!is_dir($path)) {
                if (mkdir($path, 0755, true)) {
                    echo "  ✅ Dossier créé: {$name}\n";
                } else {
                    $this->errors[] = "Impossible de créer le dossier: {$path}";
                    echo "  ❌ Erreur: {$name}\n";
                }
            } else {
                echo "  ✅ Dossier existant: {$name}\n";
            }
        }

        // Création du fichier .htaccess pour les logs
        $htaccessPath = $this->projectRoot . '/logs/.htaccess';
        if (!file_exists($htaccessPath)) {
            file_put_contents($htaccessPath, "Order deny,allow\nDeny from all\n");
            echo "  ✅ Protection .htaccess créée pour les logs\n";
        }

        echo "\n";
    }

    /**
     * Validation de la configuration
     */
    private function validateConfiguration(): void
    {
        echo "🔧 Validation de la configuration...\n";

        $configErrors = SnipcartConfig::validateConfig();
        
        if (empty($configErrors)) {
            echo "  ✅ Configuration valide\n";
        } else {
            foreach ($configErrors as $error) {
                $this->errors[] = $error;
                echo "  ❌ {$error}\n";
            }
        }

        // Vérifications supplémentaires
        $this->validateEnvironmentFile();
        $this->validateProductsFile();

        echo "\n";
    }

    /**
     * Validation du fichier .env
     */
    private function validateEnvironmentFile(): void
    {
        $envFile = $this->projectRoot . '/.env';
        
        if (!file_exists($envFile)) {
            $this->warnings[] = "Fichier .env manquant - créez-le depuis .env.example";
            echo "  ⚠️ Fichier .env manquant\n";
        } else {
            echo "  ✅ Fichier .env présent\n";
        }
    }

    /**
     * Validation des données produits
     */
    private function validateProductsFile(): void
    {
        $productsFile = $this->projectRoot . '/data/products.json';
        
        if (!file_exists($productsFile)) {
            $this->errors[] = "Fichier products.json manquant dans /data/";
            echo "  ❌ Fichier products.json manquant\n";
            return;
        }

        $products = json_decode(file_get_contents($productsFile), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->errors[] = "Fichier products.json invalide: " . json_last_error_msg();
            echo "  ❌ Format JSON invalide\n";
            return;
        }

        if (empty($products)) {
            $this->warnings[] = "Aucun produit défini dans products.json";
            echo "  ⚠️ Aucun produit défini\n";
        } else {
            $count = count($products);
            echo "  ✅ {$count} produits trouvés\n";
        }
    }

    /**
     * Génération des fichiers de configuration
     */
    private function generateConfigFiles(): void
    {
        echo "⚙️ Génération des fichiers de configuration...\n";

        // Configuration JavaScript pour le frontend
        $jsConfigPath = $this->projectRoot . '/js/snipcart-config-generated.js';
        $jsConfig = SnipcartConfig::generateJavaScriptConfig();
        
        if (file_put_contents($jsConfigPath, $jsConfig)) {
            echo "  ✅ Configuration JS générée\n";
        } else {
            $this->errors[] = "Impossible de créer le fichier de configuration JS";
            echo "  ❌ Erreur configuration JS\n";
        }

        // Configuration des produits pour Snipcart
        $productsConfigPath = $this->projectRoot . '/data/snipcart-products.json';
        $productsConfig = SnipcartConfig::getProductsForSnipcart();
        
        if (file_put_contents($productsConfigPath, json_encode($productsConfig, JSON_PRETTY_PRINT))) {
            echo "  ✅ Configuration produits générée\n";
        } else {
            $this->errors[] = "Impossible de créer le fichier de configuration des produits";
            echo "  ❌ Erreur configuration produits\n";
        }

        echo "\n";
    }

    /**
     * Vérification des permissions
     */
    private function checkPermissions(): void
    {
        echo "🔐 Vérification des permissions...\n";

        $pathsToCheck = [
            'logs' => $this->projectRoot . '/logs',
            'data' => $this->projectRoot . '/data',
            'api' => $this->projectRoot . '/api',
        ];

        foreach ($pathsToCheck as $name => $path) {
            if (is_writable($path)) {
                echo "  ✅ Écriture autorisée: {$name}\n";
            } else {
                $this->warnings[] = "Permissions d'écriture manquantes: {$path}";
                echo "  ⚠️ Permissions limitées: {$name}\n";
            }
        }

        echo "\n";
    }

    /**
     * Test de connectivité Snipcart
     */
    private function testConnectivity(): void
    {
        echo "🌐 Test de connectivité Snipcart...\n";

        // Test avec l'API publique Snipcart
        $testUrl = 'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.js';
        
        $headers = @get_headers($testUrl);
        if ($headers && strpos($headers[0], '200') !== false) {
            echo "  ✅ Connexion aux CDN Snipcart OK\n";
        } else {
            $this->warnings[] = "Impossible de joindre les CDN Snipcart - vérifiez votre connexion";
            echo "  ⚠️ CDN Snipcart inaccessible\n";
        }

        // Test de la configuration API si les clés sont définies
        if ($this->config['api_key'] !== 'pk_test_your_key_here') {
            $this->testSnipcartAPI();
        } else {
            echo "  ⚠️ Tests API ignorés (clés par défaut)\n";
        }

        echo "\n";
    }

    /**
     * Test de l'API Snipcart
     */
    private function testSnipcartAPI(): void
    {
        $apiUrl = 'https://app.snipcart.com/api/requestvalidation';
        
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'Authorization: Basic ' . base64_encode($this->config['secret_key'] . ':'),
                    'Accept: application/json'
                ],
                'timeout' => 10
            ]
        ]);

        $response = @file_get_contents($apiUrl, false, $context);
        
        if ($response !== false) {
            echo "  ✅ API Snipcart accessible\n";
        } else {
            $this->warnings[] = "Test API Snipcart échoué - vérifiez vos clés";
            echo "  ⚠️ API Snipcart inaccessible\n";
        }
    }

    /**
     * Génération de la configuration JavaScript
     */
    private function generateJavaScriptConfig(): void
    {
        echo "📝 Mise à jour des fichiers HTML...\n";

        $apiKey = $this->config['api_key'];
        
        // Liste des fichiers HTML à mettre à jour
        $htmlFiles = [
            $this->projectRoot . '/index.html',
            $this->projectRoot . '/boutique.html',
        ];

        foreach ($htmlFiles as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                
                // Remplacer la clé API par défaut
                $content = str_replace(
                    'pk_test_your_key_here',
                    $apiKey,
                    $content
                );

                if (file_put_contents($file, $content)) {
                    $filename = basename($file);
                    echo "  ✅ Mis à jour: {$filename}\n";
                } else {
                    $this->warnings[] = "Impossible de mettre à jour: {$file}";
                    echo "  ⚠️ Erreur mise à jour: " . basename($file) . "\n";
                }
            }
        }

        echo "\n";
    }

    /**
     * Affichage du résumé final
     */
    private function displaySummary(): void
    {
        echo "📋 Résumé de l'initialisation\n";
        echo "=" . str_repeat("=", 30) . "\n\n";

        if (empty($this->errors)) {
            echo "🎉 Initialisation réussie !\n\n";
            
            echo "Prochaines étapes :\n";
            echo "1. Configurez vos vraies clés Snipcart dans .env\n";
            echo "2. Testez l'intégration sur http://localhost:8000/boutique.html\n";
            echo "3. Configurez le webhook dans votre dashboard Snipcart\n";
            echo "4. Testez une commande avec les cartes de test\n\n";
        } else {
            echo "❌ Erreurs détectées :\n";
            foreach ($this->errors as $error) {
                echo "  • {$error}\n";
            }
            echo "\n";
        }

        if (!empty($this->warnings)) {
            echo "⚠️ Avertissements :\n";
            foreach ($this->warnings as $warning) {
                echo "  • {$warning}\n";
            }
            echo "\n";
        }

        // Informations de configuration
        echo "🔧 Configuration actuelle :\n";
        echo "  • Environnement: " . $this->config['environment'] . "\n";
        echo "  • Devise: " . $this->config['currency'] . "\n";
        echo "  • Langue: " . $this->config['language'] . "\n";
        echo "  • Webhook: " . $this->config['webhook_url'] . "\n";
        echo "  • Templates: " . $this->config['templates_url'] . "\n\n";

        echo "🐉 GeeknDragon est prêt pour l'e-commerce héroïque !\n";
    }
}

// Exécution du script si appelé directement
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $initializer = new SnipcartInitializer($projectRoot);
    $success = $initializer->run();
    
    exit($success ? 0 : 1);
}
?>