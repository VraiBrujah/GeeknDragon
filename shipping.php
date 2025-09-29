<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';

// Pour du debug léger (à retirer en prod)
ini_set('display_errors', '0');

// Récup headers de façon robuste
function header_value(string $name): ?string {
  $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
  $value = $_SERVER[$key] ?? null;
  if ($value === null) {
    error_log(sprintf('[shipping] Header "%s" absent de la requête Snipcart', $name));
  }
  return $value;
}

function respond_with_fallback(string $reason, array $context = []): void {
  $logContext = $context ? json_encode($context, JSON_UNESCAPED_UNICODE) : '';
  error_log(sprintf('[shipping] Activation du mode dégradé : %s %s', $reason, $logContext));

  $fallbackRate = [
    'cost' => 19.99,
    'description' => 'Livraison standard (mode dégradé : validation indisponible)',
    'userDefinedId' => 'fallback-mode',
  ];

  http_response_code(200);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'rates' => [$fallbackRate],
  ], JSON_UNESCAPED_UNICODE);
  exit;
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
  error_log('[shipping] Jeton Snipcart manquant : impossible de valider la requête');
  respond_with_fallback('Jeton Snipcart manquant', ['tokenPresent' => false]);
}

$secretLooksTest = stripos($secret, 'test') !== false;
$tokenLooksTest = strpos($token, 'test_') === 0;
if ($secretLooksTest && !$tokenLooksTest) {
  error_log('[shipping] Incohérence potentielle : clé secrète de TEST utilisée avec un jeton Live');
}
if (!$secretLooksTest && $tokenLooksTest) {
  error_log('[shipping] Incohérence potentielle : clé secrète Live utilisée avec un jeton de TEST');
}

// Validation du jeton Snipcart (docs: requestvalidation/{token})
$ch = curl_init("https://app.snipcart.com/api/requestvalidation/" . urlencode($token));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Accept: application/json'],
  CURLOPT_USERPWD        => $secret . ':', // Basic Auth (mot de passe vide)
  CURLOPT_TIMEOUT        => 5,
]);
$response = curl_exec($ch);
if ($response === false) {
  error_log('[shipping] curl_exec a retourné false pendant la validation Snipcart');
}
$curlErrNo = curl_errno($ch);
$curlErr = curl_error($ch) ?: null;
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
error_log(sprintf('[shipping] Validation Snipcart : statut HTTP=%s errno=%s message="%s"',
  $code ?: '0',
  $curlErrNo ?: '0',
  $curlErr ?? 'aucune erreur curl'
));
curl_close($ch);

if ($code !== 200 && $code !== 204) {
  $context = [
    'status' => $code,
    'curlErrNo' => $curlErrNo,
    'curlError' => $curlErr,
  ];

  if (in_array($code, [400, 401, 403], true)) {
    error_log('[shipping] Jeton Snipcart rejeté : vérifier cohérence clé secrète (Test vs Live)');
    $context['suspectedReason'] = 'clé incohérente ou jeton invalide';
  } elseif ($code >= 500 || $code === 0) {
    error_log('[shipping] Service Snipcart indisponible pendant la validation du jeton');
    $context['suspectedReason'] = 'service indisponible';
  }

  respond_with_fallback('Validation Snipcart indisponible', $context);
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
