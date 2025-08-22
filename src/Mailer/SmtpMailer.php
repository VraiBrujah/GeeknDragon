<?php
declare(strict_types=1);

namespace GeeknDragon\Mailer;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class SmtpMailer
{
    public function send(string $to, string $subject, string $htmlBody, string $textBody, string $replyTo = ''): bool
    {
        $host = getSecureEnvVar('SMTP_HOST');
        $port = (int)(getSecureEnvVar('SMTP_PORT', 587));
        $username = getSecureEnvVar('SMTP_USERNAME', 'commande@geekndragon.com');
        $password = getSecureEnvVar('SMTP_PASSWORD');
        $secure = getSecureEnvVar('SMTP_SECURE', $port === 465 ? 'ssl' : 'tls');

        if (!$host || !$username) {
            error_log('SMTP configuration incomplete');
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $host;
            $mail->Port = $port;
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password ?? '';
            $mail->SMTPSecure = $secure;
            $mail->CharSet = 'UTF-8';

            $mail->setFrom($username, 'Geek & Dragon');
            $mail->addAddress($to);
            if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
                $mail->addReplyTo($replyTo);
            }

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $textBody;

            return $mail->send();
        } catch (Exception $e) {
            error_log('SMTP send error: ' . $e->getMessage());
            return false;
        }
    }
}
