<?php
/* Geek & Dragon – Calculateur d’expédition dynamique
   Place ce fichier dans /public_html/shipping.php
   N’oublie pas de cocher “POST” dans Snipcart.
*/

header('Content-Type: application/json');

// ⬇️ facultatif : vérifie la signature Snipcart
// Le secret est récupéré depuis la variable d'environnement SHIPPING_SECRET
$secret = getenv('SHIPPING_SECRET');
$signature = $_SERVER['HTTP_X_SNIPCART_SIGNATURE'] ?? '';
$raw = file_get_contents("php://input");
if (!hash_equals(hash_hmac('sha256', $raw, $secret), $signature)) {
  http_response_code(401); exit;
}

$data = json_decode($raw, true);
$weight = floatval($data['content']['totalWeight']) ?: 0; // en g
$country = $data['content']['shippingAddress']['country'] ?? 'CA';

$rates = [];

// Canada
if ($country === 'CA') {
  $base = 10; // base 0-250 g
  if ($weight > 250) { $base += ceil(($weight-250)/250)*2; } // +2 $ / 250 g
  $rates[] = [
    "id" => "standard_ca",
    "name" => "Standard (Poste Canada)",
    "description" => "Livraison 3-5 jours",
    "amount" => $base * 100,    // en cents
    "currency" => "CAD",
  ];
}
// USA
if ($country === 'US') {
  $amount = 15 + ($weight/500)*3;
  $rates[] = [
    "id" => "usps",
    "name" => "USPS Tracked",
    "description" => "6-9 jours",
    "amount" => intval($amount*100),
    "currency" => "USD",
  ];
}
// Europe : tarif unique
if (in_array($country, ["FR","BE","DE","GB","ES"])) {
  $rates[] = [
    "id" => "intl",
    "name" => "International suivi",
    "description" => "7-15 jours",
    "amount" => 3500, // 35 € flat
    "currency" => "EUR",
  ];
}

echo json_encode($rates);
