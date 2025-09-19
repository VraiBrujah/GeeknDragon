<?php
/**
 * Tableau de Bord Administrateur - Geek&Dragon
 * Interface de gestion avec données réelles Snipcart
 */

session_start();
define('ADMIN_ACCESS', true);
require_once 'config.php';
require_once '../vendor/autoload.php';

use GeeknDragon\Cart\SnipcartClient;

// Vérifier la session admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Vérifier le timeout de session
if (time() - ($_SESSION['admin_last_activity'] ?? time()) > SESSION_TIMEOUT) {
    session_destroy();
    header('Location: login.php?timeout=1');
    exit;
}

$_SESSION['admin_last_activity'] = time();

// Initialiser le client Snipcart unifié
try {
    $snipcart = new SnipcartClient(
        SNIPCART_API_KEY ?? '',
        SNIPCART_SECRET_KEY ?? '',
        (SNIPCART_MODE ?? 'live') === 'mock'
    );

    // Récupérer les données réelles
    $recentOrders = $snipcart->getRecentOrders(10);
    $salesStats = $snipcart->getSalesStats();
    $apiConnected = $snipcart->testConnection();
} catch (\Exception $e) {
    error_log('Erreur initialisation SnipcartClient: ' . $e->getMessage());
    $recentOrders = ['error' => 'Configuration API invalide'];
    $salesStats = ['error' => 'Configuration API invalide'];
    $apiConnected = false;
}

// Gestion des actions POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $csrfToken = $_POST['csrf_token'] ?? '';

    if (!verifyCSRFToken($csrfToken)) {
        $error = 'Token de sécurité invalide';
    } else {
        switch ($action) {
            case 'update_order_status':
                $orderId = sanitizeInput($_POST['order_id'] ?? '');
                $newStatus = sanitizeInput($_POST['new_status'] ?? '');

                if ($orderId && $newStatus) {
                    $result = $snipcart->updateOrderStatus($orderId, $newStatus);
                    if (isset($result['error'])) {
                        $error = 'Erreur lors de la mise à jour: ' . $result['error'];
                    } else {
                        $success = "Statut de la commande {$orderId} mis à jour vers {$newStatus}";
                        logAdminAction('ORDER_STATUS_UPDATE', "Commande {$orderId} -> {$newStatus}");
                    }
                }
                break;

            case 'logout':
                logAdminAction('LOGOUT', $_SESSION['admin_username'] ?? 'inconnu');
                session_destroy();
                header('Location: login.php');
                exit;
        }
    }
}

$translator = require __DIR__ . '/../i18n.php';
$lang = $translator->getCurrentLanguage();

$title = 'Tableau de bord - Administration Geek&Dragon';
$active = 'admin-dashboard';
$navItems = [
    '/admin/dashboard.php' => [
        'href' => '/admin/dashboard.php',
        'use_lang' => false,
        'slug' => 'admin-dashboard',
        'label' => 'Tableau de bord',
        'icon' => '🛡️',
    ],
    '/admin/reviews.php' => [
        'href' => '/admin/reviews.php',
        'use_lang' => false,
        'slug' => 'admin-reviews',
        'label' => 'Avis clients',
        'icon' => '⭐',
    ],
    '/index.php' => [
        'href' => '/index.php',
        'use_lang' => true,
        'slug' => 'retour-site',
        'label' => 'Retour au site',
        'icon' => '🏰',
        'i18n' => '',
    ],
];

$csrfToken = generateCSRFToken();
$adminUsername = $_SESSION['admin_username'] ?? 'Admin';

/**
 * Prépare le HTML des actions d'entête pour le tableau de bord admin.
 */
$buildAdminHeaderActions = static function (string $context) use ($adminUsername, $csrfToken): string {
    $welcomeClass = $context === 'mobile'
        ? 'admin-header-welcome admin-header-welcome--mobile'
        : 'admin-header-welcome';
    $formClass = $context === 'mobile'
        ? 'admin-header-logout-form admin-header-logout-form--mobile'
        : 'admin-header-logout-form';
    $buttonClass = $context === 'mobile'
        ? 'admin-header-logout admin-header-logout--mobile'
        : 'admin-header-logout';

    ob_start();
    ?>
    <span class="<?= htmlspecialchars($welcomeClass, ENT_QUOTES, 'UTF-8'); ?>">
        <span aria-hidden="true">👋</span>
        <span>Bienvenue, <strong><?= htmlspecialchars($adminUsername, ENT_QUOTES, 'UTF-8'); ?></strong></span>
    </span>
    <form method="POST" class="<?= htmlspecialchars($formClass, ENT_QUOTES, 'UTF-8'); ?>">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
        <button type="submit" name="action" value="logout" class="<?= htmlspecialchars($buttonClass, ENT_QUOTES, 'UTF-8'); ?>">
            Déconnexion
        </button>
    </form>
    <?php

    return (string) ob_get_clean();
};

$headerActions = static fn (): string => $buildAdminHeaderActions('desktop');
$headerActionsMobile = static fn (): string => $buildAdminHeaderActions('mobile');
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<?php include __DIR__ . '/../header.php'; ?>
    <div class="admin-dashboard">
        <main id="main" class="admin-main">
            <div class="container">

                <?php if (isset($error)): ?>
                    <div class="admin-alert admin-alert--error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
                <?php endif; ?>

                <?php if (isset($success)): ?>
                    <div class="admin-alert admin-alert--success"><?= htmlspecialchars($success, ENT_QUOTES, 'UTF-8'); ?></div>
                <?php endif; ?>

                <!-- Statistiques Générales -->
                <div class="dashboard-grid">

                    <!-- Statut API Snipcart -->
                    <div class="dashboard-card">
                        <h3>🔌 Statut API Snipcart</h3>
                        <div>
                            <span class="status-indicator <?= $apiConnected ? 'status-connected' : 'status-disconnected'; ?>"></span>
                            <?= $apiConnected ? 'Connecté' : 'Déconnecté'; ?>
                        </div>
                        <?php if (!$apiConnected): ?>
                            <p class="admin-api-warning">
                                Vérifiez la configuration des clés API dans le fichier .env
                            </p>
                        <?php endif; ?>
                    </div>

                    <!-- Ventes du Mois -->
                    <?php if ($apiConnected && !isset($salesStats['error'])): ?>
                        <div class="dashboard-card">
                            <h3>💰 Ventes du Mois</h3>
                            <span class="stat-number"><?= number_format($salesStats['total_revenue'], 2); ?>$ CAD</span>
                            <span class="stat-label"><?= (int) ($salesStats['total_orders'] ?? 0); ?> commandes</span>
                        </div>

                        <div class="dashboard-card">
                            <h3>📊 Panier Moyen</h3>
                            <span class="stat-number"><?= number_format($salesStats['average_order_value'], 2); ?>$ CAD</span>
                            <span class="stat-label">Valeur moyenne par commande</span>
                        </div>

                        <div class="dashboard-card">
                            <h3>🏆 Top Produits</h3>
                            <?php if (!empty($salesStats['top_products'])): ?>
                                <ul class="product-list">
                                    <?php foreach (array_slice($salesStats['top_products'], 0, 3) as $product): ?>
                                        <li>
                                            <span><?= htmlspecialchars($product['name'] ?? 'Produit inconnu', ENT_QUOTES, 'UTF-8'); ?></span>
                                            <span><?= (int) ($product['quantity'] ?? 0); ?> vendus</span>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php else: ?>
                                <div class="no-data">Aucune vente enregistrée</div>
                            <?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="dashboard-card">
                            <h3>⚠️ Données Indisponibles</h3>
                            <p class="admin-muted">
                                <?= isset($salesStats['error'])
                                    ? htmlspecialchars($salesStats['error'], ENT_QUOTES, 'UTF-8')
                                    : 'API Snipcart non configurée'; ?>
                            </p>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Commandes Récentes -->
                <div class="dashboard-card">
                    <h3>📦 Commandes Récentes</h3>

                    <?php if ($apiConnected && !isset($recentOrders['error']) && !empty($recentOrders['items'])): ?>
                        <table class="orders-table">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach (array_slice($recentOrders['items'], 0, 10) as $order): ?>
                                    <?php
                                    $statusValue = strtolower((string) ($order['status'] ?? 'unknown'));
                                    $statusClass = preg_replace('/[^a-z0-9_-]/', '', $statusValue ?? 'unknown');
                                    ?>
                                    <tr>
                                        <td>#<?= htmlspecialchars($order['invoiceNumber'] ?? ($order['token'] ?? 'N/A'), ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td><?= htmlspecialchars($order['email'] ?? 'N/A', ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td><?= number_format((float) ($order['finalGrandTotal'] ?? 0), 2); ?>$ CAD</td>
                                        <td>
                                            <span class="order-status status-<?= htmlspecialchars($statusClass, ENT_QUOTES, 'UTF-8'); ?>">
                                                <?= htmlspecialchars($order['status'] ?? 'Inconnu', ENT_QUOTES, 'UTF-8'); ?>
                                            </span>
                                        </td>
                                        <td><?= htmlspecialchars(date('d/m/Y H:i', strtotime($order['creationDate'] ?? 'now')), ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td>
                                            <form method="POST" class="admin-inline-form">
                                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
                                                <input type="hidden" name="action" value="view_order">
                                                <input type="hidden" name="order_id" value="<?= htmlspecialchars($order['token'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
                                                <button type="submit" class="btn-small">Voir</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php elseif (isset($recentOrders['error'])): ?>
                        <div class="no-data">
                            Erreur: <?= htmlspecialchars($recentOrders['error'], ENT_QUOTES, 'UTF-8'); ?>
                        </div>
                    <?php else: ?>
                        <div class="no-data">
                            <?= $apiConnected
                                ? 'Aucune commande trouvée'
                                : 'API Snipcart non configurée - Configurez vos clés API dans le fichier .env'; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Informations Système -->
                <div class="dashboard-card">
                    <h3>🔧 Informations Système</h3>
                    <ul class="product-list">
                        <li>
                            <span>Session Admin</span>
                            <span>Expire dans <?= ceil((SESSION_TIMEOUT - (time() - ($_SESSION['admin_login_time'] ?? time()))) / 60); ?> min</span>
                        </li>
                        <li>
                            <span>Dernière Activité</span>
                            <span><?= htmlspecialchars(date('d/m/Y H:i:s', $_SESSION['admin_last_activity'] ?? time()), ENT_QUOTES, 'UTF-8'); ?></span>
                        </li>
                        <li>
                            <span>Adresse IP</span>
                            <span><?= htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'N/A', ENT_QUOTES, 'UTF-8'); ?></span>
                        </li>
                        <li>
                            <span>Fichiers Logs</span>
                            <span><?= file_exists(__DIR__ . '/logs/admin_actions.log') ? 'Actifs' : 'Inactifs'; ?></span>
                        </li>
                    </ul>
                </div>

            </div>
        </main>
    </div>

    <script>
        // Auto-refresh des données toutes les 5 minutes
        setTimeout(() => {
            window.location.reload();
        }, 300000);

        // Confirmation avant déconnexion
        document.querySelectorAll('button[value="logout"]').forEach((button) => {
            button.addEventListener('click', (event) => {
                if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    event.preventDefault();
                }
            });
        });

        // Affichage du temps de session restant
        function updateSessionTimer() {
            const sessionStart = <?= (int) ($_SESSION['admin_login_time'] ?? time()); ?>;
            const sessionTimeout = <?= (int) SESSION_TIMEOUT; ?>;
            const now = Math.floor(Date.now() / 1000);
            const remaining = sessionTimeout - (now - sessionStart);

            if (remaining <= 0) {
                alert('Session expirée. Vous allez être redirigé vers la page de connexion.');
                window.location.href = 'login.php?timeout=1';
            }
        }

        setInterval(updateSessionTimer, 60000); // Vérifier chaque minute
    </script>
</body>
</html>
