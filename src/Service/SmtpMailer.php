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
        $this->mailer->isSMTP();
        $this->mailer->Host = $host;
        $this->mailer->Port = $port;
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $username;
        $this->mailer->Password = $password;
        $this->mailer->SMTPSecure = $secure;
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
}
