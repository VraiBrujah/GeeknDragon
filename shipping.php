<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';

// Pour du debug léger (à retirer en prod)
ini_set('display_errors', '0');

// Récup headers de façon robuste
function header_value(string $name): ?string {
  $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
  return $_SERVER[$key] ?? null;
}

// Récupère les clés depuis l'environnement
$apiKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY'];
$secret = $_ENV['SNIPCART_SECRET_API_KEY']
    ?? $_SERVER['SNIPCART_SECRET_API_KEY'];
if (!$apiKey || !$secret) {
  error_log('Snipcart API keys not configured');
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['errors' => [['key' => 'config', 'message' => 'Snipcart API keys not configured']]]);
  exit;
}

$token  = header_value('X-Snipcart-RequestToken');

// DOIT être la clé SECRÈTE **Live** si le checkout est Live

if (!$token) {
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode(['errors' => [['key'=>'missing-token','message'=>'Jeton manquant']]]);
  exit;
}

// Validation du jeton Snipcart (docs: requestvalidation/{token})
$ch = curl_init("https://app.snipcart.com/api/requestvalidation/" . urlencode($token));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
  CURLOPT_USERPWD        => $secret . ':', // Basic Auth (mot de passe vide)
  CURLOPT_TIMEOUT        => 5,
]);
curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200 && $code !== 204) {
  // Jeton non valide pour cette clé (souvent Test vs Live)
  http_response_code(401);
  header('Content-Type: application/json');
  echo json_encode(['errors' => [['key'=>'invalid-token','message'=>'Échec de validation du jeton Snipcart']]]);
  exit;
}

// Lecture du panier (utile pour poids, province, etc.)
$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$province = $payload['content']['shippingAddress']['province'] ?? 'QC';

// TODO: remplace par ton calcul réel (poids, subtotal, province, etc.)
$rates = [
  ['cost' => 12.00, 'description' => 'Standard (3–7 j)', 'userDefinedId' => 'std'],
  ['cost' => 24.00, 'description' => 'Express (1–2 j)',  'userDefinedId' => 'xprs'],
];

// Réponse attendue par Snipcart
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['rates' => $rates], JSON_UNESCAPED_UNICODE);
exit;
