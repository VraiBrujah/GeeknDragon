<?php
/**
 * Script de test pour valider les clés API Snipcart
 * Mode production - affiche des erreurs claires si les clés ne fonctionnent pas
 */

require_once __DIR__ . '/bootstrap.php';

// Headers pour une réponse JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Charger la configuration
    $config = require __DIR__ . '/config.php';
    
    // Vérifier que les clés existent
    if (empty($config['snipcart_api_key'])) {
        throw new RuntimeException('Clé API Snipcart publique manquante');
    }
    
    if (empty($config['snipcart_secret_api_key'])) {
        throw new RuntimeException('Clé API Snipcart secrète manquante');
    }
    
    // Test basique avec l'API Snipcart
    $apiKey = $config['snipcart_secret_api_key'];
    
    // URL de test Snipcart (endpoint simple)
    $testUrl = 'https://app.snipcart.com/api/products';
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $testUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Authorization: Basic ' . base64_encode($apiKey . ':')
        ],
        CURLOPT_USERAGENT => 'GeeknDragon/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new RuntimeException("Erreur de connexion: $error");
    }
    
    if ($httpCode === 401) {
        throw new RuntimeException('Clés API Snipcart invalides (authentification échouée)');
    }
    
    if ($httpCode >= 400) {
        throw new RuntimeException("Erreur API Snipcart: HTTP $httpCode");
    }
    
    // Test réussi
    echo json_encode([
        'success' => true,
        'message' => 'Configuration Snipcart validée avec succès',
        'api_status' => 'OK',
        'http_code' => $httpCode,
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
    
} catch (RuntimeException $e) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'solution' => 'Vérifiez vos clés API Snipcart dans les variables d\'environnement',
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur système: ' . $e->getMessage(),
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
}
?>