<?php
header('Content-Type: application/json');

/**
 * shipping.php — Snipcart webhook handler for shipping rates
 * Authenticates via X-Snipcart-RequestToken + Secret API Key
 * Fallback to hardcoded secret if env not available (shared hosting)
 * No more SHIPPING_SECRET / ORDER_SECRET
 */

// Lit un header en insensible à la casse
function header_ci(string $name): ?string {
  $h = function_exists('getallheaders') ? getallheaders() : [];
  foreach ($h as $k => $v) if (strcasecmp($k, $name) === 0) return trim($v);
  foreach ($_SERVER as $k => $v) {
    if (stripos($k, 'HTTP_') === 0) {
      $canon = str_ireplace('_', '-', substr($k, 5));
      if (strcasecmp($canon, $name) === 0) return trim($v);
    }
  }
  return null;
}

// Envoi une réponse d'erreur JSON et logue
function fail(int $code, string $msg): void {
  http_response_code($code);
  echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  error_log("[shipping.php] $code $msg");
  exit;
}

// Lecture du payload JSON
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];
$mode = $payload['mode'] ?? ($payload['content']['mode'] ?? 'Live'); // pas utilisée ici, mais conservée pour logs

// Récupération du token envoyé par Snipcart
$token = header_ci('X-Snipcart-RequestToken');
if (!$token) fail(401, 'Missing X-Snipcart-RequestToken');

// Récupération de la clé secrète Snipcart
$secret = getenv('SNIPCART_SECRET_API_KEY');
if (!$secret) {
    // Fallback en dur
    $secret = 'S_MDdhYmU2NWMtYmI5ZC00NmI0LWJjZGUtZDdkYTZjYTRmZTMxNjM4ODkxMjUzODg0NDc4ODU4';
}
if (!$secret) fail(500, 'Server missing Snipcart secret API Key');

// Validation du token auprès de l’API Snipcart (auth Basic avec clé)
$ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . rawurlencode($token));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
  CURLOPT_USERPWD        => $secret . ':',
  CURLOPT_TIMEOUT        => 10,
]);
curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$cerr = curl_error($ch);
curl_close($ch);

if ($http === 0) {
  error_log("[shipping.php] cURL error while validating token: $cerr");
  fail(502, 'Cannot reach Snipcart for token validation');
}
if ($http !== 200) {
  fail(401, 'Invalid Snipcart token');
}

// Extraction du pays d’expédition
$content = $payload['content'] ?? [];
$addr = $content['shippingAddress'] ?? [];
$country = $addr['country'] ?? ($content['shippingAddressCountry'] ?? 'CA');

// Calcul des tarifs (exemple simple)
$rates = [];
if ($country === 'CA') {
  $rates[] = ['cost' => 12.00, 'description' => 'Poste canadienne (5–7 j)', 'userDefinedId' => 'ca_std'];
  $rates[] = ['cost' => 22.00, 'description' => 'Express (2–3 j)', 'userDefinedId' => 'ca_xpr'];
} elseif (in_array($country, ['FR','BE','DE','GB','ES'], true)) {
  $rates[] = ['cost' => 35.00, 'description' => 'International suivi (7–15 j)', 'userDefinedId' => 'eu_intl'];
} else {
  $rates[] = ['cost' => 45.00, 'description' => 'International (8–20 j)', 'userDefinedId' => 'row_intl'];
}

http_response_code(200);
echo json_encode(['rates' => $rates], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
