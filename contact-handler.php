<?php

session_start();

require_once __DIR__ . '/recaptcha.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.php');
    exit;
}

$errors = [];

$nom = trim($_POST['Nom'] ?? '');
$email = trim($_POST['Email'] ?? '');
$telephone = trim($_POST['Téléphone'] ?? '');
$message = trim($_POST['Message'] ?? '');
$csrf = $_POST['csrf_token'] ?? '';

if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf)) {
    $errors[] = 'Token CSRF invalide.';
}

if ($nom === '') {
    $errors[] = 'Le nom est requis.';
}
if (
    $email === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    preg_match("/[\r\n]/", $email)
) {
    $errors[] = "L'adresse e-mail est invalide.";
}
if ($message === '') {
    $errors[] = 'Le message est requis.';
}

$recaptchaSecret   = getenv('RECAPTCHA_SECRET_KEY');
$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
if ($recaptchaSecret) {
    if ($recaptchaResponse === '') {
        $errors[] = 'Veuillez vérifier le reCAPTCHA.';
    } else {
        $captchaResult = verifyRecaptcha($recaptchaSecret, $recaptchaResponse);
        if (empty($captchaResult['success'])) {
            $errors[] = $captchaResult['error'] ?? 'La vérification reCAPTCHA a échoué.';
        }
    }
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
    header('Location: contact.php');
    exit;
}

$to = 'contact@geekndragon.com';
$subject = 'Nouveau message depuis le formulaire de contact';
$body = "Nom: $nom\nEmail: $email\nTéléphone: $telephone\nMessage:\n$message";
$headers = "From: no-reply@geekndragon.com\r\n" .
           "Reply-To: $email\r\n" .
           'X-Mailer: PHP/' . phpversion();

if (!mail($to, $subject, $body, $headers)) {
    error_log('Mail Error: failed to send', 3, __DIR__ . '/error_log');
    $_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message."];
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
