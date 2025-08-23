<?php
require __DIR__ . '/vendor/autoload.php';
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$apiKey = $_ENV['SENDGRID_API_KEY'] ?? '';
$from   = $_ENV['FROM_EMAIL'] ?? 'contact@geekndragon.com';
$to     = $_ENV['QUOTE_EMAIL'] ?? 'contact@geekndragon.com';

if (!$apiKey) {
    die("ERREUR : SENDGRID_API_KEY manquant.\n");
}

$subject = "[TEST] Envoi direct via SendGrid";
$body    = "Test d'envoi envoyé à : " . date('Y-m-d H:i:s');

$payload = [
    'personalizations' => [[
        'to'      => [['email' => $to]],
        'subject' => $subject,
    ]],
    'from'    => ['email' => $from],
    'content' => [[ 'type' => 'text/plain', 'value' => $body ]],
];

$ch = curl_init('https://api.sendgrid.com/v3/mail/send');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode($payload),
]);

// 1) Forcer l'utilisation du fichier cacert.pem si cURL ne le trouve pas via php.ini
curl_setopt($ch, CURLOPT_CAINFO, 'C:/certs/cacert.pem');

// 2) Option 'native CA store' pour Windows (si cURL >= 7.71 et PHP >= 8.2)
if (defined('CURLSSLOPT_NATIVE_CA') && version_compare(curl_version()['version'], '7.71', '>=')) {
    curl_setopt($ch, CURLOPT_SSL_OPTIONS, CURLSSLOPT_NATIVE_CA);
}

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$error    = curl_error($ch);

echo "Statut HTTP : $status\n";
if ($error) {
    echo "Erreur cURL : $error\n";
}
echo "Réponse brute : $response\n";
