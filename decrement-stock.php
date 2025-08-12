<?php
require __DIR__.'/bootstrap.php';

/**
 * decrement-stock.php  –  Geek & Dragon
 * -------------------------------------------------------------
 * Webhook Snipcart « Order completed »
 * Décrémente automatiquement le stock via l'API Snipcart à chaque vente.
 *
 * - Valide le token Snipcart (header X-Snipcart-RequestToken)
 * - Vérifie le stock disponible via l'API Snipcart
 * - Soustrait la quantité vendue en envoyant une requête PATCH
 * -------------------------------------------------------------
 * Stock JSON exemple :
 * {
 *   "coin-single":  200,
 *   "coffre-noble": 12,
 *   "coffre-mage" : 4
 * }
 */

// Récupère les clés depuis l'environnement
$apiKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY']
    ?? getenv('SNIPCART_API_KEY');
$secret = $_ENV['SNIPCART_SECRET_API_KEY']
    ?? $_SERVER['SNIPCART_SECRET_API_KEY']
    ?? getenv('SNIPCART_SECRET_API_KEY');

header('Content-Type: application/json');

// ────────────────────────────
function respond($code, $msg = [])
{
    http_response_code($code);
    echo json_encode($msg);
    exit;
}

if (!$apiKey || !$secret) {
    error_log('Snipcart API keys not configured');
    respond(500, ['error' => 'config']);
}

define('SNIPCART_SECRET', $secret);

function validateToken(string $token): bool
{
    if (!$token) return false;
    $ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . urlencode($token));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => SNIPCART_SECRET . ':',
    ]);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status === 200;
}

function snipcartRequest(string $method, string $endpoint, ?array $payload = null): array
{
    $ch = curl_init('https://app.snipcart.com/api' . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_USERPWD => SNIPCART_SECRET . ':',
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ]);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($res === false || $status >= 400) {
        error_log('Snipcart API error: ' . ($res === false ? curl_error($ch) : $res));
        curl_close($ch);
        respond(502, ['error' => 'Snipcart API error']);
    }
    curl_close($ch);
    $data = json_decode($res, true);
    return is_array($data) ? $data : [];
}

// 1. Valide le token Snipcart
$raw   = file_get_contents('php://input');
$token = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';
if (!validateToken($token)) {
    respond(401, ['error' => 'Invalid token']);
}

// 2. Décode la commande
$order = json_decode($raw, true);
if (!$order || !isset($order['items'])) {
    respond(400, ['error' => 'Bad payload']);
}

// 3. Vérifie et décrémente le stock via l'API Snipcart
foreach ($order['items'] as $item) {
    $id  = $item['uniqueId'];
    $qty = (int) $item['quantity'];

    $inv = snipcartRequest('GET', '/inventory/' . urlencode($id));
    $available = $inv['stock'] ?? $inv['available'] ?? 0;
    if ($qty > $available) {
        respond(409, ['error' => 'Stock insuffisant pour ' . $id]);
    }

    $newStock = max(0, $available - $qty);
    snipcartRequest('PATCH', '/inventory/' . urlencode($id), ['stock' => $newStock]);
}

// 4. Réponse OK
respond(200, ['status' => 'Stock updated']);
