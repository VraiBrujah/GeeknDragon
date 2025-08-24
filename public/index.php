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

// Middleware pour normaliser les URLs se terminant par .php
$router->middleware(function (string $uri) use ($router) {
    if (str_ends_with($uri, '.php')) {
        $canonical = substr($uri, 0, -4) ?: '/';
        $router->redirect($uri, $canonical);
    }
    return $uri;
});

// ===============================
// ROUTES PRINCIPALES
// ===============================

// Page d'accueil
$router->get('/', function () {
    require __DIR__ . '/../index.php';
});

// Boutique
$router->get('/boutique', function () {
    require __DIR__ . '/../boutique.php';
});

// Contact
$router->get('/contact', function () {
    require __DIR__ . '/../contact.php';
});

// Traitement formulaire contact
$router->post('/contact', function () {
    require __DIR__ . '/../contact-handler.php';
});

// Devis
$router->get('/devis', function () {
    require __DIR__ . '/../devis.php';
});

$router->post('/devis', function () {
    require __DIR__ . '/../devis-handler.php';
});

// Checkout
$router->get('/checkout', function () {
    require __DIR__ . '/../checkout.php';
});

// Page de remerciement
$router->get('/merci', function () {
    require __DIR__ . '/../merci.php';
});

// Webhook Snipcart
$router->post('/snipcart/webhook', function () use ($config) {
    $controller = new GeeknDragon\Controller\SnipcartWebhookController($config);
    $controller->handle();
});

// ===============================
// PRODUITS SPÉCIFIQUES
// ===============================

$router->get('/lot10', function () {
    require __DIR__ . '/../lot10.php';
});

$router->get('/lot25', function () {
    require __DIR__ . '/../lot25.php';
});

$router->get('/lot50-essence', function () {
    require __DIR__ . '/../lot50-essence.php';
});

$router->get('/lot50-tresorerie', function () {
    require __DIR__ . '/../lot50-tresorerie.php';
});

// Page produit générique
$router->get('/product', function () {
    require __DIR__ . '/../product.php';
});

// ===============================
// ACTUALITÉS
// ===============================

$router->get('/actualites/es-tu-game.html', function () {
    require __DIR__ . '/../actualites/es-tu-game.html';
});

// ===============================
// API PANIER CUSTOM
// ===============================

$router->get('/api/cart', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->getCart();
});

$router->post('/api/cart/add', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->addItem();
});

$router->post('/api/cart/update', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->updateItem();
});

$router->post('/api/cart/remove', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->removeItem();
});

$router->post('/api/cart/clear', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->clearCart();
});

$router->get('/api/cart/render', function () use ($config) {
    $controller = new GeeknDragon\Controller\CartController($config);
    $controller->renderCart();
});

// Produit individuel
$router->get('/api/products/{id}', function ($id) use ($config) {
    $controller = new GeeknDragon\Controller\ProductController($config);
    $controller->getProduct($id);
});

// Endpoints compte client
$router->post('/api/account/login', function () use ($config) {
    $controller = new GeeknDragon\Controller\AccountController($config);
    $controller->login();
});

$router->get('/api/account/profile', function () use ($config) {
    $controller = new GeeknDragon\Controller\AccountController($config);
    $controller->profile();
});

$router->get('/api/account/orders', function () use ($config) {
    $controller = new GeeknDragon\Controller\AccountController($config);
    $controller->orders();
});

$router->get('/api/account/status', function () use ($config) {
    $controller = new GeeknDragon\Controller\AccountController($config);
    $controller->status();
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

$router->redirect('/index.php', '/');
$router->redirect('/boutique.php', '/boutique');
$router->redirect('/contact.php', '/contact');
$router->redirect('/devis.php', '/devis');
$router->redirect('/checkout.php', '/checkout');
$router->redirect('/merci.php', '/merci');
$router->redirect('/lot10.php', '/lot10');
$router->redirect('/lot25.php', '/lot25');
$router->redirect('/lot50-essence.php', '/lot50-essence');
$router->redirect('/lot50-tresorerie.php', '/lot50-tresorerie');
$router->redirect('/product.php', '/product');
$router->redirect('/actualites/es-tu-game.php', '/actualites/es-tu-game.html');
$router->redirect('/actualites/es-tu-game', '/actualites/es-tu-game.html');

// ===============================
// RÉSOLUTION ET EXÉCUTION
// ===============================

$router->resolve();
