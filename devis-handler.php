<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;
use GeeknDragon\Mailer\SmtpMailer;

SessionHelper::ensureSession();

$formPage = $formPage ?? 'devis.php';
$subject = $subject ?? 'Demande de devis';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $formPage);
    exit;
}

require __DIR__ . '/i18n.php';

$errors = [];
$maxChars = (int) (getSecureEnvVar('MAX_MESSAGE_CHARS', 3000));

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$honeypot = trim($_POST['company'] ?? '');

if (!CsrfProtection::validateRequest()) {
    $errors[] = $translations['quote']['errors']['csrf'] ?? 'Token CSRF invalide.';
}
if ($honeypot !== '') {
    $errors[] = $translations['quote']['errors']['honeypot'] ?? 'Spam détecté.';
}
if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = $translations['quote']['errors']['name'] ?? 'Le nom est requis.';
}
if (
    $email === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    preg_match("/[\r\n]/", $email)
) {
    $errors[] = $translations['quote']['errors']['email'] ?? "L'adresse e-mail est invalide.";
}
if ($phone !== '' && !preg_match('/^[0-9+()\s-]{0,40}$/', $phone)) {
    $errors[] = $translations['quote']['errors']['phone'] ?? 'Le numéro de téléphone est invalide.';
}
if ($message === '' || mb_strlen($message) > $maxChars) {
    $errors[] = $translations['quote']['errors']['message'] ?? 'Le message est requis.';
}

$old = [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'service' => $service,
    'message' => $message,
];

if ($errors) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: ' . $formPage);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'cli';
$window = (int) (getSecureEnvVar('RATE_LIMIT_WINDOW', 120));
$rateDir = __DIR__ . '/storage';
if (!is_dir($rateDir)) {
    mkdir($rateDir, 0755, true);
}
$rateFile = $rateDir . '/rl_' . md5($ip);
$now = time();
$last = (int) @file_get_contents($rateFile);
if ($last && $now - $last < $window) {
    $_SESSION['errors'] = [$translations['quote']['errors']['ratelimit'] ?? 'Veuillez patienter avant de soumettre à nouveau.'];
    $_SESSION['old'] = $old;
    header('Location: ' . $formPage);
    exit;
}
file_put_contents($rateFile, (string) $now);

$to = getSecureEnvVar('QUOTE_EMAIL', 'commande@geekndragon.com');
$textBody = "Nom: $name\nEmail: $email\nTéléphone: $phone\nService: $service\nMessage:\n$message";
$htmlBody = '<p><strong>Nom:</strong> ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</p>' .
            '<p><strong>Email:</strong> ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</p>' .
            '<p><strong>Téléphone:</strong> ' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '</p>' .
            '<p><strong>Service:</strong> ' . htmlspecialchars($service, ENT_QUOTES, 'UTF-8') . '</p>' .
            '<p><strong>Message:</strong><br>' . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . '</p>';

$mailer = new SmtpMailer();
$sent = $mailer->send($to, $subject, $htmlBody, $textBody, $email);

$logFile = $rateDir . '/form.log';
$logEntry = sprintf("%s\t%s\t%s\n", date('c'), $sent ? 'OK' : 'ERR', $ip);
file_put_contents($logFile, $logEntry, FILE_APPEND);

CsrfProtection::regenerateToken();
header('Location: merci.php?s=' . ($sent ? 'ok' : 'err'));
exit;
