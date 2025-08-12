<?php
/**
 * Geek & Dragon – Calculateur d'expédition dynamique
 * Répond aux webhooks Snipcart shippingrates.fetch.
 * Charge les variables d'environnement via bootstrap et
 * propose des valeurs de secours pour éviter les erreurs 500
 * lorsque l'environnement n'est pas correctement chargé.
 */

require_once __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';

header('Content-Type: application/json');

$apiKey = $config['snipcart_secret_api_key'] ?? null;
$secret = $config['shipping_secret'] ?? '';
$raw = file_get_contents('php://input');

// Vérification optionnelle de la signature (si le secret est dispo)
if ($secret) {
  $signature = $_SERVER['HTTP_X_SNIPCART_SIGNATURE'] ?? '';
  if ($signature && !hash_equals(hash_hmac('sha256', $raw, $secret), $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid signature']);
    exit;
  }
}

// Validation optionnelle du token (si la clé API est dispo)
$token = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';
if ($apiKey && $token && !validateToken($token, $apiKey)) {
  http_response_code(401);
  echo json_encode(['error' => 'invalid token']);
  exit;
}

function validateToken($token, $apiKey) {
  if (!$token) return false;
  $ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . urlencode($token));
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD => $apiKey . ':',
  ]);
  curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  curl_close($ch);
  return $status === 200;
}

$data = json_decode($raw, true);
$weight = floatval($data['content']['totalWeight'] ?? 0); // en g
$country = $data['content']['shippingAddress']['country'] ?? 'CA';

$rates = [];

// Canada
if ($country === 'CA') {
  $base = 10; // base 0-250 g
  if ($weight > 250) {
    $base += ceil(($weight - 250) / 250) * 2; // +2 $ / 250 g
  }
  $rates[] = [
    'id' => 'standard_ca',
    'name' => 'Standard (Poste Canada)',
    'description' => 'Livraison 3-5 jours',
    'amount' => $base * 100, // en cents
    'currency' => 'CAD',
  ];
}

// USA
if ($country === 'US') {
  $amount = 15 + ($weight / 500) * 3;
  $rates[] = [
    'id' => 'usps',
    'name' => 'USPS Tracked',
    'description' => '6-9 jours',
    'amount' => intval($amount * 100),
    'currency' => 'USD',
  ];
}

// Europe : tarif unique
if (in_array($country, ['FR', 'BE', 'DE', 'GB', 'ES'])) {
  $rates[] = [
    'id' => 'intl',
    'name' => 'International suivi',
    'description' => '7-15 jours',
    'amount' => 3500, // 35 € flat
    'currency' => 'EUR',
  ];
}

echo json_encode($rates);
