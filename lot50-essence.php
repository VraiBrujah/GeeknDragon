<?php
declare(strict_types=1);
// Validation et nettoyage du paramètre 'from'
$from = '';
if (isset($_GET['from']) && is_string($_GET['from'])) {
    $fromParam = trim($_GET['from']);
    if (preg_match('/^[a-zA-Z0-9_-]+$/', $fromParam) && strlen($fromParam) <= 50) {
        $from = '&from=' . urlencode($fromParam);
    }
}

header('Location: product.php?id=lot50-essence' . $from, true, 301);
exit;
?>
