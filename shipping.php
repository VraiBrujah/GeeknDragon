<?php
header('Content-Type: application/json');

// -------- util --------
function header_ci($name) {
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
function fail($code, $msg) {
  http_response_code($code);
  echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
  // journaliser côté serveur pour debug (visible dans error_log)
  error_log("[shipping.php] $code $msg");
  exit;
}

// -------- 1) payload + mode --------
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?: [];
$mode = $payload['mode'] ?? ($payload['content']['mode'] ?? 'Live'); // "Live" ou "Test"

// -------- 2) token reçu ? --------
$token = header_ci('X-Snipcart-RequestToken'); // attention: parfois "Requesttoken"
if (!$token) fail(401, 'Missing X-Snipcart-RequestToken');  // header exigé par Snipcart

// -------- 3) choisir la bonne Secret API Key --------
$secret = null;
if (strcasecmp($mode, 'Live') === 0) {
  $secret = getenv('SNIPCART_SECRET_API_KEY_LIVE') ?: getenv('SNIPCART_SECRET_API_KEY');
} else {
  $secret = getenv('SNIPCART_SECRET_API_KEY_TEST') ?: getenv('SNIPCART_SECRET_API_KEY');
}
if (!$secret) fail(500, 'Server missing Snipcart secret key for mode ' . $mode);

// -------- 4) valider le token auprès de Snipcart --------
$ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . rawurlencode($token));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
  CURLOPT_USERPWD        => $secret . ':',   // Basic Auth: username = Secret API Key, password vide
  CURLOPT_TIMEOUT        => 10,
  // Pour debug réseau uniquement : décommente si problème de CA/SSL (à NE PAS laisser en prod)
  // CURLOPT_SSL_VERIFYPEER => false,
  // CURLOPT_SSL_VERIFYHOST => 0,
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
  fail(401, 'Invalid Snipcart token for mode ' . $mode);
}

// -------- 5) calcul des tarifs (exemple simple) --------
$country = $payload['content']['shippingAddress']['country'] ?? $payload['content']['shippingAddressCountry'] ?? 'CA';

$rates = [];
if ($country === 'CA') {
  $rates[] = ['cost' => 12.00, 'description' => 'Poste canadienne (5–7 j)', 'userDefinedId' => 'ca_std'];
  $rates[] = ['cost' => 22.00, 'description' => 'Express (2–3 j)',          'userDefinedId' => 'ca_xpr'];
} elseif (in_array($country, ['FR','BE','DE','GB','ES'], true)) {
  $rates[] = ['cost' => 35.00, 'description' => 'International suivi (7–15 j)', 'userDefinedId' => 'eu_intl'];
} else {
  $rates[] = ['cost' => 45.00, 'description' => 'International (8–20 j)', 'userDefinedId' => 'row_intl'];
}

http_response_code(200);
echo json_encode(['rates' => $rates], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
