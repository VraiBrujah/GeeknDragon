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

// Lecture du panier (adresse, poids, etc.)
$payload = json_decode(file_get_contents('php://input'), true) ?: [];

// Appel à l'API Snipcart pour obtenir les tarifs d'expédition
$ch = curl_init('https://app.snipcart.com/api/shippingrates');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => [
    'Accept: application/json',
    'Content-Type: application/json'
  ],
  CURLOPT_USERPWD        => $secret . ':', // Basic Auth (mot de passe vide)
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => json_encode($payload),
  CURLOPT_TIMEOUT        => 10,
]);
$response = curl_exec($ch);
$error    = curl_error($ch);
$code     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Validation de la réponse de l'API Snipcart
$json = json_decode($response, true);
if ($response === false || $code !== 200 || $json === null) {
  error_log('Snipcart shippingrates API error: ' . ($error ?: $response));
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'errors' => [[
      'key'     => 'shipping-api',
      'message' => 'Erreur lors de la récupération des tarifs de livraison'
    ]]
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Réponse attendue par Snipcart
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo $response;
exit;
