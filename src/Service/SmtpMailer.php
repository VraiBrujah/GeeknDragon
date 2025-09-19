<?php
declare(strict_types=1);

namespace GeeknDragon\Service;

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Simple SMTP mailer using PHPMailer.
 */
class SmtpMailer
{
    private PHPMailer $mailer;

    public function __construct()
    {
        $host = getSecureEnvVar('SMTP_HOST', '');
        $port = (int) getSecureEnvVar('SMTP_PORT', 587);
        $username = getSecureEnvVar('SMTP_USERNAME', 'commande@geekndragon.com');
        $password = getSecureEnvVar('SMTP_PASSWORD', '');
        $secure = getSecureEnvVar('SMTP_SECURE', $port === 465 ? 'ssl' : 'tls');

        $this->mailer = new PHPMailer(true);
        
        // Si l'host SMTP est configuré, utiliser SMTP
        if (!empty($host)) {
            $this->mailer->isSMTP();
            $this->mailer->Host = $host;
            $this->mailer->Port = $port;
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $username;
            $this->mailer->Password = $password;
            $this->mailer->SMTPSecure = $secure;
            $this->mailer->Hostname = 'geekndragon.com'; // Définir le nom d'hôte HELO
            
            // Désactiver la vérification SSL pour contourner les problèmes OpenSSL
            $this->mailer->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Désactiver l'authentification SSL si extension manquante
            if (!extension_loaded('openssl')) {
                $this->mailer->SMTPSecure = false;
                $this->mailer->SMTPAuth = false;
            }
        } else {
            // Fallback: utiliser la fonction mail() de PHP
            $this->mailer->isMail();
        }
        
        $this->mailer->CharSet = 'UTF-8';
    }

    /**
     * Send an email.
     *
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $htmlBody HTML body
     * @param string $textBody Plain-text body
     * @param string $replyTo Reply-To address
     */
    public function send(string $to, string $subject, string $htmlBody, string $textBody, string $replyTo = ''): bool
    {
        $from = getSecureEnvVar('SMTP_USERNAME', 'commande@geekndragon.com');
        
        // En mode développement, sauvegarder l'email dans un fichier pour simulation
        if (getSecureEnvVar('APP_ENV', 'production') === 'development') {
            return $this->saveEmailToFile($to, $subject, $htmlBody, $textBody, $replyTo, $from);
        }
        
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->setFrom($from);
            $this->mailer->addAddress($to);
            if ($replyTo !== '') {
                $this->mailer->addReplyTo($replyTo);
            }
            $this->mailer->Subject = $subject;
            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $textBody;
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log('SMTP send error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Sauvegarde l'email dans un fichier pour simulation en mode développement
     */
    private function saveEmailToFile(string $to, string $subject, string $htmlBody, string $textBody, string $replyTo, string $from): bool
    {
        $storageDir = __DIR__ . '/../../storage/emails';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }
        
        $emailContent = [
            'timestamp' => date('Y-m-d H:i:s'),
            'from' => $from,
            'to' => $to,
            'replyTo' => $replyTo,
            'subject' => $subject,
            'htmlBody' => $htmlBody,
            'textBody' => $textBody
        ];
        
        $filename = $storageDir . '/email_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.json';
        $result = file_put_contents($filename, json_encode($emailContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        // Log pour information
        error_log("Email simulé sauvegardé: $filename");
        
        return $result !== false;
    }
}
