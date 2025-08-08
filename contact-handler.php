<?php
session_start();

require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

$recaptchaSecret = getenv('RECAPTCHA_SECRET_KEY');
$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
if ($recaptchaSecret) {
    if ($recaptchaResponse === '') {
        $errors[] = 'Veuillez vérifier le reCAPTCHA.';
    } else {
        $verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($recaptchaSecret) . '&response=' . urlencode($recaptchaResponse));
        $captchaResult = json_decode($verifyResponse, true);
        if (empty($captchaResult['success'])) {
            $errors[] = 'La vérification reCAPTCHA a échoué.';
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

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = getenv('SMTP_HOST');
    $mail->SMTPAuth = true;
    $mail->Username = getenv('SMTP_USERNAME');
    $mail->Password = getenv('SMTP_PASSWORD');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = getenv('SMTP_PORT') ?: 587;

    $mail->setFrom($email);
    $mail->addAddress($to);
    $mail->addReplyTo($email);
    $mail->Subject = $subject;
    $mail->Body = $body;

    $mail->send();
} catch (Exception $e) {
    error_log('Mailer Error: ' . $e->getMessage(), 3, __DIR__ . '/error_log');
    $_SESSION['errors'] = ["Une erreur est survenue lors de l'envoi du message."];
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
?>
