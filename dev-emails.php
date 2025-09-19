<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

// Seulement en mode développement
if (getSecureEnvVar('APP_ENV', 'production') !== 'development') {
    http_response_code(404);
    exit('Not found');
}

$emailsDir = __DIR__ . '/storage/emails';
$emails = [];

if (is_dir($emailsDir)) {
    $files = glob($emailsDir . '/email_*.json');
    rsort($files); // Plus récents en premier
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if ($content) {
            $emails[] = json_decode($content, true);
        }
    }
}

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emails de développement - GeeknDragon</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .email { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .email-header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
        .email-meta { display: grid; grid-template-columns: 100px 1fr; gap: 5px; font-size: 14px; }
        .email-body { margin-top: 15px; }
        .email-html { border: 1px solid #ddd; padding: 15px; border-radius: 4px; background: #fafafa; }
        .btn { padding: 10px 20px; background: #007cba; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        .btn:hover { background: #005a87; }
        h1 { color: #333; text-align: center; }
        .count { text-align: center; color: #666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Emails de développement</h1>
        <div class="count"><?= count($emails); ?> email(s) envoyé(s)</div>
        
        <a href="/devis.php" class="btn">← Retour au formulaire de devis</a>
        
        <?php if (empty($emails)): ?>
            <div class="email">
                <p>Aucun email envoyé pour le moment. Testez le formulaire de devis !</p>
            </div>
        <?php endif; ?>
        
        <?php foreach ($emails as $email): ?>
            <div class="email">
                <div class="email-header">
                    <h3>📬 <?= htmlspecialchars($email['subject'] ?? '', ENT_QUOTES, 'UTF-8'); ?></h3>
                    <div class="email-meta">
                        <strong>Date:</strong>
                        <span><?= htmlspecialchars($email['timestamp'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span>
                        
                        <strong>De:</strong>
                        <span><?= htmlspecialchars($email['from'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span>
                        
                        <strong>À:</strong>
                        <span><?= htmlspecialchars($email['to'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span>
                        
                        <?php if (!empty($email['replyTo'])): ?>
                        <strong>Répondre à:</strong>
                        <span><?= htmlspecialchars($email['replyTo'], ENT_QUOTES, 'UTF-8'); ?></span>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="email-body">
                    <h4>Contenu HTML:</h4>
                    <div class="email-html">
                        <?= $email['htmlBody'] ?? ''; ?>
                    </div>
                    
                    <h4>Contenu texte:</h4>
                    <pre style="background: #f9f9f9; padding: 10px; border-radius: 4px; overflow-x: auto;"><?= htmlspecialchars($email['textBody'] ?? '', ENT_QUOTES, 'UTF-8'); ?></pre>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</body>
</html>