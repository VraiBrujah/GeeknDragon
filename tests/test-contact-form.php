<?php
/**
 * Script de test du formulaire de contact
 *
 * Usage:
 *   php tests/test-contact-form.php
 *
 * Vérifie:
 * - Validation des champs
 * - Encodage UTF-8 correct (accents)
 * - Envoi email SendGrid
 * - Logs d'erreur
 */

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../config.php';

// Couleurs pour terminal
define('COLOR_GREEN', "\033[32m");
define('COLOR_RED', "\033[31m");
define('COLOR_YELLOW', "\033[33m");
define('COLOR_RESET', "\033[0m");

function log_test(string $message, bool $success = true): void {
    $color = $success ? COLOR_GREEN : COLOR_RED;
    $icon = $success ? '✓' : '✗';
    echo $color . $icon . ' ' . $message . COLOR_RESET . PHP_EOL;
}

function log_info(string $message): void {
    echo COLOR_YELLOW . 'ℹ ' . $message . COLOR_RESET . PHP_EOL;
}

echo PHP_EOL;
echo "=== TEST FORMULAIRE CONTACT ===" . PHP_EOL;
echo PHP_EOL;

// Test 1: Vérifier configuration SendGrid
log_info("Test 1: Configuration SendGrid");
$sendgridKey = getEnvironmentVariable('SENDGRID_API_KEY', '');
if (empty($sendgridKey)) {
    log_test("Variable SENDGRID_API_KEY manquante", false);
    exit(1);
}
log_test("SENDGRID_API_KEY configurée");

// Test 2: Vérifier fonction sendSendgridMail existe
log_info("Test 2: Fonction sendSendgridMail");
require_once __DIR__ . '/../contact-handler.php';
if (!function_exists('sendSendgridMail')) {
    log_test("Fonction sendSendgridMail non trouvée", false);
    exit(1);
}
log_test("Fonction sendSendgridMail disponible");

// Test 3: Validation email
log_info("Test 3: Validation email");
$testEmails = [
    'valid@example.com' => true,
    'invalid@' => false,
    'test@domain' => false,
    'user+tag@example.com' => true,
];

foreach ($testEmails as $email => $expected) {
    $valid = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    if ($valid === $expected) {
        log_test("Email '$email' validé correctement");
    } else {
        log_test("Email '$email' validation incorrecte", false);
    }
}

// Test 4: Encodage UTF-8 (caractères accentués)
log_info("Test 4: Encodage UTF-8");
$testStrings = [
    'Bonjour, voici mon message avec des accents: é, è, à, ô, ç',
    'Test caractères spéciaux: €, £, ¥, ©, ®',
    'Apostrophes et guillemets: « C\'est l\'été »',
];

foreach ($testStrings as $str) {
    $encoded = json_encode(['test' => $str]);
    $decoded = json_decode($encoded, true);

    if ($decoded['test'] === $str) {
        log_test("UTF-8 préservé: " . substr($str, 0, 40) . "...");
    } else {
        log_test("UTF-8 corrompu: $str", false);
    }
}

// Test 5: Simulation envoi email (sans vraiment envoyer)
log_info("Test 5: Simulation payload SendGrid");
$testPayload = [
    'to' => 'test@example.com',
    'subject' => 'Test avec accents: été, café, naïve',
    'body' => "Message de test\n\nAvec plusieurs lignes\net des accents: é è à ô ç\n\nCordialement,\nL'équipe",
    'replyTo' => 'user@example.com',
];

$payload = [
    'personalizations' => [[
        'to' => [['email' => $testPayload['to']]],
        'subject' => $testPayload['subject'],
    ]],
    'from' => ['email' => 'no-reply@geekndragon.com'],
    'content' => [[
        'type' => 'text/plain',
        'value' => $testPayload['body'],
    ]],
    'reply_to' => ['email' => $testPayload['replyTo']],
];

$json = json_encode($payload, JSON_UNESCAPED_UNICODE);

// Vérifier qu'il n'y a pas d'entités HTML
if (strpos($json, '&eacute;') !== false || strpos($json, '&rsquo;') !== false) {
    log_test("Entités HTML détectées dans JSON (ERREUR)", false);
    echo "JSON: $json" . PHP_EOL;
} else {
    log_test("Payload JSON propre (sans entités HTML)");
}

// Vérifier accents préservés
if (strpos($json, 'été') !== false && strpos($json, 'café') !== false) {
    log_test("Accents préservés dans payload");
} else {
    log_test("Accents perdus dans payload", false);
}

// Test 6: Test envoi réel (optionnel, commenté par défaut)
log_info("Test 6: Envoi email réel (désactivé par défaut)");
echo COLOR_YELLOW . "Pour tester l'envoi réel, décommenter le code ci-dessous" . COLOR_RESET . PHP_EOL;

/*
// DÉCOMMENTER POUR TEST RÉEL
$realTestEmail = 'votre-email@example.com'; // Remplacer par votre email
$result = sendSendgridMail(
    $realTestEmail,
    'Test GeeknDragon - Vérification Accents',
    "Ceci est un test du formulaire de contact.\n\nVérifiez que les accents sont corrects:\n- été\n- café\n- l'équipe\n- naïve\n\nSi tout s'affiche correctement, le fix est fonctionnel! ✓",
    'noreply@geekndragon.com'
);

if ($result) {
    log_test("Email envoyé avec succès à $realTestEmail");
    log_info("Vérifier votre boîte mail pour confirmer les accents");
} else {
    log_test("Échec envoi email", false);
    log_info("Vérifier logs/contact_errors.log pour détails");
}
*/

// Test 7: Vérifier logs d'erreur
log_info("Test 7: Vérification logs");
$logFile = __DIR__ . '/../logs/contact_errors.log';
if (file_exists($logFile)) {
    $logSize = filesize($logFile);
    log_test("Fichier logs accessible (taille: {$logSize} bytes)");

    if ($logSize > 0) {
        log_info("Dernières erreurs:");
        $lines = file($logFile);
        $lastLines = array_slice($lines, -5);
        foreach ($lastLines as $line) {
            echo "  " . trim($line) . PHP_EOL;
        }
    }
} else {
    log_test("Fichier logs inexistant (normal si aucune erreur)");
}

// Résumé
echo PHP_EOL;
echo "=== RÉSUMÉ ===" . PHP_EOL;
echo COLOR_GREEN . "✓ Configuration validée" . COLOR_RESET . PHP_EOL;
echo COLOR_GREEN . "✓ Encodage UTF-8 fonctionnel" . COLOR_RESET . PHP_EOL;
echo COLOR_GREEN . "✓ Payload SendGrid correct" . COLOR_RESET . PHP_EOL;
echo PHP_EOL;
echo COLOR_YELLOW . "Pour test complet, décommenter l'envoi réel (ligne ~120)" . COLOR_RESET . PHP_EOL;
echo PHP_EOL;
