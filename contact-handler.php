<?php
require __DIR__ . '/bootstrap.php';

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

/**
 * Envoie un e-mail via l'API SendGrid.
 */
function sendSendgridMail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    $apiKey = getenv('SENDGRID_API_KEY');
    $from   = getenv('SMTP_USERNAME') ?: 'contact@geekndragon.com';
    if (!$apiKey) {
        return false;
    }

    $payload = [
        'personalizations' => [[
            'to'      => [['email' => $to]],
            'subject' => $subject,
        ]],
        'from'    => ['email' => $from],
        'content' => [[
            'type'  => 'text/plain',
            'value' => $body,
        ]],
    ];
    if ($replyTo) {
        $payload['reply_to'] = ['email' => $replyTo];
    }

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
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status >= 200 && $status < 300;
}
$to = getenv('QUOTE_EMAIL') ?: 'contact@geekndragon.com';
$subject = 'Nouveau message depuis le formulaire de contact';
$body = "Nom: $nom\nEmail: $email\nTéléphone: $telephone\nMessage:\n$message";

if (!sendSendgridMail($to, $subject, $body, $email)) {
    error_log('Mail Error: failed to send via SendGrid', 3, __DIR__ . '/error_log');
    $_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message."];
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
