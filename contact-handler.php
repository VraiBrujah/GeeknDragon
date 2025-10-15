<?php
/**
 * Gestionnaire de formulaire de contact avec validation renforcée - Standards v2.1.0
 * 
 * Traite les soumissions du formulaire de contact avec validation stricte
 * des entrées utilisateur et protection CSRF intégrée.
 * 
 * AMÉLIORATIONS v2.1.0 :
 * ======================
 * - Validation d'entrée PHP renforcée avec filter_input()
 * - Types stricts PHP 8.0+ pour toutes les fonctions
 * - Échappement HTML systématique pour prévention XSS
 * - Gestion d'erreurs robuste avec logging structuré
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Standards Français Renforcés
 * @since 1.0.0
 * @category Contact
 * @package GeeknDragon\Handlers
 */

require __DIR__ . '/bootstrap.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.php');
    exit;
}

$errors = [];

// Validation d'entrée renforcée avec filter_input pour sécurité maximale
$nom = filter_input(INPUT_POST, 'Nom', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'Email', FILTER_VALIDATE_EMAIL);
$telephone = filter_input(INPUT_POST, 'Téléphone', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$message = filter_input(INPUT_POST, 'Message', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$csrf = filter_input(INPUT_POST, 'csrf_token', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

// Validation supplémentaire pour champs requis
if (!$nom || trim($nom) === '') {
    $errors[] = 'Le nom est requis et ne peut être vide.';
}
if (!$email) {
    $errors[] = 'Une adresse e-mail valide est requise.';
}
if (!$message || trim($message) === '') {
    $errors[] = 'Le message est requis et ne peut être vide.';
}
if (!$csrf || trim($csrf) === '') {
    $errors[] = 'Token CSRF manquant.';
}

// Vérification CSRF avec protection contre timing attacks
if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf ?? '')) {
    $errors[] = 'Token CSRF invalide. Veuillez recharger la page.';
}

// Validation supplémentaire des longueurs pour sécurité
if ($nom && strlen($nom) > 100) {
    $errors[] = 'Le nom ne peut dépasser 100 caractères.';
}
if ($telephone && strlen($telephone) > 20) {
    $errors[] = 'Le téléphone ne peut dépasser 20 caractères.';
}
if ($message && strlen($message) > 2000) {
    $errors[] = 'Le message ne peut dépasser 2000 caractères.';
}

// Vérification anti-injection pour caractères de contrôle
if ($email && preg_match("/[\r\n\0]/", $email)) {
    $errors[] = 'L\'adresse e-mail contient des caractères invalides.';
}

// Préparation des données pour réaffichage (échappement HTML préventif)
$old = [
    'Nom' => $nom ? htmlspecialchars($nom, ENT_QUOTES, 'UTF-8') : '',
    'Email' => $email ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : '',
    'Téléphone' => $telephone ? htmlspecialchars($telephone, ENT_QUOTES, 'UTF-8') : '',
    'Message' => $message ? htmlspecialchars($message, ENT_QUOTES, 'UTF-8') : '',
];

if ($errors) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

/**
 * Envoie un e-mail sécurisé via l'API SendGrid avec validation stricte
 * 
 * Fonction d'envoi d'e-mail avec validation complète des paramètres
 * et gestion d'erreurs robuste pour environnement de production.
 * 
 * @param string $to Adresse e-mail destinataire (validée)
 * @param string $subject Sujet de l'e-mail (échappé)
 * @param string $body Corps du message (échappé)
 * @param string $replyTo Adresse de réponse optionnelle (validée)
 * @return bool true si envoi réussi, false sinon
 * @throws InvalidArgumentException Si paramètres invalides
 * 
 * @example
 * $success = sendSendgridMail(
 *     'client@example.com',
 *     'Nouveau devis D&D',
 *     'Demande pour pièces personnalisées...',
 *     'contact@geekndragon.com'
 * );
 */
function sendSendgridMail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    // Validation stricte des paramètres d'entrée
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        error_log("Adresse destinataire invalide: {$to}", 3, __DIR__ . '/logs/contact_errors.log');
        return false;
    }
    
    if ($replyTo && !filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        error_log("Adresse reply-to invalide: {$replyTo}", 3, __DIR__ . '/logs/contact_errors.log');
        return false;
    }
    
    if (strlen($subject) > 200 || strlen($body) > 10000) {
        error_log('Sujet ou corps de message trop long', 3, __DIR__ . '/logs/contact_errors.log');
        return false;
    }
    
    $apiKey = $_ENV['SENDGRID_API_KEY'] ?? $_SERVER['SENDGRID_API_KEY'] ?? null;
    $from = $_ENV['SMTP_USERNAME'] ?? $_SERVER['SMTP_USERNAME'] ?? null;
    
    if (!$apiKey) {
        error_log('Variable d\'environnement manquante: SENDGRID_API_KEY', 3, __DIR__ . '/logs/contact_errors.log');
        return false;
    }
    
    if (!$from || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
        error_log('Variable d\'environnement SMTP_USERNAME invalide ou manquante', 3, __DIR__ . '/logs/contact_errors.log');
        $from = 'contact@geekndragon.com';
    }

    // Construction du payload JSON brut (SendGrid gère l'encodage UTF-8)
    $payload = [
        'personalizations' => [[
            'to' => [['email' => $to]],
            'subject' => $subject,
        ]],
        'from' => ['email' => $from],
        'content' => [[
            'type' => 'text/plain',
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
// Configuration sécurisée de l'envoi d'e-mail
$to = $_ENV['QUOTE_EMAIL'] ?? $_SERVER['QUOTE_EMAIL'] ?? null;
if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    error_log('Variable d\'environnement QUOTE_EMAIL invalide ou manquante', 3, __DIR__ . '/logs/contact_errors.log');
    $to = 'contact@geekndragon.com';
}

$subject = 'Nouveau message depuis le formulaire de contact Geek & Dragon';

// Construction sécurisée du corps de message avec validation
$body = sprintf(
    "Nouveau message reçu depuis le formulaire de contact :\n\n" .
    "Nom : %s\n" .
    "Email : %s\n" .
    "Téléphone : %s\n\n" .
    "Message :\n%s\n\n" .
    "---\n" .
    "Envoyé le : %s\n" .
    "IP : %s",
    $nom ?: '[Non renseigné]',
    $email ?: '[Non renseigné]',
    $telephone ?: '[Non renseigné]',
    $message ?: '[Message vide]',
    date('Y-m-d H:i:s'),
    $_SERVER['REMOTE_ADDR'] ?? 'Inconnue'
);

// Tentative d'envoi avec gestion d'erreur détaillée
if (!sendSendgridMail($to, $subject, $body, $email ?: '')) {
    $errorMsg = sprintf(
        'Échec envoi e-mail - Destinataire: %s, Expéditeur: %s, Timestamp: %s',
        $to,
        $email ?: 'Non fourni',
        date('Y-m-d H:i:s')
    );
    error_log($errorMsg, 3, __DIR__ . '/logs/contact_errors.log');
    
    $_SESSION['errors'] = [
        "Une erreur technique est survenue lors de l'envoi de votre message. " .
        "Veuillez réessayer ou nous contacter directement."
    ];
    $_SESSION['old'] = $old;
    header('Location: contact.php');
    exit;
}

// Log succès pour monitoring
error_log(
    sprintf('Message envoyé avec succès - Email: %s, Timestamp: %s', $email ?: 'Non fourni', date('Y-m-d H:i:s')),
    3,
    __DIR__ . '/logs/contact_success.log'
);

unset($_SESSION['csrf_token']);
header('Location: merci.php');
exit;
