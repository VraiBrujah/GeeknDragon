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
    header('Location: ' . langUrl('/contact'));
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

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');
$service = trim($_POST['service'] ?? '');

$old = [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'service' => $service,
    'message' => $message,
];

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = __('quote.errors.name', 'Le nom est requis.');
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match("/[\r\n]/", $email)) {
    $errors[] = __('quote.errors.email', "L'adresse e-mail est invalide.");
}

if ($phone !== '' && !preg_match('/^[0-9+()\\s-]{0,40}$/', $phone)) {
    $errors[] = __('quote.errors.phone', 'Le numéro de téléphone est invalide.');
}

$maxChars = (int) ($config['max_message_chars'] ?? getSecureEnvVar('MAX_MESSAGE_CHARS', 3000));
if ($message === '') {
    $errors[] = __('quote.errors.message', 'Le message est requis.');
} elseif (mb_strlen($message) > $maxChars) {
    $errors[] = __('quote.errors.too_long', 'Message trop long.');
}

if ($errors !== []) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: ' . langUrl('/contact'));
    exit;
}

$recipient = $config['quote_email'] ?? getSecureEnvVar('QUOTE_EMAIL', 'commande@geekndragon.com');
$subject = 'Nouveau message depuis le formulaire de contact';
$textBody = "Nom: {$name}\nEmail: {$email}\nTéléphone: {$phone}\nService: {$service}\nMessage:\n{$message}";
$htmlBody = nl2br(htmlspecialchars($textBody, ENT_QUOTES, 'UTF-8'));

$mailer = new SmtpMailer();
$sent = $mailer->send($recipient, $subject, $htmlBody, $textBody, $email);

if (!$sent) {
    $_SESSION['errors'] = [
        "Une erreur est survenue lors de l'envoi du message. Vous pouvez nous contacter directement à {$recipient}."
    ];
    $_SESSION['old'] = $old;
    header('Location: ' . langUrl('/contact'));
    exit;
}

CsrfProtection::regenerateToken();
header('Location: ' . langUrl('/merci?s=ok'));
exit;
