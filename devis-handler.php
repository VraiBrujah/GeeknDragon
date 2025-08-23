<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;
use GeeknDragon\Service\SmtpMailer;

SessionHelper::ensureSession();
require __DIR__ . '/i18n.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . langUrl('/devis'));
    exit;
}

$errors = [];
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$company = trim($_POST['company'] ?? '');
$maxChars = (int) getSecureEnvVar('MAX_MESSAGE_CHARS', 3000);
$rateWindow = (int) getSecureEnvVar('RATE_LIMIT_WINDOW', 120);

if ($company !== '') {
    $errors[] = $translations['quote']['errors']['honeypot'] ?? 'Spam détecté.';
}
if (!CsrfProtection::validateRequest()) {
    $errors[] = $translations['quote']['errors']['csrf'] ?? 'Token CSRF invalide.';
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir = __DIR__ . '/storage/ratelimit';
if (!is_dir($rateDir)) {
    mkdir($rateDir, 0777, true);
}
$rateFile = $rateDir . '/' . sha1($ip);
if (file_exists($rateFile) && time() - (int)file_get_contents($rateFile) < $rateWindow) {
    $errors[] = $translations['quote']['errors']['rate'] ?? 'Trop de tentatives. Veuillez patienter.';
} else {
    file_put_contents($rateFile, (string)time());
}

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = $translations['quote']['errors']['name'] ?? 'Le nom est requis.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = $translations['quote']['errors']['email'] ?? "L'adresse e-mail est invalide.";
}
if ($phone !== '' && !preg_match('/^[0-9+()\s-]{0,40}$/', $phone)) {
    $errors[] = $translations['quote']['errors']['phone'] ?? 'Le numéro de téléphone est invalide.';
}
if ($message === '') {
    $errors[] = $translations['quote']['errors']['message'] ?? 'Le message est requis.';
}
if (mb_strlen($message) > $maxChars) {
    $errors[] = $translations['quote']['errors']['too_long'] ?? 'Message trop long.';
}

$old = compact('name','email','phone','service','message');

if ($errors) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: ' . langUrl('/devis'));
    exit;
}

$to = getSecureEnvVar('QUOTE_EMAIL', 'commande@geekndragon.com');
$subject = 'Demande de devis';
$textBody = "Nom: $name\nEmail: $email\nTéléphone: $phone\nService: $service\nMessage:\n$message";
$htmlBody = nl2br(htmlspecialchars($textBody, ENT_QUOTES, 'UTF-8'));
$mailer = new SmtpMailer();
$success = $mailer->send($to, $subject, $htmlBody, $textBody, $email);

if ($success) {
    $logDir = __DIR__ . '/storage';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $log = sprintf("%s\t%s\t%s\t%s\n", date('c'), $ip, $email, $service);
    file_put_contents($logDir . '/form.log', $log, FILE_APPEND);
    CsrfProtection::regenerateToken();
    header('Location: ' . langUrl('/merci.php?s=ok'));
    exit;
}

header('Location: ' . langUrl('/merci.php?s=err'));
exit;
