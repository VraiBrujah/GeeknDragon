<?php
declare(strict_types=1);

/**
 * Alias historique de la page produit Butins d'Ingénieries.
 *
 * Cette page redirige vers la fiche dynamique afin d'éviter la duplication
 * de contenu et de centraliser l'affichage des produits.
 */
$legacySlug = preg_replace('/^produit-/', '', basename(__FILE__, '.php'));
require __DIR__ . '/includes/legacy-product-redirect.php';
