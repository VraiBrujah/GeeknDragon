<?php
declare(strict_types=1);

// Pour du debug léger (à retirer en prod)
ini_set('display_errors', '0');

// Récup headers de façon robuste
function header_value(string $name): ?string {
  $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
  return $_SERVER[$key] ?? null;
}

$token  = header_value('X-Snipcart-RequestToken');

// Récupère la clé secrète depuis l'environnement avec un fallback
$secret = getenv('SNIPCART_SECRET_API_KEY');
if (!$secret) {
  // Fallback en dur identique à snipcart-init.php pour les envs sans variable
  $secret = 'S_MDdhYmU2NWMtYmI5ZC00NmI0LWJjZGUtZDdkYTZjYTRmZTMxNjM4ODkxMjUzODg0NDc4ODU4';
}

// DOIT être la clé SECRÈTE **Live** si le checkout est Live

if (!$token || !$secret) {
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode(['errors' => [['key'=>'missing-token','message'=>'Jeton ou configuration manquants']]]);
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
header('Content-Type: application/json');
echo json_encode($rates);
