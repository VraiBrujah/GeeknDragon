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
 * Envoie un e-mail via l'API Snipcart.
 */
function sendSnipcartMail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
	// Récupère la clé secrète depuis l'environnement avec un fallback
	$secret = getenv('SNIPCART_SECRET_API_KEY');
	if (!$secret) {
	  // Fallback en dur identique à snipcart-init.php pour les envs sans variable
	  $secret = 'S_MDdhYmU2NWMtYmI5ZC00NmI0LWJjZGUtZDdkYTZjYTRmZTMxNjM4ODkxMjUzODg0NDc4ODU4';
	}

    $from   = getenv('SMTP_USERNAME') ?: 'contact@geekndragon.com';
    if (!$secret) {
        return false;
    }

    $payload = [
        'to'       => $to,
        'from'     => $from,
        'subject'  => $subject,
        'textBody' => $body,
    ];
    if ($replyTo) {
        $payload['replyTo'] = $replyTo;
    }

    $ch = curl_init('https://app.snipcart.com/api/email');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_USERPWD        => $secret . ':',
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode($payload),
    ]);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $status >= 200 && $status < 300;
}


$to = 'contact@geekndragon.com';
$subject = 'Nouveau message depuis le formulaire de contact';
$body = "Nom: $nom\nEmail: $email\nTéléphone: $telephone\nMessage:\n$message";

if (!sendSnipcartMail($to, $subject, $body, $email)) {
    error_log('Mail Error: failed to send via Snipcart', 3, __DIR__ . '/error_log');
    $_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message."];
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
