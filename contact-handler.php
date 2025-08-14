<?php
require __DIR__ . '/bootstrap.php';

session_start();
$debug = filter_var($_ENV['APP_DEBUG'] ?? $_SERVER['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // header('Location: contact.php');
    header('Location: index.php#contact');
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

$old = [
    'Nom' => $nom,
    'Email' => $email,
    'Téléphone' => $telephone,
    'Message' => $message,
];

if ($errors) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    // header('Location: contact.php');
    header('Location: index.php#contact');
    exit;
}

/**
 * Envoie un e-mail via l'API SendGrid.
 */
$sendgridLogger = function (string $message) {
    error_log($message, 3, __DIR__ . '/error_log');
};

function sendSendgridMail(string $to, string $subject, string $body, string $replyTo = '', ?array &$details = null): bool
{
    global $debug, $sendgridLogger;
    $apiKey = $_ENV['SENDGRID_API_KEY'] ?? $_SERVER['SENDGRID_API_KEY'];
    $from   = $_ENV['SMTP_USERNAME'] ?? $_SERVER['SMTP_USERNAME'] ?? 'contact@geekndragon.com';
    if (!$apiKey) {
        $sendgridLogger('Missing environment variable: SENDGRID_API_KEY');
        return false;
    }
    if (!$from) {
        $sendgridLogger('Missing environment variable: SMTP_USERNAME');
        $from = 'contact@geekndragon.com';
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
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error    = curl_error($ch);
    $details = [
        'status'    => $status,
        'response'  => $response,
        'curl_error'=> $error,
    ];
    if ($debug || $status < 200 || $status >= 300 || $error) {
        $sendgridLogger("SendGrid response: status $status, response: $response, curl_error: $error");
    }
    curl_close($ch);
    return $status >= 200 && $status < 300 && !$error;
}
$to = $_ENV['QUOTE_EMAIL'] ?? $_SERVER['QUOTE_EMAIL'];
if (!$to) {
    error_log('Missing environment variable: QUOTE_EMAIL', 3, __DIR__ . '/error_log');
    $to = 'contact@geekndragon.com';
}
$subject = 'Nouveau message depuis le formulaire de contact';
$body = "Nom: $nom\nEmail: $email\nTéléphone: $telephone\nMessage:\n$message";

$details = [];
if (!sendSendgridMail($to, $subject, $body, $email, $details)) {
    $errorMessage = "Une erreur est survenue lors de l'envoi du message. Vous pouvez nous contacter directement à <a href=\"mailto:" . htmlspecialchars($to, ENT_QUOTES, 'UTF-8') . "\">" . htmlspecialchars($to, ENT_QUOTES, 'UTF-8') . "</a>.";
    if ($debug) {
        $errorMessage .= ' Détails: statut ' . htmlspecialchars((string)($details['status'] ?? ''), ENT_QUOTES, 'UTF-8') .
            ', réponse: ' . htmlspecialchars($details['response'] ?? '', ENT_QUOTES, 'UTF-8');
        if (!empty($details['curl_error'])) {
            $errorMessage .= ', erreur cURL: ' . htmlspecialchars($details['curl_error'], ENT_QUOTES, 'UTF-8');
        }
    }
    $_SESSION['errors'] = [$errorMessage];
    $_SESSION['old'] = $old;
    // header('Location: contact.php');
    header('Location: index.php#contact');
    exit;
}

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
