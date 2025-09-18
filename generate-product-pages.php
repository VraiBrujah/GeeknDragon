<?php
declare(strict_types=1);

/**
 * Génère les alias historiques produit-*.php pour les anciennes URLs.
 *
 * Ce script lit le catalogue JSON et crée des stubs PHP qui redirigent vers
 * la fiche dynamique (product.php). Il permet de conserver les URL partagées
 * avant la migration sans dupliquer le contenu des fiches.
 */

$catalogPath = __DIR__ . '/data/products.json';
if (!is_file($catalogPath)) {
    fwrite(STDERR, "Catalogue introuvable : {$catalogPath}\n");
    exit(1);
}

$catalogContent = file_get_contents($catalogPath);
if ($catalogContent === false) {
    fwrite(STDERR, "Impossible de lire le fichier {$catalogPath}\n");
    exit(1);
}

$products = json_decode($catalogContent, true);
if (!is_array($products)) {
    fwrite(STDERR, "Catalogue invalide : format JSON inattendu\n");
    exit(1);
}

foreach ($products as $productId => $productData) {
    $slug = (string)($productData['slug'] ?? $productId);
    if ($slug === '') {
        fwrite(STDERR, "Produit sans slug ignoré : {$productId}\n");
        continue;
    }

    $filePath = __DIR__ . "/produit-{$slug}.php";
    $displayName = (string)($productData['name'] ?? $productId);
    $slugLiteral = var_export($slug, true);

    $stubContent = <<<PHP
<?php
declare(strict_types=1);

/**
 * Alias historique généré automatiquement pour {$displayName}.
 *
 * Cette page redirige vers la fiche dynamique afin d'éviter la duplication
 * de contenu et de centraliser l'affichage des produits.
 */
\$legacySlug = {$slugLiteral};
require __DIR__ . '/includes/legacy-product-redirect.php';
PHP;

    file_put_contents($filePath, $stubContent);
    echo "Fichier mis à jour : {$filePath}\n";
}
