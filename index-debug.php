<?php
echo "<!-- Starting debug index -->\n";

try {
    require __DIR__ . '/bootstrap-debug.php';
    echo "<!-- Bootstrap loaded successfully -->\n";
} catch (Exception $e) {
    die('ERREUR BOOTSTRAP: ' . $e->getMessage());
}

try {
    $config = require __DIR__ . '/config.php';
    echo "<!-- Config loaded successfully -->\n";
} catch (Exception $e) {
    die('ERREUR CONFIG: ' . $e->getMessage());
}

echo "<!-- Starting i18n -->\n";
try {
    require __DIR__ . '/i18n.php';
    echo "<!-- i18n loaded successfully -->\n";
} catch (Exception $e) {
    die('ERREUR I18N: ' . $e->getMessage());
}

$title  = $translations['meta']['home']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['home']['desc'] ?? '';

echo "<!-- All loaded successfully -->\n";
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($title) ?></title>
</head>
<body>
    <h1>✅ Site fonctionnel!</h1>
    <p>Bootstrap et configuration chargés avec succès.</p>
    <p>Titre: <?= htmlspecialchars($title) ?></p>
    <p>Description: <?= htmlspecialchars($metaDescription) ?></p>
    <hr>
    <h2>Variables d'environnement détectées:</h2>
    <ul>
        <li>SNIPCART_API_KEY: <?= !empty($_ENV['SNIPCART_API_KEY']) ? 'Défini ✅' : 'Non défini ❌' ?></li>
        <li>SNIPCART_SECRET_API_KEY: <?= !empty($_ENV['SNIPCART_SECRET_API_KEY']) ? 'Défini ✅' : 'Non défini ❌' ?></li>
        <li>SENDGRID_API_KEY: <?= !empty($_ENV['SENDGRID_API_KEY']) ? 'Défini ✅' : 'Non défini ❌' ?></li>
    </ul>
</body>
</html>