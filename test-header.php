<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Header Navigation</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <?php
    $active = '';
    include 'header.php';
    ?>

    <main style="padding-top: 200px;">
        <div style="height: 2000px; padding: 40px;">
            <h1>Test du Header avec Navigation</h1>
            <p>Scrollez vers le bas pour voir la navigation disparaître.</p>
            <p>Scrollez vers le haut pour la voir réapparaître.</p>

            <div style="margin-top: 500px;">
                <h2>Section du milieu</h2>
                <p>Continuez à scroller...</p>
            </div>

            <div style="margin-top: 500px;">
                <h2>Fin de page</h2>
                <p>Remontez pour tester l'animation</p>
            </div>
        </div>
    </main>

    <script src="/js/header-scroll-animation.js"></script>
    <script src="/js/app.bundle.min.js"></script>
</body>
</html>
