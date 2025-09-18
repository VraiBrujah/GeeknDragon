<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;
use GeeknDragon\Service\SmtpMailer;

SessionHelper::ensureSession();
$config = require __DIR__ . '/config.php';
$translator = require __DIR__ . '/i18n.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Location: ' . langUrl('/devis'));
    exit;
}

$errors = [];
$old = [];

if (!CsrfProtection::validateRequest()) {
    $errors[] = __('quote.errors.csrf', 'Token CSRF invalide.');
}

$honeypot = trim($_POST['company'] ?? '');
if ($honeypot !== '') {
    $errors[] = __('quote.errors.honeypot', 'Spam détecté.');
}

$rateWindow = (int) ($config['rate_limit_window'] ?? getSecureEnvVar('RATE_LIMIT_WINDOW', 120));
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir = ($config['storage_path'] ?? (__DIR__ . '/storage')) . '/ratelimit';
if (!is_dir($rateDir)) {
    mkdir($rateDir, 0777, true);
}
$rateFile = $rateDir . '/' . sha1($ip);
if ($rateWindow > 0 && file_exists($rateFile)) {
    $lastAttempt = (int) file_get_contents($rateFile);
    if (time() - $lastAttempt < $rateWindow) {
        $errors[] = __('quote.errors.rate', 'Trop de tentatives. Veuillez patienter.');
    }
}
file_put_contents($rateFile, (string) time());

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

$old = compact('name', 'email', 'phone', 'service', 'message');

$maxChars = (int) ($config['max_message_chars'] ?? getSecureEnvVar('MAX_MESSAGE_CHARS', 3000));
if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = __('quote.errors.name', 'Le nom est requis.');
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = __('quote.errors.email', "L'adresse e-mail est invalide.");
}
if ($phone !== '' && !preg_match('/^[0-9+()\\s-]{0,40}$/', $phone)) {
    $errors[] = __('quote.errors.phone', 'Le numéro de téléphone est invalide.');
}
if ($message === '') {
    $errors[] = __('quote.errors.message', 'Le message est requis.');
}
if (mb_strlen($message) > $maxChars) {
    $errors[] = __('quote.errors.too_long', 'Message trop long.');
}

if ($errors !== []) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: ' . langUrl('/devis'));
    exit;
}

$recipient = $config['quote_email'] ?? getSecureEnvVar('QUOTE_EMAIL', 'commande@geekndragon.com');
$subject = 'Demande de devis';
$textBody = "Nom: {$name}\nEmail: {$email}\nTéléphone: {$phone}\nService: {$service}\nMessage:\n{$message}";
$htmlBody = nl2br(htmlspecialchars($textBody, ENT_QUOTES, 'UTF-8'));

$mailer = new SmtpMailer();
$sent = $mailer->send($recipient, $subject, $htmlBody, $textBody, $email);

if ($sent) {
    $logDir = $config['storage_path'] ?? (__DIR__ . '/storage');
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $logEntry = sprintf("%s\t%s\t%s\t%s\n", date('c'), $ip, $email, $service);
    file_put_contents($logDir . '/form.log', $logEntry, FILE_APPEND);
    CsrfProtection::regenerateToken();
    header('Location: ' . langUrl('/merci?s=ok'));
    exit;
}

$_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message. Veuillez réessayer ultérieurement."];
$_SESSION['old'] = $old;
header('Location: ' . langUrl('/devis'));
exit;
