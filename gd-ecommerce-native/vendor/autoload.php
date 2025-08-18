<?php
/**
 * Autoloader simple pour contourner l'absence d'OpenSSL
 * En production, utiliser Composer avec OpenSSL activé
 */

// PSR-4 autoloader pour le namespace GeeknDragon
spl_autoload_register(function ($class) {
    $prefix = 'GeeknDragon\\';
    $baseDir = __DIR__ . '/../src/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Mock classes pour Stripe et Guzzle (versions simplifiées pour tests)
if (!class_exists('Stripe\Stripe')) {
    class_alias('GeeknDragon\Mocks\StripeStub', 'Stripe\Stripe');
    class_alias('GeeknDragon\Mocks\PaymentIntentStub', 'Stripe\PaymentIntent');
    class_alias('GeeknDragon\Mocks\PaymentMethodStub', 'Stripe\PaymentMethod');
}

if (!class_exists('GuzzleHttp\Client')) {
    class_alias('GeeknDragon\Mocks\GuzzleClientStub', 'GuzzleHttp\Client');
}