<?php
declare(strict_types=1);

/**
 * Point d'entrée unique pour GeeknDragon
 * Front Controller qui route toutes les requêtes
 */

// Bootstrap et autoloading
require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Core\Router;

// Configuration globale
$config = require __DIR__ . '/../config.php';

// Initialisation du routeur
$router = new Router();

// ===============================
// ROUTES PRINCIPALES (PRÉSERVATION DES URLs EXISTANTES)
// ===============================

// Page d'accueil
$router->get('/', function() {
    require __DIR__ . '/../index.php';
});

// Boutique
$router->get('/boutique.php', function() {
    require __DIR__ . '/../boutique.php';
});

$router->get('/boutique', function() {
    require __DIR__ . '/../boutique.php';
});

// Contact
$router->get('/contact.php', function() {
    require __DIR__ . '/../contact.php';
});

$router->get('/contact', function() {
    require __DIR__ . '/../contact.php';
});

// Traitement formulaire contact
$router->post('/contact.php', function() {
    require __DIR__ . '/../contact-handler.php';
});

$router->post('/contact', function() {
    require __DIR__ . '/../contact-handler.php';
});

// Checkout
$router->get('/checkout.php', function() {
    require __DIR__ . '/../checkout.php';
});

$router->get('/checkout', function() {
    require __DIR__ . '/../checkout.php';
});

// Page de remerciement
$router->get('/merci.php', function() {
    require __DIR__ . '/../merci.php';
});

$router->get('/merci', function() {
    require __DIR__ . '/../merci.php';
});

// Shipping
$router->get('/shipping.php', function() {
    require __DIR__ . '/../shipping.php';
});

$router->get('/shipping', function() {
    require __DIR__ . '/../shipping.php';
});

// ===============================
// PRODUITS SPÉCIFIQUES
// ===============================

$router->get('/lot10.php', function() {
    require __DIR__ . '/../lot10.php';
});

$router->get('/lot25.php', function() {
    require __DIR__ . '/../lot25.php';
});

$router->get('/lot50-essence.php', function() {
    require __DIR__ . '/../lot50-essence.php';
});

$router->get('/lot50-tresorerie.php', function() {
    require __DIR__ . '/../lot50-tresorerie.php';
});

// Page produit générique
$router->get('/product.php', function() {
    require __DIR__ . '/../product.php';
});

// ===============================
// ACTUALITÉS
// ===============================

$router->get('/actualites/es-tu-game.php', function() {
    require __DIR__ . '/../actualites/es-tu-game.php';
});

// ===============================
// API PANIER CUSTOM
// ===============================

$router->get('/api/cart', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->getCart();
});

$router->post('/api/cart/add', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->addItem();
});

$router->post('/api/cart/update', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->updateItem();
});

$router->post('/api/cart/remove', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->removeItem();
});

$router->post('/api/cart/clear', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->clearCart();
});

$router->get('/api/cart/render', function() use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->renderCart();
});

// Produit individuel
$router->get('/api/products/{id}', function() use ($config) {
    $id = basename(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
    $controller = new GeeknDragon\Controller\ProductController($config);
    $controller->getProduct($id);
});

// ===============================
// ASSETS STATIQUES (BYPASS)
// ===============================

// Si c'est un asset statique, le servir directement
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'mp4', 'webm', 'pdf'];
$extension = pathinfo($uri, PATHINFO_EXTENSION);

if (in_array(strtolower($extension), $staticExtensions)) {
    // Laisser le serveur web gérer les assets statiques
    return false;
}

// ===============================
// REDIRECTIONS 301 POUR COMPATIBILITÉ
// ===============================

// Si des URLs changent, ajouter des redirections ici
// $router->redirect('/old-url', '/new-url');

// ===============================
// RÉSOLUTION ET EXÉCUTION
// ===============================

$router->resolve();