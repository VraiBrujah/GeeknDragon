<?php
/**
 * Configuration Snipcart pour GeeknDragon
 * ========================================
 * 
 * Ce fichier centralise toute la configuration Snipcart
 * et les variables d'environnement nécessaires.
 */

// Chargement des variables d'environnement
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

class SnipcartConfig
{
    /**
     * Configuration Snipcart
     */
    public static function getConfig(): array
    {
        return [
            // Clés API
            'api_key' => $_ENV['SNIPCART_API_KEY'] ?? 'pk_test_your_key_here',
            'secret_key' => $_ENV['SNIPCART_SECRET_API_KEY'] ?? 'sk_test_your_secret_key_here',
            
            // Configuration générale
            'environment' => $_ENV['APP_ENV'] ?? 'development',
            'currency' => 'CAD',
            'language' => 'fr',
            'modal_style' => 'side',
            'add_product_behavior' => 'none',
            
            // URLs
            'webhook_url' => self::getBaseUrl() . '/api/snipcart-webhook.php',
            'templates_url' => self::getBaseUrl() . '/templates/snipcart-templates.html',
            
            // Frais de livraison
            'shipping' => [
                'free_shipping_threshold' => 150.00, // Livraison gratuite > 150$ CAD
                'standard_rate_base' => 8.99,        // Frais de base standard
                'express_surcharge' => 12.99,        // Supplément express
                'international_rate' => 25.00,       // Frais international
                'max_express_weight' => 1000,        // Max poids express (grammes)
            ],
            
            // Taxes par province canadienne
            'taxes' => [
                'QC' => 0.14975, // 5% TPS + 9.975% TVQ
                'ON' => 0.13,    // 13% HST
                'BC' => 0.12,    // 5% GST + 7% PST
                'AB' => 0.05,    // 5% GST seulement
                'SK' => 0.11,    // 5% GST + 6% PST
                'MB' => 0.12,    // 5% GST + 7% PST
                'NB' => 0.15,    // 15% HST
                'NS' => 0.15,    // 15% HST
                'PE' => 0.15,    // 15% HST
                'NL' => 0.15,    // 15% HST
                'NT' => 0.05,    // 5% GST
                'NU' => 0.05,    // 5% GST
                'YT' => 0.05,    // 5% GST
            ],
            
            // Configuration email
            'email' => [
                'smtp_host' => $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com',
                'smtp_port' => (int)($_ENV['SMTP_PORT'] ?? 587),
                'smtp_username' => $_ENV['SMTP_USERNAME'] ?? '',
                'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? '',
                'smtp_secure' => $_ENV['SMTP_SECURE'] ?? 'tls',
                'from_email' => 'commande@geekndragon.com',
                'from_name' => 'Geek&Dragon',
            ],
            
            // Logging
            'logging' => [
                'enabled' => true,
                'level' => $_ENV['LOG_LEVEL'] ?? 'INFO',
                'max_files' => 30, // Garder 30 jours de logs
                'path' => __DIR__ . '/../logs/',
            ],
            
            // Domaines autorisés
            'allowed_domains' => [
                'geekndragon.com',
                'www.geekndragon.com',
                'localhost:8000',
                'localhost:3000',
            ],
            
            // Webhooks events à écouter
            'webhook_events' => [
                'order.completed',
                'order.status.changed',
                'order.tracking.changed',
                'shippingrates.fetch',
                'taxes.calculate',
                'order.refund.created',
            ],
        ];
    }

    /**
     * Génère le JavaScript de configuration pour le frontend
     */
    public static function generateJavaScriptConfig(): string
    {
        $config = self::getConfig();
        
        $jsConfig = [
            'apiKey' => $config['api_key'],
            'currency' => $config['currency'],
            'language' => $config['language'],
            'modalStyle' => $config['modal_style'],
            'addProductBehavior' => $config['add_product_behavior'],
            'templatesUrl' => $config['templates_url'],
            'environment' => $config['environment'],
        ];

        return 'window.GEEKNDRAGON_SNIPCART_CONFIG = ' . json_encode($jsConfig, JSON_PRETTY_PRINT) . ';';
    }

    /**
     * Validation de la configuration
     */
    public static function validateConfig(): array
    {
        $config = self::getConfig();
        $errors = [];

        // Vérification des clés API
        if (empty($config['api_key']) || $config['api_key'] === 'pk_test_your_key_here') {
            $errors[] = 'SNIPCART_API_KEY manquante ou par défaut';
        }

        if (empty($config['secret_key']) || $config['secret_key'] === 'sk_test_your_secret_key_here') {
            $errors[] = 'SNIPCART_SECRET_API_KEY manquante ou par défaut';
        }

        // Vérification format des clés
        if (!empty($config['api_key']) && !preg_match('/^pk_(test|live)_[a-zA-Z0-9]{40}$/', $config['api_key'])) {
            $errors[] = 'Format de SNIPCART_API_KEY invalide';
        }

        if (!empty($config['secret_key']) && !preg_match('/^sk_(test|live)_[a-zA-Z0-9]{40}$/', $config['secret_key'])) {
            $errors[] = 'Format de SNIPCART_SECRET_API_KEY invalide';
        }

        // Vérification cohérence environnement/clés
        $keyEnv = str_contains($config['api_key'], 'test') ? 'test' : 'live';
        $configEnv = $config['environment'] === 'production' ? 'live' : 'test';

        if ($keyEnv !== $configEnv) {
            $errors[] = "Incohérence environnement: APP_ENV={$config['environment']} mais clés en mode {$keyEnv}";
        }

        // Vérification dossier de logs
        if (!is_dir($config['logging']['path'])) {
            $errors[] = "Dossier de logs inexistant: {$config['logging']['path']}";
        }

        // Vérification configuration SMTP si requise
        if (!empty($config['email']['smtp_username']) && empty($config['email']['smtp_password'])) {
            $errors[] = 'SMTP_PASSWORD requis si SMTP_USERNAME est défini';
        }

        return $errors;
    }

    /**
     * Génère les données produits formatées pour Snipcart
     */
    public static function getProductsForSnipcart(): array
    {
        $productsFile = __DIR__ . '/../data/products.json';
        if (!file_exists($productsFile)) {
            return [];
        }

        $products = json_decode(file_get_contents($productsFile), true);
        $snipcartProducts = [];

        foreach ($products as $id => $product) {
            $snipcartProducts[$id] = [
                'id' => $id,
                'name' => $product['name'],
                'name_en' => $product['name_en'] ?? $product['name'],
                'price' => $product['price'],
                'currency' => 'CAD',
                'description' => strip_tags($product['description']),
                'description_en' => strip_tags($product['description_en'] ?? $product['description']),
                'image' => !empty($product['images']) ? $product['images'][0] : null,
                'weight' => self::getProductWeight($id),
                'shipping_category' => self::getShippingCategory($id),
                'customFields' => self::getCustomFields($product),
                'metadata' => [
                    'category' => $product['category'] ?? 'accessories',
                    'summary' => $product['summary'] ?? '',
                    'summary_en' => $product['summary_en'] ?? $product['summary'] ?? '',
                ]
            ];
        }

        return $snipcartProducts;
    }

    /**
     * Helpers privés
     */
    private static function getBaseUrl(): string
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        return "{$protocol}://{$host}";
    }

    private static function getProductWeight(string $productId): int
    {
        $weights = [
            'lot10' => 150,
            'lot25' => 350,
            'lot50-essence' => 700,
            'lot50-tresorerie' => 700,
            'pack-182-arsenal-aventurier' => 300,
            'pack-182-butins-ingenieries' => 300,
            'pack-182-routes-services' => 300,
            'triptyque-aleatoire' => 200,
        ];

        return $weights[$productId] ?? 100;
    }

    private static function getShippingCategory(string $productId): string
    {
        if (str_starts_with($productId, 'lot')) {
            return 'coins';
        } elseif (str_starts_with($productId, 'pack-182')) {
            return 'cards';
        } elseif (str_starts_with($productId, 'triptyque')) {
            return 'triptychs';
        }
        return 'standard';
    }

    private static function getCustomFields(array $product): array
    {
        $fields = [];

        // Multiplicateurs pour les pièces
        if (!empty($product['multipliers'])) {
            $fields[] = [
                'name' => 'Multiplicateur',
                'options' => implode('|', $product['multipliers']),
                'required' => true,
                'type' => 'dropdown'
            ];
        }

        // Choix de langue pour les cartes
        if (!empty($product['languages'])) {
            $fields[] = [
                'name' => 'Langue',
                'options' => implode('|', $product['languages']),
                'required' => true,
                'type' => 'dropdown'
            ];
        }

        return $fields;
    }

    /**
     * Méthodes utilitaires statiques
     */
    public static function isProduction(): bool
    {
        return ($_ENV['APP_ENV'] ?? 'development') === 'production';
    }

    public static function isDevelopment(): bool
    {
        return !self::isProduction();
    }

    public static function getApiKey(): string
    {
        return $_ENV['SNIPCART_API_KEY'] ?? 'pk_test_your_key_here';
    }

    public static function getSecretKey(): string
    {
        return $_ENV['SNIPCART_SECRET_API_KEY'] ?? 'sk_test_your_secret_key_here';
    }
}

// Export de la configuration pour utilisation dans d'autres scripts
if (defined('GEEKNDRAGON_CONFIG_EXPORT')) {
    return SnipcartConfig::getConfig();
}
?>