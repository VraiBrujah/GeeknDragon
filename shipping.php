<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/src/Snipcart/SnipcartValidator.php';

// Pour du debug léger (à retirer en prod)
ini_set('display_errors', '0');

// Valide la requête entrante via la signature ou le token Snipcart
SnipcartValidator::validateIncoming();

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
