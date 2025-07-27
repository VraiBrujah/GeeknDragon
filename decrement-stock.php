<?php
/**
 * decrement-stock.php  –  Geek & Dragon
 * -------------------------------------------------------------
 * Webhook Snipcart « Order completed »
 * Décrémente automatiquement le stock (stock.json) à chaque vente.
 *
 * 1. Vérifie la signature HMAC SHA-256 (header X-Snipcart-Signature)
 * 2. Lit le fichier stock.json   (clé = product ID, valeur = quantité)
 * 3. Soustrait la quantité vendue
 * 4. Enregistre le nouveau stock sur disque
 * -------------------------------------------------------------
 * Stock JSON exemple :
 * {
 *   "coin-single":  200,
 *   "coffre-noble": 12,
 *   "coffre-mage" : 4
 * }
 */

define('STOCK_FILE', __DIR__ . '/stock.json');
define('WEBHOOK_SECRET', 'YOUR_ORDER_SECRET');   // <— À REMPLACER !

// ────────────────────────────
function respond($code, $msg = '')
{
    http_response_code($code);
    if ($msg) echo $msg;
    exit;
}

// 1. Vérifie signature
$signature = $_SERVER['HTTP_X_SNIPCART_SIGNATURE'] ?? '';
$raw       = file_get_contents('php://input');

if (!hash_equals(hash_hmac('sha256', $raw, WEBHOOK_SECRET), $signature)) {
    respond(401, 'Invalid signature');
}

// 2. Décode la commande
$order = json_decode($raw, true);
if (!$order || !isset($order['items'])) {
    respond(400, 'Bad payload');
}

// 3. Charge le stock actuel (ou tableau vide)
$stock = file_exists(STOCK_FILE)
    ? json_decode(file_get_contents(STOCK_FILE), true)
    : [];

if (!is_array($stock)) $stock = [];

// 4. Décrémente
foreach ($order['items'] as $item) {
    $id = $item['uniqueId'];      // correspond au data-item-id
    $qty = (int)$item['quantity'];

    if (!isset($stock[$id])) {
        // Si l'ID n'existe pas encore, on l'initialise (illimité → ignore)
        continue;
    }

    $stock[$id] = max(0, $stock[$id] - $qty);
}

// 5. Écrit le nouveau stock – verrouillage simple
$fp = fopen(STOCK_FILE, 'c+');
if (!$fp) respond(500, 'Cannot open stock file');

flock($fp, LOCK_EX);
ftruncate($fp, 0);
fwrite($fp, json_encode($stock, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
flock($fp, LOCK_UN);
fclose($fp);

// 6. Réponse OK
respond(200, 'Stock updated');
?>
