<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;
use GeeknDragon\Security\CsrfProtection;
use GeeknDragon\Service\SmtpMailer;

SessionHelper::ensureSession();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php#contact');
    exit;
}

$errors = [];

$nom = trim($_POST['Nom'] ?? '');
$email = trim($_POST['Email'] ?? '');
$telephone = trim($_POST['Téléphone'] ?? '');
if ($telephone !== '') {
    $telephone = preg_replace('/\s+/', ' ', $telephone);
}
$message = trim($_POST['Message'] ?? '');

if (!CsrfProtection::validateRequest()) {
    $errors[] = 'Token CSRF invalide.';
}
if ($nom === '') {
    $errors[] = 'Le nom est requis.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match("/[\r\n]/", $email)) {
    $errors[] = "L'adresse e-mail est invalide.";
}
if ($telephone !== '' && !preg_match('/^[0-9+()\\s-]{0,20}$/', $telephone)) {
    $errors[] = 'Le numéro de téléphone est invalide.';
}
if ($message === '') {
    $errors[] = 'Le message est requis.';
}

$old = [
    'Nom' => $nom,
    'Email' => $email,
    'Téléphone' => $telephone,
    'Message' => $message,
];

if ($errors) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: index.php#contact');
    exit;
}

$to = getSecureEnvVar('QUOTE_EMAIL', 'commande@geekndragon.com');
$subject = 'Nouveau message depuis le formulaire de contact';
$body = "Nom: $nom\nEmail: $email\nTéléphone: $telephone\nMessage:\n$message";
$html = nl2br(htmlspecialchars($body, ENT_QUOTES, 'UTF-8'));
$mailer = new SmtpMailer();
if (!$mailer->send($to, $subject, $html, $body, $email)) {
    $_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message. Vous pouvez nous contacter directement à $to."];
    $_SESSION['old'] = $old;
    header('Location: index.php#contact');
    exit;
}

CsrfProtection::regenerateToken();
header('Location: merci.php?s=ok');
exit;
